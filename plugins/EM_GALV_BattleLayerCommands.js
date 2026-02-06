/*:
 * @plugindesc (v1.0.0) Add Plugin Commands for Galv's Layer Graphics Battle Layers (BLAYER). ES6.
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_GALV_BattleLayerCommands.js
 * ============================================================================
 * Requires:
 * - GALV_LayerGraphics.js
 *
 * This add-on lets you control Galv battle layers using Plugin Commands
 * (instead of Script Calls).
 *
 * Battle layers use images from:
 *   /img/layers/
 *
 * --------------------------------------------------------------------------
 * Plugin Commands
 * --------------------------------------------------------------------------
 * BLAYER ID GRAPHIC XSPEED YSPEED OPACITY Z BLEND
 *
 * Z levels (Galv battle layers):
 *   0 - behind all
 *   1 - between battleback 1 and 2
 *   2 - over battlebacks but under characters
 *   3 - over all characters
 *
 * Examples:
 *   BLAYER 1 fog 1 0 180 2 1
 *   BLAYER 2 sparks 0 -1 140 3 0
 *
 * Remove:
 *   BLAYER REMOVE ID
 *   BLAYER REMOVE ALL
 *
 * Refresh (rebuild sprites in current scene if possible):
 *   BLAYER REFRESH
 *
 * Variables:
 * - For numeric fields you can use vX (like Galv's map layers):
 *   BLAYER 1 fog v1 0 v2 2 1
 *
 * Notes:
 * - Battle layers persist across battles until removed/changed (Galv behavior).
 * - If called outside battle, it still updates $gameSystem._bLayers, so the
 *   next battle will use it.
 * ============================================================================
 */

(() => {
  "use strict";

  // Hard guard
  if (!window.Imported || !Imported.Galv_LayerGraphics) return;
  if (!window.Galv || !Galv.LG || !Galv.pCmd) return;

  // Numeric parser compatible with Galv "vX" syntax
  const num = (txt) => {
    if (txt == null) return 0;
    const s = String(txt);
    if (s[0] === "v") {
      const varId = Number(s.slice(1));
      return $gameVariables.value(varId);
    }
    return Number(s);
  };

  const canRefreshSceneLayers = () => {
    const scene = SceneManager && SceneManager._scene;
    return (
      scene &&
      scene._spriteset &&
      typeof scene._spriteset.createLayerGraphics === "function"
    );
  };

  const refreshNow = () => {
    if (canRefreshSceneLayers()) {
      SceneManager._scene._spriteset.createLayerGraphics();
      return true;
    }
    return false;
  };

  // --------------------------------------------------------------------------
  // Plugin Command: BLAYER
  // --------------------------------------------------------------------------
  Galv.pCmd.BLAYER = function (args) {
    if (!args || args.length === 0) return;

    const mode = String(args[0]).toUpperCase();

    // BLAYER REFRESH
    if (mode === "REFRESH") {
      refreshNow();
      return;
    }

    // BLAYER REMOVE ID  | BLAYER REMOVE ALL
    if (mode === "REMOVE") {
      const sub = args[1] != null ? String(args[1]).toUpperCase() : "";
      if (sub === "ALL") {
        $gameSystem._bLayers = {};
      } else {
        const id = num(args[1]);
        if (id > 0 && $gameSystem._bLayers && $gameSystem._bLayers[id]) {
          delete $gameSystem._bLayers[id];
        }
      }
      refreshNow();
      return;
    }

    // BLAYER ID GRAPHIC XSPEED YSPEED OPACITY Z BLEND
    // args: 0=id, 1=graphic, 2=xspeed, 3=yspeed, 4=opacity, 5=z, 6=blend
    const id = num(args[0]);
    const graphic = String(args[1] || "");

    if (id <= 0) return;

    // If no graphic provided, treat as remove (quality-of-life)
    if (!graphic) {
      if ($gameSystem._bLayers && $gameSystem._bLayers[id])
        delete $gameSystem._bLayers[id];
      refreshNow();
      return;
    }

    const xspeed = num(args[2]);
    const yspeed = num(args[3]);
    const opacity = num(args[4]);
    const z = num(args[5]);
    const blend = num(args[6]);

    // Use Galv's native API so internal structure remains consistent.
    Galv.LG.bLayer(id, graphic, xspeed, yspeed, opacity, z, blend);

    // If already in battle (or any scene with spriteset layers), rebuild now
    refreshNow();
  };
})();
