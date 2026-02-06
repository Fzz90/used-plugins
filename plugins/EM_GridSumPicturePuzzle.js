/*:
 * @plugindesc (v1.54) 4x4 Sliding Picture + Row/Column Sum Puzzle
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
 *  * @param PuzzleOffsetX
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
 *  * @param InstructionWindow
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

 * @help
 * ============================================================================
 *  EM_GridSumPicturePuzzle.js
 * ============================================================================
 * Konsep:
 *  - Gambar (img/pictures) dipotong jadi 4x4 tile.
 *  - Setiap tile punya angka.
 *  - Pemain drag tile -> auto snap rapi ke cell grid.
 *  - Sisi kanan dan bawah menampilkan jumlah tiap baris/kolom.
 *  - Puzzle complete jika semua jumlah baris/kolom == TargetSum.
 *
 * --------------------------------------------------------------------------
 *  INSTALL
 * --------------------------------------------------------------------------
 * 1) Taruh file plugin ini ke: js/plugins/
 * 2) Aktifkan di Plugin Manager.
 * 3) Pastikan gambar puzzle ada di: img/pictures/
 *
 * --------------------------------------------------------------------------
 *  PLUGIN COMMANDS (RPG Maker MV)
 * --------------------------------------------------------------------------
 *  PuzzleSetup <ImageName> <GridX> <GridY> <TileW> <TileH> [TargetSum] [SuccessSwitch]
 *    - ImageName: nama file di img/pictures tanpa ekstensi (contoh: PuzzleArt)
 *    - GridX, GridY: posisi kiri-atas grid di layar (pixel)
 *    - TileW, TileH: ukuran tiap tile (pixel)
 *    - TargetSum: default 96 jika tidak diisi
 *    - SuccessSwitch: switch ON saat puzzle selesai (default 1 jika tidak diisi)
 *
 *  PuzzleStart [ScrambleCount]
 *    - Menampilkan puzzle di map dan mengacak posisi tile.
 *    - ScrambleCount default 40.
 *
 *  PuzzleStop
 *    - Menutup puzzle dan membersihkan sprite.
 *
 *  PuzzleLockPlayer <0/1>
 *    - 1 = lock player movement saat puzzle aktif, 0 = unlock
 *
 *  PuzzleSetTarget <Number>
 *    - Ganti target sum (misal 96 -> 44)
 *
 * --------------------------------------------------------------------------
 *  NOTES
 * --------------------------------------------------------------------------
 * - Plugin ini meng-generate angka dengan solusi yang valid:
 *   dibuat matriks 4x4 sehingga setiap baris & kolom = TargetSum.
 *   Lalu posisi tile diacak, jadi player harus menyusun agar sum sesuai.
 *
 * - Jika kamu mau angka custom, bilang saja—aku bisa tambah command
 *   untuk set angka per tile manual.
 *
 * --------------------------------------------------------------------------
 *  TERMS
 * --------------------------------------------------------------------------
 * Free to use/modify for your game.
 */

