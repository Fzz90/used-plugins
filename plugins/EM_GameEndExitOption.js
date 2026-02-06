/*:
 * @plugindesc v1.0.0 Adds "Exit Game" option to the Game End menu (To Title / Exit Game / Cancel). (RPG Maker MV)
 * @author Faiz Syihab
 *
 * @param Exit Command Name
 * @type string
 * @default Exit Game
 *
 * @param Insert Position
 * @type select
 * @option After To Title
 * @value afterToTitle
 * @option Before Cancel
 * @value beforeCancel
 * @default afterToTitle
 *
 * @help
 * ============================================================================
 * EM_GameEndExitOption.js
 * ============================================================================
 * Adds an "Exit Game" command to Scene_GameEnd so the menu becomes:
 *  1) To Title
 *  2) Exit Game
 *  3) Cancel
 *
 * Notes:
 * - Works best on NW.js (desktop builds). On browsers, window.close() may be blocked.
 * - No plugin commands.
 *
 * Compatibility:
 * - Designed for RPG Maker MV default Scene_GameEnd / Window_GameEnd.
 * - Should be compatible with YEP-based stacks unless another plugin fully replaces
 *   the Game End command list/handlers.
 * ============================================================================
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_GameEndExitOption";

  const parameters = PluginManager.parameters(PLUGIN_NAME) || {};
  const EXIT_NAME = String(parameters["Exit Command Name"] || "Exit Game");
  const INSERT_POS = String(parameters["Insert Position"] || "afterToTitle");

  const SYMBOL_EXIT = "exitGame";

  //--------------------------------------------------------------------------
  // Window_GameEnd
  //--------------------------------------------------------------------------
  const _Window_GameEnd_makeCommandList =
    Window_GameEnd.prototype.makeCommandList;
  Window_GameEnd.prototype.makeCommandList = function () {
    // Build default list first (To Title, Cancel)
    _Window_GameEnd_makeCommandList.call(this);

    // Insert Exit Game with requested ordering
    const exitCmd = {
      name: EXIT_NAME,
      symbol: SYMBOL_EXIT,
      enabled: true,
      ext: null,
    };

    if (INSERT_POS === "beforeCancel") {
      // Insert before the final "cancel" if present
      const cancelIndex = this._list.findIndex(
        (cmd) => cmd && cmd.symbol === "cancel",
      );
      if (cancelIndex >= 0) {
        this._list.splice(cancelIndex, 0, exitCmd);
      } else {
        this._list.push(exitCmd);
      }
    } else {
      // Default: after "toTitle" if present
      const toTitleIndex = this._list.findIndex(
        (cmd) => cmd && cmd.symbol === "toTitle",
      );
      if (toTitleIndex >= 0) {
        this._list.splice(toTitleIndex + 1, 0, exitCmd);
      } else {
        // Fallback
        this._list.unshift(exitCmd);
      }
    }
  };

  //--------------------------------------------------------------------------
  // Scene_GameEnd
  //--------------------------------------------------------------------------
  const _Scene_GameEnd_createCommandWindow =
    Scene_GameEnd.prototype.createCommandWindow;
  Scene_GameEnd.prototype.createCommandWindow = function () {
    _Scene_GameEnd_createCommandWindow.call(this);
    this._commandWindow.setHandler(
      SYMBOL_EXIT,
      this.commandExitGame.bind(this),
    );
  };

  Scene_GameEnd.prototype.commandExitGame = function () {
    this._commandWindow.close();
    this.fadeOutAll();

    // Prefer engine-provided exit if available
    if (SceneManager && typeof SceneManager.exit === "function") {
      SceneManager.exit();
      return;
    }

    // Fallbacks
    try {
      if (Utils && typeof Utils.isNwjs === "function" && Utils.isNwjs()) {
        const gui = require("nw.gui");
        gui.App.quit();
        return;
      }
    } catch (e) {
      // ignore and fall through
    }

    // Browser fallback (may be blocked by browser policy)
    try {
      window.close();
    } catch (e) {
      // If closing is blocked, at least return to title as a safe fallback.
      if (SceneManager && typeof SceneManager.goto === "function") {
        SceneManager.goto(Scene_Title);
      }
    }
  };
})();
