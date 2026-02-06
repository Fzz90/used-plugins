/*=============================================================================
 * EM_FullscreenOptions_YEP.js
 *=============================================================================*/
/*:
 * @plugindesc v1.0 Adds Fullscreen ON/OFF option (YEP_OptionsCore compatible) + optional disable F3/F4. (MV 1.6.3+ / NW.js OK)
 * @author Faiz Syihab
 *
 * @param OptionName
 * @text Option Name
 * @type text
 * @default Fullscreen
 *
 * @param OptionHelp
 * @text Option Help
 * @type note
 * @default "Toggle fullscreen display mode."
 *
 * @param DefaultFullscreen
 * @text Default Fullscreen
 * @type boolean
 * @default false
 *
 * @param AddToOptionsMenu
 * @text Add option to Options Menu
 * @type boolean
 * @default true
 *
 * @param YEP_CategoryIndex
 * @text YEP Category Index
 * @type number
 * @min 0
 * @default 0
 * @desc Which YEP_OptionsCore category index to inject the option into. 0 = first category.
 *
 * @param DisableF3
 * @text Disable F3 (Stretch Mode)
 * @type boolean
 * @default false
 *
 * @param DisableF4
 * @text Disable F4 (Fullscreen Hotkey)
 * @type boolean
 * @default false
 *
 * @param ForceStretchModeWhenDisableF3
 * @text Force Stretch Mode when DisableF3
 * @type boolean
 * @default false
 *
 * @help
 * ============================================================================
 * What it does
 * ============================================================================
 * 1) Adds an Options entry to enable/disable fullscreen (saved in config.rpgsave).
 * 2) Works with YEP_OptionsCore by injecting an option entry into Yanfly's
 *    OptionsCategories list at runtime.
 * 3) Optional: disable F3 (stretch) and/or F4 (fullscreen) hotkeys.
 *
 * ============================================================================
 * Notes
 * ============================================================================
 * - If you want to "clean test" default fullscreen, delete:
 *   /save/config.rpgsave
 * - Fullscreen change is applied immediately when toggled in Options.
 * - Plugin should be placed BELOW YEP_OptionsCore if you use it.
 * ============================================================================
 */

