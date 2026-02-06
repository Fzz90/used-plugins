/*:
 * @plugindesc (v1.0.1) Fix NW.js/Chromium warnings: CanvasTextAlign undefined + willReadFrequently for Bitmap canvas.
 * @author Faiz Syihab
 *
 * @help
 * Menghilangkan warning setelah update NW.js/Chromium:
 * 1) "The provided value 'undefined' is not a valid enum value of type CanvasTextAlign"
 *    -> memastikan align pada Bitmap.drawText selalu valid ("left/center/right")
 *
 * 2) "Canvas2D: Multiple readback operations using getImageData are faster with
 *     the willReadFrequently attribute set to true"
 *    -> membuat Bitmap canvas memakai getContext("2d", { willReadFrequently: true }) jika didukung.
 *
 * Pasang plugin ini PALING BAWAH.
 */

(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // (1) Fix CanvasTextAlign undefined
  // ---------------------------------------------------------------------------
  if (window.Bitmap && Bitmap.prototype.drawText) {
    const _Bitmap_drawText = Bitmap.prototype.drawText;

    Bitmap.prototype.drawText = function (
      text,
      x,
      y,
      maxWidth,
      lineHeight,
      align,
    ) {
      // Normalize align to valid CanvasTextAlign
      if (align !== "left" && align !== "center" && align !== "right") {
        align = "left";
      }
      return _Bitmap_drawText.call(
        this,
        text,
        x,
        y,
        maxWidth,
        lineHeight,
        align,
      );
    };
  }

  // ---------------------------------------------------------------------------
  // (2) Fix willReadFrequently warning for frequent getImageData readbacks
  // ---------------------------------------------------------------------------
  if (window.Bitmap && Bitmap.prototype._createCanvas) {
    const _Bitmap__createCanvas = Bitmap.prototype._createCanvas;

    Bitmap.prototype._createCanvas = function (width, height) {
      _Bitmap__createCanvas.call(this, width, height);

      // Replace context with willReadFrequently if supported by Chromium
      try {
        if (this._canvas && this._canvas.getContext) {
          const ctx = this._canvas.getContext("2d", {
            willReadFrequently: true,
          });
          if (ctx) this._context = ctx;
        }
      } catch (e) {
        // Silent fallback to default context
      }
    };
  }
  // ---------------------------------------------------------------------------
  // (3) Pixi v4 deprecation fix: VoidFilter -> AlphaFilter
  // ---------------------------------------------------------------------------
  if (window.PIXI && PIXI.filters) {
    if (!PIXI.filters.VoidFilter && PIXI.filters.AlphaFilter) {
      PIXI.filters.VoidFilter = function () {
        return new PIXI.filters.AlphaFilter(1.0);
      };
      PIXI.filters.VoidFilter.prototype = PIXI.filters.AlphaFilter.prototype;
    }
  }
})();
