//=============================================================================
// EM_MinimapCutsceneControl.js
//=============================================================================
/*:
 * @plugindesc v1.1.1 Force-hide minimap + MQW + MiniLabel during cutscene and restore previous state
 * @author Faiz Syihab
 *
 * @help
 * Plugin Commands:
 *   Cutscene true
 *   Cutscene false
 *
 * Behavior:
 * - Cutscene true:
 *     Temporarily hides:
 *       - Minimap sprite (if present on Scene_Map)
 *       - Map Quest Window (YEP_X_MapQuestWindow)
 *       - Event Mini Label (YEP_EventMiniLabel)
 *     While cutscene is active, this plugin keeps them hidden even if other code
 *     tries to show them.
 *
 * - Cutscene false:
 *     Restores each element to its previous state:
 *       - MQW: restores $gameSystem.isShowMapQuestWindow() if available
 *       - MiniLabel: restores $gameSystem.isShowEventMiniLabel() if available
 *       - Minimap: restores the cached sprite visibility (best-effort)
 *
 * Backward compatibility:
 * - Old command still accepted:
 *     DisableMinimapCutscene true/false
 *
 * Compatibility:
 * - UPP_MINIMAP.js / EM_MinimapScroll.js / EM_MinimapOptions.js
 * - YEP_X_MapQuestWindow.js
 * - YEP_EventMiniLabel.js
 *
 * Recommended placement: BELOW all minimap-related plugins.
 */

