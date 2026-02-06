/*:
 * @plugindesc (v1.932) ATB Gauge UX Pack: Hover Tone + Help/Hud Flow + Damage Tint + Heal Blink (0 damage ignored)
 * @author Faiz Syihab
 *
 * @help
 * - Damage HP = 0 -> TIDAK ada perubahan warna (actor & enemy tetap normal).
 * - Actor menerima damage HP (>0): icon merah terang (sementara, tidak berkedip)
 * - Enemy menerima damage HP (>0): icon merah gelap (sementara, tidak berkedip)
 * - Heal HP & Heal MP: blink putih
 *
 * Requirements:
 * - MOG_ATB.js
 * - MOG_ATB_Gauge.js
 *
 * Supported:
 * - MOG_BattleCursor.js
 * - MOG_BattleCommands.js
 * - MOG_BattleHud.js
 * - YEP_TargetCore.js
 *
 * Installation:
 * - Letakkan plugin ini PALING BAWAH setelah semua plugin battle/hud.
 */

(() => {
  "use strict";

  // =====================
  // CONFIG
  // =====================
  const DIM_TONE = [130, 130, 130, 0];
  const NORMAL_TONE = [0, 0, 0, 0];

  const ACTOR_DMG_HEX = "#ff3b30";
  const ENEMY_DMG_HEX = "#8b0000";
  const HEAL_WHITE_HEX = "#ffffff";

  const DAMAGE_TINT_ALPHA = 200;
  const DAMAGE_TINT_FRAMES = 18;

  const HEAL_BLINK_ALPHA = 210;
  const HEAL_BLINK_FRAMES = 18;
  const HEAL_BLINK_PATTERN = 6;

  const EXTRA_TOP_WINDOWS = [];

  if (!window.Imported || !Imported.MOG_ATB_Gauge) return;

  // =====================
  // Helpers
  // =====================
  function isInBattle() {
    return !!($gameParty && $gameParty.inBattle && $gameParty.inBattle());
  }

  function clamp255(n) {
    n = Number(n) || 0;
    if (n < 0) return 0;
    if (n > 255) return 255;
    return n;
  }

  function hexToRgb(hex) {
    const h = String(hex || "").trim();
    const m = h.match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return [255, 255, 255];
    const v = m[1];
    return [
      parseInt(v.slice(0, 2), 16),
      parseInt(v.slice(2, 4), 16),
      parseInt(v.slice(4, 6), 16),
    ];
  }

  function rgbaFromHex(hex, a) {
    const rgb = hexToRgb(hex);
    return [rgb[0], rgb[1], rgb[2], clamp255(a)];
  }

  function setTone(sprite, tone) {
    if (sprite && sprite.setColorTone) sprite.setColorTone(tone);
  }

  function setBlend(sprite, rgba) {
    if (sprite && sprite.setBlendColor) sprite.setBlendColor(rgba);
  }

  function forceHidden(win, hidden) {
    if (!win) return;
    win.visible = !hidden;
    win.opacity = hidden ? 0 : 255;
    if (win.contents) win.contentsOpacity = hidden ? 0 : 255;
  }

  function isActiveWindow(w) {
    return !!(w && w.active && w.openness > 0);
  }

  function hasMogCursor() {
    return !!(window.Imported && Imported.MOG_BattleCursor && window.$gameTemp);
  }

  function hasMogBattleHud() {
    return !!(window.Imported && Imported.MOG_BattleHud && window.$gameSystem);
  }

  function setBattleHudVisible(visible) {
    if (!hasMogBattleHud()) return;
    $gameSystem._bhud_visible = !!visible;
  }

  // =====================
  // Hover / Target detection for tone
  // =====================
  function isAllTargetsForBattler(battler) {
    if (!battler || !hasMogCursor()) return false;
    const all = $gameTemp._arrowAllTargets;
    if (!all) return false;
    if (battler.isEnemy && battler.isEnemy()) return !!all[0];
    if (battler.isActor && battler.isActor()) return !!all[1];
    return false;
  }

  function isHoveredByMogCursor(battler) {
    if (!battler || !hasMogCursor()) return false;
    if (battler._arrowVisible) return true;
    if (isAllTargetsForBattler(battler)) return true;
    return false;
  }

  function shouldToneBattler(battler) {
    if (!battler) return false;
    if (hasMogCursor()) return isHoveredByMogCursor(battler);
    return false;
  }

  // =====================
  // FX State on Battler
  // =====================
  function fxOf(battler) {
    battler._emAtbFx = battler._emAtbFx || {
      dmgTint: 0,
      dmgColor: [0, 0, 0, 0],
      healBlink: 0,
      healColor: [0, 0, 0, 0],
    };
    return battler._emAtbFx;
  }

  function triggerDamageTint(battler) {
    const fx = fxOf(battler);
    const hex =
      battler.isEnemy && battler.isEnemy() ? ENEMY_DMG_HEX : ACTOR_DMG_HEX;
    fx.dmgTint = Math.max(fx.dmgTint, DAMAGE_TINT_FRAMES | 0);
    fx.dmgColor = rgbaFromHex(hex, DAMAGE_TINT_ALPHA);
  }

  function triggerHealBlink(battler) {
    const fx = fxOf(battler);
    fx.healBlink = Math.max(fx.healBlink, HEAL_BLINK_FRAMES | 0);
    fx.healColor = rgbaFromHex(HEAL_WHITE_HEX, HEAL_BLINK_ALPHA);
  }

  // =====================
  // Hook HP/MP changes
  // =====================
  function onGainHpAfter(battler, value) {
    if (!isInBattle()) return;
    if (value == null) return;

    // IMPORTANT: jika benar-benar 0, jangan trigger apa pun
    if (value === 0) return;

    // Damage HP (value < 0) -> tint merah (no blink)
    if (value < 0) {
      // abs(value) pasti > 0 karena value !== 0
      triggerDamageTint(battler);
      return;
    }

    // Heal HP (value > 0) -> blink putih
    if (value > 0) triggerHealBlink(battler);
  }

  function onGainMpAfter(battler, value) {
    if (!isInBattle()) return;
    if (value == null) return;

    // 0 MP change -> do nothing
    if (value === 0) return;

    // Heal MP only
    if (value > 0) triggerHealBlink(battler);
  }

  function wrapMethod(obj, methodName, afterFn, tag) {
    if (!obj || !obj[methodName]) return;
    if (obj[methodName]._emWrappedTag === tag) return;

    const _base = obj[methodName];
    const wrapped = function (...args) {
      _base.apply(this, args);
      afterFn(this, args[0]);
    };
    wrapped._emWrappedTag = tag;
    obj[methodName] = wrapped;
  }

  wrapMethod(
    Game_Battler.prototype,
    "gainHp",
    onGainHpAfter,
    "EM_ATBFX_gainHp",
  );
  wrapMethod(
    Game_Battler.prototype,
    "gainMp",
    onGainMpAfter,
    "EM_ATBFX_gainMp",
  );

  if (window.Game_Actor) {
    wrapMethod(
      Game_Actor.prototype,
      "gainHp",
      onGainHpAfter,
      "EM_ATBFX_gainHp",
    );
    wrapMethod(
      Game_Actor.prototype,
      "gainMp",
      onGainMpAfter,
      "EM_ATBFX_gainMp",
    );
  }
  if (window.Game_Enemy) {
    wrapMethod(
      Game_Enemy.prototype,
      "gainHp",
      onGainHpAfter,
      "EM_ATBFX_gainHp",
    );
    wrapMethod(
      Game_Enemy.prototype,
      "gainMp",
      onGainMpAfter,
      "EM_ATBFX_gainMp",
    );
  }

  // =====================
  // Patch: ATB_Gauge.updateIcon
  // =====================
  const _updateIcon = ATB_Gauge.prototype.updateIcon;
  ATB_Gauge.prototype.updateIcon = function (sprite, index) {
    _updateIcon.call(this, sprite, index);
    if (!sprite || !sprite.battler) return;

    const battler = sprite.battler;
    const fx = battler._emAtbFx;

    // Clear blend every frame
    setBlend(sprite, [0, 0, 0, 0]);

    // Tone from hover
    setTone(sprite, shouldToneBattler(battler) ? DIM_TONE : NORMAL_TONE);

    if (!fx) return;

    // Damage tint (no blink)
    if (fx.dmgTint > 0) {
      setBlend(sprite, fx.dmgColor || [0, 0, 0, 0]);
      fx.dmgTint--;
      if (fx.dmgTint <= 0) setBlend(sprite, [0, 0, 0, 0]);
    }

    // Heal blink white overrides while active
    if (fx.healBlink > 0) {
      const cycle = HEAL_BLINK_PATTERN;
      const on = fx.healBlink % cycle < cycle / 2;
      if (on) setBlend(sprite, fx.healColor || [0, 0, 0, 0]);
      else setBlend(sprite, [0, 0, 0, 0]);
      fx.healBlink--;
      if (fx.healBlink <= 0) setBlend(sprite, [0, 0, 0, 0]);
    }
  };

  // =====================
  // HELP WINDOW FLOW + BATTLEHUD FLOW
  // =====================
  function choosingSkillOrItem(sc) {
    return !!(
      (sc._skillWindow && isActiveWindow(sc._skillWindow)) ||
      (sc._itemWindow && isActiveWindow(sc._itemWindow))
    );
  }

  function applyUiFlow(sc) {
    if (!sc) return;

    const inSkillItem = choosingSkillOrItem(sc);

    const showHelp = inSkillItem;
    forceHidden(sc._helpWindow, !showHelp);
    for (let i = 0; i < EXTRA_TOP_WINDOWS.length; i++) {
      forceHidden(sc[EXTRA_TOP_WINDOWS[i]], !showHelp);
    }

    setBattleHudVisible(!inSkillItem);
  }

  const _sceneUpdate = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function () {
    _sceneUpdate.call(this);
    applyUiFlow(this);
  };

  const _Scene_Battle_start = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function () {
    _Scene_Battle_start.call(this);
    applyUiFlow(this);
  };

  const _BattleManager_startBattle = BattleManager.startBattle;
  BattleManager.startBattle = function () {
    _BattleManager_startBattle.call(this);
    const sc = SceneManager && SceneManager._scene;
    if (sc && sc instanceof Scene_Battle) applyUiFlow(sc);
  };
})();
