/*:
 * @author Faiz Syihab
 * @plugindesc (v1.6) Scene_Item layout: keep YEP_ItemCore Help/Category/Status windows unchanged; NO gap between Category & Status; ADS only for Weapons/Armors; NO ADS animation; initial category fix; font size option for item names (non Weapon/Armor).
 *
 * @help
 * ============================================================================
 * EM_SceneItem_LayoutADS.js
 * ============================================================================
 * v1.6
 * - Added parameter: ItemNameFontSize_NoADS
 *   Changes ONLY item name font size in item list for categories where ADS is OFF
 *   (ex: Items and custom categories). Weapons/Armors keep default.
 *
 * v1.5
 * - Removed gap between Category and Status windows.
 *
 * v1.4
 * - Keeps Help/Category/Status windows EXACTLY as created by YEP_ItemCore.
 * - Only repositions those windows.
 * - ADS only for Weapons/Armors (and optional subtypes).
 * - ADS show/hide is instant (no open/close animation).
 * - Fixes initial category selection glitch.
 *
 * Requirements:
 * - YEP_ItemCore
 *
 * Recommended order (below all item-related YEP extensions):
 * - YEP_ItemCore
 * - YEP_X_ItemCategories
 * - YEP_X_AttachAugments
 * - YEP_X_ItemDurability
 * - YEP_X_ItemUpgradeSlots
 * - YEP_ItemSynthesis
 * - YEP_X_ItemDisassemble
 * - YEP_X_ItemRequirements
 * - EM_SceneItem_LayoutADS (this)
 * ============================================================================
 *
 * @param ListWidthWithADS
 * @type number
 * @min 360
 * @default 820
 * @desc Item list width when ADS is visible (right side reserved for ADS).
 *
 * @param ListColsNoADS
 * @type number
 * @min 1
 * @max 4
 * @default 3
 *
 * @param ListColsWithADS
 * @type number
 * @min 1
 * @max 3
 * @default 1
 *
 * @param ADSSymbols
 * @type string[]
 * @default ["weapon","armor","WType","AType"]
 * @desc Category symbols that enable ADS. Use ["weapon","armor"] for strict only.
 *
 * @param ItemNameFontSize_NoADS
 * @text Item Name Font Size (Non Weapon/Armor)
 * @type number
 * @min 0
 * @default 0
 * @desc Set font size for item names in Item List when ADS is OFF. 0 = use default.
 */

