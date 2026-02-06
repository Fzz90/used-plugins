/*:
 * @plugindesc (v1.0.3) Plugin Command BattleTest true: add +999 for all named normal Items (exclude Key Items) (MV, ES6).
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_BattleTestInventoryFill.js
 * ============================================================================
 * Plugin Command:
 *   BattleTest true
 *     -> For each database Item ($dataItems):
 *        - itypeId === 1 (normal item only)
 *        - name is NOT empty
 *        Add +999 to party inventory.
 *
 *   BattleTest false
 *     -> No action.
 *
 * Notes:
 * - Inventory cap is still enforced by the engine / other plugins.
 * - Safe to run multiple times (will keep adding).
 * ============================================================================
 */

(() => {
  "use strict";

  const toBool = (value) => {
    if (value == null) return false;
    const s = String(value).trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "on";
  };

  const isValidNormalItem = (item) => {
    if (!item) return false;
    if (item.itypeId !== 1) return false; // exclude Key Items
    const name = item.name;
    return typeof name === "string" && name.trim().length > 0;
  };

  const addNamedNormalItemsPlus999 = () => {
    if (!$gameParty || !window.$dataItems) return;

    for (let i = 1; i < $dataItems.length; i++) {
      const item = $dataItems[i];
      if (!isValidNormalItem(item)) continue;
      $gameParty.gainItem(item, 999, false);
    }
  };

  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (!command) return;
    if (String(command).toLowerCase() !== "battletest") return;

    const flag = toBool(args && args[0]);
    if (flag) addNamedNormalItemsPlus999();
  };
})();