(function () {
  "use strict";

  var PLUGIN_NAME = "EM_FullscreenOptions_YEP";
  var params = PluginManager.parameters(PLUGIN_NAME);

  var OPT_NAME = String(params["OptionName"] || "Fullscreen");
  var OPT_HELP = String(
    params["OptionHelp"] || '"Toggle fullscreen display mode."',
  );
  var DEFAULT_FS = String(params["DefaultFullscreen"] || "false") === "true";
  var ADD_TO_MENU = String(params["AddToOptionsMenu"] || "true") === "true";
  var YEP_CAT_INDEX = Math.max(0, Number(params["YEP_CategoryIndex"] || 0));
  var DISABLE_F3 = String(params["DisableF3"] || "false") === "true";
  var DISABLE_F4 = String(params["DisableF4"] || "false") === "true";
  var FORCE_STRETCH =
    String(params["ForceStretchModeWhenDisableF3"] || "false") === "true";

  var FS_SYMBOL = "emFullscreenEnabled";

  // ---------------------------------------------------------------------------
  // ConfigManager (save/load)
  // ---------------------------------------------------------------------------
  ConfigManager[FS_SYMBOL] = DEFAULT_FS;

  var _EM_CM_makeData = ConfigManager.makeData;
  ConfigManager.makeData = function () {
    var config = _EM_CM_makeData.call(this);
    config[FS_SYMBOL] = this[FS_SYMBOL];
    return config;
  };

  var _EM_CM_applyData = ConfigManager.applyData;
  ConfigManager.applyData = function (config) {
    _EM_CM_applyData.call(this, config);
    this[FS_SYMBOL] = this.readFlag(config, FS_SYMBOL);
  };

  // ---------------------------------------------------------------------------
  // Apply fullscreen helper
  // ---------------------------------------------------------------------------
  function EM_applyFullscreenFromConfig() {
    try {
      if (ConfigManager[FS_SYMBOL]) {
        Graphics._requestFullScreen();
      } else {
        Graphics._cancelFullScreen();
      }
    } catch (e) {
      // silent fail (some environments block fullscreen requests)
    }
  }

  // Apply on Title start (after config exists)
  var _EM_SceneTitle_start = Scene_Title.prototype.start;
  Scene_Title.prototype.start = function () {
    _EM_SceneTitle_start.call(this);

    // Only apply if config file exists (avoid forcing on first ever boot
    // unless DefaultFullscreen is set and config is saved).
    if (StorageManager.exists(-1)) {
      EM_applyFullscreenFromConfig();
    } else {
      // Create config on first start so DefaultFullscreen persists.
      ConfigManager.save();
      if (ConfigManager[FS_SYMBOL]) EM_applyFullscreenFromConfig();
    }
  };

  // ---------------------------------------------------------------------------
  // Disable F3/F4 (Graphics keydown)
  // ---------------------------------------------------------------------------
  if (DISABLE_F3 || DISABLE_F4) {
    var _EM_Graphics_defaultStretchMode = Graphics._defaultStretchMode;
    Graphics._defaultStretchMode = function () {
      if (DISABLE_F3 && FORCE_STRETCH) return true;
      return _EM_Graphics_defaultStretchMode.call(this);
    };

    var _EM_Graphics_onKeyDown = Graphics._onKeyDown;
    Graphics._onKeyDown = function (event) {
      if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
          case 114: // F3
            if (DISABLE_F3) return;
            break;
          case 115: // F4
            if (DISABLE_F4) return;
            break;
        }
      }
      _EM_Graphics_onKeyDown.call(this, event);
    };
  }

  // ---------------------------------------------------------------------------
  // Options Menu Integration
  // ---------------------------------------------------------------------------

  // 1) Default MV Options (no YEP_OptionsCore)
  function EM_installDefaultOptionsCommand() {
    if (!ADD_TO_MENU) return;

    var _addGeneral = Window_Options.prototype.addGeneralOptions;
    Window_Options.prototype.addGeneralOptions = function () {
      _addGeneral.call(this);
      this.addCommand(OPT_NAME, FS_SYMBOL);
    };

    // Apply fullscreen right after value changes
    var _processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function () {
      _processOk.call(this);
      if (this.commandSymbol(this.index()) === FS_SYMBOL)
        EM_applyFullscreenFromConfig();
    };

    var _cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function (wrap) {
      _cursorRight.call(this, wrap);
      if (this.commandSymbol(this.index()) === FS_SYMBOL)
        EM_applyFullscreenFromConfig();
    };

    var _cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function (wrap) {
      _cursorLeft.call(this, wrap);
      if (this.commandSymbol(this.index()) === FS_SYMBOL)
        EM_applyFullscreenFromConfig();
    };
  }

  // 2) YEP_OptionsCore injection
  function EM_injectIntoYEPOptionsCore() {
    if (!ADD_TO_MENU) return;
    if (!Imported || !Imported.YEP_OptionsCore) return;
    if (!window.Yanfly || !Yanfly.Param || !Yanfly.Param.OptionsCategories)
      return;

    // Ensure the symbol is part of YEP save/load loop
    Yanfly.Param.OptionsSymbols = Yanfly.Param.OptionsSymbols || {};
    if (!Yanfly.Param.OptionsSymbols[FS_SYMBOL]) {
      Yanfly.Param.OptionsSymbols[FS_SYMBOL] = {
        SaveConfigCode: JSON.stringify(
          "config[symbol] = ConfigManager[symbol];",
        ),
        LoadConfigCode: JSON.stringify(
          "ConfigManager[symbol] = !!config[symbol];",
        ),
      };
    }

    var categories = Yanfly.Param.OptionsCategories;
    var cat = categories[YEP_CAT_INDEX] || categories[0];
    if (!cat) return;

    cat.OptionsList = cat.OptionsList || [];

    // Avoid duplicate injection
    for (var i = 0; i < cat.OptionsList.length; i++) {
      if (cat.OptionsList[i] && cat.OptionsList[i].Symbol === FS_SYMBOL) return;
    }

    // Build a standard ON/OFF option entry for YEP_OptionsCore
    var entry = {
      Name: OPT_NAME,
      HelpDesc: OPT_HELP, // already a note string; YEP does JSON.parse on it
      Symbol: FS_SYMBOL,
      ShowHide: JSON.stringify("show = true;"),
      Enable: JSON.stringify("enabled = true;"),
      Ext: JSON.stringify("ext = 0;"),

      MakeCommandCode: JSON.stringify(
        "this.addCommand(name, symbol, enabled, ext);",
      ),
      DrawItemCode: JSON.stringify(
        "var rect = this.itemRectForText(index);\n" +
          "var statusWidth = this.statusWidth();\n" +
          "var titleWidth = rect.width - statusWidth;\n" +
          "this.resetTextColor();\n" +
          "this.changePaintOpacity(this.isCommandEnabled(index));\n" +
          "this.drawOptionsName(index);\n" +
          "this.drawOptionsOnOff(index);",
      ),
      ProcessOkCode: JSON.stringify(
        "var index = this.index();\n" +
          "var symbol = this.commandSymbol(index);\n" +
          "var value = this.getConfigValue(symbol);\n" +
          "this.changeValue(symbol, !value);\n" +
          "if (symbol === '" +
          FS_SYMBOL +
          "') { try { if (ConfigManager['" +
          FS_SYMBOL +
          "']) Graphics._requestFullScreen(); else Graphics._cancelFullScreen(); } catch(e) {} }",
      ),
      CursorRightCode: JSON.stringify(
        "var index = this.index();\n" +
          "var symbol = this.commandSymbol(index);\n" +
          "this.changeValue(symbol, true);\n" +
          "if (symbol === '" +
          FS_SYMBOL +
          "') { try { Graphics._requestFullScreen(); } catch(e) {} }",
      ),
      CursorLeftCode: JSON.stringify(
        "var index = this.index();\n" +
          "var symbol = this.commandSymbol(index);\n" +
          "this.changeValue(symbol, false);\n" +
          "if (symbol === '" +
          FS_SYMBOL +
          "') { try { Graphics._cancelFullScreen(); } catch(e) {} }",
      ),

      DefaultConfigCode: JSON.stringify(
        "ConfigManager[symbol] = " + (DEFAULT_FS ? "true" : "false") + ";",
      ),
      SaveConfigCode: JSON.stringify("config[symbol] = ConfigManager[symbol];"),
      LoadConfigCode: JSON.stringify(
        "ConfigManager[symbol] = !!config[symbol];",
      ),
    };

    // Put it near the top of the chosen category
    cat.OptionsList.unshift(entry);
  }

  // Install
  if (Imported && Imported.YEP_OptionsCore) {
    EM_injectIntoYEPOptionsCore();
  } else {
    EM_installDefaultOptionsCommand();
  }
})();
