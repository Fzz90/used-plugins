/*:
 * @plugindesc (v1.0.3) Add-on for SRD_AltMenuScreen_KH: draw actor bust from img/pictures in 1:1 square area (no cropping) + EXP Bar support.
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_SRD_KHMenu_BustPictures.js
 * ============================================================================
 * - Bust drawn from img/pictures (Actor_<id>.png by default)
 * - Bust is rendered inside a 1:1 (square) area
 * - No cropping (contain scaling)
 * - Bottom area reserved for Name/Level/HP/MP/(TP)/EXP
 * - Optional smoothing for scaled images
 *
 * Place this plugin BELOW SRD_AltMenuScreen_KH.js
 *
 * Notes:
 * - EXP bar uses Window_Base.drawGauge(), so if you use PrettySleekGauges,
 *   the EXP bar will automatically follow its gauge style.
 *
 * ============================================================================
 * @param BustPrefix
 * @type string
 * @default Actor_
 *
 * @param StatusAreaHeight
 * @type number
 * @min 0
 * @default 110
 * @desc Reserved minimum height at the bottom for Name/Level/HP/MP/(TP)/EXP.
 *
 * @param BustPaddingX
 * @type number
 * @default 0
 *
 * @param BustPaddingY
 * @type number
 * @default 0
 *
 * @param AllowUpscale
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param SmoothBust
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param == EXP Bar ==
 * @default
 *
 * @param ShowExpBar
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param ExpLabel
 * @type string
 * @default EXP
 *
 * @param ExpTextMode
 * @type select
 * @option Percent
 * @value percent
 * @option Next Exp (remaining)
 * @value next
 * @default percent
 *
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_SRD_KHMenu_BustPictures";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const toBool = (v, d = "true") =>
    String(v ?? d)
      .trim()
      .toLowerCase() === "true";
  const toNum = (v, d = 0) => Number(v ?? d);

  const P = {
    prefix: String(params.BustPrefix || "Actor_"),
    statusH: toNum(params.StatusAreaHeight, 110),
    padX: toNum(params.BustPaddingX, 0),
    padY: toNum(params.BustPaddingY, 0),
    upscale: toBool(params.AllowUpscale, "true"),
    smooth: toBool(params.SmoothBust, "true"),

    showExp: toBool(params.ShowExpBar, "true"),
    expLabel: String(params.ExpLabel || "EXP"),
    expTextMode: String(params.ExpTextMode || "percent"),
  };

  if (typeof Window_MenuStatus === "undefined") return;

  // --------------------------------------------------------------------------
  // Read SRD KH params (Show TP) so our layout stays consistent
  // --------------------------------------------------------------------------
  const srdParams = PluginManager.parameters("SRD_AltMenuScreen_KH") || {};
  const SRD_SHOW_TP =
    String(srdParams["Show TP"] || "false")
      .trim()
      .toLowerCase() === "true";

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function getExpRate(actor) {
    if (actor && actor.isMaxLevel && actor.isMaxLevel()) return 1;
    if (
      !actor ||
      !actor.currentExp ||
      !actor.currentLevelExp ||
      !actor.nextLevelExp
    )
      return 0;

    const cur = actor.currentExp();
    const curLv = actor.currentLevelExp();
    const nextLv = actor.nextLevelExp();

    const need = Math.max(0, nextLv - curLv);
    const got = Math.max(0, cur - curLv);

    return need > 0 ? clamp(got / need, 0, 1) : 1;
  }

  function getNextExpRemaining(actor) {
    if (actor && actor.isMaxLevel && actor.isMaxLevel()) return 0;
    if (
      !actor ||
      !actor.currentExp ||
      !actor.currentLevelExp ||
      !actor.nextLevelExp
    )
      return 0;

    const cur = actor.currentExp();
    const curLv = actor.currentLevelExp();
    const nextLv = actor.nextLevelExp();

    const need = Math.max(0, nextLv - curLv);
    const got = Math.max(0, cur - curLv);
    return Math.max(0, need - got);
  }

  function calcRequiredStatusHeight(win) {
    const lh = win.lineHeight();
    // Name, Level, HP, MP are always present in this menu.
    let lines = 4;

    if (SRD_SHOW_TP) lines += 1;
    if (P.showExp) lines += 1;

    // Small extra padding so text isn't glued to the border.
    return lines * lh + 8;
  }

  // --------------------------------------------------------------------------
  // EXP Gauge: PrettySleekGauges-friendly (uses drawGauge)
  // --------------------------------------------------------------------------
  function drawActorExpGauge(win, actor, x, y, width) {
    width = width || 186;

    const labelW = Math.min(48, Math.floor(width * 0.25));
    const gaugeX = x + labelW;
    const gaugeW = Math.max(1, width - labelW);

    const rate = getExpRate(actor);

    // Use TP gauge colors by default to keep it distinct from HP/MP.
    const color1 = win.tpGaugeColor1 ? win.tpGaugeColor1() : win.textColor(28);
    const color2 = win.tpGaugeColor2 ? win.tpGaugeColor2() : win.textColor(29);

    win.drawGauge(gaugeX, y, gaugeW, rate, color1, color2);

    win.changeTextColor(win.systemColor());
    win.drawText(" \\c[" + 30 + "]" + P.expLabel, x, y, labelW, "left");
    win.resetTextColor();

    let rightText = "";
    if (actor && actor.isMaxLevel && actor.isMaxLevel()) {
      rightText = "MAX";
    } else if (P.expTextMode === "next") {
      rightText = String(getNextExpRemaining(actor));
    } else {
      rightText = `${Math.floor(rate * 100)}%`;
    }

    win.drawText(rightText, x, y, width, "right");
  }

  // ==========================================================================
  // Draw bust in a 1:1 square area (no cropping)
  // ==========================================================================
  Window_MenuStatus.prototype.drawItemImage = function (index) {
    const actor = $gameParty.members()[index];
    if (!actor) return;

    const rect = this.itemRect(index);
    this.changePaintOpacity(actor.isBattleMember());

    const bmp = ImageManager.loadPicture(P.prefix + actor.actorId());

    // Use an effective status height that guarantees space for HP/MP/(TP)/EXP lines
    const requiredStatusH = calcRequiredStatusHeight(this);
    const statusH = Math.max(P.statusH, requiredStatusH);

    // Available image area (upper slot, minus status area)
    const availW = rect.width - P.padX * 2;
    const availH = Math.max(1, rect.height - statusH - P.padY * 2);

    // Force 1:1 square area
    const squareSize = Math.min(availW, availH);

    const areaX = rect.x + P.padX + Math.floor((availW - squareSize) / 2);
    const areaY = rect.y + P.padY + 70;

    bmp.addLoadListener(() => {
      const bw = bmp.width;
      const bh = bmp.height;
      if (bw <= 0 || bh <= 0) return;

      // Contain scale inside square (NO CROPPING)
      const scaleContain = Math.min(squareSize / bw, squareSize / bh);
      const scale = P.upscale ? scaleContain : Math.min(scaleContain, 1);

      // USER REQUEST: extra padding size
      const dw = Math.floor(bw * scale) + 65;
      const dh = Math.floor(bh * scale) + 65;

      // Center horizontally, bottom-align inside square
      const dx = areaX + Math.floor((squareSize - dw) / 2);
      const dy = areaY + Math.floor(squareSize - dh);

      const prevSmooth = this.contents.smooth;
      this.contents.smooth = !!P.smooth;
      this.contents.blt(bmp, 0, 0, bw, bh, dx, dy, dw, dh);
      this.contents.smooth = prevSmooth;
    });

    this.changePaintOpacity(true);
  };

  // ==========================================================================
  // Draw status text + EXP bar at the bottom area
  // ==========================================================================
  Window_MenuStatus.prototype.drawItemStatus = function (index) {
    const actor = $gameParty.members()[index];
    if (!actor) return;

    const rect = this.itemRect(index);
    const x = rect.x + 4;
    const width = rect.width - 8;
    const lh = this.lineHeight();

    // Effective reserved height
    const requiredStatusH = calcRequiredStatusHeight(this);
    const statusH = Math.max(P.statusH, requiredStatusH);

    // Anchor all status lines inside the reserved bottom area
    const yStart = rect.y + rect.height - statusH + 4;

    this.drawActorName(actor, x, yStart, width);
    this.drawActorLevel(actor, x, yStart + lh, width);
    this.drawActorHp(actor, x, yStart + lh * 2, width);
    this.drawActorMp(actor, x, yStart + lh * 3, width);

    let lineIndex = 4;
    if (SRD_SHOW_TP) {
      this.drawActorTp(actor, x, yStart + lh * lineIndex, width);
      lineIndex += 1;
    }

    if (P.showExp) {
      drawActorExpGauge(this, actor, x, yStart + lh * lineIndex, width);
    }

    this.resetFontSettings();
  };
})();
