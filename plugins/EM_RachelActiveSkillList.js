/*:
 * @plugindesc (v1.2.2) Rachel Active Skill List - custom active skill effects for Rachel. (RPG Maker MV)
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_RachelActiveSkillList.js
 * ============================================================================
 * Central plugin for Rachel's active skill effects.
 *
 * Current supported skill:
 * - Crystal Veil
 *
 * Crystal Veil Mastery Effects:
 * - Lv 0-2  : Basic
 * - Lv 3-5  : Bronze, Magic Damage Taken -5%, MDF buff +1 turn
 * - Lv 6-8  : Silver, Magic Damage Taken -8%, Debuff Rate -15%,
 *              MDF buff +2 turns
 * - Lv 9-10 : Gold, Magic Damage Taken -10%, Debuff Rate -20%,
 *              MDF buff +2 turns, extra MDF buff +10%,
 *              emergency heal 8% Max HP with popup/animation if target HP
 *              is 50% or below.
 *
 * Notes:
 * - This plugin does NOT add extra states for Bronze/Silver/Gold.
 * - It only uses Crystal Veil's main state.
 * - Recommended Crystal Veil State ID: 179
 *
 * Recommended placement:
 * - Below YEP_SkillCore
 * - Below YEP_SkillMasteryLevels
 * - Below YEP_ElementCore if used
 * - Below EM_PermafrostCore
 *
 * Compatibility notes:
 * - This plugin safely aliases Game_Action.apply.
 * - This plugin safely aliases Game_Action.makeDamageValue.
 * - This plugin safely aliases Game_BattlerBase.debuffRate.
 * - It does not globally block addState.
 *
 * ============================================================================
 *
 * @param Rachel Actor ID
 * @text Rachel Actor ID
 * @type actor
 * @default 3
 *
 * @param --- Crystal Veil ---
 * @default
 *
 * @param Crystal Veil Skill ID
 * @parent --- Crystal Veil ---
 * @type skill
 * @default 0
 * @desc Set this to Crystal Veil's database skill ID.
 *
 * @param Crystal Veil State ID
 * @parent --- Crystal Veil ---
 * @type state
 * @default 179
 * @desc Main Crystal Veil state.
 *
 * @param Bronze Magic Damage Rate
 * @parent --- Crystal Veil ---
 * @type number
 * @decimals 2
 * @default 0.95
 * @desc 0.95 = magical damage taken becomes 95%.
 *
 * @param Silver Magic Damage Rate
 * @parent --- Crystal Veil ---
 * @type number
 * @decimals 2
 * @default 0.92
 * @desc 0.92 = magical damage taken becomes 92%.
 *
 * @param Gold Magic Damage Rate
 * @parent --- Crystal Veil ---
 * @type number
 * @decimals 2
 * @default 0.90
 * @desc 0.90 = magical damage taken becomes 90%.
 *
 * @param Silver Debuff Rate
 * @parent --- Crystal Veil ---
 * @type number
 * @decimals 2
 * @default 0.85
 * @desc 0.85 = debuff success rate becomes 85%.
 *
 * @param Gold Debuff Rate
 * @parent --- Crystal Veil ---
 * @type number
 * @decimals 2
 * @default 0.80
 * @desc 0.80 = debuff success rate becomes 80%.
 *
 * @param Gold Heal HP Rate
 * @parent --- Crystal Veil ---
 * @type number
 * @decimals 2
 * @default 0.08
 * @desc 0.08 = heal 8% Max HP.
 *
 * @param Gold Heal Threshold
 * @parent --- Crystal Veil ---
 * @type number
 * @decimals 2
 * @default 0.50
 * @desc 0.50 = heal only if target HP is 50% or below.
 *
 * @param Gold Heal Popup
 * @parent --- Crystal Veil ---
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @param Gold Heal Animation ID
 * @parent --- Crystal Veil ---
 * @type animation
 * @default 0
 * @desc Animation played on the healed target after <After Eval> when Gold emergency heal triggers. 0 = none.
 */

var Imported = Imported || {};
Imported.EM_RachelActiveSkillList = true;

