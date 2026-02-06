/*:
 * @plugindesc v1.2.0 Category Shield System: Item 157 memberi Ailment Shield + netralisir ailments. Shield states memblokir aplikasi state berdasarkan category (ailments/poison/bleed). Respon anim 25. (Kompatibel YEP_X_StateCategories)
 * @author Faiz Syihab
 *
 * @param Ailment Shield State ID
 * @type number
 * @min 1
 * @desc ID state untuk "Ailment Shield" (memblokir category ailments).
 * @default 1
 *
 * @param Dispel Shield Item ID
 * @type number
 * @min 1
 * @desc Item ID untuk Dispel Shield Potion.
 * @default 157
 *
 * @param Ailment Category Name
 * @type string
 * @desc Category yang diblokir oleh Ailment Shield State. Default: ailments
 * @default ailments
 *
 * @param Poison Shield State ID
 * @type number
 * @min 0
 * @desc Jika >0, state ini memblokir category poison. Default: 70
 * @default 70
 *
 * @param Poison Category Name
 * @type string
 * @desc Category yang diblokir oleh Poison Shield State. Default: poison
 * @default poison
 *
 * @param Bleed Shield State ID
 * @type number
 * @min 0
 * @desc Jika >0, state ini memblokir category bleed. Default: 94
 * @default 94
 *
 * @param Bleed Category Name
 * @type string
 * @desc Category yang diblokir oleh Bleed Shield State. Default: bleed
 * @default bleed
 *
 * @param Block Response Animation ID
 * @type number
 * @min 0
 * @desc Animasi respon saat shield memblokir aplikasi category. 0 = none.
 * @default 25
 *
 * @help
 * ============================================================================
 * EM_AilmentShield.js (v1.2.0)
 * ============================================================================
 * 1) Dispel Shield Potion (Item ID 157) ke target:
 *    - Tambahkan state "Ailment Shield" ke target
 *    - Hapus semua state pada target yang memiliki category "ailments"
 *
 * 2) Sistem Category Shield (berbasis state):
 *    - Jika target punya Ailment Shield State => blokir state yang punya category "ailments"
 *    - Jika target punya State 70 (default)     => blokir state yang punya category "poison"
 *    - Jika target punya State 94 (default)     => blokir state yang punya category "bleed"
 *
 * Jika aplikasi state diblokir:
 *    - State tidak diterapkan
 *    - Putar animasi respon (default ID 25) pada target
 *
 * Catatan penting:
 * - State seperti Poison_I bisa punya banyak category:
 *     <Category: ailments>
 *     <Category: poisonI>
 *     <Category: poison>
 *     <Category: lv1>
 *     <Category: ail1>
 *   Maka shield 'poison' akan memblokir karena ada category 'poison'.
 *
 * Kompatibilitas:
 * - YEP_X_StateCategories: memakai $dataStates[id].category (uppercase list).
 * - Fallback: parsing notetag <Category: ...> bila properti category tidak ada.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_AilmentShield = true;

var EM = EM || {};
EM.AilmentShield = EM.AilmentShield || {};
EM.AilmentShield.version = "1.2.0";

(function () {
  "use strict";

  var pluginName = "EM_AilmentShield";
  var params = PluginManager.parameters(pluginName);

  var AIL_SHIELD_STATE_ID = Number(params["Ailment Shield State ID"] || 1);
  var DISPEL_ITEM_ID = Number(params["Dispel Shield Item ID"] || 157);
  var AIL_CAT_RAW = String(params["Ailment Category Name"] || "ailments");

  var POISON_SHIELD_STATE_ID = Number(params["Poison Shield State ID"] || 70);
  var POISON_CAT_RAW = String(params["Poison Category Name"] || "poison");

  var BLEED_SHIELD_STATE_ID = Number(params["Bleed Shield State ID"] || 94);
  var BLEED_CAT_RAW = String(params["Bleed Category Name"] || "bleed");

  var BLOCK_ANIM_ID = Number(params["Block Response Animation ID"] || 25);

  // -------------------------------------------------------------------------
  // Utils
  // -------------------------------------------------------------------------
  function upperCat(s) {
    return String(s || "")
      .toUpperCase()
      .trim();
  }

  function isDispelShieldItem(action) {
    if (!action || !action.item) return false;
    var it = action.item();
    if (!it) return false;
    if (DataManager.isItem && !DataManager.isItem(it)) return false;
    return it.id === DISPEL_ITEM_ID;
  }

  function playBlockAnimation(target) {
    if (!target) return;
    if (BLOCK_ANIM_ID <= 0) return;

    if (target.startAnimation) {
      target.startAnimation(BLOCK_ANIM_ID, false, 0);
      return;
    }
    if ($gameTemp && $gameTemp.requestAnimation) {
      $gameTemp.requestAnimation([target], BLOCK_ANIM_ID);
    }
  }

  // -------------------------------------------------------------------------
  // Category detection
  // Prefer YEP_X_StateCategories (state.category array), fallback to parsing notes.
  // -------------------------------------------------------------------------
  EM.AilmentShield._stateCatCache = EM.AilmentShield._stateCatCache || {};

  function extractCategoriesFromNote(note) {
    var cats = [];
    if (!note) return cats;
    var n = String(note);

    // YEP_X_StateCategories: <Category: xxx>
    var r = /<\s*category\s*:\s*([^>]+)\s*>/gi;
    var m;
    while ((m = r.exec(n))) {
      var raw = m[1] || "";
      raw.split(/[, ]+/).forEach(function (tok) {
        tok = upperCat(tok);
        if (tok) cats.push(tok);
      });
    }

    // unique
    var u = [];
    for (var i = 0; i < cats.length; i++) {
      if (u.indexOf(cats[i]) === -1) u.push(cats[i]);
    }
    return u;
  }

  function getStateCategories(stateId) {
    if (!stateId || !$dataStates || !$dataStates[stateId]) return [];
    var st = $dataStates[stateId];

    // Prefer runtime populated categories from YEP_X_StateCategories
    if (st.category && st.category.length !== undefined) {
      // Ensure uppercase strings
      var out = [];
      for (var i = 0; i < st.category.length; i++) {
        out.push(upperCat(st.category[i]));
      }
      return out;
    }

    // Fallback cached parse
    var key = String(stateId);
    var cached = EM.AilmentShield._stateCatCache[key];
    if (!cached) {
      cached = extractCategoriesFromNote(st.note);
      EM.AilmentShield._stateCatCache[key] = cached;
    }
    return cached;
  }

  function stateHasAnyBlockedCategory(stateId, blockedCatsUpper) {
    if (!blockedCatsUpper || blockedCatsUpper.length <= 0) return false;
    var cats = getStateCategories(stateId);
    for (var i = 0; i < blockedCatsUpper.length; i++) {
      if (cats.indexOf(blockedCatsUpper[i]) >= 0) return true;
    }
    return false;
  }

  // -------------------------------------------------------------------------
  // Blocked category list based on shield states on target
  // (exact match category tokens, e.g., POISON blocks only "POISON")
  // -------------------------------------------------------------------------
  function getBlockedCategoriesForTarget(target) {
    var blocked = [];
    if (!target || !target.isStateAffected) return blocked;

    if (
      AIL_SHIELD_STATE_ID > 0 &&
      target.isStateAffected(AIL_SHIELD_STATE_ID)
    ) {
      blocked.push(upperCat(AIL_CAT_RAW));
    }
    if (
      POISON_SHIELD_STATE_ID > 0 &&
      target.isStateAffected(POISON_SHIELD_STATE_ID)
    ) {
      blocked.push(upperCat(POISON_CAT_RAW));
    }
    if (
      BLEED_SHIELD_STATE_ID > 0 &&
      target.isStateAffected(BLEED_SHIELD_STATE_ID)
    ) {
      blocked.push(upperCat(BLEED_CAT_RAW));
    }

    // unique
    var u = [];
    for (var i = 0; i < blocked.length; i++) {
      if (u.indexOf(blocked[i]) === -1) u.push(blocked[i]);
    }
    return u;
  }

  // -------------------------------------------------------------------------
  // Remove all ailments-category states (neutralize) on target
  // -------------------------------------------------------------------------
  function removeAilmentsFromTarget(target) {
    if (!target) return;

    // If YEP_X_StateCategories exists, use its function for speed and correctness
    if (target.removeStateCategoryAll) {
      target.removeStateCategoryAll(upperCat(AIL_CAT_RAW));
      return;
    }

    // Fallback: remove matching states manually
    var states = target.states ? target.states() : [];
    var blocked = [upperCat(AIL_CAT_RAW)];
    for (var i = states.length - 1; i >= 0; i--) {
      var st = states[i];
      if (st && st.id && stateHasAnyBlockedCategory(st.id, blocked)) {
        if (target.removeState) target.removeState(st.id);
      }
    }
  }

  // -------------------------------------------------------------------------
  // 1) Dispel Shield Potion: add ailment shield + neutralize ailments
  // -------------------------------------------------------------------------
  var _Game_Action_apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function (target) {
    _Game_Action_apply.call(this, target);

    if (!target) return;
    if (!isDispelShieldItem(this)) return;

    if (target.addState) target.addState(AIL_SHIELD_STATE_ID);
    removeAilmentsFromTarget(target);
  };

  // -------------------------------------------------------------------------
  // 2) Block state application via skill/item effect
  // -------------------------------------------------------------------------
  var _Game_Action_itemEffectAddState =
    Game_Action.prototype.itemEffectAddState;
  Game_Action.prototype.itemEffectAddState = function (target, effect) {
    var stateId = effect ? effect.dataId : 0;

    if (target && stateId > 0) {
      var blockedCats = getBlockedCategoriesForTarget(target);
      if (
        blockedCats.length > 0 &&
        stateHasAnyBlockedCategory(stateId, blockedCats)
      ) {
        this.makeSuccess(target);
        playBlockAnimation(target);
        return; // cancel
      }
    }

    _Game_Action_itemEffectAddState.call(this, target, effect);
  };

  // -------------------------------------------------------------------------
  // 3) Safety net: block direct addState calls
  // -------------------------------------------------------------------------
  var _Game_Battler_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    if (this && stateId > 0) {
      var blockedCats = getBlockedCategoriesForTarget(this);
      if (
        blockedCats.length > 0 &&
        stateHasAnyBlockedCategory(stateId, blockedCats)
      ) {
        playBlockAnimation(this);
        return; // cancel
      }
    }
    _Game_Battler_addState.call(this, stateId);
  };
})();
