/*:
 * @plugindesc (v1.61 Adv) ABCX Puzzle Advanced (Algebra RN) + Back Button (script full) - RN shows 1 plain integer and 7 algebra expressions (derivative/definite integral/trig/root/log/limit) while keeping integer values for solving; Z1-Z3 are integers. Use ADV commands to avoid conflict. @author You
 *
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 *  EM_ABCX_Puzzle_Full.js
 * ============================================================================
 * Plugin Commands:
 *   ABCXRnAdvSetup <SlotX> <SlotY> <BackEnable>
 *   ABCXRnAdvStart [SuccessSwitch]
 *   ABCXRnAdvStop
 *
 * BackEnable: true/false
 * ============================================================================
 *
 * @param SlotW
 * @type number
 * @default 160
 *
 * @param SlotH
 * @type number
 * @default 90
 *
 * @param PoleW
 * @type number
 * @default 14
 *
 * @param PoleColor
 * @default #30ff00
 *
 * @param SlotBgColor
 * @default #000000
 *
 * @param SlotBgAlpha
 * @type number
 * @decimals 2
 * @default 0.90
 *
 * @param SlotStrokeColor
 * @default #808080
 *
 * @param SlotStrokeW
 * @type number
 * @default 4
 *
 * @param RNPicture
 * @type file
 * @dir img/pictures
 * @default rn_blue
 *
 * @param RNW
 * @type number
 * @default 64
 *
 * @param RNH
 * @type number
 * @default 64
 *
 * @param RNPoolX
 * @type number
 * @default 90
 *
 * @param RNPoolY
 * @type number
 * @default 520
 *
 * @param RNCols
 * @type number
 * @default 6
 *
 * @param RNGAPX
 * @type number
 * @default 16
 *
 * @param RNGAPY
 * @type number
 * @default 16
 *
 * @param OpPicture
 * @type file
 * @dir img/pictures
 * @default op_cyan
 *
 * @param OpW
 * @type number
 * @default 64
 *
 * @param OpH
 * @type number
 * @default 64
 *
 * @param OpPoolX
 * @type number
 * @default 580
 *
 * @param OpPoolY
 * @type number
 * @default 540
 *
 * @param OpGapX
 * @type number
 * @default 18
 *
 * @param ZWinX
 * @type number
 * @default 140
 *
 * @param ZWinY
 * @type number
 * @default 330
 *
 * @param ZWinW
 * @type number
 * @default 160
 *
 * @param ZWinH
 * @type number
 * @default 120
 *
 * @param ZWinGap
 * @type number
 * @default 90
 *
 * @param ChecklistPicture
 * @type file
 * @dir img/pictures
 * @default check
 *
 * @param ChecklistOffsetY
 * @type number
 * @default -36
 *
 * @param InstrEnable
 * @type boolean
 * @default true
 *
 * @param InstrW
 * @type number
 * @default 360
 *
 * @param InstrH
 * @type number
 * @default 220
 *
 * @param InstrOffsetX
 * @type number
 * @default 20
 *
 * @param InstrOffsetY
 * @type number
 * @default 0
 *
 * @param InstrText
 * @type multiline_string
 * @default Drag numbers to A/B/C.\nDrag operators to X.\n\nMatch targets:\nZ1: {Z1}\nZ2: {Z2}\nZ3: {Z3}
 *
 * @param FontSizeRN
 * @type number
 * @default 24
 *
 * @param FontSizeOp
 * @type number
 * @default 30
 *
 * @param FontSizeZ
 * @type number
 * @default 38
 *
 * @param RNColor
 * @default #ffffff
 *
 * @param OpColor
 * @default #ff2020
 *
 * @param ZCorrectColor
 * @default #ff2020
 *
 * @param ZNormalColor
 * @default #ffffff
 *
 * @param RN_Min
 * @type number
 * @default 1
 *
 * @param RN_Max
 * @type number
 * @default 99
 *
 * @param RNUnique
 * @type boolean
 * @default true
 *
 * @param MaxGenTry
 * @type number
 * @default 20000
 *
 * @param SlideSE
 * @type file
 * @dir audio/se
 * @default Cursor2
 *
 * @param SlideSEVolume
 * @type number
 * @default 80
 *
 * @param SlideSEPitch
 * @type number
 * @default 100
 *
 * @param SlideSEPan
 * @type number
 * @default 0
 *
 * @param CorrectSE
 * @type file
 * @dir audio/se
 * @default Item3
 *
 * @param CorrectSEVolume
 * @type number
 * @default 90
 *
 * @param CorrectSEPitch
 * @type number
 * @default 100
 *
 * @param CorrectSEPan
 * @type number
 * @default 0
 *
 * @param LockPlayer
 * @type boolean
 * @default true
 *
 * @param DisableMenu
 * @type boolean
 * @default true
 *
 * @param BackOffsetX
 * @type number
 * @default 0
 *
 * @param BackOffsetY
 * @type number
 * @default 0
 *
 * @param BackW
 * @type number
 * @default 240
 *
 * @param BackH
 * @type number
 * @default 56
 */

