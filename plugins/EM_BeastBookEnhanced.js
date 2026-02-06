/*:
 * @author Faiz Syihab
 * @plugindesc (v1.31.3) BeastBook Enhanced: auto-add on encounter, simplified kill counter, hide weaknesses for elementId>=18, and show YEP_BattleAICore <AI Priority> skills in BeastBook.
 *
 * @help
 * ============================================================================
 * EM_BeastBookEnhanced.js
 * ============================================================================
 * REQUIREMENTS:
 * - STV_BeastBook.js
 *
 * OPTIONAL:
 * - YEP_BattleAICore.js (not required to be loaded; this plugin parses the
 *   <AI Priority> notetag directly from enemy notes)
 *
 * FEATURES:
 * 5) Mystery Enemies: hide enemy stats (params/EXP/Gold) as "???" until a switch is ON
 * 1) Kill counter: "Kills: X" (no max kills, no gauge)
 * 2) Auto-add enemy to BeastBook when encountered (battle start)
 * 3) Hide weakness display for Element ID >= 18
 * 4) Include ALL skills listed in <AI Priority> into BeastBook Abilities list
 * 6) YEP_ExtraEnemyDrops: support extra/conditional drops (discover + display)
 * ============================================================================
 
 *
 * ============================================================================
 * MYSTERY ENEMY STATS (NEW)
 * ============================================================================
 * You can hide enemy stats (MHP/MMP/ATK/DEF/MAT/MDF/AGI/LUK + EXP + Gold)
 * as "???" for selected enemies, and reveal them when a switch is ON.
 *
 * @param MysteryEnemyIds
 * @text Mystery Enemy IDs
 * @type string
 * @default 32,33,34,35
 * @desc Enemy IDs to hide stats for. Use comma list "32,33" or JSON array "[32,33]".
 *
 * @param RevealSwitchId
 * @text Reveal Switch ID
 * @type switch
 * @default 0
 * @desc If this switch is ON, hidden stats are revealed. Use 0 to always hide.
 *
 * @param MysteryText
 * @text Mystery Text
 * @type string
 * @default ???
 * @desc Text shown instead of hidden values.
 *
 * @param HideExpGold
 * @text Hide EXP & Gold
 * @type boolean
 * @on Hide
 * @off Show
 * @default true
 * @desc If true, EXP and Gold will also be shown as "???".


*
* @param AutoAddExcludeEnemyIds
* @text Auto-Add Exclude Enemy IDs
* @type string
* @default 1
* @desc Enemy IDs excluded from auto-add to BeastBook on battle start. Example: "1,5,12".

 */

