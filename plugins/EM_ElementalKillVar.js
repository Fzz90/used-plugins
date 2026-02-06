//=============================================================================
// EM_ElementalKillVar.js
//=============================================================================
/*:
 * @plugindesc v1.0.2 Track elemental kills: when an actor kills an enemy, increment mapped variables based on the action's element(s). (Skills + Items + Normal Attack) (YEP_ElementCore/YEP_WeaponUnleash/YEP_BattleEngineCore/YEP_ActSeqPack compatible)
 * @author Faiz Syihab
 *
 * @param Neutral Variable ID
 * @type variable
 * @desc Variable to increment for Neutral kills (Element ID 0 / None). Set 0 to disable.
 * @default 0
 *
 * @param Element 1 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 1 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 2 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 2 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 3 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 3 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 4 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 4 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 5 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 5 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 6 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 6 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 7 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 7 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 8 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 8 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 9 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 9 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 10 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 10 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 11 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 11 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 12 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 12 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 13 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 13 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 14 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 14 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 15 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 15 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 16 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 16 kills. Set 0 to disable.
 * @default 0
 *
 * @param Element 17 Variable ID
 * @type variable
 * @desc Variable to increment for Element ID 17 kills. Set 0 to disable.
 * @default 0
 *
 * @param Count Multi-Element
 * @type select
 * @option All Elements
 * @value all
 * @option First Element Only
 * @value first
 * @desc If an action has multiple elements (ex: YEP_ElementCore <Multiple Elements>), choose how to count.
 * @default all
 *
 * @help
 * ============================================================================
 * Summary
 * ============================================================================
 * When an ACTOR kills an ENEMY in battle, increment game variable(s) based on
 * the element(s) used by the action that caused the kill.
 *
 * Supports:
 * - Skills, Items, Normal Attack (elementId = -1)
 * - YEP_ElementCore getItemElements() resolution:
 *   - <Multiple Elements: ...>
 *   - FORCE ELEMENT / ADD ELEMENT / NULL ELEMENT (ActSeq)
 * - YEP_WeaponUnleash <Replace Attack: x>
 *
 * Fix in v1.0.2:
 * - Prevents extra Neutral Kill from being credited when WeaponUnleash replaces
 *   the attack (base Attack action may still run apply() with 0 damage).
 *
 * Recommended placement: BELOW YEP_ElementCore, BELOW YEP_WeaponUnleash,
 * BELOW YEP_BattleEngineCore + ActSeq packs.
 */
//=============================================================================

