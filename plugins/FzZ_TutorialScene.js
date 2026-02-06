//=============================================================================
// FzZ_TutorialScene.js
//=============================================================================

/*:
 * @plugindesc (v1.1) Add the Tutorial Button in title screen
 * @author Fzz
 *
 * @param Command Name
 * @desc Command Name that appears in title screen
 * @default Button Tutorial
 *
 * @help
 * =============================================================================
 * [][][] FzZ - TutorialScene (v1.0) [][][]
 * By FzZ
 * =============================================================================
 * Add the Tutorial Button in title screen
 *
 * =============================================================================
 * Utilization
 * =============================================================================
 * Put The Image in (img/system)
 *
 * MOBILEtutorial.png
 *
 * =============================================================================
 * CHANGELOG
 * =============================================================================
 * (v1.0) - Finished Plugin
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================

var Imported = Imported || {};
Imported.FzZ_TutorialScene = true;
var FzZ = FzZ || {};

FzZ.parameters = PluginManager.parameters("FzZ_TutorialScene");
FzZ.tutorial_scene = String(FzZ.parameters["Command Name"] || "Button Tutorial");

var _fzz_tutorial_scene = Window_TitleCommand.prototype.makeCommandList;
Window_TitleCommand.prototype.makeCommandList = function () {
  _fzz_tutorial_scene.call(this);
  this.addCommand(String(FzZ.tutorial_scene), "buttonTutorial");
};

//---------------------------------------------------------------------------
// ** Scene Tittle
//---------------------------------------------------------------------------

//==============================
// * create Command Window
//==============================
var _fzz_tutorial_createCommandWindow = Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow = function () {
  _fzz_tutorial_createCommandWindow.call(this);
  this._commandWindow.setHandler("buttonTutorial", this.tutorialCommand.bind(this));
};

//---------------------------------------------------------------------------
// * command Tutorials
//---------------------------------------------------------------------------
Scene_Title.prototype.tutorialCommand = function () {
  this._commandWindow.close();
  SceneManager.push(Scene_Tutorial);
};

//---------------------------------------------------------------------------
// * create Command
//---------------------------------------------------------------------------
function Scene_Tutorial() {
  this.initialize.apply(this, arguments);
}

Scene_Tutorial.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Tutorial.prototype.constructor = Scene_Tutorial;

//---------------------------------------------------------------------------
// * initializing
//---------------------------------------------------------------------------
Scene_Tutorial.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this);
};

//---------------------------------------------------------------------------
// * Create Scene
//---------------------------------------------------------------------------
Scene_Tutorial.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this);
  this.createTutorialScene();
};

//---------------------------------------------------------------------------
// * Load Scene
//---------------------------------------------------------------------------
Scene_Tutorial.prototype.createTutorialScene = function () {
  this.pictureTutorial = [];
  this.pictureTutorial[0] = new Sprite(ImageManager.loadSystem("MOBILEtutorial"));
  this.addChild(this.pictureTutorial[0]);
};

//---------------------------------------------------------------------------
// * Press Any Key
//---------------------------------------------------------------------------
Scene_Tutorial.prototype.pressAnyKey = function () {
  if (TouchInput.isTriggered()) {
    return true;
  }
  if (TouchInput.isCancelled()) {
    return true;
  }
  if (Input.isTriggered("ok")) {
    return true;
  }
  if (Input.isTriggered("cancel")) {
    return true;
  }
  return false;
};

//---------------------------------------------------------------------------
// * Update
//---------------------------------------------------------------------------
Scene_Tutorial.prototype.update = function () {
  Scene_MenuBase.prototype.update.call(this);
  if (this.pressAnyKey()) {
    SoundManager.playCursor();
    SceneManager.pop();
  }
};
