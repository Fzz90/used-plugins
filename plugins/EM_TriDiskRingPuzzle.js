/*:
 * @plugindesc (v1.51) TriDisk Ring Puzzle - Rings rotate + Center overlap rotation (Top=bawah, Left=kanan atas, Right=kiri atas). Draw colored rectangles for Top/Left/Right and white rectangle for Center (offsettable). Changing CENTER_INDICATOR_OX/OY automatically adjusts CENTER_X_OFFSET_SCALE/Y. @author You
 *
 * @help
 * ============================================================================
 *  EM_TriDiskRingPuzzle.js  (v1.51)
 * ============================================================================
 *  Assets (img/pictures):
 *    - disk_board.png (your puzzle background)
 *    - leaf_red.png
 *    - leaf_green.png
 *    - leaf_blue.png
 *
 *  Plugin Commands:
 *    TriDiskSetup <X> <Y> <BoardName> <TopColor> <LeftColor> <RightColor>
 *      Colors: red | green | blue
 *      Example: TriDiskSetup 240 80 disk_board blue green red
 *
 *    TriDiskStart <SuccessSwitch>
 *      Example: TriDiskStart 21
 *
 *    TriDiskStop
 *
 *  Controls:
 *    - LMB on ring: rotate CW
 *    - RMB on ring: rotate CCW
 *    - LMB on center: rotate overlap CW
 *    - RMB on center: rotate overlap CCW
 *
 *  v1.51:
 *    - CENTER_INDICATOR_OX/OY (white rect offsets) will automatically change:
 *        CENTER_X_OFFSET_SCALE and CENTER_Y_OFFSET_SCALE
 *    - Center hitbox center position uses the dynamic scales (so they matter).
 * ============================================================================
 */

