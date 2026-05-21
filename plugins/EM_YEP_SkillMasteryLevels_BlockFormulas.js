/*:
 * @plugindesc v1.0.0 Patch for YEP_SkillMasteryLevels: supports multiline Custom Mastery Formula notetag blocks.
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_YEP_SkillMasteryLevels_BlockFormulas
 * ============================================================================
 * This is a compatibility patch for YEP_SkillMasteryLevels.
 *
 * YEP_SkillMasteryLevels normally supports only one-line custom formulas:
 *   <Custom EXP Mastery Formula: level * 20 + 5>
 *
 * This patch adds block-form support:
 *
 *   <Custom EXP Mastery Formula:
 *   if (level <= 2) {
 *     exp = Math.round(10 + level * 7);
 *   } else {
 *     exp = Math.round(level * 12);
 *   }
 *   exp;
 *   </Custom EXP Mastery Formula>
 *
 * Supported block tags:
 *   <Custom EXP Mastery Formula:>
 *   <Custom Damage Mastery Formula:>
 *   <Custom HP Cost Mastery Formula:>
 *   <Custom MP Cost Mastery Formula:>
 *   <Custom TP Cost Mastery Formula:>
 *   <Custom Cooldown Mastery Formula:>
 *
 * The opening tag also accepts the same format without the final >:
 *   <Custom EXP Mastery Formula:
 *
 * The closing tag uses the same name with a slash:
 *   </Custom EXP Mastery Formula>
 *
 * Return behavior:
 * - If the block already contains return, it is used as-is.
 * - Otherwise, the final non-empty expression line is converted into return.
 *   Example: exp; becomes return exp;
 *   Example: Math.max(1, cost); becomes return Math.max(1, cost);
 * - If the block ends after a statement block, the default output variable is
 *   returned instead:
 *     EXP      -> exp
 *     Damage   -> value
 *     Costs    -> cost
 *     Cooldown -> turns
 *
 * Load Order:
 * - Place this plugin BELOW YEP_SkillMasteryLevels.
 *
 * This patch does not replace YEP_SkillMasteryLevels' main behavior. It aliases
 * the notetag processor, lets YEP parse its normal tags first, then applies only
 * multiline Custom Mastery Formula blocks afterward.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_YEP_SkillMasteryLevels_BlockFormulas = true;

var EM = EM || {};
EM.YEPSkillMasteryLevelsBlockFormulas =
  EM.YEPSkillMasteryLevelsBlockFormulas || {};

(function () {
  "use strict";

  var Patch = EM.YEPSkillMasteryLevelsBlockFormulas;

  Patch.version = "1.0.0";

  Patch.openTagRegex = /^[ ]*<CUSTOM[ ]+(.+?)[ ]+MASTERY[ ]+FORMULA:[ ]*>?[ ]*$/i;
  Patch.closeTagRegex = /^[ ]*<\/CUSTOM[ ]+(.+?)[ ]+MASTERY[ ]+FORMULA[ ]*>[ ]*$/i;

  Patch.normalizeType = function (type) {
    return String(type || "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  };

  Patch.defaultReturnVariable = function (type) {
    if (type === "EXP") return "exp";
    if (type === "DAMAGE") return "value";
    if (type === "COOLDOWN") return "turns";
    return "cost";
  };

  Patch.hasReturnStatement = function (code) {
    var text = String(code || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map(function (line) {
        return line.replace(/\/\/.*$/, "");
      })
      .join("\n");
    return /\breturn\b/.test(text);
  };

  Patch.isIgnorableTailLine = function (line) {
    var text = String(line || "").trim();
    return (
      text.length <= 0 ||
      text.indexOf("//") === 0 ||
      text.indexOf("/*") === 0 ||
      text.indexOf("*") === 0 ||
      text.indexOf("*/") === 0
    );
  };

  Patch.shouldAppendDefaultReturn = function (line) {
    var text = String(line || "").trim();
    return text === "}" || text === "};" || text.indexOf("}") === 0;
  };

  Patch.prepareFunctionBody = function (type, code) {
    var output = this.defaultReturnVariable(type);
    var body = String(code || "").replace(/\r\n/g, "\n");
    var lines = body.split("\n");

    if (type === "EXP") {
      lines.unshift("var exp = 0;");
    }

    if (this.hasReturnStatement(lines.join("\n"))) {
      return lines.join("\n");
    }

    var index = -1;
    for (var i = lines.length - 1; i >= 0; i--) {
      if (!this.isIgnorableTailLine(lines[i])) {
        index = i;
        break;
      }
    }

    if (index < 0) {
      lines.push("return " + output + ";");
      return lines.join("\n");
    }

    if (this.shouldAppendDefaultReturn(lines[index])) {
      lines.push("return " + output + ";");
    } else {
      var indent = lines[index].match(/^\s*/)[0];
      var expression = String(lines[index]).trim().replace(/;+\s*$/, "");
      lines[index] = indent + "return " + expression + ";";
    }

    return lines.join("\n");
  };

  Patch.makeFormulaFunction = function (type, code) {
    var body = this.prepareFunctionBody(type, code);

    if (type === "EXP") {
      return new Function("level", "skill", body);
    } else if (type === "DAMAGE") {
      return new Function("value", "level", "skill", body);
    } else if (type === "HP COST" || type === "MP COST" || type === "TP COST") {
      return new Function("cost", "level", "skill", body);
    } else if (type === "COOLDOWN") {
      return new Function("turns", "level", "skill", body);
    }

    return null;
  };

  Patch.applyFormula = function (obj, type, code) {
    var formula = this.makeFormulaFunction(type, code);
    if (!formula) return;

    if (type === "EXP") {
      obj.masteryFormula = formula;
    } else if (type === "DAMAGE") {
      obj.masteryDamage = formula;
    } else if (type === "HP COST") {
      obj.masteryHpCost = formula;
    } else if (type === "MP COST") {
      obj.masteryMpCost = formula;
    } else if (type === "TP COST") {
      obj.masteryTpCost = formula;
    } else if (type === "COOLDOWN") {
      obj.masteryCooldown = formula;
    }
  };

  Patch.reportFormulaError = function (obj, type, error) {
    var name = obj && obj.name ? obj.name : "Unknown Skill";
    var text =
      "SKILL MASTERY LEVELS BLOCK FORMULAS:\n" +
      "Bad code for " +
      type +
      " Mastery Formula for " +
      name;

    if (
      typeof Yanfly !== "undefined" &&
      Yanfly.Util &&
      Yanfly.Util.SkillMasteryLevelsError
    ) {
      Yanfly.Util.SkillMasteryLevelsError(text, error);
    } else {
      throw error;
    }
  };

  Patch.processSkillNotetags = function (group) {
    if (!group) return;

    for (var n = 1; n < group.length; n++) {
      var obj = group[n];
      if (!obj || !obj.note) continue;

      var notedata = obj.note.split(/[\r\n]+/);
      var mode = null;
      var buffer = [];

      for (var i = 0; i < notedata.length; i++) {
        var line = notedata[i];
        var match;

        if (!mode) {
          match = line.match(this.openTagRegex);
          if (match) {
            mode = this.normalizeType(match[1]);
            buffer = [];
          }
          continue;
        }

        match = line.match(this.closeTagRegex);
        if (match) {
          var closeType = this.normalizeType(match[1]);
          if (closeType === mode) {
            try {
              this.applyFormula(obj, mode, buffer.join("\n"));
            } catch (e) {
              this.reportFormulaError(obj, mode, e);
            }
          }
          mode = null;
          buffer = [];
        } else {
          buffer.push(line);
        }
      }
    }
  };

  if (typeof DataManager !== "undefined") {
    var _DataManager_processSkillMasteryLevelsNotetags1 =
      DataManager.processSkillMasteryLevelsNotetags1;

    DataManager.processSkillMasteryLevelsNotetags1 = function (group) {
      if (_DataManager_processSkillMasteryLevelsNotetags1) {
        _DataManager_processSkillMasteryLevelsNotetags1.call(this, group);
      }
      Patch.processSkillNotetags(group);
    };
  }
})();
