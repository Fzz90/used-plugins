/*:
 * @plugindesc <ActionSequenceImpact> for RPG Maker MV version 1.6.2.
 * @author RPG Maker Irina
 *
 * @help
 * *** Introduction ***
 *
 *      This plugin adds new Action Sequences to Yanfly's Battle Engine Core
 * (so make sure you have that plugin and the Action Sequence Packs installed)
 * to add a couple of new effects such as balloons, move adjustments, easings,
 * projectiles, and if you have Olivia's Battle Impact plugin, the special
 * impact effects, too!
 *
 *
 *
 * *** Plugin Parameters ***
 *
 * Radian Adjustments
 *
 *      These are used for projectile Action Sequences. If a projectile is
 * angled, then the "arrow head" will be the upper left corner of the icon and
 * the lower left corner of an animation. These are the default values. If your
 * icons or animations are made differently, you can adjust the radians to your
 * liking. If you want to know how to convert degrees to radians, use this math
 * formula below:
 *
 *      radians = degree * (Pi / 180)
 *
 *      This is left as a constant for all projectiles to keep the math done
 * properly during its calculation mid-Action Sequence.
 *
 *
 *
 * *** Instructions ***
 *
 *      As mentioned before in the introduction, this plugin adds new Action
 * Sequences to Yanfly's Battle Engine Core. If you don't have those plugins,
 * you can download them for free from here:
 *
 * http://yanfly.moe/2015/10/10/yep-3-battle-engine-core/
 * http://yanfly.moe/2015/10/11/yep-4-action-sequence-pack-1/
 * http://yanfly.moe/2015/10/12/yep-5-action-sequence-pack-2/
 * http://yanfly.moe/2015/10/12/yep-6-action-sequence-pack-3/
 *
 *      Some of the action sequences added in this pack also require Olivia's
 * Battle Impact plugin to use, but those are optional. If you can get Olivia's
 * plugin here:
 *
 * https://fallenangelolivia.itch.io/battle-impact
 *
 *      After that, you could use the Acton Sequences in the sections below.
 *
 *
 *
 * *** Action Sequences: Prev Target, Next Target ***
 *
 *      Before I begin on the Action Sequences, I want to say there's two new
 * additions to the targeting mechanism. You know the parts where you put in
 * "user" or "targets"? Now, during the <Target Actions> phase, you can use
 * either "Prev Target" or "Next Target" to grab either the previous one or the
 * next target in the list.
 *
 *
 *
 * *** Action Sequences: New Stuff ***
 *
 * This part of the document will now be formatted like Yanfly's Action Seq
 * help file to bring about a sense of familiarity.
 *
 *=============================================================================
 * BALLOON type: targets
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Plays a balloon emote that you normally see on the map scene but in battle
 * instead. For types, replace that word with any of the following:
 *
 *      !
 *      Exclamation
 *
 *      ?
 *      Question
 *
 *      Music
 *      Note
 *      Music Note
 *
 *      Heart
 *
 *      Anger
 *      Pissed
 *
 *      Sweat
 *
 *      Cobweb
 *
 *      Silence
 *      ...
 *
 *      Lightbulb
 *      Idea
 *
 *      zzz
 *      Sleep
 *
 *      User-Defined 1
 *      User-Defined 2
 *      User-Defined 3
 *      User-Defined 4
 *      User-Defined 5
 *      User1
 *      User2
 *      User3
 *      User4
 *      User5
 *
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: balloon heart: user
 *                balloon !: target
 *=============================================================================
 *
 *=============================================================================
 * MOVE TYPE: target, easing
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Changes the way the target moves (until the end of the skill/item is done)
 * using easing. Replace 'easing' with any of the following:
 *
 *      Linear ......... No easing, no acceleration
 *
 *      InSine ......... Slight acceleration from zero to full speed
 *      OutSine ........ Slight deceleration at the end
 *      InOutSine ...... Slight accel. at beginning and slight decel. at end
 *
 *      InQuad ......... LV2 Accelerating from zero velocity
 *      OutQuad ........ LV2 Decelerating to zero velocity
 *      InOutQuad ...... LV2 Acceleration until halfway, then deceleration
 *
 *      InCubic ........ LV3 Accelerating from zero velocity
 *      OutCubic ....... LV3 Decelerating to zero velocity
 *      InOutCubic ..... LV3 Acceleration until halfway, then deceleration
 *
 *      InQuart ........ LV4 Accelerating from zero velocity
 *      OutQuart ....... LV4 Decelerating to zero velocity
 *      InOutQuart ..... LV4 Acceleration until halfway, then deceleration
 *
 *      InQuint ........ LV5 Accelerating from zero velocity
 *      OutQuint ....... LV5 Decelerating to zero velocity
 *      InOutQuint ..... LV5 Acceleration until halfway, then deceleration
 *
 *      InExpo ......... Accelerate exponentially until finish
 *      OutExpo ........ Initial exponential acceleration slowing to stop
 *      InOutExpo ...... Exponential acceleration and deceleration
 *
 *      InCirc ......... Increasing velocity until stop
 *      OutCirc ........ Start fast, decreasing velocity until stop
 *      InOutCirc ...... Fast increase in velocity, fast decrease in velocity
 *
 *      InBack ......... Slow movement backwards then fast snap to finish
 *      OutBack ........ Fast snap to backwards point then slow to finish
 *      InOutBack ...... Back In, then Back Out
 *
 *      InElastic ...... Bounces slowly then quickly to finish
 *      OutElastic ..... Fast acceleration, bounces to zero
 *      InOutElastic ... Slow start and end, two bounces sandwich a fast motion
 *
 *      InBounce ....... Bounce increasing in velocity until completion
 *      OutBounce ...... Bounce to completion
 *      InOutBounce .... Bounce in and bounce out
 *
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: move type: user, InOutBack
 *                move type: target, OutBounce
 *=============================================================================
 *
 *=============================================================================
 * MOVE target OFFSET: +X, +Y
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Use this after a Move Action Sequence. This lets you adjust the movement
 * location goal of the target by +x and +y. You can use negative numbers, too.
 * A positive number will mean further past the goal. A negative number means
 * before the goal. This is done this way to not have absolutes making tricky
 * calculations depending on which way the battler is facing
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: move user offset: +100, +0
 *                move target offset: -50, +25
 *=============================================================================
 *
 *=============================================================================
 * PROJECTILE ICON id: START x y, GOAL x y
 * PROJECTILE ICON id: START target, GOAL target
 *
 * PROJECTILE ANI id: START x y, GOAL x y
 * PROJECTILE ANI id: START target, GOAL target
 * PROJECTILE ANIMATION id: START x y, GOAL x y
 * PROJECTILE ANIMATION id: START target, GOAL target
 *
 * (optional parameters)
 * DURATION d
 * ARC a
 * EASE type
 * SPIN s
 * ICON SCALE i
 * ANGLE
 * START OFFSET +x +y
 * START OFFSET -x -y
 * GOAL OFFSET +x +y
 * GOAL OFFSET -x -y
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Replace id with either the icon index or the battle animation graphic you
 * want to use with the projectile. Choose a starting X and Y position or link
 * it to a target. Then choose a goal X and Y position or link that to a target
 * too. The rest of the parameters are optional and can be used in any order
 * you want, but I'll go through each of them.
 *
 * If the starting targets have more than one member in them, projectiles will
 * be spawned from each target as a source. If the goal targets have more than
 * one member, projectiles will be made for each target. This means for each
 * source and each goal, a projectile will be made.
 *
 * Duration: replace the d with the number of frames of duration. Default: 20
 * Arc: replace the a with the maximum arc height in pixels
 * Ease: replace type with an easing type from the Move Type list above
 * Spin: replace s with how fast you want the projectile to spin.
 * Icon Scale: replce i with the scale you want to increase your icons by
 * Angle: If you want the projectile to "arrow head" towards its goal, use this
 * Start Offset: lets you adjust the x and y offset of the starting position
 * Goal Offset: lets you adjust the x and y offset of the goal position
 *
 * You can use as many projectiles on the screen at once as you want.
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: projectile icon 161: start user, goal target
 *                projectile ani 71: start user, goal target
 *
 * projectile icon 176: duration 60, arc 300, spin 1.5
 * projectile ani 71: duration 60, arc 50, ease InOutBack, angle
 *=============================================================================
 *
 *=============================================================================
 * WAIT FOR PROJECTILE
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Waits for all the projectiles on the screen to reach their targets before
 * moving on with the rest of the Action Sequence list.
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: wait for projectile
 *=============================================================================
 *
 *=============================================================================
 * AFTERGLOW target
 *
 * (optional parameters)
 * SCALE s
 * BRIGHTNESS b
 * DURATION d
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * (requires Olivia's Battle Impact plugin)
 * Makes an afterglow effect on the target.
 *
 * Scale: replace s with the scale of the glow.
 * Brightness: replace b with how bright the effect is.
 * Duration: replace d with the duration of the effect in frames.
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: afterglow user
 *                afterglow target: scale 1.5
 *                afterglow target: brightness 2
 *                afterglow user: duration 20
 *                afterglow user: scale 2, brightness 4, duration 60
 *=============================================================================
 *
 *=============================================================================
 * APPLY ICON id: target
 * REMOVE ICON id: target
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * (requires Olivia's Battle Impact plugin)
 * Apply/Remove icon effect for the target. Replace id with an icon index.
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: Apply Icon 2: target
 *                Remove Icon 1: user
 *=============================================================================
 *
 *=============================================================================
 * COLOR BREAK
 *
 * (optional parameters)
 * INTENSITY i
 * DURATION d
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * (requires Olivia's Battle Impact plugin)
 * Makes the colors on the screen break up before coming back together.
 *
 * Intensity: Replace i with the intensity level of the break effect.
 * Duration: Replace d with the duration of the effect in frames.
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: color break
 *                color break: intensity 30
 *                color break: duration 20
 *                color break: intensity 60, duration 10
 *=============================================================================
 *
 *=============================================================================
 * MOTION BLUR target
 *
 * (optional parameters)
 * VELOCITY x y
 * OFFSET o
 * DURATION d
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * (requires Olivia's Battle Impact plugin)
 * Makes a motion blur effect on the target before dissolving.
 *
 * Velocity: Replace x and y with the horizontal and vertical velocity power.
 * Offset: Replace o to determine how much to offset this effect by.
 * Duration: Replace d with the duration of the effect in frames.
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: motion blur user
 *                motion blur target: velocity 30 60
 *                motion blur target: offset 10
 *                motion blur target: duration 20
 *                motion blur user: velocity 40 40, offset 100, duration 60
 *=============================================================================
 *
 *=============================================================================
 * SHOCKWAVE: CENTER x y
 * SHOCKWAVE: CENTER target
 *
 * (optional parameters)
 * AMPLITUDE a
 * WAVELENGTH w
 * SPEED s
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * (requires Olivia's Battle Impact plugin)
 * Makes a shockwave at either X, Y coordinates or at a target's center.
 *
 * Amplitude: Replace a with how powerful you want the amplitude to be.
 * Wavelength: Replace w with how big the wavelengths are.
 * Speed: Replace s with how fast it is. Use a number between 0 and 1.
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: shockwave: center 300 400
 *           shockwave: center target
 *           shockwave: center target, amplitude 30
 *           shockwave: center target, wavelength 160
 *           shockwave: center user, speed 0.2
 *           shockwave: center user, amplitude 20, wavelength 120, speed 0.1
 *=============================================================================
 *
 *
 *
 * *** RPG Maker Version ***
 *
 * This plugin is made for and tested on RPG Maker MV with version 1.6.2.
 * I cannot guarantee if it works on lower versions.
 *
 *
 *
 * *** Terms of Use ***
 *
 * 1. These plugins may be used in free or commercial games.
 * 2. 'RPG Maker Irina' must be given credit in your games.
 * 3. You are allowed to edit the code.
 * 4. Do NOT change the filename, parameters, and information of the plugin.
 * 5. You are NOT allowed to redistribute these Plugins.
 * 6. You may NOT take code for your own released Plugins.
 *
 * *** Help End ***
 *
 * @param
 *
 * @param RadianAdjustments
 * @text Radian Adjustments
 *
 * @param RadianIconAdjustment
 * @text Icons
 * @parent RadianAdjustments
 * @desc Radian adjustment for icons
 * @default 2.35619
 *
 * @param RadianAnimationAdjustment
 * @text Animations
 * @parent RadianAdjustments
 * @desc Radian adjustment for icons
 * @default 3.92699
 *
 * @param
 *
 */
