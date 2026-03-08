//=============================================================================
// EM_MinimapMQWPatch.js
//=============================================================================
/*:
 * @plugindesc v1.0.1 [EM] Patch: If UPP Minimap + YEP_X_MapQuestWindow are present, move the Map Quest Window to the left of the minimap (configurable offsets). 
 * @author Faiz Syihab
 *
 * @param Enable Patch
 * @type boolean
 * @on Enable
 * @off Disable
 * @default true
 *
 * @param Relative X
 * @type number
 * @desc Extra X offset applied after anchoring MQW to the left of the minimap. Default -40 = 40px further left.
 * @default -40
 *
 * @param Relative Y
 * @type number
 * @desc Extra Y offset applied after anchoring MQW to the minimap Y.
 * @default 0
 *
 * @param Only When Minimap Visible
 * @type boolean
 * @on Yes
 * @off No
 * @desc If true, only reposition MQW when minimap window is visible. If false, uses minimap position even when hidden.
 * @default true
 *
 * @param Clamp To Screen
 * @type boolean
 * @on Yes
 * @off No
 * @desc If true, clamp MQW inside screen bounds (after scaling).
 * @default true
 *
 * @help
 * ============================================================================
 * EM_MinimapMQWPatch.js
 * ============================================================================
 * Purpose
 * - When both UPP_MINIMAP and YEP_X_MapQuestWindow are active on the map, this
 *   plugin moves the Map Quest Window to sit on the LEFT side of the minimap.
 *
 * Default Behavior
 * - MQW is anchored so its right edge aligns to minimap's left edge, then an
 *   extra Relative X is applied (default -40).
 * - MQW Y is aligned to minimap Y, then Relative Y applied.
 *
 * Requirements / Load Order (recommended)
 *  1) YEP_QuestJournal.js
 *  2) YEP_X_MapQuestWindow.js
 *  3) UPP_MINIMAP.js
 *  4) EM_MinimapScroll.js / EM_MinimapNamePatched.js / EM_MinimapEliPatch.js / EM_MinimapOptions.js (your minimap stack)
 *  5) EM_MinimapMQWPatch.js  (THIS PLUGIN)
 *
 * Notes
 * - This patch is defensive: if MQW or UPP minimap isn't present, it does nothing.
 * - Compatible with EM minimap patches by using $miniMapWindow + global _pminiMap_X/Y.
 * ============================================================================
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_MinimapMQWPatch";
  const P = PluginManager.parameters(PLUGIN_NAME);

  const ENABLED = String(P["Enable Patch"] || "true") === "true";
  const REL_X = Number(P["Relative X"] || -40);
  const REL_Y = Number(P["Relative Y"] || 0);
  const ONLY_WHEN_MINIMAP_VISIBLE =
    String(P["Only When Minimap Visible"] || "true") === "true";
  const CLAMP_TO_SCREEN = String(P["Clamp To Screen"] || "true") === "true";

  if (!ENABLED) return;

  const hasMQW = () =>
    typeof Imported !== "undefined" &&
    !!Imported.YEP_X_MapQuestWindow &&
    typeof Window_MapActiveQuest !== "undefined" &&
    typeof Scene_Map !== "undefined";

  const hasMinimapGlobals = () =>
    typeof window.$miniMapWindow !== "undefined" ||
    typeof $miniMapWindow !== "undefined" ||
    typeof window._pminiMap_X !== "undefined";

  if (!hasMQW()) {
    console.warn(
      `${PLUGIN_NAME}: YEP_X_MapQuestWindow not detected. Load this plugin below YEP_X_MapQuestWindow.js.`,
    );
    return;
  }

  if (!hasMinimapGlobals()) {
    console.warn(
      `${PLUGIN_NAME}: UPP minimap globals not detected yet. Ensure UPP_MINIMAP.js is installed and this plugin is below it.`,
    );
    // Don't hard-exit; minimap may be created later.
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function emGetMinimapWindow() {
    return (
      window.$miniMapWindow ||
      (typeof $miniMapWindow !== "undefined" ? $miniMapWindow : null)
    );
  }

  function emIsMinimapEffectivelyVisible(mm) {
    if (!mm) return false;
    if (!ONLY_WHEN_MINIMAP_VISIBLE) return true;
    return !!mm.visible;
  }

  function emGetMinimapAnchor(mm) {
    // Prefer actual window coords (already include EM anchor patches), fallback to globals.
    const x = mm ? Number(mm.x || 0) : Number(window._pminiMap_X || 0);
    const y = mm ? Number(mm.y || 0) : Number(window._pminiMap_Y || 0);

    // Prefer actual window width/height (viewport-aware in EM_MinimapScroll/NamePatched),
    // fallback to computed size for unpatched UPP.
    let w = mm ? Number(mm.width || 0) : 0;
    let h = mm ? Number(mm.height || 0) : 0;

    if ((!w || !h) && typeof window._pminiMap_Width !== "undefined") {
      const scale = Number(window._pminiMap_Width || 0);
      const mw = $dataMap ? Number($dataMap.width || 0) : 0;
      const mh = $dataMap ? Number($dataMap.height || 0) : 0;
      const border = Number(window._miniBorderSize || 0);
      w = scale * mw + border * 2;
      h = scale * mh + border * 2;
    }

    return { x, y, w, h };
  }

  function emGetDisplayedSize(win) {
    if (!win) return { dw: 0, dh: 0 };
    const sx = win.scale ? Number(win.scale.x || 1) : 1;
    const sy = win.scale ? Number(win.scale.y || 1) : 1;
    return {
      dw: Number(win.width || 0) * sx,
      dh: Number(win.height || 0) * sy,
      sx,
      sy,
    };
  }

  function emGetMQWBasePlacement(mqw) {
    // Replicates YEP_X_MapQuestWindow's initialize placement logic, so when minimap is
    // not visible/active we return to the "native" MQW position (including switch 105).
    if (!mqw) return null;
    if (typeof mqw.windowWidth !== "function") return null;
    if (typeof mqw.settings !== "function") return null;

    const width = Number(mqw.windowWidth() || mqw.width || 0);
    const x = $gameSwitches && $gameSwitches.value(105) ? 0 : Number(Graphics.boxWidth || 0) - width;

    let y = 0;
    try {
      y = Math.round(eval(mqw.settings("Y")));
    } catch (e) {
      y = Number(mqw.y || 0);
    }
    return { x, y };
  }

  function emDockOrRestoreMQW(scene) {
    if (!scene || !scene._activeQuestWindow) return;

    const mqw = scene._activeQuestWindow;
    const mm = emGetMinimapWindow();

    // If MQW isn't visible due to config/system, don't fight it.
    if (!mqw.visible) return;

    const shouldDock = emIsMinimapEffectivelyVisible(mm);

    if (!shouldDock) {
      // Restore to YEP's base placement (supports runtime switch 105 / Y setting).
      const base = emGetMQWBasePlacement(mqw);
      if (!base) return;
      if (mqw._emLastDocked) {
        mqw._emLastDocked = false;
        mqw._emLastDockX = null;
        mqw._emLastDockY = null;
      }
      if (mqw.x !== base.x) mqw.x = base.x;
      if (mqw.y !== base.y) mqw.y = base.y;
      return;
    }

    // ---- Dock mode ----
    const { x: mmX, y: mmY } = emGetMinimapAnchor(mm);
    const { dw: mqwW, dh: mqwH } = emGetDisplayedSize(mqw);

    // Anchor: MQW's right edge to minimap's left edge, then apply Relative offsets.
    let targetX = Math.round(mmX - mqwW + REL_X);
    let targetY = Math.round(mmY + REL_Y);

    if (CLAMP_TO_SCREEN && typeof Graphics !== "undefined") {
      const gw = Number(Graphics.boxWidth || 0);
      const gh = Number(Graphics.boxHeight || 0);
      targetX = clamp(targetX, 0, Math.max(0, gw - mqwW));
      targetY = clamp(targetY, 0, Math.max(0, gh - mqwH));
    }

    // Avoid needless assignment spam.
    if (mqw._emLastDockX !== targetX || mqw._emLastDockY !== targetY) {
      mqw._emLastDocked = true;
      mqw._emLastDockX = targetX;
      mqw._emLastDockY = targetY;
      mqw.x = targetX;
      mqw.y = targetY;
    }
  }

  // Ensure MQW docks after it is created.
  // YEP_X_MapQuestWindow creates MQW via Scene_Map.createMapQuestWindow()
  // and stores it on this._activeQuestWindow.
  const _createMapQuestWindow = Scene_Map.prototype.createMapQuestWindow;
  Scene_Map.prototype.createMapQuestWindow = function () {
    _createMapQuestWindow.call(this);
    emDockOrRestoreMQW(this);
  };

  // Keep it docked as minimap moves/refreshes.
  const _SceneMap_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _SceneMap_update.call(this);
    emDockOrRestoreMQW(this);
  };
})();
