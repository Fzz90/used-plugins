/*:
 * @plugindesc (v1.1) 4x4 Picture Puzzle with 2x2 QUADRANT SUM target + Quadrant Gap. Each quadrant generates different numbers. Drag & swap, snap, border, SE, disable ESC, instruction window. @author You
 *
 * @help
 * ============================================================================
 *  EM_QuadrantSumPicturePuzzle.js
 * ============================================================================
 * Konsep:
 *  - Puzzle 4x4 tile (16 pieces) dari satu gambar (img/pictures).
 *  - Dibagi menjadi 4 kuadran 2x2 dengan GAP/margin di tengah (QuadrantGap).
 *  - Target: jumlah angka di SETIAP kuadran 2x2 harus = TargetSum.
 *  - Angka setiap kuadran di-generate berbeda (range berbeda).
 *  - Drag tile untuk swap + snap rapi.
 *  - Saat selesai -> SuccessSwitch ON.
 *
 * Ukuran gambar sumber:
 *  - Lebar  = TileW * 4
 *  - Tinggi = TileH * 4
 *
 * ----------------------------------------------------------------------------
 * Plugin Commands (RPG Maker MV)
 * ----------------------------------------------------------------------------
 * QSumSetup <ImageName> <GridX> <GridY> <TileW> <TileH> [TargetSum] [SuccessSwitch]
 * QSumStart [ScrambleCount]
 * QSumStop
 * QSumLockPlayer <0/1>
 * QSumSetTarget <Number>
 * ----------------------------------------------------------------------------
 *
 * Contoh Event:
 *  QSumSetup PuzzleArt 240 60 128 128 96 1
 *  QSumLockPlayer 1
 *  QSumStart 60
 *
 * ============================================================================
 *
 * @param SlideSE
 * @text Sliding Sound Effect
 * @type file
 * @dir audio/se
 * @default Cursor2
 *
 * @param SlideSEVolume
 * @text Sliding SE Volume
 * @type number
 * @min 0
 * @max 100
 * @default 80
 *
 * @param SlideSEPitch
 * @text Sliding SE Pitch
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param SlideSEPan
 * @text Sliding SE Pan
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @param TileBorderWidth
 * @text Tile Border Width
 * @type number
 * @min 0
 * @max 10
 * @default 3
 *
 * @param TileBorderColor
 * @text Tile Border Color
 * @default #000000
 *
 * @param PuzzleOffsetX
 * @text Puzzle Offset X
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param PuzzleOffsetY
 * @text Puzzle Offset Y
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param QuadrantGap
 * @text Quadrant Gap (px)
 * @type number
 * @min 0
 * @max 200
 * @default 24
 *
 * @param InstructionWindow
 * @text Show Instruction Window
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @param InstructionWinWidth
 * @text Instruction Window Width
 * @type number
 * @min 100
 * @max 1000
 * @default 360
 *
 * @param InstructionWinHeight
 * @text Instruction Window Height
 * @type number
 * @min 80
 * @max 1000
 * @default 220
 *
 * @param InstructionWinOffsetX
 * @text Instruction Window Offset X
 * @type number
 * @min -9999
 * @max 9999
 * @default 20
 *
 * @param InstructionWinOffsetY
 * @text Instruction Window Offset Y
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @param InstructionFontSize
 * @text Instruction Font Size
 * @type number
 * @min 12
 * @max 72
 * @default 32
 *
 * @param NumberFontSize
 * @text Number Font Size
 * @type number
 * @min 12
 * @max 72
 * @default 34
 *
 * @param NumberOutlineWidth
 * @text Number Outline Width
 * @type number
 * @min 0
 * @max 12
 * @default 6
 *
 * @param SumFontSize
 * @text Quadrant Sum Font Size
 * @type number
 * @min 12
 * @max 96
 * @default 56
 *
 * @param CrossThickness
 * @text Cross Thickness (px)
 * @type number
 * @min 0
 * @max 80
 * @default 18
 *
 * @param CrossColor
 * @text Cross Color
 * @default #ff0000
 *
 * @param GenMinGap
 * @text Generation Min Gap
 * @type number
 * @min 0
 * @max 50
 * @default 6
 *
 * @param GenMaxTry
 * @text Generation Max Try
 * @type number
 * @min 1000
 * @max 100000
 * @default 20000
 *
 * @param AvoidGlobalDuplicates
 * @text Avoid Duplicates Across Quadrants
 * @type boolean
 * @on Avoid
 * @off Allow
 * @default true
 *
 * @param TL_Min
 * @text TL (Yellow) Min
 * @type number
 * @default 1
 * @param TL_Max
 * @text TL (Yellow) Max
 * @type number
 * @default 30
 *
 * @param TR_Min
 * @text TR (Green) Min
 * @type number
 * @default 10
 * @param TR_Max
 * @text TR (Green) Max
 * @type number
 * @default 45
 *
 * @param BL_Min
 * @text BL (Blue) Min
 * @type number
 * @default 5
 * @param BL_Max
 * @text BL (Blue) Max
 * @type number
 * @default 40
 *
 * @param BR_Min
 * @text BR (Magenta) Min
 * @type number
 * @default 12
 * @param BR_Max
 * @text BR (Magenta) Max
 * @type number
 * @default 55
 */

