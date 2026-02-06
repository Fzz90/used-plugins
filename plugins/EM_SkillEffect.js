/*:
 * @plugindesc v1.10 Mastery-tier skill effects & tier icons (hit+damage only). Compatible with YEP SkillCore/Mastery/DamageCore/BEC/TargetCore/BSC.
 * @author Faiz Syihab
 *
 * @help
 * ==========================================================================
 * EM_SkillEffect v1.10
 * ==========================================================================
 * Purpose
 * - Apply extra skill effects based on YEP_SkillMasteryLevels mastery level.
 * - Provide mastery-tier icon swapping from skill notetags.
 *
 * Installation / Order (recommended)
 *  1. YEP_BattleEngineCore.js
 *  2. YEP_TargetCore.js
 *  3. YEP_DamageCore.js
 *  4. YEP_SkillCore.js
 *  5. YEP_BuffsStatesCore.js (optional)
 *  6. YEP_SkillMasteryLevels.js
 *  7. EM_SkillEffect.js   (this plugin)
 *
 * Notes
 * - State application runs ONLY when:
 *     (a) the action hits AND
 *     (b) the action deals HP damage (> 0)
 *   This prevents "Miss/Evade" from still applying states.
 *
 * - For "progression" effects (Bleed tiering, etc.), this plugin applies
 *   ONLY the highest matching rule for the current mastery level.
 *   This matches your requirement: if a higher level rule applies, do not
 *   also apply lower level rules.
 *
 * ==========================================================================
 * Notetags (put in the SKILL's Note box)
 * ==========================================================================
 * 1) Mastery-based state effects
 *
 * Single state:
 *   <(L0), (State 168), (40%)>
 *
 * With extra turns (+N turns). When (+0), omit it.
 *   <(L1), (State 36)(+1), (60%)>
 *   <(L1~L4), (State 168)(+1), (70%)>
 *
 * Multiple states, same chance (each state rolls independently using the
 * same chance value):
 *   <(L3~L7), (State 168(+1), State 169(+1)), (50%)>
 *   <(L3~L7), (State 36(+1), State 40(+2)), (50%)>
 *
 * Notes on parsing:
 * - L0 is supported.
 * - If only L1, you do not need the '~'.
 * - (+N) can be written as '(+N)' after the state token.
 * - "State" keyword is optional inside the state list.
 *
 * 2) Tier icon swaps (based on mastery level)
 *   <Bronze{3}: Icon 60>
 *   <Silver{8}: Icon 61>
 *   <Gold{13}: Icon 62>
 *   <None{0}: Icon 10>        // optional base override
 *
 * Rules:
 * - Uses the highest tier whose {Level} is <= mastery level.
 * - If no tier matches, skill uses its database icon.
 * - L0 is allowed in {Level}.
 *
 * ==========================================================================
 * Changelog
 * ==========================================================================
 * v1.10
 * - Apply states from executeDamage (post-damage), ensuring miss/evasion and
 *   0-damage do not apply.
 * - Extra turns uses setStateTurns/stateTurns when available (YEP friendly).
 * - More robust parsing for '(State X)(+N)' and '(State X(+N), ...)'.
 */

var Imported = Imported || {};
Imported.EM_SkillEffect = true;

var EMSkillEffect = EMSkillEffect || {};
EMSkillEffect.version = '1.10';

