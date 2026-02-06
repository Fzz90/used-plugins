/*:
 * @plugindesc (v1.0.0) Permafrost Core for Cryomancer (Rachel): MAT+%, Ice DMG+%, Ice MP Cost-% while Ice Marker is active. (ES6)
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_PermafrostCore.js
 * ============================================================================
 * Trigger:
 * - Works for a specific Actor (default: Rachel) when she has the Ice Marker
 *   state active (ex: Ice-Enchanted / Ice Marker).
 *
 * Effects (while active):
 * - MAT +15% (multiplicative)
 * - Ice Damage +20% (multiplicative)
 * - MP Cost for Ice-element skills -10% (multiplicative)
 *
 * Optional:
 * - Auto-apply Permafrost state (default: 90) while the trigger is active.
 *   When the Ice Marker ends, Permafrost state will be removed.
 *
 * Notes on "Ice-element skill" detection:
 * - If YEP_ElementCore is installed, this plugin uses action.getItemElements()
 *   to detect multi-elements.
 * - Otherwise, it uses skill.damage.elementId (and elementId < 0 fallback).
 *
 * Recommended placement:
 * - Below YEP_SkillCore and YEP_ElementCore (if you use them).
 *
 * ============================================================================
 * @param ActorId
 * @text Cryomancer Actor (Rachel)
 * @type actor
 * @default 3
 *
 * @param IceMarkerStates
 * @text Ice Marker States
 * @type state[]
 * @default ["66"]
 * @desc List of Ice Marker states. Permafrost activates if ANY of these states is active.
 *
 * @param PermafrostStateId
 * @text Permafrost State
 * @type state
 * @default 90
 *
 * @param AutoApplyPermafrostState
 * @text Auto Apply Permafrost State
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param IceElementId
 * @text Ice Element ID
 * @type number
 * @min 1
 * @default 3
 * @desc Your database element ID for Ice (example: 3).
 *
 * @param MatMultiplier
 * @text MAT Multiplier
 * @type number
 * @decimals 2
 * @default 1.15
 *
 * @param IceDamageMultiplier
 * @text Ice Damage Multiplier
 * @type number
 * @decimals 2
 * @default 1.20
 *
 * @param IceMpCostMultiplier
 * @text Ice MP Cost Multiplier
 * @type number
 * @decimals 2
 * @default 0.90
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_PermafrostCore";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const P = {
    actorId: Number(params.ActorId || 0),
    iceMarkerStates: (() => {
      try {
        const arr = JSON.parse(params.IceMarkerStates || "[]");
        return arr.map(Number).filter((id) => id > 0);
      } catch (e) {
        return [];
      }
    })(),

    permafrostStateId: Number(params.PermafrostStateId || 0),
    autoApplyState:
      String(params.AutoApplyPermafrostState || "true") === "true",
    iceElementId: Number(params.IceElementId || 0),
    matMul: Number(params.MatMultiplier || 1.15),
    iceDmgMul: Number(params.IceDamageMultiplier || 1.2),
    iceMpMul: Number(params.IceMpCostMultiplier || 0.9),
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const isTargetActor = (battler) =>
    battler &&
    battler.isActor &&
    battler.isActor() &&
    battler.actorId &&
    battler.actorId() === P.actorId;

  const hasIceMarker = (battler) => {
    if (!isTargetActor(battler)) return false;
    if (!P.iceMarkerStates || P.iceMarkerStates.length === 0) return false;
    return P.iceMarkerStates.some((sid) => battler.isStateAffected(sid));
  };

  const hasPermafrostTrigger = (battler) =>
    $gameParty.inBattle() && hasIceMarker(battler);

  const ensurePermafrostStateSync = (battler) => {
    if (!P.autoApplyState) return;
    if (
      !battler ||
      !battler.isStateAffected ||
      !battler.addState ||
      !battler.removeState
    )
      return;
    if (!isTargetActor(battler)) return;

    const shouldHave = hasPermafrostTrigger(battler);
    const hasState = battler.isStateAffected(P.permafrostStateId);

    if (shouldHave && !hasState) battler.addState(P.permafrostStateId);
    if (!shouldHave && hasState) battler.removeState(P.permafrostStateId);
  };

  const itemHasIceElement = (action, item, subject) => {
    if (!item) return false;
    const iceId = P.iceElementId;
    if (iceId <= 0) return false;

    // YEP_ElementCore: multi-element support via getItemElements()
    if (
      Imported &&
      Imported.YEP_ElementCore &&
      action &&
      action.getItemElements
    ) {
      const elements = action.getItemElements() || [];
      return elements.includes(iceId);
    }

    // Vanilla fallback
    const eid = item.damage ? Number(item.damage.elementId || 0) : 0;
    if (eid > 0) return eid === iceId;

    // elementId < 0 => normal attack elements (rare for skills, but handle)
    if (eid < 0 && subject && subject.attackElements) {
      const atks = subject.attackElements() || [];
      return atks.includes(iceId);
    }

    return false;
  };

  // --------------------------------------------------------------------------
  // 1) Auto-apply/remove Permafrost state (optional)
  //    - Sync on refresh + battle start + state changes.
  // --------------------------------------------------------------------------
  const _Game_BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
  Game_BattlerBase.prototype.refresh = function () {
    _Game_BattlerBase_refresh.call(this);
    if ($gameParty && $gameParty.inBattle && $gameParty.inBattle()) {
      ensurePermafrostStateSync(this);
    }
  };

  const _Game_Battler_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    _Game_Battler_addState.call(this, stateId);
    if ($gameParty && $gameParty.inBattle && $gameParty.inBattle()) {
      ensurePermafrostStateSync(this);
    }
  };

  const _Game_Battler_removeState = Game_Battler.prototype.removeState;
  Game_Battler.prototype.removeState = function (stateId) {
    _Game_Battler_removeState.call(this, stateId);
    if ($gameParty && $gameParty.inBattle && $gameParty.inBattle()) {
      ensurePermafrostStateSync(this);
    }
  };

  const _BattleManager_startBattle = BattleManager.startBattle;
  BattleManager.startBattle = function () {
    _BattleManager_startBattle.call(this);
    // Sync at battle start
    $gameParty.members().forEach((a) => ensurePermafrostStateSync(a));
  };

  const _BattleManager_endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function (result) {
    // Clean up on battle end (optional)
    if (P.autoApplyState && P.permafrostStateId > 0) {
      $gameParty.members().forEach((a) => {
        if (isTargetActor(a) && a.isStateAffected(P.permafrostStateId))
          a.removeState(P.permafrostStateId);
      });
    }
    _BattleManager_endBattle.call(this, result);
  };

  // --------------------------------------------------------------------------
  // 2) MAT +% (multiplicative) while trigger is active
  //    paramId 4 = MAT in MV
  // --------------------------------------------------------------------------
  const _Game_BattlerBase_param = Game_BattlerBase.prototype.param;
  Game_BattlerBase.prototype.param = function (paramId) {
    const base = _Game_BattlerBase_param.call(this, paramId);
    if (paramId === 4 && hasPermafrostTrigger(this)) {
      return Math.max(1, Math.floor(base * P.matMul));
    }
    return base;
  };

  // --------------------------------------------------------------------------
  // 3) Ice Damage +% while trigger is active
  //    Multiply final damage value for actions that include Ice element.
  // --------------------------------------------------------------------------
  const _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function (target, critical) {
    let value = _Game_Action_makeDamageValue.call(this, target, critical);

    const subject = this.subject();
    if (!subject || !hasPermafrostTrigger(subject)) return value;
    if (!this.isDamage || !this.isDamage()) return value;

    const item = this.item();
    if (!itemHasIceElement(this, item, subject)) return value;

    // Apply multiplier (preserve sign)
    const sign = value >= 0 ? 1 : -1;
    value = Math.floor(Math.abs(value) * P.iceDmgMul) * sign;
    return value;
  };

  // --------------------------------------------------------------------------
  // 4) Ice MP Cost -% while trigger is active
  // --------------------------------------------------------------------------
  const _Game_BattlerBase_skillMpCost = Game_BattlerBase.prototype.skillMpCost;
  Game_BattlerBase.prototype.skillMpCost = function (skill) {
    let cost = _Game_BattlerBase_skillMpCost.call(this, skill);

    if (!hasPermafrostTrigger(this)) return cost;
    if (!skill) return cost;

    // Determine ice element from skill itself (no action object available here)
    const eid = skill.damage ? Number(skill.damage.elementId || 0) : 0;
    const isIce =
      (eid > 0 && eid === P.iceElementId) ||
      (Imported &&
      Imported.YEP_ElementCore &&
      skill.multipleElements &&
      Array.isArray(skill.multipleElements)
        ? skill.multipleElements.includes(P.iceElementId)
        : false);

    if (!isIce) return cost;

    cost = Math.max(0, Math.floor(cost * P.iceMpMul));
    return cost;
  };
})();
