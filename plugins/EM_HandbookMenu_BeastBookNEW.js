/*:
 * @author Faiz Syihab
 * @plugindesc (v1.0.0) Adds "Handbook" command to Menu (with icon) that triggers BeastBook open. Place below $MUSH_AchievementSystem_P1.js.
 *
 * @help
 * ============================================================================
 * EM_HandbookMenu_BeastBook.js
 * ============================================================================
 * - Adds a new Menu command: "Handbook" with icon 733
 * - Command is positioned directly BELOW MushroomCake28 Achievements command
 * - On select, executes Plugin Command: BeastBook open
 *
 * REQUIRED:
 * - STV_BeastBook.js (or any BeastBook plugin that reacts to plugin command
 *   "BeastBook open")
 *
 * PLUGIN ORDER (IMPORTANT):
 * 1) STV_BeastBook.js
 * 2) $MUSH_AchievementSystem_P1.js
 * 3) EM_HandbookMenu_BeastBook.js   <-- this plugin
 *
 * ============================================================================
 * @param CommandName
 * @type string
 * @default Handbook
 *
 * @param IconIndex
 * @type number
 * @min 0
 * @default 733
 *
 * @param ShowOnlyIfBeastBookExists
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param AfterSymbol
 * @type string
 * @default mushAchievements
 * @desc Insert this command after this symbol (default: mushAchievements).
 */
(() => {
  "use strict";

  const PLUGIN_NAME = "EM_HandbookMenu_BeastBook";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const P = {
    name: String(params.CommandName || "Handbook"),
    icon: Number(params.IconIndex || 733),
    onlyIfBeastBook:
      String(params.ShowOnlyIfBeastBookExists || "true") === "true",
    afterSymbol: String(params.AfterSymbol || "mushAchievements"),
  };

  const SYM = "emHandbook";

  const beastBookExists = () => {
    return (
      typeof Window_BeastBook_Info !== "undefined" ||
      typeof Scene_BeastBook !== "undefined" ||
      typeof Scene_Beastiary !== "undefined" ||
      typeof $beastBook !== "undefined"
    );
  };

  // --------------------------------------------------------------------------
  // Add command to menu list
  // --------------------------------------------------------------------------
  const _Window_MenuCommand_makeCommandList =
    Window_MenuCommand.prototype.makeCommandList;
  Window_MenuCommand.prototype.makeCommandList = function () {
    _Window_MenuCommand_makeCommandList.call(this);

    if (P.onlyIfBeastBook && !beastBookExists()) return;

    const enabled = this.areMainCommandsEnabled
      ? this.areMainCommandsEnabled()
      : true;

    this.addCommand(P.name, SYM, enabled);
    this.repositionEmHandbook();
  };

  // Place directly below Achievements (mushAchievements by default)
  Window_MenuCommand.prototype.repositionEmHandbook = function () {
    let item = null;

    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i] && this._list[i].symbol === SYM) {
        item = this._list[i];
        this._list.splice(i, 1);
        break;
      }
    }
    if (!item) return;

    // Insert right after AfterSymbol
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i] && this._list[i].symbol === P.afterSymbol) {
        this._list.splice(i + 1, 0, item);
        return;
      }
    }

    // Fallback: before Options
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i] && this._list[i].symbol === "options") {
        this._list.splice(i, 0, item);
        return;
      }
    }

    // Last fallback: end
    this._list.push(item);
  };

  // --------------------------------------------------------------------------
  // Draw icon + text for our command only
  // --------------------------------------------------------------------------
  const _Window_MenuCommand_drawItem = Window_MenuCommand.prototype.drawItem;
  Window_MenuCommand.prototype.drawItem = function (index) {
    const symbol = this.commandSymbol(index);
    if (symbol !== SYM) {
      return _Window_MenuCommand_drawItem.call(this, index);
    }

    const rect = this.itemRectForText(index);
    const enabled = this.isCommandEnabled(index);

    this.resetTextColor();
    this.changePaintOpacity(enabled);

    const iconW = Window_Base._iconWidth;
    const iconH = Window_Base._iconHeight;

    const ix = rect.x - 3;
    const iy = rect.y + Math.floor((rect.height - iconH) / 2);

    this.drawIcon(P.icon, ix, iy);

    const textX = ix + iconW;
    const textW = rect.width - iconW;

    this.drawText(this.commandName(index), textX, rect.y, textW, "left");

    this.changePaintOpacity(true);
  };

  // --------------------------------------------------------------------------
  // Handler: execute plugin command "BeastBook open"
  // --------------------------------------------------------------------------
  const _Scene_Menu_createCommandWindow =
    Scene_Menu.prototype.createCommandWindow;
  Scene_Menu.prototype.createCommandWindow = function () {
    _Scene_Menu_createCommandWindow.call(this);
    if (this._commandWindow) {
      this._commandWindow.setHandler(SYM, this.commandEmHandbook.bind(this));
    }
  };

  Scene_Menu.prototype.commandEmHandbook = function () {
    let opened = false;

    // Execute plugin command BeastBook open
    try {
      const interpreter = new Game_Interpreter();
      if (interpreter && interpreter.pluginCommand) {
        interpreter.pluginCommand("BeastBook", ["open"]);
        opened = true;
      }
    } catch (e) {
      console.warn("EM_HandbookMenu_BeastBook: pluginCommand error:", e);
    }

    // Fallback: push known scene names if pluginCommand didn't open anything
    if (!opened) {
      if (typeof Scene_BeastBook !== "undefined") {
        SceneManager.push(Scene_BeastBook);
        return;
      }
      if (typeof Scene_Beastiary !== "undefined") {
        SceneManager.push(Scene_Beastiary);
        return;
      }
      SoundManager.playBuzzer();
      if (this._commandWindow) this._commandWindow.activate();
      console.warn(
        "EM_HandbookMenu_BeastBook: BeastBook scene not found and plugin command failed.",
      );
      return;
    }
  };
})();
