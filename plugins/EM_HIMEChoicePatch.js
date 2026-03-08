/*:
 * @plugindesc v1.0.0 Safety patch for HIME_HMSChoiceDisplayMode embed choices (YEP/SRD compatible).
 * @author Faiz Syihab
 *
 * @help
 * ============================================================================
 * EM_HIMEChoicePatch.js
 * ============================================================================
 * Tujuan:
 * - Mencegah crash:
 *   TypeError: Cannot read properties of null (reading 'y')
 *   pada HIME_HMSChoiceDisplayMode saat choice mode = Embed.
 *
 * Konteks kompatibilitas:
 * - YEP_MessageCore.js
 * - YEP_X_ExtMesPack1.js
 * - SRD_TranslationEngine.js
 * - GALV_MessageBusts.js / RS_MessageAlign.js
 *
 * Pasang plugin ini DI BAWAH:
 * - HIME_HMSChoiceDisplayMode.js
 * (Disarankan paling bawah di kelompok plugin message patch.)
 *
 * Cara kerja:
 * - Jika mode Embed aktif tapi message textState belum tersedia,
 *   choice window otomatis fallback sementara ke placement/row default.
 * - Saat textState sudah siap, perilaku Embed kembali normal.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.EM_HIMEChoicePatch = true;

(function() {
  "use strict";

  if (!Imported.HMSChoiceDisplayMode) return;

  var EMBED_MODE = 1;
  var DEFAULT_INDENT = 36;

  function getGameChoiceMode() {
    if ($gameMessage && typeof $gameMessage.choiceMode === "function") {
      return $gameMessage.choiceMode();
    }
    return null;
  }

  function syncChoiceMode(win) {
    if (!win) return;

    if (typeof win.updateChoiceMode === "function") {
      win.updateChoiceMode();
      return;
    }

    var mode = getGameChoiceMode();
    if (mode !== null && mode !== undefined) {
      win._choiceMode = mode;
    }
  }

  function isEmbedMode(win) {
    if (!win) return false;

    var mode = win._choiceMode;
    if (mode === null || mode === undefined) {
      mode = getGameChoiceMode();
    }

    return mode === EMBED_MODE;
  }

  function hasEmbedMessageContext(win) {
    return !!(win && win._messageWindow && win._messageWindow._textState);
  }

  function getChoiceIndent() {
    var indent = DEFAULT_INDENT;

    if (typeof TH !== "undefined" &&
        TH.HMSChoiceDisplayMode &&
        TH.HMSChoiceDisplayMode.indent !== undefined) {
      var v1 = Number(TH.HMSChoiceDisplayMode.indent);
      if (isFinite(v1)) indent = v1;
    } else if (typeof PluginManager !== "undefined" &&
               PluginManager.parameters) {
      var params = PluginManager.parameters("HIME_HMSChoiceDisplayMode");
      if (params && params["Choice Indent"] !== undefined) {
        var v2 = Number(params["Choice Indent"]);
        if (isFinite(v2)) indent = v2;
      }
    }

    return Math.max(0, Math.floor(indent));
  }

  function getTextLineHeight(win, textState) {
    var value = textState ? Number(textState.height) : NaN;
    if (!isFinite(value) || value <= 0) {
      if (win && typeof win.lineHeight === "function") {
        value = Number(win.lineHeight());
      }
    }
    if (!isFinite(value) || value <= 0) value = 36;
    return value;
  }

  function hasRenderedMessageContent(textState) {
    if (!textState) return false;

    var y = Number(textState.y || 0);
    if (isFinite(y) && y > 0) return true;

    var x = Number(textState.x);
    var left = Number(textState.left);
    if (isFinite(x) && isFinite(left) && x > left) return true;

    var raw = String(textState.text || "");
    if (!raw) return false;

    // Best-effort: remove escape-like codes so control-only text won't count.
    var cleaned = raw
      .replace(/\x1b[A-Z0-9_]+\[[^\]]*\]/gi, "")
      .replace(/\x1b[A-Z0-9_]+<[^>]*>/gi, "")
      .replace(/\x1b./g, "")
      .replace(/\s+/g, "");

    return cleaned.length > 0;
  }

  function withTemporaryNonEmbed(win, fn) {
    var oldMode = win._choiceMode;
    win._choiceMode = 0;
    try {
      return fn();
    } finally {
      win._choiceMode = oldMode;
    }
  }

  function countVisibleChoices() {
    var choices = ($gameMessage && $gameMessage.choices) ? $gameMessage.choices() : [];
    var visible = 0;

    for (var i = 0; i < choices.length; i++) {
      if ($gameSystem && typeof $gameSystem.isChoiceShown === "function") {
        if (!$gameSystem.isChoiceShown(i)) continue;
      }
      visible += 1;
    }

    if (visible <= 0) visible = 1;
    return visible;
  }

  function getConfiguredMaxChoiceRows() {
    var maxLines = 8;
    if ($gameSystem && typeof $gameSystem.getMessageChoiceRows === "function") {
      var configuredMax = Number($gameSystem.getMessageChoiceRows());
      if (isFinite(configuredMax) && configuredMax > 0) {
        maxLines = configuredMax;
      }
    }
    return Math.max(1, maxLines);
  }

  function calculateSafeRows(win) {
    var visible = countVisibleChoices();
    var maxLines = getConfiguredMaxChoiceRows();

    if (win && win._messageWindow) {
      var messageY = Number(win._messageWindow.y || 0);
      var messageHeight = Number(win._messageWindow.height || 0);
      var centerY = Graphics.boxHeight / 2;
      if (messageY < centerY && messageY + messageHeight > centerY) {
        maxLines = Math.min(maxLines, 4);
      }
    }

    return Math.max(1, Math.min(visible, maxLines));
  }

  function placeEmbedChoiceWindow(win) {
    if (!win || !win._messageWindow) return false;

    var msg = win._messageWindow;
    var textState = msg._textState;
    var indent = getChoiceIndent();

    win.width = win.windowWidth();
    win.height = win.windowHeight();

    var lineX = 0;
    if (typeof msg.newLineX === "function") {
      lineX = Number(msg.newLineX());
      if (!isFinite(lineX)) lineX = 0;
    }

    // Keep embed choices anchored to the left of the message area.
    var targetX = Number(msg.x || 0) + lineX + indent;
    win.x = Math.max(0, Math.min(Math.floor(targetX), Graphics.boxWidth - win.width));

    var targetY = Number(msg.y || 0);
    if (textState) {
      var textY = Number(textState.y || 0);
      if (!isFinite(textY) || textY < 0) textY = 0;
      targetY += textY;

      if (hasRenderedMessageContent(textState)) {
        targetY += getTextLineHeight(win, textState);
      }
    } else if (isFinite(win._emLastEmbedY)) {
      targetY = Number(win._emLastEmbedY);
    }

    var minY = Number(msg.y || 0);
    var maxY = minY + Math.max(0, Number(msg.height || 0) - win.height);
    if (!isFinite(maxY) || maxY < minY) maxY = minY;

    win.y = Math.max(minY, Math.min(Math.floor(targetY), maxY));

    win._emLastEmbedX = win.x;
    win._emLastEmbedY = win.y;
    return true;
  }

  function calculateEmbedRows(win) {
    if (!win || !win._messageWindow) {
      return calculateSafeRows(win);
    }

    var msg = win._messageWindow;
    var textState = msg._textState;
    var lineHeight = getTextLineHeight(win, textState);
    var innerHeight = Number(msg.height || 0) - win.padding * 2;

    if (!isFinite(innerHeight) || innerHeight <= 0) {
      return calculateSafeRows(win);
    }

    var usedY = 0;
    if (textState) {
      var textY = Number(textState.y || 0);
      if (isFinite(textY) && textY > 0) usedY += textY;
      if (hasRenderedMessageContent(textState)) usedY += lineHeight;
    }

    var roomRows = Math.floor((innerHeight - usedY) / lineHeight);
    if (!isFinite(roomRows) || roomRows < 1) roomRows = 1;

    var visibleChoices = countVisibleChoices();
    var maxRows = getConfiguredMaxChoiceRows();
    return Math.max(1, Math.min(roomRows, visibleChoices, maxRows));
  }

  var _EM_Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
  Window_ChoiceList.prototype.updatePlacement = function() {
    syncChoiceMode(this);

    if (isEmbedMode(this)) {
      if (!placeEmbedChoiceWindow(this)) {
        withTemporaryNonEmbed(this, function() {
          _EM_Window_ChoiceList_updatePlacement.call(this);
        }.bind(this));
      }
      return;
    }

    try {
      _EM_Window_ChoiceList_updatePlacement.call(this);
    } catch (e) {
      withTemporaryNonEmbed(this, function() {
        _EM_Window_ChoiceList_updatePlacement.call(this);
      }.bind(this));
    }
  };

  var _EM_Window_ChoiceList_numVisibleRows = Window_ChoiceList.prototype.numVisibleRows;
  Window_ChoiceList.prototype.numVisibleRows = function() {
    syncChoiceMode(this);

    if (isEmbedMode(this)) {
      return calculateEmbedRows(this);
    }

    try {
      var rows = _EM_Window_ChoiceList_numVisibleRows.call(this);
      rows = Math.floor(Number(rows));
      if (!isFinite(rows) || rows < 1) {
        return calculateSafeRows(this);
      }
      return rows;
    } catch (e) {
      try {
        var fallbackRows = withTemporaryNonEmbed(this, function() {
          return _EM_Window_ChoiceList_numVisibleRows.call(this);
        }.bind(this));
        fallbackRows = Math.floor(Number(fallbackRows));
        if (isFinite(fallbackRows) && fallbackRows > 0) {
          return fallbackRows;
        }
      } catch (e2) {
      }
      return calculateSafeRows(this);
    }
  };
})();
