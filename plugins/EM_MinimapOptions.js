/*:
 * @plugindesc v1.1.0 [EM] Adds a YEP_OptionsCore (Visual) option to enable/disable Minimap access. Uses YEP_KeyboardConfig binding for the Minimap toggle key. 
 * @author Faiz Syihab
 *
 * @param VisualCategoryKeyword
 * @text Visual Category Keyword
 * @type string
 * @desc Finds the OptionsCore category whose name contains this keyword (after removing \i[x] and \c[x]).
 * @default Visual
 *
 * @param InsertFromBottom
 * @text Insert From Bottom
 * @type number
 * @min 0
 * @desc 1 means "one above the last entry" in the Visual category.
 * @default 1
 *
 * @param OptionName
 * @text Option Name
 * @type string
 * @default Toggle Minimap
 *
 * @param OptionHelp
 * @text Option Help
 * @type multiline_string
 * @default Show: you can use your Key Config binding for Minimap to toggle the minimap.\nHide: minimap is forced hidden and the key does nothing.
 *
 * @param StatusShowText
 * @text Status Text (Show)
 * @type string
 * @default Show
 *
 * @param StatusHideText
 * @text Status Text (Hide)
 * @type string
 * @default Hide
 *
 * @param DefaultEnabled
 * @text Default Enabled
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @param KeyActionSymbol
 * @text Keyboard Action Symbol
 * @type string
 * @desc Internal action symbol stored inside Input.keyMapper / Keyboard Config. Do not change unless you know what you are doing.
 * @default emMinimap
 *
 * @param KeyConfigText
 * @text Keyboard Config List Text
 * @type string
 * @desc Text shown in YEP_KeyboardConfig action list.
 * @default Minimap
 *
 * @param KeyConfigKeyLabel
 * @text Keyboard Key Label
 * @type string
 * @desc Short label shown on the keycap when assigned (Window_KeyConfig).
 * @default MiniMap
 *
 * @param DefaultKeyCode
 * @text Default Key Code
 * @type number
 * @min 1
 * @desc Default key used if Minimap has no binding yet. 77 = 'M'.
 * @default 77
 *
 * @help
 * EM_MinimapOptions.js
 * -----------------------------------------------------------------------------
 * Requirements:
 *  - YEP_OptionsCore.js (adds the option under the Visual tab/category)
 *  - UPP_MINIMAP.js (this plugin toggles its minimap windows)
 *
 * Keyboard Binding:
 *  - If YEP_KeyboardConfig.js is installed, this plugin registers an action
 *    in the Key Config screen named "Minimap" (configurable) and uses whatever
 *    key the player binds to it.
 *  - If YEP_KeyboardConfig.js is NOT installed, this plugin falls back to using
 *    the Default Key Code mapping via Input.keyMapper.
 *
 * Compatibility notes:
 *  - YEP_ButtonCommonEvents.js: does not modify BCE mappings. If the same key is
 *    also bound to a common event, both may trigger (depending on BCE setup).
 *
 * Behavior:
 *  - Option "Toggle Minimap":
 *      Show -> player can use the Key Config binding for Minimap on the map.
 *      Hide -> minimap is hidden immediately and the toggle key is ignored.
 *
 * Recommended plugin order:
 *  UPP_MINIMAP
 *  YEP_OptionsCore
 *  YEP_ButtonCommonEvents
 *  YEP_KeyboardConfig
 *  EM_MinimapOptions   (this plugin)
 * -----------------------------------------------------------------------------
 */

var Imported = Imported || {};
Imported.EM_MinimapOptions = true;

