/*:
 * @plugindesc (v1.0.0) Sync YEP_X_MapQuestWindow option (mapQuestWindow) into a game switch. 1.5+ compatible.
 * @author Faiz Syihab
 *
 * @param QuestWindowSwitchId
 * @text Quest Window Switch ID
 * @type switch
 * @desc Switch to be set TRUE when Quest Window option is ON, and FALSE when OFF.
 * @default 141
 *
 * @help
 * This plugin syncs YEP_X_MapQuestWindow's Options setting (symbol: mapQuestWindow)
 * into a game switch.
 *
 * - If Quest Window option is ON  -> Switch = true
 * - If Quest Window option is OFF -> Switch = false
 *
 * Requirements:
 * - YEP_X_MapQuestWindow (which defines ConfigManager.mapQuestWindow)
 *
 * Recommended plugin order:
 * - YEP_OptionsCore (optional)
 * - YEP_X_MapQuestWindow
 * - EM_MapQuestWindowSwitch   (this plugin)
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_MapQuestWindowSwitch";
  const params = PluginManager.parameters(PLUGIN_NAME);
  const SWITCH_ID = Number(params.QuestWindowSwitchId || 141);

  // ---------------------------------------------------------------------------
  // Core sync helper
  // ---------------------------------------------------------------------------
  function syncQuestWindowSwitch() {
    // Switches exist only after game objects are created (new game / load).
    if (!$gameSwitches) return;
    if (!Number.isFinite(SWITCH_ID) || SWITCH_ID <= 0) return;

    // YEP_X_MapQuestWindow stores option here:
    // ConfigManager.mapQuestWindow :contentReference[oaicite:1]{index=1}
    const value = !!ConfigManager.mapQuestWindow;
    $gameSwitches.setValue(SWITCH_ID, value);
  }

  // ---------------------------------------------------------------------------
  // 1) When player changes Options value (default Window_Options or YEP_OptionsCore)
  // Window_Options changeValue is used in Yanfly OptionsCore logic as well.
  // ---------------------------------------------------------------------------
  const _Window_Options_changeValue = Window_Options.prototype.changeValue;
  Window_Options.prototype.changeValue = function (symbol, value) {
    _Window_Options_changeValue.call(this, symbol, value);
    if (symbol === "mapQuestWindow") syncQuestWindowSwitch();
  };

  // ---------------------------------------------------------------------------
  // 2) Ensure sync happens after load/new game (covers existing config state)
  // ---------------------------------------------------------------------------
  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function () {
    _Game_System_onAfterLoad.call(this);
    syncQuestWindowSwitch();
  };

  const _DataManager_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function () {
    _DataManager_setupNewGame.call(this);
    syncQuestWindowSwitch();
  };

  // ---------------------------------------------------------------------------
  // 3) Safety: when entering map/menu, re-sync (covers edge cases)
  // ---------------------------------------------------------------------------
  const _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    _Scene_Map_start.call(this);
    syncQuestWindowSwitch();
  };

  const _Scene_Options_start = Scene_Options.prototype.start;
  Scene_Options.prototype.start = function () {
    _Scene_Options_start.call(this);
    syncQuestWindowSwitch();
  };
})();