var EM = EM || {};
EM.RachelActiveSkillList = EM.RachelActiveSkillList || {};

(function () {
  "use strict";

  var PLUGIN_NAME = "EM_RachelActiveSkillList";
  var MDF_PARAM_ID = 5;
  var params = PluginManager.parameters(PLUGIN_NAME);

  var P = {
    rachelActorId: Number(params["Rachel Actor ID"] || 3),

    crystalVeilSkillId: Number(params["Crystal Veil Skill ID"] || 0),
    crystalVeilStateId: Number(params["Crystal Veil State ID"] || 179),

    bronzeMagicDamageRate: Number(params["Bronze Magic Damage Rate"] || 0.95),
    silverMagicDamageRate: Number(params["Silver Magic Damage Rate"] || 0.92),
    goldMagicDamageRate: Number(params["Gold Magic Damage Rate"] || 0.9),

    silverDebuffRate: Number(params["Silver Debuff Rate"] || 0.85),
    goldDebuffRate: Number(params["Gold Debuff Rate"] || 0.8),

    goldHealRate: Number(params["Gold Heal HP Rate"] || 0.08),
    goldHealThreshold: Number(params["Gold Heal Threshold"] || 0.5),
    goldHealPopup: String(params["Gold Heal Popup"] || "true") === "true",
    goldHealAnimationId: Number(params["Gold Heal Animation ID"] || 0),
  };

  var RASL = EM.RachelActiveSkillList;
  RASL.version = "1.2.2";

  // -------------------------------------------------------------------------
  // Basic Helpers
  // -------------------------------------------------------------------------

  RASL.isActor = function (battler, actorId) {
    return (
      battler &&
      battler.isActor &&
      battler.isActor() &&
      battler.actorId &&
      battler.actorId() === actorId
    );
  };

  RASL.isRachel = function (battler) {
    return RASL.isActor(battler, P.rachelActorId);
  };

  RASL.isSkill = function (item, skillId) {
    return item && DataManager.isSkill(item) && item.id === skillId;
  };

  RASL.isCrystalVeil = function (item) {
    return RASL.isSkill(item, P.crystalVeilSkillId);
  };

  RASL.masteryLevel = function (user, skill) {
    if (!user || !skill) return 0;
    if (typeof user.skillMasteryLevel === "function") {
      return Number(user.skillMasteryLevel(skill.id) || 0);
    }
    return 0;
  };

  RASL.crystalVeilTier = function (level) {
    if (level >= 9) return "gold";
    if (level >= 6) return "silver";
    if (level >= 3) return "bronze";
    return "basic";
  };

  RASL.hasCrystalVeil = function (target) {
    return (
      target &&
      target.isStateAffected &&
      target.isStateAffected(P.crystalVeilStateId)
    );
  };

  RASL.hasCrystalVeilBonus = function (target) {
    return (
      RASL.hasCrystalVeil(target) &&
      target._emRachelCrystalVeilTier &&
      target._emRachelCrystalVeilTier !== "basic"
    );
  };

  RASL.clearCrystalVeilBonusIfNeeded = function (target) {
    if (!target) return;
    if (!RASL.hasCrystalVeil(target)) {
      target._emRachelCrystalVeilTier = null;
    }
  };

  RASL.captureCrystalVeilPreApplyHpRate = function (user, target, skill) {
    if (!RASL.isRachel(user)) return;
    if (!RASL.isCrystalVeil(skill)) return;
    if (!target || target.isDead()) return;

    target._emRachelCrystalVeilPreHpRate = target.hpRate
      ? Number(target.hpRate())
      : null;
  };

  RASL.clearCrystalVeilPreApplyHpRate = function (target) {
    if (!target) return;
    target._emRachelCrystalVeilPreHpRate = null;
  };

  RASL.crystalVeilGoldHealCheckRate = function (target) {
    var preRate = target ? target._emRachelCrystalVeilPreHpRate : null;
    RASL.clearCrystalVeilPreApplyHpRate(target);

    if (typeof preRate === "number" && isFinite(preRate)) {
      return preRate;
    }

    if (target && target.hpRate) {
      return Number(target.hpRate());
    }

    return 1.0;
  };

  RASL.gainHpWithoutTouchingResult = function (target, value) {
    if (!target) return;

    if (typeof target.setHp === "function" && typeof target.hp === "number") {
      target.setHp(target.hp + value);
    } else if (typeof target.gainHp === "function") {
      target.gainHp(value);
    }
  };

  RASL.makeGoldHealPopupResult = function (heal) {
    if (typeof Game_ActionResult === "undefined") return null;

    var result = new Game_ActionResult();
    result.used = true;
    result.success = true;
    result.hpAffected = true;
    result.hpDamage = -heal;
    result.mpDamage = 0;
    result.tpDamage = 0;
    result.missed = false;
    result.evaded = false;

    return result;
  };

  RASL.startGoldHealPopup = function (target, heal) {
    if (!target || !target.startDamagePopup) return false;

    var popupResult = RASL.makeGoldHealPopupResult(heal);
    if (!popupResult) return false;

    var mainResult = target._result;
    target._result = popupResult;
    try {
      target.startDamagePopup();
    } finally {
      target._result = mainResult;
    }

    return true;
  };

  RASL.healTargetByMhpRate = function (
    target,
    rate,
    showPopup,
    animationId,
    action,
  ) {
    if (!target || target.isDead()) return 0;

    var heal = Math.round(target.mhp * rate);
    if (heal <= 0) return 0;

    RASL.gainHpWithoutTouchingResult(target, heal);

    if (target.performRecovery) {
      target.performRecovery();
    }

    if (animationId > 0 && target.startAnimation) {
      target.startAnimation(animationId, false, 0);
    }

    if (showPopup && target.startDamagePopup) {
      RASL.startGoldHealPopup(target, heal);
    }

    return heal;
  };

  RASL.crystalVeilMdfBuffTurns = function (skill) {
    if (!skill || !skill.effects) return 0;

    var turns = 0;
    for (var i = 0; i < skill.effects.length; i++) {
      var effect = skill.effects[i];
      if (!effect) continue;
      if (effect.code !== Game_Action.EFFECT_ADD_BUFF) continue;
      if (effect.dataId !== MDF_PARAM_ID) continue;
      turns = Math.max(turns, Number(effect.value1 || 0));
    }

    return turns;
  };

  RASL.crystalVeilMdfBonusTurns = function (tier) {
    if (tier === "gold") return 2;
    if (tier === "silver") return 2;
    if (tier === "bronze") return 1;
    return 0;
  };

  RASL.addCrystalVeilGoldMdfStack = function (target, turns) {
    if (!target || !target.isAlive || !target.isAlive()) return;
    if (!target.increaseBuff || !target.overwriteBuffTurns) return;

    // FzZ_BuffStackRate makes one positive MDF stack equal +10%.
    target.increaseBuff(MDF_PARAM_ID);
    if (target.isBuffAffected && target.isBuffAffected(MDF_PARAM_ID)) {
      target.overwriteBuffTurns(MDF_PARAM_ID, turns);
    }
    if (target.refresh) target.refresh();
  };

  RASL.applyCrystalVeilMdfMasteryEffect = function (target, skill, tier) {
    var baseTurns = RASL.crystalVeilMdfBuffTurns(skill);
    if (baseTurns <= 0) return;

    var bonusTurns = RASL.crystalVeilMdfBonusTurns(tier);
    if (bonusTurns <= 0) return;

    var masteryTurns = baseTurns + bonusTurns;

    if (tier === "gold") {
      RASL.addCrystalVeilGoldMdfStack(target, masteryTurns);
    } else if (
      target &&
      target.isBuffAffected &&
      target.isBuffAffected(MDF_PARAM_ID) &&
      target.overwriteBuffTurns
    ) {
      target.overwriteBuffTurns(MDF_PARAM_ID, masteryTurns);
    }
  };

  // -------------------------------------------------------------------------
  // Crystal Veil: Apply Mastery Tier
  // -------------------------------------------------------------------------

  RASL.applyCrystalVeilMasteryEffect = function (user, target, skill, action) {
    if (!RASL.isRachel(user)) return;
    if (!RASL.isCrystalVeil(skill)) return;
    if (!target || target.isDead()) return;

    var level = RASL.masteryLevel(user, skill);
    var tier = RASL.crystalVeilTier(level);

    target._emRachelCrystalVeilTier = tier;

    RASL.applyCrystalVeilMdfMasteryEffect(target, skill, tier);

    // Gold: Crystal Sanctuary
    // Emergency recovery kecil, hanya saat Crystal Veil dipakai.
    if (tier === "gold") {
      if (RASL.crystalVeilGoldHealCheckRate(target) <= P.goldHealThreshold) {
        RASL.healTargetByMhpRate(
          target,
          P.goldHealRate,
          P.goldHealPopup,
          P.goldHealAnimationId,
          action,
        );
      }
    } else {
      RASL.clearCrystalVeilPreApplyHpRate(target);
    }
  };

  RASL.crystalVeilMagicDamageRate = function (target) {
    RASL.clearCrystalVeilBonusIfNeeded(target);

    if (!RASL.hasCrystalVeilBonus(target)) return 1.0;

    var tier = target._emRachelCrystalVeilTier;

    if (tier === "gold") return P.goldMagicDamageRate;
    if (tier === "silver") return P.silverMagicDamageRate;
    if (tier === "bronze") return P.bronzeMagicDamageRate;

    return 1.0;
  };

  RASL.crystalVeilDebuffRate = function (target) {
    RASL.clearCrystalVeilBonusIfNeeded(target);

    if (!RASL.hasCrystalVeilBonus(target)) return 1.0;

    var tier = target._emRachelCrystalVeilTier;

    if (tier === "gold") return P.goldDebuffRate;
    if (tier === "silver") return P.silverDebuffRate;

    return 1.0;
  };

  // =========================================================================
  // Safe Alias - Apply Skill Effect after YEP <After Eval>
  // =========================================================================

  if (typeof Game_Action.prototype.applyAfterEval === "function") {
    var _Game_Action_applyBeforeEval = Game_Action.prototype.applyBeforeEval;
    Game_Action.prototype.applyBeforeEval = function (target) {
      RASL.captureCrystalVeilPreApplyHpRate(
        this.subject(),
        target,
        this.item(),
      );
      if (_Game_Action_applyBeforeEval) {
        _Game_Action_applyBeforeEval.call(this, target);
      }
    };

    var _Game_Action_applyAfterEval = Game_Action.prototype.applyAfterEval;
    Game_Action.prototype.applyAfterEval = function (target) {
      _Game_Action_applyAfterEval.call(this, target);

      var user = this.subject();
      var item = this.item();

      RASL.applyCrystalVeilMasteryEffect(user, target, item, this);

      // Future Rachel active skill effects can be added here.
      // Example:
      // RASL.applySnowflakeMasteryEffect(user, target, item);
    };
  } else {
    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function (target) {
      RASL.captureCrystalVeilPreApplyHpRate(
        this.subject(),
        target,
        this.item(),
      );
      _Game_Action_apply.call(this, target);

      var user = this.subject();
      var item = this.item();

      RASL.applyCrystalVeilMasteryEffect(user, target, item, this);
    };
  }

  // =========================================================================
  // Safe Alias - Magic Damage Reduction
  // =========================================================================

  var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function (target, critical) {
    var value = _Game_Action_makeDamageValue.call(this, target, critical);

    if (value > 0 && this.isMagical && this.isMagical()) {
      value = Math.round(value * RASL.crystalVeilMagicDamageRate(target));
    }

    return value;
  };

  // =========================================================================
  // Safe Alias - Debuff Resistance
  // =========================================================================

  var _Game_BattlerBase_debuffRate = Game_BattlerBase.prototype.debuffRate;
  Game_BattlerBase.prototype.debuffRate = function (paramId) {
    var rate = _Game_BattlerBase_debuffRate.call(this, paramId);

    rate *= RASL.crystalVeilDebuffRate(this);

    return rate;
  };
})();
