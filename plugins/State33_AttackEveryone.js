/*:
 * @plugindesc (v1.4) State 33/34: Auto Attack without input + seal skills; 33 hits anyone, 34 hits allies only (YEP_BattleAICore compatible)
 * @author Faiz
 *
 * @help
 * State 33:
 *  - Battler cannot input (no command/prepare)
 *  - Forced to use Attack
 *  - Targets a random living battler from BOTH sides (party + troop), INCLUDING self
 *  - Seals all skills except Attack
 *
 * State 34:
 *  - Battler cannot input (no command/prepare)
 *  - Forced to use Attack
 *  - Targets a random living ALLY battler only (same side), INCLUDING self
 *  - Seals all skills except Attack
 *
 * Put this plugin BELOW:
 *  - your battle/ATB plugins
 *  - YEP_BattleAICore (if used)
 */

(() => {
  "use strict";

  const STATE_ANYONE = 33; // random anyone (party + enemy + self)
  const STATE_ALLY = 34; // random ally only (same side + self)

  function inBattle() {
    return $gameParty && $gameParty.inBattle && $gameParty.inBattle();
  }

  function livingPartyBattlers() {
    return $gameParty.battleMembers().filter((b) => b && b.isAlive());
  }

  function livingTroopBattlers() {
    return $gameTroop.members().filter((b) => b && b.isAlive());
  }

  function livingAllBattlers() {
    return livingPartyBattlers().concat(livingTroopBattlers());
  }

  function livingAlliesOf(battler) {
    if (!battler) return [];
    return battler.isActor && battler.isActor()
      ? livingPartyBattlers()
      : livingTroopBattlers();
  }

  function hasMadState(battler) {
    return (
      battler &&
      battler.isStateAffected &&
      (battler.isStateAffected(STATE_ANYONE) ||
        battler.isStateAffected(STATE_ALLY))
    );
  }

  // 1) Block input (no prepare/command selection) for both states
  const _canInput = Game_Battler.prototype.canInput;
  Game_Battler.prototype.canInput = function () {
    if (inBattle() && hasMadState(this)) return false;
    return _canInput.call(this);
  };

  // 2) Seal all skills except Attack for both states (actor & enemy)
  const _canUse = Game_BattlerBase.prototype.canUse;
  Game_BattlerBase.prototype.canUse = function (item) {
    if (inBattle() && hasMadState(this)) {
      if (DataManager.isSkill(item)) {
        return item && item.id === this.attackSkillId();
      }
    }
    return _canUse.call(this, item);
  };

  // 3) Force action = Attack for actors & enemies when state 33 or 34 is active
  const _makeActions = Game_Battler.prototype.makeActions;
  Game_Battler.prototype.makeActions = function () {
    _makeActions.call(this);

    if (!inBattle()) return;
    if (!hasMadState(this)) return;
    if (!this.isAlive()) return;

    this.clearActions();
    const action = new Game_Action(this);
    action.setAttack();
    this._actions.push(action);
  };

  // 4) Override target selection for Attack
  //    - State 33: random from everyone alive (party+troop) incl self
  //    - State 34: random from allies alive (same side) incl self
  const _makeTargets = Game_Action.prototype.makeTargets;
  Game_Action.prototype.makeTargets = function () {
    const subject = this.subject();

    if (inBattle() && subject && subject.isStateAffected && this.isAttack()) {
      if (subject.isStateAffected(STATE_ANYONE)) {
        const pool = livingAllBattlers();
        if (pool.length <= 0) return [];
        return [pool[Math.floor(Math.random() * pool.length)]];
      }
      if (subject.isStateAffected(STATE_ALLY)) {
        const pool = livingAlliesOf(subject);
        if (pool.length <= 0) return [];
        return [pool[Math.floor(Math.random() * pool.length)]];
      }
    }

    return _makeTargets.call(this);
  };

  // 5) YEP_BattleAICore compatibility (if installed):
  //    - Prevent AI from selecting non-attack skills when state 33/34 is active.
  //    - Force replace AI pattern actions to Attack.
  if (typeof AIManager !== "undefined") {
    const _AI_initialCheck = AIManager.initialCheck;
    AIManager.initialCheck = function (skillId) {
      const b = this.battler && this.battler();
      if (inBattle() && hasMadState(b)) {
        const atkId = b.attackSkillId();
        return skillId === atkId;
      }
      return _AI_initialCheck.call(this, skillId);
    };
  }

  const _Enemy_setAIPattern = Game_Enemy.prototype.setAIPattern;
  Game_Enemy.prototype.setAIPattern = function () {
    if (inBattle() && hasMadState(this)) {
      this.clearActions();
      const a = new Game_Action(this);
      a.setAttack();
      this._actions.push(a);
      this.setActionState("waiting");
      return;
    }
    _Enemy_setAIPattern.call(this);
  };
})();
