/*:
 * @plugindesc (v1.2.0) Shorthand PopUp Icon commands for Tiny_PopUpIcon: database items (i#/w#/a#), gold (g#), and variables (v* / v#). <EM_TinyPopNEW>
 * @author Faiz Syihab
 *
 * @param Gold Text
 * @type string
 * @desc Text shown for gold popups (used with g#AMOUNT).
 * @default Gold
 *
 * @param Gold Icon
 * @type number
 * @min 0
 * @desc IconIndex used for gold popups (used with g#AMOUNT).
 * @default 314
 *
 * @help
 * ============================================================================
 * EM_TinyPopNEW.js
 * ============================================================================
 * Requires: Tiny_PopUpIcon.js
 *
 * ---------------------------------------------------------------------------
 * 1) Database shorthand (pulls icon+name from database)
 * ---------------------------------------------------------------------------
 *   PopUp Icon [characterId] [iconCat] [amount] [waitForEnd]
 *
 * iconCat formats:
 *   i#ID   -> item ID from database
 *   w#ID   -> weapon ID from database
 *   a#ID   -> armor ID from database
 *
 * Examples:
 *   PopUp Icon -1 i#9  2 60
 *   PopUp Icon  0 w#3  1 60
 *
 * ---------------------------------------------------------------------------
 * 2) Gold shorthand (gold has no database ID)
 * ---------------------------------------------------------------------------
 *   PopUp Icon [characterId] g#AMOUNT [waitForEnd]
 *
 * Example:
 *   PopUp Icon -1 g#500 60
 *
 * Gold icon + text are taken from plugin parameters:
 *   - Gold Text
 *   - Gold Icon
 *
 * ---------------------------------------------------------------------------
 * 3) Variable gain shorthand (adds to variable, then shows popup)
 * ---------------------------------------------------------------------------
 *   PopUp Icon [characterId] [IconIndex] v*VAR_ID v#AMOUNT [waitForEnd]
 *
 * [IconIndex] : the iconIndex to display for the variable popup
 * v*VAR_ID    : variable ID to modify
 * v#AMOUNT    : amount to ADD to the variable (can be negative)
 *
 * Example:
 *   PopUp Icon -1 87 v*5 v#10 60
 *
 * The popup text is the variable name from the database, with the delta shown
 * inline (e.g. "My Var +10"). Amount is embedded in the text to avoid the
 * default " xAMOUNT" suffix used by Tiny_PopUpIcon.
 *
 * ---------------------------------------------------------------------------
 * waitForEnd
 * ---------------------------------------------------------------------------
 * If waitForEnd is a NUMBER, the interpreter will wait that many frames.
 * If waitForEnd is "true"/"wait"/"end", the interpreter waits until the popup
 * finishes playing.
 *
 * ============================================================================
 * Notes
 * ============================================================================
 * - Place EM_TinyPopNEW.js BELOW Tiny_PopUpIcon.js in Plugin Manager.
 * - This plugin only intercepts the shorthand signatures above. The original
 *   Tiny command "PopUp Icon characterId iconIndex text amount ..." still works.
 */
