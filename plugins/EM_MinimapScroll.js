//=============================================================================
// EM_MinimapScroll.js
//=============================================================================
/*:
 * @plugindesc v1.0.1 Smooth-scroll minimap viewport for large maps in UPP_MINIMAP (prevents auto-zoom/fit). Also clamps and repositions Custom Name window to viewport.
 * @author Faiz Syihab
 *
 * @param Max Viewport Width
 * @type number
 * @min 32
 * @desc Viewport width in pixels for large minimaps.
 * @default 320
 *
 * @param Max Viewport Height
 * @type number
 * @min 32
 * @desc Viewport height in pixels for large minimaps.
 * @default 180
 *
 * @param Smooth Speed
 * @type number
 * @decimals 3
 * @min 0.001
 * @desc Lerp factor per frame for smooth scrolling (0.05 = smooth, 0.2 = snappy).
 * @default 0.08
 *
 * @param Disable Zoom When Scrolling
 * @type boolean
 * @desc If true, keep viewport behavior stable if the UPP zoom key/button is used while scroll-mode is active.
 * @default true
 *
 * @help
 * ============================================================================
 * Requires
 * ============================================================================
 * - UPP_MINIMAP.js loaded ABOVE this plugin.
 *
 * ============================================================================
 * What this plugin does
 * ============================================================================
 * If the minimap's full pixel size exceeds a threshold (default 320x180),
 * the minimap switches to a fixed viewport and scrolls smoothly instead of
 * zooming/fitting the whole map.
 *
 * It also clamps/repositions UPP's "Custom Name" (NAME_DISPLAY) window so it
 * matches the viewport size and stays aligned correctly.
 *
 * ============================================================================
 * Recommended Placement
 * ============================================================================
 * BELOW: UPP_MINIMAP.js
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * v1.0.1 - Custom Name window now uses viewport width/height for sizing and
 *          location (TOP/MID/BOTTOM) in scroll mode.
 */
