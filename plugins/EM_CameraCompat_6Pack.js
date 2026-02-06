/*:
 * @plugindesc (v1.1.0) Compatibility patch: SRD_CameraCore + GALV_CamControl + MOG_Weather_EX + GALV_MapProjectiles + GALV_LayerGraphics + GALV_MessageBusts.
 * @author Faiz Syihab
 *
 * @param LockPictureScaleUnderZoom
 * @text Lock Picture Scale Under Zoom
 * @type boolean
 * @default true
 * @desc If true, Show Picture sprites keep their on-screen size during SRD zoom (prevents resampling/blur).
 *
 * @param LockPictureIds
 * @text Lock Picture IDs
 * @type string
 * @default
 * @desc Comma-separated Picture IDs to lock. Empty = lock ALL pictures.
 *
 * @help
 * ============================================================================
 *  EM_CameraCompat_6Pack_v1.1.0.js
 * ============================================================================
 * Compatibility layer for:
 *  - SRD_CameraCore
 *  - GALV_CamControl
 *  - MOG_Weather_EX
 *  - GALV_MapProjectiles
 *  - GALV_LayerGraphics
 *  - GALV_MessageBusts
 *
 * Place this plugin BELOW the plugins above (and BELOW other Spriteset/Camera
 * plugins such as GALV_MessageBusts / MOG_BattleHud if you use them).
 *
 * Fixes:
 *  - Sync SRD zoomScale -> $gameMap.zoom for GALV CAM accuracy.
 *  - Prevent camera "tug-of-war" (Galv cam active vs SRD focus/player scroll).
 *  - Zoom-aware centerX/centerY and screenTileX/Y for better clamping.
 *  - SRD "Zoom Pictures?" (pics mode) hard-fix:
 *      • SRD empties Spriteset_Base.createPictures, which breaks MOG_Weather_EX
 *        (field_3 expects _pictureContainer). This patch restores a safe picture
 *        layer + Sprite_Picture creation early, and makes SRD's extra scene call
 *        a no-op if pictures already exist.
 *  - GALV_LayerGraphics zoom-fit:
 *      • Ensures tiling layer sprites (fog/parallax) resize to cover view
 *        correctly under SRD zoom.
 *  - MOG_Weather_EX zoom-fit:
 *      • Ensures Weather EX (particles + tiling fog/parallax) expands its
 *        working area under SRD ZoomOut so it still covers the full screen.
 *  - MOG_Weather_EX safety:
 *      • Ensures _pictureContainer exists before createWeatherField_3 runs.
 *      • Optional fallback to prevent crashes if other plugins reorder hooks.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_CameraCompat_6Pack = true;
Imported.EM_CameraCompat_6Pack_Version = "1.1.0";
// Back-compat flags
Imported.EM_CameraCompat_4Pack = true; // legacy flag
Imported.EM_CameraCompat_4Pack_Version = "1.1.0";

(() => {
  "use strict";

  const EMCC = {};


// --------------------------------------------------------------------------
// Plugin Parameters
// --------------------------------------------------------------------------
EMCC._getParams = function () {
  if (typeof PluginManager === "undefined" || !PluginManager.parameters) return {};
  const candidates = [];

  // Try current script filename (most reliable).
  try {
    const cs = document.currentScript;
    if (cs && cs.src) {
      const base = String(cs.src).split("/").pop().replace(/\.js$/i, "");
      if (base) candidates.push(base);
    }
  } catch (e) {
    // ignore
  }

  // Common names (file may be renamed by user).
  candidates.push("EM_CameraCompat_6Pack", "EM_CameraCompat_6Pack_v1.1.0", "EM_CameraCompat_6Pack_v1.0.9");

  for (let i = 0; i < candidates.length; i++) {
    const p = PluginManager.parameters(candidates[i]);
    if (p && Object.keys(p).length) return p;
  }
  return {};
};

const _params = EMCC._getParams();
EMCC.PARAM_LOCK_PIC_SCALE = String(_params.LockPictureScaleUnderZoom ?? "true") === "true";

EMCC.PARAM_LOCK_PIC_IDS = (function () {
  const raw = String(_params.LockPictureIds ?? "").trim();
  if (!raw) return null; // null => lock ALL
  const set = new Set();
  raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length)
    .forEach((s) => {
      const n = Number(s);
      if (__isNumber(n) && n > 0) set.add(Math.floor(n));
    });
  return set.size ? set : null;
})();

EMCC.isLockedPictureId = function (pictureId) {
  if (!EMCC.PARAM_LOCK_PIC_SCALE) return false;
  if (!EMCC.PARAM_LOCK_PIC_IDS) return true; // lock ALL
  return EMCC.PARAM_LOCK_PIC_IDS.has(pictureId);
};

EMCC.findSpritesetParent = function (sprite) {
  let p = sprite ? sprite.parent : null;
  while (p) {
    if (typeof Spriteset_Base !== "undefined" && p instanceof Spriteset_Base) return p;
    p = p.parent;
  }
  return null;
};

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------
  const _isNumber = (n) => typeof n === "number" && !Number.isNaN(n);

  EMCC.isSRDPicsEnabled = function () {
    return !!(window.SRD && SRD.CameraCore && SRD.CameraCore.pics);
  };

  EMCC.screenZoomScale = function () {
    if ($gameScreen && typeof $gameScreen.zoomScale === "function") {
      const z = $gameScreen.zoomScale();
      return _isNumber(z) && z > 0 ? z : 1;
    }
    if ($gameScreen && _isNumber($gameScreen._zoomScale) && $gameScreen._zoomScale > 0) {
      return $gameScreen._zoomScale;
    }
    return 1;
  };

  EMCC.ensureMapZoomPoint = function () {
    if (!$gameMap) return;
    if (!$gameMap.zoom) $gameMap.zoom = new PIXI.Point(1, 1);
    if (!_isNumber($gameMap.zoom.x) || $gameMap.zoom.x <= 0) $gameMap.zoom.x = 1;
    if (!_isNumber($gameMap.zoom.y) || $gameMap.zoom.y <= 0) $gameMap.zoom.y = 1;
  };

  EMCC.syncMapZoomWithScreen = function () {
    if (!$gameMap) return;
    EMCC.ensureMapZoomPoint();
    const z = EMCC.screenZoomScale();
    $gameMap.zoom.x = z;
    $gameMap.zoom.y = z;
  };

  EMCC.isGalvCameraActive = function () {
    return Boolean($gameMap && $gameMap.camNorm === false);
  };

  EMCC.isSRDFocusActive = function () {
    return Boolean($gameScreen && $gameScreen.focusEvent !== undefined && $gameScreen.focusEvent !== 0);
  };

  // --------------------------------------------------------------------------
  // Picture layer fallback
  // (critical for MOG_Weather_EX layer3; also fixes SRD pics mode side effects)
  // --------------------------------------------------------------------------
  EMCC.hasSpritePictures = function (spriteset) {
    if (!spriteset || !spriteset._pictureContainer) return false;
    if (spriteset._pictureSprites && spriteset._pictureSprites.length) return true;

    const c = spriteset._pictureContainer;
    if (!c.children || c.children.length === 0) return false;

    if (typeof Sprite_Picture !== "function") return true;
    return c.children.some((ch) => ch instanceof Sprite_Picture);
  };

  EMCC.ensurePictureLayer = function (spriteset) {
    if (!spriteset) return;

    const parent =
      spriteset._baseSprite ||
      spriteset._battleField ||
      spriteset._tilemap ||
      spriteset;

    // Ensure _pictureContainer exists and is attached.
    if (!spriteset._pictureContainer) {
      try {
        spriteset._pictureContainer = new Sprite();
        if (parent && typeof parent.addChild === "function") parent.addChild(spriteset._pictureContainer);
      } catch (e) {
        // ignore
      }
    } else if (!spriteset._pictureContainer.parent && parent && typeof parent.addChild === "function") {
      try {
        parent.addChild(spriteset._pictureContainer);
      } catch (e) {
        // ignore
      }
    }

    if (!spriteset._pictureContainer) return;

    // If pictures already exist in children, rebuild pointer array if needed.
    if (typeof Sprite_Picture === "function" && spriteset._pictureContainer.children) {
      const existing = spriteset._pictureContainer.children.filter((ch) => ch instanceof Sprite_Picture);
      if (existing.length && (!spriteset._pictureSprites || !spriteset._pictureSprites.length)) {
        spriteset._pictureSprites = existing;
        return;
      }
    }

    // Create picture sprites if missing.
    if (!EMCC.hasSpritePictures(spriteset) &&
        typeof Sprite_Picture === "function" &&
        $gameScreen && typeof $gameScreen.maxPictures === "function") {
      try {
        const max = $gameScreen.maxPictures();

        // Preserve existing non-picture children (e.g., weatherField_3) on top.
        const extras = spriteset._pictureContainer.children ? spriteset._pictureContainer.children.slice() : [];
        if (extras.length) {
          for (let i = extras.length - 1; i >= 0; i--) {
            try { spriteset._pictureContainer.removeChild(extras[i]); } catch (e) { /* ignore */ }
          }
        }

        spriteset._pictureSprites = [];
        for (let i = 1; i <= max; i++) {
          const sp = new Sprite_Picture(i);
          spriteset._pictureSprites.push(sp);
          spriteset._pictureContainer.addChild(sp);
        }

        // Re-add preserved children (stay above pictures).
        if (extras.length) {
          for (let i = 0; i < extras.length; i++) {
            try { spriteset._pictureContainer.addChild(extras[i]); } catch (e) { /* ignore */ }
          }
        }
      } catch (e) {
        // ignore
      }
    }
  };

  // --------------------------------------------------------------------------
  // Wrap Spriteset_Base.createPictures so _pictureContainer always exists BEFORE
  // MOG_Weather_EX calls createWeatherField_3().
  // --------------------------------------------------------------------------
  EMCC.patchSpritesetCreatePicturesSafety = function () {
    if (typeof Spriteset_Base === "undefined" || !Spriteset_Base.prototype) return;

    const cur = Spriteset_Base.prototype.createPictures;
    if (typeof cur !== "function") return;
    if (cur._emcc_safeWrap) return;

    const _createPictures = cur;
    const wrapped = function () {
      // Ensure picture layer (handles SRD pics mode empty createPictures side effect).
      EMCC.ensurePictureLayer(this);

      let result;
      try {
        result = _createPictures.apply(this, arguments);
      } catch (e) {
        // If another plugin's createPictures chain throws, keep going; we only
        // need the layer to exist to prevent downstream crashes.
      }

      // Ensure again (some plugins recreate/clear containers mid-call).
      EMCC.ensurePictureLayer(this);
      return result;
    };

    wrapped._emcc_safeWrap = true;
    Spriteset_Base.prototype.createPictures = wrapped;
  };

  // --------------------------------------------------------------------------
  // Wrap MOG's createWeatherField_3 to be tolerant if _pictureContainer was
  // removed or never created by upstream overrides.
  // --------------------------------------------------------------------------
  EMCC.patchCreateWeatherField3Safety = function () {
    if (typeof Spriteset_Base === "undefined" || !Spriteset_Base.prototype) return;

    const cur = Spriteset_Base.prototype.createWeatherField_3;
    if (typeof cur !== "function") return;
    if (cur._emcc_safeWrap) return;

    const _cw3 = cur;
    const wrapped = function () {
      EMCC.ensurePictureLayer(this);

      // If field already exists and attached, do nothing.
      if (this._weatherField_3 && this._weatherField_3.parent) return;

      try {
        return _cw3.apply(this, arguments);
      } catch (e) {
        // Fallback: minimal safe field to prevent crashes.
        try {
          if (!this._weatherField_3) this._weatherField_3 = new Sprite();
          if (this._pictureContainer && typeof this._pictureContainer.addChild === "function") {
            this._pictureContainer.addChild(this._weatherField_3);
          }
        } catch (e2) {
          // ignore
        }
      }
    };

    wrapped._emcc_safeWrap = true;
    Spriteset_Base.prototype.createWeatherField_3 = wrapped;
  };

  // --------------------------------------------------------------------------
  // MOG_Weather_EX safety: ensure weather fields exist before refresh/update
  // --------------------------------------------------------------------------
  EMCC.ensureWeatherEXContainers = function (spriteset) {
    if (!spriteset) return;

    const isBattle = !!spriteset._battleField;
    const mode = isBattle ? 1 : 0;

    // Field 1 & 2 live on base/battleField.
    if (!spriteset._weatherField_1 && typeof spriteset.createWeatherField_1 === "function") {
      try { spriteset.createWeatherField_1(mode); } catch (e) { /* ignore */ }
    }
    if (!spriteset._weatherField_2 && typeof spriteset.createWeatherField_2 === "function") {
      try { spriteset.createWeatherField_2(mode); } catch (e) { /* ignore */ }
    }

    // Picture container (+ picture sprites if missing)
    EMCC.ensurePictureLayer(spriteset);

    // Field 3 lives in pictureContainer in MOG.
    if (!spriteset._weatherField_3 && typeof spriteset.createWeatherField_3 === "function") {
      try { spriteset.createWeatherField_3(mode); } catch (e) {
        try { spriteset.createWeatherField_3(); } catch (e2) { /* ignore */ }
      }
    }

    // Last resort: minimal field_3 to avoid crashes.
    if (!spriteset._weatherField_3 && spriteset._pictureContainer) {
      try {
        spriteset._weatherField_3 = new Sprite();
        spriteset._pictureContainer.addChild(spriteset._weatherField_3);
      } catch (e) { /* ignore */ }
    }
  };

  if (typeof Spriteset_Base !== "undefined" && Spriteset_Base.prototype) {
    if (Spriteset_Base.prototype.createWeatherEX) {
      const _EMCC_SpritesetBase_createWeatherEX = Spriteset_Base.prototype.createWeatherEX;
      Spriteset_Base.prototype.createWeatherEX = function () {
        EMCC.ensureWeatherEXContainers(this);
        return _EMCC_SpritesetBase_createWeatherEX.apply(this, arguments);
  }
    }

    if (Spriteset_Base.prototype.createWeatherEXRefresh) {
      const _EMCC_SpritesetBase_createWeatherEXRefresh = Spriteset_Base.prototype.createWeatherEXRefresh;
      Spriteset_Base.prototype.createWeatherEXRefresh = function () {
        EMCC.ensureWeatherEXContainers(this);
        return _EMCC_SpritesetBase_createWeatherEXRefresh.apply(this, arguments);
      };
    }

    if (Spriteset_Base.prototype.removeWeatherEXRefresh) {
      const _EMCC_SpritesetBase_removeWeatherEXRefresh = Spriteset_Base.prototype.removeWeatherEXRefresh;
      Spriteset_Base.prototype.removeWeatherEXRefresh = function () {
        EMCC.ensureWeatherEXContainers(this);
        return _EMCC_SpritesetBase_removeWeatherEXRefresh.apply(this, arguments);
      };
    }
  };

  // --------------------------------------------------------------------------
  // Game_Map - ensure zoom point exists and stays synced to SRD camera zoom
  // --------------------------------------------------------------------------
  const _EMCC_Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function (mapId) {
    _EMCC_Game_Map_setup.apply(this, arguments);
    EMCC.ensureMapZoomPoint();
    EMCC.syncMapZoomWithScreen();
  };

  if (Game_Screen.prototype.updateZoom) {
    const _EMCC_Game_Screen_updateZoom = Game_Screen.prototype.updateZoom;
    Game_Screen.prototype.updateZoom = function () {
      _EMCC_Game_Screen_updateZoom.apply(this, arguments);
      EMCC.syncMapZoomWithScreen();
    };
  }

  const _EMCC_Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    _EMCC_Scene_Map_start.apply(this, arguments);
    EMCC.syncMapZoomWithScreen();
  };

  // Zoom-aware screen tiles (improves clamping)
  if (Game_Map.prototype.screenTileX) {
    const _EMCC_Game_Map_screenTileX = Game_Map.prototype.screenTileX;
    Game_Map.prototype.screenTileX = function () {
      const z = EMCC.screenZoomScale();
      const base = _EMCC_Game_Map_screenTileX.apply(this, arguments);
      return base / z;
    };
  }

  if (Game_Map.prototype.screenTileY) {
    const _EMCC_Game_Map_screenTileY = Game_Map.prototype.screenTileY;
    Game_Map.prototype.screenTileY = function () {
      const z = EMCC.screenZoomScale();
      const base = _EMCC_Game_Map_screenTileY.apply(this, arguments);
      return base / z;
    };
  }

  // --------------------------------------------------------------------------
  // Zoom-aware centering
  // --------------------------------------------------------------------------
  Game_CharacterBase.prototype.centerX = function () {
    const z = EMCC.screenZoomScale();
    const tw = $gameMap ? $gameMap.tileWidth() : 48;
    const tiles = Graphics.width / (tw * z);
    return (tiles - 1) / 2.0;
  };

  Game_CharacterBase.prototype.centerY = function () {
    const z = EMCC.screenZoomScale();
    const th = $gameMap ? $gameMap.tileHeight() : 48;
    const tiles = Graphics.height / (th * z);
    return (tiles - 1) / 2.0;
  };

  // --------------------------------------------------------------------------
  // Stable base scroll behavior
  // --------------------------------------------------------------------------
  const EMCC_baseUpdateScroll = function (lastScrolledX, lastScrolledY) {
    const x1 = lastScrolledX;
    const y1 = lastScrolledY;
    const x2 = this.scrolledX();
    const y2 = this.scrolledY();

    if (y2 > y1 && y2 > this.centerY()) $gameMap.scrollDown(y2 - y1);
    if (x2 < x1 && x2 < this.centerX()) $gameMap.scrollLeft(x1 - x2);
    if (x2 > x1 && x2 > this.centerX()) $gameMap.scrollRight(x2 - x1);
    if (y2 < y1 && y2 < this.centerY()) $gameMap.scrollUp(y1 - y2);
  };

  Game_Character.prototype.updateScroll = EMCC_baseUpdateScroll;

  Game_Player.prototype.updateScroll = function (lastScrolledX, lastScrolledY) {
    if (EMCC.isGalvCameraActive()) return;
    if (EMCC.isSRDFocusActive()) return;
    EMCC_baseUpdateScroll.call(this, lastScrolledX, lastScrolledY);
  };

  if (Game_Map.prototype.updateCameraScroll) {
    const _EMCC_Game_Map_updateCameraScroll = Game_Map.prototype.updateCameraScroll;
    Game_Map.prototype.updateCameraScroll = function () {
      if (EMCC.isGalvCameraActive()) return;
      _EMCC_Game_Map_updateCameraScroll.apply(this, arguments);
    };
  }

  if (Game_Event.prototype.updateScroll) {
    const _EMCC_Game_Event_updateScroll = Game_Event.prototype.updateScroll;
    Game_Event.prototype.updateScroll = function (lastScrolledX, lastScrolledY) {
      if (EMCC.isGalvCameraActive()) return;
      _EMCC_Game_Event_updateScroll.apply(this, arguments);
    };
  }

  if (Game_Follower.prototype.updateScroll) {
    const _EMCC_Game_Follower_updateScroll = Game_Follower.prototype.updateScroll;
    Game_Follower.prototype.updateScroll = function (lastScrolledX, lastScrolledY) {
      if (EMCC.isGalvCameraActive()) return;
      _EMCC_Game_Follower_updateScroll.apply(this, arguments);
    };
  }

  // When using Galv CAM commands, clear SRD focus to avoid two controllers.
  if (typeof Galv !== "undefined" && Galv.CC && typeof Galv.CC.camControl === "function") {
    const _EMCC_Galv_CC_camControl = Galv.CC.camControl;
    Galv.CC.camControl = function (args) {
      const result = _EMCC_Galv_CC_camControl.apply(this, arguments);
      if ($gameScreen && args && args[0] && String(args[0]).toLowerCase() !== "disable") {
        $gameScreen.focusEvent = 0;
      }
      EMCC.syncMapZoomWithScreen();
      return result;
    };
  }

  // --------------------------------------------------------------------------
  // MOG_Weather_EX extra safety: missing _cam_data (prevents crash)
  // --------------------------------------------------------------------------
  if (typeof SpriteWeatherEX !== "undefined" && SpriteWeatherEX.prototype.setCamScreen) {
    const _EMCC_SpriteWeatherEX_setCamScreen = SpriteWeatherEX.prototype.setCamScreen;
    SpriteWeatherEX.prototype.setCamScreen = function () {
      if ($gameSystem && !$gameSystem._cam_data) {
        $gameSystem._cam_data = [0, 100];
      } else if ($gameSystem && Array.isArray($gameSystem._cam_data)) {
        if ($gameSystem._cam_data.length < 2) $gameSystem._cam_data[1] = 100;
        if (!_isNumber($gameSystem._cam_data[1])) $gameSystem._cam_data[1] = 100;
      }
      return _EMCC_SpriteWeatherEX_setCamScreen.apply(this, arguments);
    };
  }

  
  // --------------------------------------------------------------------------
  // MOG_Weather_EX zoom-fit under SRD zoom (ZoomOut / ZoomIn)
  // - Expands Weather EX internal "work area" by accounting for the current
  //   $gameScreen.zoomScale() so particles & tiling weathers still cover the
  //   full screen when the Spriteset is scaled down (ZoomOut).
  // --------------------------------------------------------------------------
  EMCC._weatherViewSize = function () {
    const z = EMCC.screenZoomScale();
    const s = _isNumber(z) && z > 0 ? z : 1;
    const vw = Math.max(1, Math.ceil(Graphics.boxWidth / s));
    const vh = Math.max(1, Math.ceil(Graphics.boxHeight / s));
    return { s, vw, vh };
  };

  EMCC._fitMogWeatherInstance = function (wx) {
    if (!wx || !wx._sprites) return;

    // Map zoom behavior only. Battle camera plugins have their own sizing logic.
    if ($gameParty && typeof $gameParty.inBattle === "function" && $gameParty.inBattle()) {
      return;
    }

    const vs = EMCC._weatherViewSize();
    const vw = vs.vw;
    const vh = vs.vh;

    // Cache to avoid extra work.
    if (wx._emcc_w_vw === vw && wx._emcc_w_vh === vh &&
        wx._emcc_w_gw === Graphics.boxWidth && wx._emcc_w_gh === Graphics.boxHeight) {
      return;
    }
    wx._emcc_w_vw = vw;
    wx._emcc_w_vh = vh;
    wx._emcc_w_gw = Graphics.boxWidth;
    wx._emcc_w_gh = Graphics.boxHeight;

    const camX = wx._cam && _isNumber(wx._cam[0]) ? wx._cam[0] : 0;
    const camY = wx._cam && _isNumber(wx._cam[1]) ? wx._cam[1] : 0;

    // Expand spawn range (important for non-tiling particles under ZoomOut).
    wx._screenRX = vw + camX * 2;
    wx._screenRY = vh + camY * 2;
    wx._screenAn = Math.floor(wx._screenRX / 13);

    // Expand tiling rectangles so they still fill the screen after zoom scaling.
    const pad = 64;
    const wRect = vw + pad;
    const hRect = vh + pad;
    const cx = vw / 2 - pad / 2;
    const cy = vh / 2 - pad / 2;

    for (let i = 0; i < wx._sprites.length; i++) {
      const spr = wx._sprites[i];
      if (!spr || !spr.tiling) continue;
      try {
        if (typeof spr.move === "function") spr.move(0, 0, wRect, hRect);
        else { spr.width = wRect; spr.height = hRect; }
        spr.x = cx;
        spr.y = cy;
      } catch (e) {
        // ignore
      }
    }
  };

  EMCC.patchMogWeatherZoomFit = function () {
    if (typeof SpriteWeatherEX === "undefined" || !SpriteWeatherEX.prototype) return;

    // Make battle camera helpers zoom-aware (safe even if you don't use them).
    // Also keeps our earlier "_cam_data" crash-proofing.
    if (typeof SpriteWeatherEX.prototype.setCamScreen === "function" &&
        !SpriteWeatherEX.prototype.setCamScreen._emcc_zoomAware) {
      const _orig = SpriteWeatherEX.prototype.setCamScreen;
      SpriteWeatherEX.prototype.setCamScreen = function () {
        if ($gameSystem && !$gameSystem._cam_data) {
          $gameSystem._cam_data = [0, 100];
        } else if ($gameSystem && Array.isArray($gameSystem._cam_data)) {
          if ($gameSystem._cam_data.length < 2) $gameSystem._cam_data[1] = 100;
          if (!_isNumber($gameSystem._cam_data[1])) $gameSystem._cam_data[1] = 100;
        }

        // Prefer our zoom-aware math (matches original behavior but uses view size).
        try {
          const vs = EMCC._weatherViewSize();
          const camRange = ($gameSystem && $gameSystem._cam_data ? $gameSystem._cam_data[1] : 100) / 100;
          const centerX = vs.vw / 2;
          const centerY = vs.vh / 2;
          this._cam[0] = Math.floor(centerX * camRange);
          this._cam[1] = Math.floor(centerY * camRange);
          this._cam[2] = true;
          this._screenRX = vs.vw + this._cam[0] * 2;
          this._screenRY = vs.vh + this._cam[1] * 2;
          this._screenAn = Math.floor(this._screenRX / 13);
        } catch (e) {
          // fallback to original, if anything unexpected happens
          try { _orig.apply(this, arguments); } catch (e2) { /* ignore */ }
        }
      };
      SpriteWeatherEX.prototype.setCamScreen._emcc_zoomAware = true;
    }

    if (typeof SpriteWeatherEX.prototype.setFrontalCamera === "function" &&
        !SpriteWeatherEX.prototype.setFrontalCamera._emcc_zoomAware) {
      const _origF = SpriteWeatherEX.prototype.setFrontalCamera;
      SpriteWeatherEX.prototype.setFrontalCamera = function () {
        try {
          const vs = EMCC._weatherViewSize();
          this._cam[0] = (vs.vw * 50) / 100;
          this._cam[1] = (vs.vh * 50) / 100;
          this._cam[3] = vs.vw / 2;
          this._cam[4] = vs.vh / 2;
        } catch (e) {
          try { _origF.apply(this, arguments); } catch (e2) { /* ignore */ }
        }
      };
      SpriteWeatherEX.prototype.setFrontalCamera._emcc_zoomAware = true;
    }

    // Fit once right after creation.
    if (typeof SpriteWeatherEX.prototype.initialize === "function" &&
        !SpriteWeatherEX.prototype.initialize._emcc_zoomFit) {
      const _init = SpriteWeatherEX.prototype.initialize;
      SpriteWeatherEX.prototype.initialize = function () {
        _init.apply(this, arguments);
        EMCC._fitMogWeatherInstance(this);
      };
      SpriteWeatherEX.prototype.initialize._emcc_zoomFit = true;
    }

    // Fit continuously (ZoomOut can animate across frames).
    if (typeof SpriteWeatherEX.prototype.update === "function" &&
        !SpriteWeatherEX.prototype.update._emcc_zoomFit) {
      const _upd = SpriteWeatherEX.prototype.update;
      SpriteWeatherEX.prototype.update = function () {
        _upd.apply(this, arguments);
        EMCC._fitMogWeatherInstance(this);
      };
      SpriteWeatherEX.prototype.update._emcc_zoomFit = true;
    }
  };