(() => {
  "use strict";

  // --------------------------------------------------------------------------
  // Safety Checks
  // --------------------------------------------------------------------------
  if (typeof Window_BeastBook_Info === "undefined") {
    console.warn(
      "EM_BeastBookEnhanced: STV_BeastBook window classes not found. Make sure STV_BeastBook.js is above this plugin.",
    );
    return;
  }
  if (typeof $beastBook === "undefined") {
    console.warn(
      "EM_BeastBookEnhanced: $beastBook not found. STV_BeastBook may not be initialized yet.",
    );
  }

  // --------------------------------------------------------------------------
  // Plugin Params
  // --------------------------------------------------------------------------
  const PLUGIN_NAME = "EM_BeastBookEnhanced";

  const getParams = () => {
    // Normal path: plugin filename matches PLUGIN_NAME
    const direct = PluginManager.parameters(PLUGIN_NAME);
    if (direct && Object.keys(direct).length) return direct;

    // Fallback: if user renames the file (suffix / version), try to locate it
    const all = PluginManager._parameters || {};
    const key = Object.keys(all).find((k) =>
      String(k || "")
        .toLowerCase()
        .includes(PLUGIN_NAME.toLowerCase()),
    );
    return key ? all[key] : {};
  };

  const params = getParams();

  const parseIdList = (raw, fallback) => {
    const s = raw == null ? String(fallback || "") : String(raw || "");
    const t = s.trim();
    if (!t) return [];

    // JSON array support: [32,33,34]
    if (t[0] === "[") {
      try {
        const arr = JSON.parse(t);
        if (Array.isArray(arr)) {
          return arr
            .map((n) => Number(n))
            .filter((n) => Number.isFinite(n) && n > 0);
        }
      } catch (e) {
        // ignore, fall back to CSV
      }
    }

    // CSV: 32,33,34
    return t
      .split(/[\s,]+/g)
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0);
  };

  const P_MYSTERY_IDS = parseIdList(params.MysteryEnemyIds, "32,33,34,35");
  const P_REVEAL_SWITCH_ID = Number(params.RevealSwitchId || 0);
  const P_MYSTERY_TEXT = String(params.MysteryText || "???");
  const P_HIDE_EXP_GOLD = String(params.HideExpGold || "true") === "true";

  const P_AUTOADD_EXCLUDE_IDS = parseIdList(params.AutoAddExcludeEnemyIds, "1");

  // Mask alignment tuning
  // - Some BeastBook layouts compute X based on the original numeric width.
  //   When we replace with '???', X must be adjusted to keep the right edge aligned.
  const EMBB_KEEP_RIGHT_EDGE_ON_PARAM_MASK = true;
  // - EXP/Gold often has an icon on the right; keep some padding so '???' won't overlap.
  const EMBB_CURRENCY_MASK_RIGHT_PAD = 36; // ~icon(32) + gap

  const isMysteryEnemy = (enemyId) => {
    return P_MYSTERY_IDS.indexOf(Number(enemyId || 0)) >= 0;
  };

  const isRevealSwitchOn = () => {
    if (P_REVEAL_SWITCH_ID <= 0) return false;
    if (!window.$gameSwitches) return false;
    return $gameSwitches.value(P_REVEAL_SWITCH_ID);
  };

  const shouldMaskEnemy = (enemyId) => {
    if (!isMysteryEnemy(enemyId)) return false;
    if (isRevealSwitchOn()) return false;
    return true;
  };

  const HIDE_WEAKNESS_FROM_ELEMENT_ID = 18;

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const normalizeName = (s) => {
    return String(s || "")
      .replace(/\x1b\[[0-9;]*m/g, "") // strip ANSI if any
      .replace(/\x1b/g, "") // strip stray escape
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  };

  const findSkillIdByName = (nameRaw) => {
    const name = normalizeName(nameRaw);
    if (!name) return 0;

    // Fast path: exact case-insensitive match
    const list = window.$dataSkills;
    if (!list) return 0;

    for (let i = 1; i < list.length; i++) {
      const s = list[i];
      if (!s || !s.name) continue;
      if (normalizeName(s.name) === name) return i;
    }
    return 0;
  };

  const parseAIPrioritySkillIds = (enemyId) => {
    const enemy = window.$dataEnemies ? window.$dataEnemies[enemyId] : null;
    if (!enemy || !enemy.note) return [];

    // Tolerant tag match: <AI Priority> ... </AI Priority> with any whitespace
    const m = String(enemy.note).match(
      /<AI\s*Priority>\s*([\s\S]*?)\s*<\/AI\s*Priority>/i,
    );
    if (!m) return [];

    const body = String(m[1] || "");
    const lines = body.split(/\r?\n/);

    const ids = [];
    for (let i = 0; i < lines.length; i++) {
      const line = String(lines[i] || "").trim();
      if (!line) continue;

      // Pattern: "...: Skill Name, ..."
      // Also allow: "...: Skill Name"
      // Example: Random 56%: Vine Whip, <<nothing>>
      // Example: HP% param <= 80%: Blossom Shield, Lowest HP%
      let skillName = "";

      const idxColon = line.indexOf(":");
      if (idxColon < 0) continue;

      const rhs = line.slice(idxColon + 1).trim();
      if (!rhs) continue;

      // take before first comma (target clause may be <<nothing>>)
      const idxComma = rhs.indexOf(",");
      skillName = idxComma >= 0 ? rhs.slice(0, idxComma).trim() : rhs.trim();

      if (!skillName) continue;
      if (normalizeName(skillName) === "<<nothing>>") continue;

      const id = findSkillIdByName(skillName);
      if (id > 0) ids.push(id);
    }

    // Unique
    return Array.from(new Set(ids));
  };

  const baseActionSkillIds = (enemyId) => {
    const enemy = window.$dataEnemies ? window.$dataEnemies[enemyId] : null;
    if (!enemy || !enemy.actions) return [];
    const ids = [];
    for (let i = 0; i < enemy.actions.length; i++) {
      const a = enemy.actions[i];
      if (a && a.skillId > 0) ids.push(a.skillId);
    }
    return Array.from(new Set(ids));
  };

  // --------------------------------------------------------------------------
  // 0) Mystery Enemy Stats Masking (ALL BeastBook Windows)
  // --------------------------------------------------------------------------
  // IMPORTANT:
  // Different BeastBook implementations draw stats using different pipelines:
  // - Window_Base.drawText(...)
  // - Window_Base.drawTextEx(...)
  // - Window_Base.drawCurrencyValue(...)
  // - Bitmap.drawText(...) (directly via this.contents.drawText)
  //
  // To stay compatible (including when BeastBook is opened from a custom Menu
  // command like EM_HandbookMenu_BeastBook.js), we apply a scope-limited masking:
  //
  // - Any Window_BeastBook_* window will be marked as "masking active" while it
  //   draws a "mystery enemy".
  // - Global draw hooks will ONLY mask values when the calling window is marked.
  //
  // Additionally: when masking, we REPLACE the value with "???" (not drawing on top).
  // This prevents ghosting / overlap artifacts.

  const EMBB_MASK_PREFIX = "Window_BeastBook_";

  const emBB_stripEscapes = (s) => {
    return String(s ?? "")
      .replace(/\x1b\[[0-9;]*m/g, "")
      .replace(/\x1b/g, "");
  };

  // Decide if a drawn text is "pure numeric value" (likely a param value)
  // We intentionally EXCLUDE percentages to avoid masking element resist values.
  const emBB_isNumericValueText = (s) => {
    const t = emBB_stripEscapes(s).trim();
    if (!t) return false;
    if (!/\d/.test(t)) return false;
    if (/%/.test(t)) return false;
    // allow: 1234, 1,234, 1234/1234, -12, +8, 12.5, etc.
    return /^[0-9\s,./+\-()]+$/.test(t);
  };

  const emBB_maskTextIfNeeded = (text, ownerWindow) => {
    if (!ownerWindow || !ownerWindow._emBBMaskingActive) return text;
    if (emBB_isNumericValueText(text)) return P_MYSTERY_TEXT;

    // Fallback: if a single line contains a param label + digits, mask only the digits.
    // Note: we DO NOT try to be clever with escape codes here; this is a best-effort
    // compatibility layer for atypical BeastBook layouts.
    const plain = emBB_stripEscapes(text);
    const looksLikeParamLine =
      /\b(MHP|MMP|ATK|DEF|MAT|MDF|AGI|LUK|HP|MP)\b/i.test(plain) &&
      /\d/.test(plain);

    if (looksLikeParamLine) {
      // Replace only number-like tokens, keep surrounding text intact
      return String(text).replace(/[-+]?\d[\d,./]*/g, P_MYSTERY_TEXT);
    }

    return text;
  };

  const emBB_getEnemyIdFromWindow = (win) => {
    if (!win) return 0;

    // Common patterns used by BeastBook windows
    if (win._beast && Number.isFinite(Number(win._beast.id)))
      return Number(win._beast.id);
    if (Number.isFinite(Number(win._beastId))) return Number(win._beastId);
    if (Number.isFinite(Number(win._enemyId))) return Number(win._enemyId);
    if (win._data && Number.isFinite(Number(win._data.id)))
      return Number(win._data.id);

    // Scene fallback (best effort)
    const scene =
      window.SceneManager && SceneManager._scene ? SceneManager._scene : null;
    if (scene && scene._beast && Number.isFinite(Number(scene._beast.id))) {
      return Number(scene._beast.id);
    }
    if (scene && Number.isFinite(Number(scene._beastId)))
      return Number(scene._beastId);

    return 0;
  };

  const emBB_markWindowMasking = (win, enemyId) => {
    const doMask = shouldMaskEnemy(enemyId);
    win._emBBMaskingActive = doMask;
    win._emBBMaskingEnemyId = enemyId;

    // Allow Bitmap.drawText to know its owner window (for direct contents.drawText calls)
    if (win.contents) {
      win.contents._emBBMaskingOwner = win;
    }
  };

  const emBB_restoreWindowMasking = (win, prev) => {
    if (!win) return;

    if (prev) {
      win._emBBMaskingActive = prev.active;
      win._emBBMaskingEnemyId = prev.enemyId;

      if (win.contents) {
        if (prev.owner !== undefined) {
          win.contents._emBBMaskingOwner = prev.owner;
        } else {
          delete win.contents._emBBMaskingOwner;
        }
      }
      return;
    }

    delete win._emBBMaskingActive;
    delete win._emBBMaskingEnemyId;
    if (win.contents) delete win.contents._emBBMaskingOwner;
  };

  // --------------------------------------------------------------------------
  // Global draw hooks (ONLY active when owner window is marked)
  // --------------------------------------------------------------------------
  if (!Window_Base.prototype.__emBBMaskHooksInstalled) {
    Window_Base.prototype.__emBBMaskHooksInstalled = true;

    const _WB_drawText = Window_Base.prototype.drawText;
    Window_Base.prototype.drawText = function (text, x, y, maxWidth, align) {
      const out = emBB_maskTextIfNeeded(text, this);

      // Keep the RIGHT edge stable for param values when the original layout
      // pre-computed X using the original numeric width (common in BeastBook stats).
      if (
        EMBB_KEEP_RIGHT_EDGE_ON_PARAM_MASK &&
        this._emBBMaskingActive &&
        out === P_MYSTERY_TEXT &&
        emBB_isNumericValueText(text) &&
        (!align || align === "left")
      ) {
        const w0 = this.textWidth(emBB_stripEscapes(text));
        const w1 = this.textWidth(P_MYSTERY_TEXT);
        x += w0 - w1;
      }

      return _WB_drawText.call(this, out, x, y, maxWidth, align);
    };

    const _WB_drawTextEx = Window_Base.prototype.drawTextEx;
    Window_Base.prototype.drawTextEx = function (text, x, y) {
      const out = emBB_maskTextIfNeeded(text, this);
      return _WB_drawTextEx.call(this, out, x, y);
    };

    const _WB_drawCurrencyValue = Window_Base.prototype.drawCurrencyValue;
    Window_Base.prototype.drawCurrencyValue = function (
      value,
      unit,
      x,
      y,
      width,
    ) {
      if (this._emBBMaskingActive && P_HIDE_EXP_GOLD) {
        // Draw masked text directly (avoid type assumptions from other plugins).
        // Reserve padding on the right to avoid overlapping the EXP/Gold icon.
        const pad = Math.max(0, Number(EMBB_CURRENCY_MASK_RIGHT_PAD) || 0);
        const safeW = Math.max(0, width - pad);
        return _WB_drawText.call(this, P_MYSTERY_TEXT, x, y, safeW, "right");
      }
      return _WB_drawCurrencyValue.call(this, value, unit, x, y, width);
    };

    const _BM_drawText = Bitmap.prototype.drawText;
    Bitmap.prototype.drawText = function (
      text,
      x,
      y,
      maxWidth,
      lineHeight,
      align,
    ) {
      const owner = this._emBBMaskingOwner;
      const out = emBB_maskTextIfNeeded(text, owner);

      // Same alignment fix for direct contents.drawText calls.
      if (
        EMBB_KEEP_RIGHT_EDGE_ON_PARAM_MASK &&
        owner &&
        owner._emBBMaskingActive &&
        out === P_MYSTERY_TEXT &&
        emBB_isNumericValueText(text) &&
        (!align || align === "left")
      ) {
        const w0 = this.measureTextWidth(emBB_stripEscapes(text));
        const w1 = this.measureTextWidth(P_MYSTERY_TEXT);
        x += w0 - w1;
      }

      return _BM_drawText.call(this, out, x, y, maxWidth, lineHeight, align);
    };
  }

  // --------------------------------------------------------------------------
  // Mark BeastBook windows during refresh/drawItem (so masking is scoped properly)
  // --------------------------------------------------------------------------
  const emBB_wrapMethodForMasking = (Ctor, methodName) => {
    if (!Ctor || !Ctor.prototype) return;
    const proto = Ctor.prototype;
    if (typeof proto[methodName] !== "function") return;

    const guardKey = "__emBBWrapped_" + methodName;
    if (proto[guardKey]) return;
    proto[guardKey] = true;

    const _orig = proto[methodName];
    proto[methodName] = function (...args) {
      const enemyId = emBB_getEnemyIdFromWindow(this);
      if (!shouldMaskEnemy(enemyId)) {
        return _orig.apply(this, args);
      }

      const prev = {
        active: this._emBBMaskingActive,
        enemyId: this._emBBMaskingEnemyId,
        owner: this.contents ? this.contents._emBBMaskingOwner : undefined,
      };

      emBB_markWindowMasking(this, enemyId);
      try {
        return _orig.apply(this, args);
      } finally {
        emBB_restoreWindowMasking(this, prev);
      }
    };
  };

  const emBB_patchAllBeastBookWindows = () => {
    const keys = Object.keys(window);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!k || k.indexOf(EMBB_MASK_PREFIX) !== 0) continue;

      const Ctor = window[k];
      if (typeof Ctor !== "function") continue;

      emBB_wrapMethodForMasking(Ctor, "refresh");
      emBB_wrapMethodForMasking(Ctor, "drawItem");
      emBB_wrapMethodForMasking(Ctor, "drawAllItems");
    }
  };

  // Patch immediately (typical case: STV_BeastBook is loaded above this plugin)
  emBB_patchAllBeastBookWindows();

  // Patch again on boot start (extra safety for unusual load orders)
  if (
    typeof Scene_Boot !== "undefined" &&
    Scene_Boot.prototype &&
    Scene_Boot.prototype.start
  ) {
    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
      emBB_patchAllBeastBookWindows();
      return _Scene_Boot_start.call(this);
    };
  }

  // --------------------------------------------------------------------------
  // 1) Auto-add Beast on encounter (battle start)
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  const _Game_Troop_setup = Game_Troop.prototype.setup;
  Game_Troop.prototype.setup = function (troopId) {
    _Game_Troop_setup.call(this, troopId);

    if (!window.$beastBook) return;

    const members = this.members();
    for (let i = 0; i < members.length; i++) {
      const e = members[i];
      if (!e || !e.isEnemy()) continue;
      const id = e.enemyId();
      if (id > 0 && P_AUTOADD_EXCLUDE_IDS.indexOf(id) < 0) {
        $beastBook.addBeast(id);
      }
    }
  };

  // --------------------------------------------------------------------------
  // 2) Remove Elemental weaknesses for elementId >= 18
  // --------------------------------------------------------------------------

  // !--------------------------------------------------------------------------

  if (typeof Window_BeastBook_Elements === "undefined") return;

  const HIDE_FROM_ID = 18;

  Window_BeastBook_Elements.prototype.contentDrawResistance = function () {
    let shown = 0;
    let y = this.lineHeight();

    // Defensive: ensure beast exists
    const beast = this._beast;
    if (!beast || !beast.traits) {
      this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
      this.drawText(stv_BeastBook_noData, 0, y, this.contents.width, "center");
      this.resetTextColor();
      return;
    }

    for (let i = 0; i < beast.traits.length; i++) {
      const trait = beast.traits[i];

      // Element Rate trait: code 11
      if (trait.code !== 11) continue;

      const elementId = trait.dataId;
      if (elementId >= HIDE_FROM_ID) continue; // <-- hard filter

      const elementName = $dataSystem.elements[elementId] || "";
      if (!elementName) continue;

      shown++;

      this.changeTextColor(this.systemColor());
      this.drawTextEx(elementName, 0, y);

      const rate = Math.round(trait.value * 100);

      // Weak / Resist coloring (match STV vibe)
      if (rate > 100)
        this.changeTextColor(this.textColor(3)); // weak
      else if (rate < 100)
        this.changeTextColor(this.textColor(2)); // resist
      else this.resetTextColor();

      this.drawText(rate + "%", this.contents.width - 70, y, 70, "right");
      this.resetTextColor();

      y += this.lineHeight();
    }

    if (shown === 0) {
      this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
      this.drawText(stv_BeastBook_noData, 0, y, this.contents.width, "center");
      this.resetTextColor();
    }
  };

  // --------------------------------------------------------------------------
  // 4) SHOW <AI Priority> SKILLS IN BEASTBOOK ABILITIES
  // --------------------------------------------------------------------------
  const _contentDrawAbilities =
    Window_BeastBook_Info.prototype.contentDrawAbilities;
  Window_BeastBook_Info.prototype.contentDrawAbilities = function () {
    // If STV changes, keep fallback
    if (typeof _contentDrawAbilities !== "function") return;

    // Replicate STV layout style but draw merged list.
    // We avoid calling original because it only draws enemy.actions.
    let y = this.lineHeight();
    const maxLength = this.contents.width / 2 - stv_BeastBook_padding * 2 - 32;

    // Right-side divider line (same as STV)
    this.contents.fillRect(
      this.contents.width / 2 + stv_BeastBook_padding,
      y - 5,
      this.contents.width / 2 - stv_BeastBook_padding,
      1,
      this.normalColor(),
    );

    this.drawText(
      stv_BeastBook_skillsText,
      this.contents.width - this.textWidth(stv_BeastBook_skillsText),
      0,
    );

    const enemyId = this._beast ? this._beast.id : 0;
    const idsBase = baseActionSkillIds(enemyId);
    const idsAI = parseAIPrioritySkillIds(enemyId);

    // Merge + unique
    const merged = Array.from(new Set(idsBase.concat(idsAI)));

    for (let i = 0; i < merged.length; i++) {
      const skillId = merged[i];
      const skill = window.$dataSkills ? $dataSkills[skillId] : null;
      if (!skill) continue;

      // STV hide rule: <BeastBook:hide>
      if (skill.meta && skill.meta.BeastBook === "hide") continue;

      this.changeTextColor(this.textColor(stv_BeastBook_skillsColor));
      this.drawSkillName(
        skill,
        this.contents.width - this.textWidth(skill.name) - 36,
        y,
        maxLength,
      );
      y += this.lineHeight();
      this.changeTextColor(this.normalColor());
    }
  };

  // * NOTE
  if (typeof Window_BeastBook_Info === "undefined") return;

  Window_BeastBook_Info.prototype.contentDrawKillCounter = function () {
    if (!this._beast) return;

    const beastId = this._beast.id;
    const doMask = shouldMaskEnemy(beastId);
    const kills =
      window.$beastBook && $beastBook.beasts && $beastBook.beasts[beastId]
        ? $beastBook.beasts[beastId].kills / 2 || 0
        : 0;

    // === Vertical position tetap mengikuti STV ===
    const y =
      this.contents.height - this.lineHeight() * 3 - stv_BeastBook_padding * 2;

    // Draw label + value as TWO separate drawText calls.
    // This prevents overlap when the value is masked ("???"), because some
    // layouts pre-compute X from the original numeric width.
    const label = "Kill Count:";
    const valueText = doMask ? P_MYSTERY_TEXT : String(kills);

    const gap = 6; // px gap between label and value
    const labelW = this.textWidth(label);
    const valueW = this.textWidth(valueText);
    const totalW = labelW + gap + valueW;
    const x0 = Math.max(0, Math.floor((this.contents.width - totalW) / 2));

    this.changeTextColor(this.systemColor());
    this.drawText(label, x0, y, labelW, "left");
    this.changeTextColor(this.textColor(26));
    this.drawText(valueText, x0 + labelW + gap, y, valueW, "left");
    this.resetTextColor();
  };
})();

