/*:
 * @plugindesc v1.0.0 Compatibility patch: YEP_Z_StateProtection Trigger Add State bypasses EM_AilmentShield category block.
 * @author Codex
 *
 * @help
 * ============================================================================
 * EM_YEPZ_StateProtection_AilmentShield_Patch.js
 * ============================================================================
 * Purpose
 * - Resolve conflict between:
 *   - YEP_Z_StateProtection.js
 *   - EM_AilmentShield.js
 *
 * Problem
 * - EM_AilmentShield hooks Game_Battler.addState as a global safety net.
 * - YEP_Z_StateProtection lunatic trigger code (example: Trigger Add State)
 *   also uses battler.addState(...).
 * - Result: states added by YEP_Z protection triggers can be blocked by
 *   AilmentShield category filtering.
 *
 * What this patch does
 * - During YEP_Z lunatic protection evaluation only, it temporarily routes
 *   subject/target addState to MV native-equivalent addState logic so trigger
 *   states are applied as intended.
 * - Outside of YEP_Z lunatic protection evaluation, EM_AilmentShield behavior
 *   remains unchanged.
 *
 * Load Order
 * - Place BELOW both:
 *   - YEP_Z_StateProtection.js
 *   - EM_AilmentShield.js
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_YEPZ_StateProtection_AilmentShield_Patch = true;

(function () {
  "use strict";

  if (!Imported.YEP_Z_StateProtection || !Imported.EM_AilmentShield) return;
  if (!Game_Action || !Game_Action.prototype) return;
  if (typeof Game_Action.prototype.lunaticStateProtectEval !== "function") return;

  var TAG_ORIG_ADD = "__emYspAspOrigAddState";

  function addStateNativeEquivalent(battler, stateId) {
    stateId = Number(stateId || 0);
    if (!battler || stateId <= 0) return;
    if (!battler.isStateAddable || !battler.isStateAffected) return;
    if (!battler.addNewState || !battler.refresh || !battler.resetStateCounts) return;

    if (battler.isStateAddable(stateId)) {
      if (!battler.isStateAffected(stateId)) {
        battler.addNewState(stateId);
        battler.refresh();
      }
      battler.resetStateCounts(stateId);
      if (battler._result && battler._result.pushAddedState) {
        battler._result.pushAddedState(stateId);
      }
    }
  }

  function patchBattlerAddState(battler, patchedList) {
    if (!battler || typeof battler.addState !== "function") return;
    if (battler[TAG_ORIG_ADD]) return;

    battler[TAG_ORIG_ADD] = battler.addState;
    battler.addState = function (stateId) {
      addStateNativeEquivalent(this, stateId);
    };
    patchedList.push(battler);
  }

  function restoreBattlers(patchedList) {
    for (var i = 0; i < patchedList.length; i++) {
      var battler = patchedList[i];
      if (!battler || !battler[TAG_ORIG_ADD]) continue;
      battler.addState = battler[TAG_ORIG_ADD];
      delete battler[TAG_ORIG_ADD];
    }
  }

  var _Game_Action_lunaticStateProtectEval =
    Game_Action.prototype.lunaticStateProtectEval;
  Game_Action.prototype.lunaticStateProtectEval = function (
    target,
    state,
    value,
    data,
    originalValue
  ) {
    var patched = [];
    patchBattlerAddState(this.subject(), patched);
    patchBattlerAddState(target, patched);

    try {
      return _Game_Action_lunaticStateProtectEval.call(
        this,
        target,
        state,
        value,
        data,
        originalValue
      );
    } finally {
      restoreBattlers(patched);
    }
  };
})();
