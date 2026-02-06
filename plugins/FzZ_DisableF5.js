/*:
 * @plugindesc Disable the f5 button when the game is started.
 *
 * @author FzZ
 *
 * @help
 *
 * There's nothing on this help file
 */

(function () {
  var alias = SceneManager.onKeyDown;
  SceneManager.onKeyDown = function (event) {
    if (event.keyCode !== 116) alias.call(this, event);
  };

  // _Graphics_defaultStretchMode_Alias = Graphics._defaultStretchMode;
  // Graphics._defaultStretchMode = function () {
  //   if (disable_F3 == true) {
  //     return true;
  //   } else {
  //     _Graphics_defaultStretchMode_Alias.call(this);
  //   }
  // };
})();