(function () {
  "use strict";

  const PLUGIN_NAME = "EM_ABCX_Puzzle_Full";
  const P = PluginManager.parameters(PLUGIN_NAME);

  // --------------------------
  // Params
  // --------------------------
  const SLOT_W = Number(P["SlotW"] || 160);
  const SLOT_H = Number(P["SlotH"] || 90);

  const POLE_W = Number(P["PoleW"] || 14);
  const POLE_COLOR = String(P["PoleColor"] || "#30ff00");

  const SLOT_BG_COLOR = String(P["SlotBgColor"] || "#000000");
  const SLOT_BG_ALPHA = Number(P["SlotBgAlpha"] || 0.9);

  const SLOT_STROKE_COLOR = String(P["SlotStrokeColor"] || "#808080");
  const SLOT_STROKE_W = Number(P["SlotStrokeW"] || 4);

  // RN pool
  const RN_PIC = String(P["RNPicture"] || "rn_blue");
  const RN_W = Number(P["RNW"] || 64);
  const RN_H = Number(P["RNH"] || 64);

  const RN_POOL_X = Number(P["RNPoolX"] || 90);
  const RN_POOL_Y = Number(P["RNPoolY"] || 520);
  const RN_COLS = Number(P["RNCols"] || 6);
  const RN_GAPX = Number(P["RNGAPX"] || 16);
  const RN_GAPY = Number(P["RNGAPY"] || 16);

  // ==========================
  // Advanced RN settings
  // - RN cards count is 8, but pool total width stays comparable to 12-card layout
  // ==========================
  const RN_COUNT = 8;
  const RN_POOL_TOTAL_W = RN_COLS * RN_W + (RN_COLS - 1) * RN_GAPX;
  const RN_COLS_EFF = 4; // 8 cards => 4 cols x 2 rows
  const RN_W_EFF = Math.floor(
    (RN_POOL_TOTAL_W - (RN_COLS_EFF - 1) * RN_GAPX) / RN_COLS_EFF,
  );
  const RN_H_EFF = RN_H; // you can raise this if you want taller cards

  // Operator pool (sources)
  const OP_PIC = String(P["OpPicture"] || "op_cyan");
  const OP_W = Number(P["OpW"] || 64);
  const OP_H = Number(P["OpH"] || 64);
  const OP_POOL_X = Number(P["OpPoolX"] || 580);
  const OP_POOL_Y = Number(P["OpPoolY"] || 540);
  const OP_GAPX = Number(P["OpGapX"] || 18);

  // Operator stock (hardcode x2)
  const OP_STOCK = 2;

  // Z windows
  const ZWIN_X = Number(P["ZWinX"] || 140);
  const ZWIN_Y = Number(P["ZWinY"] || 330);
  const ZWIN_W = Number(P["ZWinW"] || 160);
  const ZWIN_H = Number(P["ZWinH"] || 120);
  const ZWIN_GAP = Number(P["ZWinGap"] || 90);

  const CHECK_PIC = String(P["ChecklistPicture"] || "check");
  const CHECK_OY = Number(P["ChecklistOffsetY"] || -36);

  // Instruction window (right of Z3)
  const INSTR_ENABLE = String(P["InstrEnable"] || "true") === "true";
  const INSTR_W = Number(P["InstrW"] || 360);
  const INSTR_H = Number(P["InstrH"] || 220);
  const INSTR_OX = Number(P["InstrOffsetX"] || 20);
  const INSTR_OY = Number(P["InstrOffsetY"] || 0);
  const INSTR_TEXT = String(
    P["InstrText"] ||
      "Drag numbers to A/B/C.\nDrag operators to X.\n\nEach result must match:\n" +
        "\\c[" +
        6 +
        "]" +
        "Z1, Z2, Z3",
  );

  // Fonts/colors
  const FONT_RN = Number(P["FontSizeRN"] || 24);
  const FONT_OP = Number(P["FontSizeOp"] || 30);
  const FONT_Z = Number(P["FontSizeZ"] || 38);

  const RN_COLOR = String(P["RNColor"] || "#ffffff");
  const OP_COLOR = String(P["OpColor"] || "#ff2020");
  const Z_OK_COLOR = String(P["ZCorrectColor"] || "#ff2020");
  const Z_N_COLOR = String(P["ZNormalColor"] || "#ffffff");

  // Random number generation
  const RN_MIN = Number(P["RN_Min"] || 1);
  const RN_MAX = Number(P["RN_Max"] || 99);
  const RN_UNIQUE = String(P["RNUnique"] || "true") === "true";

  const MAX_GEN_TRY = Number(P["MaxGenTry"] || 20000);

  // Sounds
  const SLIDE_SE = {
    name: String(P["SlideSE"] || "Cursor2"),
    volume: Number(P["SlideSEVolume"] || 80),
    pitch: Number(P["SlideSEPitch"] || 100),
    pan: Number(P["SlideSEPan"] || 0),
  };
  const CORRECT_SE = {
    name: String(P["CorrectSE"] || "Item3"),
    volume: Number(P["CorrectSEVolume"] || 90),
    pitch: Number(P["CorrectSEPitch"] || 100),
    pan: Number(P["CorrectSEPan"] || 0),
  };

  // Hover SE (hardcode as requested)
  const HOVER_SE = { name: "Key", volume: 100, pitch: 110, pan: 0 };

  // Hover visuals
  const HOVER_SCALE = 1.08;
  const HOVER_TONE = [40, 40, 40, 0];
  const HOVER_EASE = 0.18;

  const LOCK_PLAYER = String(P["LockPlayer"] || "true") === "true";
  const DISABLE_MENU = String(P["DisableMenu"] || "true") === "true";

  // Z cap: never allow |Z| > 100
  function getMaxZAbs() {
    // contoh: switch 10 = hard mode
    if ($gameSwitches && $gameSwitches.value(10)) {
      return 300;
    }
    // switch 11 = very hard
    if ($gameSwitches && $gameSwitches.value(11)) {
      return 600;
    }
    // default (normal)
    return 100;
  }

  // Back button offsets still via parameters (enable via Plugin Command)
  const BACK_OX = Number(P["BackOffsetX"] || 0);
  const BACK_OY = Number(P["BackOffsetY"] || 0);

  // Back button size + style (script drawn)
  const BACK_W = Number(P["BackW"] || 240);
  const BACK_H = Number(P["BackH"] || 56);

  const ZROLL_ENABLE = String(P["ZRollEnable"] || "true") === "true";
  const ZROLL_FRAMES = Number(P["ZRollFrames"] || 60); // total frame animasi
  const ZROLL_INTERVAL = Number(P["ZRollInterval"] || 2); // update angka tiap N frame
  const ZROLL_MIN = Number(P["ZRollMin"] || -99);
  const ZROLL_MAX = Number(P["ZRollMax"] || 99);

  const ZROLL_TICK_SE = {
    name: String(P["ZRollTickSE"] || "Cursor1"),
    volume: Number(P["ZRollTickSEVol"] || 55),
    pitch: Number(P["ZRollTickSEPitch"] || 120),
    pan: Number(P["ZRollTickSEPan"] || 0),
  };
  const ZROLL_END_SE = {
    name: String(P["ZRollEndSE"] || "Item1"),
    volume: Number(P["ZRollEndSEVol"] || 80),
    pitch: Number(P["ZRollEndSEPitch"] || 100),
    pan: Number(P["ZRollEndSEPan"] || 0),
  };

  const ZROLL_END_COMMON_EVENT_ID = 24;

  // --------------------------
  // Helpers
  // --------------------------
  function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function playSe(se) {
    if (se && se.name) AudioManager.playSe(se);
  }

  const OPS = ["+", "-", "*", "/"];
  function opDisplay(op) {
    if (op === "*") return "×";
    if (op === "/") return "÷";
    return op;
  }
  function applyOp(a, op, b) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
    }
    return NaN;
  }
  function evalABC(a, op1, b, op2, c) {
    const p1 = op1 === "*" || op1 === "/";
    const p2 = op2 === "*" || op2 === "/";
    if (p1 && !p2) {
      const t = applyOp(a, op1, b);
      return applyOp(t, op2, c);
    }
    if (!p1 && p2) {
      const t = applyOp(b, op2, c);
      return applyOp(a, op1, t);
    }
    const t = applyOp(a, op1, b);
    return applyOp(t, op2, c);
  }
  function isNiceInt(x) {
    return Number.isFinite(x) && Math.abs(x - Math.round(x)) < 1e-9;
  }

  function drawBlackBorder(bitmap, thickness) {
    thickness = Math.max(1, Number(thickness || 2));
    const w = bitmap.width;
    const h = bitmap.height;
    const ctx = bitmap.context;
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = thickness;
    const inset = thickness / 2;
    ctx.strokeRect(inset, inset, w - thickness, h - thickness);
    ctx.restore();
    bitmap._baseTexture.update();
  }

  function drawOpStockCaption(bmp, stock) {
    bmp.fontFace = "GameFont";
    bmp.fontSize = 18;
    bmp.textColor = "#ffffff";
    bmp.outlineColor = "rgba(0,0,0,0.9)";
    bmp.outlineWidth = 6;
    const text = `(x${stock})`;
    bmp.drawText(text, 0, bmp.height - 24, bmp.width - 6, 24, "right");
    bmp._baseTexture.update();
  }

  function buildInstrText(template, zTargets) {
    const z1 = zTargets && zTargets[0] != null ? zTargets[0] : "?";
    const z2 = zTargets && zTargets[1] != null ? zTargets[1] : "?";
    const z3 = zTargets && zTargets[2] != null ? zTargets[2] : "?";
    return String(template || "")
      .replace(/\{Z1\}/g, String(z1))
      .replace(/\{Z2\}/g, String(z2))
      .replace(/\{Z3\}/g, String(z3));
  }

  function isPointerOverRect(x, y, w, h) {
    const px = TouchInput.x,
      py = TouchInput.y;
    return px >= x && px < x + w && py >= y && py < y + h;
  }

  function clampInt(x) {
    return Math.round(x);
  }

  function makeOneSolutionFromPool(poolNums) {
    // mencari 1 solusi (a,b,c unik, op1/op2 bebas) dengan hasil integer dan |Z|<=limit
    const limit = getMaxZAbs();

    for (let tries = 0; tries < 30000; tries++) {
      const a = poolNums[randInt(0, poolNums.length - 1)];
      const b = poolNums[randInt(0, poolNums.length - 1)];
      const c = poolNums[randInt(0, poolNums.length - 1)];
      if (a === b || a === c || b === c) continue;

      const op1 = OPS[randInt(0, 3)];
      const op2 = OPS[randInt(0, 3)];

      const r = evalABC(a, op1, b, op2, c);
      if (!isNiceInt(r)) continue;

      const z = clampInt(r);
      if (Math.abs(z) > limit) continue;

      return { a, b, c, op1, op2, z };
    }
    return null;
  }

  function buildSolvablePack() {
    // 1) buat pool kandidat angka unik supaya variasi bagus
    const candidate = [];
    const used = new Set();
    let guard = 0;

    while (candidate.length < 60 && guard < 99999) {
      guard++;
      const v = randInt(RN_MIN, RN_MAX);
      if (RN_UNIQUE) {
        if (used.has(v)) continue;
        used.add(v);
      }
      candidate.push(v);
    }
    if (candidate.length < 12) {
      // fallback minimal
      for (let i = 0; i < 50; i++) candidate.push(randInt(RN_MIN, RN_MAX));
    }

    // 2) cari 3 solusi Z yang berbeda
    const sols = [];
    const zSet = new Set();

    for (let i = 0; i < 3; i++) {
      let sol = null;
      for (let t = 0; t < 40000; t++) {
        sol = makeOneSolutionFromPool(candidate);
        if (!sol) continue;
        if (zSet.has(sol.z)) continue;
        zSet.add(sol.z);
        sols.push(sol);
        break;
      }
      if (!sol) return null; // gagal cari 3 solusi
    }

    // 3) RN1..RN12 = semua angka yang dipakai solusi + filler
    const rn = [];
    const rnSet = new Set();
    const pushUnique = (x) => {
      if (RN_UNIQUE) {
        if (rnSet.has(x)) return;
        rnSet.add(x);
      }
      if (rn.length < 12) rn.push(x);
    };

    for (const s of sols) {
      pushUnique(s.a);
      pushUnique(s.b);
      pushUnique(s.c);
    }

    let fillGuard = 0;
    while (rn.length < 12 && fillGuard < 99999) {
      fillGuard++;
      const v = randInt(RN_MIN, RN_MAX);
      pushUnique(v);
    }

    // kalau RN_UNIQUE true tapi kebetulan kurang (range terlalu sempit), isi apa adanya
    while (rn.length < 12) {
      rn.push(randInt(RN_MIN, RN_MAX));
    }

    shuffle(rn);

    return {
      rnNums: rn,
      zTargets: sols.map((s) => s.z),
      solutions: sols, // optional: simpan untuk hint/debug
    };
  }

  // ============================================================================
  // Advanced RN: Algebra expression generator (keeps integer values)
  // ============================================================================
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a || 1;
  }

  // Exactly one RN card should display a plain integer; the rest must display algebra.
  function makePlainExprForValue(v) {
    return { text: String(v), value: v, kind: "plain" };
  }

  function makeExprForValue(v) {
    // Return: { text: string, value: number }
    // Keep expression short enough to fit RN card.
    // NOTE: This function MUST return an algebra expression (never a bare integer).
    const types = ["deriv", "integral", "trig", "rootloglimit"];
    const type = types[randInt(0, types.length - 1)];

    // -----------------------------
    // DERIVATIVE
    // -----------------------------
    if (type === "deriv") {
      // f(x)=x^n => f'(k)= n*k^(n-1)
      for (let t = 0; t < 2500; t++) {
        const n = randInt(2, 4);
        const k = randInt(1, 7);
        const val = n * Math.pow(k, n - 1);
        if (Math.round(val) === v) {
          return { text: `f'(${k}) = d/dx(x^${n})`, value: v, kind: "algebra" };
        }
      }
    }

    // -----------------------------
    // DEFINITE INTEGRAL (requested format)
    // Format: "∫(0,3) (soal) dx"
    // Use linear function c*x so result is integer.
    // ∫(a,b) c*x dx = (c/2) * (b^2 - a^2)
    // -----------------------------
    if (type === "integral") {
      for (let t = 0; t < 3500; t++) {
        const a = randInt(0, 3);
        const b = randInt(a + 1, a + 4);
        const delta = b * b - a * a;
        if (delta === 0) continue;

        // We need c such that (c/2)*delta = v => c = 2v/delta
        const num = 2 * v;
        if (num % delta !== 0) continue;
        const c = num / delta;
        if (!Number.isFinite(c) || Math.abs(c) > 24) continue;

        // Keep it readable: avoid c=0 unless v=0
        if (c === 0 && v !== 0) continue;

        return { text: `∫(${a},${b}) (${c}x) dx`, value: v, kind: "algebra" };
      }
    }

    // -----------------------------
    // TRIGONOMETRY
    // Use only identities that are rational/integer after scaling.
    // -----------------------------
    if (type === "trig") {
      const base = [
        { expr: "sin(0°)", val: 0 },
        { expr: "tan(0°)", val: 0 },
        { expr: "cos(0°)", val: 1 },
        { expr: "sin(90°)", val: 1 },
        { expr: "tan(45°)", val: 1 },
        { expr: "2·sin(30°)", val: 1 },
        { expr: "2·cos(60°)", val: 1 },
      ];
      for (let t = 0; t < 2500; t++) {
        const b = base[randInt(0, base.length - 1)];
        if (b.val === 0) {
          if (v === 0) return { text: b.expr, value: 0, kind: "algebra" };
          continue;
        }
        const k = v / b.val;
        if (!Number.isFinite(k) || Math.abs(k - Math.round(k)) > 1e-9) continue;
        const kk = Math.round(k);
        if (Math.abs(kk) > 40) continue;
        if (kk === 1) return { text: b.expr, value: v, kind: "algebra" };
        return { text: `${kk}·(${b.expr})`, value: v, kind: "algebra" };
      }
    }

    // -----------------------------
    // ROOT / LOG / LIMIT
    // ROOT must contain operations inside (not just squared number)
    // -----------------------------
    for (let t = 0; t < 5000; t++) {
      const pick = randInt(0, 3);

      if (pick === 0) {
        // ROOT with + / - / × inside. Ensure perfect square.
        // Choose r so sqrt = r (= |v|), then build inside = r^2 = a^2 + b^2, or a^2*b^2, or a^2 - b^2.
        const r = Math.abs(v);
        if (r === 0) {
          // keep non-trivial anyway
          return { text: `√(0 + 0)`, value: 0, kind: "algebra" };
        }

        // Try represent r^2 as a^2 + b^2
        for (let u = 0; u < 200; u++) {
          const a = randInt(1, r);
          const a2 = a * a;
          const rest = r * r - a2;
          if (rest <= 0) continue;
          const b = Math.round(Math.sqrt(rest));
          if (b > 0 && b * b === rest) {
            const inside = `${a2} + ${b * b}`;
            const sign = v < 0 ? "-" : "";
            return { text: `${sign}√(${inside})`, value: v, kind: "algebra" };
          }
        }

        // Or represent r^2 as (a*b)^2 => a^2 × b^2
        for (let a = 1; a <= 12; a++) {
          if (r % a !== 0) continue;
          const b = r / a;
          if (b <= 0 || b > 30) continue;
          const inside = `${a * a} × ${b * b}`;
          const sign = v < 0 ? "-" : "";
          return { text: `${sign}√(${inside})`, value: v, kind: "algebra" };
        }

        // Or represent r^2 as a^2 - b^2 (a>r)
        for (let u = 0; u < 200; u++) {
          const a = randInt(r + 1, r + 20);
          const a2 = a * a;
          const b2 = a2 - r * r;
          const b = Math.round(Math.sqrt(b2));
          if (b > 0 && b * b === b2) {
            const inside = `${a2} - ${b * b}`;
            const sign = v < 0 ? "-" : "";
            return { text: `${sign}√(${inside})`, value: v, kind: "algebra" };
          }
        }
      }

      if (pick === 1) {
        // log_a(a^n)=n (keep n small)
        const a = randInt(2, 5);
        const n = v;
        if (Math.abs(n) <= 8)
          return { text: `log_${a}(${a}^${n})`, value: n, kind: "algebra" };
      }

      if (pick === 2) {
        // lim_{x→0} sin(kx)/x = k
        const k = v;
        if (Math.abs(k) <= 25)
          return { text: `lim₍x→0₎ sin(${k}x)/x`, value: k, kind: "algebra" };
      }

      if (pick === 3) {
        // forced algebra fallback form (always integer): cos(0°)×v
        return { text: `cos(0°)×${v}`, value: v, kind: "algebra" };
      }
    }

    // Last resort (still algebra)
    return { text: `cos(0°)×${v}`, value: v, kind: "algebra" };
  }

  function buildSolvablePackAdv() {
    // Build a solvable pack where RN cards are algebra expressions (8 items),
    // but solver uses integer values. Z1-Z3 are integers.
    // 1) candidate pool
    const candidate = [];
    const used = new Set();
    let guard = 0;

    while (candidate.length < 80 && guard < 99999) {
      guard++;
      const v = randInt(RN_MIN, RN_MAX);
      if (RN_UNIQUE) {
        if (used.has(v)) continue;
        used.add(v);
      }
      candidate.push(v);
    }
    if (candidate.length < 12) {
      for (let i = 0; i < 60; i++) candidate.push(randInt(RN_MIN, RN_MAX));
    }

    // 2) find 3 distinct solutions
    const sols = [];
    const zSet = new Set();
    for (let i = 0; i < 3; i++) {
      let sol = null;
      for (let t = 0; t < MAX_GEN_TRY; t++) {
        sol = makeOneSolutionFromPool(candidate);
        if (!sol) continue;
        if (zSet.has(sol.z)) continue;
        zSet.add(sol.z);
        sols.push(sol);
        break;
      }
      if (!sol) return null;
    }

    // 3) numbers needed by the 3 solutions
    const need = [];
    const needSet = new Set();
    const pushNeed = (x) => {
      if (RN_UNIQUE) {
        if (needSet.has(x)) return;
        needSet.add(x);
      }
      need.push(x);
    };
    for (const s of sols) {
      pushNeed(s.a);
      pushNeed(s.b);
      pushNeed(s.c);
    }

    // 4) build final RN numbers (8)
    const rnNums = [];
    const rnSet = new Set();
    const pushRN = (x) => {
      if (RN_UNIQUE) {
        if (rnSet.has(x)) return;
        rnSet.add(x);
      }
      if (rnNums.length < RN_COUNT) rnNums.push(x);
    };

    // put required first
    for (const x of need) pushRN(x);

    // fill remainder
    let fillGuard = 0;
    while (rnNums.length < RN_COUNT && fillGuard < 99999) {
      fillGuard++;
      pushRN(randInt(RN_MIN, RN_MAX));
    }
    while (rnNums.length < RN_COUNT) rnNums.push(randInt(RN_MIN, RN_MAX));

    shuffle(rnNums);

    // 5) turn into algebra expression items
    // Exactly ONE plain integer display; the rest algebra.
    const plainIndex = randInt(0, RN_COUNT - 1);
    const rnItems = rnNums.map((v, i) => {
      if (i === plainIndex) return makePlainExprForValue(v);
      return makeExprForValue(v);
    });

    return {
      rnItems,
      rnNums,
      zTargets: sols.map((s) => s.z),
      solutions: sols,
    };
  }

  // Script-drawn Back button bitmap (maroon + icon X + BACK + border)
  function makeBackBitmap(w, h) {
    const bmp = new Bitmap(w, h);
    const ctx = bmp.context;

    // background
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#7a1d1d"; // maroon
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // border
    drawBlackBorder(bmp, 4);

    // icon box + X (left side)
    const pad = 14;
    const box = Math.floor(h * 0.55);
    const bx = pad;
    const by = Math.floor((h - box) / 2);

    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, box, box);

    // X lines
    ctx.beginPath();
    ctx.moveTo(bx + 6, by + 6);
    ctx.lineTo(bx + box - 6, by + box - 6);
    ctx.moveTo(bx + box - 6, by + 6);
    ctx.lineTo(bx + 6, by + box - 6);
    ctx.stroke();
    ctx.restore();

    bmp._baseTexture.update();

    // text "BACK"
    bmp.fontFace = "GameFont";
    bmp.fontSize = Math.max(22, Math.floor(h * 0.6));
    bmp.textColor = "#ffffff";
    bmp.outlineColor = "rgba(0,0,0,0.65)";
    bmp.outlineWidth = 6;

    const tx = bx + box + 14;
    bmp.drawText("BACK", tx, 0, w - tx - 10, h, "left");
    bmp._baseTexture.update();

    return bmp;
  }

  // --------------------------
  // Windows
  // --------------------------
  function Window_Z(i, x, y, w, h) {
    this.initialize.apply(this, arguments);
  }
  Window_Z.prototype = Object.create(Window_Base.prototype);
  Window_Z.prototype.constructor = Window_Z;

  Window_Z.prototype.initialize = function (i, x, y, w, h) {
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this._i = i;
    this._target = 0;
    this._correct = false;
    this._check = null;
    this.refresh();
  };
  Window_Z.prototype.setTarget = function (v) {
    v = Number(v || 0);
    if (this._target !== v) {
      this._target = v;
      this.refresh();
    }
  };
  Window_Z.prototype.setCorrect = function (v) {
    const nv = !!v;
    if (this._correct !== nv) {
      this._correct = nv;
      this.refresh();
      this._ensureCheck();
      this._check.visible = this._correct;
    }
  };
  Window_Z.prototype._ensureCheck = function () {
    if (this._check) return;
    this._check = new Sprite(ImageManager.loadPicture(CHECK_PIC));
    this.addChild(this._check);
    this._check.anchor.x = 0.5;
    this._check.anchor.y = 1.0;
    this._check.x = this.width / 2;
    this._check.y = 0 + CHECK_OY;
    this._check.visible = false;
  };
  Window_Z.prototype.refresh = function () {
    this.contents.clear();
    this.contents.fontFace = "GameFont";
    const w = this.contentsWidth();
    const h = this.contentsHeight();

    this.contents.fontSize = Math.max(18, Math.floor(FONT_Z * 0.45));
    this.changeTextColor(this.normalColor());
    this.drawText("Z" + (this._i + 1), 0, 4, w, "center");

    this.contents.fontSize = FONT_Z;
    this.changeTextColor(this._correct ? Z_OK_COLOR : Z_N_COLOR);
    this.drawText(
      String(this._target),
      0,
      Math.floor(h / 2) - Math.floor(FONT_Z / 2),
      w,
      "center",
    );
    this.resetTextColor();
  };

  function Window_Instruction(x, y, w, h) {
    this.initialize.apply(this, arguments);
  }
  Window_Instruction.prototype = Object.create(Window_Base.prototype);
  Window_Instruction.prototype.constructor = Window_Instruction;

  Window_Instruction.prototype.initialize = function (x, y, w, h) {
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this._text = "";
    this.refresh();
  };
  Window_Instruction.prototype.setText = function (text) {
    text = String(text || "");
    if (this._text !== text) {
      this._text = text;
      this.refresh();
    }
  };
  Window_Instruction.prototype.refresh = function () {
    this.contents.clear();
    this.contents.fontFace = "GameFont";
    this.contents.fontSize = 20;

    const lines = this._text.split("\n");
    let y = 0;
    for (let i = 0; i < lines.length; i++) {
      this.drawTextEx(lines[i], 0, y);
      y += this.lineHeight();
    }
  };

  // --------------------------
  // Main Manager
  // --------------------------
  const M = {
    _internalSolutions: null,
    inputLocked: false,

    zRollActive: false,
    zRollTimer: 0,
    zRollSeed: [0, 0, 0],

    active: false,
    successSwitchId: 1,
    slotX: 0,
    slotY: 0,

    // Back enable (from plugin command)
    backEnabled: false,
    backBtn: null,

    container: null,
    slots: [], // 5 slots single
    poles: [],
    slotBg: [],

    rnCards: [],
    opSources: [],
    opTokens: [],
    allCards: [],

    dragging: null,
    dragOX: 0,
    dragOY: 0,

    zWins: [],
    zSolved: [false, false, false],
    zTargets: [0, 0, 0],

    instrWin: null,

    setup(x, y) {
      this.slotX = Number(x || 0);
      this.slotY = Number(y || 0);
    },

    start(swId) {
      if (this.active) return;
      const sc = SceneManager._scene;
      if (!sc || !(sc instanceof Scene_Map)) return;

      this.active = true;
      this.successSwitchId = Number(swId || 1);

      this._createContainer(sc);
      this._buildSlots();

      this._buildPoolsAndTargets();
      this._buildZWindows(sc);
      this._startZRoll();
      this._buildInstructionWindowRightOfZ3(sc);

      // create back button (if enabled from setup command)
      this._createBackButton();

      this._shuffleRnInPool();
      this._layoutOpSources();
      this._refreshAllCardsList();

      this._refreshCheck(true);
    },

    stop() {
      if (!this.active) return;

      // destroy op tokens
      for (const t of this.opTokens.slice()) {
        this._destroyOpToken(t, false);
      }
      this.opTokens = [];

      // remove windows
      for (const w of this.zWins) {
        if (w && w.parent) w.parent.removeChild(w);
      }
      this.zWins = [];

      if (this.instrWin) {
        if (this.instrWin.parent)
          this.instrWin.parent.removeChild(this.instrWin);
        this.instrWin = null;
      }

      // remove back btn
      if (this.backBtn) {
        if (this.backBtn.parent) this.backBtn.parent.removeChild(this.backBtn);
        this.backBtn = null;
      }
      this.backEnabled = false;

      // container
      if (this.container && this.container.parent)
        this.container.parent.removeChild(this.container);

      // reset
      this.active = false;
      this.container = null;
      this.slots = [];
      this.poles = [];
      this.slotBg = [];
      this.rnCards = [];
      this.opSources = [];
      this.opTokens = [];
      this.allCards = [];
      this.dragging = null;
      this.zSolved = [false, false, false];
      this.zTargets = [0, 0, 0];
    },

    update() {
      if (!this.active) return;

      this._updateZRoll(); // <-- penting
      this._updateHoverEffects();

      if (this.inputLocked) return; // <-- kunci input drag dulu

      this._handleDrag();
    },

    _createContainer(scene) {
      this.container = new Sprite();
      this.container.z = 9999;
      if (scene._spriteset && scene._spriteset._baseSprite) {
        scene._spriteset._baseSprite.addChild(this.container);
      } else scene.addChild(this.container);
    },

    _buildSlots() {
      this.slots = [];
      this.poles = [];
      this.slotBg = [];

      const addPole = (x, y) => {
        const bmp = new Bitmap(POLE_W, SLOT_H);
        bmp.context.save();
        bmp.context.fillStyle = POLE_COLOR;
        bmp.context.fillRect(0, 0, POLE_W, SLOT_H);
        bmp.context.restore();
        bmp._baseTexture.update();
        const spr = new Sprite(bmp);
        spr.x = x;
        spr.y = y;
        this.container.addChild(spr);
        this.poles.push(spr);
        return POLE_W;
      };

      const makeSlot = (index, kind, x, y) => {
        const rect = { index, kind, x, y, w: SLOT_W, h: SLOT_H };
        this.slots.push(rect);

        const bmp = new Bitmap(SLOT_W, SLOT_H);

        // bg
        bmp.context.save();
        bmp.context.globalAlpha = SLOT_BG_ALPHA;
        bmp.context.fillStyle = SLOT_BG_COLOR;
        bmp.context.fillRect(0, 0, SLOT_W, SLOT_H);
        bmp.context.restore();

        // stroke
        bmp.context.save();
        bmp.context.globalAlpha = 1.0;
        bmp.context.strokeStyle = SLOT_STROKE_COLOR;
        bmp.context.lineWidth = SLOT_STROKE_W;
        const inset = SLOT_STROKE_W / 2;
        bmp.context.strokeRect(
          inset,
          inset,
          SLOT_W - SLOT_STROKE_W,
          SLOT_H - SLOT_STROKE_W,
        );
        bmp.context.restore();

        bmp._baseTexture.update();

        const spr = new Sprite(bmp);
        spr.x = x;
        spr.y = y;
        this.container.addChild(spr);
        this.slotBg.push(spr);

        // label
        const label = ["A", "X", "B", "X", "C"][index];
        const lb = new Bitmap(SLOT_W, SLOT_H);
        lb.fontFace = "GameFont";
        lb.fontSize = Math.max(22, Math.floor(SLOT_H * 0.55));
        lb.textColor = label === "X" ? "#ff2020" : "#ffffff";
        lb.outlineColor = "rgba(0,0,0,0.9)";
        lb.outlineWidth = 8;
        lb.drawText(label, 0, 0, SLOT_W, SLOT_H, "center");
        const labSpr = new Sprite(lb);
        labSpr.x = x;
        labSpr.y = y;
        this.container.addChild(labSpr);
      };

      const x0 = this.slotX,
        y0 = this.slotY;
      let x = x0;

      makeSlot(0, "NUM", x, y0);
      x += SLOT_W;
      x += addPole(x, y0);
      makeSlot(1, "OP", x, y0);
      x += SLOT_W;
      x += addPole(x, y0);
      makeSlot(2, "NUM", x, y0);
      x += SLOT_W;
      x += addPole(x, y0);
      makeSlot(3, "OP", x, y0);
      x += SLOT_W;
      x += addPole(x, y0);
      makeSlot(4, "NUM", x, y0);
    },

    _buildPoolsAndTargets() {
      const pack = buildSolvablePackAdv();

      // fallback kalau entah kenapa gagal
      const rnItems = pack ? pack.rnItems : this._generateRN8Items();

      // build RN cards (ADV: 8 cards, expression display)
      this.rnCards = [];
      for (let i = 0; i < RN_COUNT; i++) {
        const spr = this._makePictureCard("RN", rnItems[i]);
        spr._rnIndex = i;
        this.rnCards.push(spr);
        this.container.addChild(spr);
      }

      // build OP sources (x2)
      this.opSources = [];
      this.opTokens = [];
      for (let i = 0; i < 4; i++) {
        const op = OPS[i];
        const src = this._makePictureCard("OP", op);
        src._isOpSource = true;
        src._isOpToken = false;
        src._op = op;
        src._stock = OP_STOCK;
        this.opSources.push(src);
        this.container.addChild(src);
        this._refreshOpSourceVisual(src);
      }

      // set Z targets
      if (pack) {
        this.zTargets = pack.zTargets;
        this.zSolved = [false, false, false];
        this._internalSolutions = pack.solutions; // optional
      } else {
        // fallback legacy
        this._generateTargets(rnNums);
        this._internalSolutions = null;
      }
    },

    _generateRN8Items() {
      const nums = [];
      if (!RN_UNIQUE) {
        for (let i = 0; i < RN_COUNT; i++) nums.push(randInt(RN_MIN, RN_MAX));
      } else {
        const set = new Set();
        let guard = 0;
        while (nums.length < RN_COUNT && guard < 99999) {
          guard++;
          const v = randInt(RN_MIN, RN_MAX);
          if (!set.has(v)) {
            set.add(v);
            nums.push(v);
          }
        }
        while (nums.length < RN_COUNT) nums.push(randInt(RN_MIN, RN_MAX));
      }
      return nums.map((v) => makeExprForValue(v));
    },

    _generateTargets(rnNums) {
      const targets = new Set();
      const list = [];

      for (let t = 0; t < MAX_GEN_TRY && list.length < 3; t++) {
        const a = rnNums[randInt(0, rnNums.length - 1)];
        const b = rnNums[randInt(0, rnNums.length - 1)];
        const c = rnNums[randInt(0, rnNums.length - 1)];
        if (a === b || a === c || b === c) continue;

        const op1 = OPS[randInt(0, 3)];
        const op2 = OPS[randInt(0, 3)];

        const r = evalABC(a, op1, b, op2, c);
        if (!isNiceInt(r)) continue;
        const ri = Math.round(r);

        if (Math.abs(ri) > getMaxZAbs()) continue;
        if (targets.has(ri)) continue;

        targets.add(ri);
        list.push(ri);
      }

      while (list.length < 3) {
        const v = randInt(-200, 200);
        if (Math.abs(v) <= getMaxZAbs()) list.push(v);
      }

      this.zTargets = list;
      this.zSolved = [false, false, false];
    },

    _startZRoll() {
      if (!ZROLL_ENABLE) return;

      this.inputLocked = true;
      this.zRollActive = true;
      this.zRollTimer = 0;

      // seed awal random supaya tiap slot beda
      this.zRollSeed = [
        randInt(ZROLL_MIN, ZROLL_MAX),
        randInt(ZROLL_MIN, ZROLL_MAX),
        randInt(ZROLL_MIN, ZROLL_MAX),
      ];

      // tampilkan angka awal (rolling)
      for (let i = 0; i < 3; i++) {
        if (this.zWins[i]) this.zWins[i].setTarget(this.zRollSeed[i]);
      }
    },

    _updateZRoll() {
      if (!this.zRollActive) return;

      this.zRollTimer++;

      // update angka tiap interval
      if (this.zRollTimer % Math.max(1, ZROLL_INTERVAL) === 0) {
        for (let i = 0; i < 3; i++) {
          // bikin gerak terasa "rolling": random + sedikit drift
          const jitter = randInt(-9, 9);
          this.zRollSeed[i] += jitter;
          if (this.zRollSeed[i] < ZROLL_MIN) this.zRollSeed[i] = ZROLL_MAX;
          if (this.zRollSeed[i] > ZROLL_MAX) this.zRollSeed[i] = ZROLL_MIN;

          if (this.zWins[i]) this.zWins[i].setTarget(this.zRollSeed[i]);
        }
        // tick sound (ringan)
        playSe(ZROLL_TICK_SE);
      }

      // selesai
      if (this.zRollTimer >= Math.max(1, ZROLL_FRAMES)) {
        this.zRollActive = false;
        this.inputLocked = false;

        // set angka final (target asli)
        for (let i = 0; i < 3; i++) {
          if (this.zWins[i]) this.zWins[i].setTarget(this.zTargets[i]);
        }
        playSe(ZROLL_END_SE);

        if (ZROLL_END_COMMON_EVENT_ID > 0) {
          $gameTemp.reserveCommonEvent(ZROLL_END_COMMON_EVENT_ID);
        }
      }
    },

    _makePictureCard(type, value) {
      const w = type === "RN" ? RN_W_EFF : OP_W;
      const h = type === "RN" ? RN_H_EFF : OP_H;
      const picName = type === "RN" ? RN_PIC : OP_PIC;

      const bmp = new Bitmap(w, h);
      const spr = new Sprite(bmp);

      spr._cardType = type; // RN/OP
      // ADV RN: value may be {text,value}
      spr._expr = null;
      if (type === "RN" && value && typeof value === "object") {
        spr._value = Number(value.value);
        spr._expr = String(value.text);
      } else {
        spr._value = value;
      }

      // token/source flags for OP
      spr._isOpSource = false;
      spr._isOpToken = false;
      spr._sourceRef = null;

      // placement
      spr._slotIndex = -1;
      spr._homeX = 0;
      spr._homeY = 0;

      // hover state
      spr._isHovered = false;
      spr._hoverPlayed = false;
      spr.scale.x = 1.0;
      spr.scale.y = 1.0;
      spr.setColorTone([0, 0, 0, 0]);

      const picBmp = ImageManager.loadPicture(picName);
      const drawLater = () => {
        if (!this.active) return;
        if (picBmp && picBmp.isReady()) {
          spr.bitmap.clear();
          spr.bitmap.blt(picBmp, 0, 0, picBmp.width, picBmp.height, 0, 0, w, h);

          // border black
          drawBlackBorder(spr.bitmap, 3);

          // overlay text (number/operator)
          this._drawOverlay(spr);
        } else setTimeout(drawLater, 16);
      };
      drawLater();

      return spr;
    },

    _drawOverlay(spr) {
      const bmp = spr.bitmap;
      bmp.fontFace = "GameFont";
      bmp.outlineColor = "rgba(0,0,0,0.9)";
      bmp.outlineWidth = 6;

      if (spr._cardType === "RN") {
        // ADV RN: show algebra expression (spr._expr) but keep integer value in spr._value
        const txt = spr._expr ? spr._expr : String(spr._value);
        bmp.textColor = RN_COLOR;

        // heuristic font sizing so expression fits
        const base = FONT_RN;
        let fs = base;
        if (txt.length >= 14) fs = Math.max(14, Math.floor(base * 0.65));
        else if (txt.length >= 10) fs = Math.max(16, Math.floor(base * 0.8));

        bmp.fontSize = fs;

        // simple wrap: split by space if too long
        const maxChars = Math.max(
          10,
          Math.floor((bmp.width - 8) / (fs * 0.55)),
        );
        const raw = String(txt);
        let lines = [];

        if (raw.length <= maxChars) {
          lines = [raw];
        } else {
          // try split by spaces / parentheses separators
          const parts = raw
            .replace(/\)/g, ") ")
            .replace(/\(/g, " (")
            .split(/\s+/);
          let cur = "";
          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (!p) continue;
            const test = cur ? cur + " " + p : p;
            if (test.length > maxChars && cur) {
              lines.push(cur);
              cur = p;
            } else {
              cur = test;
            }
          }
          if (cur) lines.push(cur);
          if (lines.length > 3) {
            // fallback: hard cut
            lines = [
              raw.slice(0, maxChars),
              raw.slice(maxChars, maxChars * 2),
              raw.slice(maxChars * 2),
            ];
          }
        }

        const lh = Math.floor(bmp.height / Math.max(1, lines.length));
        for (let i = 0; i < lines.length; i++) {
          bmp.drawText(lines[i], 4, i * lh, bmp.width - 8, lh, "center");
        }
      } else {
        bmp.fontSize = FONT_OP;
        bmp.textColor = OP_COLOR;
        bmp.drawText(
          opDisplay(String(spr._value)),
          0,
          0,
          bmp.width,
          bmp.height,
          "center",
        );
      }
      bmp._baseTexture.update();
    },

    _refreshOpSourceVisual(src) {
      if (!src || !src.bitmap) return;
      const w = OP_W,
        h = OP_H;
      const picBmp = ImageManager.loadPicture(OP_PIC);

      const redraw = () => {
        if (!this.active) return;
        if (!picBmp.isReady()) return setTimeout(redraw, 16);

        src.bitmap.clear();
        src.bitmap.blt(picBmp, 0, 0, picBmp.width, picBmp.height, 0, 0, w, h);

        drawBlackBorder(src.bitmap, 3);

        src.bitmap.fontFace = "GameFont";
        src.bitmap.fontSize = FONT_OP;
        src.bitmap.textColor = OP_COLOR;
        src.bitmap.outlineColor = "rgba(0,0,0,0.9)";
        src.bitmap.outlineWidth = 6;
        src.bitmap.drawText(opDisplay(String(src._op)), 0, 0, w, h, "center");

        drawOpStockCaption(src.bitmap, src._stock);
      };
      redraw();
    },

    _buildZWindows(scene) {
      this.zWins = [];
      for (let i = 0; i < 3; i++) {
        const x = ZWIN_X + i * (ZWIN_W + ZWIN_GAP);
        const y = ZWIN_Y;
        const w = new Window_Z(i, x, y, ZWIN_W, ZWIN_H);
        w.setTarget(this.zTargets[i]);
        w.setCorrect(false);
        scene.addWindow(w);
        this.zWins.push(w);
      }
    },

    _buildInstructionWindowRightOfZ3(scene) {
      if (!INSTR_ENABLE) return;
      if (!this.zWins || !this.zWins[2]) return;

      const z3 = this.zWins[2];
      const wx = z3.x + z3.width + INSTR_OX;
      const wy = z3.y + INSTR_OY;

      this.instrWin = new Window_Instruction(wx, wy, INSTR_W, INSTR_H);
      this.instrWin.setText(buildInstrText(INSTR_TEXT, this.zTargets));
      scene.addWindow(this.instrWin);
    },

    // ==========================
    // BACK BUTTON (script drawn)
    // ==========================
    _createBackButton() {
      if (!this.backEnabled) return;

      const bmp = makeBackBitmap(BACK_W, BACK_H);
      const spr = new Sprite(bmp);
      spr._isBackButton = true;

      // hover state same as RN/operator
      spr._isHovered = false;
      spr._hoverPlayed = false;
      spr.scale.x = 1.0;
      spr.scale.y = 1.0;
      spr.setColorTone([0, 0, 0, 0]);

      // fixed position (top right of soal bar)
      const SOAL_TOTAL_W = SLOT_W * 5 + POLE_W * 4;
      spr.x = this.slotX + SOAL_TOTAL_W + 40 + BACK_OX;
      spr.y = this.slotY + BACK_OY;

      this.backBtn = spr;
      this.container.addChild(this.backBtn);
    },

    _shuffleRnInPool() {
      const rns = shuffle(this.rnCards.slice());
      for (let i = 0; i < rns.length; i++) {
        const c = rns[i];
        const col = i % Math.max(1, RN_COLS_EFF);
        const row = Math.floor(i / Math.max(1, RN_COLS_EFF));
        const x = RN_POOL_X + col * (RN_W_EFF + RN_GAPX);
        const y = RN_POOL_Y + row * (RN_H_EFF + RN_GAPY);
        c.x = x;
        c.y = y;
        c._homeX = x;
        c._homeY = y;
        c._slotIndex = -1;
      }
    },

    _layoutOpSources() {
      for (let i = 0; i < this.opSources.length; i++) {
        const c = this.opSources[i];
        const x = OP_POOL_X + i * (OP_W + OP_GAPX);
        const y = OP_POOL_Y;
        c.x = x;
        c.y = y;
        c._homeX = x;
        c._homeY = y;
        c._slotIndex = -1;
      }
    },

    _refreshAllCardsList() {
      this.allCards = this.rnCards.concat(this.opSources).concat(this.opTokens);
    },

    _cardInSlot(slotIndex) {
      for (const c of this.rnCards) {
        if (c._slotIndex === slotIndex) return c;
      }
      for (const t of this.opTokens) {
        if (t._slotIndex === slotIndex) return t;
      }
      return null;
    },

    _slotAt(px, py) {
      for (const s of this.slots) {
        if (px >= s.x && px < s.x + s.w && py >= s.y && py < s.y + s.h)
          return s;
      }
      return null;
    },

    _cardAt(px, py) {
      const list = this.rnCards.concat(this.opTokens);
      for (let i = list.length - 1; i >= 0; i--) {
        const c = list[i];
        const w = c._cardType === "RN" ? RN_W_EFF : OP_W;
        const h = c._cardType === "RN" ? RN_H_EFF : OP_H;
        if (px >= c.x && px < c.x + w && py >= c.y && py < c.y + h) return c;
      }
      return null;
    },

    _opSourceAt(px, py) {
      for (let i = this.opSources.length - 1; i >= 0; i--) {
        const s = this.opSources[i];
        if (px >= s.x && px < s.x + OP_W && py >= s.y && py < s.y + OP_H)
          return s;
      }
      return null;
    },

    _canDropOnSlot(card, slot) {
      if (!card || !slot) return false;
      if (card._isOpSource) return false;

      if (card._cardType === "RN") return slot.kind === "NUM";
      if (card._cardType === "OP") return slot.kind === "OP";
      return false;
    },

    _snapCardToSlot(card, slot) {
      const w = card._cardType === "RN" ? RN_W_EFF : OP_W;
      const h = card._cardType === "RN" ? RN_H_EFF : OP_H;
      card.x = slot.x + Math.floor((slot.w - w) / 2);
      card.y = slot.y + Math.floor((slot.h - h) / 2);
      card._slotIndex = slot.index;
    },

    _computeCurrentResult() {
      const A = this._cardInSlot(0);
      const X1 = this._cardInSlot(1);
      const B = this._cardInSlot(2);
      const X2 = this._cardInSlot(3);
      const C = this._cardInSlot(4);
      if (!A || !X1 || !B || !X2 || !C) return null;

      if (A._cardType !== "RN" || B._cardType !== "RN" || C._cardType !== "RN")
        return null;
      if (X1._cardType !== "OP" || X2._cardType !== "OP") return null;

      const r = evalABC(
        Number(A._value),
        String(X1._value),
        Number(B._value),
        String(X2._value),
        Number(C._value),
      );
      if (!isNiceInt(r)) return null;

      const ri = Math.round(r);
      if (Math.abs(ri) > getMaxZAbs()) return null;
      return ri;
    },

    _refreshCheck(isInitial) {
      const r = this._computeCurrentResult();
      if (r == null) return;

      for (let i = 0; i < 3; i++) {
        if (this.zSolved[i]) continue;
        if (r === this.zTargets[i]) {
          this.zSolved[i] = true;
          this.zWins[i].setCorrect(true);
          if (!isInitial) playSe(CORRECT_SE);
        }
      }

      if (this.zSolved[0] && this.zSolved[1] && this.zSolved[2]) {
        $gameSwitches.setValue(this.successSwitchId, true);
      }
    },

    _spawnOpTokenFromSource(src) {
      if (!src || src._stock <= 0) return null;

      src._stock--;
      this._refreshOpSourceVisual(src);

      const t = this._makePictureCard("OP", src._op);
      t._isOpToken = true;
      t._isOpSource = false;
      t._sourceRef = src;

      t._slotIndex = -1;
      t.x = src.x;
      t.y = src.y;
      t._homeX = src.x;
      t._homeY = src.y;

      this.opTokens.push(t);
      this.container.addChild(t);

      this._refreshAllCardsList();
      return t;
    },

    _destroyOpToken(token, refund) {
      if (!token) return;

      token._slotIndex = -1;

      if (token.parent) token.parent.removeChild(token);

      const idx = this.opTokens.indexOf(token);
      if (idx >= 0) this.opTokens.splice(idx, 1);

      if (refund && token._sourceRef) {
        token._sourceRef._stock = Math.min(
          OP_STOCK,
          token._sourceRef._stock + 1,
        );
        this._refreshOpSourceVisual(token._sourceRef);
      }

      this._refreshAllCardsList();
    },

    _setHover(card, on) {
      if (!card) return;

      // ENTER hover: play once
      if (on && !card._isHovered) {
        AudioManager.playSe(HOVER_SE);
        card._hoverPlayed = true;
      }

      card._isHovered = on;

      const targetScale = on ? HOVER_SCALE : 1.0;
      card.scale.x += (targetScale - card.scale.x) * HOVER_EASE;
      card.scale.y += (targetScale - card.scale.y) * HOVER_EASE;

      if (on) {
        card.setColorTone(HOVER_TONE);
      } else {
        card.setColorTone([0, 0, 0, 0]);
        card._hoverPlayed = false;
      }
    },

    _updateHoverEffects() {
      if (this.dragging) {
        for (const c of this.allCards) {
          if (c && c._isHovered) this._setHover(c, false);
        }
        if (this.backBtn && this.backBtn._isHovered)
          this._setHover(this.backBtn, false);
        return;
      }

      for (const c of this.allCards) {
        if (!c) continue;
        const w = c._cardType === "RN" ? RN_W_EFF : OP_W;
        const h = c._cardType === "RN" ? RN_H_EFF : OP_H;
        const over = isPointerOverRect(c.x, c.y, w * c.scale.x, h * c.scale.y);
        this._setHover(c, over);
      }

      // back hover (same system)
      if (this.backBtn) {
        const b = this.backBtn;
        const bw = b.bitmap ? b.bitmap.width : 0;
        const bh = b.bitmap ? b.bitmap.height : 0;
        const over =
          bw > 0 &&
          bh > 0 &&
          isPointerOverRect(b.x, b.y, bw * b.scale.x, bh * b.scale.y);
        this._setHover(b, over);
      }
    },

    _handleDrag() {
      // Back button click first (fixed, no drag)
      if (TouchInput.isTriggered() && this.backBtn && this.backBtn.bitmap) {
        const b = this.backBtn;
        const bw = b.bitmap.width,
          bh = b.bitmap.height;
        const over = isPointerOverRect(
          b.x,
          b.y,
          bw * b.scale.x,
          bh * b.scale.y,
        );
        if (over) {
          this.stop();
          return;
        }
      }

      // start drag
      if (TouchInput.isTriggered()) {
        // priority: click/drag operator source -> spawn token
        const src = this._opSourceAt(TouchInput.x, TouchInput.y);
        if (src && src._stock > 0) {
          const token = this._spawnOpTokenFromSource(src);
          if (token) {
            this.dragging = token;
            if (token.parent) {
              token.parent.removeChild(token);
              this.container.addChild(token);
            }
            this.dragOX = TouchInput.x - token.x;
            this.dragOY = TouchInput.y - token.y;
            return;
          }
        }

        // normal: RN card or OP token
        const c = this._cardAt(TouchInput.x, TouchInput.y);
        if (c) {
          this.dragging = c;
          if (c.parent) {
            c.parent.removeChild(c);
            this.container.addChild(c);
          }
          this.dragOX = TouchInput.x - c.x;
          this.dragOY = TouchInput.y - c.y;
        }
      }

      // dragging
      if (this.dragging && TouchInput.isPressed()) {
        const c = this.dragging;
        c.x = TouchInput.x - this.dragOX;
        c.y = TouchInput.y - this.dragOY;
      }

      // release
      if (this.dragging && TouchInput.isReleased()) {
        const c = this.dragging;
        this.dragging = null;

        const s = this._slotAt(TouchInput.x, TouchInput.y);

        if (s && this._canDropOnSlot(c, s)) {
          // single fill: if occupied, kick previous back (or destroy if token)
          const occ = this._cardInSlot(s.index);
          if (occ && occ !== c) {
            if (occ._isOpToken) {
              this._destroyOpToken(occ, true);
            } else {
              occ._slotIndex = -1;
              occ.x = occ._homeX;
              occ.y = occ._homeY;
            }
          }

          this._snapCardToSlot(c, s);
          playSe(SLIDE_SE);
        } else {
          // drop failed
          if (c._isOpToken) {
            this._destroyOpToken(c, true);
          } else {
            c._slotIndex = -1;
            c.x = c._homeX;
            c.y = c._homeY;
          }
        }

        this._refreshCheck(false);
      }
    },
  };

  // --------------------------
  // Hooks
  // --------------------------
  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    M.update();
  };

  const _Game_Player_canMove = Game_Player.prototype.canMove;
  Game_Player.prototype.canMove = function () {
    if (M.active && LOCK_PLAYER) return false;
    return _Game_Player_canMove.call(this);
  };

  // Disable menu/ESC while puzzle active
  if (DISABLE_MENU) {
    const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
    Scene_Map.prototype.isMenuEnabled = function () {
      if (M.active) return false;
      return _Scene_Map_isMenuEnabled.call(this);
    };
    const _Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
    Scene_Map.prototype.updateCallMenu = function () {
      if (M.active) return;
      _Scene_Map_updateCallMenu.call(this);
    };
  }

  // --------------------------
  // Plugin Commands
  // --------------------------
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "ABCXRnAdvSetup") {
      const sx = Number(args[0] || 0);
      const sy = Number(args[1] || 0);
      const backEnable = String(args[2] || "false").toLowerCase() === "true";

      M.setup(sx, sy);
      M.backEnabled = backEnable;
    }
    if (command === "ABCXRnAdvStart") {
      M.start(args.length >= 1 ? Number(args[0]) : 1);
    }
    if (command === "ABCXRnAdvStop") {
      M.stop();
    }
  };
})();
