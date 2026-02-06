/*:
 * @plugindesc (v1.0.0) Compatibility pack for PrettySleekGauges + HPColorPatch + YEP AbsorptionBarrier + YEP BattleStatusWindow. (ES6)
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_PrettySleekGauges_CompatPack.js
 * ============================================================================
 * Purpose:
 * - Make these plugins work together without losing functionality due to
 *   overwrite conflicts:
 *   - PrettySleekGauges.js
 *   - PrettySleekGauges_HPColorPatch.js
 *   - PrettySleekGauges_YanflyAbsBarrier.js
 *   - PrettySleekGauges_YEPBattleStatusWindowPatch.js
 *
 * Installation Order (recommended):
 * 1) PrettySleekGauges.js
 * 2) PrettySleekGauges_HPColorPatch.js
 * 3) PrettySleekGauges_YanflyAbsBarrier.js
 * 4) PrettySleekGauges_YEPBattleStatusWindowPatch.js
 * 5) EM_PrettySleekGauges_CompatPack.js   <-- THIS (last)
 *
 * What this plugin fixes:
 * - Ensures HPColorPatch color pickers are used even when Absorption Barrier
 *   patch changes HP gauge calls to use "actor object" signature.
 * - Fixes BattleStatusWindow patch to pass correct gauge "type" strings instead
 *   of booleans (prevents broken bar shapes/critical logic).
 *
 * Notes:
 * - This plugin does NOT replace AbsorptionBarrier overlay logic. It respects
 *   the existing barrier patch if present.
 * ============================================================================
 */

