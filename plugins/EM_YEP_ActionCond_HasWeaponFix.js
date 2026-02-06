/*:
 * @plugindesc v1.0.0 Patch: Prevents 'user.hasWeapon is not a function' errors in YEP eval conditions by adding safe battler methods (MV). Place BELOW YEP_BattleEngineCore and other YEP plugins. 
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_YEP_ActionCond_HasWeaponFix.js
 * ============================================================================
 * Fixes runtime crashes like:
 *   TypeError: user.hasWeapon is not a function
 * occurring inside eval-based condition checks (ex: YEP_BattleEngineCore action
 * conditions) when the "user" battler is an enemy or any non-actor battler.
 *
 * What it does:
 *  1) Adds Game_BattlerBase.prototype.hasWeapon/hasArmor as SAFE fallbacks.
 *     - For non-actors (enemies), these return false.
 *  2) Extends Game_Actor.prototype.hasWeapon/hasArmor to accept either:
 *     - database object (default MV behavior), or
 *     - numeric ID (common in eval snippets), converting it internally.
 *
 * Usage:
 *  - No plugin commands.
 *  - Simply install and place it BELOW YEP_BattleEngineCore (and below any
 *    plugin that modifies battler condition checks).
 *
 * Notes:
 *  - This is a safety/compat patch. Enemies do not equip weapons/armors in MV,
 *    so hasWeapon/hasArmor will always be false for them.
 * ============================================================================
 */

(() => {
  'use strict';

  // --------------------------------------------------------------------------
  // Safe fallbacks for non-actors (prevents "is not a function")
  // --------------------------------------------------------------------------
  if (typeof Game_BattlerBase !== 'undefined') {
    if (typeof Game_BattlerBase.prototype.hasWeapon !== 'function') {
      Game_BattlerBase.prototype.hasWeapon = function(weaponIdOrData) {
        // Actors override this in Game_Actor. Non-actors default false.
        return false;
      };
    }
    if (typeof Game_BattlerBase.prototype.hasArmor !== 'function') {
      Game_BattlerBase.prototype.hasArmor = function(armorIdOrData) {
        return false;
      };
    }
  }

  // --------------------------------------------------------------------------
  // Enhance Game_Actor hasWeapon/hasArmor to accept numeric IDs too.
  // (Does not break default behavior.)
  // --------------------------------------------------------------------------
  if (typeof Game_Actor !== 'undefined') {
    // --- hasWeapon ---
    const _Game_Actor_hasWeapon = Game_Actor.prototype.hasWeapon;
    if (typeof _Game_Actor_hasWeapon === 'function') {
      Game_Actor.prototype.hasWeapon = function(weaponIdOrData) {
        let weapon = weaponIdOrData;
        if (typeof weaponIdOrData === 'number') {
          weapon = $dataWeapons ? $dataWeapons[weaponIdOrData] : null;
        }
        if (!weapon) return false;
        return _Game_Actor_hasWeapon.call(this, weapon);
      };
    }

    // --- hasArmor ---
    const _Game_Actor_hasArmor = Game_Actor.prototype.hasArmor;
    if (typeof _Game_Actor_hasArmor === 'function') {
      Game_Actor.prototype.hasArmor = function(armorIdOrData) {
        let armor = armorIdOrData;
        if (typeof armorIdOrData === 'number') {
          armor = $dataArmors ? $dataArmors[armorIdOrData] : null;
        }
        if (!armor) return false;
        return _Game_Actor_hasArmor.call(this, armor);
      };
    }
  }
})();