// ============================================================================
// (v1.31.3) YEP_ExtraEnemyDrops compatibility patch + left-aligned drop list
// - Shows all drop slots (not limited to 3).
// - Supports YEP conditional drops (display + discovery).
// - Keeps BeastBook discovery flags sized to actual drop list lengths.
// ============================================================================
(() => {
  "use strict";

  // Prevent double-patching if multiple copies are loaded.
  if (window._emBBE_EED_Patched) return;
  window._emBBE_EED_Patched = true;

  if (
    typeof Beast_Book === "undefined" ||
    typeof Window_BeastBook_Info === "undefined"
  )
    return;

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const isItem = (it) =>
    typeof DataManager !== "undefined" && DataManager.isItem(it);
  const isWeapon = (it) =>
    typeof DataManager !== "undefined" && DataManager.isWeapon(it);
  const isArmor = (it) =>
    typeof DataManager !== "undefined" && DataManager.isArmor(it);

  const itemKindOf = (it) => {
    if (!it) return 0;
    if (isItem(it)) return 1;
    if (isWeapon(it)) return 2;
    if (isArmor(it)) return 3;
    return 0;
  };

  const enemyById = (enemyId) =>
    window.$dataEnemies ? $dataEnemies[enemyId] : null;

  const dropLens = (enemyId) => {
    const e = enemyById(enemyId);
    const baseLen = e && Array.isArray(e.dropItems) ? e.dropItems.length : 0;
    const condLen =
      e && Array.isArray(e.conditionalDropItems)
        ? e.conditionalDropItems.length
        : 0;
    return { baseLen, condLen, total: baseLen + condLen };
  };

  const ensureDiscoveredItemsSize = (book, enemyId) => {
    if (!book || !book.beasts || !book.beasts[enemyId]) return;
    const beast = book.beasts[enemyId];
    if (!Array.isArray(beast.discoveredItems)) beast.discoveredItems = [];
    const { total } = dropLens(enemyId);
    while (beast.discoveredItems.length < total)
      beast.discoveredItems.push(false);
  };

  const ensureAllSizes = (book) => {
    if (!book || !book.beasts) return;
    for (let i = 1; i < book.beasts.length; i++) {
      ensureDiscoveredItemsSize(book, i);
    }
  };

  const makeFilledArray = (len, value) => {
    const a = [];
    for (let i = 0; i < len; i++) a.push(!!value);
    return a;
  };

  // --------------------------------------------------------------------------
  // Patch Beast_Book sizing + commands (clearItems / completeItems)
  // --------------------------------------------------------------------------
  const _clear = Beast_Book.prototype.clear;
  if (typeof _clear === "function" && !_clear._emBBE_EED) {
    Beast_Book.prototype.clear = function () {
      const r = _clear.apply(this, arguments);
      ensureAllSizes(this);
      return r;
    };
    Beast_Book.prototype.clear._emBBE_EED = true;
  }

  const _clearItems = Beast_Book.prototype.clearItems;
  if (typeof _clearItems === "function" && !_clearItems._emBBE_EED) {
    Beast_Book.prototype.clearItems = function () {
      // Prefer original behavior for other data, then resize properly.
      const r = _clearItems.apply(this, arguments);
      for (let i = 1; i < this.beasts.length; i++) {
        const { total } = dropLens(i);
        this.beasts[i].discoveredItems = makeFilledArray(total, false);
      }
      return r;
    };
    Beast_Book.prototype.clearItems._emBBE_EED = true;
  }

  const _completeItems = Beast_Book.prototype.completeItems;
  if (typeof _completeItems === "function" && !_completeItems._emBBE_EED) {
    Beast_Book.prototype.completeItems = function () {
      const r = _completeItems.apply(this, arguments);
      for (let i = 1; i < this.beasts.length; i++) {
        const { total } = dropLens(i);
        this.beasts[i].discoveredItems = makeFilledArray(total, true);
      }
      return r;
    };
    Beast_Book.prototype.completeItems._emBBE_EED = true;
  }

  // --------------------------------------------------------------------------
  // Patch discovery: support >3 base drops + YEP conditional drops
  // --------------------------------------------------------------------------
  Beast_Book.prototype._emDiscoverDropByKindId = function (
    enemyId,
    kind,
    dataId,
  ) {
    if (!kind || !dataId) return;
    if (!this.beasts || !this.beasts[enemyId]) return;

    ensureDiscoveredItemsSize(this, enemyId);

    const enemy = enemyById(enemyId);
    if (!enemy) return;

    // Base drops (all slots, not just first 3)
    const base = Array.isArray(enemy.dropItems) ? enemy.dropItems : [];
    for (let i = 0; i < base.length; i++) {
      const di = base[i];
      if (!di) continue;
      if (di.kind === kind && di.dataId === dataId) {
        this.beasts[enemyId].discoveredItems[i] = true;
      }
    }

    // Conditional drops (YEP_ExtraEnemyDrops): tracked after baseLen
    const cond = Array.isArray(enemy.conditionalDropItems)
      ? enemy.conditionalDropItems
      : [];
    const baseLen = base.length;
    for (let c = 0; c < cond.length; c++) {
      const data = cond[c];
      const obj = data && data[0];
      if (!obj) continue;
      const k = itemKindOf(obj);
      const id = obj.id;
      if (k === kind && id === dataId) {
        this.beasts[enemyId].discoveredItems[baseLen + c] = true;
      }
    }
  };

  // Wrap STV discoverItem (keeps compatibility with other stacks calling it).
  const _discoverItem = Beast_Book.prototype.discoverItem;
  if (typeof _discoverItem === "function" && !_discoverItem._emBBE_EED) {
    Beast_Book.prototype.discoverItem = function (enemyId, item) {
      // Original first (does nothing harmful, but limited to 3 slots)
      _discoverItem.apply(this, arguments);

      const kind = itemKindOf(item);
      if (!kind || !item || !item.id) return;
      this._emDiscoverDropByKindId(enemyId, kind, item.id);
    };
    Beast_Book.prototype.discoverItem._emBBE_EED = true;
  }

  // Safety net: ensure conditional drops also get discovered even if another plugin
  // appends them AFTER STV's makeDropItems wrapper runs.
  if (typeof Game_Enemy !== "undefined" && Game_Enemy.prototype) {
    const _makeDropItems = Game_Enemy.prototype.makeDropItems;
    if (typeof _makeDropItems === "function" && !_makeDropItems._emBBE_EED) {
      Game_Enemy.prototype.makeDropItems = function () {
        const drops = _makeDropItems.apply(this, arguments);

        try {
          const beastId = this._enemyId;
          if (
            window.$beastBook &&
            typeof $beastBook.discoverItem === "function"
          ) {
            (drops || []).forEach((it) => {
              $beastBook.discoverItem(beastId, it);
            });
          }
        } catch (e) {
          // ignore
        }

        return drops;
      };
      Game_Enemy.prototype.makeDropItems._emBBE_EED = true;
    }
  }

  // --------------------------------------------------------------------------
  // Patch display: show all drops + conditional drops
  // --------------------------------------------------------------------------
  const _contentDrawItems = Window_BeastBook_Info.prototype.contentDrawItems;
  if (
    typeof _contentDrawItems === "function" &&
    !_contentDrawItems._emBBE_EED
  ) {
    Window_BeastBook_Info.prototype.contentDrawItems = function () {
      // If STV globals are missing for any reason, fallback.
      if (
        typeof stv_BeastBook_padding === "undefined" ||
        typeof stv_BeastBook_dropsText === "undefined"
      ) {
        return _contentDrawItems.apply(this, arguments);
      }

      const beastId = this._beast ? this._beast.id : 0;
      if (window.$beastBook) ensureDiscoveredItemsSize($beastBook, beastId);

      const enemy = this._beast;
      const base =
        enemy && Array.isArray(enemy.dropItems) ? enemy.dropItems : [];
      const cond =
        enemy && Array.isArray(enemy.conditionalDropItems)
          ? enemy.conditionalDropItems
          : [];
      const baseLen = base.length;

      const yStart = this.lineHeight();
      let y = yStart;

      // Item area is left half of the window
      const areaW = this.contents.width / 2 - stv_BeastBook_padding;
      this.contents.fillRect(0, y - 5, areaW, 1, this.normalColor());
      this.drawText(stv_BeastBook_dropsText, 0, 0);

      const pctSample = ": 100%";
      const pctW = this.textWidth(pctSample);
      const pctX = Math.max(0, areaW - pctW);
      const nameW = Math.max(0, areaW - pctW - stv_BeastBook_padding);

      const bookEntry =
        window.$beastBook && $beastBook.beasts
          ? $beastBook.beasts[beastId]
          : null;
      const discovered = bookEntry ? bookEntry.discoveredItems : null;

      const formatPercent = (denominator) => {
        const den = Number(denominator);
        if (!isFinite(den) || den <= 0) return "0%";
        const pct = (1 / den) * 100;
        const rounded = Math.round(pct * 100) / 100; // 2 decimals
        let s = rounded.toFixed(2);
        s = s.replace(/\.00$/, "");
        s = s.replace(/(\.\d)0$/, "$1");
        return s + "%";
      };

      const drawUnknownLine = () => {
        this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
        // Name/Item
        this.drawText(stv_BeastBook_unknownData, 0, y, nameW);
        // Percent
        this.drawText(stv_BeastBook_unknownData, pctX, y, pctW, "right");
        this.changeTextColor(this.normalColor());
      };

      let drewAny = false;

      // Base drop slots (support >3, includes YEP_ExtraEnemyDrops generic drops)
      for (let j = 0; j < baseLen; j++) {
        const di = base[j];
        if (!di || !di.kind || di.kind <= 0) continue;
        drewAny = true;

        const isKnown = discovered && discovered[j];
        if (isKnown) {
          const itemObj = Game_Enemy.prototype.itemObject(di.kind, di.dataId);

          // Draw item (icon + name)
          this.changeTextColor(this.normalColor());
          this.drawItemName(itemObj, 0, y, nameW);

          // Draw percent at the right, colored like "success"
          this.changeTextColor(this.textColor(stv_BeastBook_dropsSuccessColor));
          this.drawText(
            ": " + formatPercent(di.denominator),
            pctX,
            y,
            pctW,
            "right",
          );
          this.changeTextColor(this.normalColor());
        } else {
          drawUnknownLine();
        }

        y += this.lineHeight();
      }

      // Conditional drops (YEP_ExtraEnemyDrops): rate is dynamic, so show COND
      for (let c = 0; c < cond.length; c++) {
        const data = cond[c];
        const itemObj = data && data[0];
        if (!itemObj) continue;

        drewAny = true;

        const idx = baseLen + c;
        const isKnown = discovered && discovered[idx];

        if (isKnown) {
          this.changeTextColor(this.normalColor());
          this.drawItemName(itemObj, 0, y, nameW);

          this.changeTextColor(this.textColor(stv_BeastBook_dropsSuccessColor));
          this.drawText(": COND", pctX, y, pctW, "right");
          this.changeTextColor(this.normalColor());
        } else {
          drawUnknownLine();
        }

        y += this.lineHeight();
      }

      // No drop data at all
      if (!drewAny) {
        this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
        this.drawText(stv_BeastBook_noData, 0, y, areaW);
        this.changeTextColor(this.normalColor());
      }

      this.resetTextColor();
    };

    Window_BeastBook_Info.prototype.contentDrawItems._emBBE_EED = true;
  }
})();

