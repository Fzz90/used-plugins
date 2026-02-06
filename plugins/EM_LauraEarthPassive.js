/*:
 * @plugindesc v1.0.1 Laura Passive: Jika Laura menggunakan Skill dengan elemen Earth (ID 6) termasuk <Multiple Elements>, beri State 27 selama 3 turn. Kompatibel YEP_ElementCore + YEP_SkillCore.
 * @author Faiz Syihab
 *
 * @param Laura Actor ID
 * @type number
 * @min 1
 * @desc Actor ID untuk Laura.
 * @default 1
 *
 * @param Earth Element ID
 * @type number
 * @min 1
 * @desc Element ID untuk Earth.
 * @default 6
 *
 * @param Trigger State ID
 * @type number
 * @min 1
 * @desc State ID yang akan diberikan ke Laura.
 * @default 27
 *
 * @param State Turns
 * @type number
 * @min 1
 * @desc Durasi state dalam turn.
 * @default 3
 *
 * @help
 * ============================================================================
 * EM_LauraEarthPassive.js
 * ============================================================================
 * Fitur:
 * - Jika Laura memakai SKILL yang elemen-nya mencakup Earth Element ID,
 *   maka Laura mendapat State (Trigger State ID) selama X turn.
 *
 * Kompatibilitas:
 * - YEP_ElementCore: pakai Game_Action.getItemElements() untuk elemen final,
 *   termasuk <Multiple Elements: x>.
 * - YEP_SkillCore v1.13: plugin ini tidak mengubah Game_Action.apply() dan
 *   memanfaatkan applyGlobal() agar aman terhadap fase before/after eval. :contentReference[oaicite:2]{index=2}
 *
 * Catatan:
 * - Hanya untuk SKILL, bukan item.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_LauraEarthPassive = true;

var EM = EM || {};
EM.LauraEarthPassive = EM.LauraEarthPassive || {};
EM.LauraEarthPassive.version = "1.0.1";

(function () {
  "use strict";

  var pluginName = "EM_LauraEarthPassive";
  var params = PluginManager.parameters(pluginName);

  var LAURA_ACTOR_ID = Number(params["Laura Actor ID"] || 1);
  var EARTH_ELEMENT_ID = Number(params["Earth Element ID"] || 6);
  var TRIGGER_STATE_ID = Number(params["Trigger State ID"] || 27);
  var STATE_TURNS = Math.max(1, Number(params["State Turns"] || 3));

  function isLaura(battler) {
    return (
      battler &&
      battler.isActor &&
      battler.isActor() &&
      battler.actorId &&
      battler.actorId() === LAURA_ACTOR_ID
    );
  }

  function actionHasElement(action, elementId) {
    if (!action || !action.item || !action.item()) return false;

    // YEP_ElementCore provides getItemElements() to include multiple elements.
    if (action.getItemElements) {
      var list = action.getItemElements() || [];
      return list.indexOf(elementId) >= 0;
    }

    // Fallback vanilla: only primary element
    var item = action.item();
    if (item.damage && item.damage.elementId !== undefined) {
      return item.damage.elementId === elementId;
    }
    return false;
  }

  function applyStateWithTurns(battler, stateId, turns) {
    if (!battler || !battler.addState) return;
    battler.addState(stateId);

    battler._stateTurns = battler._stateTurns || {};
    var current = battler._stateTurns[stateId] || 0;
    battler._stateTurns[stateId] = Math.max(current, turns);
  }

  // --------------------------------------------------------------------------
  // Hook: applyGlobal() - runs once per action, safe with SkillCore's apply phases :contentReference[oaicite:3]{index=3}
  // --------------------------------------------------------------------------
  var _EM_Game_Action_applyGlobal = Game_Action.prototype.applyGlobal;
  Game_Action.prototype.applyGlobal = function () {
    _EM_Game_Action_applyGlobal.call(this);

    // Guard: prevent double trigger if any plugin calls applyGlobal more than once
    if (this._emLauraEarthPassiveProcessed) return;
    this._emLauraEarthPassiveProcessed = true;

    if (!this.isSkill || !this.isSkill()) return;

    var subject = this.subject ? this.subject() : null;
    if (!isLaura(subject)) return;

    if (!actionHasElement(this, EARTH_ELEMENT_ID)) return;

    applyStateWithTurns(subject, TRIGGER_STATE_ID, STATE_TURNS);
  };
})();
