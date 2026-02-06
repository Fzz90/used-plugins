/*:
 * @plugindesc v1.0.41 Adds Visual options into YEP_OptionsCore (SAFE LOAD + MsgMacros1 compatible): Mini Label, Followers (Switch 3 show/hide), Battle Border (MOG_BattleHud), Visual State Effects. (placed at bottom)
 * @author Faiz Syihab
 *
 * @help
 * Requirements:
 * - YEP_OptionsCore
 *
 * Compatibility:
 * - YEP_X_MessageMacros1: Help text can use macros because it is rendered via
 *   Window_Help.drawTextEx (macros processed by Message Macros plugin).
 *
 * Notes:
 * - Player Followers option is shown/hidden by Switch #3 (show/hide, not enable/disable).
 * - Mini Label triggers Common Event #4 when ON, #3 when OFF.
 * - Player Followers triggers Common Event #6 when ON, #5 when OFF.
 */

(() => {
  "use strict";

  if (!Imported || !Imported.YEP_OptionsCore) {
    console.warn("EM_VisualOptionsCore_Visual requires YEP_OptionsCore.");
    return;
  }

  const SYM_MINI_LABEL = "emMiniLabel";
  const SYM_FOLLOWERS = "emPlayerFollowers";
  const SYM_BATTLE_BORDER = "emBattleBorder";
  const SYM_VIS_STATE_FX = "emVisualStateFx";

  // Default config values
  ConfigManager[SYM_MINI_LABEL] = true;
  ConfigManager[SYM_FOLLOWERS] = true;
  ConfigManager[SYM_BATTLE_BORDER] = true;
  ConfigManager[SYM_VIS_STATE_FX] = true;

  // Global queue for common events (safe during boot/load)
  window._emQueuedCommonEventId = window._emQueuedCommonEventId || 0;
  // Queue for Player Followers common events (safe during boot/load)
  window._emQueuedFollowersCommonEventId =
    window._emQueuedFollowersCommonEventId || 0;

  // ---------------------------------------------------------------------------
  // ConfigManager save/load
  // ---------------------------------------------------------------------------
  const _CM_makeData = ConfigManager.makeData;
  ConfigManager.makeData = function () {
    const config = _CM_makeData.call(this);
    config[SYM_MINI_LABEL] = this[SYM_MINI_LABEL];
    config[SYM_FOLLOWERS] = this[SYM_FOLLOWERS];
    config[SYM_BATTLE_BORDER] = this[SYM_BATTLE_BORDER];
    config[SYM_VIS_STATE_FX] = this[SYM_VIS_STATE_FX];
    return config;
  };

  const _CM_applyData = ConfigManager.applyData;
  ConfigManager.applyData = function (config) {
    _CM_applyData.call(this, config);
    this[SYM_MINI_LABEL] = this.readFlag(config, SYM_MINI_LABEL);
    this[SYM_FOLLOWERS] = this.readFlag(config, SYM_FOLLOWERS);
    this[SYM_BATTLE_BORDER] = this.readFlag(config, SYM_BATTLE_BORDER);
    this[SYM_VIS_STATE_FX] = this.readFlag(config, SYM_VIS_STATE_FX);

    // SAFE: no game objects here
    window.screenLayout = !!this[SYM_BATTLE_BORDER];
    window._emQueuedCommonEventId = this[SYM_MINI_LABEL] ? 4 : 3;
    window._emQueuedFollowersCommonEventId = this[SYM_FOLLOWERS] ? 6 : 5;
  };

  // ---------------------------------------------------------------------------
  // Helpers: apply
  // ---------------------------------------------------------------------------
  function flushQueuedCommonEventIfReady() {
    if (window.$gameTemp) {
      if (window._emQueuedCommonEventId > 0) {
        $gameTemp.reserveCommonEvent(window._emQueuedCommonEventId);
        window._emQueuedCommonEventId = 0;
      }
      if (window._emQueuedFollowersCommonEventId > 0) {
        $gameTemp.reserveCommonEvent(window._emQueuedFollowersCommonEventId);
        window._emQueuedFollowersCommonEventId = 0;
      }
    }
  }

  var _SceneMap_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _SceneMap_update.call(this);
    flushQueuedCommonEventIfReady();
  };

  function applyFollowers() {
    if (!$gamePlayer || !$gamePlayer.followers) return;
    const fol = $gamePlayer.followers();
    if (!fol) return;

    const on = !!ConfigManager[SYM_FOLLOWERS];
    if (on) fol.show();
    else fol.hide();

    const ceId = on ? 6 : 5;
    if (window.$gameTemp) {
      $gameTemp.reserveCommonEvent(ceId);
      window._emQueuedFollowersCommonEventId = 0;
    } else {
      window._emQueuedFollowersCommonEventId = ceId;
    }

    if ($gamePlayer.refresh) $gamePlayer.refresh();
  }

  function applyBattleBorder() {
    window.screenLayout = !!ConfigManager[SYM_BATTLE_BORDER];

    const scn = SceneManager._scene;
    if (scn && scn.constructor === Scene_Battle) {
      if (window.screenLayout) {
        if (!scn._screen_layout && scn.createBattleLayout) {
          scn.createBattleLayout();
        }
      } else {
        if (scn._screen_layout) {
          scn.removeChild(scn._screen_layout);
          scn._screen_layout = null;
        }
      }
    }
  }

  function applyVisualStateFx() {
    // This option is handled by YEP_X_VisualStateFX itself.
    // We store config only; actual effects are plugin-dependent.
  }

  // Called when leaving options
  const _SceneOptions_terminate = Scene_Options.prototype.terminate;
  Scene_Options.prototype.terminate = function () {
    _SceneOptions_terminate.call(this);

    // Apply effects that need runtime objects
    applyFollowers();
    applyBattleBorder();
    applyVisualStateFx();

    // Flush any queued events
    flushQueuedCommonEventIfReady();
  };

  // ---------------------------------------------------------------------------
  // YEP_OptionsCore Injection
  // ---------------------------------------------------------------------------
  function exists(symbol) {
    return Yanfly.Param.OptionCmdList.some(function (obj) {
      return obj.Symbol === symbol;
    });
  }

  // HelpDesc must be JSON string (not array).
  function makeOnOffEntry(
    name,
    symbol,
    help,
    showHideCode,
    onApplyJs,
    defaultValue,
  ) {
    return {
      Name: name,
      HelpDesc: JSON.stringify(help),
      Symbol: symbol,

      // SHOW/HIDE controls visibility (your request)
      ShowHide: JSON.stringify(showHideCode || "show = true;"),

      // Always enabled if shown
      Enable: JSON.stringify("enabled = true;"),

      Ext: JSON.stringify("ext = 0;"),

      MakeCommandCode: JSON.stringify(
        "this.addCommand(name, symbol, enabled, ext);",
      ),
      DrawItemCode: JSON.stringify(
        "var rect = this.itemRectForText(index);\n" +
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
          (onApplyJs || ""),
      ),
      CursorRightCode: JSON.stringify(
        "var index = this.index();\n" +
          "var symbol = this.commandSymbol(index);\n" +
          "this.changeValue(symbol, true);\n" +
          (onApplyJs || ""),
      ),
      CursorLeftCode: JSON.stringify(
        "var index = this.index();\n" +
          "var symbol = this.commandSymbol(index);\n" +
          "this.changeValue(symbol, false);\n" +
          (onApplyJs || ""),
      ),

      DefaultConfigCode: JSON.stringify(
        "ConfigManager[symbol] = " + (!!defaultValue ? "true" : "false") + ";",
      ),
      SaveConfigCode: JSON.stringify("config[symbol] = ConfigManager[symbol];"),
      LoadConfigCode: JSON.stringify(
        "ConfigManager[symbol] = !!config[symbol];",
      ),
    };
  }

  // Insert at bottom (your request)
  function injectAtBottom(entriesToAdd) {
    for (let i = 0; i < entriesToAdd.length; i++) {
      Yanfly.Param.OptionCmdList.push(entriesToAdd[i]);
    }
  }

  // Build entries
  const entriesToAdd = [];

  // Mini Label
  if (!exists(SYM_MINI_LABEL)) {
    const entry = makeOnOffEntry(
      "Mini Label",
      SYM_MINI_LABEL,
      "ON: Common Event #4\nOFF: Common Event #3\n(Executed safely after load)",
      "show = true;",
      "window._emQueuedCommonEventId = ConfigManager['" +
        SYM_MINI_LABEL +
        "'] ? 4 : 3;\n" +
        "if ($gameTemp) { $gameTemp.reserveCommonEvent(window._emQueuedCommonEventId); window._emQueuedCommonEventId = 0; }\n",
      true,
    );
    entriesToAdd.push(entry);
  }

  // Player Followers (SHOW/HIDE option via Switch #3)
  if (!exists(SYM_FOLLOWERS)) {
    const entry = makeOnOffEntry(
      "Player Followers",
      SYM_FOLLOWERS,
      "Toggle follower visibility. (Only shown when Switch #179 is ON)",
      // show/hide (NOT enable/disable)
      "show = $gameSwitches && $gameSwitches.value(179);",
      "if ($gamePlayer && $gamePlayer.followers) {\\n" +
        "  var fol = $gamePlayer.followers();\\n" +
        "  if (fol) { if (ConfigManager['" +
        SYM_FOLLOWERS +
        "']) fol.show(); else fol.hide(); }\\n" +
        "  if ($gamePlayer.refresh) $gamePlayer.refresh();\\n" +
        "}\\n" +
        "var __ceId = ConfigManager['" +
        SYM_FOLLOWERS +
        "'] ? 6 : 5;\\n" +
        "window._emQueuedFollowersCommonEventId = __ceId;\\n" +
        "if ($gameTemp) { $gameTemp.reserveCommonEvent(__ceId); window._emQueuedFollowersCommonEventId = 0; }\\n",
      true,
    );

    // Keep load safe (no $gamePlayer here)
    entry.LoadConfigCode = JSON.stringify(
      "ConfigManager[symbol] = !!config[symbol];",
    );
    entriesToAdd.push(entry);
  }

  // Battle Border
  if (!exists(SYM_BATTLE_BORDER)) {
    const entry = makeOnOffEntry(
      "Battle Border",
      SYM_BATTLE_BORDER,
      "MOG_BattleHud Screen Border Layout",
      "show = true;",
      "window.screenLayout = !!ConfigManager['" + SYM_BATTLE_BORDER + "'];\n",
      true,
    );
    entriesToAdd.push(entry);
  }

  // Visual State Effects
  if (!exists(SYM_VIS_STATE_FX)) {
    const entry = makeOnOffEntry(
      "\\i[" + 1428 + "]" + " Visual State Effects",
      SYM_VIS_STATE_FX,
      "Toggle YEP_X_VisualStateFX visuals (stored in config).",
      "show = true;",
      "",
      true,
    );
    entriesToAdd.push(entry);
  }

  // Add spacing entry (blank)
  entriesToAdd.push({
    Name: " ",
    HelpDesc: JSON.stringify(""),
    Symbol: "emBlankSpace",
    ShowHide: JSON.stringify("show = true;"),
    Enable: JSON.stringify("enabled = false;"),
    Ext: JSON.stringify("ext = 0;"),
    MakeCommandCode: JSON.stringify(
      "this.addCommand(name, symbol, enabled, ext);",
    ),
    DrawItemCode: JSON.stringify(""),
    ProcessOkCode: JSON.stringify(""),
    CursorRightCode: JSON.stringify(""),
    CursorLeftCode: JSON.stringify(""),
    DefaultConfigCode: JSON.stringify(""),
    SaveConfigCode: JSON.stringify(""),
    LoadConfigCode: JSON.stringify(""),
  });

  injectAtBottom(entriesToAdd);
})();
