/*:
 * @author Faiz Syihab
 * @plugindesc (v1.0.1) Automatically toggle a switch and run common events when player enters or leaves a specific map.
 *
 * @param TargetMapId
 * @text Target Map ID
 * @type number
 * @min 1
 * @default 1
 * @desc Map ID that will turn the switch ON when entered.
 *
 * @param TargetSwitchId
 * @text Target Switch ID
 * @type switch
 * @default 1
 * @desc Switch to be turned ON when entering the target map, and OFF otherwise.
 *
 * @param OnEnterCommonEventId
 * @text Common Event (On Enter)
 * @type common_event
 * @default 0
 * @desc Common Event to run ONCE when entering the target map. 0 = none.
 *
 * @param OnExitCommonEventId
 * @text Common Event (On Exit)
 * @type common_event
 * @default 0
 * @desc Common Event to run ONCE when leaving the target map. 0 = none.
 *
 * @help
 * ============================================================================
 * EM_MapEnterSwitch.js
 * ============================================================================
 * Version: 1.0.1
 *
 * Behavior:
 * - If current map ID === TargetMapId:
 *     Switch = ON
 *     Run OnEnterCommonEventId (once)
 *
 * - If current map ID !== TargetMapId:
 *     Switch = OFF
 *     Run OnExitCommonEventId (once)
 *
 * The plugin detects changes automatically on:
 * - Map transfer
 * - Load game
 * - Entering Scene_Map
 *
 * Notes:
 * - Common Events are reserved and executed safely.
 * - They will NOT loop every frame.
 * ============================================================================
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_MapEnterSwitch";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const TARGET_MAP_ID = Number(params.TargetMapId || 1);
  const TARGET_SWITCH_ID = Number(params.TargetSwitchId || 1);
  const CE_ON_ENTER = Number(params.OnEnterCommonEventId || 0);
  const CE_ON_EXIT = Number(params.OnExitCommonEventId || 0);

  // Internal state to prevent repeated firing
  let _lastInTargetMap = null;

  function runCommonEvent(commonEventId) {
    if (commonEventId <= 0) return;
    if (!$gameTemp || !$gameTemp.reserveCommonEvent) return;
    $gameTemp.reserveCommonEvent(commonEventId);
  }

  function updateStateByMap() {
    if (!$gameMap || !$gameSwitches) return;

    const inTarget = $gameMap.mapId() === TARGET_MAP_ID;

    // First run (after load / boot)
    if (_lastInTargetMap === null) {
      _lastInTargetMap = inTarget;
      $gameSwitches.setValue(TARGET_SWITCH_ID, inTarget);
      return;
    }

    // State changed
    if (inTarget !== _lastInTargetMap) {
      $gameSwitches.setValue(TARGET_SWITCH_ID, inTarget);

      if (inTarget) {
        runCommonEvent(CE_ON_ENTER);
      } else {
        runCommonEvent(CE_ON_EXIT);
      }

      _lastInTargetMap = inTarget;
    }
  }

  // --------------------------------------------------------------------------
  // Hooks
  // --------------------------------------------------------------------------
  const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
  Game_Player.prototype.performTransfer = function () {
    _Game_Player_performTransfer.call(this);
    updateStateByMap();
  };

  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function () {
    _Game_System_onAfterLoad.call(this);
    _lastInTargetMap = null;
    updateStateByMap();
  };

  const _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    _Scene_Map_start.call(this);
    updateStateByMap();
  };
})();
