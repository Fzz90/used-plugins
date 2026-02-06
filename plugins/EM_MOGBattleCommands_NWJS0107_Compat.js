/*:
 * @plugindesc (v1.0.0) NW.js 0.107.0 Compat Patch for MOG_BattleCommands (Fix sub-pixel "pecah" / jaggies)
 * @author Faiz Syihab
 *
 * @help
 * Patch ini membenahi tampilan "pixel pecah" pada MOG_BattleCommands di NW.js baru
 * dengan cara:
 * 1) Memaksa semua sprite battle commands berada di koordinat integer (Math.round)
 *    supaya tidak kena sub-pixel sampling.
 * 2) Memastikan bitmap battlecommands tetap smooth (linear) agar scaling halus.
 *
 * Cara pakai:
 * - Letakkan plugin ini DI BAWAH MOG_BattleCommands.js
 *
 * Catatan:
 * - Patch ini tidak mengubah Pixi global untuk seluruh game, hanya fokus BattleCommands.
 */

(() => {
  "use strict";

  if (!window.Imported || !Imported.MOG_BattleCommands) return;

  // ---------------------------
  // Helpers
  // ---------------------------
  const _round = (n) => (Number.isFinite(n) ? Math.round(n) : n);

  function roundSpriteXY(spr) {
    if (!spr) return;
    spr.x = _round(spr.x);
    spr.y = _round(spr.y);
  }

  function forceBitmapSmooth(bitmap) {
    // MV Bitmap punya flag smooth untuk baseTexture scaleMode
    if (!bitmap) return;
    try {
      bitmap.smooth = true;
    } catch (e) {
      // ignore
    }
  }

  // ---------------------------
  // Ensure ImageManager.loadBcom remains smooth
  // (MOG biasanya sudah pakai smooth true, tapi kita pastikan lagi)
  // ---------------------------
  if (ImageManager.loadBcom) {
    const _loadBcom = ImageManager.loadBcom;
    ImageManager.loadBcom = function (filename) {
      const bmp = _loadBcom.call(this, filename);
      forceBitmapSmooth(bmp);
      return bmp;
    };
  }

  // ---------------------------
  // Patch Window_ActorCommand update flow
  // ---------------------------
  const _WAC_update = Window_ActorCommand.prototype.update;
  Window_ActorCommand.prototype.update = function () {
    _WAC_update.call(this);
    this.em_roundBattleCommandsSprites();
  };

  Window_ActorCommand.prototype.em_roundBattleCommandsSprites = function () {
    // Layout
    roundSpriteXY(this._layout);

    // Cursor
    roundSpriteXY(this._cursor_b);

    // Arrows
    if (this._arrow && this._arrow.length) {
      for (let i = 0; i < this._arrow.length; i++)
        roundSpriteXY(this._arrow[i]);
    }

    // Command name
    roundSpriteXY(this._com_name);

    // Face
    roundSpriteXY(this._face);

    // Command sprites
    if (this._com_sprites && this._com_sprites.length) {
      for (let i = 0; i < this._com_sprites.length; i++) {
        const spr = this._com_sprites[i];
        roundSpriteXY(spr);
        // Pastikan bitmapnya smooth juga
        if (spr && spr.bitmap) forceBitmapSmooth(spr.bitmap);
      }
    }

    // Extra safety: ring mode sprite list (kalau ada)
    if (this._com_sprites2 && this._com_sprites2.length) {
      for (let i = 0; i < this._com_sprites2.length; i++) {
        roundSpriteXY(this._com_sprites2[i]);
      }
    }
  };

  // ---------------------------
  // Patch refresh bitmap: force smooth on loaded bitmaps
  // ---------------------------
  if (Window_ActorCommand.prototype.refresh_bitmap_com) {
    const _refresh_bitmap_com =
      Window_ActorCommand.prototype.refresh_bitmap_com;
    Window_ActorCommand.prototype.refresh_bitmap_com = function () {
      _refresh_bitmap_com.call(this);

      if (this._com_images && this._com_images.length) {
        for (let i = 0; i < this._com_images.length; i++) {
          forceBitmapSmooth(this._com_images[i]);
        }
      }
      // juga untuk sprite yang sudah terpasang
      if (this._com_sprites && this._com_sprites.length) {
        for (let i = 0; i < this._com_sprites.length; i++) {
          if (this._com_sprites[i] && this._com_sprites[i].bitmap) {
            forceBitmapSmooth(this._com_sprites[i].bitmap);
          }
        }
      }
    };
  }
})();
