//=============================================================================
// EM_BeastBook_QuickOpenFix.js
//=============================================================================
/*:
 * @plugindesc v1.0.0 - Prevent STV_BeastBook from getting stuck on "Loading..." when opened from menu (YEP_MainMenuManager, etc).  @author Faiz Syihab
 *
 * @param BypassImageReadyGate
 * @text Bypass Image Ready Gate
 * @type boolean
 * @on true
 * @off false
 * @default true
 * @desc If true, SceneManager will NOT wait for ImageManager.isReady() when switching to Scene_BeastBook.
 *
 * @help
 * ============================================================================
 * EM_BeastBook_QuickOpenFix
 * ============================================================================
 * Problem:
 * - When opening STV_BeastBook (Scene_BeastBook) from the main menu (often via
 *   YEP_MainMenuManager), the game can appear to hang on a "Loading..." screen.
 * - This happens because RPG Maker MV blocks scene transitions until
 *   ImageManager.isReady() becomes true. BeastBook can trigger many image loads.
 *
 * Fix:
 * - Optionally bypass ImageManager.isReady() ONLY when transitioning to or
 *   being inside Scene_BeastBook.
 *
 * Usage:
 * - Put this plugin BELOW STV_BeastBook.js (and below menu plugins).
 *
 * Notes:
 * - This does NOT change BeastBook logic; it only removes the global loading gate
 *   for that scene. Images may pop-in as they finish loading (normal behavior).
 *
 * ============================================================================
 * Version History
 * ============================================================================
 * v1.0.0 - Initial release.
 */
//=============================================================================

(function() {
  'use strict';

  var parameters = PluginManager.parameters('EM_BeastBook_QuickOpenFix');
  var bypassGate = String(parameters['BypassImageReadyGate'] || 'true') === 'true';

  // If STV_BeastBook isn't installed, do nothing.
  function hasBeastScene() {
    return typeof Scene_BeastBook !== 'undefined';
  }

  if (bypassGate) {
    var _SceneManager_isSceneReady = SceneManager.isSceneReady;
    SceneManager.isSceneReady = function() {
      // If we are transitioning to BeastBook, skip ImageManager.isReady() gate.
      if (hasBeastScene()) {
        if (this._nextScene && (this._nextScene instanceof Scene_BeastBook)) {
          // Only require current scene readiness (if any).
          return !this._scene || this._scene.isReady();
        }
        if (this._scene && (this._scene instanceof Scene_BeastBook)) {
          // Allow BeastBook to run even if images are still loading.
          return this._scene.isReady();
        }
      }
      return _SceneManager_isSceneReady.call(this);
    };
  }

})();
