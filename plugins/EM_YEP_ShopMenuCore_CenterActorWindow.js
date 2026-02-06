/*:
 * @plugindesc (v1.0.0) YEP_ShopMenuCore - Center the actor selection window (Equip) on screen (1280x720 friendly). ES6.
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_YEP_ShopMenuCore_CenterActorWindow.js
 * ============================================================================
 * Put this plugin BELOW:
 * - YEP_ShopMenuCore.js
 *
 * What it does:
 * - When you press "Equip" in the shop and the actor list appears,
 *   the actor selection window (Window_MenuActor) will be resized to fit
 *   the party (as much as possible) and centered on the screen.
 *
 * Notes:
 * - Uses Graphics.boxWidth / Graphics.boxHeight so it stays correct if you
 *   change resolution.
 * - If party is too large to fit, window height will clamp to screen.
 * ============================================================================
 *
 * @param ActorWindowWidth
 * @text Actor Window Width
 * @type number
 * @min 240
 * @default 560
 *
 * @param ScreenMargin
 * @text Screen Margin
 * @type number
 * @min 0
 * @default 24
 *
 * @param AutoFitHeight
 * @text Auto Fit Height (based on party size)
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param MaxHeightRatio
 * @text Max Height Ratio
 * @type number
 * @decimals 2
 * @min 0.30
 * @max 1.00
 * @default 0.90
 * @desc Max height = Graphics.boxHeight * this ratio (when AutoFitHeight is ON).
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_YEP_ShopMenuCore_CenterActorWindow";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const P = {
    width: Number(params.ActorWindowWidth || 560),
    margin: Number(params.ScreenMargin || 24),
    autoFitHeight: String(params.AutoFitHeight || "true") === "true",
    maxHeightRatio: Math.max(
      0.3,
      Math.min(1.0, Number(params.MaxHeightRatio || 0.9)),
    ),
  };

  if (!window.Imported || !Imported.YEP_ShopMenuCore) return;
  if (typeof Scene_Shop === "undefined") return;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function calcTargetHeight(win) {
    // Fit all actors if possible; otherwise clamp.
    const maxH =
      Math.floor(Graphics.boxHeight * P.maxHeightRatio) - P.margin * 2;

    if (!P.autoFitHeight) {
      return clamp(win.height, win.fittingHeight(1), maxH);
    }

    const partySize =
      $gameParty && $gameParty.members ? $gameParty.members().length : 1;
    const fitH = win.fittingHeight(Math.max(1, partySize));
    return clamp(fitH, win.fittingHeight(1), maxH);
  }

  function centerWindow(win) {
    // Width: clamp to screen
    const maxW = Graphics.boxWidth - P.margin * 2;
    const targetW = clamp(P.width, 240, maxW);

    // Height: auto-fit to party size (optional)
    const targetH = calcTargetHeight(win);

    // Apply size (keep contents correct)
    win.width = targetW;
    win.height = targetH;
    if (win.createContents) win.createContents();

    // Center position
    win.x = Math.floor((Graphics.boxWidth - win.width) / 2);
    win.y = Math.floor((Graphics.boxHeight - win.height) / 2);

    // Keep it above most windows visually (optional but useful)
    win.z = 9999;

    // Refresh selection view
    if (win.refresh) win.refresh();
  }

  // Alias Scene_Shop.createActorWindow created by YEP_ShopMenuCore
  const _Scene_Shop_createActorWindow = Scene_Shop.prototype.createActorWindow;
  Scene_Shop.prototype.createActorWindow = function () {
    _Scene_Shop_createActorWindow.call(this);

    // YEP creates: this._actorWindow = new Window_MenuActor();
    if (this._actorWindow) {
      centerWindow(this._actorWindow);
      this._actorWindow.hide(); // keep default behavior; it will be shown on Equip
      this._actorWindow.deactivate();
    }
  };

  // Also re-center right before showing (in case resolution/party changed)
  const _Scene_Shop_commandEquip = Scene_Shop.prototype.commandEquip;
  Scene_Shop.prototype.commandEquip = function () {
    if (this._actorWindow) centerWindow(this._actorWindow);
    _Scene_Shop_commandEquip.call(this);
  };
})();

// --------------------------------------------------------------------------
// Force HP/MP to show "current/max" ONLY for Window_MenuActor (Shop Equip list)
// --------------------------------------------------------------------------
(() => {
  "use strict";

  if (typeof Window_MenuActor === "undefined") return;

  function drawCurrentAndMaxForced(
    win,
    current,
    max,
    x,
    y,
    width,
    color1,
    color2,
  ) {
    // Always show. If too narrow, draw as compact "cur/max" single string.
    const labelWidth = win.textWidth("HP"); // just to estimate reserved space
    const valueStr = String(current) + "/" + String(max);

    // If not enough room for split layout, render compact on the right
    if (width < labelWidth + win.textWidth(valueStr) + 8) {
      win.changeTextColor(color2);
      win.drawText(valueStr, x, y, width, "right");
      return;
    }

    // Otherwise, render split current / max similar to default but forced
    const valueWidth = Math.max(
      win.textWidth(String(current)),
      win.textWidth(String(max)),
      win.textWidth("0000"),
    );
    const slashWidth = win.textWidth("/");
    const x1 = x + width - valueWidth;
    const x2 = x1 - slashWidth;
    const x3 = x2 - valueWidth;

    win.changeTextColor(color1);
    win.drawText(current, x3, y, valueWidth, "right");
    win.changeTextColor(color2);
    win.drawText("/", x2, y, slashWidth, "right");
    win.drawText(max, x1, y, valueWidth, "right");
  }

  Window_MenuActor.prototype.drawActorHp = function (actor, x, y, width) {
    width = width || 186;
    const color1 = this.hpGaugeColor1();
    const color2 = this.hpGaugeColor2();
    this.drawGauge(x, y, width, actor.hpRate(), color1, color2);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.hpA, x, y, 44);
    drawCurrentAndMaxForced(
      this,
      actor.hp,
      actor.mhp,
      x,
      y,
      width,
      this.hpColor(actor),
      this.normalColor(),
    );
  };

  Window_MenuActor.prototype.drawActorMp = function (actor, x, y, width) {
    width = width || 186;
    const color1 = this.mpGaugeColor1();
    const color2 = this.mpGaugeColor2();
    this.drawGauge(x, y, width, actor.mpRate(), color1, color2);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.mpA, x, y, 44);
    drawCurrentAndMaxForced(
      this,
      actor.mp,
      actor.mmp,
      x,
      y,
      width,
      this.mpColor(actor),
      this.normalColor(),
    );
  };
})();
