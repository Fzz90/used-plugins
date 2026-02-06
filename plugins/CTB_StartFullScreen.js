/*=============================================================================
 * CTB StartFullScreen
 * By CT_Bolt
 * CTB_StartFullScreen.js
 * Version: 1.0
 * Terms of Use:
 *   Must purchase a licence to use.
 *   No filesharing permited unless prior agreement made with author.
 *
 *  Copyright [2020] [N. Giem] (Aka. CT_Bolt)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
/*=============================================================================*/
var CTB = CTB || {};
CTB.StartFullScreen = CTB.StartFullScreen || {};
var Imported = Imported || {};
Imported["CT_Bolt StartFullScreen"] = 1.0;
//=============================================================================

/*:
 *
 * @plugindesc CT_Bolt's Start FullScreen Plugin v1.0
 * @author CT_Bolt
 *
 * @param Stretch
 * @type boolean
 * @desc Stretch Screen
 * Note: This is an eval statement.
 * @default true
 *
 * @help
 * CT_Bolt's Start FullScreen Plugin
 * Version 1.0
 * CT_Bolt
 *
 * ***************** Description **********************
 * Able to start in full screen
 *
 * History Log:
 *   Version 1.0 (2/2/2020)
 *
 */

//=============================================================================
//=============================================================================
("use strict");
(function ($) {
  function getPluginParameters() {
    var a =
      document.currentScript ||
      (function () {
        var b = document.getElementsByTagName("script");
        return b[b.length - 1];
      })();
    return PluginManager.parameters(
      a.src.substring(a.src.lastIndexOf("/") + 1, a.src.indexOf(".js"))
    );
  }
  $.Param = getPluginParameters();
  var _sb_start_ctb_fullsceen = Scene_Boot.prototype.start;

  Scene_Boot.prototype.start = function () {
    _sb_start_ctb_fullsceen.call(this);
    Graphics.forceFullscreen(eval($.Param["Stretch"]));
  };

  Graphics.forceFullscreen = function (v) {
    this._switchFullScreen();
    if (!v) this._switchStretchMode();
  };
})(CTB.StartFullScreen);