(() => {
  'use strict';

  const PLUGIN_NAME = 'EM_MinimapCutsceneControl';

  // Cutscene force-hide flag
  let _emForceCutsceneHide = false;

  // Previous states (restored when cutscene ends)
  let _emPrevMinimapVisible = null;

  // Prefer system flags when available (more correct than just window.visible)
  let _emPrevMQWSystemShow = null;        // $gameSystem.isShowMapQuestWindow()
  let _emPrevMiniLabelSystemShow = null;  // $gameSystem.isShowEventMiniLabel()

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function getMinimapSprite(scene) {
    if (!scene) return null;
    // Common names across minimap implementations/patches
    return scene._uppMiniMap || scene._miniMap || scene._minimap || null;
  }

  function getMapQuestWindow(scene) {
    if (!scene) return null;
    // YEP_X_MapQuestWindow uses Scene_Map._activeQuestWindow
    return (
      scene._activeQuestWindow ||
      scene._mapQuestWindow ||
      scene._mapQuest ||
      scene._mqwWindow ||
      scene._mqw ||
      null
    );
  }

  function setVisibleSafe(refObj, value) {
    if (!refObj) return;
    if (typeof refObj.visible === 'boolean') refObj.visible = value;
    if (typeof refObj.opacity === 'number') refObj.opacity = value ? 255 : 0;
    if (typeof refObj.contentsOpacity === 'number') {
      refObj.contentsOpacity = value ? 255 : 0;
    }
  }

  function restoreVisibleSafe(refObj, cachedValue) {
    if (!refObj) return;
    if (cachedValue === null) return;
    setVisibleSafe(refObj, !!cachedValue);
  }

  function hideAllMiniLabelsOnMap(scene) {
    if (!scene || !scene._spriteset) return;
    const spriteset = scene._spriteset;
    const list = spriteset._characterSprites;
    if (!list || !list.length) return;
    for (let i = 0; i < list.length; i++) {
      const sp = list[i];
      if (sp && sp._miniLabel) {
        sp._miniLabel.visible = false;
        if (typeof sp._miniLabel.contentsOpacity === 'number') sp._miniLabel.contentsOpacity = 0;
      }
    }
  }

  function restoreMiniLabelsRefresh(scene) {
    // YEP_EventMiniLabel refresh hook is on Scene_Map.refreshAllMiniLabels()
    if (!scene) return;
    if (typeof scene.refreshAllMiniLabels === 'function') {
      scene.refreshAllMiniLabels();
    } else if (scene._spriteset && scene._spriteset._characterSprites) {
      // Best-effort: refresh each sprite if available
      const list = scene._spriteset._characterSprites;
      for (let i = 0; i < list.length; i++) {
        const sp = list[i];
        if (sp && typeof sp.refreshMiniLabel === 'function') sp.refreshMiniLabel();
      }
    }
  }

  function forceHideCutsceneUI(scene) {
    const minimap = getMinimapSprite(scene);
    const mqw = getMapQuestWindow(scene);

    setVisibleSafe(minimap, false);
    setVisibleSafe(mqw, false);
    hideAllMiniLabelsOnMap(scene);
  }

  function setCutsceneFlag(flag) {
    const scene = SceneManager._scene;
    const minimap = getMinimapSprite(scene);
    const mqw = getMapQuestWindow(scene);

    if (flag) {
      _emForceCutsceneHide = true;

      // Cache minimap sprite visibility (best-effort)
      if (minimap && _emPrevMinimapVisible === null) {
        _emPrevMinimapVisible = !!minimap.visible;
      }

      // Cache + force-hide MQW through system flag when possible
      if (_emPrevMQWSystemShow === null && window.$gameSystem && typeof $gameSystem.isShowMapQuestWindow === 'function') {
        _emPrevMQWSystemShow = !!$gameSystem.isShowMapQuestWindow();
      }
      if (window.$gameSystem && typeof $gameSystem.setShowMapQuestWindow === 'function') {
        $gameSystem.setShowMapQuestWindow(false);
        if (typeof $gameSystem.refreshActiveQuestWindow === 'function') $gameSystem.refreshActiveQuestWindow();
      }
      setVisibleSafe(mqw, false);

      // Cache + force-hide MiniLabel through system flag when possible
      if (_emPrevMiniLabelSystemShow === null && window.$gameSystem && typeof $gameSystem.isShowEventMiniLabel === 'function') {
        _emPrevMiniLabelSystemShow = !!$gameSystem.isShowEventMiniLabel();
      }
      if (window.$gameSystem && typeof $gameSystem.setEventMiniLabel === 'function') {
        $gameSystem.setEventMiniLabel(false); // refreshes labels via interpreter hook
      }
      hideAllMiniLabelsOnMap(scene);

      // Also hide minimap immediately
      setVisibleSafe(minimap, false);
    } else {
      _emForceCutsceneHide = false;

      // Restore MQW
      if (window.$gameSystem && typeof $gameSystem.setShowMapQuestWindow === 'function' && _emPrevMQWSystemShow !== null) {
        $gameSystem.setShowMapQuestWindow(!!_emPrevMQWSystemShow);
        if (typeof $gameSystem.refreshActiveQuestWindow === 'function') $gameSystem.refreshActiveQuestWindow();
      } else {
        // Fallback: restore current window visible
        // (If we don't know prior state, do nothing.)
        // Note: mqw may be null when restoring; that's OK.
      }

      // Restore MiniLabel
      if (window.$gameSystem && typeof $gameSystem.setEventMiniLabel === 'function' && _emPrevMiniLabelSystemShow !== null) {
        $gameSystem.setEventMiniLabel(!!_emPrevMiniLabelSystemShow);
      }
      restoreMiniLabelsRefresh(scene);

      // Restore minimap sprite visibility (best-effort)
      restoreVisibleSafe(minimap, _emPrevMinimapVisible);

      // Reset caches
      _emPrevMinimapVisible = null;
      _emPrevMQWSystemShow = null;
      _emPrevMiniLabelSystemShow = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Runtime enforcement (keeps them hidden even if other code tries to show)
  // ---------------------------------------------------------------------------

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);

    if (!_emForceCutsceneHide) return;
    forceHideCutsceneUI(this);
  };

  // Also re-apply on scene start (some plugins recreate windows/sprites)
  const _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    _Scene_Map_start.call(this);
    if (_emForceCutsceneHide) forceHideCutsceneUI(this);
  };

  // ---------------------------------------------------------------------------
  // Plugin Commands
  // ---------------------------------------------------------------------------

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    const cmd = String(command || '');
    const isNew = cmd === 'Cutscene';
    const isOld = cmd === 'DisableMinimapCutscene';
    if (!isNew && !isOld) return;

    const flag = String(args[0] || '').toLowerCase() === 'true';
    setCutsceneFlag(flag);
  };
})();
