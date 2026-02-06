/*:
 * @plugindesc [v1.0.0] Patch: Make UPP_MINIMAP compatible with Eli_MapReveal + Eli_Book (fog-of-war aware minimap). 
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_MinimapEliPatch.js
 * ============================================================================
 * Purpose:
 * - Prevent UPP_MINIMAP from "spoiling" Eli_MapReveal fog-of-war by displaying
 *   covered tiles on the minimap.
 * - Dynamically updates the minimap as tiles are revealed/covered (player walk,
 *   events, script calls, etc).
 *
 * Requirements / Load Order:
 * 1) Eli_Book.js
 * 2) Eli_MapReveal.js
 * 3) UPP_MINIMAP.js
 * 4) EM_MinimapEliPatch.js   (THIS PLUGIN)
 *
 * Notes:
 * - Covered tiles are drawn using "Fog Tile Color".
 * - Tiles outside Eli_MapReveal covered regions are unaffected (always drawn).
 * - This patch is defensive: if Eli plugins are missing, it does nothing.
 * ============================================================================
 *
 * @param Fog Tile Color
 * @type string
 * @desc Fill color for covered tiles on the minimap.
 * @default rgba(0, 0, 0, 0.85)
 *
 * @param Fog Update Interval
 * @type number
 * @min 0
 * @desc Frames between fog checks. 0 = every frame. (Lower = more responsive, higher = cheaper)
 * @default 3
 */
(function() {
  "use strict";

  var Imported = window.Imported || (window.Imported = {});
  Imported.EM_MinimapEliPatch = true;

  // --- Early exits (no hard dependency flags in UPP_MINIMAP.js) ---
  if (typeof Window_Minimap === "undefined" || typeof Scene_Map === "undefined") {
    console.warn("EM_MinimapEliPatch: Window_Minimap/Scene_Map not found. Load after UPP_MINIMAP.js.");
    return;
  }

  var parameters = PluginManager.parameters("EM_MinimapEliPatch");
  var FOG_COLOR = String(parameters["Fog Tile Color"] || "rgba(0, 0, 0, 0.85)");
  var FOG_INTERVAL = Math.max(0, Number(parameters["Fog Update Interval"] || 3));

  function emIsEliFogActive() {
    try {
      if (!window.Imported || !Imported.Eli_MapReveal) return false;
      if (!window.Eli || !Eli.MapReveal) return false;
      if (!$gameMap || !$gameMap.isFogMap) return false;
      return !!$gameMap.isFogMap();
    } catch (e) {
      return false;
    }
  }

  function emEnsureMapRevealReady() {
    // Defensive: if fog map but data not prepared (rare order edge-case), attempt setup.
    try {
      if (!emIsEliFogActive()) return;
      if (!Eli.MapReveal.mapTileStatus || !Eli.MapReveal.getCoordinates) return;
      var st = Eli.MapReveal.mapTileStatus();
      if (!Array.isArray(st) && Eli.MapReveal.setup) {
        Eli.MapReveal.setup();
      }
    } catch (e) {
      // ignore
    }
  }

  function emDrawBaseMinimapTile(win, mapX, mapY, px, py, tileW) {
    // Mirror UPP_MINIMAP's tile-draw logic for a single tile.
    // Collision map draw
    try {
      if (window._pminiMap_useCM === "true") {
        if ($gameMap.checkPassage(mapX, mapY, 0x0f) === true) {
          win.contents.fillRect(px, py, tileW, tileW, window._pminiMap_PassColor);
        }
      }
      // Region overlay draw
      var rid = $gameMap.regionId(mapX, mapY);
      var color = window._mmRegionData ? window._mmRegionData[rid] : "NONE";
      if (color && color !== "NONE") {
        win.contents.fillRect(px, py, tileW, tileW, color);
      }
    } catch (e) {
      // ignore
    }
  }

  // --------------------------------------------------------------------------
  // Patch Window_Minimap.refresh: after base draw, apply fog overlay + cache.
  // --------------------------------------------------------------------------
  var _em_WinMinimap_refresh = Window_Minimap.prototype.refresh;
  Window_Minimap.prototype.refresh = function() {
    _em_WinMinimap_refresh.call(this);
    this._emFogLastMapId = null;
    this._emFogCache = null;
    this._emFogCoords = null;
    this._emFogCooldown = 0;
    this.emApplyFogSnapshot();
  };

  Window_Minimap.prototype.emApplyFogSnapshot = function() {
    if (!this || !this.contents) return;
    if (!emIsEliFogActive()) return;

    emEnsureMapRevealReady();

    var coords = Eli.MapReveal.getCoordinates ? Eli.MapReveal.getCoordinates() : null;
    var status = Eli.MapReveal.mapTileStatus ? Eli.MapReveal.mapTileStatus() : null;
    if (!Array.isArray(coords) || !Array.isArray(status)) return;

    this._emFogLastMapId = $gameMap.mapId();
    this._emFogCoords = coords;
    this._emFogCache = status.slice();

    var tileW = window._pminiMap_Width;
    for (var i = 0; i < coords.length; i++) {
      if (status[i] === true) {
        var xy = String(coords[i]).split(",");
        var mx = Number(xy[0] || 0);
        var my = Number(xy[1] || 0);
        var px = tileW * mx;
        var py = tileW * my;
        this.contents.fillRect(px, py, tileW, tileW, FOG_COLOR);
      }
    }
  };

  Window_Minimap.prototype.emUpdateFog = function() {
    if (!this || !this.contents) return;
    if (!this.visible) return;
    if (!emIsEliFogActive()) return;

    // Map changed? rebuild cache from scratch.
    if (this._emFogLastMapId !== $gameMap.mapId() || !Array.isArray(this._emFogCache)) {
      this.emApplyFogSnapshot();
      return;
    }

    // Throttle
    if (FOG_INTERVAL > 0) {
      if (this._emFogCooldown > 0) {
        this._emFogCooldown--;
        return;
      }
      this._emFogCooldown = FOG_INTERVAL;
    }

    var coords = this._emFogCoords || (Eli.MapReveal.getCoordinates ? Eli.MapReveal.getCoordinates() : null);
    var status = Eli.MapReveal.mapTileStatus ? Eli.MapReveal.mapTileStatus() : null;
    if (!Array.isArray(coords) || !Array.isArray(status)) return;

    var tileW = window._pminiMap_Width;

    // Compare-by-index (Eli_MapReveal guarantees status aligns with coordinates list)
    var len = Math.min(status.length, this._emFogCache.length, coords.length);
    for (var i = 0; i < len; i++) {
      var prev = this._emFogCache[i];
      var now = status[i];
      if (prev === now) continue;

      this._emFogCache[i] = now;

      var xy = String(coords[i]).split(",");
      var mx = Number(xy[0] || 0);
      var my = Number(xy[1] || 0);
      var px = tileW * mx;
      var py = tileW * my;

      // Reset tile then redraw base, then (optionally) overlay fog
      this.contents.clearRect(px, py, tileW, tileW);
      emDrawBaseMinimapTile(this, mx, my, px, py, tileW);

      if (now === true) {
        this.contents.fillRect(px, py, tileW, tileW, FOG_COLOR);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Drive fog updates from Scene_Map.update (covers player walk + event reveals).
  // --------------------------------------------------------------------------
  var _em_SceneMap_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _em_SceneMap_update.call(this);
    try {
      if (window.$miniMapWindow && $miniMapWindow.emUpdateFog) {
        $miniMapWindow.emUpdateFog();
      }
    } catch (e) {
      // ignore
    }
  };

})();