(function () {
  "use strict";

  const PLUGIN_NAME = "EM_QuadrantSumPicturePuzzle";
  const p = PluginManager.parameters(PLUGIN_NAME);

  // --- Params ---
  const SLIDE_SE = {
    name: String(p["SlideSE"] || "Cursor2"),
    volume: Number(p["SlideSEVolume"] || 80),
    pitch: Number(p["SlideSEPitch"] || 100),
    pan: Number(p["SlideSEPan"] || 0),
  };

  const BORDER_WIDTH = Number(p["TileBorderWidth"] || 3);
  const BORDER_COLOR = String(p["TileBorderColor"] || "#000000");

  const OFFSET_X = Number(p["PuzzleOffsetX"] || 0);
  const OFFSET_Y = Number(p["PuzzleOffsetY"] || 0);

  const QUAD_GAP = Number(p["QuadrantGap"] || 24);

  const INSTR_ENABLED = String(p["InstructionWindow"] || "true") === "true";
  const INSTR_W = Number(p["InstructionWinWidth"] || 360);
  const INSTR_H = Number(p["InstructionWinHeight"] || 220);
  const INSTR_OX = Number(p["InstructionWinOffsetX"] || 20);
  const INSTR_OY = Number(p["InstructionWinOffsetY"] || 0);
  const INSTR_FS = Number(p["InstructionFontSize"] || 32);

  const NUM_FONT_SIZE = Number(p["NumberFontSize"] || 34);
  const NUM_OUTLINE_W = Number(p["NumberOutlineWidth"] || 6);

  const SUM_FONT_SIZE = Number(p["SumFontSize"] || 56);

  const CROSS_THICKNESS = Number(p["CrossThickness"] || 18);
  const CROSS_COLOR = String(p["CrossColor"] || "#ff0000");

  const GEN_MIN_GAP = Number(p["GenMinGap"] || 6);
  const GEN_MAX_TRY = Number(p["GenMaxTry"] || 20000);
  const AVOID_GLOBAL_DUPES =
    String(p["AvoidGlobalDuplicates"] || "true") === "true";

  const TL_MIN = Number(p["TL_Min"] || 1),
    TL_MAX = Number(p["TL_Max"] || 30);
  const TR_MIN = Number(p["TR_Min"] || 10),
    TR_MAX = Number(p["TR_Max"] || 45);
  const BL_MIN = Number(p["BL_Min"] || 5),
    BL_MAX = Number(p["BL_Max"] || 40);
  const BR_MIN = Number(p["BR_Min"] || 12),
    BR_MAX = Number(p["BR_Max"] || 55);

  // --- Helpers ---
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ==========================================================================
  // Instruction Window
  // ==========================================================================
  function Window_EMQSumInstruction(x, y, w, h) {
    this.initialize.apply(this, arguments);
  }
  Window_EMQSumInstruction.prototype = Object.create(Window_Base.prototype);
  Window_EMQSumInstruction.prototype.constructor = Window_EMQSumInstruction;

  Window_EMQSumInstruction.prototype.initialize = function (x, y, w, h) {
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this._target = 0;
    this.refresh();
  };
  Window_EMQSumInstruction.prototype.setTarget = function (v) {
    v = Number(v || 0);
    if (this._target !== v) {
      this._target = v;
      this.refresh();
    }
  };
  Window_EMQSumInstruction.prototype.refresh = function () {
    this.contents.clear();
    this.contents.fontFace = "GameFont";
    this.contents.fontSize = INSTR_FS;
    const w = this.contentsWidth();
    const y0 = 10;
    const lh = this.lineHeight();
    this.changeTextColor(this.normalColor());
    this.drawText("Instruction:", 0, y0, w, "center");
    this.drawText("Place the Puzzle", 0, y0 + lh * 1.4, w, "center");
    this.drawText("that match the sum", 0, y0 + lh * 2.4, w, "center");
    this.drawText("of", 0, y0 + lh * 3.4, w, "center");
    this.changeTextColor(this.textColor(10));
    this.drawText(String(this._target), 0, y0 + lh * 4.4, w, "center");
    this.resetTextColor();
  };

  // ==========================================================================
  // Main Puzzle
  // ==========================================================================
  const QSum = {
    active: false,
    lockPlayer: true,

    imageName: "",
    gridX: 0,
    gridY: 0,
    tileW: 0,
    tileH: 0,
    targetSum: 96,
    successSwitchId: 1,

    container: null,
    sourceBitmap: null,
    tiles: [],
    dragging: null,
    dragOX: 0,
    dragOY: 0,

    quadLabels: { TL: null, BL: null, TR: null, BR: null },

    instrWin: null,
    crossSprite: null,

    _pendingScramble: 40,

    // --- Cell coordinate to screen coordinate with quadrant gap ---
    _cellToX(cx) {
      const extra = cx >= 2 ? QUAD_GAP : 0;
      return this.gridX + cx * this.tileW + extra;
    },
    _cellToY(cy) {
      const extra = cy >= 2 ? QUAD_GAP : 0;
      return this.gridY + cy * this.tileH + extra;
    },

    // width/height of full puzzle area on screen (includes gap)
    _puzzleW() {
      return this.tileW * 4 + QUAD_GAP;
    },
    _puzzleH() {
      return this.tileH * 4 + QUAD_GAP;
    },

    setup(imageName, x, y, tw, th, target, sw) {
      this.imageName = String(imageName || "");
      this.gridX = Number(x || 0) + OFFSET_X;
      this.gridY = Number(y || 0) + OFFSET_Y;
      this.tileW = Number(tw || 0);
      this.tileH = Number(th || 0);
      this.targetSum = Number(target || 96);
      this.successSwitchId = Number(sw || 1);
    },

    start(scrambleCount) {
      if (this.active) return;
      if (!this.imageName) return;
      const sc = SceneManager._scene;
      if (!sc || !(sc instanceof Scene_Map)) return;

      this.active = true;
      this.tiles = [];
      this.dragging = null;
      this._pendingScramble = Number(scrambleCount || 40);

      this.container = new Sprite();
      this.container.z = 9999;
      if (sc._spriteset && sc._spriteset._baseSprite)
        sc._spriteset._baseSprite.addChild(this.container);
      else sc.addChild(this.container);

      this.sourceBitmap = ImageManager.loadPicture(this.imageName);
      const wait = () => {
        if (!this.active) return;
        if (this.sourceBitmap && this.sourceBitmap.isReady()) {
          this._build(sc);
        } else setTimeout(wait, 16);
      };
      wait();
    },

    stop() {
      if (!this.active) return;

      if (this.instrWin && this.instrWin.parent)
        this.instrWin.parent.removeChild(this.instrWin);
      this.instrWin = null;

      if (this.container && this.container.parent)
        this.container.parent.removeChild(this.container);

      this.container = null;
      this.sourceBitmap = null;
      this.tiles = [];
      this.dragging = null;
      this.crossSprite = null;
      this.quadLabels = { TL: null, BL: null, TR: null, BR: null };
      this.active = false;
    },

    setTarget(v) {
      this.targetSum = Number(v || 0);
      if (this.instrWin) this.instrWin.setTarget(this.targetSum);
      this._updateQuadrantLabels();
    },

    _build(scene) {
      // Generate 4 quadrant number sets (each sums to target)
      const quads = this._generateQuadrantNumbers(this.targetSum);

      // Put numbers into 4x4 "solution grid" by quadrant:
      const solution = [
        [quads.TL[0], quads.TL[1], quads.TR[0], quads.TR[1]],
        [quads.TL[2], quads.TL[3], quads.TR[2], quads.TR[3]],
        [quads.BL[0], quads.BL[1], quads.BR[0], quads.BR[1]],
        [quads.BL[2], quads.BL[3], quads.BR[2], quads.BR[3]],
      ];

      // Build 16 tiles from picture (4x4 crop) BUT positioned with gap
      const src = this.sourceBitmap;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const bmp = new Bitmap(this.tileW, this.tileH);
          bmp.blt(
            src,
            c * this.tileW,
            r * this.tileH,
            this.tileW,
            this.tileH,
            0,
            0
          );

          this._drawBorder(bmp);
          this._drawNumber(bmp, solution[r][c]);

          const spr = new Sprite(bmp);
          spr._num = solution[r][c];
          spr._cellX = c;
          spr._cellY = r;
          spr.x = this._cellToX(c);
          spr.y = this._cellToY(r);

          this.tiles.push(spr);
          this.container.addChild(spr);
        }
      }

      // Cross overlay drawn in the GAP area (looks like your mockup)
      this._buildCrossOverlay();

      // Quadrant sum labels (left/right)
      this._buildQuadrantLabels();

      // Instruction window
      this._buildInstruction(scene);

      // Scramble AFTER build (so it won't start already solved)
      this._scramble(this._pendingScramble);
      if (this._allQuadrantsMatch()) this._scramble(this._pendingScramble + 10);

      this._updateQuadrantLabels();
    },

    _drawBorder(bmp) {
      if (BORDER_WIDTH <= 0) return;
      bmp.context.save();
      bmp.context.strokeStyle = BORDER_COLOR;
      bmp.context.lineWidth = BORDER_WIDTH;
      bmp.context.strokeRect(
        BORDER_WIDTH / 2,
        BORDER_WIDTH / 2,
        bmp.width - BORDER_WIDTH,
        bmp.height - BORDER_WIDTH
      );
      bmp.context.restore();
      bmp._baseTexture.update();
    },

    _drawNumber(bmp, num) {
      bmp.fontFace = "GameFont";
      bmp.fontSize = NUM_FONT_SIZE;
      bmp.outlineColor = "rgba(0,0,0,0.85)";
      bmp.outlineWidth = NUM_OUTLINE_W;
      bmp.textColor = "#ffffff";
      const pad = 10;
      bmp.drawText(
        String(num),
        pad,
        bmp.height - bmp.fontSize - pad,
        bmp.width - pad * 2,
        bmp.fontSize + 8,
        "right"
      );
    },

    _buildCrossOverlay() {
      const w = this._puzzleW();
      const h = this._puzzleH();
      const bmp = new Bitmap(w, h);
      const t = CROSS_THICKNESS;

      // center of the gap area
      const vx = this.tileW * 2 + Math.floor(QUAD_GAP / 2) - Math.floor(t / 2);
      const hy = this.tileH * 2 + Math.floor(QUAD_GAP / 2) - Math.floor(t / 2);

      bmp.context.save();
      bmp.context.fillStyle = CROSS_COLOR;
      bmp.context.fillRect(vx, 0, t, h);
      bmp.context.fillRect(0, hy, w, t);
      bmp.context.restore();
      bmp._baseTexture.update();

      const spr = new Sprite(bmp);
      spr.x = this.gridX;
      spr.y = this.gridY;
      spr.z = 10000;
      this.crossSprite = spr;
      this.container.addChild(spr);
    },

    _buildQuadrantLabels() {
      const makeLabel = (w, h) => {
        const b = new Bitmap(w, h);
        const s = new Sprite(b);
        this.container.addChild(s);
        return s;
      };

      const labelW = 120;
      const labelH = this.tileH * 2; // same height as each quadrant block (2 tiles)

      this.quadLabels.TL = makeLabel(labelW, labelH);
      this.quadLabels.BL = makeLabel(labelW, labelH);
      this.quadLabels.TR = makeLabel(labelW, labelH);
      this.quadLabels.BR = makeLabel(labelW, labelH);

      const leftX = this.gridX - labelW - 20;
      const rightX = this.gridX + this._puzzleW() + 20;

      const topY = this.gridY;
      const botY = this.gridY + this.tileH * 2 + QUAD_GAP;

      this.quadLabels.TL.x = leftX;
      this.quadLabels.TL.y = topY;
      this.quadLabels.BL.x = leftX;
      this.quadLabels.BL.y = botY;
      this.quadLabels.TR.x = rightX;
      this.quadLabels.TR.y = topY;
      this.quadLabels.BR.x = rightX;
      this.quadLabels.BR.y = botY;
    },

    _buildInstruction(scene) {
      if (!INSTR_ENABLED) return;

      // place after right labels
      const labelW = 120;
      const x = this.gridX + this._puzzleW() + 20 + labelW + INSTR_OX;
      const y = this.gridY + INSTR_OY;

      const win = new Window_EMQSumInstruction(x, y, INSTR_W, INSTR_H);
      win.setTarget(this.targetSum);
      scene.addWindow(win);
      this.instrWin = win;
    },

    _scramble(count) {
      const cells = [];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) cells.push({ x, y });
      shuffle(cells);

      for (let i = 0; i < this.tiles.length; i++) {
        const t = this.tiles[i];
        const c = cells[i];
        t._cellX = c.x;
        t._cellY = c.y;
        t.x = this._cellToX(c.x);
        t.y = this._cellToY(c.y);
      }

      const swaps = Math.max(0, Number(count || 0));
      for (let k = 0; k < swaps; k++) {
        const i = randInt(0, this.tiles.length - 1);
        const j = randInt(0, this.tiles.length - 1);
        if (i === j) continue;
        this._swapTiles(i, j);
      }
    },

    _swapTiles(i, j) {
      const a = this.tiles[i],
        b = this.tiles[j];
      const ax = a._cellX,
        ay = a._cellY;
      a._cellX = b._cellX;
      a._cellY = b._cellY;
      b._cellX = ax;
      b._cellY = ay;

      a.x = this._cellToX(a._cellX);
      a.y = this._cellToY(a._cellY);
      b.x = this._cellToX(b._cellX);
      b.y = this._cellToY(b._cellY);
    },

    // --- Quadrant logic ---
    _gridNumbers() {
      const g = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      for (const t of this.tiles) {
        g[t._cellY][t._cellX] = t._num;
      }
      return g;
    },

    _quadrantSums() {
      const g = this._gridNumbers();
      const TL = g[0][0] + g[0][1] + g[1][0] + g[1][1];
      const TR = g[0][2] + g[0][3] + g[1][2] + g[1][3];
      const BL = g[2][0] + g[2][1] + g[3][0] + g[3][1];
      const BR = g[2][2] + g[2][3] + g[3][2] + g[3][3];
      return { TL, TR, BL, BR };
    },

    _allQuadrantsMatch() {
      const s = this._quadrantSums();
      return (
        s.TL === this.targetSum &&
        s.TR === this.targetSum &&
        s.BL === this.targetSum &&
        s.BR === this.targetSum
      );
    },

    _updateQuadrantLabels() {
      if (!this.active) return;
      const sums = this._quadrantSums();

      const draw = (spr, value) => {
        const b = spr.bitmap;
        b.clear();
        b.fontFace = "GameFont";
        b.fontSize = SUM_FONT_SIZE;
        b.outlineColor = "rgba(0,0,0,0.85)";
        b.outlineWidth = 8;
        b.textColor = value === this.targetSum ? "#a7ffb0" : "#ffffff";
        b.drawText(String(value), 0, 0, b.width, b.height, "center");
      };

      draw(this.quadLabels.TL, sums.TL);
      draw(this.quadLabels.BL, sums.BL);
      draw(this.quadLabels.TR, sums.TR);
      draw(this.quadLabels.BR, sums.BR);
    },

    _checkComplete() {
      if (!this._allQuadrantsMatch()) return;
      $gameSwitches.setValue(this.successSwitchId, true);
    },

    // --- Generator: each quadrant has its own range, each sums to target ---
    _generateQuadrantNumbers(target) {
      const usedGlobal = new Set();

      const pickQuad = (minV, maxV) => {
        for (let tries = 0; tries < GEN_MAX_TRY; tries++) {
          const a = randInt(minV, maxV);
          const b = randInt(minV, maxV);
          const c = randInt(minV, maxV);
          const d = target - (a + b + c);

          const arr = [a, b, c, d];

          if (d < minV || d > maxV) continue;
          if (arr.some((v) => v <= 0)) continue;

          if (new Set(arr).size !== 4) continue;

          const s = arr.slice().sort((x, y) => x - y);
          let okGap = true;
          for (let i = 1; i < s.length; i++) {
            if (s[i] - s[i - 1] < GEN_MIN_GAP) {
              okGap = false;
              break;
            }
          }
          if (!okGap) continue;

          if (AVOID_GLOBAL_DUPES) {
            let dup = false;
            for (const v of arr) {
              if (usedGlobal.has(v)) {
                dup = true;
                break;
              }
            }
            if (dup) continue;
          }

          arr.forEach((v) => usedGlobal.add(v));
          shuffle(arr);
          return arr;
        }

        // fallback
        const fb = [
          minV,
          minV + 1,
          minV + 2,
          target - (minV + (minV + 1) + (minV + 2)),
        ];
        shuffle(fb);
        fb.forEach((v) => usedGlobal.add(v));
        return fb;
      };

      return {
        TL: pickQuad(TL_MIN, TL_MAX),
        TR: pickQuad(TR_MIN, TR_MAX),
        BL: pickQuad(BL_MIN, BL_MAX),
        BR: pickQuad(BR_MIN, BR_MAX),
      };
    },

    // --- Input / Drag & swap ---
    update() {
      if (!this.active) return;
      this._handleDrag();
    },

    _tileAt(px, py) {
      for (let i = this.tiles.length - 1; i >= 0; i--) {
        const t = this.tiles[i];
        const x1 = t.x,
          y1 = t.y,
          x2 = x1 + this.tileW,
          y2 = y1 + this.tileH;
        if (px >= x1 && px < x2 && py >= y1 && py < y2) return t;
      }
      return null;
    },

    _tileAtCell(cx, cy) {
      for (const t of this.tiles) {
        if (t._cellX === cx && t._cellY === cy) return t;
      }
      return null;
    },

    _nearestCell(t) {
      // robust nearest slot search (works with any gap)
      let best = { x: 0, y: 0 };
      let bestD = Infinity;

      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const sx = this._cellToX(x);
          const sy = this._cellToY(y);
          const dx = t.x - sx;
          const dy = t.y - sy;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            best = { x, y };
          }
        }
      }
      return best;
    },

    _playSe() {
      if (!SLIDE_SE.name) return;
      AudioManager.playSe({
        name: SLIDE_SE.name,
        volume: SLIDE_SE.volume,
        pitch: SLIDE_SE.pitch,
        pan: SLIDE_SE.pan,
      });
    },

    _handleDrag() {
      if (TouchInput.isTriggered()) {
        const t = this._tileAt(TouchInput.x, TouchInput.y);
        if (t) {
          this.dragging = t;
          if (t.parent) {
            t.parent.removeChild(t);
            this.container.addChild(t);
          }
          this.dragOX = TouchInput.x - t.x;
          this.dragOY = TouchInput.y - t.y;
        }
      }

      if (this.dragging && TouchInput.isPressed()) {
        const t = this.dragging;
        t.x = TouchInput.x - this.dragOX;
        t.y = TouchInput.y - this.dragOY;
      }

      if (this.dragging && TouchInput.isReleased()) {
        const t = this.dragging;
        this.dragging = null;

        const cell = this._nearestCell(t);
        const occ = this._tileAtCell(cell.x, cell.y);

        if (occ && occ !== t) {
          const tx = t._cellX,
            ty = t._cellY;
          t._cellX = occ._cellX;
          t._cellY = occ._cellY;
          occ._cellX = tx;
          occ._cellY = ty;

          occ.x = this._cellToX(occ._cellX);
          occ.y = this._cellToY(occ._cellY);
        } else {
          t._cellX = cell.x;
          t._cellY = cell.y;
        }

        t.x = this._cellToX(t._cellX);
        t.y = this._cellToY(t._cellY);

        this._playSe();
        this._updateQuadrantLabels();
        this._checkComplete();
      }
    },
  };

  // ==========================================================================
  // Hooks
  // ==========================================================================
  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    QSum.update();
  };

  const _Game_Player_canMove = Game_Player.prototype.canMove;
  Game_Player.prototype.canMove = function () {
    if (QSum.active && QSum.lockPlayer) return false;
    return _Game_Player_canMove.call(this);
  };

  // Disable ESC/Menu while active (prevents errors)
  const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
  Scene_Map.prototype.isMenuEnabled = function () {
    if (QSum.active) return false;
    return _Scene_Map_isMenuEnabled.call(this);
  };
  const _Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
  Scene_Map.prototype.updateCallMenu = function () {
    if (QSum.active) return;
    _Scene_Map_updateCallMenu.call(this);
  };

  // ==========================================================================
  // Plugin Commands
  // ==========================================================================
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "QSumSetup") {
      const imageName = args[0];
      const x = Number(args[1]);
      const y = Number(args[2]);
      const tw = Number(args[3]);
      const th = Number(args[4]);
      const target = args.length >= 6 ? Number(args[5]) : 96;
      const sw = args.length >= 7 ? Number(args[6]) : 1;
      QSum.setup(imageName, x, y, tw, th, target, sw);
    }

    if (command === "QSumStart") {
      const count = args.length >= 1 ? Number(args[0]) : 40;
      QSum.start(count);
    }

    if (command === "QSumStop") {
      QSum.stop();
    }

    if (command === "QSumLockPlayer") {
      QSum.lockPlayer = Number(args[0] || 0) === 1;
    }

    if (command === "QSumSetTarget") {
      QSum.setTarget(Number(args[0] || 0));
    }
  };
})();