// --------------------------------------------------------------------------
  // SRD CameraCore "pics" mode compatibility
  // Make the extra Scene call safe/no-op when pictures already exist.
  // --------------------------------------------------------------------------
  EMCC.patchSRDPicturesCompatibility = function () {
    if (!EMCC.isSRDPicsEnabled()) return;
    if (typeof Scene_Base === "undefined" || !Scene_Base.prototype) return;
    const fn = Scene_Base.prototype.createPicturesForCameraCore;
    if (typeof fn !== "function") return;
    if (fn._emcc_safeWrap) return;

    const safe = function () {
      const ss = this._spriteset;
      if (!ss) return;

      // If pictures already exist (because we restored createPictures safely),
      // skip re-creating them; just ensure MOG layers won't crash.
      EMCC.ensurePictureLayer(ss);

      if (!EMCC.hasSpritePictures(ss)) {
        // Try to build via spriteset.createPictures (wrapped safely by us).
        try {
          if (typeof ss.createPictures === "function") ss.createPictures();
        } catch (e) {
          // As a fallback, attempt SRD's original function on spriteset context.
          try { fn.call(ss); } catch (e2) { /* ignore */ }
        }
      }

      // Ensure MOG layer3 won't crash even if hooks got reordered.
      try {
        if (typeof ss.createWeatherField_3 === "function") ss.createWeatherField_3();
      } catch (e) {
        // ignore
      }
    };

    safe._emcc_safeWrap = true;
    Scene_Base.prototype.createPicturesForCameraCore = safe;
  };

  // --------------------------------------------------------------------------
  // Picture zoom compatibility (SRD "pics" mode + general stacks)
  //
  // Goal:
  //  - Pictures from "Show Picture" MUST zoom with SRD ZoomOut/ZoomIn.
  //
  // Root cause in SRD_CameraCore:
  //  - When "Zoom Pictures?" is true, SRD creates a Scene-level picture container
  //    (screen-space) and disables the Spriteset picture layer.
  //  - Many stacks end up with BOTH: our restored Spriteset pictures (zooming)
  //    AND SRD's Scene-level pictures (NOT zooming) sitting on top.
  //  - The top duplicate makes it *look* like pictures don't zoom.
  //
  // Fix strategy:
  //  - Keep pictures on the Spriteset (they inherit $gameScreen zoom naturally).
  //  - If a Scene-level picture container exists and looks like a duplicate,
  //    hide it (do NOT destroy it to avoid breaking other plugins' references).
  // --------------------------------------------------------------------------

  EMCC.hideScenePictureContainerIfDuplicate = function (scene) {
    if (!scene || !scene._pictureContainer) return;

    // If the scene container is actually the spriteset's container, don't touch.
    try {
      const ss = scene._spriteset;
      if (ss && ss._pictureContainer && scene._pictureContainer === ss._pictureContainer) return;
    } catch (e) {
      // ignore
    }

    // Only hide if it looks like a picture container.
    let looksLikePictures = false;
    if (scene._pictureSprites && scene._pictureSprites.length) looksLikePictures = true;

    if (!looksLikePictures && typeof Sprite_Picture === "function") {
      const c = scene._pictureContainer;
      if (c && c.children && c.children.some((ch) => ch instanceof Sprite_Picture)) {
        looksLikePictures = true;
      }
    }

    if (!looksLikePictures) return;

    // Hide (screen-space overlay) so the zooming Spriteset pictures are visible.
    try {
      scene._pictureContainer.visible = false;
      scene._pictureContainer.alpha = 0;
    } catch (e) {
      // ignore
    }
  };