//=============================================================================

var parameters = $plugins.filter(function (t) {
  return t.description.contains("<ActionSequenceImpact>");
})[0].parameters;
var Imported = Imported || {};
Imported.Irina_ActionSequenceImpact = {
  RadianIconAdjustment: Number(parameters["RadianIconAdjustment"] || 0),
  RadianAnimationAdjustment: Number(parameters["RadianAnimationAdjustment"] || 0),
};
if (!Imported.YEP_BattleEngineCore) {
  alert("Irina_ActionSequenceImpact plugin requires YEP_BattleEngineCore plugin installed.");
  SceneManager.exit();
}
BattleManager.applyEasing = function (t, e) {
  var e = e.toUpperCase();
  var a = 1.70158;
  var r = 0.7;
  switch (e) {
    case "LINEAR":
      return t;
      break;
    case "INSINE":
      return -1 * Math.cos(t * (Math.PI / 2)) + 1;
      break;
    case "OUTSINE":
      return Math.sin(t * (Math.PI / 2));
      break;
    case "INOUTSINE":
      return -0.5 * (Math.cos(Math.PI * t) - 1);
      break;
    case "INQUAD":
      return t * t;
      break;
    case "OUTQUAD":
      return t * (2 - t);
      break;
    case "INOUTQUAD":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      break;
    case "INCUBIC":
      return t * t * t;
      break;
    case "OUTCUBIC":
      var i = t - 1;
      return i * i * i + 1;
      break;
    case "INOUTCUBIC":
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      break;
    case "INQUART":
      return t * t * t * t;
      break;
    case "OUTQUART":
      var i = t - 1;
      return 1 - i * i * i * i;
      break;
    case "INOUTQUART":
      var i = t - 1;
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * i * i * i * i;
      break;
    case "INQUINT":
      return t * t * t * t * t;
      break;
    case "OUTQUINT":
      var i = t - 1;
      return 1 + i * i * i * i * i;
      break;
    case "INOUTQUINT":
      var i = t - 1;
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * i * i * i * i * i;
      break;
    case "INEXPO":
      if (t === 0) {
        return 0;
      }
      return Math.pow(2, 10 * (t - 1));
      break;
    case "OUTEXPO":
      if (t === 1) {
        return 1;
      }
      return -Math.pow(2, -10 * t) + 1;
      break;
    case "INOUTEXPO":
      if (t === 0 || t === 1) {
        return t;
      }
      var n = t * 2;
      var o = n - 1;
      if (n < 1) {
        return 0.5 * Math.pow(2, 10 * o);
      }
      return 0.5 * (-Math.pow(2, -10 * o) + 2);
      break;
    case "INCIRC":
      var n = t / 1;
      return -1 * (Math.sqrt(1 - n * t) - 1);
      break;
    case "OUTCIRC":
      var i = t - 1;
      return Math.sqrt(1 - i * i);
      break;
    case "INOUTCIRC":
      var n = t * 2;
      var o = n - 2;
      if (n < 1) {
        return -0.5 * (Math.sqrt(1 - n * n) - 1);
      }
      return 0.5 * (Math.sqrt(1 - o * o) + 1);
      break;
    case "INBACK":
      return t * t * ((a + 1) * t - a);
      break;
    case "OUTBACK":
      var n = t / 1 - 1;
      return n * n * ((a + 1) * n + a) + 1;
      break;
    case "INOUTBACK":
      var n = t * 2;
      var s = n - 2;
      var c = a * 1.525;
      if (n < 1) {
        return 0.5 * n * n * ((c + 1) * n - c);
      }
      return 0.5 * (s * s * ((c + 1) * s + c) + 2);
      break;
    case "INELASTIC":
      if (t === 0 || t === 1) {
        return t;
      }
      var n = t / 1;
      var o = n - 1;
      var p = 1 - r;
      var c = (p / (2 * Math.PI)) * Math.asin(1);
      return -(Math.pow(2, 10 * o) * Math.sin(((o - c) * (2 * Math.PI)) / p));
      break;
    case "OUTELASTIC":
      var p = 1 - r;
      var n = t * 2;
      if (t === 0 || t === 1) {
        return t;
      }
      var c = (p / (2 * Math.PI)) * Math.asin(1);
      return Math.pow(2, -10 * n) * Math.sin(((n - c) * (2 * Math.PI)) / p) + 1;
      break;
    case "INOUTELASTIC":
      var p = 1 - r;
      if (t === 0 || t === 1) {
        return t;
      }
      var n = t * 2;
      var o = n - 1;
      var c = (p / (2 * Math.PI)) * Math.asin(1);
      if (n < 1) {
        return -0.5 * (Math.pow(2, 10 * o) * Math.sin(((o - c) * (2 * Math.PI)) / p));
      }
      return Math.pow(2, -10 * o) * Math.sin(((o - c) * (2 * Math.PI)) / p) * 0.5 + 1;
      break;
    case "OUTBOUNCE":
      var n = t / 1;
      if (n < 1 / 2.75) {
        return 7.5625 * n * n;
      } else if (n < 2 / 2.75) {
        var s = n - 1.5 / 2.75;
        return 7.5625 * s * s + 0.75;
      } else if (n < 2.5 / 2.75) {
        var s = n - 2.25 / 2.75;
        return 7.5625 * s * s + 0.9375;
      } else {
        var s = n - 2.625 / 2.75;
        return 7.5625 * s * s + 0.984375;
      }
      break;
    case "INBOUNCE":
      var l = 1 - this.applyEasing(1 - t, "outbounce");
      return l;
      break;
    case "INOUTBOUNCE":
      if (t < 0.5) {
        var l = this.applyEasing(t * 2, "inbounce") * 0.5;
      } else {
        var l = this.applyEasing(t * 2 - 1, "outbounce") * 0.5 + 0.5;
      }
      return l;
      break;
    default:
      return t;
  }
};
Imported.Irina_ActionSequenceImpact.BattleManager_processActionSequence = BattleManager.processActionSequence;
BattleManager.processActionSequence = function (t, e) {
  if (Imported.YEP_X_ActSeqPack2) {
    if (t.match(/MOVE[ ](?:TYPE|EASING)/i)) {
      return this.actionMoveType(e);
    }
    if (t.match(/MOVE[ ](.*)[ ]OFFSET/i)) {
      var a = String(RegExp.$1);
      if (this.makeActionTargets(a).length > 0) {
        return this.actionMoveOffset(a, e);
      }
    }
  }
  if (t.match(/BALLOON[ ](.*)/i)) {
    var r = String(RegExp.$1).toUpperCase();
    return this.actionBalloon(r, e);
  }
  if (t.match(/PROJECTILE[ ]ICON[ ](\d+)/i)) {
    var i = parseInt(RegExp.$1);
    return this.actionProjectileIcon(i, e);
  }
  if (t.match(/PROJECTILE[ ](?:ANI|ANIMATION)[ ](\d+)/i)) {
    var n = $dataAnimations[parseInt(RegExp.$1)];
    return this.actionProjectileAnimation(n, e);
  }
  if (t.match(/WAIT FOR PROJECTILE/i)) {
    this._logWindow.waitForProjectile();
    return false;
  }
  if (Imported.Olivia_BattleImpact) {
    if (t.match(/COLOR BREAK/i)) {
      return this.actionColorBreak(e);
    }
    if (t.match(/APPLY ICON[ ](\d+)/i)) {
      var i = parseInt(RegExp.$1);
      return this.actionApplyIconEffect(i, e);
    }
    if (t.match(/REMOVE ICON[ ](\d+)/i)) {
      var i = parseInt(RegExp.$1);
      return this.actionRemoveIconEffect(i, e);
    }
    if (t.match(/AFTERGLOW[ ](.*)/i)) {
      var a = String(RegExp.$1);
      if (this.makeActionTargets(a).length > 0) {
        return this.actionAfterglow(a, e);
      }
    }
    if (t.match(/SHOCKWAVE/i)) {
      return this.actionShockwave(e);
    }
    if (t.match(/MOTION[ ]BLUR[ ](.*)/i)) {
      var a = String(RegExp.$1);
      if (this.makeActionTargets(a).length > 0) {
        return this.actionMotionBlur(a, e);
      }
    }
  }
  return Imported.Irina_ActionSequenceImpact.BattleManager_processActionSequence.call(this, t, e);
};
Imported.Irina_ActionSequenceImpact.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function () {
  Imported.Irina_ActionSequenceImpact.BattleManager_startAction.call(this);
  this._lastActionSequenceTarget = this._subject;
  this._startLastTargetSwapping = false;
};
Imported.Irina_ActionSequenceImpact.BattleManager_setTargets = BattleManager.setTargets;
BattleManager.setTargets = function (t) {
  if (this._startLastTargetSwapping) {
    this._lastActionSequenceTarget = this._targets[0];
  }
  Imported.Irina_ActionSequenceImpact.BattleManager_setTargets.call(this, t);
};
Imported.Irina_ActionSequenceImpact.BattleManager_createSetupActions = BattleManager.createSetupActions;
BattleManager.createSetupActions = function () {
  Imported.Irina_ActionSequenceImpact.BattleManager_createSetupActions.call(this);
  this._projectilesPresent = 0;
};
Imported.Irina_ActionSequenceImpact.BattleManager_createTargetActions = BattleManager.createTargetActions;
BattleManager.createTargetActions = function () {
  Imported.Irina_ActionSequenceImpact.BattleManager_createTargetActions.call(this);
  this._startLastTargetSwapping = true;
};
Imported.Irina_ActionSequenceImpact.BattleManager_createFollowActions = BattleManager.createFollowActions;
BattleManager.createFollowActions = function () {
  this._startLastTargetSwapping = false;
  Imported.Irina_ActionSequenceImpact.BattleManager_createFollowActions.call(this);
};
Imported.Irina_ActionSequenceImpact.BattleManager_makeActionTargets = BattleManager.makeActionTargets;
BattleManager.makeActionTargets = function (t) {
  t = t.toUpperCase();
  if (["PREV TARGET", "PREVIOUS TARGET"].contains(t)) {
    return [this._lastActionSequenceTarget];
  }
  if (["NEXT TARGET"].contains(t)) {
    return [this._individualTargets[1] || this._subject];
  }
  return Imported.Irina_ActionSequenceImpact.BattleManager_makeActionTargets.call(this, t);
};
BattleManager.actionBalloon = function (t, e) {
  var a = 0;
  switch (t.toUpperCase()) {
    case "!":
    case "EXCLAMATION":
      a = 1;
      break;
    case "?":
    case "QUESTION":
      a = 2;
      break;
    case "MUSIC":
    case "NOTE":
    case "MUSIC NOTE":
      a = 3;
      break;
    case "HEART":
      a = 4;
      break;
    case "ANGER":
    case "PISSED":
      a = 5;
      break;
    case "SWEAT":
      a = 6;
      break;
    case "COBWEB":
      a = 7;
      break;
    case "SILENCE":
    case "...":
      a = 8;
      break;
    case "LIGHTBULB":
    case "IDEA":
      a = 9;
      break;
    case "ZZZ":
    case "SLEEP":
      a = 10;
      break;
    case "USER-DEFINED 1":
    case "USER1":
      a = 11;
      break;
    case "USER-DEFINED 2":
    case "USER2":
      a = 12;
      break;
    case "USER-DEFINED 3":
    case "USER3":
      a = 13;
      break;
    case "USER-DEFINED 4":
    case "USER4":
      a = 14;
      break;
    case "USER-DEFINED 5":
    case "USER5":
      a = 15;
      break;
    default:
      return true;
  }
  var r = this.makeActionTargets(e[0]);
  for (var i = 0; i < r.length; i++) {
    var n = r[i];
    if (n && n.battler()) {
      n.battler().startBalloon(a);
    }
  }
  return true;
};
BattleManager.actionMoveType = function (t) {
  if (!$gameSystem.isSideView()) return true;
  var e = this.makeActionTargets(t[0]);
  var a = String(t[1] || "LINEAR").toUpperCase();
  for (var r = 0; r < e.length; r++) {
    var i = e[r];
    if (i && i.battler()) {
      i.battler()._moveType = a;
    }
  }
  return true;
};
BattleManager.actionMoveOffset = function (t, e) {
  if (!$gameSystem.isSideView()) return true;
  var a = this.makeActionTargets(t);
  var r = parseInt(e[0] || 0);
  var i = parseInt(e[1] || 0);
  for (var n = 0; n < a.length; n++) {
    var o = a[n];
    if (o && o.battler()) {
      var s = o.isActor() ? -1 : 1;
      o.battler()._targetOffsetX += s * r;
      o.battler()._targetOffsetY += i;
    }
  }
  return true;
};
BattleManager.actionProjectileIcon = function (t, e) {
  var a = this.actionProjectileBase(i, e);
  for (var r = 0; r < a.length; r++) {
    var i = a[r];
    i.setIcon(t);
  }
  return;
};
BattleManager.actionProjectileAnimation = function (t, e) {
  var a = this.actionProjectileBase(i, e);
  for (var r = 0; r < a.length; r++) {
    var i = a[r];
    i.startAnimation(t);
  }
  return;
};
BattleManager.actionProjectileBase = function (t, e) {
  var a = [];
  var r = SceneManager._scene._spriteset;
  var i = [];
  var n = [];
  var o = 0;
  var s = 0;
  var c = 0;
  var p = 0;
  var l = 20;
  var h = "LINEAR";
  var u = 0;
  var m = 0;
  var g = 1;
  var v = false;
  for (var _ = 0; _ < e.length; _++) {
    var I = e[_];
    if (I.match(/START[ ](\d+)[ ](\d+)/i)) {
      i.push([parseInt(RegExp.$1), parseInt(RegExp.$2)]);
    } else if (I.match(/START[ ]OFFSET[ ]([\+\-]\d+)[ ]([\+\-]\d+)/i)) {
      o = parseInt(RegExp.$1);
      s = parseInt(RegExp.$2);
      console.log(s);
    } else if (I.match(/GOAL[ ]OFFSET[ ]([\+\-]\d+)[ ]([\+\-]\d+)/i)) {
      c = parseInt(RegExp.$1);
      p = parseInt(RegExp.$2);
    } else if (I.match(/START[ ](.*)/i)) {
      var f = this.makeActionTargets(String(RegExp.$1));
      if (f.length <= 0) return [];
      for (var S = 0; S < f.length; S++) {
        var d = f[S];
        var A = f[S].spritePosX();
        var B = f[S].spritePosY() - Math.round(f[S].spriteHeight() / 2);
        B -= (f[S].battler().getFloatHeight() + f[S].battler().getJumpHeight()) * f[S].spriteHeight();
        i.push([A, B]);
      }
    } else if (I.match(/GOAL[ ](\d+)[ ](\d+)/i)) {
      n.push([parseInt(RegExp.$1), parseInt(RegExp.$2)]);
    } else if (I.match(/GOAL[ ](.*)/i)) {
      var f = this.makeActionTargets(String(RegExp.$1));
      if (f.length <= 0) return [];
      for (var S = 0; S < f.length; S++) {
        var d = f[S];
        var A = f[S].spritePosX();
        var B = f[S].spritePosY() - Math.round(f[S].spriteHeight() / 2);
        B -= (f[S].battler().getFloatHeight() + f[S].battler().getJumpHeight()) * f[S].spriteHeight();
        n.push([A, B]);
      }
    } else if (I.match(/DURATION[ ](\d+)/i)) {
      l = parseInt(RegExp.$1);
    } else if (I.match(/ARC[ ](.*)/i)) {
      u = Number(RegExp.$1);
    } else if (I.match(/EASE[ ](.*)/i)) {
      h = String(RegExp.$1).toUpperCase();
    } else if (I.match(/SPIN[ ](.*)/i)) {
      m = Number(RegExp.$1);
    } else if (I.match(/ICON SCALE[ ](.*)/i)) {
      g = Number(RegExp.$1) || 1;
    } else if (I.match(/ANGLE/i)) {
      v = true;
    }
  }
  for (var E = 0; E < i.length; E++) {
    for (var M = 0; M < n.length; M++) {
      var T = i[E];
      var b = n[M];
      var t = new Sprite_Projectile();
      r.addChild(t);
      var A = T[0];
      var B = T[1];
      var R = T[0] >= b[0] ? -1 : 1;
      A += o * R;
      B += s;
      t.setStartLocation(A, B);
      var A = b[0];
      var B = b[1];
      var R = T[0] >= b[0] ? -1 : 1;
      A += c * R;
      B += p;
      t.setupProjectile(A, B, u, l, h, m, v);
      t.setIconScale(g);
      a.push(t);
    }
  }
  return a;
};
BattleManager.actionColorBreak = function (t) {
  var e = Olivia.BattleImpact.CriticalBreakIntensity;
  var a = Olivia.BattleImpact.CriticalBreakDuration;
  for (var r = 0; r < t.length; r++) {
    var i = t[r];
    if (i.match(/INTENSITY[ ](.*)/i)) {
      e = Number(RegExp.$1);
    } else if (i.match(/DURATION[ ](.*)/i)) {
      a = Number(RegExp.$1);
    }
  }
  SceneManager._scene._spriteset.setupRbgSplitImpactFilterEffect(e, a);
  return true;
};
BattleManager.actionApplyIconEffect = function (t, e) {
  var a = this.makeActionTargets(e[0]);
  for (var r = 0; r < a.length; r++) {
    var i = a[r];
    var n = BattleManager.getBattlerSprite(i);
    n.addIconToBeApplied(t);
  }
  return true;
};
BattleManager.actionRemoveIconEffect = function (t, e) {
  var a = this.makeActionTargets(e[0]);
  for (var r = 0; r < a.length; r++) {
    var i = a[r];
    var n = BattleManager.getBattlerSprite(i);
    n.addIconToBeRemoved(t);
  }
  return true;
};
BattleManager.actionAfterglow = function (t, e) {
  var a = this.makeActionTargets(t);
  var r = Olivia.BattleImpact.HealAfterglowScale;
  var i = Olivia.BattleImpact.HealAfterglowBrightness;
  var n = Olivia.BattleImpact.HealAfterglowDuration;
  for (var o = 0; o < e.length; o++) {
    var s = e[o];
    if (s.match(/SCALE[ ](.*)/i)) {
      r = Number(RegExp.$1);
    } else if (s.match(/BRIGHTNESS[ ](.*)/i)) {
      i = Number(RegExp.$1);
    } else if (s.match(/DURATION[ ](.*)/i)) {
      n = Number(RegExp.$1);
    }
  }
  for (var o = 0; o < a.length; o++) {
    var c = a[o];
    var p = BattleManager.getBattlerSprite(c);
    p.setupHealAfterglowImpactFilter(r, i, n);
  }
  return true;
};
BattleManager.actionShockwave = function (t) {
  var e = 0;
  var a = 0;
  var r = Olivia.BattleImpact.GuardShockwaveAmplitude;
  var i = Olivia.BattleImpact.GuardShockwaveWavelength;
  var n = Olivia.BattleImpact.GuardShockwaveSpeed;
  for (var o = 0; o < t.length; o++) {
    var s = t[o];
    if (s.match(/CENTER[ ](\d+)[ ](\d+)/i)) {
      e = parseInt(RegExp.$1);
      a = parseInt(RegExp.$2);
    } else if (s.match(/CENTER[ ](.*)/i)) {
      var c = this.makeActionTargets(String(RegExp.$1));
      for (var o = 0; o < c.length; o++) {
        e += c[o].spritePosX();
        a += c[o].spritePosY() - Math.round(c[o].spriteHeight() / 2);
        a -= (c[o].battler().getFloatHeight() + c[o].battler().getJumpHeight()) * c[o].spriteHeight();
      }
      e /= c.length;
      a /= c.length;
    } else if (s.match(/(?:AMP|AMPLITUDE)[ ](.*)/i)) {
      r = Number(RegExp.$1);
    } else if (s.match(/(?:WAVE|WAVELENGTH)[ ](.*)/i)) {
      i = Number(RegExp.$1);
    } else if (s.match(/(?:SPEED|TIME)[ ](.*)/i)) {
      n = Number(RegExp.$1);
    }
  }
  SceneManager._scene._spriteset.createGuardShockwaveAt(e, a, r, i, n);
  return true;
};
BattleManager.actionMotionBlur = function (t, e) {
  var a = this.makeActionTargets(t);
  var r = Olivia.BattleImpact.DodgeMotionBlurVelocityX;
  var i = Olivia.BattleImpact.DodgeMotionBlurVelocityY;
  var n = Olivia.BattleImpact.DodgeMotionBlurOffset;
  var o = Olivia.BattleImpact.DodgeMotionBlurDuration;
  for (var s = 0; s < e.length; s++) {
    var c = e[s];
    if (c.match(/VELOCITY[ ](\d+)[ ](\d+)/i)) {
      r = parseInt(RegExp.$1);
      i = parseInt(RegExp.$2);
    } else if (c.match(/OFFSET[ ](.*)/i)) {
      n = Number(RegExp.$1);
    } else if (c.match(/DURATION[ ](.*)/i)) {
      o = Number(RegExp.$1);
    }
  }
  for (var s = 0; s < a.length; s++) {
    var p = a[s];
    var l = BattleManager.getBattlerSprite(p);
    l.setupMotionBlurImpact(r, i, n, o);
  }
  return true;
};
Imported.Irina_ActionSequenceImpact.Game_Battler_clearResult = Game_Battler.prototype.clearResult;
Game_Battler.prototype.clearResult = function () {
  Imported.Irina_ActionSequenceImpact.Game_Battler_clearResult.call(this);
  if ($gameParty.inBattle() && this.battler()) {
    this.battler()._moveType = "LINEAR";
  }
};
Imported.Irina_ActionSequenceImpact.Sprite_Battler_initMembers = Sprite_Battler.prototype.initMembers;
Sprite_Battler.prototype.initMembers = function () {
  Imported.Irina_ActionSequenceImpact.Sprite_Battler_initMembers.call(this);
  this._moveType = "LINEAR";
};
Imported.Irina_ActionSequenceImpact.Sprite_Battler_startMove = Sprite_Battler.prototype.startMove;
Sprite_Battler.prototype.startMove = function (t, e, a) {
  this._moveTime = 0;
  this._moveTotalDuration = a;
  this._moveBaseOffsetX = this._offsetX;
  this._moveBaseOffsetY = this._offsetY;
  Imported.Irina_ActionSequenceImpact.Sprite_Battler_startMove.call(this, t, e, a);
};
Imported.Irina_ActionSequenceImpact.Sprite_Battler_updateMove = Sprite_Battler.prototype.updateMove;
Sprite_Battler.prototype.updateMove = function () {
  if (this._moveType === "LINEAR") {
    Imported.Irina_ActionSequenceImpact.Sprite_Battler_updateMove.call(this);
  } else if (this._movementDuration > 0) {
    this._moveTime++;
    var t = this._moveTime;
    var e = this._moveTotalDuration;
    var a = this._moveBaseOffsetX;
    var r = this._moveBaseOffsetY;
    var i = this._targetOffsetX;
    var n = this._targetOffsetY;
    t /= e;
    t = BattleManager.applyEasing(t, this._moveType);
    this._offsetX = a + t * (i - a);
    this._offsetY = r + t * (n - r);
    this._movementDuration--;
    if (this._movementDuration <= 0) {
      this._offsetX = this._targetOffsetX;
      this._offsetY = this._targetOffsetY;
    }
  }
};
Imported.Irina_ActionSequenceImpact.Sprite_Battler_updateMain = Sprite_Battler.prototype.updateMain;
Sprite_Battler.prototype.updateMain = function () {
  Imported.Irina_ActionSequenceImpact.Sprite_Battler_updateMain.call(this);
  this.updateBalloon();
};
Sprite_Battler.prototype.startBalloon = function (t) {
  if (!this._balloonSprite) {
    this._balloonSprite = new Sprite_Balloon();
    this._balloonSprite.x = 0;
    this._balloonSprite.y = this.height * -1;
    this.addChild(this._balloonSprite);
  }
  this._balloonSprite.setup(t);
};
Sprite_Battler.prototype.updateBalloon = function () {
  if (!this._balloonSprite) return;
  if (!this._balloonSprite.isPlaying()) this.endBalloon();
};
Sprite_Battler.prototype.endBalloon = function () {
  if (!this._balloonSprite) return;
  this.removeChild(this._balloonSprite);
  this._balloonSprite = null;
};
Sprite_Animation.prototype.updateDragonBonesPosition = function () {
  var t = this._animation.position;
  if (t === 3) return;
  var e = this._target._battler;
  if (!this._target) return;
  if (!this._target._battler && typeof this._target._battler !== "undefined") return;
  if (typeof e != "undefined") {
    var a = e.isActor() ? e.actor() : e.enemy();
    if (t === 0) {
      this.y -= a.meta.dragonbone_height;
    } else if (t === 1) {
      this.y -= a.meta.dragonbone_height / 2;
    }
  } else {
    var e = this._target.parent._battler;
    if (e && e.hasDragonBone) {
      var a = e.isActor() ? e.actor() : e.enemy();
      if (t === 0) {
        this.y -= a.meta.dragonbone_height;
      } else if (t === 1) {
        this.y -= a.meta.dragonbone_height / 2;
      }
    }
  }
};