(() => {
  "use strict";

  if (!window.Imported || !Imported.YEP_ItemCore) {
    console.warn("EM_SceneItem_LayoutADS v1.6: YEP_ItemCore not found.");
    return;
  }

  const PLUGIN_NAME = "EM_SceneItem_LayoutADS";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const P = {
    listWAds: Number(params.ListWidthWithADS || 820),
    colsNoAds: Number(params.ListColsNoADS || 3),
    colsAds: Number(params.ListColsWithADS || 1),
    itemNameFontNoAds: Number(params.ItemNameFontSize_NoADS || 0),
    adsSymbols: (() => {
      try {
        return JSON.parse(params.ADSSymbols);
      } catch (e) {
        return ["weapon", "armor", "WType", "AType"];
      }
    })(),
  };

  const ADS_SET = new Set(P.adsSymbols.map((s) => String(s).toLowerCase()));
  const showAdsFor = (sym) => ADS_SET.has(String(sym || "").toLowerCase());
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // Resize only if rect changed
  function smartMove(win, x, y, w, h) {
    if (!win) return;
    const changed =
      win.x !== x || win.y !== y || win.width !== w || win.height !== h;
    if (!changed) return;
    win.move(x, y, w, h);
    if (win.createContents) win.createContents();
  }

  // Fix initial selection
  function ensureCategorySelected(scene) {
    const w = scene._categoryWindow;
    if (!w) return;
    if (typeof w.maxItems === "function" && w.maxItems() <= 0) return;

    const idx = typeof w.index === "function" ? w.index() : 0;
    if (idx < 0) w.select(0);

    const max = w.maxItems();
    const i2 = typeof w.index === "function" ? w.index() : 0;
    const safe = clamp(i2, 0, max - 1);
    if (safe !== i2) w.select(safe);
  }

  // Force list columns safely
  function setItemListCols(win, cols) {
    if (!win) return;

    if (!win._emColsPatched) {
      win._emColsPatched = true;
      const _maxCols = win.maxCols;
      win.maxCols = function () {
        if (this._emCols != null) return this._emCols;
        return _maxCols.call(this);
      };
    }

    win._emCols = clamp(Number(cols || 1), 1, 4);
    if (win.refresh) win.refresh();
  }

  // --------------------------------------------------------------------------
  // Core windows: keep YEP sizes/behavior, only reposition.
  // NO GAP: Status x = Category x + width.
  // --------------------------------------------------------------------------
  Scene_Item.prototype._emApplyLayout_CoreWindows = function () {
    const bw = Graphics.boxWidth;

    // Help: keep height as-is, but full width at top.
    if (this._helpWindow) {
      smartMove(this._helpWindow, 0, 0, bw, this._helpWindow.height);
    }

    const helpH = this._helpWindow ? this._helpWindow.height : 0;

    // Category: keep YEP width/height, under help.
    if (this._categoryWindow) {
      smartMove(
        this._categoryWindow,
        0,
        helpH,
        this._categoryWindow.width,
        this._categoryWindow.height,
      );
    }

    // Status: keep height as YEP, attach directly to category (no gap).
    if (this._statusWindow && this._categoryWindow) {
      const catW = this._categoryWindow.width;
      const x = catW; // <- NO GAP
      const w = Math.max(1, bw - x);
      smartMove(this._statusWindow, x, helpH, w, this._statusWindow.height);
    }
  };

  // --------------------------------------------------------------------------
  // Bottom row: list + ADS (info window)
  // --------------------------------------------------------------------------
  Scene_Item.prototype._emApplyLayout_Bottom = function () {
    if (!this._helpWindow || !this._categoryWindow) return;

    ensureCategorySelected(this);
    const idx =
      typeof this._categoryWindow.index === "function"
        ? this._categoryWindow.index()
        : 0;
    if (idx < 0) return;

    const bw = Graphics.boxWidth;
    const bh = Graphics.boxHeight;

    const topH = this._helpWindow.height + this._categoryWindow.height;
    const bottomY = topH;
    const bottomH = Math.max(1, bh - bottomY);

    const symbol = this._categoryWindow.currentSymbol();
    const showAds = showAdsFor(symbol);

    // Item list
    if (this._itemWindow) {
      let listW = bw;
      if (showAds) listW = clamp(P.listWAds, 360, bw - 240);

      smartMove(this._itemWindow, 0, bottomY, listW, bottomH);

      if (showAds) setItemListCols(this._itemWindow, P.colsAds);
      else setItemListCols(this._itemWindow, P.colsNoAds);
    }

    // ADS/Info window (YEP_ItemCore)
    if (this._infoWindow) {
      if (showAds) {
        const listW = this._itemWindow
          ? this._itemWindow.width
          : clamp(P.listWAds, 360, bw - 240);
        smartMove(
          this._infoWindow,
          listW,
          bottomY,
          Math.max(1, bw - listW),
          bottomH,
        );

        this._infoWindow.show();
        this._infoWindow.openness = 255; // NO animation
        if (this._infoWindow.deactivate) this._infoWindow.deactivate();
      } else {
        this._infoWindow.openness = 0; // NO animation
        this._infoWindow.hide();
      }

      if (this._infoWindow.refresh) this._infoWindow.refresh();
    }

    // Action window follows list Y (YEP)
    if (this._itemActionWindow && this._itemWindow) {
      this._itemActionWindow.y = this._itemWindow.y;
    }

    if (this._itemWindow && this._itemWindow.refresh)
      this._itemWindow.refresh();
  };

  // --------------------------------------------------------------------------
  // v1.6: Font size control for item names when ADS is OFF (non weapon/armor)
  // Applies only to item NAME drawing in the item list.
  // --------------------------------------------------------------------------
  (() => {
    if (!Window_ItemList) return;

    const _drawItemName = Window_ItemList.prototype.drawItemName;
    Window_ItemList.prototype.drawItemName = function (item, x, y, width) {
      const useCustom = P.itemNameFontNoAds > 0 && !showAdsFor(this._category); // ADS OFF categories only

      if (!useCustom) {
        return _drawItemName.call(this, item, x, y, width);
      }

      const prevSize = this.contents.fontSize;
      this.contents.fontSize = P.itemNameFontNoAds;

      _drawItemName.call(this, item, x, y, width);

      this.contents.fontSize = prevSize;
    };
  })();

  // --------------------------------------------------------------------------
  // Hooks
  // --------------------------------------------------------------------------
  const _Scene_Item_create = Scene_Item.prototype.create;
  Scene_Item.prototype.create = function () {
    _Scene_Item_create.call(this);
    this._emLayoutReady = false;
    this._emLastCategorySymbol = null;
  };

  const _Scene_Item_start = Scene_Item.prototype.start;
  Scene_Item.prototype.start = function () {
    _Scene_Item_start.call(this);

    ensureCategorySelected(this);
    this._emApplyLayout_CoreWindows();
    this._emApplyLayout_Bottom();

    this._emLastCategorySymbol = this._categoryWindow
      ? this._categoryWindow.currentSymbol()
      : null;
    this._emLayoutReady = true;
  };

  const _Scene_Item_update = Scene_Item.prototype.update;
  Scene_Item.prototype.update = function () {
    _Scene_Item_update.call(this);
    if (!this._emLayoutReady) return;
    if (!this._categoryWindow) return;

    const sym = this._categoryWindow.currentSymbol();
    if (sym !== this._emLastCategorySymbol) {
      this._emLastCategorySymbol = sym;
      this._emApplyLayout_CoreWindows();
      this._emApplyLayout_Bottom();
    }
  };
})();