// --------------------------------------------------------------------------
// Picture anti-resize under SRD zoom (prevents quality loss / pixel blur)
//
// When Spriteset is scaled (SRD ZoomOut/ZoomIn), Sprite_Picture will scale too,
// which can make UI frame pictures look "hancur".
// This patch can LOCK picture on-screen size (and screen-space position) by
// neutralizing the parent Spriteset zoom per picture sprite.
//
// Controlled by plugin params:
//  - LockPictureScaleUnderZoom (default true)
//  - LockPictureIds (empty = ALL)
// --------------------------------------------------------------------------
EMCC.patchSpritePictureLockScale = function () {
  if (typeof Sprite_Picture === "undefined" || !Sprite_Picture.prototype) return;
  const fn = Sprite_Picture.prototype.updatePosition;
  if (typeof fn !== "function" || fn._emcc_lockPic) return;

  const _updatePosition = fn;
  Sprite_Picture.prototype.updatePosition = function () {
    _updatePosition.apply(this, arguments);

    if (!EMCC.PARAM_LOCK_PIC_SCALE) return;

    const pid = _isNumber(this._pictureId) ? this._pictureId : 0;
    if (!EMCC.isLockedPictureId(pid)) return;

    const ss = EMCC.findSpritesetParent(this);
    if (!ss) return;

    const z =
      ss.scale && _isNumber(ss.scale.x) && ss.scale.x > 0 ? ss.scale.x : EMCC.screenZoomScale();
    if (!_isNumber(z) || z <= 0 || Math.abs(z - 1) < 0.0001) return;

    const pc = this.parent; // usually spriteset._pictureContainer
    const pcx = pc && _isNumber(pc.x) ? pc.x : 0;
    const pcy = pc && _isNumber(pc.y) ? pc.y : 0;

    const ssx = _isNumber(ss.x) ? ss.x : 0;
    const ssy = _isNumber(ss.y) ? ss.y : 0;

    // Convert from "zoomed" local coords (after default updatePosition)
    // into "screen space locked" coords under Spriteset scaling.
    this.x = (this.x - ssx) / z - pcx;
    this.y = (this.y - ssy) / z - pcy;

    if (this.scale) {
      this.scale.x = this.scale.x / z;
      this.scale.y = this.scale.y / z;
    }
  };

  Sprite_Picture.prototype.updatePosition._emcc_lockPic = true;
};


  EMCC.patchSpritesetZoomSync = function () {
    if (typeof Spriteset_Base === "undefined" || !Spriteset_Base.prototype) return;
    if (typeof Spriteset_Base.prototype.updatePosition !== "function") return;

    const _updatePosition = Spriteset_Base.prototype.updatePosition;
    if (_updatePosition._emcc_zoomSync) return;

    Spriteset_Base.prototype.updatePosition = function () {
      _updatePosition.apply(this, arguments);

      // Keep $gameMap.zoom synced (GALV_CamControl relies on this).
      EMCC.syncMapZoomWithScreen();

      // Ensure picture layer exists on the Spriteset (SRD pics mode safety).
      EMCC.ensurePictureLayer(this);

      // Hide Scene-level (non-zooming) picture duplicates if present.
      EMCC.hideScenePictureContainerIfDuplicate(SceneManager && SceneManager._scene);
    };

    Spriteset_Base.prototype.updatePosition._emcc_zoomSync = true;
  };

  // --------------------------------------------------------------------------
  // GALV_LayerGraphics compatibility
  // --------------------------------------------------------------------------
  EMCC.isGalvLayerGraphicsInstalled = function () {
    return !!(typeof Imported !== "undefined" && Imported.Galv_LayerGraphics);
  };

  EMCC._lgFit = function (spriteset) {
    if (!spriteset || !spriteset.layerGraphics) return;

    const tm = spriteset._tilemap;
    if (!tm) return;

    const z = EMCC.screenZoomScale();
    if (!_isNumber(z) || z <= 0) return;

    const margin = _isNumber(tm._margin) ? tm._margin : 0;

    // Prefer tilemap bounds (SRD margin fix updates these) so layers cover the full rendered area.
    const twRaw = _isNumber(tm._width) && tm._width > 0 ? tm._width : (tm.width || 0);
    const thRaw = _isNumber(tm._height) && tm._height > 0 ? tm._height : (tm.height || 0);

    // Fallback if bounds are unavailable.
    const fbW = Math.max(1, Math.ceil(Graphics.boxWidth / z) + 4);
    const fbH = Math.max(1, Math.ceil(Graphics.boxHeight / z) + 4);

    const w = Math.max(1, (twRaw > 0 ? Math.ceil(twRaw) : fbW));
    const h = Math.max(1, (thRaw > 0 ? Math.ceil(thRaw) : fbH));

    // Cache per spriteset to avoid extra work.
    if (
      spriteset._emcc_lg_lastZoom === z &&
      spriteset._emcc_lg_lastW === w &&
      spriteset._emcc_lg_lastH === h &&
      spriteset._emcc_lg_lastM === margin
    ) {
      return;
    }
    spriteset._emcc_lg_lastZoom = z;
    spriteset._emcc_lg_lastW = w;
    spriteset._emcc_lg_lastH = h;
    spriteset._emcc_lg_lastM = margin;

    try {
      for (const id in spriteset.layerGraphics) {
        const spr = spriteset.layerGraphics[id];
        if (!spr) continue;

        // Only tiling layers need explicit bounds.
        if (typeof TilingSprite !== "undefined" && spr instanceof TilingSprite) {
          if (typeof spr.move === "function") {
            spr.move(-margin, -margin, w, h);
          } else {
            spr.x = -margin;
            spr.y = -margin;
            spr.width = w;
            spr.height = h;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  };

  EMCC.patchGalvLayerGraphicsCompatibility = function () {
    if (!EMCC.isGalvLayerGraphicsInstalled()) return;

    // Wrap createLayerGraphics to apply sizing after (re)creation.
    const wrapCreate = function (proto, label) {
      if (!proto) return;
      const fn = proto.createLayerGraphics;
      if (typeof fn !== "function" || fn._emcc_lg_wrap) return;

      proto.createLayerGraphics = function () {
        const r = fn.apply(this, arguments);
        EMCC._lgFit(this);
        return r;
      };
      proto.createLayerGraphics._emcc_lg_wrap = true;
    };

    wrapCreate(typeof Spriteset_Map !== "undefined" ? Spriteset_Map.prototype : null, "map");
    wrapCreate(typeof Spriteset_Battle !== "undefined" ? Spriteset_Battle.prototype : null, "battle");

    // Also apply continuously (zoom can change dynamically).
    if (typeof Spriteset_Map !== "undefined" && Spriteset_Map.prototype.update) {
      const _update = Spriteset_Map.prototype.update;
      if (!_update._emcc_lg_upd) {
        Spriteset_Map.prototype.update = function () {
          _update.apply(this, arguments);
          EMCC._lgFit(this);
        };
        Spriteset_Map.prototype.update._emcc_lg_upd = true;
      }
    }

    if (typeof Spriteset_Battle !== "undefined" && Spriteset_Battle.prototype.update) {
      const _updateB = Spriteset_Battle.prototype.update;
      if (!_updateB._emcc_lg_upd) {
        Spriteset_Battle.prototype.update = function () {
          _updateB.apply(this, arguments);
          EMCC._lgFit(this);
        };
        Spriteset_Battle.prototype.update._emcc_lg_upd = true;
      }
    }
  };


  

  

  // --------------------------------------------------------------------------
  // GALV_MessageBusts compatibility
  //
  // Your current setting:
  //  - Bust Priority = 1 (busts are attached to Window_Message) -> NOT affected by map zoom.
  //
  // Safety:
  //  - If Bust Priority = 0 (busts are attached to Spriteset), SRD zoom would
  //    scale/move them. This patch neutralizes the parent zoom for bust sprites
  //    only in prio=0 mode.
  // --------------------------------------------------------------------------
  EMCC.isGalvMessageBustsInstalled = function () {
    return !!(typeof Imported !== "undefined" && Imported.Galv_MessageBusts);
  };

  EMCC.patchGalvMessageBustsZoom = function () {
    if (!EMCC.isGalvMessageBustsInstalled()) return;
    if (typeof Galv === "undefined" || !Galv.MB) return;

    // Only prio=0 busts live on Spriteset_Base.
    if (Galv.MB.prio !== 0) return;

    if (typeof Sprite_GalvBust === "undefined" || !Sprite_GalvBust.prototype) return;

    const _control = Sprite_GalvBust.prototype.controlBitmap;
    if (typeof _control !== "function" || _control._emcc_zoomFix) return;

    Sprite_GalvBust.prototype.controlBitmap = function () {
      _control.apply(this, arguments);

      // Only when the bust is attached to a Spriteset (prio=0 mode).
      const p = this.parent;
      if (!p) return;

      // Spriteset_Map and Spriteset_Battle inherit Spriteset_Base.
      if (typeof Spriteset_Base !== "undefined" && !(p instanceof Spriteset_Base)) return;

      const pz =
        p.scale && _isNumber(p.scale.x) && p.scale.x > 0 ? p.scale.x : EMCC.screenZoomScale();
      if (!_isNumber(pz) || pz <= 0 || Math.abs(pz - 1) < 0.0001) return;

      // IMPORTANT: controlBitmap sets scale.x for mirroring; it doesn't reliably
      // set scale.y every frame. Reset to a stable baseline before neutralizing.
      const baseScaleY = _isNumber(this._emcc_bustBaseScaleY) ? this._emcc_bustBaseScaleY : 1;
      if (!this._emcc_bustBaseScaleY) this._emcc_bustBaseScaleY = 1;

      const desiredX = this.x;
      const desiredY = this.y;

      // Neutralize parent zoom so final screen position remains desiredX/Y.
      this.x = (desiredX - (p.x || 0)) / pz;
      this.y = (desiredY - (p.y || 0)) / pz;

      // Neutralize parent zoom so final on-screen size stays constant.
      // Preserve mirroring (scale.x sign).
      const sx = this.scale && _isNumber(this.scale.x) ? this.scale.x : 1;
      if (this.scale) {
        this.scale.x = sx / pz;
        this.scale.y = baseScaleY / pz;
      }
    };

    Sprite_GalvBust.prototype.controlBitmap._emcc_zoomFix = true;
  };

// --------------------------------------------------------------------------
  // Scene_Map safety net:
  // Some stacks override spriteset update hooks in unusual orders. This keeps
  // pictures and GALV layers synced every frame regardless of hook order.
  // --------------------------------------------------------------------------
  EMCC.patchSceneMapSafetyNet = function () {
    if (typeof Scene_Map === "undefined" || !Scene_Map.prototype) return;
    const _update = Scene_Map.prototype.update;
    if (typeof _update !== "function" || _update._emcc_camCompat) return;

    Scene_Map.prototype.update = function () {
      _update.apply(this, arguments);

      const ss = this._spriteset;
      if (ss) {
        EMCC.syncMapZoomWithScreen();
        EMCC.ensurePictureLayer(ss);
        EMCC.hideScenePictureContainerIfDuplicate(this);
        EMCC._lgFit(ss);
      }

      // Hide Scene-level picture duplicates (SRD pics mode overlay).
      EMCC.hideScenePictureContainerIfDuplicate(this);
    };

    Scene_Map.prototype.update._emcc_camCompat = true;
  };

// --------------------------------------------------------------------------
  // Apply patches (order matters)
  // --------------------------------------------------------------------------
  EMCC.patchSpritesetCreatePicturesSafety();
  EMCC.patchCreateWeatherField3Safety();
  EMCC.patchSRDPicturesCompatibility();
  EMCC.patchSpritesetZoomSync();
  EMCC.patchMogWeatherZoomFit();
  EMCC.patchGalvLayerGraphicsCompatibility();
  EMCC.patchGalvMessageBustsZoom();
  EMCC.patchSpritePictureLockScale();
  EMCC.patchSceneMapSafetyNet();

  // Final sync on boot
  EMCC.syncMapZoomWithScreen();
})();