/*:
 * @plugindesc (v1.7) Fear Levels (YEP_X_StateCategories) - MOG_ATB + MOG_BattleCommands safe skip (forced action) + upgrade/replace
 * @author Faiz Syihab
 *
 * @help
 * State notetags (contoh Fear_II):
 *   <Category: fear>
 *   <Category: lv2>
 *
 * RULES:
 * - Upgrade/replace: Fear level lebih tinggi menghapus Fear level lebih rendah
 * - Block downgrade: Fear level lebih rendah tidak bisa menimpa level lebih tinggi
 * - Skip turn (MOG_ATB): saat battler mau diproses (ATB penuh), jika RNG sukses:
 *     -> bersihkan input selection dengan benar
 *     -> pakai forceAction skill dummy (agar action pipeline jalan, tidak merusak UI)
 *
 * SETUP WAJIB:
 * 1) Buat 1 SKILL dummy untuk skip, misalnya: "Fear Skip"
 *    - Scope: None (atau The User)
 *    - Damage: None
 *    - Effects: kosong
 *    - Occasion: Always / Battle Screen
 *    - Speed: 0
 *
 * 2) Isi ID skill dummy itu pada konfigurasi di bawah.
 */

(() => {
  "use strict";

  // --------------------
  // CONFIG
  // --------------------
  const CAT_FEAR = "FEAR";

  // Skill dummy yang dipakai untuk "skip" (WAJIB ada di database)
  // Boleh pakai ID 96 kalau kamu memang sudah punya skill dummy itu.
  const FEAR_SKIP_SKILL_ID = 96;

  // Cooldown ATB kecil setelah skip (biar nggak langsung full lagi)
  const FEAR_WAIT_ATB = 8;

  const SKIP_CHANCE_BY_LV = {
    1: 0.5,
    2: 0.55,
    3: 0.6,
    4: 0.65,
    5: 0.7,
    6: 0.75,
    7: 0.8,
    8: 0.85,
  };

  // Hard requirements
  if (!window.Imported || !Imported.MOG_ATB || !Imported.YEP_X_StateCategories)
    return;

  // --------------------
  // Helpers (YEP_X_StateCategories)
  // --------------------
  function hasCategory(state, catUpper) {
    return (
      state &&
      Array.isArray(state.category) &&
      state.category.contains(catUpper)
    );
  }

  function fearLevelOfState(state) {
    if (!state || !Array.isArray(state.category)) return 0;
    for (let i = 0; i < state.category.length; i++) {
      const c = String(state.category[i] || "")
        .trim()
        .toUpperCase();
      const m = c.match(/^LV(\d+)$/);
      if (m) {
        const lv = Number(m[1]);
        return Number.isFinite(lv) ? lv : 0;
      }
    }
    return 0;
  }

  function highestFearLevel(battler) {
    if (!battler || !battler.states) return 0;
    const sts = battler.states();
    let best = 0;
    for (let i = 0; i < sts.length; i++) {
      const st = sts[i];
      if (!st || !hasCategory(st, CAT_FEAR)) continue;
      const lv = fearLevelOfState(st);
      if (lv > best) best = lv;
    }
    return best;
  }

  function removeLowerFearStates(battler, newLv) {
    const sts = battler.states();
    for (let i = 0; i < sts.length; i++) {
      const st = sts[i];
      if (!st || !hasCategory(st, CAT_FEAR)) continue;
      const lv = fearLevelOfState(st);
      if (lv > 0 && lv < newLv) battler.removeState(st.id);
    }
  }

  function roll(p) {
    if (p <= 0) return false;
    if (p >= 1) return true;
    return Math.random() < p;
  }

  function canFearSkipNow(battler) {
    if (!battler || !battler.isAlive || !battler.isAlive()) return false;
    if (!$gameParty || !$gameParty.inBattle || !$gameParty.inBattle())
      return false;

    const lv = highestFearLevel(battler);
    if (lv <= 0) return false;

    const chance = Number(SKIP_CHANCE_BY_LV[lv]) || 0;
    return roll(chance);
  }

  // --------------------
  // (1) Upgrade/Replace Fear (by categories)
  // Hook di Game_Battler.addState (aman untuk MOG_ATB dan YEP_BSC)
  // --------------------
  const _addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    const st = $dataStates[stateId];
    if (!st || !hasCategory(st, CAT_FEAR)) {
      return _addState.call(this, stateId);
    }

    const newLv = fearLevelOfState(st);
    const curLv = highestFearLevel(this);

    // block downgrade
    if (curLv > 0 && newLv > 0 && curLv > newLv) return;

    _addState.call(this, stateId);

    // upgrade => hapus level bawah
    if (newLv > 0) removeLowerFearStates(this, newLv);
  };

  // --------------------
  // (2) SAFE SKIP untuk MOG_ATB + MOG_BattleCommands
  // Hook di BattleManager.prepareNextSubject_ATB (pintu utama ATB full) :contentReference[oaicite:3]{index=3}
  // --------------------
  const _prepareNextSubject_ATB = BattleManager.prepareNextSubject_ATB;
  BattleManager.prepareNextSubject_ATB = function (battler) {
    // Kalau battler mati, biarin alur MOG_ATB sendiri handle
    if (!battler || (battler.isDead && battler.isDead())) {
      return _prepareNextSubject_ATB.call(this, battler);
    }

    // FEAR SKIP TRIGGER
    if (canFearSkipNow(battler)) {
      // 1) Kalau battler sedang input (ini yang bikin "Attack" jadi nggak jalan),
      //    bersihkan selection dengan fungsi MOG_ATB yang memang disediakan :contentReference[oaicite:4]{index=4}
      if (this._atbBattlerInput && this._atbBattlerInput[0] === battler) {
        if (this.selectionComAtbClear) this.selectionComAtbClear();
      }

      // 2) Force Action skill dummy (mirip pola paralyze/disable di file kamu) :contentReference[oaicite:5]{index=5}
      battler.clearActions();
      battler.forceAction(FEAR_SKIP_SKILL_ID, -1);
      BattleManager.forceAction(battler);

      // 3) Reset ATB + wait kecil (endAction MOG_ATB juga clearATB, tapi ini aman sebagai fallback) :contentReference[oaicite:6]{index=6}
      if (battler.clearATB) battler.clearATB();
      battler._wait_atb = FEAR_WAIT_ATB;

      // Jangan lanjut proses normal battler jadi subject sekarang
      this._subject = null;
      this._atbBattler = null;
      return;
    }

    return _prepareNextSubject_ATB.call(this, battler);
  };
})();
