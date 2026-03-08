/*:
 * @plugindesc (Refine) Custom Plugin Commands Router (safer + idempotent) for your command set.
 * @author Faiz Syihab
 *
 * @help
 * ------------------------------------------------------------------------------
 * This plugin refactors the original manual command bundle into a safer router:
 * - No cross-command subcommand collisions
 * - Prototype patches are applied once (idempotent)
 * - Guards added when dependent plugins aren't present
 *
 * Supported Plugin Commands:
 *   SpeedUpBattle normal
 *   SpeedUpBattle disable
 *   SpeedUpBattle escape
 *   SpeedUpBattle escape1
 *
 *   StateFX on
 *   StateFX off
 *
 *   BossName GoldScorpion
 *   BossName SnakeGazer
 *   BossName Ann
 *   BossName Strey
 *   BossName PlantMonster
 *
 *   sHUDswitch MQWLeft
 *
 *   SkillLvGauge showActorVHG
 *   SkillLvGauge hideActorVHG
 *
 * Recommended order:
 *   (YEP plugins) / (MOG plugins) / SSEP_BattleSpeedUp_v2.js / this plugin
 * ------------------------------------------------------------------------------
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_FzZ_CommandsRefined";

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------
  const warn = (msg) => console.warn(`[${PLUGIN_NAME}] ${msg}`);

  const hasYanflyParam = () => !!(window.Yanfly && Yanfly.Param);
  const hasSepherParam = () => !!(window.Sepher && Sepher.Param);
  const hasMoghunter = () => !!window.Moghunter;

  // ---------------------------------------------------------------------------
  // Idempotent patches (apply once, not on every command call)
  // ---------------------------------------------------------------------------
  const Patch = {
    _buffRatePatched: false,
    _origDrawBuffRate: null,

    applyBuffRateOnce() {
      if (this._buffRatePatched) return;
      if (!window.Sprite_StateIcon) return warn("Sprite_StateIcon is missing. Buff-rate patch skipped.");
      if (!hasYanflyParam()) return warn("Yanfly.Param is missing. Buff-rate patch skipped.");

      this._origDrawBuffRate = Sprite_StateIcon.prototype.drawBuffRate;

      Sprite_StateIcon.prototype.drawBuffRate = function (paramId) {
        if (!Yanfly.Param.BSCShowTurns) return;
        const value = this._battler.paramBuffRate(paramId) - 1;
        let text = Math.floor(value * 100) + "%";

        const wx = Yanfly.Param.BSCCounterBufferX || 0;
        const wy = (Yanfly.Param.BSCCounterBufferY || 8) - 2;
        const ww = Window_Base._iconWidth;
        const wh = Window_Base.prototype.lineHeight.call(this);

        const contents = this._turnCounterSprite.bitmap;
        contents.fontSize = Yanfly.Param.BSCFontSize * 0.78;
        contents.textColor = this.textColor(31);

        if (value > 0) text = "+" + Math.floor(value * 100) + "%";
        contents.drawText(text, wx, wy, ww, wh, "center");
      };

      this._buffRatePatched = true;
    },

    _escapeATBPatched: false,
    _origCanEscapeATB: null,

    applyEscapeATBOnce() {
      if (this._escapeATBPatched) return;
      if (!window.BattleManager) return warn("BattleManager missing. canEscape_ATB patch skipped.");

      // Keep original if exists to avoid breaking other plugins.
      this._origCanEscapeATB = BattleManager.canEscape_ATB;

      BattleManager.canEscape_ATB = function (active) {
        // Custom rule: allow escape when Cancel is held AND var 64 === 0.
        if (Input.isPressed("cancel") && $gameVariables.value(64) === 0) return true;

        // Fall back to original behavior where possible.
        if (typeof Patch._origCanEscapeATB === "function") {
          const res = Patch._origCanEscapeATB.call(this, active);
          if (typeof res === "boolean") return res;
        }

        // Minimal safe default.
        if (!active) return false;
        if (!this._canEscape) return false;
        if (!Input.isPressed("cancel")) return false;
        return true;
      };

      this._escapeATBPatched = true;
    },

    _atbModePatched: false,
    applyCanUpdateAtbModeOnce() {
      if (this._atbModePatched) return;
      if (!window.Scene_Battle) return warn("Scene_Battle missing. canUpdateAtbMode patch skipped.");
      Scene_Battle.prototype.canUpdateAtbMode = function () {
        return true;
      };
      this._atbModePatched = true;
    },
  };

  // ---------------------------------------------------------------------------
  // Command Handlers
  // ---------------------------------------------------------------------------
  const Commands = Object.create(null);

  Commands.SpeedUpBattle = function (sub) {
    if (!sub) return warn("SpeedUpBattle: missing subcommand.");

    switch (sub) {
      case "normal": {
        Patch.applyBuffRateOnce();
        Patch.applyEscapeATBOnce();
        Patch.applyCanUpdateAtbModeOnce();

        if (hasSepherParam()) {
          Sepher.Param.BoostToggleSwitch = "tab";
        } else {
          warn("Sepher.Param missing. BoostToggleSwitch not set.");
        }
        break;
      }

      case "disable": {
        if (hasSepherParam()) {
          Sepher.Param.BoostToggleSwitch = "";
        } else {
          warn("Sepher.Param missing. disable skipped.");
        }
        break;
      }

      case "escape": {
        if (hasMoghunter()) {
          Moghunter.atb_EscapeButton = "";
        } else {
          warn("Moghunter missing. escape skipped.");
        }
        break;
      }

      case "escape1": {
        if (hasMoghunter() && Moghunter.parameters) {
          Moghunter.atb_EscapeButton = String(Moghunter.parameters["Escape Button"]);
        } else {
          warn("Moghunter.parameters missing. escape1 skipped.");
        }
        break;
      }

      default:
        warn(`SpeedUpBattle: unknown subcommand '${sub}'.`);
        break;
    }
  };

  Commands.StateFX = function (sub) {
    if (!sub) return warn("StateFX: missing subcommand.");
    if (!hasYanflyParam()) return warn("Yanfly.Param missing. StateFX skipped.");

    switch (sub) {
      case "on":
        Yanfly.Param.VSFXActorAni = true;
        Yanfly.Param.VSFXEnemyAni = true;
        break;
      case "off":
        Yanfly.Param.VSFXActorAni = false;
        Yanfly.Param.VSFXEnemyAni = false;
        break;
      default:
        warn(`StateFX: unknown subcommand '${sub}'.`);
        break;
    }
  };

  Commands.sHUDswitch = function (sub) {
    if (!sub) return warn("sHUDswitch: missing subcommand.");
    switch (sub) {
      case "MQWLeft":
        $gameSwitches.setValue(105, true);
        break;
      default:
        warn(`sHUDswitch: unknown subcommand '${sub}'.`);
        break;
    }
  };

  Commands.SkillLvGauge = function (sub) {
    if (!sub) return warn("SkillLvGauge: missing subcommand.");
    if (!hasYanflyParam()) return warn("Yanfly.Param missing. SkillLvGauge skipped.");

    switch (sub) {
      case "showActorVHG":
        Yanfly.Param.VHGDisplayActor = true;
        break;
      case "hideActorVHG":
        Yanfly.Param.VHGDisplayActor = false;
        break;
      default:
        warn(`SkillLvGauge: unknown subcommand '${sub}'.`);
        break;
    }
  };

  Commands.BossName = function (sub) {
    if (!sub) return warn("BossName: missing subcommand.");
    if (!hasMoghunter()) return warn("Moghunter missing. BossName skipped.");

    const map = {
      GoldScorpion: 298,
      SnakeGazer: 329,
      Ann: 362,
      Strey: 382,
      PlantMonster: 316,
    };

    const x = map[sub];
    if (x == null) return warn(`BossName: unknown key '${sub}'.`);
    Moghunter.bosshp_name_x = x;
  };

  // ---------------------------------------------------------------------------
  // Plugin Command Router
  // ---------------------------------------------------------------------------
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    const handler = Commands[command];
    if (!handler) return;

    const sub = (args && args.length > 0) ? String(args[0]) : "";
    handler.call(this, sub, args);
  };
})();