(function() {
  'use strict';

  var PLUGIN_NAME = 'EM_TinyPopNEW';
  var params = PluginManager.parameters(PLUGIN_NAME) || {};
  var GOLD_TEXT = String(params['Gold Text'] || 'Gold');
  var GOLD_ICON = Number(params['Gold Icon'] || 0) || 0;

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  function normalizeToken(token) {
    if (token == null) return '';
    var t = String(token).trim();
    if (t.endsWith(';')) t = t.slice(0, -1).trim();
    return t;
  }

  function parseDbToken(token) {
    var t = normalizeToken(token);
    var m = /^([wiaWIA])#\(?(\d+)\)?$/.exec(t);
    if (!m) return null;
    return { type: m[1].toLowerCase(), id: Number(m[2]) };
  }

  function parseGoldToken(token) {
    var t = normalizeToken(token);
    var m = /^g#\(?(-?\d+)\)?$/i.exec(t);
    if (!m) return null;
    return { amount: Number(m[1]) };
  }

  function parseVarIdToken(token) {
    var t = normalizeToken(token);
    var m = /^v\*\(?(\d+)\)?$/i.exec(t);
    if (!m) return null;
    return { varId: Number(m[1]) };
  }

  function parseVarAmtToken(token) {
    var t = normalizeToken(token);
    var m = /^v#\(?(-?\d+)\)?$/i.exec(t);
    if (!m) return null;
    return { amount: Number(m[1]) };
  }

  function getDbEntry(type, id) {
    if (id <= 0) return null;
    if (type === 'i') return window.$dataItems ? window.$dataItems[id] : null;
    if (type === 'w') return window.$dataWeapons ? window.$dataWeapons[id] : null;
    if (type === 'a') return window.$dataArmors ? window.$dataArmors[id] : null;
    return null;
  }

  function getVariableName(varId) {
    if (!window.$dataSystem || !window.$dataSystem.variables) return 'Variable ' + varId;
    var n = window.$dataSystem.variables[varId];
    if (n && String(n).trim().length) return String(n).trim();
    return 'Variable ' + varId;
  }

  function isTruthyWaitToken(s) {
    if (s == null) return false;
    var v = String(s).trim().toLowerCase();
    return v === 'true' || v === 'wait' || v === 'end' || v === 'yes' || v === 'on';
  }

  function applyWait(interpreter, character, waitToken) {
    if (waitToken == null) return;
    if (isTruthyWaitToken(waitToken)) {
      interpreter._character = character;
      interpreter.setWaitMode('popicon');
      return;
    }
    var frames = Number(waitToken);
    if (!Number.isNaN(frames) && frames > 0) interpreter.wait(frames);
  }

  // -------------------------------------------------------------------------
  // Plugin Command hook
  // -------------------------------------------------------------------------
  var _EM_GI_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {

    // Only intercept PopUp Icon shorthand signatures.
    if (command === 'PopUp' && args && args[0] === 'Icon') {
      // -------------------------------------------------------------
      // (A) Variable shorthand:
      // PopUp Icon [charId] [iconIndex] v*VAR_ID v#AMOUNT [wait]
      // args: [0]=Icon, [1]=charId, [2]=iconIndex, [3]=v*id, [4]=v#amt, [5]=wait
      // -------------------------------------------------------------
      if (args.length >= 5) {
        var varIdInfo = parseVarIdToken(args[3]);
        var varAmtInfo = parseVarAmtToken(args[4]);
        var iconIdxNum = Number(args[2]);

        if (varIdInfo && varAmtInfo && !Number.isNaN(iconIdxNum)) {
          var charIdV = Number(args[1] || 0);
          var characterV = this.character(charIdV);
          if (characterV && characterV.requestPopUp && window.$gameVariables) {
            var varId = varIdInfo.varId;
            var delta = varAmtInfo.amount;
            var current = Number(window.$gameVariables.value(varId) || 0);
            window.$gameVariables.setValue(varId, current + delta);

            // Embed delta into name to avoid Tiny's " xAMOUNT" suffix.
            var varName = getVariableName(varId);
            var deltaText = (delta >= 0 ? ' +' : ' ') + String(delta);
            var itemSchemeV = { iconIndex: iconIdxNum, name: varName + deltaText };

            characterV.requestPopUp(itemSchemeV, 0);

            applyWait(this, characterV, args[5]);
            return;
          }
        }
      }

      // -------------------------------------------------------------
      // (B) Gold shorthand:
      // PopUp Icon [charId] g#AMOUNT [wait]
      // args: [0]=Icon, [1]=charId, [2]=g#amt, [3]=wait
      // -------------------------------------------------------------
      var goldInfo = parseGoldToken(args[2]);
      if (goldInfo) {
        var charIdG = Number(args[1] || 0);
        var characterG = this.character(charIdG);
        if (characterG && characterG.requestPopUp) {
          var schemeG = { iconIndex: GOLD_ICON, name: GOLD_TEXT };
          characterG.requestPopUp(schemeG, goldInfo.amount);
          applyWait(this, characterG, args[3]);
          return;
        }
      }

      // -------------------------------------------------------------
      // (C) Database shorthand:
      // PopUp Icon [charId] [iconCat] [amount] [wait]
      // args: [0]=Icon, [1]=charId, [2]=iconCat, [3]=amount, [4]=wait
      // -------------------------------------------------------------
      var dbInfo = parseDbToken(args[2]);
      if (dbInfo) {
        var charIdD = Number(args[1] || 0);
        var characterD = this.character(charIdD);
        if (characterD && characterD.requestPopUp) {
          var entry = getDbEntry(dbInfo.type, dbInfo.id);
          var iconIndex = entry ? entry.iconIndex : 0;
          var name = entry ? entry.name : '???';
          var amount = args[3];
          if (amount == null) amount = 1;

          var schemeD = { iconIndex: iconIndex, name: name };
          characterD.requestPopUp(schemeD, amount);

          applyWait(this, characterD, args[4]);
          return;
        }
      }
    }

    // Fall back to original behavior for everything else
    _EM_GI_pluginCommand.call(this, command, args);
  };

})();