(function () {
  "use strict";

  // ------------------------
  // Assets
  // ------------------------
  const LEAF_PICS = {
    red: "leaf_red",
    green: "leaf_green",
    blue: "leaf_blue",
  };

  // ------------------------
  // SFX
  // ------------------------
  const ROTATE_SE = { name: "Cursor2", volume: 70, pitch: 110, pan: 0 };
  const SUCCESS_SE = { name: "Item3", volume: 90, pitch: 100, pan: 0 };

  // ------------------------
  // Visual / Anim
  // ------------------------
  const LEAF_SCALE = 1.0;
  const MOVE_ANIM_FRAMES = 10;

  // ------------------------
  // Lock while puzzle active
  // ------------------------
  const DISABLE_MENU = true;
  const LOCK_PLAYER = true;

  // ------------------------
  // Geometry (EDIT to match your board)
  // ------------------------
  const BOARD_CENTER = { x: 320, y: 255 }; // relative to board origin X,Y

  const RING_HIT_RADIUS = 160;
  const BASE_CENTER_HIT_RADIUS = 60;

  // Ring centers (relative to board origin)
  const RING_CENTER = {
    top: { x: 430, y: 155 },
    left: { x: 235, y: 450 },
    right: { x: 635, y: 450 },
  };

  // Slot positions (relative to ring center):
  // 0 = kiri atas, 1 = kanan atas, 2 = bawah
  function ringSlotsFor(center) {
    const cx = center.x,
      cy = center.y;

    const upY = 70;
    const downY = 70;
    const spreadX = 110;

    return [
      { x: cx - spreadX, y: cy - upY }, // slot 0
      { x: cx + spreadX, y: cy - upY }, // slot 1
      { x: cx, y: cy + downY }, // slot 2
    ];
  }

  // ------------------------
  // Target indicator rectangles
  // ------------------------
  const INDICATOR_SIZE = 16;
  const INDICATOR_ALPHA = 1.0;

  const CENTER_INDICATOR_SIZE = 16;
  const CENTER_INDICATOR_ALPHA = 1.0;

  // Offset posisi kotak putih center (relative to BOARD_CENTER)
  // UBAH INI sesuai kebutuhan.
  const CENTER_INDICATOR_OX = 110;
  const CENTER_INDICATOR_OY = 0;

  // Base scales (akan ikut berubah otomatis via offset)
  const BASE_CENTER_X_OFFSET_SCALE = 40;
  const BASE_CENTER_Y_OFFSET_SCALE = 20;

  const COLOR_HEX = {
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    white: "#ffffff",
  };

  // ------------------------
  // Center overlap mapping (sesuai request kamu)
  // Center rotates ONLY these 3 pieces:
  //  - Top ring    : bawah (slot 2)
  //  - Left ring   : kanan atas (slot 1)
  //  - Right ring  : kiri atas (slot 0)
  // ------------------------
  const OVERLAP_SLOT_INDEX = { top: 2, left: 1, right: 0 };

  // Center CW cycle order
  const CENTER_CW_ORDER = ["top", "right", "left"];

  // ------------------------
  // Helpers
  // ------------------------
  function playSe(se) {
    if (se && se.name) AudioManager.playSe(se);
  }

  function normColor(s) {
    s = String(s || "").toLowerCase();
    if (s === "r") s = "red";
    if (s === "g") s = "green";
    if (s === "b") s = "blue";
    if (!LEAF_PICS[s]) return "red";
    return s;
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  // v1.51: scales follow offsets automatically
  // You can tweak multipliers if needed.
  function centerXOffsetScale() {
    return BASE_CENTER_X_OFFSET_SCALE + Math.abs(CENTER_INDICATOR_OX);
  }
  function centerYOffsetScale() {
    return BASE_CENTER_Y_OFFSET_SCALE + Math.abs(CENTER_INDICATOR_OY);
  }

  // Center radius dynamic (still follows offset magnitude)
  function centerRadiusDelta() {
    return Math.max(
      Math.abs(CENTER_INDICATOR_OX),
      Math.abs(CENTER_INDICATOR_OY)
    );
  }
  function centerHitRadius() {
    return BASE_CENTER_HIT_RADIUS + centerRadiusDelta();
  }

  // Dynamic center position for hitbox (so scale is actually used)
  // Using a ratio that becomes 2 in symmetric layout:
  // ratioX = (Xleft + Xright) / Xtop
  // offsetX = (ratioX - 2) * scaleX
  function dynamicCenterPos(baseX, baseY) {
    const Xleft = RING_CENTER.left.x;
    const Xright = RING_CENTER.right.x;
    const Xtop = RING_CENTER.top.x;

    const Yleft = RING_CENTER.left.y;
    const Yright = RING_CENTER.right.y;
    const Ytop = RING_CENTER.top.y;

    const ratioX = (Xleft + Xright) / Math.max(1, Xtop);
    const ratioY = (Yleft + Yright) / Math.max(1, Ytop);

    const offX = (ratioX - 2) * centerXOffsetScale();
    const offY = (ratioY - 2) * centerYOffsetScale();

    // also include your manual offsets so the indicator & hitbox “feel” consistent
    const cx = baseX + BOARD_CENTER.x + offX + CENTER_INDICATOR_OX;
    const cy = baseY + BOARD_CENTER.y + offY + CENTER_INDICATOR_OY;

    return { cx, cy };
  }

  // ------------------------
  // Manager
  // ------------------------
  const M = {
    active: false,
    baseX: 0,
    baseY: 0,
    boardName: "",

    target: { top: "blue", left: "green", right: "red" },
    successSwitchId: 1,

    container: null,
    boardSprite: null,

    ringState: null,
    leafSpr: null,
    anims: [],

    indicators: null, // {top,left,right,center}

    setup(x, y, board, topC, leftC, rightC) {
      this.baseX = Number(x || 0);
      this.baseY = Number(y || 0);
      this.boardName = String(board || "");
      this.target.top = normColor(topC);
      this.target.left = normColor(leftC);
      this.target.right = normColor(rightC);

      if (this.active) {
        this._refreshTargetIndicators();
        this._repositionIndicators();
      }
    },

    start(swId) {
      if (this.active) return;
      const sc = SceneManager._scene;
      if (!sc || !(sc instanceof Scene_Map)) return;

      this.active = true;
      this.successSwitchId = Number(swId || 1);

      this._createContainer(sc);
      this._buildBoard();
      this._buildTargetIndicators();

      this._initStateSolvable();
      this._buildLeaves();
      this._refreshLeaves(true);
    },

    stop() {
      if (!this.active) return;

      if (this.indicators) {
        for (const k in this.indicators) {
          const s = this.indicators[k];
          if (s && s.parent) s.parent.removeChild(s);
        }
      }
      this.indicators = null;

      if (this.container && this.container.parent) {
        this.container.parent.removeChild(this.container);
      }

      this.active = false;
      this.container = null;
      this.boardSprite = null;
      this.ringState = null;
      this.leafSpr = null;
      this.anims = [];
    },

    update() {
      if (!this.active) return;
      this._updateAnims();
      this._handleClickRotate();
    },

    _createContainer(scene) {
      this.container = new Sprite();
      this.container.z = 9999;
      if (scene._spriteset && scene._spriteset._baseSprite) {
        scene._spriteset._baseSprite.addChild(this.container);
      } else {
        scene.addChild(this.container);
      }
    },

    _buildBoard() {
      if (!this.boardName || this.boardName.toLowerCase() === "none") return;
      const bmp = ImageManager.loadPicture(this.boardName);
      const spr = new Sprite(bmp);
      spr.x = this.baseX;
      spr.y = this.baseY;
      this.boardSprite = spr;
      this.container.addChild(spr);
    },

    _buildTargetIndicators() {
      if (this.indicators) {
        for (const k in this.indicators) {
          const s = this.indicators[k];
          if (s && s.parent) s.parent.removeChild(s);
        }
      }
      this.indicators = {};

      const keys = ["top", "left", "right"];
      for (const rk of keys) {
        const bmp = new Bitmap(INDICATOR_SIZE, INDICATOR_SIZE);
        const spr = new Sprite(bmp);
        spr.anchor.x = 0.5;
        spr.anchor.y = 0.5;
        spr.opacity = Math.floor(255 * INDICATOR_ALPHA);
        this.container.addChild(spr);
        this.indicators[rk] = spr;
      }

      // center indicator (white)
      {
        const bmp = new Bitmap(CENTER_INDICATOR_SIZE, CENTER_INDICATOR_SIZE);
        const spr = new Sprite(bmp);
        spr.anchor.x = 0.5;
        spr.anchor.y = 0.5;
        spr.opacity = Math.floor(255 * CENTER_INDICATOR_ALPHA);
        this.container.addChild(spr);
        this.indicators.center = spr;
      }

      this._refreshTargetIndicators();
      this._repositionIndicators();
    },

    _refreshTargetIndicators() {
      if (!this.indicators) return;

      const keys = ["top", "left", "right"];
      for (const rk of keys) {
        const spr = this.indicators[rk];
        if (!spr) continue;

        const colName = this.target[rk];
        const hex = COLOR_HEX[colName] || "#ffffff";
        const b = spr.bitmap;
        b.clear();
        b.fillRect(0, 0, INDICATOR_SIZE, INDICATOR_SIZE, hex);
      }

      if (this.indicators.center) {
        const spr = this.indicators.center;
        const b = spr.bitmap;
        b.clear();
        b.fillRect(
          0,
          0,
          CENTER_INDICATOR_SIZE,
          CENTER_INDICATOR_SIZE,
          COLOR_HEX.white
        );
      }
    },

    _repositionIndicators() {
      if (!this.indicators) return;

      // ring indicators at ring centers
      const keys = ["top", "left", "right"];
      for (const rk of keys) {
        const spr = this.indicators[rk];
        if (!spr) continue;
        spr.x = this.baseX + RING_CENTER[rk].x;
        spr.y = this.baseY + RING_CENTER[rk].y;
      }

      // center indicator uses same dynamic center position as hitbox (v1.51)
      if (this.indicators.center) {
        const p = dynamicCenterPos(this.baseX, this.baseY);
        const spr = this.indicators.center;
        spr.x = p.cx;
        spr.y = p.cy;
      }
    },

    _initStateSolvable() {
      const pool = [
        this.target.top,
        this.target.top,
        this.target.top,
        this.target.left,
        this.target.left,
        this.target.left,
        this.target.right,
        this.target.right,
        this.target.right,
      ];
      shuffle(pool);

      const keys = ["top", "left", "right"];
      this.ringState = { top: [], left: [], right: [] };

      let idx = 0;
      for (const k of keys) {
        this.ringState[k] = [pool[idx++], pool[idx++], pool[idx++]];
      }

      if (this._isSolved()) {
        shuffle(pool);
        idx = 0;
        for (const k of keys) {
          this.ringState[k] = [pool[idx++], pool[idx++], pool[idx++]];
        }
      }

      const spins = 6 + ((Math.random() * 6) | 0);
      for (let i = 0; i < spins; i++) {
        const pick = (Math.random() * 4) | 0;
        const dir = Math.random() < 0.5 ? 1 : -1;

        if (pick === 0) this._rotateRingState("top", dir);
        else if (pick === 1) this._rotateRingState("left", dir);
        else if (pick === 2) this._rotateRingState("right", dir);
        else this._rotateCenterOverlapState(dir);
      }
    },

    _buildLeaves() {
      this.leafSpr = { top: [], left: [], right: [] };
      const keys = ["top", "left", "right"];

      for (const rk of keys) {
        for (let si = 0; si < 3; si++) {
          const col = this.ringState[rk][si];
          const bmp = ImageManager.loadPicture(LEAF_PICS[col]);
          const spr = new Sprite(bmp);
          spr.anchor.x = 0.5;
          spr.anchor.y = 0.5;
          spr.scale.x = LEAF_SCALE;
          spr.scale.y = LEAF_SCALE;
          spr._color = col;
          this.leafSpr[rk][si] = spr;
          this.container.addChild(spr);
        }
      }
    },

    _slotPos(rk, si) {
      const c = RING_CENTER[rk];
      const slots = ringSlotsFor(c);
      const p = slots[si];
      return { x: this.baseX + p.x, y: this.baseY + p.y };
    },

    _refreshLeaves(instant) {
      const keys = ["top", "left", "right"];
      for (const rk of keys) {
        for (let si = 0; si < 3; si++) {
          const spr = this.leafSpr[rk][si];
          const col = this.ringState[rk][si];

          if (spr._color !== col) {
            spr._color = col;
            spr.bitmap = ImageManager.loadPicture(LEAF_PICS[col]);
          }

          const p = this._slotPos(rk, si);
          if (instant) {
            spr.x = p.x;
            spr.y = p.y;
          } else {
            this.anims.push({
              spr,
              sx: spr.x,
              sy: spr.y,
              tx: p.x,
              ty: p.y,
              t: 0,
              d: MOVE_ANIM_FRAMES,
            });
          }
        }
      }
    },

    _updateAnims() {
      if (!this.anims.length) return;
      const alive = [];
      for (const a of this.anims) {
        a.t++;
        const k = Math.min(1, a.t / a.d);
        const e = 1 - Math.pow(1 - k, 3);
        a.spr.x = a.sx + (a.tx - a.sx) * e;
        a.spr.y = a.sy + (a.ty - a.sy) * e;
        if (a.t < a.d) alive.push(a);
      }
      this.anims = alive;
    },

    _ringAtScreen(px, py) {
      const keys = ["top", "left", "right"];
      for (const rk of keys) {
        const c = RING_CENTER[rk];
        const cx = this.baseX + c.x;
        const cy = this.baseY + c.y;
        const dx = px - cx,
          dy = py - cy;
        if (dx * dx + dy * dy <= RING_HIT_RADIUS * RING_HIT_RADIUS) {
          return rk;
        }
      }
      return null;
    },

    _isCenterHit(px, py) {
      const p = dynamicCenterPos(this.baseX, this.baseY);
      const dx = px - p.cx;
      const dy = py - p.cy;
      const r = centerHitRadius();
      return dx * dx + dy * dy <= r * r;
    },

    _handleClickRotate() {
      if (this.anims.length) return;

      // keep indicators aligned (in case you tweak offsets and hot-reload)
      // (safe & cheap)
      this._repositionIndicators();

      const px = TouchInput.x;
      const py = TouchInput.y;

      if (TouchInput.isTriggered()) {
        if (this._isCenterHit(px, py)) {
          this._rotateCenterOverlap(+1);
          return;
        }
        const rk = this._ringAtScreen(px, py);
        if (rk) this._rotateRing(rk, +1);
      }

      if (TouchInput.isCancelled()) {
        if (this._isCenterHit(px, py)) {
          this._rotateCenterOverlap(-1);
          return;
        }
        const rk = this._ringAtScreen(px, py);
        if (rk) this._rotateRing(rk, -1);
      }
    },

    _rotateRingState(rk, dir) {
      const a = this.ringState[rk];
      if (dir > 0) this.ringState[rk] = [a[2], a[0], a[1]];
      else this.ringState[rk] = [a[1], a[2], a[0]];
    },

    _rotateCenterOverlapState(dir) {
      const order = CENTER_CW_ORDER.slice();
      if (dir < 0) order.reverse();

      const aKey = order[0];
      const bKey = order[1];
      const cKey = order[2];

      const ai = OVERLAP_SLOT_INDEX[aKey];
      const bi = OVERLAP_SLOT_INDEX[bKey];
      const ci = OVERLAP_SLOT_INDEX[cKey];

      const a = this.ringState[aKey][ai];
      const b = this.ringState[bKey][bi];
      const c = this.ringState[cKey][ci];

      this.ringState[aKey][ai] = c;
      this.ringState[bKey][bi] = a;
      this.ringState[cKey][ci] = b;
    },

    _rotateRing(rk, dir) {
      playSe(ROTATE_SE);
      this._rotateRingState(rk, dir);
      this._refreshLeaves(false);
      this._checkSolvedAfterAnim();
    },

    _rotateCenterOverlap(dir) {
      playSe(ROTATE_SE);
      this._rotateCenterOverlapState(dir);
      this._refreshLeaves(false);
      this._checkSolvedAfterAnim();
    },

    _isSolved() {
      const keys = ["top", "left", "right"];
      for (const rk of keys) {
        const t = this.target[rk];
        const a = this.ringState[rk];
        if (!(a[0] === t && a[1] === t && a[2] === t)) return false;
      }
      return true;
    },

    _checkSolvedAfterAnim() {
      const self = this;
      const check = function () {
        if (!self.active) return;
        if (self.anims.length) {
          setTimeout(check, 0);
          return;
        }
        if (self._isSolved()) {
          playSe(SUCCESS_SE);
          $gameSwitches.setValue(self.successSwitchId, true);
        }
      };
      setTimeout(check, 0);
    },
  };

  // ------------------------
  // Lock player/menu while active
  // ------------------------
  const _Game_Player_canMove = Game_Player.prototype.canMove;
  Game_Player.prototype.canMove = function () {
    if (M.active && LOCK_PLAYER) return false;
    return _Game_Player_canMove.call(this);
  };

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

  // ------------------------
  // Scene update hook
  // ------------------------
  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    M.update();
  };

  // ------------------------
  // Plugin Commands
  // ------------------------
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "TriDiskSetup") {
      const x = Number(args[0] || 0);
      const y = Number(args[1] || 0);
      const board = String(args[2] || "none");
      const topC = args[3] || "blue";
      const leftC = args[4] || "green";
      const rightC = args[5] || "red";
      M.setup(x, y, board, topC, leftC, rightC);
    }

    if (command === "TriDiskStart") {
      const sw = Number(args[0] || 1);
      M.start(sw);
    }

    if (command === "TriDiskStop") {
      M.stop();
    }
  };
})();
