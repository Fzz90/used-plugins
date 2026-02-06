/*:
 * @plugindesc Custom Plugin Commands
 *
 * @author FzZ
 *
 * @help
 *
 * All List Plugin_Command & Notetags Collections by Faiz
 */

//==================================NOTETAGS=============================================//

// Game_Actor.prototype.initBattleStatistics = function () {
//   this._battleCount = 0;
//   this._killCount = 0;
//   this._deathCount = 0;
//   this._assistCount = 0;
//   this._totalDamageDealt = 0;
//   this._totalDamageTaken = 0;
//   this._totalHealingDealt = 0;
//   this._totalHealingTaken = 0;
// };

// Game_Actor.prototype.killCount = function () {
//   if (this._killCount === undefined) this.initBattleStatistics();
//   return this._killCount;
// };

// function ParseNotetag(notetag) {
//   return JSON.parse(notetag);
// }

// function ExecuteNotetagEffects(notetag) {
//   for (var i in notetag) ExecuteNotetagEffect(notetag[i]);
// }

// function ExecuteNotetagEffect(key) {
//   switch (key) {
//     case EnVar:
//       value = value || 1;
//       if (this._killCount === undefined) {
//         this.initBattleStatistics();
//         this._killCount += value;
//         var enemyVars = $gameVariables.value(26);
//         enemyVars + 1;
//       }
//       break;

// case value:
//   //* CODE
// break;
//     default:
//       throw new Error("Effect " + key + " is not defined...");
//   }
// }

//=============================================================================
// ** Window Title Command
//=============================================================================

//==============================
// * make Command List
//==============================

//==================================NOTETAGS=============================================//

var stateFX;
var showVal = false;

var InterpreterPluginComms = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
  InterpreterPluginComms.call(this, command, args);
  if (
    command === "SpeedUpBattle" ||
    command === "StateFX" ||
    command === "BossName" ||
    command === "sHUDswitch" ||
    command === "SkillLvGauge"
  ) {
    switch (args[0]) {
      case "normal":
        Sprite_StateIcon.prototype.drawBuffRate = function (paramId) {
          if (!Yanfly.Param.BSCShowTurns) return;
          var value = this._battler.paramBuffRate(paramId) - 1;
          var text = Math.floor(value * 100) + "%";

          var wx = Yanfly.Param.BSCCounterBufferX || 0;
          var wy = (Yanfly.Param.BSCCounterBufferY || 8) - 2;
          var ww = Window_Base._iconWidth;
          var wh = Window_Base.prototype.lineHeight.call(this);
          var contents = this._turnCounterSprite.bitmap;
          contents.fontSize = Yanfly.Param.BSCFontSize * 0.78;
          contents.textColor = this.textColor(31);
          if (value > 0) {
            text = "+" + Math.floor(value * 100) + "%";
          }
          contents.drawText(text, wx, wy, ww, wh, "center");
        };

        BattleManager.canEscape_ATB = function (active) {
          if (Input.isPressed("cancel") && $gameVariables.value(64) === 0) {
            return true;
          }
          if (!active) {
            return false;
          }
          if (!this._canEscape) {
            return false;
          }
          if (!Input.isPressed("cancel")) {
            return false;
          }
        };
        Sepher.Param.BoostToggleSwitch = "tab";
        var canUpdateAtbMode = false;
        Scene_Battle.prototype.canUpdateAtbMode = function () {
          return true;
        };

        break;
      case "disable":
        Sepher.Param.BoostToggleSwitch = "";
        break;
      case "escape":
        Moghunter.atb_EscapeButton = "";
        break;
      case "escape1":
        Moghunter.atb_EscapeButton = String(
          Moghunter.parameters["Escape Button"]
        );
        break;
      case "on":
        stateFX = true;
        Yanfly.Param.VSFXActorAni = true;
        Yanfly.Param.VSFXEnemyAni = true;
        break;
      case "off":
        stateFX = false;
        Yanfly.Param.VSFXActorAni = false;
        Yanfly.Param.VSFXEnemyAni = false;
        break;
      case "MQWLeft":
        $gameSwitches.setValue(105, true);
        break;
      case "showActorVHG":
        Yanfly.Param.VHGDisplayActor = true;
        break;
      case "hideActorVHG":
        Yanfly.Param.VHGDisplayActor = false;
        break;

      // * Skill Level Customizable Gauge
      // case "bronze-phase":
      //   Yanfly.Param.SMLGauge1 = 3;
      //   Yanfly.Param.SMLGauge2 = 11;
      //   break;

      // case "silver-phase":
      //   Yanfly.Param.SMLGauge1 = 0;
      //   Yanfly.Param.SMLGauge2 = 8;
      //   break;

      // BOSS HP CUSTOMIZABLE
      // * GOLDEN SCORPION = 342
      case "GoldScorpion":
        Moghunter.bosshp_name_x = 298;
        break;
      case "SnakeGazer":
        Moghunter.bosshp_name_x = 329;
        break;
      case "Ann":
        Moghunter.bosshp_name_x = 362;
        break;
      case "Strey":
        Moghunter.bosshp_name_x = 382;
        break;
      case "PlantMonster":
        Moghunter.bosshp_name_x = 316;
        break;
    }
  }
};
