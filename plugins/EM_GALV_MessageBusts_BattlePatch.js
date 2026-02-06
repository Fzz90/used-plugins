/*:
 * @plugindesc v1.0.0 Patch - Enable GALV_MessageBusts in Scene_Battle (bind msgWindow + ensure bust sprite in battle).
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_GALV_MessageBusts_BattlePatch.js
 * ============================================================================
 * Wajib:
 * - GALV_MessageBusts.js terpasang dan berada di atas plugin ini.
 *
 * Fungsi:
 * - Memastikan Galv.MB.msgWindow terikat ke Scene_Battle._messageWindow
 *   sehingga bust (img/pictures/(FACE_NAME)_(FACE_INDEX)) juga tampil di battle.
 *
 * Catatan:
 * - Mengikuti aturan filename Galv: FaceName_(FaceIndex+1).png
 *   Contoh: Actor1_2.png untuk faceIndex 1. :contentReference[oaicite:1]{index=1}
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_GALV_MessageBusts_BattlePatch = true;

(function () {
  "use strict";

  if (!Imported.Galv_MessageBusts || !Galv || !Galv.MB) return;

  // ------------------------------------------------------------
  // 1) Bind msgWindow pada Scene_Battle
  // ------------------------------------------------------------
  var _EM_Scene_Battle_createMessageWindow =
    Scene_Battle.prototype.createMessageWindow;
  Scene_Battle.prototype.createMessageWindow = function () {
    _EM_Scene_Battle_createMessageWindow.call(this);
    if (this._messageWindow) {
      Galv.MB.msgWindow = this._messageWindow;
    }
  };

  // Fallback binder (kalau ada plugin yang recreate window message setelah createMessageWindow)
  var _EM_Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function () {
    _EM_Scene_Battle_update.call(this);
    if (this._messageWindow && Galv.MB.msgWindow !== this._messageWindow) {
      Galv.MB.msgWindow = this._messageWindow;
    }
  };

  // ------------------------------------------------------------
  // 2) Pastikan bust sprite dibuat di Spriteset_Battle untuk prio==0 (under message)
  //    (Beberapa stack plugin mengganti createUpperLayer sehingga alias Galv bisa terlewat.)
  // ------------------------------------------------------------
  if (Number(Galv.MB.prio || 0) === 0) {
    // Tambah method createBusts jika belum ada (Galv membuatnya pada Spriteset_Base dalam kondisi tertentu)
    if (!Spriteset_Base.prototype.createBusts) {
      Spriteset_Base.prototype.createBusts = function () {
        if (this._msgBustSprite) return;
        this._msgBustSprite = new Sprite_GalvBust();
        this.addChild(this._msgBustSprite);
      };
    }

    var _EM_Spriteset_Battle_createUpperLayer =
      Spriteset_Battle.prototype.createUpperLayer;
    Spriteset_Battle.prototype.createUpperLayer = function () {
      _EM_Spriteset_Battle_createUpperLayer.call(this);
      if (this.createBusts) this.createBusts();
    };
  }
})();
