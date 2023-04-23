import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-OMT57NJ7.mjs";

// src/editorView.ts
var lerp = (from, to, t) => from + t * (to - from);
var EASING_FUNCTION = lerp;
function getColorFor(theme, type) {
  let current = theme.foreground;
  return theme[type] || current;
}
function getContextColor(color, startX, endX, context) {
  if (color && color.type === "gradient") {
    const grad = context.createLinearGradient(startX, 0, endX, 0);
    for (const [stopOffset, stopColor] of Object.entries(color.stops))
      grad.addColorStop(stopOffset, stopColor);
    return grad;
  }
  return typeof color === "string" ? color : getContextColor(color.color, startX, endX, context);
}
function colorToString(color, fontSize, fontFamily) {
  if (typeof color === "string" || !color || !color.style && !color.fontWeight)
    return `${fontSize}px ${fontFamily}`;
  return (color.style ? color.style + " " : "") + (color.fontWeight ? color.fontWeight + " " : "") + `${fontSize}px ${fontFamily}`;
}
var _canvasEl, _context, _editor, _cursorTimer, _lastTime, _drawnCamera, _lastScale, _characterWidth, _characterHeight, _getTokens, _fontFamily, _adjustFont, adjustFont_fn, _drawSelection, drawSelection_fn, _draw, draw_fn;
var EditorView = class {
  constructor(userTheme) {
    __privateAdd(this, _adjustFont);
    __privateAdd(this, _drawSelection);
    __privateAdd(this, _draw);
    __privateAdd(this, _canvasEl, void 0);
    __privateAdd(this, _context, void 0);
    __privateAdd(this, _editor, void 0);
    __privateAdd(this, _cursorTimer, void 0);
    __privateAdd(this, _lastTime, void 0);
    __privateAdd(this, _drawnCamera, void 0);
    __privateAdd(this, _lastScale, void 0);
    __privateAdd(this, _characterWidth, void 0);
    __privateAdd(this, _characterHeight, void 0);
    __privateAdd(this, _getTokens, void 0);
    __privateAdd(this, _fontFamily, void 0);
    this.theme = {
      foreground: "#eee",
      background: "#222",
      cursorColor: "#aaa",
      selection: "#888",
      ...userTheme
    };
  }
  attachEditor({ editor, canvasEl, context, getTokens }) {
    this.lineHeight = 50;
    this.fontSize = 30;
    this.animationSpeed = 2;
    this.cursorBlinkTime = 0.5;
    __privateSet(this, _fontFamily, "monospace");
    __privateSet(this, _canvasEl, canvasEl);
    __privateSet(this, _context, context);
    __privateSet(this, _editor, editor);
    __privateSet(this, _cursorTimer, 0);
    __privateSet(this, _lastTime, null);
    __privateSet(this, _getTokens, getTokens);
    __privateSet(this, _drawnCamera, { x: 0, y: 0 });
    __privateGet(this, _context).font = `${this.fontSize}px ${__privateGet(this, _fontFamily)}`;
    __privateSet(this, _lastScale, 1);
    __privateMethod(this, _adjustFont, adjustFont_fn).call(this);
    __privateGet(this, _editor).on("press", () => {
      __privateSet(this, _cursorTimer, 0);
    });
    requestAnimationFrame(__privateMethod(this, _draw, draw_fn).bind(this));
  }
};
_canvasEl = new WeakMap();
_context = new WeakMap();
_editor = new WeakMap();
_cursorTimer = new WeakMap();
_lastTime = new WeakMap();
_drawnCamera = new WeakMap();
_lastScale = new WeakMap();
_characterWidth = new WeakMap();
_characterHeight = new WeakMap();
_getTokens = new WeakMap();
_fontFamily = new WeakMap();
_adjustFont = new WeakSet();
adjustFont_fn = function() {
  const metrics = __privateGet(this, _context).measureText("A");
  __privateSet(this, _characterWidth, metrics.width);
  __privateSet(this, _characterHeight, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);
};
_drawSelection = new WeakSet();
drawSelection_fn = function(transform, lineHeight, charWidth, charHeight, selection) {
  if (selection.start.line > selection.end.line || selection.start.line === selection.end.line && selection.start.col > selection.end.col)
    return __privateMethod(this, _drawSelection, drawSelection_fn).call(this, transform, lineHeight, charWidth, charHeight, {
      start: selection.end,
      end: selection.start
    });
  __privateGet(this, _context).fillStyle = this.theme.selection;
  for (let line = selection.start.line; line <= selection.end.line; line++) {
    if (line === selection.start.line && selection.start.line === selection.end.line) {
      __privateGet(this, _context).fillRect(
        transform.x + selection.start.col * charWidth,
        transform.y + line * lineHeight - lineHeight,
        (selection.end.col - selection.start.col) * charWidth,
        charHeight
      );
    } else if (line === selection.start.line) {
      __privateGet(this, _context).fillRect(
        transform.x + selection.start.col * charWidth,
        transform.y + line * lineHeight - lineHeight,
        Math.max(
          (__privateGet(this, _editor).document.getLine(line).length - selection.start.col) * charWidth,
          charWidth
        ),
        charHeight
      );
    } else if (line === selection.end.line) {
      __privateGet(this, _context).fillRect(
        transform.x + 0,
        transform.y + line * lineHeight - lineHeight,
        selection.end.col * charWidth,
        charHeight
      );
    } else {
      __privateGet(this, _context).fillRect(
        transform.x + 0,
        transform.y + line * lineHeight - lineHeight,
        Math.max(__privateGet(this, _editor).document.getLine(line).length * charWidth, charWidth),
        charHeight
      );
    }
  }
};
_draw = new WeakSet();
draw_fn = function(time) {
  if (__privateGet(this, _lastTime) === null) {
    __privateSet(this, _lastTime, time);
    return requestAnimationFrame(__privateMethod(this, _draw, draw_fn).bind(this));
  }
  const delta = Math.min(time - __privateGet(this, _lastTime), 100) / 1e3;
  __privateSet(this, _lastTime, time);
  __privateGet(this, _context).fillStyle = this.theme.background;
  const maxLineLength = Math.max(
    ...__privateGet(this, _editor).document.getLines().map((l) => l.length)
  );
  const scaleTarget = Math.min(1 + 32 / maxLineLength, 7);
  const scale = EASING_FUNCTION(__privateGet(this, _lastScale), scaleTarget, this.animationSpeed * delta);
  __privateSet(this, _lastScale, scale);
  const charWidth = __privateGet(this, _characterWidth) * scale;
  const charHeight = __privateGet(this, _characterHeight) * scale;
  const lineHeight = this.lineHeight * scale;
  const fontSize = this.fontSize * scale;
  __privateGet(this, _context).font = `${fontSize}px ${__privateGet(this, _fontFamily)}`;
  __privateGet(this, _context).fillRect(
    0,
    0,
    __privateGet(this, _canvasEl).width,
    __privateGet(this, _canvasEl).height
  );
  const cameraTarget = {
    x: -__privateGet(this, _editor).getCursor().col * charWidth,
    y: -__privateGet(this, _editor).getCursor().line * lineHeight
  };
  __privateSet(this, _drawnCamera, {
    // @ts-ignore
    x: EASING_FUNCTION(__privateGet(this, _drawnCamera).x, cameraTarget.x, this.animationSpeed * delta),
    // @ts-ignore
    y: EASING_FUNCTION(__privateGet(this, _drawnCamera).y, cameraTarget.y, this.animationSpeed * delta)
  });
  const transform = {
    x: __privateGet(this, _canvasEl).width / 2 + __privateGet(this, _drawnCamera).x,
    y: __privateGet(this, _canvasEl).height / 2 + __privateGet(this, _drawnCamera).y
  };
  const sel = __privateGet(this, _editor).getSelection();
  if (sel) {
    __privateMethod(this, _drawSelection, drawSelection_fn).call(this, transform, lineHeight, charWidth, charHeight, {
      start: sel.start,
      end: sel.end || __privateGet(this, _editor).getCursor()
    });
  }
  const tokens = __privateGet(this, _getTokens).call(this);
  for (let lineNo = 0; lineNo < tokens.length; lineNo++) {
    let col = 0;
    for (const token of tokens[lineNo]) {
      const color = getColorFor(this.theme, token.type);
      __privateGet(this, _context).font = colorToString(color, fontSize, __privateGet(this, _fontFamily));
      __privateGet(this, _context).fillStyle = getContextColor(
        color,
        transform.x + col * charWidth,
        transform.x + col * charWidth + token.value.length * charWidth,
        __privateGet(this, _context)
      );
      __privateGet(this, _context).textBaseline = "top";
      __privateGet(this, _context).fillText(
        token.value,
        transform.x + col * charWidth,
        transform.y + lineNo * lineHeight - lineHeight + charHeight / 5
      );
      col += token.value.length;
    }
  }
  __privateSet(this, _cursorTimer, __privateGet(this, _cursorTimer) + delta);
  __privateGet(this, _context).fillStyle = this.theme.cursorColor || this.theme.foreground;
  if (__privateGet(this, _cursorTimer) > this.cursorBlinkTime) {
    __privateGet(this, _context).fillStyle = "transparent";
    if (__privateGet(this, _cursorTimer) > this.cursorBlinkTime * 2) {
      __privateSet(this, _cursorTimer, 0);
      __privateGet(this, _context).fillStyle = this.theme.cursorColor || this.theme.foreground;
    }
  }
  __privateGet(this, _context).fillRect(
    transform.x + __privateGet(this, _editor).getCursor().col * charWidth,
    transform.y + __privateGet(this, _editor).getCursor().line * lineHeight - lineHeight,
    charWidth / 8,
    charHeight
  );
  requestAnimationFrame(__privateMethod(this, _draw, draw_fn).bind(this));
};

export {
  EditorView
};
