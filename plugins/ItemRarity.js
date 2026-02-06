/*:
 *
 * Item Rarity by Yuuta Kirishima / Dexter
 * License: Feel Free to use in commercial and non-commercial projects.
 * @plugindesc Add visual representation of an item's rarity.
 * @author Yuuta Kirishima / Dexter / Persia Indie Studios
 *
 * @param Rarity In Description
 * @desc Toggle true or false, when true the rarity of the item will show in the description
 * @default true
 *
 * @param Rarity 1
 * @desc Enter the properties in this order: name, color, font (Font is optional)
 * @default Common, #ffffff
 *
 * @param Rarity 2
 * @desc Enter the properties in this order: name, color, font (Font is optional)
 * @default Uncommon, #eff2f7
 *
 * @param Rarity 3
 * @desc Enter the properties in this order: name, color, font (Font is optional)
 * @default Rare, #2f74e2, AppleGothic
 *
 * @param Rarity 4
 * @desc Enter the properties in this order: name, color, font (Font is optional)
 * @default Ultra-Rare, #ff33cc, AppleGothic
 *
 * @param Rarity 5
 * @desc Enter the properties in this order: name, color, font (Font is optional)
 * @default Legendary, #ffca2b, AppleGothic
 *
 * @param Rarity 6
 * @desc Enter the properties in this order: name, color, font (Font is optional)
 * @default Custom,#ffffff
 *
 * @param Rarity 7
 * @desc Enter the properties in this order: name, color, font (Font is optional)
 * @default Custom, #ffffff
 *
 * @param Rarity 8
 * @desc Enter the properties in this order: name, color, font (Font is optional)
 * @default Custom, #ffffff
 */
(function () {
  var parameters = PluginManager.parameters("ItemRarity");
  var Rarity_One = parameters["Rarity 1"].split(/\s*,\s*/).filter(function (value) {
    return !!value;
  });
  var Rarity_Two = parameters["Rarity 2"].split(/\s*,\s*/).filter(function (value) {
    return !!value;
  });
  var Rarity_Three = parameters["Rarity 3"].split(/\s*,\s*/).filter(function (value) {
    return !!value;
  });
  var Rarity_Four = parameters["Rarity 4"].split(/\s*,\s*/).filter(function (value) {
    return !!value;
  });
  var Rarity_Five = parameters["Rarity 5"].split(/\s*,\s*/).filter(function (value) {
    return !!value;
  });
  var Rarity_Six = parameters["Rarity 6"].split(/\s*,\s*/).filter(function (value) {
    return !!value;
  });
  var Rarity_Seven = parameters["Rarity 7"].split(/\s*,\s*/).filter(function (value) {
    return !!value;
  });
  var Rarity_Eight = parameters["Rarity 8"].split(/\s*,\s*/).filter(function (value) {
    return !!value;
  });
  var Desc_Toggle = String(parameters["Rarity In Description"]);

  var _drawItemName_ = Window_Base.prototype.drawItemName;
  Window_Base.prototype.drawItemName = function (item, x, y, width) {
    _drawItemName_.call(this);
    width = width || 312;
    if (item) {
      var iconBoxWidth = Window_Base._iconWidth + 4;
      switch (parseInt(item.meta.Rarity)) {
        case 1:
          this.contents.fontFace = Rarity_One[2] || this.standardFontFace();
          this.changeTextColor(Rarity_One[1]);
          break;
        case 2:
          this.contents.fontFace = Rarity_Two[2] || this.standardFontFace();
          this.changeTextColor(Rarity_Two[1]);
          break;
        case 3:
          this.contents.fontFace = Rarity_Three[2] || this.standardFontFace();
          this.changeTextColor(Rarity_Three[1]);
          break;
        case 4:
          this.contents.fontFace = Rarity_Four[2] || this.standardFontFace();
          this.changeTextColor(Rarity_Four[1]);
          break;
        case 5:
          this.contents.fontFace = Rarity_Five[2] || this.standardFontFace();
          this.changeTextColor(Rarity_Five[1]);
          break;
        case 6:
          this.contents.fontFace = Rarity_Six[2] || this.standardFontFace();
          this.changeTextColor(Rarity_Six[1]);
          break;
        case 7:
          this.contents.fontFace = Rarity_Seven[2] || this.standardFontFace();
          this.changeTextColor(Rarity_Seven[1]);
          break;
        case 8:
          this.contents.fontFace = Rarity_Eight[2] || this.standardFontFace();
          this.changeTextColor(Rarity_Eight[1]);
          break;
      }

      this.drawIcon(item.iconIndex, x + 2, y + 2);
      this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
      this.resetFontSettings();
    }
  };

  var __setItem = Window_Help.prototype.setItem;
  Window_Help.prototype.setItem = function (item) {
    __setItem.call(this);
    var Rarity_Name;
    var final;
    if (item) {
      switch (parseInt(item.meta.Rarity)) {
        case 1:
          Rarity_Name = Rarity_One[0];
          break;
        case 2:
          Rarity_Name = Rarity_Two[0];
          break;
        case 3:
          Rarity_Name = Rarity_Three[0];
          break;
        case 4:
          Rarity_Name = Rarity_Four[0];
          break;
        case 5:
          Rarity_Name = Rarity_Five[0];
          break;
        case 6:
          Rarity_Name = Rarity_Six[0];
          break;
        case 7:
          Rarity_Name = Rarity_Seven[0];
          break;
        case 8:
          Rarity_Name = Rarity_Eight[0];
          break;
      }

      if (Desc_Toggle == "true") {
        final = Rarity_Name + ": " + item.description;
      } else {
        final = item.description;
      }
      this.setText(item ? final : "");
    }
  };
})();
