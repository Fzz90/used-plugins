/*:
 * @plugindesc v1.1.0 - Globally seal/unseal specific skills via plugin commands. (Actors by default) 
 * @author Faiz Syihab
 *
 * @param Affect Enemies
 * @type boolean
 * @on Yes
 * @off No
 * @desc If true, enemies are also prevented from using sealed skills.
 * @default false
 *
 * @help
 * ============================================================================
 * EM_SealSkill.js
 * ============================================================================
 * Adds simple plugin commands to seal/unseal a skill ID so battlers cannot use
 * that skill (it will be disabled in skill windows and blocked by canUse()).
 *
 * By default, this affects ACTORS only.
 *
 * ----------------------------------------------------------------------------
 * Plugin Commands
 * ----------------------------------------------------------------------------
 *   SealSkill x
 *     - Seals skill ID x.
 *
 *   UnsealSkill x
 *     - Unseals skill ID x.
 *
 * Notes:
 *   - x can be a number (e.g. 10) or a variable reference v[n] (e.g. v[5]).
 *   - You can pass multiple ids: SealSkill 10 11 12
 *
 * ----------------------------------------------------------------------------
 * Script Calls (optional)
 * ----------------------------------------------------------------------------
 *   $gameSystem.emSealSkill(10);
 *   $gameSystem.emUnsealSkill(10);
 *   $gameSystem.emIsSkillSealed(10);  // true/false
 *
 * ----------------------------------------------------------------------------
 * Compatibility
 * ----------------------------------------------------------------------------
 * - Aliases Game_BattlerBase.isSkillSealed (preferred hook).
 * - If a project/plugin removes that method, it falls back to aliasing
 *   Game_BattlerBase.meetsSkillConditions.
 *
 * ----------------------------------------------------------------------------
 * Terms
 * ----------------------------------------------------------------------------
 * Free to use in commercial/non-commercial RPG Maker MV projects.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_SealSkill = true;

var EM = EM || {};
EM.SealSkill = EM.SealSkill || {};
EM.SealSkill.VERSION = "1.1.0";

(function() {
  "use strict";

  var parameters = PluginManager.parameters("EM_SealSkill") || {};
  var AFFECT_ENEMIES = String(parameters["Affect Enemies"] || "false") === "true";

  // -----------------------------
  // Game_System storage
  // -----------------------------
  var KEY = "_emSealedSkillIds";

  var _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    this._emEnsureSealedSkills();
  };

  Game_System.prototype._emEnsureSealedSkills = function() {
    if (!this[KEY] || !Array.isArray(this[KEY])) this[KEY] = [];
  };

  Game_System.prototype.emSealedSkillIds = function() {
    this._emEnsureSealedSkills();
    return this[KEY];
  };

  Game_System.prototype.emIsSkillSealed = function(skillId) {
    this._emEnsureSealedSkills();
    return this[KEY].indexOf(Number(skillId)) >= 0;
  };

  Game_System.prototype.emSealSkill = function(skillId) {
    var id = Number(skillId);
    if (!id || id < 0) return;
    this._emEnsureSealedSkills();
    if (this[KEY].indexOf(id) < 0) this[KEY].push(id);
  };

  Game_System.prototype.emUnsealSkill = function(skillId) {
    var id = Number(skillId);
    this._emEnsureSealedSkills();
    var idx = this[KEY].indexOf(id);
    if (idx >= 0) this[KEY].splice(idx, 1);
  };

  // -----------------------------
  // Battler hook
  // -----------------------------
  function emShouldCheckSealedSkills(battler) {
    if (!battler) return false;
    if (battler.isActor && battler.isActor()) return true;
    if (AFFECT_ENEMIES && battler.isEnemy && battler.isEnemy()) return true;
    return false;
  }

  if (Game_BattlerBase.prototype.isSkillSealed) {
    var _Game_BattlerBase_isSkillSealed = Game_BattlerBase.prototype.isSkillSealed;
    Game_BattlerBase.prototype.isSkillSealed = function(skillId) {
      if (_Game_BattlerBase_isSkillSealed.call(this, skillId)) return true;
      if (!emShouldCheckSealedSkills(this)) return false;
      if (!$gameSystem) return false;
      return $gameSystem.emIsSkillSealed(skillId);
    };
  } else {
    // Fallback: patch meetsSkillConditions if another plugin removed isSkillSealed
    var _Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
    Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
      if (!_Game_BattlerBase_meetsSkillConditions.call(this, skill)) return false;
      if (!skill) return false;
      if (!emShouldCheckSealedSkills(this)) return true;
      if (!$gameSystem) return true;
      return !$gameSystem.emIsSkillSealed(skill.id);
    };
  }

  // -----------------------------
  // Plugin Commands
  // -----------------------------
  function parseSkillIdToken(token) {
    if (token == null) return NaN;
    var t = String(token).trim();
    // v[n]
    var m = t.match(/^v\[(\d+)\]$/i);
    if (m) {
      var varId = Number(m[1]);
      return $gameVariables ? Number($gameVariables.value(varId)) : NaN;
    }
    // plain number
    var n = Number(t);
    return n;
  }

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (!command) return;

    if (command === "SealSkill") {
      if (!$gameSystem) return;
      (args || []).forEach(function(a) {
        var id = parseSkillIdToken(a);
        if (!isNaN(id)) $gameSystem.emSealSkill(id);
      });
    } else if (command === "UnsealSkill") {
      if (!$gameSystem) return;
      (args || []).forEach(function(a) {
        var id = parseSkillIdToken(a);
        if (!isNaN(id)) $gameSystem.emUnsealSkill(id);
      });
    }
  };


  // ---------------------------------------------------------------------------
  // YEP_SkillCore compatibility (Custom Requirement)
  // ---------------------------------------------------------------------------
  // Some setups may end up with meetsSkillConditions being redefined by other
  // plugins in a way that bypasses isSkillSealed(). To keep the seal authoritative,
  // we add a final post-check at boot time, after all plugins are loaded.
  EM.SealSkill._patchedMeetsSkillConditions = false;

  EM.SealSkill.applyMeetsSkillConditionsPatch = function () {
    if (EM.SealSkill._patchedMeetsSkillConditions) return;
    if (!Game_BattlerBase || !Game_BattlerBase.prototype.meetsSkillConditions) return;

    const _meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;

    Game_BattlerBase.prototype.meetsSkillConditions = function (skill) {
      const ok = _meetsSkillConditions.call(this, skill);
      if (!ok) return false;

      // If globally sealed, always fail, regardless of custom requirements.
      try {
        if (skill && DataManager.isSkill(skill) && $gameSystem && $gameSystem.isEmSkillSealed(skill.id)) {
          if (!$gameSystem.emSealSkillAffectsEnemies && this.isEnemy && this.isEnemy()) return true;
          return false;
        }
      } catch (e) {
        // Fail open if something unexpected happens; avoid hard crashing.
      }
      return true;
    };

    EM.SealSkill._patchedMeetsSkillConditions = true;
  };

  // Apply the patch after all plugins have loaded.
  const _Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function () {
    _Scene_Boot_start.call(this);
    EM.SealSkill.applyMeetsSkillConditionsPatch();
  };



})();