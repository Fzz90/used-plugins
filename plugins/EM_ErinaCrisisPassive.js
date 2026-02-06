//=============================================================================
// EM_ErinaCrisisPassive.js
//=============================================================================
/*:
 * @plugindesc v1.3.0 Passive Erina (Actor 4): aktif jika ada ally Crisis atau KO. Saat aktif, healing Erina x2. Jika Erina menghidupkan ally KO, target dapat Buff LUK 3 turn. (Kompatibel YEP_BEC/YEP_DamageCore/YEP_RowFormation/YEP_AutoPassiveStates/YEP_EquipCore/YEP_EquipBattleSkills)
 * @author Faiz Syihab
 *
 * @param ---General---
 * @default
 *
 * @param Erina Actor ID
 * @parent ---General---
 * @type number
 * @min 1
 * @desc Actor ID untuk Erina.
 * @default 4
 *
 * @param Passive State ID
 * @parent ---General---
 * @type number
 * @min 0
 * @desc State ID yang menandakan "Passive Erina Aktif". (Buat state di database)
 * @default 0
 *
 * @param Heal Multiplier
 * @parent ---General---
 * @type number
 * @decimals 2
 * @min 1
 * @desc Multiplier healing Erina saat passive aktif.
 * @default 2
 *
 * @param LUK Buff Turns
 * @parent ---General---
 * @type number
 * @min 1
 * @desc Durasi buff LUK (turn) untuk target yang baru bangkit dari KO oleh Erina saat passive aktif.
 * @default 3
 *
 * @help
 * ============================================================================
 * EM_ErinaCrisisPassive.js (v1.3.0)
 * ============================================================================
 * Fitur:
 * 1) Passive Erina (Actor ID default 4) AKTIF jika:
 *    - Ada >= 1 anggota party (alive) yang isCrisis(), ATAU
 *    - Ada >= 1 anggota party yang KO (HP = 0).
 *
 * 2) Saat passive aktif, semua healing HP dari Erina x2 (default).
 *    Kompatibel dengan YEP_DamageCore karena multiplier disisipkan di applyHealRate.
 *
 * 3) Jika ada party member KO dan passive aktif, lalu Erina merevive (menghilangkan KO)
 *    sehingga target yang tadinya dead menjadi hidup, target akan mendapat:
 *    - Buff LUK selama 3 turn (default).
 *
 * ============================================================================
 * Cara pakai
 * ============================================================================
 * 1) Buat sebuah State di database (misal: "Erina Passive Active").
 * 2) Set parameter "Passive State ID" ke ID state tersebut.
 * 3) Pastikan urutan plugin (recommended):
 *
 *    YEP_BattleEngineCore
 *    YEP_RowFormation
 *    YEP_DamageCore
 *    (plugin YEP lainnya: EquipCore, EquipBattleSkills, AutoPassiveStates, dll)
 *    EM_ErinaCrisisPassive   <-- taruh di bawah semuanya
 *
 * ============================================================================
 * Notes kompatibilitas
 * ============================================================================
 * - YEP_BattleEngineCore dan YEP_RowFormation sama-sama alias Game_Action.apply,
 *   jadi plugin ini WAJIB berada di bawah mereka agar chain tetap aman.
 *
 * ============================================================================
 * End of Help
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_ErinaCrisisPassive = true;

var EM = EM || {};
EM.ErinaCrisisPassive = EM.ErinaCrisisPassive || {};

(function () {
  "use strict";

  //--------------------------------------------------------------------------
  // Parameters
  //--------------------------------------------------------------------------
  var params = PluginManager.parameters("EM_ErinaCrisisPassive");

  var ERINA_ACTOR_ID = Number(params["Erina Actor ID"] || 4);
  var PASSIVE_STATE_ID = Number(params["Passive State ID"] || 0);
  var HEAL_MULT = Number(params["Heal Multiplier"] || 2);
  var LUK_BUFF_TURNS = Number(params["LUK Buff Turns"] || 3);

  var PARAM_LUK = 7; // MV paramId for LUK (0..7)

  //--------------------------------------------------------------------------
  // Helpers
  //--------------------------------------------------------------------------
  function isBattleActive() {
    return $gameParty && $gameParty.inBattle && $gameParty.inBattle();
  }

  function erinaActor() {
    if (!$gameActors) return null;
    return $gameActors.actor(ERINA_ACTOR_ID);
  }

  function hasAnyCrisisOrKO() {
    if (!$gameParty) return false;

    // KO check
    if ($gameParty.deadMembers && $gameParty.deadMembers().length > 0)
      return true;

    // Crisis check (only alive members)
    var members = $gameParty.aliveMembers
      ? $gameParty.aliveMembers()
      : $gameParty.members();
    for (var i = 0; i < members.length; i++) {
      var m = members[i];
      if (!m) continue;
      if (m.isCrisis && m.isCrisis()) return true;
    }
    return false;
  }

  function isErinaPassiveActive() {
    var erina = erinaActor();
    if (!erina) return false;
    if (!isBattleActive()) return false;
    if (PASSIVE_STATE_ID <= 0) return false;
    return erina.isStateAffected(PASSIVE_STATE_ID);
  }

  function refreshErinaPassive() {
    if (PASSIVE_STATE_ID <= 0) return;

    var erina = erinaActor();
    if (!erina) return;

    if (!isBattleActive()) {
      // out of battle -> ensure removed
      if (erina.isStateAffected(PASSIVE_STATE_ID))
        erina.removeState(PASSIVE_STATE_ID);
      return;
    }

    var shouldOn = hasAnyCrisisOrKO();
    var isOn = erina.isStateAffected(PASSIVE_STATE_ID);

    if (shouldOn && !isOn) {
      erina.addState(PASSIVE_STATE_ID);
    } else if (!shouldOn && isOn) {
      erina.removeState(PASSIVE_STATE_ID);
    }
  }

  //--------------------------------------------------------------------------
  // Refresh timing hooks (safe & lightweight)
  //--------------------------------------------------------------------------
  // Battle start
  var _EM_Game_Party_onBattleStart = Game_Party.prototype.onBattleStart;
  Game_Party.prototype.onBattleStart = function () {
    _EM_Game_Party_onBattleStart.call(this);
    refreshErinaPassive();
  };

  // Battle end
  var _EM_Game_Party_onBattleEnd = Game_Party.prototype.onBattleEnd;
  Game_Party.prototype.onBattleEnd = function () {
    _EM_Game_Party_onBattleEnd.call(this);
    refreshErinaPassive();
  };

  // Any HP changes during battle (covers damage/heal/regen)
  var _EM_Game_Battler_gainHp = Game_Battler.prototype.gainHp;
  Game_Battler.prototype.gainHp = function (value) {
    _EM_Game_Battler_gainHp.call(this, value);
    if (isBattleActive()) refreshErinaPassive();
  };

  // After each action ends (works with and without YEP_BattleEngineCore because we alias whatever is current)
  if (BattleManager && BattleManager.endAction) {
    var _EM_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
      _EM_BattleManager_endAction.call(this);
      refreshErinaPassive();
    };
  }

  //--------------------------------------------------------------------------
  // Healing x2 integration (YEP_DamageCore friendly)
  //--------------------------------------------------------------------------
  // YEP_DamageCore uses applyHealRate to apply rec & healRate, and keeps heal negative. :contentReference[oaicite:2]{index=2}
  var _EM_Game_Action_applyHealRate = Game_Action.prototype.applyHealRate;
  Game_Action.prototype.applyHealRate = function (value, baseDamage, target) {
    value = _EM_Game_Action_applyHealRate.call(this, value, baseDamage, target);

    // Healing values in YEP_DamageCore are negative (because sign flips for recovery).
    if (value < 0) {
      var subject = this.subject();
      if (
        subject &&
        subject.isActor &&
        subject.isActor() &&
        subject.actorId &&
        subject.actorId() === ERINA_ACTOR_ID
      ) {
        if (isErinaPassiveActive()) {
          value *= HEAL_MULT;
          // keep negative (healing)
          value = Math.min(0, value);
        }
      }
    }
    return value;
  };

  //--------------------------------------------------------------------------
  // LUK buff when Erina revives a KO ally while passive active
  //--------------------------------------------------------------------------
  // We detect "wasDead -> nowAlive" per target during apply.
  var _EM_Game_Action_apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function (target) {
    var subject = this.subject();
    var wasDead = !!(target && target.isDead && target.isDead());

    _EM_Game_Action_apply.call(this, target);

    // Only during battle, Erina as subject, passive active
    if (!isBattleActive()) return;
    if (!subject || !subject.isActor || !subject.isActor()) return;
    if (!subject.actorId || subject.actorId() !== ERINA_ACTOR_ID) return;
    if (!isErinaPassiveActive()) return;

    // Target revived?
    var nowAlive = !!(target && target.isAlive && target.isAlive());
    if (!wasDead || !nowAlive) return;

    // If target revived, grant LUK buff for 3 turns
    if (target && target.addBuff) {
      target.addBuff(PARAM_LUK, LUK_BUFF_TURNS);
    }
  };
})();
