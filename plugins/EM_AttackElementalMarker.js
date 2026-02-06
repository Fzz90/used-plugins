/*:
 * @plugindesc (v1.1.0) Elemental Marker State Replacer only (mutually exclusive). Designed to work with YEP_WeaponUnleash Replace Attack.
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_AttackElementalMarker.js
 * ============================================================================
 * PURPOSE
 * - This plugin ONLY ensures "marker states" are mutually exclusive.
 * - When a marker state is applied, it will remove all other marker states.
 *
 * INTENDED WORKFLOW (with YEP_WeaponUnleash)
 * - Put <Replace Attack: X> on each marker State (66/67/68/69, etc).
 * - YEP_WeaponUnleash will replace the Attack skill based on active states.
 * - When marker state expires, Attack returns to normal automatically.
 *
 * NOTES
 * - This plugin does NOT change elements, animations, or damage popups.
 * - ES6 compatible.
 *
 * ============================================================================
 * Version
 * ============================================================================
 * 1.1.0 - Rebuilt: state replacer only + refresh cleanup.
 *
 * ============================================================================
 * @param ElementMarkerList
 * @text Element Marker List (17)
 * @type struct<ElementMarkerStateOnly>[]
 * @default ["{\"Name\":\"Physical\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Fire\",\"MarkerStateId\":\"67\"}","{\"Name\":\"Ice\",\"MarkerStateId\":\"66\"}","{\"Name\":\"Thunder\",\"MarkerStateId\":\"68\"}","{\"Name\":\"Water\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Earth\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Wind\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Light\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Dark\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Nature\",\"MarkerStateId\":\"69\"}","{\"Name\":\"Metal\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Aura\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Mystic\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Magic\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Explosion\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Soul\",\"MarkerStateId\":\"0\"}","{\"Name\":\"Legend\",\"MarkerStateId\":\"0\"}"]
 *
 * @param ResolveOnRefresh
 * @text Resolve Conflicts on Refresh
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc If multiple marker states somehow exist (load/save/event), keep only one and remove the rest during refresh.
 *
 * @param RefreshKeepRule
 * @text Refresh Keep Rule
 * @type select
 * @option Keep Highest State ID
 * @value highestId
 * @option Keep First In List
 * @value listOrder
 * @default listOrder
 * @desc If ResolveOnRefresh = true, which marker remains when multiple are found.
 */
/*~struct~ElementMarkerStateOnly:
 * @param Name
 * @type string
 * @default Fire
 *
 * @param MarkerStateId
 * @type state
 * @min 0
 * @default 67
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_AttackElementalMarker";

  const parseArray = (raw) => {
    try {
      const arr = JSON.parse(raw || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  };

  const parseStruct = (raw) => {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  };

  const params = PluginManager.parameters(PLUGIN_NAME);

  const list = parseArray(params.ElementMarkerList).map((s) => {
    const o = parseStruct(s) || {};
    return {
      name: String(o.Name || ""),
      stateId: Number(o.MarkerStateId || 0),
    };
  });

  const resolveOnRefresh = String(params.ResolveOnRefresh || "true") === "true";
  const refreshKeepRule = String(params.RefreshKeepRule || "listOrder");

  /** Marker state IDs in list order (duplicates removed, 0 removed). */
  const markerStateIds = [];
  const seen = new Set();
  for (const m of list) {
    const sid = m.stateId;
    if (sid > 0 && !seen.has(sid)) {
      seen.add(sid);
      markerStateIds.push(sid);
    }
  }

  const isMarkerState = (stateId) => markerStateIds.includes(stateId);

  // Keep rule helpers (only used for refresh conflict cleanup)
  const pickKeepStateId = (battler, activeMarkerIds) => {
    if (activeMarkerIds.length <= 0) return 0;
    if (refreshKeepRule === "highestId") {
      return Math.max(...activeMarkerIds);
    }
    // listOrder (default): keep first state that appears in markerStateIds order
    for (const sid of markerStateIds) {
      if (battler.isStateAffected(sid)) return sid;
    }
    return activeMarkerIds[0];
  };

  // --------------------------------------------------------------------------
  // 1) Mutual exclusivity when adding marker states.
  // --------------------------------------------------------------------------
  const _Game_Battler_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    if (isMarkerState(stateId)) {
      for (const sid of markerStateIds) {
        if (sid !== stateId && this.isStateAffected(sid)) {
          this.removeState(sid);
        }
      }
    }
    _Game_Battler_addState.call(this, stateId);
  };

  // --------------------------------------------------------------------------
  // 2) Optional: resolve accidental multi-markers on refresh (save/load/event).
  // --------------------------------------------------------------------------
  if (resolveOnRefresh) {
    const _Game_BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
    Game_BattlerBase.prototype.refresh = function () {
      _Game_BattlerBase_refresh.call(this);

      // Only battlers that can have states
      if (!this.isStateAffected) return;

      const active = markerStateIds.filter((sid) => this.isStateAffected(sid));
      if (active.length <= 1) return;

      const keep = pickKeepStateId(this, active);
      for (const sid of active) {
        if (sid !== keep) this.removeState(sid);
      }
    };
  }
})();