(function() {
  'use strict';

  // ------------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------------

  EMSkillEffect._dbProcessed = false;

  EMSkillEffect.toNumber = function(v, def) {
    var n = Number(v);
    return isNaN(n) ? def : n;
  };

  EMSkillEffect.clamp01 = function(x) {
    x = Number(x);
    if (isNaN(x)) return 0;
    if (x < 0) return 0;
    if (x > 1) return 1;
    return x;
  };

  EMSkillEffect.getMasteryLevel = function(battler, skillId) {
    if (!battler) return 0;
    if (typeof battler.skillMasteryLevel === 'function') {
      return EMSkillEffect.toNumber(battler.skillMasteryLevel(skillId), 0);
    }
    return 0;
  };

  EMSkillEffect.isSkill = function(item) {
    return item && DataManager.isSkill(item);
  };

  // ------------------------------------------------------------------------
  // Notetag Processing
  // ------------------------------------------------------------------------

  var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function() {
    if (!_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!EMSkillEffect._dbProcessed) {
      EMSkillEffect._dbProcessed = true;
      EMSkillEffect.processSkillNotetags($dataSkills);
    }
    return true;
  };

  EMSkillEffect.processSkillNotetags = function(group) {
    if (!group) return;

    for (var i = 1; i < group.length; i++) {
      var skill = group[i];
      if (!skill) continue;

      skill._emSE_stateRules = [];
      skill._emSE_iconRules = [];

      var lines = String(skill.note || '').split(/[\r\n]+/);
      for (var li = 0; li < lines.length; li++) {
        var line = String(lines[li]).trim();
        if (!line) continue;

        // State rule (single state, extra turns outside state parentheses):
        // <(L1), (State 36)(+1), (100%)>
        // (+0) should be omitted.
        var sm2 = line.match(/^<\(\s*L(\d+)(?:\s*~\s*L(\d+))?\s*\)\s*,\s*\(\s*(?:State\s+)?(\d+)\s*\)\s*(?:\(\s*\+(\d+)\s*\))?\s*,\s*\(\s*(\d+(?:\.\d+)?)\s*%\s*\)\s*>$/i);
        if (sm2) {
          var minLv2 = EMSkillEffect.toNumber(sm2[1], 0);
          var maxLv2 = (sm2[2] !== undefined) ? EMSkillEffect.toNumber(sm2[2], minLv2) : minLv2;
          if (maxLv2 < minLv2) {
            var t2 = minLv2; minLv2 = maxLv2; maxLv2 = t2;
          }
          var stateId2 = EMSkillEffect.toNumber(sm2[3], 0);
          var extra2 = (sm2[4] !== undefined) ? EMSkillEffect.toNumber(sm2[4], 0) : 0;
          var chance2 = EMSkillEffect.clamp01(EMSkillEffect.toNumber(sm2[5], 0) / 100);
          if (stateId2 > 0) {
            if (extra2 < 0) extra2 = 0;
            skill._emSE_stateRules.push({
              minLv: minLv2,
              maxLv: maxLv2,
              chance: chance2,
              states: [{ id: stateId2, extra: extra2 }],
              order: skill._emSE_stateRules.length
            });
          }
          continue;
        }

        // State rule:
        // <(L3~L7), (State 36(+1), State 40(+2)), (50%)>
        // capture state segment broadly between the 2nd parentheses.
        var sm = line.match(/^<\(\s*L(\d+)(?:\s*~\s*L(\d+))?\s*\)\s*,\s*\(\s*(.*?)\s*\)\s*,\s*\(\s*(\d+(?:\.\d+)?)\s*%\s*\)\s*>$/i);
        if (sm) {
          var minLv = EMSkillEffect.toNumber(sm[1], 0);
          var maxLv = (sm[2] !== undefined) ? EMSkillEffect.toNumber(sm[2], minLv) : minLv;
          if (maxLv < minLv) {
            var tmp = minLv; minLv = maxLv; maxLv = tmp;
          }

          var chance = EMSkillEffect.clamp01(EMSkillEffect.toNumber(sm[4], 0) / 100);
          var states = EMSkillEffect.parseStatesSegment(sm[3]);
          if (states.length > 0) {
            skill._emSE_stateRules.push({
              minLv: minLv,
              maxLv: maxLv,
              chance: chance,
              states: states,
              order: skill._emSE_stateRules.length
            });
          }
          continue;
        }

        // Icon tier rule:
        // <Bronze{3}: Icon 60>
        var im = line.match(/^<(None|Bronze|Silver|Gold)\s*\{\s*(\d+)\s*\}\s*:\s*Icon\s*(\d+)\s*>$/i);
        if (im) {
          skill._emSE_iconRules.push({
            tier: String(im[1]).toLowerCase(),
            level: EMSkillEffect.toNumber(im[2], 0),
            icon: EMSkillEffect.toNumber(im[3], 0),
            order: skill._emSE_iconRules.length
          });
          // sort ascending by level (stable)
          skill._emSE_iconRules.sort(function(a, b) {
            if (a.level !== b.level) return a.level - b.level;
            return a.order - b.order;
          });
        }
      }
    }
  };

  // Parse "State ..." segment.
  // Accepts tokens like:
  //  - State 36
  //  - State 36(+1)
  //  - State 36)(+1)   (rare edge)
  //  - 36(+2)
  // Multiple separated by commas.
  EMSkillEffect.parseStatesSegment = function(seg) {
    var out = [];
    var parts = String(seg).split(',');

    for (var i = 0; i < parts.length; i++) {
      var p = String(parts[i]).trim();
      if (!p) continue;

      // strip leading 'State'
      p = p.replace(/^State\s+/i, '').trim();

      var id = 0;
      var extra = 0;

      // Pattern A: "36(+1)"
      var mA = p.match(/^(\d+)\s*\(\s*\+(\d+)\s*\)\s*$/);
      // Pattern B: "36" only
      var mB = p.match(/^(\d+)\s*$/);
      // Pattern C: tolerant: first number + optional (+n) anywhere
      var mC = p.match(/(\d+).*?\(\s*\+(\d+)\s*\)/);

      if (mA) {
        id = EMSkillEffect.toNumber(mA[1], 0);
        extra = EMSkillEffect.toNumber(mA[2], 0);
      } else if (mB) {
        id = EMSkillEffect.toNumber(mB[1], 0);
        extra = 0;
      } else if (mC) {
        id = EMSkillEffect.toNumber(mC[1], 0);
        extra = EMSkillEffect.toNumber(mC[2], 0);
      } else {
        continue;
      }

      if (id > 0) {
        if (extra < 0) extra = 0;
        out.push({ id: id, extra: extra });
      }
    }

    return out;
  };

  // ------------------------------------------------------------------------
  // Icon swapping (UI)
  // ------------------------------------------------------------------------

  EMSkillEffect.getTierIcon = function(actor, skill) {
    if (!actor || !skill || !skill._emSE_iconRules || skill._emSE_iconRules.length === 0) return null;

    // Base icon fallback
    if (skill._emSE_baseIconIndex === undefined) {
      skill._emSE_baseIconIndex = skill.iconIndex;
    }

    var lv = EMSkillEffect.getMasteryLevel(actor, skill.id);
    var rules = skill._emSE_iconRules;

    var chosen = null;
    for (var i = 0; i < rules.length; i++) {
      if (lv >= rules[i].level) chosen = rules[i].icon;
    }
    if (chosen === null || chosen === undefined) return null;
    return chosen;
  };

  // Apply icon in menus
  if (Window_SkillList && Window_SkillList.prototype.drawItemName) {
    var _Window_SkillList_drawItemName = Window_SkillList.prototype.drawItemName;
    Window_SkillList.prototype.drawItemName = function(item, x, y, width) {
      if (item && this._actor && EMSkillEffect.isSkill(item)) {
        var icon = EMSkillEffect.getTierIcon(this._actor, item);
        if (icon !== null) {
          var original = item.iconIndex;
          item.iconIndex = icon;
          _Window_SkillList_drawItemName.call(this, item, x, y, width);
          item.iconIndex = original;
          return;
        }
      }
      _Window_SkillList_drawItemName.call(this, item, x, y, width);
    };
  }

  // ------------------------------------------------------------------------
  // State application (mechanics)
  // Use executeDamage AFTER damage is applied to guarantee:
  // - not miss/evasion
  // - hpDamage > 0
  // ------------------------------------------------------------------------

  var _Game_Action_executeDamage = Game_Action.prototype.executeDamage;
  Game_Action.prototype.executeDamage = function(target, value) {
    _Game_Action_executeDamage.call(this, target, value);

    var item = this.item();
    if (!EMSkillEffect.isSkill(item)) return;
    if (!target || !target.result) return;

    // Hit check (defensive): should be true if executeDamage ran, but keep.
    var res = target.result();
    if (!res || !res.isHit || !res.isHit()) return;

    // Only if HP damage strictly positive.
    // Prefer result.hpDamage (post modifiers) when available.
    var hpDmg = (typeof res.hpDamage === 'number') ? res.hpDamage : value;
    if (!(hpDmg > 0)) return;

    EMSkillEffect.applyMasteryStateRule(this.subject(), target, item);
  };

  EMSkillEffect.applyMasteryStateRule = function(user, target, skill) {
    if (!user || !target || !skill) return;
    var rules = skill._emSE_stateRules;
    if (!rules || rules.length === 0) return;

    var lv = EMSkillEffect.getMasteryLevel(user, skill.id);

    // Choose ONLY the highest matching rule.
    // Highest minLv wins; if tie, later order wins.
    var chosen = null;
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (lv < r.minLv || lv > r.maxLv) continue;
      if (!chosen) {
        chosen = r;
      } else {
        if (r.minLv > chosen.minLv) chosen = r;
        else if (r.minLv === chosen.minLv && r.order > chosen.order) chosen = r;
      }
    }
    if (!chosen) return;

    // For safety, remove states from lower rules (progression cleanup).
    // Only remove states that appear in any rule with minLv < chosen.minLv.
    for (var j = 0; j < rules.length; j++) {
      var rr = rules[j];
      if (rr.minLv >= chosen.minLv) continue;
      for (var k = 0; k < rr.states.length; k++) {
        var sid = rr.states[k].id;
        if (sid > 0 && target.isStateAffected && target.isStateAffected(sid)) {
          target.removeState(sid);
        }
      }
    }

    // Apply (each state rolls independently using chosen chance).
    for (var s = 0; s < chosen.states.length; s++) {
      var st = chosen.states[s];
      if (!(st && st.id > 0)) continue;

      if (Math.random() < chosen.chance) {
        target.addState(st.id);

        // Add extra turns only if it sticks.
        if (st.extra > 0 && target.isStateAffected && target.isStateAffected(st.id)) {
          EMSkillEffect.addStateExtraTurns(target, st.id, st.extra);
        }

        // Mark success (helps some systems that check success flags)
        if (typeof Game_Action.prototype.makeSuccess === 'function') {
          // 'this' is not accessible here safely; ignore.
        }
      }
    }
  };

  EMSkillEffect.addStateExtraTurns = function(target, stateId, extra) {
    extra = EMSkillEffect.toNumber(extra, 0);
    if (!(extra > 0)) return;

    // Prefer YEP_BuffsStatesCore compatible accessors if present.
    if (typeof target.stateTurns === 'function' && typeof target.setStateTurns === 'function') {
      var cur = EMSkillEffect.toNumber(target.stateTurns(stateId), 0);
      // Some setups may report 0 immediately after addState depending on
      // removal timing. If so, fall back to the state's maxTurns.
      if (cur <= 0) {
        var st = $dataStates[stateId];
        if (st && st.maxTurns) cur = EMSkillEffect.toNumber(st.maxTurns, 0);
      }
      target.setStateTurns(stateId, cur + extra);
      return;
    }

    // Fallback to core MV storage.
    if (target._stateTurns) {
      if (typeof target._stateTurns[stateId] !== 'number') target._stateTurns[stateId] = 0;
      target._stateTurns[stateId] += extra;
    }
  };

})();