// ============================================================================
// (v1.31.3) Drop List: LEFT-aligned (inline percent) formatting
// - Removes "column/right aligned percent" look (often perceived as justify).
// - Displays: [Icon] Item Name: 33%   (inline)
// - Conditional drops display: [Icon] Item Name: COND
// ============================================================================
(() => {
  "use strict";

  if (window._emBBE_EED_LeftAlignPatched) return;
  window._emBBE_EED_LeftAlignPatched = true;

  if (typeof Window_BeastBook_Info === "undefined") return;

  const _prev = Window_BeastBook_Info.prototype.contentDrawItems;

  const ICON_W =
    typeof Window_Base !== "undefined" && Window_Base._iconWidth
      ? Window_Base._iconWidth
      : 32;
  const ICON_PAD = 4; // gap after icon

  const enemyById = (enemyId) =>
    window.$dataEnemies ? $dataEnemies[enemyId] : null;

  const dropLens = (enemyId) => {
    const e = enemyById(enemyId);
    const baseLen = e && Array.isArray(e.dropItems) ? e.dropItems.length : 0;
    const condLen =
      e && Array.isArray(e.conditionalDropItems)
        ? e.conditionalDropItems.length
        : 0;
    return { baseLen, condLen, total: baseLen + condLen };
  };

  const ensureDiscoveredItemsSize = (book, enemyId) => {
    if (!book || !book.beasts || !book.beasts[enemyId]) return;
    const beast = book.beasts[enemyId];
    if (!Array.isArray(beast.discoveredItems)) beast.discoveredItems = [];
    const { total } = dropLens(enemyId);
    while (beast.discoveredItems.length < total)
      beast.discoveredItems.push(false);
  };

  const formatPercent = (denominator) => {
    const den = Number(denominator);
    if (!isFinite(den) || den <= 0) return "0%";
    const pct = (1 / den) * 100;
    const rounded = Math.round(pct * 100) / 100; // 2 decimals
    let s = rounded.toFixed(2);
    s = s.replace(/\.00$/, "");
    s = s.replace(/(\.\d)0$/, "$1");
    return s + "%";
  };

  // Draw icon + item name on the left, then draw suffix inline right after the name
  const drawInlineSuffix = function (
    itemObj,
    y,
    areaW,
    suffixText,
    suffixColorIndex,
  ) {
    if (!itemObj) return;

    // Icon
    const ix = 0;
    const iy = y + 2; // icon baseline tweak
    if (Number.isFinite(itemObj.iconIndex))
      this.drawIcon(itemObj.iconIndex, ix, iy);

    const textX = ICON_W + ICON_PAD;
    const maxTextW = Math.max(0, areaW - textX);

    // Name (clipped by maxTextW)
    this.changeTextColor(this.normalColor());
    this.drawText(String(itemObj.name || ""), textX, y, maxTextW, "left");

    // Suffix placed after the rendered name width, clamped to stay inside areaW
    const nameW = Math.min(
      this.textWidth(String(itemObj.name || "")),
      maxTextW,
    );
    const suffixW = this.textWidth(String(suffixText || ""));
    let sx = textX + nameW + 6;
    const maxSX = Math.max(textX, areaW - suffixW);
    if (sx > maxSX) sx = maxSX;

    if (suffixColorIndex != null) {
      this.changeTextColor(this.textColor(suffixColorIndex));
    } else {
      this.changeTextColor(this.normalColor());
    }
    this.drawText(
      String(suffixText || ""),
      sx,
      y,
      Math.max(0, areaW - sx),
      "left",
    );
    this.changeTextColor(this.normalColor());
  };

  Window_BeastBook_Info.prototype.contentDrawItems = function () {
    // Safety fallback if STV globals are missing
    if (
      typeof stv_BeastBook_padding === "undefined" ||
      typeof stv_BeastBook_dropsText === "undefined"
    ) {
      if (typeof _prev === "function") return _prev.apply(this, arguments);
      return;
    }

    const beastId = this._beast ? this._beast.id : 0;
    if (window.$beastBook) ensureDiscoveredItemsSize($beastBook, beastId);

    const enemy = this._beast;
    const base = enemy && Array.isArray(enemy.dropItems) ? enemy.dropItems : [];
    const cond =
      enemy && Array.isArray(enemy.conditionalDropItems)
        ? enemy.conditionalDropItems
        : [];
    const baseLen = base.length;

    const yStart = this.lineHeight();
    let y = yStart;

    const areaW = this.contents.width / 2 - stv_BeastBook_padding;

    // Divider + header
    this.contents.fillRect(0, y - 5, areaW, 1, this.normalColor());
    this.drawText(stv_BeastBook_dropsText, 0, 0);

    const bookEntry =
      window.$beastBook && $beastBook.beasts
        ? $beastBook.beasts[beastId]
        : null;
    const discovered = bookEntry ? bookEntry.discoveredItems : null;

    const drawUnknownLine = () => {
      this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
      this.drawText(stv_BeastBook_unknownData, 0, y, areaW, "left");
      this.changeTextColor(this.normalColor());
    };

    let drewAny = false;

    // Base drops (supports >3)
    for (let j = 0; j < baseLen; j++) {
      const di = base[j];
      if (!di || !di.kind || di.kind <= 0) continue;
      drewAny = true;

      const isKnown = discovered && discovered[j];
      if (isKnown) {
        const itemObj = Game_Enemy.prototype.itemObject(di.kind, di.dataId);
        const suffix = ": " + formatPercent(di.denominator);
        drawInlineSuffix.call(
          this,
          itemObj,
          y,
          areaW,
          suffix,
          stv_BeastBook_dropsSuccessColor,
        );
      } else {
        drawUnknownLine();
      }

      y += this.lineHeight();
    }

    // Conditional drops (rate dynamic)
    for (let c = 0; c < cond.length; c++) {
      const data = cond[c];
      const itemObj = data && data[0];
      if (!itemObj) continue;

      drewAny = true;

      const idx = baseLen + c;
      const isKnown = discovered && discovered[idx];

      if (isKnown) {
        drawInlineSuffix.call(
          this,
          itemObj,
          y,
          areaW,
          ": COND",
          stv_BeastBook_dropsSuccessColor,
        );
      } else {
        drawUnknownLine();
      }

      y += this.lineHeight();
    }

    if (!drewAny) {
      this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
      this.drawText(stv_BeastBook_noData, 0, y, areaW, "left");
      this.changeTextColor(this.normalColor());
    }

    this.resetTextColor();
  };
})();
