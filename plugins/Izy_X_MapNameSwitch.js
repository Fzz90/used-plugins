//============================================================================
// Izy_X_MapNameSwitch.js
//----------------------------------------------------------------------------
// Give you more control with map/display name.
//============================================================================

var Izy_X_DN = {}
var Imported = Imported || {};
Imported.Izy_X_DN = true;
Imported.Izy_X_DN_name = "Izy's Map Name Switch";
Imported.Izy_X_DN_desc = "Give you more control with map/display name.";
Imported.Izy_X_DN_version = '1.00';
Imported.Izy_X_DN_author = 'Izyees Fariz';

var Izy_EvaCon = Izy_EvaCon || {};

/*:
 * @plugindesc v1.00 Give you more control with map/display name.
 * Izys library scripts.
 * @author Izyees Fariz
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * This script give you more control with map/display name.
 * Free for commercial and non-Commercial games.
 * Credit me as Izyees Fariz.
 *
 * ============================================================================
 * Notetags (Map)
 * ============================================================================
 * <displayoff>
 * - use to disable show name.
 * <displayname:x>
 * - this will change the display name to x.
 *
 * ============================================================================
 * Lunatic Mode - Notetags (Map)
 * ============================================================================
 * Put <customshow> and end with </customshow> to show hide map name display.
 * Define show as true/false.
 * If show is true, it will show map display name.
 *
 * Example:
 * <customshow>
 *   show = true;
 * </customshow>
 *
 *
 * Put <customname> and end with </customname> to show hide map name display.
 * Define name as map name.
 * This will change the map display name to name.
 *
 * Example:
 * <customname>
 *   name = 'Test Display Map Name';
 * </customname>
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * Version 1.00:
 * - Finished Plugin!
 */
 
//============================================================================
// Startin' Script.
//============================================================================

(function () {

	Izy_X_DN.alias = Window_MapName.prototype.open;
	Window_MapName.prototype.open = function () {
		var show = $dataMap.meta.displayoff ? false : true;
		eval(Izy_X_DN.searchBetweenNotetags('<customshow>', '</customshow>'));
		if (show) {
			Izy_X_DN.alias.apply(this);
		}
	};

	Izy_X_DN.aliasStart = Scene_Map.prototype.start;
	Scene_Map.prototype.start = function () {
		this.startIzyCode();
		Izy_X_DN.aliasStart.apply(this);
	};
	Scene_Map.prototype.startIzyCode = function () {
		var name = $dataMap.displayName;
		eval(Izy_X_DN.searchBetweenNotetags('<customname>', '</customname>'));
		$dataMap.displayName = name;
	};

	Izy_X_DN.searchBetweenNotetags = function (str1, str2) { //Run when the item is subtracted. Put in item, weapon, armor.
		var notes = $dataMap.note;
		var noteAry = notes.split('\n');
		var searchValue = true;
		var val = '';
		var code = {
			first : '',
			last : ''
		};
		for (sbn = 0; sbn < noteAry.length; sbn++) {
			if (searchValue) {
				if (noteAry[sbn].toLowerCase().contains(str1)) {
					code.first = sbn + 1;
					searchValue = false;
				}
			} else {
				if (noteAry[sbn].toLowerCase().contains(str2)) {
					code.last = sbn;
					for (sbn = code.first; sbn < code.last; sbn++) {
						val += '\n' + noteAry[sbn];
					}
					return val;
				}
			}
		}
		return '';
	};

})();

//============================================================================
// End Script.
//============================================================================
