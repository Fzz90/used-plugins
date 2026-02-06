/*:
 * @author Faiz Syihab
 * @plugindesc (v1.1) Force 3 skill columns for Equipped Skills and Battle Skill selection. Compatible with YEP_EquipBattleSkills, YEP_SkillCore, YEP_SkillMasteryLevels.
 *
 * @help
 * ============================================================================
 * EM_3SkillColumn.js
 * ============================================================================
 * FEATURES:
 * 1. Equipped Skills (YEP_EquipBattleSkills):
 *    - Window_SkillList with stypeId === 'battleSkills' → 3 columns
 *
 * 2. Battle Skill Selection (Scene_Battle):
 *    - Window_BattleSkill → 3 columns
 *
 * DOES NOT affect:
 * - Skill menu out of battle
 * - Learn Skill
 * - Other skill lists
 *
 * Recommended plugin order (bottom-most among these):
 * - YEP_SkillCore.js
 * - YEP_EquipBattleSkills.js
 * - YEP_SkillMasteryLevels.js
 * - EM_3SkillColumn.js   ← place here
 * ============================================================================
 */

(() => {
  "use strict";

  const FORCE_COLS = 3;

  // --------------------------------------------------------------------------
  // 1) Equipped Skills (battleSkills) → 3 columns
  // --------------------------------------------------------------------------
  if (typeof Window_SkillList !== "undefined") {
    const _Window_SkillList_maxCols = Window_SkillList.prototype.maxCols;
    Window_SkillList.prototype.maxCols = function () {
      if (this._stypeId === "battleSkills") {
        return FORCE_COLS;
      }
      return _Window_SkillList_maxCols
        ? _Window_SkillList_maxCols.call(this)
        : 2;
    };

    // Ensure refresh when stype changes (important for mastery plugins)
    const _Window_SkillList_setStypeId = Window_SkillList.prototype.setStypeId;
    if (_Window_SkillList_setStypeId) {
      Window_SkillList.prototype.setStypeId = function (stypeId) {
        _Window_SkillList_setStypeId.call(this, stypeId);
        if (this._stypeId === "battleSkills" && this.refresh) {
          this.refresh();
        }
      };
    }
  }

  // --------------------------------------------------------------------------
  // 2) Battle Skill Window (Scene_Battle) → 3 columns
  // --------------------------------------------------------------------------
  if (typeof Window_BattleSkill !== "undefined") {
    const _Window_BattleSkill_maxCols = Window_BattleSkill.prototype.maxCols;
    Window_BattleSkill.prototype.maxCols = function () {
      return FORCE_COLS;
    };

    // Safety: refresh layout after creation
    const _Window_BattleSkill_initialize =
      Window_BattleSkill.prototype.initialize;
    Window_BattleSkill.prototype.initialize = function (...args) {
      _Window_BattleSkill_initialize.apply(this, args);
      if (this.refresh) this.refresh();
    };
  }
})();