(() => {
  'use strict';

  const PLUGIN_NAME = 'EM_ElementalKillVar';
  const params = PluginManager.parameters(PLUGIN_NAME);

  const num = (v) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n : 0;
  };

  const map = {
    0: num(params['Neutral Variable ID']),
    1: num(params['Element 1 Variable ID']),
    2: num(params['Element 2 Variable ID']),
    3: num(params['Element 3 Variable ID']),
    4: num(params['Element 4 Variable ID']),
    5: num(params['Element 5 Variable ID']),
    6: num(params['Element 6 Variable ID']),
    7: num(params['Element 7 Variable ID']),
    8: num(params['Element 8 Variable ID']),
    9: num(params['Element 9 Variable ID']),
    10: num(params['Element 10 Variable ID']),
    11: num(params['Element 11 Variable ID']),
    12: num(params['Element 12 Variable ID']),
    13: num(params['Element 13 Variable ID']),
    14: num(params['Element 14 Variable ID']),
    15: num(params['Element 15 Variable ID']),
    16: num(params['Element 16 Variable ID']),
    17: num(params['Element 17 Variable ID']),
  };

  const multiMode = String(params['Count Multi-Element'] || 'all').toLowerCase();

  const incVar = (varId, amount = 1) => {
    if (!varId || varId <= 0) return;
    const cur = $gameVariables.value(varId);
    $gameVariables.setValue(varId, (cur || 0) + amount);
  };

  const uniq = (arr) => {
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const v = Number(arr[i] ?? 0);
      if (!out.includes(v)) out.push(v);
    }
    return out;
  };

  // ------------------------------------------------------------
  // Action UID + serial
  // ------------------------------------------------------------
  const EM = (window.EM = window.EM || {});
  EM.ElementalKillVar = EM.ElementalKillVar || {};
  EM.ElementalKillVar._uid = EM.ElementalKillVar._uid || 1;

  BattleManager._emEKV_serial = BattleManager._emEKV_serial || 0;

  const _BM_startAction = BattleManager.startAction;
  BattleManager.startAction = function() {
    this._emEKV_serial = (this._emEKV_serial || 0) + 1;
    const action = this._action;
    if (action) {
      action._emEKV_uid = EM.ElementalKillVar._uid++;
      action._emEKV_serial = this._emEKV_serial;
    }
    _BM_startAction.call(this);
  };

  // ------------------------------------------------------------
  // Resolve element list
  // ------------------------------------------------------------
  const resolveElements = (action) => {
    if (!action || !action.item) return [0];

    if (window.Imported && Imported.YEP_ElementCore && typeof action.getItemElements === 'function') {
      const els = action.getItemElements() || [];
      return els.length > 0 ? els.slice() : [0];
    }

    const item = action.item();
    if (!item || !item.damage) return [0];

    const elementId = Number(item.damage.elementId);
    if (elementId < 0) {
      const subject = action.subject && action.subject();
      const attackEls = subject && subject.attackElements ? subject.attackElements() : [];
      return (attackEls && attackEls.length > 0) ? attackEls.slice() : [0];
    }
    if (elementId > 0) return [elementId];
    return [0];
  };

  const applyCountingMode = (elements) => {
    if (!Array.isArray(elements) || elements.length <= 0) return [0];
    if (multiMode === 'first') return [elements[0] ?? 0];
    return elements;
  };

  const awardKill = (elementsRaw) => {
    const elements = applyCountingMode(elementsRaw);
    const list = uniq(elements);
    if (list.length <= 0) list.push(0);

    for (let i = 0; i < list.length; i++) {
      const elementId = list[i];
      const varId = map[elementId] || 0;
      incVar(varId, 1);
    }
  };

  // ------------------------------------------------------------
  // Record last-hit context during apply ONLY if it actually dealt HP damage.
  // This avoids neutral being stored from a base Attack that got replaced.
  // ------------------------------------------------------------
  const _GA_apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function(target) {
    _GA_apply.call(this, target);

    if (!target || !target.isEnemy || !target.isEnemy()) return;

    const subject = this.subject && this.subject();
    if (!subject || !subject.isActor || !subject.isActor()) return;

    // Gate: only remember context if this application dealt HP damage/heal.
    // Replace Attack base-action often yields 0 hpDamage; we ignore it.
    const r = target.result ? target.result() : null;
    const hpDelta = r ? Number(r.hpDamage || 0) : 0;
    if (!hpDelta) return;

    target._emEKV_lastElements = resolveElements(this);
    target._emEKV_lastUid = this._emEKV_uid || 0;
    target._emEKV_lastSerial = this._emEKV_serial || (BattleManager._emEKV_serial || 0);
    target._emEKV_lastDidHp = true;
  };

  // ------------------------------------------------------------
  // Primary: detect alive->dead transition during executeDamage
  // ------------------------------------------------------------
  const _GA_executeDamage = Game_Action.prototype.executeDamage;
  Game_Action.prototype.executeDamage = function(target, value) {
    const wasAlive = !!(target && target.isAlive && target.isAlive());
    _GA_executeDamage.call(this, target, value);

    if (!target || !wasAlive) return;
    if (!target.isDead || !target.isDead()) return;

    const subject = this.subject && this.subject();
    if (!subject || !subject.isActor || !subject.isActor()) return;
    if (!target.isEnemy || !target.isEnemy()) return;

    const uid = this._emEKV_uid || 0;
    if (uid && target._emEKV_lastKillUid === uid) return;
    target._emEKV_lastKillUid = uid;

    // Set last-hit context to this damaging action
    target._emEKV_lastElements = resolveElements(this);
    target._emEKV_lastUid = uid;
    target._emEKV_lastSerial = this._emEKV_serial || (BattleManager._emEKV_serial || 0);
    target._emEKV_lastDidHp = true;

    awardKill(target._emEKV_lastElements);
  };

  // ------------------------------------------------------------
  // Fallback: scripted kills that bypass executeDamage.
  // Only credit if we saw HP damage on this target in this serial.
  // ------------------------------------------------------------
  const _GBB_die = Game_BattlerBase.prototype.die;
  Game_BattlerBase.prototype.die = function() {
    _GBB_die.call(this);

    if (!this.isEnemy || !this.isEnemy()) return;

    const serialNow = BattleManager._emEKV_serial || 0;
    const lastSerial = this._emEKV_lastSerial || 0;
    if (lastSerial !== serialNow) return;

    // Must have HP impact context (prevents Replace Attack neutral)
    if (!this._emEKV_lastDidHp) return;

    const lastUid = this._emEKV_lastUid || 0;
    if (lastUid && this._emEKV_lastKillUid === lastUid) return;

    const els = this._emEKV_lastElements || [];
    if (!els || els.length <= 0) return;

    this._emEKV_lastKillUid = lastUid;
    awardKill(els);
  };

})();
