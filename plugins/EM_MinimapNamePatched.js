//=============================================================================
// EM_MinimapNamePatched.js
//=============================================================================
/*:
 * @plugindesc v1.1.0 Patch: clamp UPP_MINIMAP "Custom Name" (NAME_DISPLAY) window to minimap viewport + force minimap position TOPRIGHT (X -16, Y +16).ndow to minimap viewport when minimap is locked (e.g. 320x180).
 * @author Faiz Syihab
 *
 * @param Max Viewport Width
 * @type number
 * @min 32
 * @desc Maximum viewport width (px) for minimap on large maps.
 * @default 320
 *
 * @param Max Viewport Height
 * @type number
 * @min 32
 * @desc Maximum viewport height (px) for minimap on large maps.
 * @default 180
 *
 * @help
 * Requires: UPP_MINIMAP.js (place this plugin BELOW it)
 *
 * If the minimap is locked to a fixed viewport (ex: 320x180) on large maps,
 * UPP's Custom Name window can still size/position itself using full-map
 * pixels, causing it to overflow/misalign.
 *
 * This patch detects viewport mode and makes NAME_DISPLAY follow the viewport
 * width/height for both sizing and positioning.
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_MinimapNamePatched";
  const P = PluginManager.parameters(PLUGIN_NAME);

  const MAX_W = Math.max(32, Number(P["Max Viewport Width"] || 320));
  const MAX_H = Math.max(32, Number(P["Max Viewport Height"] || 180));
  // Force minimap anchor: TOPRIGHT with offsets (X -16, Y +16)
  const ANCHOR_TOPRIGHT = true;
  const OFFSET_RIGHT = 16; // px from right edge
  const OFFSET_TOP = 16;   // px from top edge


  if (typeof NAME_DISPLAY === "undefined") {
    console.warn(
      `${PLUGIN_NAME}: NAME_DISPLAY not found. Place this plugin BELOW UPP_MINIMAP.js.`,
    );
    return;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function _emApplyTopRightGlobals(viewW, viewH) {
    if (!ANCHOR_TOPRIGHT) return;
    if (typeof Graphics === "undefined") return;

    const gw = Number(Graphics.boxWidth || 0);
    const gh = Number(Graphics.boxHeight || 0);

    const effW = Math.max(1, Math.floor(viewW));
    const effH = Math.max(1, Math.floor(viewH));

    // X: right aligned with -16 offset; Y: +16 from top.
    window._pminiMap_X = Math.floor(gw - effW - OFFSET_RIGHT);
    window._pminiMap_Y = Math.floor(OFFSET_TOP);

    // Safety clamp in case of tiny screens.
    window._pminiMap_X = clamp(window._pminiMap_X, 0, Math.max(0, gw - effW));
    window._pminiMap_Y = clamp(window._pminiMap_Y, 0, Math.max(0, gh - effH));
  }

  // Patch Scene_Map.createMinimap so all minimap windows follow TOPRIGHT anchor.
  if (typeof Scene_Map !== "undefined" && Scene_Map.prototype.createMinimap) {
    const _SceneMap_createMinimap = Scene_Map.prototype.createMinimap;
    Scene_Map.prototype.createMinimap = function () {
      _SceneMap_createMinimap.call(this);

      // Use clamped viewport size (ex: 320x180) to compute anchor position.
      const { fullW, fullH } = fullPx();
      const viewW = Math.min(fullW, MAX_W);
      const viewH = Math.min(fullH, MAX_H);

      _emApplyTopRightGlobals(viewW, viewH);

      // Refresh all related windows if they exist.
      if (this._mmBorderWindow && this._mmBorderWindow.refresh) this._mmBorderWindow.refresh();
      if (this._miniMap && this._miniMap.refresh) this._miniMap.refresh();
      if (this._playerDisplay && this._playerDisplay.refresh) this._playerDisplay.refresh();
      if (this._mmNameWindow && this._mmNameWindow.refresh) this._mmNameWindow.refresh();
    };
  }


  function fullPx() {
    const scale = Number(window._pminiMap_Width || 0);
    const mw = $dataMap ? Number($dataMap.width || 0) : 0;
    const mh = $dataMap ? Number($dataMap.height || 0) : 0;
    return {
      scale,
      fullW: Math.max(1, Math.floor(scale * mw)),
      fullH: Math.max(1, Math.floor(scale * mh)),
    };
  }

  function viewportPx() {
    const mm = window.$miniMapWindow;
    if (mm && (mm._emScrollMode === true || (mm.width > 0 && mm.height > 0))) {
      return {
        viewW: Math.max(1, Math.floor(Number(mm.width || 0))),
        viewH: Math.max(1, Math.floor(Number(mm.height || 0))),
      };
    }
    const { fullW, fullH } = fullPx();
    return { viewW: Math.min(fullW, MAX_W), viewH: Math.min(fullH, MAX_H) };
  }

  function isViewportMode() {
    const mm = window.$miniMapWindow;
    if (mm && mm._emScrollMode === true) return true;
    const { fullW, fullH } = fullPx();
    return fullW > MAX_W || fullH > MAX_H;
  }

  function getMapName() {
    const updated = String(window.$mm_updatedMapName || "");
    if (
      typeof checkMapNote === "function" &&
      checkMapNote("mm_areaname:") === true &&
      updated === "" &&
      $dataMap &&
      $dataMap.note
    ) {
      const m = $dataMap.note.match(/<mm_areaname: (.*)>/);
      return (m && m[1]) || "";
    }
    return updated;
  }

  // Cache originals
  const _refresh = NAME_DISPLAY.prototype.refresh;
  const _updateLocation = NAME_DISPLAY.prototype.updateLocation;

  NAME_DISPLAY.prototype.refresh = function () {
    if (!isViewportMode()) {
      _refresh.call(this);
      return;
    }

    const pad = Number(window._minimapNamePadding || 4);
    const { viewW, viewH } = viewportPx();

    // Clamp width to viewport.
    this.width = Math.max(1, Math.floor(viewW + pad * 2));

    // Position using viewport dims.
    this._emUpdateLocationViewport(String(window._minimapNameLocation || "BELOW"), viewW, viewH);

    // Redraw using viewport width (not full map width).
    this.createContents();
    this.contents.clear();

    const bg = String(window._minimapNameBGColor || "rgba(0, 0, 0, 0.5)");
    const color = String(window._minimapNameColor || "#ffffff");
    const size = Number(window._minimapNameSize || 24);

    this.contents.fillRect(0, 0, viewW, this.contents.height, bg);
    this.changeTextColor(color);
    this.contents.fontSize = size;

    const name = getMapName();
    this.contents.drawText(
      name,
      0,
      0,
      Math.max(1, viewW - pad),
      this.lineHeight(),
      "center",
    );

    if (String(window._startMapHidden || "false") === "true") this.hide();
  };

  NAME_DISPLAY.prototype.updateLocation = function (sect) {
    if (!isViewportMode()) {
      _updateLocation.call(this, sect);
      return;
    }
    const { viewW, viewH } = viewportPx();
    this._emUpdateLocationViewport(String(sect || "BELOW"), viewW, viewH);
  };

  NAME_DISPLAY.prototype._emUpdateLocationViewport = function (sect, viewW, viewH) {
    const pad = Number(window._minimapNamePadding || 4);
    const RES_X =
      Number(window._pminiMap_X || 0) + Number(window._minimapNameXOffset || 0);
    const RES_Y =
      Number(window._pminiMap_Y || 0) + Number(window._minimapNameYOffset || 0);

    const s = String(sect || "BELOW").toUpperCase();

    const yTop = RES_Y;
    const yMid = RES_Y + viewH / 2 - this.height / 2 - pad / 2;
    const yBottom = RES_Y + viewH - this.height - pad / 2;
    const yAbove = RES_Y - this.height - pad / 2;
    const yBelow = RES_Y + viewH - pad / 2;

    const xCenter = RES_X - pad / 2;
    const xRightOutside = RES_X + viewW + pad * 2 - pad / 2;
    const xLeftOutside = RES_X - this.width - pad / 2;

    switch (s) {
      case "TOP":
        this.x = RES_X - pad;
        this.y = yTop;
        break;
      case "MID":
        this.x = xCenter;
        this.y = yMid;
        break;
      case "BOTTOM":
        this.x = xCenter;
        this.y = yBottom;
        break;

      case "ABOVE":
        this.x = xCenter;
        this.y = yAbove;
        break;
      case "BELOW":
        this.x = xCenter;
        this.y = yBelow;
        break;

      case "TOPRIGHT":
        this.x = xRightOutside;
        this.y = yTop - pad / 2;
        break;
      case "MIDRIGHT":
        this.x = xRightOutside;
        this.y = yMid;
        break;
      case "BOTTOMRIGHT":
        this.x = xRightOutside;
        this.y = yBottom;
        break;
      case "ABOVERIGHT":
        this.x = xRightOutside;
        this.y = yAbove;
        break;
      case "BELOWRIGHT":
        this.x = xRightOutside;
        this.y = yBelow;
        break;

      case "TOPLEFT":
        this.x = xLeftOutside;
        this.y = yTop - pad / 2;
        break;
      case "MIDLEFT":
        this.x = xLeftOutside;
        this.y = yMid;
        break;
      case "BOTTOMLEFT":
        this.x = xLeftOutside;
        this.y = yBottom;
        break;
      case "ABOVELEFT":
        this.x = xLeftOutside;
        this.y = yAbove;
        break;
      case "BELOWLEFT":
        this.x = xLeftOutside;
        this.y = yBelow;
        break;

      default:
        this.x = xCenter;
        this.y = yBelow;
        break;
    }

    // Clamp to screen bounds (avoid runaway offsets).
    const maxX = Math.max(0, Graphics.boxWidth - this.width);
    const maxY = Math.max(0, Graphics.boxHeight - this.height);
    this.x = clamp(Math.floor(this.x), 0, maxX);
    this.y = clamp(Math.floor(this.y), 0, maxY);
  };
})();