(function () {
  "use strict";

  const PLUGIN_NAME = "EM_MinimapOptions";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const VISUAL_KEYWORD = String(params["VisualCategoryKeyword"] || "Visual").toLowerCase();
  const INSERT_FROM_BOTTOM = Math.max(0, Number(params["InsertFromBottom"] || 1));
  const OPT_NAME = String(params["OptionName"] || "Toggle Minimap");
  const OPT_HELP = String(params["OptionHelp"] || "Show: you can use your Key Config binding for Minimap to toggle the minimap.\nHide: minimap is forced hidden and the key does nothing.");
  const TXT_SHOW = String(params["StatusShowText"] || "Show");
  const TXT_HIDE = String(params["StatusHideText"] || "Hide");
  const DEFAULT_ENABLED = String(params["DefaultEnabled"] || "true") === "true";

  const ACTION = String(params["KeyActionSymbol"] || "emMinimap");
  const KEYCFG_TEXT = String(params["KeyConfigText"] || "Minimap");
  const KEYCFG_KEYLABEL = String(params["KeyConfigKeyLabel"] || "MiniMap");
  const DEFAULT_KEYCODE = Math.max(1, Number(params["DefaultKeyCode"] || 77));

  // Stable symbol for ConfigManager + OptionsCore.
  const SYMBOL = "emToggleMinimap";

  // ---------------------------------------------------------------------------
  // Global API
  // ---------------------------------------------------------------------------
  window.EM_MinimapOptions = window.EM_MinimapOptions || {};
  const API = window.EM_MinimapOptions;

  API.symbol = SYMBOL;
  API.action = ACTION;
  API.defaultKeyCode = DEFAULT_KEYCODE;

  // ---------------------------------------------------------------------------
  // Minimap control (UPP_MINIMAP)
  // ---------------------------------------------------------------------------
  API._hasUppMinimap = function () {
    return typeof $miniMapWindow !== "undefined" || typeof _startMapHidden !== "undefined";
  };

  API._setStartHiddenFlag = function (hidden) {
    // UPP_MINIMAP uses a string "true"/"false" for _startMapHidden checks.
    if (typeof _startMapHidden !== "undefined") {
      _startMapHidden = hidden ? "true" : "false";
    }
  };

  API.isMinimapVisible = function () {
    if (typeof $miniMapWindow !== "undefined" && $miniMapWindow) return !!$miniMapWindow.visible;
    return false;
  };

  API.showMinimap = function () {
    if (typeof $miniMapWindow !== "undefined" && $miniMapWindow) $miniMapWindow.show();
    if (typeof $miniMapPlayer !== "undefined" && $miniMapPlayer) $miniMapPlayer.show();
    if (typeof $miniMapBorder !== "undefined" && $miniMapBorder) $miniMapBorder.show();
    if (typeof $miniMapName !== "undefined" && $miniMapName) $miniMapName.show();
    API._setStartHiddenFlag(false);
  };

  API.hideMinimap = function () {
    if (typeof $miniMapWindow !== "undefined" && $miniMapWindow) $miniMapWindow.hide();
    if (typeof $miniMapPlayer !== "undefined" && $miniMapPlayer) $miniMapPlayer.hide();
    if (typeof $miniMapBorder !== "undefined" && $miniMapBorder) $miniMapBorder.hide();
    if (typeof $miniMapName !== "undefined" && $miniMapName) $miniMapName.hide();
    API._setStartHiddenFlag(true);
  };

  API.toggleMinimap = function () {
    if (!API._hasUppMinimap()) return;
    if (API.isMinimapVisible()) API.hideMinimap();
    else API.showMinimap();
  };

  API.enforce = function () {
    if (!ConfigManager[SYMBOL]) {
      API.hideMinimap();
    }
  };

  API.onOptionChanged = function () {
    if (!ConfigManager[SYMBOL]) {
      API.hideMinimap();
    }
  };

  // ---------------------------------------------------------------------------
  // ConfigManager default
  // ---------------------------------------------------------------------------
  if (ConfigManager[SYMBOL] === undefined) {
    ConfigManager[SYMBOL] = DEFAULT_ENABLED;
  }

  // ---------------------------------------------------------------------------
  // KeyboardConfig integration + default binding seeding
  // ---------------------------------------------------------------------------
  function mapHasAction(map) {
    if (!map) return false;
    for (var k in map) {
      if (map[k] === ACTION) return true;
    }
    return false;
  }

  function tryAssignDefaultKey(map) {
    if (!map || mapHasAction(map)) return false;

    var cur = map[DEFAULT_KEYCODE];
    if (cur === undefined || cur === null) {
      map[DEFAULT_KEYCODE] = ACTION;
      return true;
    }
    return false;
  }

  API.ensureDefaultBindings = function () {
    var changed = false;

    // If KeyboardConfig exists, prefer its stored maps.
    if (Imported.YEP_KeyboardConfig) {
      if (ConfigManager.defaultMap) changed = tryAssignDefaultKey(ConfigManager.defaultMap) || changed;
      if (ConfigManager.keyMapper) changed = tryAssignDefaultKey(ConfigManager.keyMapper) || changed;
      // Avoid stomping WASD layout if DEFAULT_KEYCODE is already used there.
      if (ConfigManager.wasdMap) changed = tryAssignDefaultKey(ConfigManager.wasdMap) || changed;

      if (changed && ConfigManager.applyKeyConfig) {
        ConfigManager.applyKeyConfig();
      }
    } else {
      // Fallback: seed Input.keyMapper directly if no KeyboardConfig.
      if (!mapHasAction(Input.keyMapper)) {
        var cur2 = Input.keyMapper[DEFAULT_KEYCODE];
        if (cur2 === undefined || cur2 === null) {
          Input.keyMapper[DEFAULT_KEYCODE] = ACTION;
          changed = true;
        }
      }
    }

    return changed;
  };

  function integrateKeyboardConfigUi() {
    if (!Imported.YEP_KeyboardConfig) return;

    // Add our action entry to the action list window.
    if (typeof Window_KeyAction !== "undefined" && Window_KeyAction.prototype) {
      const _makeCommandList = Window_KeyAction.prototype.makeCommandList;
      Window_KeyAction.prototype.makeCommandList = function () {
        _makeCommandList.call(this);

        // Avoid duplicates.
        var exists = false;
        for (var i = 0; i < this._list.length; ++i) {
          if (this._list[i] && this._list[i].ext === ACTION) {
            exists = true;
            break;
          }
        }
        if (!exists) this.addCommand(KEYCFG_TEXT, "ok", true, ACTION);
      };
    }

    // Show our action label on the keycaps when assigned.
    if (typeof Window_KeyConfig !== "undefined" && Window_KeyConfig.prototype) {
      const _actionKey = Window_KeyConfig.prototype.actionKey;
      Window_KeyConfig.prototype.actionKey = function (action) {
        if (action === ACTION) return KEYCFG_KEYLABEL;
        return _actionKey.call(this, action);
      };
    }
  }

  integrateKeyboardConfigUi();

  // Ensure defaults both on boot and after config load (older saves).
  API.ensureDefaultBindings();

  if (Imported.YEP_KeyboardConfig && ConfigManager.applyData) {
    const _applyData = ConfigManager.applyData;
    ConfigManager.applyData = function (config) {
      _applyData.call(this, config);
      // If an older save lacks our action, seed it without overriding.
      if (API.ensureDefaultBindings()) {
        // Keep it saved for next time.
        if (ConfigManager.save) ConfigManager.save();
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Scene_Map hook: toggle minimap via KeyboardConfig action
  // ---------------------------------------------------------------------------
  const _EM_SceneMap_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    _EM_SceneMap_start.call(this);
    API.enforce();
  };

  const _EM_SceneMap_updateScene = Scene_Map.prototype.updateScene;
  Scene_Map.prototype.updateScene = function () {
    _EM_SceneMap_updateScene.call(this);

    // If disabled, keep it hidden even if other scripts try to show it.
    if (!ConfigManager[SYMBOL]) {
      if (API.isMinimapVisible()) API.hideMinimap();
      return;
    }

    // Safer toggling: avoid during transitions/messages/events.
    if (SceneManager.isSceneChanging()) return;
    if ($gameMap && $gameMap.isEventRunning && $gameMap.isEventRunning()) return;
    if ($gameMessage && $gameMessage.isBusy && $gameMessage.isBusy()) return;

    if (Input.isTriggered(ACTION)) {
      API.toggleMinimap();
    }
  };

  // ---------------------------------------------------------------------------
  // YEP_OptionsCore integration: inject into Visual category (one above the last)
  // ---------------------------------------------------------------------------
  function stripEscapeCodes(text) {
    text = String(text || "");
    text = text.replace(/\\i\[\d+\]/gi, "");
    text = text.replace(/\\c\[\d+\]/gi, "");
    text = text.replace(/\x1bI\[\d+\]/gi, "");
    text = text.replace(/\x1bC\[\d+\]/gi, "");
    return text;
  }

  function findVisualCategory() {
    if (!window.Yanfly || !Yanfly.Param || !Yanfly.Param.OptionsCategories) return null;
    const cats = Yanfly.Param.OptionsCategories;
    for (let i = 0; i < cats.length; i++) {
      const rawName = cats[i] && cats[i].Name ? cats[i].Name : "";
      const clean = stripEscapeCodes(rawName).toLowerCase();
      if (clean.includes(VISUAL_KEYWORD)) return cats[i];
    }
    return null;
  }

  function ensureOptionsSymbolsEntry() {
    if (!window.Yanfly || !Yanfly.Param) return;
    if (!Yanfly.Param.OptionsSymbols) Yanfly.Param.OptionsSymbols = {};
    if (Yanfly.Param.OptionsSymbols[SYMBOL]) return;

    Yanfly.Param.OptionsSymbols[SYMBOL] = {
      SaveConfigCode: JSON.stringify("config[symbol] = !!ConfigManager[symbol];"),
      LoadConfigCode: JSON.stringify("ConfigManager[symbol] = !!config[symbol];"),
    };
  }

  function buildOptionData() {
    const drawCode =
      "var rect = this.itemRectForText(index);\n" +
      "var statusWidth = this.statusWidth();\n" +
      "var titleWidth = rect.width - statusWidth;\n" +
      "this.resetTextColor();\n" +
      "this.changePaintOpacity(this.isCommandEnabled(index));\n" +
      "this.drawOptionsName(index);\n" +
      "var value = this.getConfigValue(symbol);\n" +
      'var text = value ? "' + TXT_SHOW.replace(/"/g, '\\"') + '" : "' + TXT_HIDE.replace(/"/g, '\\"') + '";\n' +
      "this.drawText(text, titleWidth, rect.y, statusWidth, 'center');\n";

    const okCode =
      "var index = this.index();\n" +
      "var symbol = this.commandSymbol(index);\n" +
      "var value = this.getConfigValue(symbol);\n" +
      "this.changeValue(symbol, !value);\n" +
      "if (typeof EM_MinimapOptions !== 'undefined' && EM_MinimapOptions.onOptionChanged) EM_MinimapOptions.onOptionChanged();\n";

    const rightCode =
      "var index = this.index();\n" +
      "var symbol = this.commandSymbol(index);\n" +
      "this.changeValue(symbol, true);\n" +
      "if (typeof EM_MinimapOptions !== 'undefined' && EM_MinimapOptions.onOptionChanged) EM_MinimapOptions.onOptionChanged();\n";

    const leftCode =
      "var index = this.index();\n" +
      "var symbol = this.commandSymbol(index);\n" +
      "this.changeValue(symbol, false);\n" +
      "if (typeof EM_MinimapOptions !== 'undefined' && EM_MinimapOptions.onOptionChanged) EM_MinimapOptions.onOptionChanged();\n";

    return {
      Name: OPT_NAME,
      "---Settings---": "",
      HelpDesc: JSON.stringify(OPT_HELP),
      Symbol: SYMBOL,
      ShowHide: JSON.stringify("show = true;"),
      Enable: JSON.stringify("enabled = true;"),
      Ext: JSON.stringify("ext = 0;"),
      "---Functions---": "",
      MakeCommandCode: JSON.stringify("this.addCommand(name, symbol, enabled, ext);"),
      DrawItemCode: JSON.stringify(drawCode),
      ProcessOkCode: JSON.stringify(okCode),
      CursorRightCode: JSON.stringify(rightCode),
      CursorLeftCode: JSON.stringify(leftCode),
      DefaultConfigCode: JSON.stringify("ConfigManager[symbol] = " + (DEFAULT_ENABLED ? "true" : "false") + ";"),
      SaveConfigCode: JSON.stringify("config[symbol] = !!ConfigManager[symbol];"),
      LoadConfigCode: JSON.stringify("ConfigManager[symbol] = !!config[symbol];"),
    };
  }

  function injectIntoVisualCategory() {
    const cat = findVisualCategory();
    if (!cat) return;

    ensureOptionsSymbolsEntry();
    if (!Array.isArray(cat.OptionsList)) return;

    // Avoid duplicates (by symbol).
    for (let i = cat.OptionsList.length - 1; i >= 0; i--) {
      if (cat.OptionsList[i] && cat.OptionsList[i].Symbol === SYMBOL) {
        cat.OptionsList.splice(i, 1);
      }
    }

    const data = buildOptionData();
    const insertPos = Math.max(0, cat.OptionsList.length - INSERT_FROM_BOTTOM);
    cat.OptionsList.splice(insertPos, 0, data);
  }

  if (Imported.YEP_OptionsCore) {
    injectIntoVisualCategory();
  }

})();