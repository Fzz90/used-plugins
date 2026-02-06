/*:
 * @plugindesc Patch - Fix MOG_BattleHud dislocated bars (Front-view Face) + MOG_ATB compatible.
 * @author Faiz Syihab
 */

(function () {
  "use strict";

  // Wajib: alias MOG_BattleHud harus ada
  if (typeof _alias_mog_bhud_sprt_actor_updatePosition !== "function") return;

  function isATBInputting() {
    // MOG_ATB override: BattleManager.isInputting() => return this._atbBattlerInput[0] :contentReference[oaicite:2]{index=2}
    try {
      if (BattleManager && BattleManager.isInputting)
        return !!BattleManager.isInputting();
    } catch (e) {}
    return false;
  }

  function isAnyCommandWindowActive() {
    // fallback kalau bukan ATB / atau saat window aktif
    var s = SceneManager && SceneManager._scene;
    if (!s) return false;
    return !!(
      (s._actorCommandWindow && s._actorCommandWindow.active) ||
      (s._partyCommandWindow && s._partyCommandWindow.active) ||
      (s._skillWindow && s._skillWindow.active) ||
      (s._itemWindow && s._itemWindow.active) ||
      (s._actorWindow && s._actorWindow.active) ||
      (s._enemyWindow && s._enemyWindow.active)
    );
  }

  Sprite_Battler.prototype.updatePosition = function () {
    // Logic MOG_BattleHud: front-view + face sprite -> nempel ke posisi bhud
    if (!$gameSystem.isSideView() && this._sprite_face) {
      // ✅ ATB-friendly condition:
      // nempel ke HUD hanya saat benar-benar sedang input/command selection
      var allowStick = isATBInputting() || isAnyCommandWindowActive();

      if (!allowStick) {
        // saat prepare/cast/action berjalan, pakai updatePosition bawaan MOG (alias)
        return _alias_mog_bhud_sprt_actor_updatePosition.call(this);
      }

      // nempel ke posisi bhud (logic MOG)
      if (
        this._battler &&
        $gameTemp._bhud_position &&
        $gameTemp._bhud_position[this._battler.index()]
      ) {
        this.x =
          $gameTemp._bhud_position[this._battler.index()][0] +
          Moghunter.bhud_face_pos_x;
        this.y =
          $gameTemp._bhud_position[this._battler.index()][1] +
          Moghunter.bhud_face_pos_y;
        return;
      }
    }

    return _alias_mog_bhud_sprt_actor_updatePosition.call(this);
  };
})();