//=============================================================================

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_MinimapScroll";
  const P = PluginManager.parameters(PLUGIN_NAME);

  const MAX_W = Math.max(32, Number(P["Max Viewport Width"] || 320));
  const MAX_H = Math.max(32, Number(P["Max Viewport Height"] || 180));
  const SMOOTH = Math.max(0.001, Number(P["Smooth Speed"] || 0.08));
  const DISABLE_ZOOM =
    String(P["Disable Zoom When Scrolling"] || "true") === "true";

  const hasUPP = () =>
    typeof Window_Minimap !== "undefined" &&
    typeof PLAYER_LOCATOR !== "undefined" &&
    typeof BORDER_WINDOW !== "undefined" &&
    typeof NAME_DISPLAY !== "undefined";

  if (!hasUPP()) {
    console.warn(
      `${PLUGIN_NAME}: UPP_MINIMAP.js not detected. Place EM_MinimapScroll below UPP_MINIMAP.`,
    );
    return;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function getScale() {
    return Number(window._pminiMap_Width || 0); // pixels per tile
  }

  function getFullPx() {
    const scale = getScale();
    const mw = $dataMap ? Number($dataMap.width || 0) : 0;
    const mh = $dataMap ? Number($dataMap.height || 0) : 0;
    return {
      fullW: Math.max(1, Math.floor(scale * mw)),
      fullH: Math.max(1, Math.floor(scale * mh)),
      mw,
      mh,
      scale,
    };
  }

  function getViewportPx() {
    const { fullW, fullH } = getFullPx();
    return {
      viewW: Math.min(fullW, MAX_W),
      viewH: Math.min(fullH, MAX_H),
      fullW,
      fullH,
    };
  }

  function isScrollMode() {
    const { fullW, fullH } = getFullPx();
    return fullW > MAX_W || fullH > MAX_H;
  }

  // Cache originals
  const _MM_refresh = Window_Minimap.prototype.refresh;
  const _MM_update = Window_Minimap.prototype.update;

  const _PL_refresh = PLAYER_LOCATOR.prototype.refresh;
  const _PL_update = PLAYER_LOCATOR.prototype.update;

  const _BW_refresh = BORDER_WINDOW.prototype.refresh;

  const _ND_refresh = NAME_DISPLAY.prototype.refresh;
  const _ND_updateLocation = NAME_DISPLAY.prototype.updateLocation;

  // ---------------------------------------------------------------------------
  // Window_Minimap (background)
  // ---------------------------------------------------------------------------
  Window_Minimap.prototype.refresh = function () {
    if (!isScrollMode()) {
      this._emScrollMode = false;
      this._emFullBitmap = null;
      _MM_refresh.call(this);
      return;
    }

    this._emScrollMode = true;

    const { scale, mw, mh } = getFullPx();
    const { viewW, viewH, fullW, fullH } = getViewportPx();

    this.x = Number(window._pminiMap_X || 0);
    this.y = Number(window._pminiMap_Y || 0);
    this.width = viewW;
    this.height = viewH;

    // Full background bitmap
    this._emFullBitmap = new Bitmap(fullW, fullH);
    this.contents = this._emFullBitmap;
    if (this._windowContentsSprite)
      this._windowContentsSprite.bitmap = this.contents;

    this.contents.clear();

    const useCM = String(window._pminiMap_useCM || "true") === "true";
    const passColor = String(window._pminiMap_PassColor || "#0099cc");
    const regionData = window._mmRegionData || [];

    for (let x = 0; x < mw; x++) {
      for (let y = 0; y < mh; y++) {
        const px = scale * x;
        const py = scale * y;

        if (useCM) {
          if ($gameMap.checkPassage(x, y, 0x0f) === true) {
            this.contents.fillRect(px, py, scale, scale, passColor);
          }
        }
        const rid = $gameMap.regionId(x, y);
        const rcol = regionData[rid];
        if (rcol && rcol !== "NONE") {
          this.contents.fillRect(px, py, scale, scale, rcol);
        }
      }
    }

    this._emOriginX = Number(this.origin.x || 0);
    this._emOriginY = Number(this.origin.y || 0);

    const maxOx = Math.max(0, fullW - viewW);
    const maxOy = Math.max(0, fullH - viewH);
    this.origin.x = clamp(this._emOriginX, 0, maxOx);
    this.origin.y = clamp(this._emOriginY, 0, maxOy);
    this._emOriginX = this.origin.x;
    this._emOriginY = this.origin.y;

    if (String(window._startMapHidden || "false") === "true") this.hide();
  };

  Window_Minimap.prototype.update = function () {
    if (!this._emScrollMode) {
      _MM_update.call(this);
      return;
    }

    const { scale } = getFullPx();
    const { viewW, viewH, fullW, fullH } = getViewportPx();

    const px = ($gamePlayer.x + 0.5) * scale;
    const py = ($gamePlayer.y + 0.5) * scale;

    const targetOx = clamp(px - viewW / 2, 0, Math.max(0, fullW - viewW));
    const targetOy = clamp(py - viewH / 2, 0, Math.max(0, fullH - viewH));

    this._emOriginX = lerp(this._emOriginX, targetOx, SMOOTH);
    this._emOriginY = lerp(this._emOriginY, targetOy, SMOOTH);

    this.origin.x = this._emOriginX;
    this.origin.y = this._emOriginY;
  };

  // ---------------------------------------------------------------------------
  // PLAYER_LOCATOR (overlay)
  // ---------------------------------------------------------------------------
  PLAYER_LOCATOR.prototype.refresh = function () {
    if (!isScrollMode()) {
      this._emScrollMode = false;
      _PL_refresh.call(this);
      return;
    }

    this._emScrollMode = true;

    const { viewW, viewH } = getViewportPx();

    this.x = Number(window._pminiMap_X || 0);
    this.y = Number(window._pminiMap_Y || 0);
    this.width = viewW;
    this.height = viewH;

    this.createContents();
    this._emDrawOverlay();

    if (String(window._startMapHidden || "false") === "true") this.hide();
  };

  PLAYER_LOCATOR.prototype._emDrawOverlay = function () {
    if (!this.contents) return;
    this.contents.clear();

    const { scale } = getFullPx();
    const minimap = window.$miniMapWindow;
    const ox =
      minimap && minimap._emScrollMode ? Number(minimap.origin.x || 0) : 0;
    const oy =
      minimap && minimap._emScrollMode ? Number(minimap.origin.y || 0) : 0;

    const showPlayer = String(window._pminiMap_showPlayer || "true") === "true";
    const playerColor = String(window._pminiMap_playerColor || "#ffff00");
    const playerCircle = String(window._mm_playerCircles || "true") === "true";

    const showEvents = String(window._mm_showEvents || "true") === "true";
    const eventCircle = String(window._mm_eventCircles || "true") === "true";

    if (showPlayer) {
      const px = $gamePlayer.x * scale - ox;
      const py = $gamePlayer.y * scale - oy;
      if (playerCircle) {
        this.contents.drawCircle(
          px + scale / 2,
          py + scale / 2,
          scale / 2,
          playerColor,
        );
      } else {
        this.contents.fillRect(px, py, scale, scale, playerColor);
      }
    }

    if (showEvents && Array.isArray(window._minimapEvents)) {
      for (let i = 0; i < window._minimapEvents.length; i++) {
        const ev = window._minimapEvents[i];
        if (!ev) continue;

        const ex = Number(ev.x || 0) * scale - ox;
        const ey = Number(ev.y || 0) * scale - oy;
        const col = String(ev.color || "rgba(0,0,0,0)");

        // Beacon support
        if (ev.beacon === true) {
          this.contents.paintOpacity = Number(ev.beaconOpac || 255);
          this.contents.drawCircle(
            ex + scale / 2,
            ey + scale / 2,
            Number(ev.beaconBlink || 0),
            col,
          );
          this.contents.paintOpacity = 255;

          ev.beaconBlink =
            Number(ev.beaconBlink || 0) + Number(ev.beaconSpeed || 0.2);
          ev.beaconOpac =
            Number(ev.beaconOpac || 255) - Number(ev.beaconFadeSpeed || 4);
          ev.beaconOpac = Math.min(Math.max(ev.beaconOpac, 0), 255);
          ev.beaconCounter = Number(ev.beaconCounter || 0) + 1;

          const delay = Number(ev.beaconDelay || 120);
          if (ev.beaconCounter >= delay) {
            ev.beaconCounter = 0;
            ev.beaconBlink = 0;
            ev.beaconOpac = 255;
          }
        }

        if (eventCircle) {
          this.contents.drawCircle(
            ex + scale / 2,
            ey + scale / 2,
            scale / 2,
            col,
          );
        } else {
          this.contents.fillRect(ex, ey, scale, scale, col);
        }
      }
    }
  };

  PLAYER_LOCATOR.prototype.update = function () {
    if (!this._emScrollMode) {
      _PL_update.call(this);
      return;
    }
    this._emDrawOverlay();
  };

  // ---------------------------------------------------------------------------
  // BORDER_WINDOW clamp to viewport
  // ---------------------------------------------------------------------------
  BORDER_WINDOW.prototype.refresh = function () {
    if (!isScrollMode()) {
      _BW_refresh.call(this);
      return;
    }

    const border = Number(window._miniBorderSize || 0);
    const { viewW, viewH } = getViewportPx();

    this.x = Number(window._pminiMap_X || 0) - border;
    this.y = Number(window._pminiMap_Y || 0) - border;
    this.width = viewW + border * 2;
    this.height = viewH + border * 2;

    this.createContents();
    const bg = String(window._pminiMap_ImpassColor || "#005599");
    this.contents.fillRect(0, 0, this.contents.width, this.contents.height, bg);
  };

  // ---------------------------------------------------------------------------
  // NAME_DISPLAY (Custom Name) clamp + position to viewport
  // ---------------------------------------------------------------------------
  NAME_DISPLAY.prototype.refresh = function () {
    _ND_refresh.call(this);
    if (!isScrollMode()) return;

    const pad = Number(window._minimapNamePadding || 4);
    const { viewW, viewH } = getViewportPx();

    const desiredWidth = viewW + pad * 2;
    if (this.width !== desiredWidth) {
      this.width = desiredWidth;
      // Rebuild and redraw with UPP logic
      _ND_refresh.call(this);
    }

    const sect = window._minimapNameLocation || "TOP";
    this.updateLocation(sect, viewW, viewH);
  };

  NAME_DISPLAY.prototype.updateLocation = function (sect, viewW, viewH) {
    if (!isScrollMode()) {
      _ND_updateLocation.call(this, sect);
      return;
    }

    const pad = Number(window._minimapNamePadding || 4);
    const RES_X =
      Number(window._pminiMap_X || 0) + Number(window._minimapNameXOffset || 0);
    const RES_Y =
      Number(window._pminiMap_Y || 0) + Number(window._minimapNameYOffset || 0);

    switch (String(sect || "TOP").toUpperCase()) {
      case "TOP":
        this.x = RES_X - pad;
        this.y = RES_Y;
        break;
      case "MID":
        this.x = RES_X - pad / 2;
        this.y = RES_Y + viewH / 2 - this.height / 2 - pad / 2;
        break;
      case "BOTTOM":
      default:
        this.x = RES_X - pad / 2;
        this.y = RES_Y + viewH - this.height + pad / 2;
        break;
    }
  };

  // ---------------------------------------------------------------------------
  // Optional: keep viewport stable if zoom input changes UPP globals
  // ---------------------------------------------------------------------------
  if (DISABLE_ZOOM) {
    const _SM_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
      _SM_update.call(this);
      if (!isScrollMode()) return;

      if (window.$miniMapWindow && window.$miniMapWindow._emScrollMode) {
        window.$miniMapWindow.refresh();
        if (window.$miniMapPlayer) window.$miniMapPlayer.refresh();
        if (window.$miniMapBorder) window.$miniMapBorder.refresh();
        if (window.$miniMapName) window.$miniMapName.refresh();
      }
    };
  }
})();