(() => {
  "use strict";

  // --- Hard guards ---
  if (!Imported || !Imported.PrettySleekGauges) return;

  const hasAbsBarrier = !!Imported.YEP_AbsorptionBarrier;
  const hasYEPBattleStatusWindow = !!Imported.YEP_BattleStatusWindow;

  // If HP Color Controller plugin (AceOfAces) is present, HPColorPatch expects:
  //   this.hpbarColorPicker1(actor), this.hpbarColorPicker2(actor)
  // We will safely fall back to default gauge colors if not found.
  const getHpColor1 = (win, actor) =>
    win && typeof win.hpbarColorPicker1 === "function"
      ? win.hpbarColorPicker1(actor)
      : win.hpGaugeColor1();

  const getHpColor2 = (win, actor) =>
    win && typeof win.hpbarColorPicker2 === "function"
      ? win.hpbarColorPicker2(actor)
      : win.hpGaugeColor2();

  // --------------------------------------------------------------------------
  // 1) Unify Window_Base.drawActorHp to support BOTH:
  //    - normal PSG (rate signature)
  //    - AbsBarrier PSG patch (actor signature for HP only)
  // --------------------------------------------------------------------------
  const _WB_drawActorHp = Window_Base.prototype.drawActorHp;
  Window_Base.prototype.drawActorHp = function (actor, x, y, width) {
    width = width || 186;

    // If Absorption Barrier patch is installed, PSG's barrier patch expects
    // the HP gauge to be driven by actor object (not numeric rate).
    // (See barrier patch overriding Window_Base.drawActorHp). :contentReference[oaicite:9]{index=9}
    if (hasAbsBarrier) {
      const c1 = getHpColor1(this, actor);
      const c2 = getHpColor2(this, actor);

      // Use PSG's drawAnimatedGauge but feed actor object for "hp"
      this.drawAnimatedGauge(x, y, width, actor, c1, c2, "hp");
      this._gauges[this.makeGaugeKey(x, y)].setExtra(
        TextManager.hpA,
        actor.hp,
        actor.mhp,
      );
      return;
    }

    // Otherwise, keep original PSG behavior, but use HPColorPatch colors if available. :contentReference[oaicite:10]{index=10}
    const c1 = getHpColor1(this, actor);
    const c2 = getHpColor2(this, actor);

    this.drawAnimatedGauge(x, y, width, actor.hpRate(), c1, c2, "hp");
    this._gauges[this.makeGaugeKey(x, y)].setExtra(
      TextManager.hpA,
      actor.hp,
      actor.mhp,
    );
  };

  // --------------------------------------------------------------------------
  // 2) Unify Enemy HP bars (Window_EnemyHPBars.drawActorHp) if enemy gauges enabled
  //    (AbsBarrier patch also overwrites this). :contentReference[oaicite:11]{index=11}
  // --------------------------------------------------------------------------
  if (
    typeof Window_EnemyHPBars !== "undefined" &&
    Window_EnemyHPBars.prototype
  ) {
    const _WEHP_drawActorHp = Window_EnemyHPBars.prototype.drawActorHp;
    Window_EnemyHPBars.prototype.drawActorHp = function (actor, x, y, width) {
      // Keep PSG parameter behavior: textYOffset exists in PSG core scope, but not here.
      // We cannot reliably access PSG's internal closure vars from this plugin.
      // Therefore: call existing implementation if present, but ensure HPColorPatch
      // does not break anything. Enemy HP colors usually use default anyway.
      //
      // If you also need dynamic enemy HP colors, tell me—needs a parameterized approach.

      // If AbsBarrier patch is present, it expects actor-object signature for HP.
      if (hasAbsBarrier) {
        this.drawAnimatedGauge(
          x,
          y,
          width,
          actor,
          this.hpGaugeColor1(),
          this.hpGaugeColor2(),
          "hp",
        );
        // Keep textYOffset behavior: best-effort fallback to 0 (safe).
        const yOffset = 0;
        this._gauges[this.makeGaugeKey(x, y)].setExtra(
          TextManager.hpA,
          actor.hp,
          actor.mhp,
          yOffset,
        );
        return;
      }

      // Normal PSG behavior
      this.drawAnimatedGauge(
        x,
        y,
        width,
        actor.hpRate(),
        this.hpGaugeColor1(),
        this.hpGaugeColor2(),
        "hp",
      );
      this._gauges[this.makeGaugeKey(x, y)].setExtra(
        TextManager.hpA,
        actor.hp,
        actor.mhp,
        0,
      );
    };
  }

  // --------------------------------------------------------------------------
  // 3) Fix YEP Battle Status Window patch calls:
  //    The patch file passes boolean critical flags as "type" arg, but PSG expects
  //    type strings like "hp"/"mp"/"tp". :contentReference[oaicite:12]{index=12} :contentReference[oaicite:13]{index=13}
  // --------------------------------------------------------------------------
  if (hasYEPBattleStatusWindow && typeof Window_BattleStatus !== "undefined") {
    // Read HeightOffset from mjshi patch if user kept it as-is; otherwise fallback.
    // We cannot access the patch's local HeightOffset (closure), so we implement a safe constant.
    const HEIGHT_OFFSET = 8;

    Window_BattleStatus.prototype.drawGaugeArea = function (rect, actor) {
      // Keep Yanfly param font size behavior (matches the patch intent). :contentReference[oaicite:14]{index=14}
      if (window.Yanfly && Yanfly.Param && Yanfly.Param.BSWParamFontSize) {
        this.contents.fontSize = Yanfly.Param.BSWParamFontSize;
      }

      const wy = rect.y + rect.height - this.lineHeight();
      const wymod = 8 * 2 + 6;

      // MP/TP layout preserved from patch. :contentReference[oaicite:15]{index=15}
      if (this.getGaugesDrawn && this.getGaugesDrawn(actor) <= 2) {
        this.drawActorMp(actor, rect.x, wy, rect.width);
      } else {
        const ww = rect.width / 2;
        this.drawActorMp(actor, rect.x, wy, ww);
        this.drawActorTp(actor, rect.x + ww, wy, ww);
      }
      this.drawActorHp(actor, rect.x, wy - wymod, rect.width);
    };

    // HP in battle status: must support AbsBarrier signature if enabled
    Window_BattleStatus.prototype.drawActorHp = function (actor, x, y, width) {
      width = width || 186;

      if (hasAbsBarrier) {
        const c1 = getHpColor1(this, actor);
        const c2 = getHpColor2(this, actor);
        this.drawAnimatedGauge(x, y, width, actor, c1, c2, "hp");
        this._gauges[this.makeGaugeKey(x, y)].setExtra(
          TextManager.hpA,
          actor.hp,
          actor.mhp,
          HEIGHT_OFFSET,
        );
        return;
      }

      const c1 = getHpColor1(this, actor);
      const c2 = getHpColor2(this, actor);
      this.drawAnimatedGauge(x, y, width, actor.hpRate(), c1, c2, "hp");
      this._gauges[this.makeGaugeKey(x, y)].setExtra(
        TextManager.hpA,
        actor.hp,
        actor.mhp,
        HEIGHT_OFFSET,
      );
    };

    Window_BattleStatus.prototype.drawActorMp = function (actor, x, y, width) {
      width = width || 186;
      this.drawAnimatedGauge(
        x,
        y,
        width,
        actor.mpRate(),
        this.mpGaugeColor1(),
        this.mpGaugeColor2(),
        "mp",
      );
      this._gauges[this.makeGaugeKey(x, y)].setExtra(
        TextManager.mpA,
        actor.mp,
        actor.mmp,
        HEIGHT_OFFSET,
      );
    };

    Window_BattleStatus.prototype.drawActorTp = function (actor, x, y, width) {
      width = width || 186;
      this.drawAnimatedGauge(
        x,
        y,
        width,
        actor.tpRate(),
        this.tpGaugeColor1(),
        this.tpGaugeColor2(),
        "tp",
      );
      this._gauges[this.makeGaugeKey(x, y)].setExtra(
        TextManager.tpA,
        actor.tp,
        100,
        HEIGHT_OFFSET,
      );
    };

    // Preserve the patch’s behavior: do not animate during battle for battle-status gauges.
    if (typeof Special_Gauge !== "undefined" && Special_Gauge.prototype) {
      const _SG_doneUpdating = Special_Gauge.prototype.doneUpdating;
      Special_Gauge.prototype.doneUpdating = function () {
        // Equivalent intent: prevent battle status gauges from “finishing” in-battle,
        // forcing refresh outside battle only. :contentReference[oaicite:16]{index=16}
        if (
          SceneManager &&
          SceneManager._scene &&
          SceneManager._scene instanceof Scene_Battle
        )
          return false;
        return _SG_doneUpdating.call(this);
      };

      const _SG_fontSize = Special_Gauge.prototype.fontSize;
      Special_Gauge.prototype.fontSize = function () {
        if (
          this._window instanceof Window_BattleStatus &&
          window.Yanfly &&
          Yanfly.Param &&
          Yanfly.Param.BSWParamFontSize
        ) {
          return Yanfly.Param.BSWParamFontSize;
        }
        return _SG_fontSize.call(this);
      };
    }
  }
})();
