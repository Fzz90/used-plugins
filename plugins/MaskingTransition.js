//=============================================================================
// MaskingTransition.js
//=============================================================================

/*:
 * @plugindesc Mask transition with single mask.
 * @author Dr.Yami and Archeia
 *
 * @param transitionName
 * @desc The name of the mask you want to use.
 * @default 012-Random04
 *
 * @param transitionDuration
 * @desc The wait time (aka milliseconds or frames) for the animation.
 * @default 60
 *
 * @param transitionVariable
 * @desc Use a game variable to change the transition mask anytime.
 * @default 0
 *
 * @help
 * Make a folder. It should be like this: YourGameProject/img/transition.
 * Put Mask files in it. See RPG Maker VXAce's BattleStart or RMXP's Fogs/Masks.
 *
 */

var DrYami = DrYami || {};
DrYami.MKT = {};

(function () {
  var params = PluginManager.parameters("MaskingTransition");
  DrYami.MKT.transitionName = String(params.transitionName);
  DrYami.MKT.transitionDuration = Number(params.transitionDuration);
  DrYami.MKT.transitionVariable = Number(params.transitionVariable);

  ImageManager.loadTransition = function (filename, hue) {
    return this.loadBitmap("img/transition/", filename, hue, false);
  };

  var _createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function () {
    _createDisplayObjects.call(this);
    this.createMKTSprites();
  };

  Scene_Map.prototype.createMKTSprites = function () {
    var sprite = new Sprite();
    sprite.visible = false;
    sprite.opacity = 255;
    this._mktSprite = sprite;
    this.addChild(sprite);
  };

  Scene_Map.prototype.encounterEffectSpeed = function () {
    return DrYami.MKT.transitionDuration;
  };

  Scene_Map.prototype.startEncounterEffect = function () {
    var that = this;
    this._encounterEffectDuration = this.encounterEffectSpeed();
    this._prepareTransition = true;
    this._encounterEffectThreshold = 0;

    var bitmap = ImageManager.loadTransition(this.transitionName());
    var bitmap2 = new Bitmap(Graphics.width, Graphics.height);
    bitmap.addLoadListener(function () {
      that._prepareTransition = false;
      bitmap2.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0);
    });
    this._mktSprite.bitmap = bitmap2;
    this._mktSprite.visible = true;
    this._mktSprite.opacity = 0;
    this._mktSprite.blendMode = 2;

    // this.encounterEffectSpeed() * 1.8, false;
    var speed = this.encounterEffectSpeed();
    var n = speed - this._encounterEffectDuration - 3;
    if (n === Math.floor(speed / 2)) {
      BattleManager.playBattleBgm();
      this.startFadeOut(this.fadeSpeed());
    }

    // BattleManager.playBattleBgm();
  };

  Scene_Map.prototype.updateEncounterEffect = function () {
    if (this._prepareTransition) return;

    if (this._encounterEffectDuration > 0) {
      var bitmap = ImageManager.loadTransition(this.transitionName());
      this._encounterEffectDuration--;
      this._encounterEffectThreshold +=
        255 / (this.encounterEffectSpeed() - 255 / 16 - 1);
      this._mktSprite.bitmap.darkenPixels(this._encounterEffectThreshold, 16);
      this._mktSprite.opacity += 255 / 8;
    }
  };

  Scene_Map.prototype.transitionName = function () {
    var transitionName = String(
      $gameVariables.value(DrYami.MKT.transitionVariable)
    );
    if (transitionName === "" || transitionName === "0")
      transitionName = DrYami.MKT.transitionName;
    return transitionName;
  };

  SceneManager.snapForBackgroundNoBlur = function () {
    this._backgroundBitmap = this.snap();
  };

  Scene_Map.prototype.snapForBattleBackground = function () {
    this._windowLayer.visible = false;
    SceneManager.snapForBackgroundNoBlur();
    this._windowLayer.visible = true;
  };

  Bitmap.prototype.darkenPixels = function (threshold, strength) {
    var context = this._context;
    var imageData = context.getImageData(0, 0, this.width, this.height);
    var pixels = imageData.data;
    console.log(threshold);
    for (var i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > threshold) continue;
      pixels[i + 0] -= strength;
      pixels[i + 1] -= strength;
      pixels[i + 2] -= strength;
    }
    context.putImageData(imageData, 0, 0);
    this._setDirty();
  };
})();