(function () {
  ("use strict");

  const params = PluginManager.parameters("EM_GridSumPicturePuzzle");
  const SLIDE_SE = {
    name: String(params["SlideSE"] || "Cursor2"),
    volume: Number(params["SlideSEVolume"] || 80),
    pitch: Number(params["SlideSEPitch"] || 100),
    pan: Number(params["SlideSEPan"] || 0),
  };

  const BORDER_WIDTH = Number(params["TileBorderWidth"] || 3);
  const BORDER_COLOR = String(params["TileBorderColor"] || "#000000");
  const OFFSET_X = Number(params["PuzzleOffsetX"] || 0);
  const OFFSET_Y = Number(params["PuzzleOffsetY"] || 0);
  const INSTR_ENABLED =
    String(params["InstructionWindow"] || "true") === "true";
  const INSTR_W = Number(params["InstructionWinWidth"] || 360);
  const INSTR_H = Number(params["InstructionWinHeight"] || 220);
  const INSTR_OX = Number(params["InstructionWinOffsetX"] || 20);
  const INSTR_OY = Number(params["InstructionWinOffsetY"] || 0);
  const INSTR_FS = Number(params["InstructionFontSize"] || 32);

  // ==========================================================================
  // Helpers
  // ==========================================================================
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function randInt(min, max) {
    // inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  // ==========================================================================
  // Puzzle Manager
  // ==========================================================================
  const EMPuzzle = {
    active: false,
    lockPlayer: true,
    instructionWindow: null,
    imageName: "",
    gridX: 0,
    gridY: 0,
    tileW: 0,
    tileH: 0,
    size: 4,

    targetSum: 96,
    successSwitchId: 1,

    container: null,
    tiles: [], // array of tile sprites
    rowSumSprites: [], // right side
    colSumSprites: [], // bottom side

    dragging: null, // tile sprite
    dragOffsetX: 0,
    dragOffsetY: 0,

    sourceBitmap: null,
    _pendingScrambleCount: 40,

    // numbersSolution[r][c] is the "goal arrangement"
    numbersSolution: null,

    // ----------------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------------
    setup(imageName, gridX, gridY, tileW, tileH, targetSum, successSwitchId) {
      this.imageName = String(imageName || "");
      this.gridX = Number(gridX || 0) + OFFSET_X;
      this.gridY = Number(gridY || 0) + OFFSET_Y;
      this.tileW = Number(tileW || 0);
      this.tileH = Number(tileH || 0);
      this.targetSum = Number(targetSum || 96);
      this.successSwitchId = Number(successSwitchId || 1);

      this.numbersSolution = this._generateSolvableNumbers(this.targetSum);
    },

    start(scrambleCount) {
      if (this.active) return;
      if (!this.imageName) return;

      this.active = true;
      this.dragging = null;
      this.tiles = [];
      this.rowSumSprites = [];
      this.colSumSprites = [];

      const sc = SceneManager._scene;
      if (!sc || !(sc instanceof Scene_Map)) return;

      this._createContainer(sc);
      this._loadAndBuildTiles(sc);

      this._pendingScrambleCount = Number(scrambleCount || 40);
    },

    stop() {
      if (!this.active) return;
      const sc = SceneManager._scene;
      if (sc && sc instanceof Scene_Map) {
        this._destroySprites(sc);
      }
      this.active = false;
      this.dragging = null;
      this.tiles = [];
      this.rowSumSprites = [];
      this.colSumSprites = [];
      this.container = null;
      this.sourceBitmap = null;
      this._destroyInstructionWindow();
    },

    _playSlideSE() {
      if (!SLIDE_SE.name) return;
      AudioManager.playSe({
        name: SLIDE_SE.name,
        volume: SLIDE_SE.volume,
        pitch: SLIDE_SE.pitch,
        pan: SLIDE_SE.pan,
      });
    },

    setTarget(sum) {
      this.targetSum = Number(sum || 0);
      // Rebuild solution numbers to match new target
      this.numbersSolution = this._generateSolvableNumbers(this.targetSum);
      if (this.active) {
        // keep current tiles but update label target logic
        this._updateSumsText();
      }
      if (this.instructionWindow) {
        this.instructionWindow.setTargetSum(this.targetSum);
      }
    },

    setLockPlayer(v) {
      this.lockPlayer = Number(v || 0) === 1;
    },

    // ----------------------------------------------------------------------
    // Core build
    // ----------------------------------------------------------------------
    _createContainer(scene) {
      // Add container above map (upper layer)
      this.container = new Sprite();
      this.container.z = 9999;

      // Put it on the spriteset base sprite so it appears above map
      if (scene._spriteset && scene._spriteset._baseSprite) {
        scene._spriteset._baseSprite.addChild(this.container);
      } else {
        scene.addChild(this.container);
      }
    },

    _loadAndBuildTiles(scene) {
      this.sourceBitmap = ImageManager.loadPicture(this.imageName);

      // wait for bitmap ready
      const checkReady = () => {
        if (!this.active) return;
        if (this.sourceBitmap && this.sourceBitmap.isReady()) {
          this._buildTilesNow();
        } else {
          setTimeout(checkReady, 16);
        }
      };
      checkReady();
    },

    _isSolved() {
      const grid = this._computeGridNumbers();
      const N = 4;

      for (let r = 0; r < N; r++) {
        const s = grid[r].reduce((a, b) => a + b, 0);
        if (s !== this.targetSum) return false;
      }
      for (let c = 0; c < N; c++) {
        let s = 0;
        for (let r = 0; r < N; r++) s += grid[r][c];
        if (s !== this.targetSum) return false;
      }
      return true;
    },

    _scramble(count) {
      if (!this.tiles || this.tiles.length === 0) return;

      // list semua cell
      const cells = [];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) cells.push({ x, y });
      shuffleArray(cells);

      // assign cell acak ke tiap tile
      for (let i = 0; i < this.tiles.length; i++) {
        const t = this.tiles[i];
        const cell = cells[i];
        t._cellX = cell.x;
        t._cellY = cell.y;
        t.x = this.gridX + cell.x * this.tileW;
        t.y = this.gridY + cell.y * this.tileH;
      }

      // extra random swaps biar makin "acak-acakan"
      const swaps = Math.max(0, Number(count || 0));
      for (let k = 0; k < swaps; k++) {
        const i = randInt(0, this.tiles.length - 1);
        const j = randInt(0, this.tiles.length - 1);
        if (i === j) continue;
        this._swapTilesByIndex(i, j);
      }
    },

    _buildTilesNow() {
      const N = this.size;
      const src = this.sourceBitmap;

      // Build 16 tiles using solution numbers as their "tile numbers".
      // Each tile has a number; the player rearranges them to reach target sums.
      const solution = this.numbersSolution; // 4x4

      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const tileBitmap = new Bitmap(this.tileW, this.tileH);

          // crop from the source image
          const sx = c * this.tileW;
          const sy = r * this.tileH;
          tileBitmap.blt(src, sx, sy, this.tileW, this.tileH, 0, 0);

          // draw number overlay
          const num = solution[r][c];
          this._drawNumberOverlay(tileBitmap, num);

          const spr = new Sprite(tileBitmap);
          spr._puzNumber = num; // immutable number on this tile
          spr._cellX = c; // current cell position (start as solved)
          spr._cellY = r;
          spr._homeCellX = c; // (optional) keep reference
          spr._homeCellY = r;

          spr.x = this.gridX + c * this.tileW;
          spr.y = this.gridY + r * this.tileH;

          this.tiles.push(spr);
          this.container.addChild(spr);

          // --- scramble AFTER tiles are built (fix "already solved on start") ---
          const count = Number(this._pendingScrambleCount || 40);
          this._scramble(count);

          // pastikan tidak mulai dalam kondisi solved (sangat kecil, tapi kita paksa aman)
          if (this._isSolved()) {
            this._scramble(count + 10);
          }

          this._updateSumsText();
        }
      }

      // Build sum labels (right side for rows, bottom for cols)
      this._buildSumLabels();
      const sc = SceneManager._scene;
      if (sc && sc instanceof Scene_Map) {
        this._createInstructionWindow(sc);
      }
    },

    _drawNumberOverlay(bitmap, num) {
      // ===== BORDER HITAM =====
      if (BORDER_WIDTH > 0) {
        bitmap.context.save();
        bitmap.context.strokeStyle = BORDER_COLOR;
        bitmap.context.lineWidth = BORDER_WIDTH;
        bitmap.context.strokeRect(
          BORDER_WIDTH / 2,
          BORDER_WIDTH / 2,
          bitmap.width - BORDER_WIDTH,
          bitmap.height - BORDER_WIDTH
        );
        bitmap.context.restore();
        bitmap._baseTexture.update();
      }

      // ===== ANGKA =====
      bitmap.fontFace = "GameFont";
      bitmap.fontSize = Math.floor(
        Math.min(bitmap.width, bitmap.height) * 0.32
      );
      bitmap.outlineColor = "rgba(0,0,0,0.85)";
      bitmap.outlineWidth = 4;
      bitmap.textColor = "#ffffff";

      const pad = 10;
      bitmap.drawText(
        String(num),
        pad,
        bitmap.height - bitmap.fontSize - pad,
        bitmap.width - pad * 2,
        bitmap.fontSize + 8,
        "right"
      );
    },

    _buildSumLabels() {
      const N = this.size;

      // right side (row sums)
      for (let r = 0; r < N; r++) {
        const b = new Bitmap(120, this.tileH);
        const s = new Sprite(b);
        s.x = this.gridX + N * this.tileW + 10;
        s.y = this.gridY + r * this.tileH;
        this.rowSumSprites.push(s);
        this.container.addChild(s);
      }

      // bottom side (col sums)
      for (let c = 0; c < N; c++) {
        const b = new Bitmap(this.tileW, 64);
        const s = new Sprite(b);
        s.x = this.gridX + c * this.tileW;
        s.y = this.gridY + N * this.tileH + 10;
        this.colSumSprites.push(s);
        this.container.addChild(s);
      }
    },

    _destroySprites(scene) {
      if (!this.container) return;
      if (this.container.parent)
        this.container.parent.removeChild(this.container);
    },

    // ----------------------------------------------------------------------
    // Numbers generation (solvable: all rows and cols sum to target)
    // Uses cyclic shifts of a base row [a,b,c,d] with sum=target.
    // Then shuffles rows/cols (still preserves sums).
    // ----------------------------------------------------------------------
    _generateSolvableNumbers(target) {
      const N = 4;
      const MAX_TRY = 30000;

      // Kontrol variasi & “selisih jauh”
      // Untuk target 96, rata-rata 24. Kita ambil range lebar agar angka tidak mirip-mirip.
      let minVal = 2;
      let maxVal = Math.max(40, target + 30);

      // Min selisih antar angka (dinamis). Bisa kamu perbesar kalau mau lebih ekstrem.
      let minGapBase = Math.max(6, Math.floor(target * 0.1)); // ~9 untuk 96

      const isUnique = (arr) => new Set(arr).size === arr.length;

      const minGapOk = (arr, minGap) => {
        const s = arr.slice().sort((a, b) => a - b);
        for (let i = 1; i < s.length; i++) {
          if (s[i] - s[i - 1] < minGap) return false;
        }
        return true;
      };

      const allPositive = (arr) =>
        arr.every((v) => Number.isFinite(v) && v > 0);

      // Kita coba berkali-kali, kalau sulit, relax minGap sedikit demi sedikit
      for (let attempt = 0; attempt < MAX_TRY; attempt++) {
        // Relax minGap bertahap biar tidak buntu
        const relax = Math.floor(attempt / 4000); // tiap 4000 attempt, gap turun 1
        const minGap = Math.max(2, minGapBase - relax);

        // Buat 4x4 kosong
        const a = Array.from({ length: N }, () => Array(N).fill(0));
        const used = new Set();

        // Helper random unik dengan sedikit “zona” agar angka menyebar
        const pickUnique = () => {
          // campur 4 zona nilai untuk variasi besar
          const zone = randInt(0, 3);
          let lo, hi;
          if (zone === 0) {
            lo = minVal;
            hi = Math.floor(maxVal * 0.25);
          } else if (zone === 1) {
            lo = Math.floor(maxVal * 0.2);
            hi = Math.floor(maxVal * 0.5);
          } else if (zone === 2) {
            lo = Math.floor(maxVal * 0.45);
            hi = Math.floor(maxVal * 0.75);
          } else {
            lo = Math.floor(maxVal * 0.7);
            hi = maxVal;
          }

          lo = Math.max(minVal, lo);
          hi = Math.max(lo + 2, hi);

          // coba beberapa kali cari yang unik & jauh
          for (let t = 0; t < 80; t++) {
            const v = randInt(lo, hi);
            if (used.has(v)) continue;

            // cek gap terhadap semua angka yang sudah dipilih
            let ok = true;
            for (const u of used) {
              if (Math.abs(v - u) < minGap) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;

            used.add(v);
            return v;
          }
          return null;
        };

        // 1) Isi 3x3 pertama (9 angka) unik
        let failed = false;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const v = pickUnique();
            if (v == null) {
              failed = true;
              break;
            }
            a[r][c] = v;
          }
          if (failed) break;
        }
        if (failed) continue;

        // 2) Hitung kolom ke-4 untuk 3 baris pertama: a[r][3] = target - sum(a[r][0..2])
        for (let r = 0; r < 3; r++) {
          const s = a[r][0] + a[r][1] + a[r][2];
          a[r][3] = target - s;
        }

        // 3) Hitung baris ke-4 untuk 3 kolom pertama: a[3][c] = target - sum(a[0..2][c])
        for (let c = 0; c < 3; c++) {
          const s = a[0][c] + a[1][c] + a[2][c];
          a[3][c] = target - s;
        }

        // 4) Hitung pojok terakhir a[3][3] agar baris 4 jadi target
        a[3][3] = target - (a[3][0] + a[3][1] + a[3][2]);

        // Flatten semua angka
        const flat = [];
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < 4; c++) flat.push(a[r][c]);

        // Validasi: semua positif, unik, dan gap cukup
        if (!allPositive(flat)) continue;
        if (!isUnique(flat)) continue; // <-- ini yang menghindari angka kembar
        if (!minGapOk(flat, minGap)) continue;

        // Validasi sum row & col (safety)
        let ok = true;
        for (let r = 0; r < 4; r++) {
          const rs = a[r][0] + a[r][1] + a[r][2] + a[r][3];
          if (rs !== target) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
        for (let c = 0; c < 4; c++) {
          const cs = a[0][c] + a[1][c] + a[2][c] + a[3][c];
          if (cs !== target) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;

        // Optional: acak row/col agar bentuk solusi tidak “terlalu berpola”
        const rows = shuffleArray([0, 1, 2, 3]);
        const cols = shuffleArray([0, 1, 2, 3]);
        const out = Array.from({ length: 4 }, () => Array(4).fill(0));
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            out[r][c] = a[rows[r]][cols[c]];
          }
        }

        return out;
      }

      // Fallback (kalau sangat sulit menemukan yang unik + gap besar)
      // Di fallback ini masih valid sum, tapi gap mungkin lebih kecil.
      // Kamu bisa log ini kalau mau debug.
      const fallback = [
        [8, 29, 17, target - (8 + 29 + 17)],
        [17, 42, 8, target - (17 + 42 + 8)],
        [29, 8, 42, target - (29 + 8 + 42)],
        [42, 17, 29, target - (42 + 17 + 29)],
      ];
      return fallback;
    },

    // ----------------------------------------------------------------------
    // Scramble (shuffle tile positions randomly)
    // ----------------------------------------------------------------------
    _scramble() {
      const cells = [];
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          cells.push({ x, y });
        }
      }

      shuffleArray(cells);

      for (let i = 0; i < this.tiles.length; i++) {
        const t = this.tiles[i];
        const c = cells[i];

        t._cellX = c.x;
        t._cellY = c.y;

        t.x = this.gridX + c.x * this.tileW;
        t.y = this.gridY + c.y * this.tileH;
      }
    },

    _swapTilesByIndex(i, j) {
      const a = this.tiles[i],
        b = this.tiles[j];
      const ax = a._cellX,
        ay = a._cellY;
      a._cellX = b._cellX;
      a._cellY = b._cellY;
      b._cellX = ax;
      b._cellY = ay;

      a.x = this.gridX + a._cellX * this.tileW;
      a.y = this.gridY + a._cellY * this.tileH;
      b.x = this.gridX + b._cellX * this.tileW;
      b.y = this.gridY + b._cellY * this.tileH;
    },

    // ----------------------------------------------------------------------
    // Input & update
    // ----------------------------------------------------------------------
    update() {
      if (!this.active) return;
      if (!this.container) return;
      if (!SceneManager._scene || !(SceneManager._scene instanceof Scene_Map))
        return;
      if (!this.tiles || this.tiles.length === 0) return;

      this._handleTouchDrag();
    },

    _handleTouchDrag() {
      // start drag
      if (TouchInput.isTriggered()) {
        const t = this._tileAt(TouchInput.x, TouchInput.y);
        if (t) {
          this.dragging = t;
          // bring to front
          if (t.parent) t.parent.removeChild(t);
          this.container.addChild(t);

          this.dragOffsetX = TouchInput.x - t.x;
          this.dragOffsetY = TouchInput.y - t.y;
        }
      }

      // dragging move
      if (this.dragging && TouchInput.isPressed()) {
        const t = this.dragging;
        t.x = TouchInput.x - this.dragOffsetX;
        t.y = TouchInput.y - this.dragOffsetY;
      }

      // release -> snap
      if (this.dragging && TouchInput.isReleased()) {
        const t = this.dragging;
        this.dragging = null;

        const cell = this._nearestCellForSprite(t);
        const occ = this._tileAtCell(cell.x, cell.y);

        if (occ && occ !== t) {
          // swap cells
          const tx = t._cellX,
            ty = t._cellY;
          t._cellX = occ._cellX;
          t._cellY = occ._cellY;
          occ._cellX = tx;
          occ._cellY = ty;

          occ.x = this.gridX + occ._cellX * this.tileW;
          occ.y = this.gridY + occ._cellY * this.tileH;
        } else {
          t._cellX = cell.x;
          t._cellY = cell.y;
        }

        // snap
        t.x = this.gridX + t._cellX * this.tileW;
        t.y = this.gridY + t._cellY * this.tileH;

        // 🔊 mainkan SE
        this._playSlideSE();
        this._updateSumsText();
        this._checkComplete();
      }
    },

    _tileAt(px, py) {
      // iterate in reverse (topmost first)
      for (let i = this.tiles.length - 1; i >= 0; i--) {
        const t = this.tiles[i];
        const x1 = t.x,
          y1 = t.y;
        const x2 = x1 + this.tileW,
          y2 = y1 + this.tileH;
        if (px >= x1 && px < x2 && py >= y1 && py < y2) return t;
      }
      return null;
    },

    _nearestCellForSprite(tile) {
      const relX = (tile.x - this.gridX) / this.tileW;
      const relY = (tile.y - this.gridY) / this.tileH;
      const cx = clamp(Math.round(relX), 0, 3);
      const cy = clamp(Math.round(relY), 0, 3);
      return { x: cx, y: cy };
    },

    _tileAtCell(cx, cy) {
      for (let i = 0; i < this.tiles.length; i++) {
        const t = this.tiles[i];
        if (t._cellX === cx && t._cellY === cy) return t;
      }
      return null;
    },

    // ----------------------------------------------------------------------
    // Sums + win condition
    // ----------------------------------------------------------------------
    _computeGridNumbers() {
      // grid[y][x] = number for tile currently in that cell
      const grid = [];
      for (let y = 0; y < 4; y++) {
        grid[y] = [0, 0, 0, 0];
      }
      for (const t of this.tiles) {
        grid[t._cellY][t._cellX] = t._puzNumber;
      }
      return grid;
    },

    _updateSumsText() {
      const grid = this._computeGridNumbers();
      const N = 4;

      // row sums
      for (let r = 0; r < N; r++) {
        const sum = grid[r].reduce((a, b) => a + b, 0);
        const spr = this.rowSumSprites[r];
        if (!spr) continue;
        const b = spr.bitmap;
        b.clear();
        b.fontFace = "GameFont";
        b.fontSize = 40;
        b.outlineColor = "rgba(0,0,0,0.85)";
        b.outlineWidth = 6;

        b.textColor = sum === this.targetSum ? "#a7ffb0" : "#ffffff";
        b.drawText(String(sum), 0, 0, b.width, b.height, "left");
      }

      // col sums
      for (let c = 0; c < N; c++) {
        let sum = 0;
        for (let r = 0; r < N; r++) sum += grid[r][c];
        const spr = this.colSumSprites[c];
        if (!spr) continue;
        const b = spr.bitmap;
        b.clear();
        b.fontFace = "GameFont";
        b.fontSize = 40;
        b.outlineColor = "rgba(0,0,0,0.85)";
        b.outlineWidth = 6;

        b.textColor = sum === this.targetSum ? "#a7ffb0" : "#ffffff";
        b.drawText(String(sum), 0, 0, b.width, b.height, "center");
      }
    },

    _checkComplete() {
      const grid = this._computeGridNumbers();
      const N = 4;

      // all row sums == target
      for (let r = 0; r < N; r++) {
        const s = grid[r].reduce((a, b) => a + b, 0);
        if (s !== this.targetSum) return;
      }
      // all col sums == target
      for (let c = 0; c < N; c++) {
        let s = 0;
        for (let r = 0; r < N; r++) s += grid[r][c];
        if (s !== this.targetSum) return;
      }

      // complete!
      $gameSwitches.setValue(this.successSwitchId, true);
      // Optional: auto stop puzzle
      // this.stop();
    },

    _createInstructionWindow(scene) {
      if (!INSTR_ENABLED) return;

      const N = this.size;

      // Perkiraan "kanan puzzle": grid + row sum label + margin
      const rowSumW = 120; // sama seperti bitmap row sum (lihat _buildSumLabels)
      const x = this.gridX + N * this.tileW + 10 + rowSumW + INSTR_OX;
      const y = this.gridY + INSTR_OY;

      const win = new Window_EMPuzzleInstruction(x, y, INSTR_W, INSTR_H);
      win.setTargetSum(this.targetSum);

      scene.addWindow(win);
      this.instructionWindow = win;
    },

    _destroyInstructionWindow() {
      const win = this.instructionWindow;
      if (win && win.parent) {
        win.parent.removeChild(win);
      }
      this.instructionWindow = null;
    },

    _ensureNotSolvedOnStart() {
      if (this._isSolved()) {
        this._scramble();
      }
    },
  };

  // ==========================================================================
  // Hook Scene_Map update
  // ==========================================================================
  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    EMPuzzle.update();
  };

  // ==========================================================================
  // Lock player movement (optional)
  // ==========================================================================
  const _Game_Player_canMove = Game_Player.prototype.canMove;
  Game_Player.prototype.canMove = function () {
    if (EMPuzzle.active && EMPuzzle.lockPlayer) return false;
    return _Game_Player_canMove.call(this);
  };

  // ============================================================
  // Disable Menu / ESC when Puzzle is Active
  // ============================================================
  const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
  Scene_Map.prototype.isMenuEnabled = function () {
    if (EMPuzzle.active) return false;
    return _Scene_Map_isMenuEnabled.call(this);
  };

  const _Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
  Scene_Map.prototype.updateCallMenu = function () {
    if (EMPuzzle.active) return;
    _Scene_Map_updateCallMenu.call(this);
  };

  // ==========================================================================
  // Plugin commands
  // ==========================================================================
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "PuzzleSetup") {
      // PuzzleSetup ImageName GridX GridY TileW TileH [TargetSum] [SuccessSwitch]
      const imageName = args[0];
      const gridX = Number(args[1]);
      const gridY = Number(args[2]);
      const tileW = Number(args[3]);
      const tileH = Number(args[4]);
      const target = args.length >= 6 ? Number(args[5]) : 96;
      const sw = args.length >= 7 ? Number(args[6]) : 1;
      EMPuzzle.setup(imageName, gridX, gridY, tileW, tileH, target, sw);
    }

    if (command === "PuzzleStart") {
      // PuzzleStart [ScrambleCount]
      const count = args.length >= 1 ? Number(args[0]) : 40;
      EMPuzzle.start(count);
    }

    if (command === "PuzzleStop") {
      EMPuzzle.stop();
    }

    if (command === "PuzzleLockPlayer") {
      // PuzzleLockPlayer 0/1
      EMPuzzle.setLockPlayer(Number(args[0] || 0));
    }

    if (command === "PuzzleSetTarget") {
      // PuzzleSetTarget Number
      EMPuzzle.setTarget(Number(args[0] || 0));
    }
  };

  function Window_EMPuzzleInstruction(x, y, w, h) {
    this.initialize.apply(this, arguments);
  }
  Window_EMPuzzleInstruction.prototype = Object.create(Window_Base.prototype);
  Window_EMPuzzleInstruction.prototype.constructor = Window_EMPuzzleInstruction;

  Window_EMPuzzleInstruction.prototype.initialize = function (x, y, w, h) {
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this._targetSum = 0;
    this.refresh();
  };

  Window_EMPuzzleInstruction.prototype.setTargetSum = function (value) {
    value = Number(value || 0);
    if (this._targetSum !== value) {
      this._targetSum = value;
      this.refresh();
    }
  };

  Window_EMPuzzleInstruction.prototype.refresh = function () {
    this.contents.clear();

    // font
    this.contents.fontFace = "GameFont";
    this.contents.fontSize = INSTR_FS;

    const lineH = this.lineHeight();
    const w = this.contentsWidth();

    // Layout sederhana seperti contoh gambar
    const y0 = 10;

    this.changeTextColor(this.normalColor());
    this.drawText("Instruction:", 0, y0, w, "center");

    this.drawText("Place the Puzzle", 0, y0 + lineH * 1.4, w, "center");
    this.drawText("that match the sum", 0, y0 + lineH * 2.4, w, "center");
    this.drawText("of", 0, y0 + lineH * 3.4, w, "center");

    // TargetSum warna merah
    this.changeTextColor(this.textColor(10)); // 10 biasanya merah di default windowskin
    this.drawText(String(this._targetSum), 0, y0 + lineH * 4.4, w, "center");
    this.resetTextColor();
  };
})();
