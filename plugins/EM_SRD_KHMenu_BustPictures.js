/*:
 * @plugindesc (v1.0.2) Add-on for SRD_AltMenuScreen_KH: draw actor bust from img/pictures in 1:1 square area, no cropping, with optional smoothing.
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_SRD_KHMenu_BustPictures.js
 * ============================================================================
 * - Bust drawn from img/pictures (Actor_<id>.png by default)
 * - Bust is rendered inside a 1:1 (square) area
 * - No cropping (contain scaling)
 * - Bottom area reserved for Name/Level/HP/MP
 * - Optional smoothing for scaled images
 *
 * Place this plugin BELOW SRD_AltMenuScreen_KH.js
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
 * @desc Reserved height at the bottom for Name/Level/HP/MP.
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
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "EM_SRD_KHMenu_BustPictures";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const P = {
    prefix: String(params.BustPrefix || "Actor_"),
    statusH: Number(params.StatusAreaHeight || 110),
    padX: Number(params.BustPaddingX || 0),
    padY: Number(params.BustPaddingY || 0),
    upscale: String(params.AllowUpscale || "true") === "true",
    smooth: String(params.SmoothBust || "true") === "true",
  };

  if (typeof Window_MenuStatus === "undefined") return;

  // ============================================================================
  // Draw bust in a 1:1 square area (no cropping)
  // ============================================================================
  Window_MenuStatus.prototype.drawItemImage = function (index) {
    const actor = $gameParty.members()[index];
    if (!actor) return;

    const rect = this.itemRect(index);
    this.changePaintOpacity(actor.isBattleMember());

    const bmp = ImageManager.loadPicture(P.prefix + actor.actorId());

    // Available image area (upper slot, minus status area)
    const availW = rect.width - P.padX * 2;
    const availH = Math.max(1, rect.height - P.statusH - P.padY * 2);

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
})();
