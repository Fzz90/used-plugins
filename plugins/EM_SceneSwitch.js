//=============================================================================
// EM_SceneSwitch.js
//=============================================================================

/*:
 * @plugindesc v1.1.0 Mengaktifkan switch tertentu saat berada di Scene_Map
 * atau Scene_Menu. Menonaktifkan di scene lainnya.
 * @author Faiz Syihab (Freeze Inc.)
 *
 * @param Switch ID
 * @type switch
 * @desc Switch yang ON saat di Scene_Map / Scene_Menu / Scene_Options.
 * @default 128
 *
 * @help
 * ============================================================================
 * EM_SceneSwitch.js - Multi-Scene Switch
 * ============================================================================
 * Mengatur switch secara otomatis berdasarkan scene yang sedang aktif:
 *
 *   Switch ON  → Scene_Map, Scene_Menu
 *   Switch OFF → semua scene lainnya (battle, title, options, gameover, dll.)
 *
 * ============================================================================
 * Cara Penggunaan
 * ============================================================================
 * 1. Taruh file ini di folder js/plugins/
 * 2. Aktifkan di Plugin Manager
 * 3. Atur parameter "Switch ID" sesuai kebutuhan (default: 128)
 *
 * ============================================================================
 * Kompatibilitas
 * ============================================================================
 * - Kompatibel dengan YEP Suite (Parts 1–8), MOG ATB/Battle HUD stack.
 * - Letakkan plugin ini di posisi manapun dalam plugin list.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * v1.1.0 - Removed Scene_Options from active scene list.
 * v1.0.0 - Initial release.
 */

(function() {
    'use strict';

    //=========================================================================
    // Parameters
    //=========================================================================
    var parameters = PluginManager.parameters('EM_SceneSwitch');
    var SWITCH_ID  = parseInt(parameters['Switch ID'] || 128, 10);

    //=========================================================================
    // Daftar scene yang mengaktifkan switch
    //=========================================================================
    var ACTIVE_SCENES = [Scene_Map, Scene_Menu];

    //=========================================================================
    // Utility: cek apakah scene saat ini termasuk scene yang diizinkan
    //=========================================================================
    function updateSwitch() {
        if (!$gameSwitches) return;
        var current = SceneManager._scene;
        var isActive = ACTIVE_SCENES.some(function(SceneClass) {
            return current instanceof SceneClass;
        });
        $gameSwitches.setValue(SWITCH_ID, isActive);
    }

    //=========================================================================
    // Hook SceneManager.goto & push & pop
    // Menangkap semua jenis transisi scene
    //=========================================================================
    var _goto = SceneManager.goto;
    SceneManager.goto = function(sceneClass) {
        _goto.call(this, sceneClass);
        updateSwitch();
    };

    var _push = SceneManager.push;
    SceneManager.push = function(sceneClass) {
        _push.call(this, sceneClass);
        updateSwitch();
    };

    var _pop = SceneManager.pop;
    SceneManager.pop = function() {
        _pop.call(this);
        updateSwitch();
    };

    //=========================================================================
    // Hook tiap scene yang relevan — start & terminate sebagai safety net
    //=========================================================================

    // --- Scene_Map ---
    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        updateSwitch();
    };
    var _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        _Scene_Map_terminate.call(this);
        updateSwitch();
    };

    // --- Scene_Menu ---
    var _Scene_Menu_start = Scene_Menu.prototype.start;
    Scene_Menu.prototype.start = function() {
        _Scene_Menu_start.call(this);
        updateSwitch();
    };
    var _Scene_Menu_terminate = Scene_Menu.prototype.terminate;
    Scene_Menu.prototype.terminate = function() {
        _Scene_Menu_terminate.call(this);
        updateSwitch();
    };


})();