function Sprite_Projectile() {
  this.initialize.apply(this, arguments);
}
Sprite_Projectile.prototype = Object.create(Sprite_Base.prototype);
Sprite_Projectile.prototype.constructor = Sprite_Projectile;
Sprite_Projectile.prototype.initialize = function () {
  Sprite_Base.prototype.initialize.call(this);
  BattleManager._projectilesPresent = BattleManager._projectilesPresent || 0;
  BattleManager._projectilesPresent += 1;
  this.initMembers();
  this.loadBitmap();
};
Sprite_Projectile.prototype.initMembers = function () {
  this._battler = null;
  this._iconIndex = 0;
  this.anchor.x = 0.5;
  this.anchor.y = 0.5;
  this._moveType = "LINEAR";
  this._arcPeak = 0;
  this._spin = 0;
  this._angled = false;
  this._iconScale = 1;
  this._radianAdjustment = 0;
  this._animationProjectile = false;
  this._endReady = false;
};
Sprite_Projectile.prototype.loadBitmap = function () {
  this.bitmap = ImageManager.loadSystem("IconSet");
  this.setFrame(0, 0, 0, 0);
};
Sprite_Projectile.prototype.setIcon = function (t) {
  this._iconIndex = t;
  this._radianAdjustment = Imported.Irina_ActionSequenceImpact.RadianIconAdjustment;
  this.scale.x = this._iconScale;
  this.scale.y = this._iconScale;
  this.updateFrame();
};
Sprite_Projectile.prototype.startAnimation = function (t, e, a) {
  Sprite_Base.prototype.startAnimation.call(this, t, false, 0);
  this._animationProjectile = true;
  this._radianAdjustment = Imported.Irina_ActionSequenceImpact.RadianAnimationAdjustment;
};
Sprite_Projectile.prototype.setStartLocation = function (t, e) {
  this.x = t;
  this.y = e;
};
Sprite_Projectile.prototype.setupProjectile = function (t, e, a, r, i, n, o) {
  this._moveTime = 0;
  this._moveBaseX = this.x;
  this._moveBaseY = this.y;
  this._moveTargetX = t;
  this._moveTargetY = e;
  this._arcPeak = a;
  this._moveDuration = r || 1;
  this._moveTotalDuration = r;
  this._moveType = (i || "LINEAR").toUpperCase();
  this._spin = n;
  this._angled = o;
};
Sprite_Projectile.prototype.setIconScale = function (t) {
  this._iconScale = t || 1;
};
Sprite_Projectile.prototype.updateFrame = function () {
  var t = Window_Base._iconWidth;
  var e = Window_Base._iconHeight;
  var a = (this._iconIndex % 16) * t;
  var r = Math.floor(this._iconIndex / 16) * e;
  this.setFrame(a, r, t, e);
};
Sprite_Projectile.prototype.update = function () {
  Sprite_Base.prototype.update.call(this);
  if (this._endReady) {
    this.endMove();
  } else {
    this.updateMove();
    this.updateSpin();
  }
};
Sprite_Projectile.prototype.updateMove = function () {
  if (this._moveDuration <= 0) return;
  this._moveTime++;
  var t = this._moveTime;
  var e = this._moveTotalDuration;
  var a = this._moveBaseX;
  var r = this._moveBaseY;
  var i = this._moveTargetX;
  var n = this._moveTargetY;
  t /= e;
  t = BattleManager.applyEasing(t, this._moveType);
  var o = this.x;
  var s = this.y;
  this.x = a + t * (i - a);
  this.y = r + t * (n - r) - this.getPeak();
  var c = this.x;
  var p = this.y;
  this.applyAngle(o, c, s, p);
  this._moveDuration--;
  if (this._moveDuration <= 0) {
    this.x = this._moveTargetX;
    this.y = this._moveTargetY;
    this._endReady = true;
  }
};
Sprite_Projectile.prototype.applyAngle = function (t, e, a, r) {
  if (this._angled) {
    var i = e - t;
    var n = r - a;
    var o = Math.atan2(n, i);
    this.rotation = o + this._radianAdjustment;
    if (this._animationProjectile && this._animationSprites[0]) {
      this._animationSprites[0].rotation = this.rotation;
    }
  }
};
Sprite_Projectile.prototype.updateSpin = function () {
  if (this._spin !== 0) this.rotation += this._spin;
};
Sprite_Projectile.prototype.getPeak = function () {
  if (this._arcPeak === 0) return 0;
  var t = this._moveTotalDuration - this._moveDuration;
  var e = this._moveTotalDuration / 2;
  var a = this._arcPeak;
  var r = -a / Math.pow(e, 2);
  var i = r * Math.pow(t - e, 2) + a;
  return i;
};
Sprite_Projectile.prototype.endMove = function () {
  if (this._animationSprites && this._animationSprites.length > 0) {
    for (var t = 0; t < this._animationSprites.length; t++) {
      var e = this._animationSprites[t];
      e.remove();
    }
  }
  this.parent.removeChild(this);
  BattleManager._projectilesPresent = BattleManager._projectilesPresent || 0;
  BattleManager._projectilesPresent -= 1;
};
Imported.Irina_ActionSequenceImpact.Window_BattleLog_updateWaitMode = Window_BattleLog.prototype.updateWaitMode;
Window_BattleLog.prototype.updateWaitMode = function () {
  if (this._waitMode === "projectile") {
    if (BattleManager._projectilesPresent) return true;
  }
  return Imported.Irina_ActionSequenceImpact.Window_BattleLog_updateWaitMode.call(this);
};
Window_BattleLog.prototype.waitForProjectile = function () {
  this.setWaitMode("projectile");
};
