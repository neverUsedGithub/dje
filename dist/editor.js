import {
  EditorDocument
} from "./chunk-LF6KIYVG.js";
import {
  EditorView
} from "./chunk-WMTABAV3.js";
import {
  __async,
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __spreadValues
} from "./chunk-P73PLKE6.js";

// src/editor.ts
var TEXT_REGEX = /[A-z_0-9]/;
var TokenType = /* @__PURE__ */ ((TokenType2) => {
  TokenType2[TokenType2["string"] = 0] = "string";
  TokenType2[TokenType2["number"] = 1] = "number";
  TokenType2[TokenType2["comment"] = 2] = "comment";
  TokenType2[TokenType2["keyword"] = 3] = "keyword";
  TokenType2[TokenType2["builtin"] = 4] = "builtin";
  TokenType2[TokenType2["identifier"] = 5] = "identifier";
  return TokenType2;
})(TokenType || {});
var EditorPlugin = class {
};
var _canvasEl, _context, _cursor, _selection, _events, _shouldSelect, _inputTextArea, _pressedKeys, _currentMode, _tabIndentsLine, _tokens, _plugins, _view, _generateTokens, generateTokens_fn, _triggerEvent, triggerEvent_fn, _replaceSelection, replaceSelection_fn, _addListeners, addListeners_fn;
var Editor = class {
  constructor({ element, content, mode, plugins, theme, tabSize, tabIndentsLine }) {
    __privateAdd(this, _generateTokens);
    __privateAdd(this, _triggerEvent);
    __privateAdd(this, _replaceSelection);
    __privateAdd(this, _addListeners);
    __privateAdd(this, _canvasEl, void 0);
    __privateAdd(this, _context, void 0);
    __privateAdd(this, _cursor, void 0);
    __privateAdd(this, _selection, void 0);
    __privateAdd(this, _events, void 0);
    __privateAdd(this, _shouldSelect, void 0);
    __privateAdd(this, _inputTextArea, void 0);
    __privateAdd(this, _pressedKeys, void 0);
    __privateAdd(this, _currentMode, void 0);
    __privateAdd(this, _tabIndentsLine, void 0);
    __privateAdd(this, _tokens, void 0);
    __privateAdd(this, _plugins, void 0);
    __privateAdd(this, _view, void 0);
    __privateSet(this, _canvasEl, typeof element === "string" ? document.querySelector(element) : element);
    __privateSet(this, _context, null);
    __privateSet(this, _cursor, { line: 0, col: 0 });
    __privateSet(this, _events, {});
    __privateSet(this, _selection, null);
    __privateSet(this, _shouldSelect, false);
    __privateSet(this, _pressedKeys, {});
    __privateSet(this, _plugins, []);
    __privateSet(this, _currentMode, mode);
    __privateSet(this, _view, new EditorView(theme || {}));
    __privateSet(this, _tokens, []);
    __privateSet(this, _tabIndentsLine, tabIndentsLine != null ? tabIndentsLine : false);
    __privateSet(this, _inputTextArea, document.createElement("textarea"));
    __privateGet(this, _inputTextArea).style.position = "absolute";
    __privateGet(this, _inputTextArea).style.top = "-99999px";
    __privateGet(this, _inputTextArea).style.left = "-99999px";
    __privateGet(this, _inputTextArea).style.width = "0px";
    __privateGet(this, _inputTextArea).style.height = "0px";
    document.body.appendChild(__privateGet(this, _inputTextArea));
    this.focus();
    this.tabSize = tabSize != null ? tabSize : 4;
    this.document = new EditorDocument(content, () => __privateMethod(this, _generateTokens, generateTokens_fn).call(this));
    this.fit();
    __privateMethod(this, _generateTokens, generateTokens_fn).call(this);
    __privateMethod(this, _addListeners, addListeners_fn).call(this);
    this.use(__privateGet(this, _view));
    if (plugins)
      for (const pl of plugins)
        this.use(pl);
  }
  getTokens() {
    return __privateGet(this, _tokens);
  }
  on(name, callback) {
    if (!__privateGet(this, _events)[name])
      __privateGet(this, _events)[name] = [];
    __privateGet(this, _events)[name].push(callback);
  }
  getSelection() {
    return __privateGet(this, _selection);
  }
  moveCursor(lines, cols) {
    __privateGet(this, _cursor).line += lines;
    if (__privateGet(this, _cursor).line < 0)
      __privateGet(this, _cursor).line = 0;
    else if (__privateGet(this, _cursor).line >= this.document.getLines().length)
      __privateGet(this, _cursor).line = this.document.getLines().length - 1;
    __privateGet(this, _cursor).col += cols;
    if (__privateGet(this, _cursor).col < 0)
      __privateGet(this, _cursor).col = 0;
    else if (__privateGet(this, _cursor).col > this.document.getLine(__privateGet(this, _cursor).line).length)
      __privateGet(this, _cursor).col = this.document.getLine(__privateGet(this, _cursor).line).length;
  }
  getCursor() {
    return __spreadValues({}, __privateGet(this, _cursor));
  }
  use(plugin) {
    plugin.attachEditor({
      editor: this,
      canvasEl: __privateGet(this, _canvasEl),
      context: __privateGet(this, _context),
      getTokens: () => __privateGet(this, _tokens)
    });
    __privateGet(this, _plugins).push(plugin);
  }
  focus() {
    __privateGet(this, _inputTextArea).focus();
  }
  fit() {
    __privateGet(this, _canvasEl).width = __privateGet(this, _canvasEl).parentElement.clientWidth;
    __privateGet(this, _canvasEl).height = __privateGet(this, _canvasEl).parentElement.clientHeight;
    __privateSet(this, _context, __privateGet(this, _canvasEl).getContext("2d"));
  }
};
_canvasEl = new WeakMap();
_context = new WeakMap();
_cursor = new WeakMap();
_selection = new WeakMap();
_events = new WeakMap();
_shouldSelect = new WeakMap();
_inputTextArea = new WeakMap();
_pressedKeys = new WeakMap();
_currentMode = new WeakMap();
_tabIndentsLine = new WeakMap();
_tokens = new WeakMap();
_plugins = new WeakMap();
_view = new WeakMap();
_generateTokens = new WeakSet();
generateTokens_fn = function() {
  this.moveCursor(0, 0);
  __privateSet(this, _tokens, __privateGet(this, _currentMode).lex(this.document.getText()));
};
_triggerEvent = new WeakSet();
triggerEvent_fn = function(name, ...args) {
  if (__privateGet(this, _events)[name])
    for (let i = 0; i < __privateGet(this, _events)[name].length; i++)
      __privateGet(this, _events)[name][i](...args);
};
_replaceSelection = new WeakSet();
replaceSelection_fn = function(text) {
  if (!__privateGet(this, _selection))
    return;
  if (!__privateGet(this, _selection).end)
    __privateGet(this, _selection).end = __spreadValues({}, __privateGet(this, _cursor));
  this.document.replaceRange(__privateGet(this, _selection), text);
  if (__privateGet(this, _selection).start.line > __privateGet(this, _selection).end.line || __privateGet(this, _selection).start.line === __privateGet(this, _selection).end.line && __privateGet(this, _selection).start.col > __privateGet(this, _selection).end.col) {
    __privateGet(this, _cursor).line = __privateGet(this, _selection).end.line;
    __privateGet(this, _cursor).col = __privateGet(this, _selection).end.col + text.length;
  } else {
    __privateGet(this, _cursor).line = __privateGet(this, _selection).start.line;
    __privateGet(this, _cursor).col = __privateGet(this, _selection).start.col + text.length;
  }
  __privateSet(this, _selection, null);
};
_addListeners = new WeakSet();
addListeners_fn = function() {
  __privateGet(this, _canvasEl).addEventListener("click", () => {
    this.focus();
  });
  __privateGet(this, _inputTextArea).addEventListener("keyup", (ev) => {
    ev.preventDefault();
    delete __privateGet(this, _pressedKeys)[ev.key];
    if (ev.key === "Shift") {
      __privateSet(this, _shouldSelect, false);
      if (!__privateGet(this, _selection))
        return;
      __privateGet(this, _selection).end = { line: __privateGet(this, _cursor).line, col: __privateGet(this, _cursor).col };
    }
  });
  __privateGet(this, _inputTextArea).addEventListener("keydown", (ev) => __async(this, null, function* () {
    ev.preventDefault();
    __privateGet(this, _pressedKeys)[ev.key] = true;
    __privateMethod(this, _triggerEvent, triggerEvent_fn).call(this, "press", ev);
    if (ev.key === "ArrowUp" || ev.key === "ArrowDown" || ev.key === "ArrowLeft" || ev.key === "ArrowRight" || ev.key === "Home" || ev.key === "End") {
      if (__privateGet(this, _shouldSelect)) {
        __privateSet(this, _selection, {
          start: { line: __privateGet(this, _cursor).line, col: __privateGet(this, _cursor).col },
          end: null
        });
        __privateSet(this, _shouldSelect, false);
      }
      if (__privateGet(this, _selection) && __privateGet(this, _selection).end)
        __privateSet(this, _selection, null);
    }
    if (ev.key === "Shift") {
      __privateSet(this, _shouldSelect, true);
    } else if (ev.key === "Tab") {
      if (__privateGet(this, _selection)) {
        if (__privateGet(this, _selection).end) {
          let startLine = __privateGet(this, _selection).start.line;
          let endLine = __privateGet(this, _selection).end.line;
          if (endLine < startLine) {
            startLine = endLine;
            endLine = __privateGet(this, _selection).start.line;
          }
          for (let lineI = startLine; lineI <= endLine; lineI++) {
            const line = this.document.getLine(lineI);
            if (__privateGet(this, _pressedKeys)["Shift"]) {
              if (line.startsWith(" ".repeat(this.tabSize)))
                this.document.setLine(lineI, line.substring(this.tabSize));
            } else {
              this.document.setLine(lineI, " ".repeat(this.tabSize) + line);
            }
          }
        }
      } else if (!__privateGet(this, _tabIndentsLine)) {
        this.document.insertAt(__privateGet(this, _cursor), " ".repeat(this.tabSize));
        __privateGet(this, _cursor).col += 2;
      } else {
        if (__privateGet(this, _pressedKeys)["Shift"]) {
          const currline = this.document.getLine(__privateGet(this, _cursor).line);
          if (currline.startsWith(" ".repeat(this.tabSize))) {
            this.moveCursor(0, -this.tabSize);
            this.document.setLine(__privateGet(this, _cursor).line, currline.substring(this.tabSize));
          }
        } else {
          this.document.setLine(__privateGet(this, _cursor).line, " ".repeat(this.tabSize) + this.document.getLine(__privateGet(this, _cursor).line));
          this.moveCursor(0, this.tabSize);
        }
      }
    } else if (__privateGet(this, _pressedKeys)["Control"] && ev.key === "v") {
      const clipText = yield navigator.clipboard.readText();
      const split = clipText.split("\n");
      this.document.insertAt(__privateGet(this, _cursor), clipText);
      this.moveCursor(split.length - 1, split[split.length - 1].length);
    } else if (__privateGet(this, _pressedKeys)["Control"] && ev.key === "c") {
      if (__privateGet(this, _selection))
        yield navigator.clipboard.writeText(this.document.getRange(__privateGet(this, _selection)));
    } else if (ev.key === "ArrowDown") {
      if (__privateGet(this, _cursor).line + 1 < this.document.getLines().length) {
        this.moveCursor(1, 0);
      }
    } else if (ev.key === "ArrowUp") {
      if (__privateGet(this, _cursor).line - 1 >= 0) {
        this.moveCursor(-1, 0);
      }
    } else if (ev.key === "ArrowRight") {
      const currline = this.document.getLine(__privateGet(this, _cursor).line);
      if (__privateGet(this, _cursor).line + 1 < this.document.getLines().length && __privateGet(this, _cursor).col + 1 > currline.length) {
        this.moveCursor(1, 0);
        __privateGet(this, _cursor).col = 0;
      } else if (__privateGet(this, _cursor).col < currline.length) {
        __privateGet(this, _cursor).col++;
        if (__privateGet(this, _pressedKeys)["Control"] && TEXT_REGEX.test(currline[__privateGet(this, _cursor).col - 1])) {
          while (__privateGet(this, _cursor).col + 1 <= currline.length && TEXT_REGEX.test(currline[__privateGet(this, _cursor).col])) {
            __privateGet(this, _cursor).col++;
          }
        }
      }
    } else if (ev.key === "ArrowLeft") {
      if (__privateGet(this, _cursor).col - 1 < 0 && __privateGet(this, _cursor).line - 1 >= 0) {
        this.moveCursor(-1, 0);
        __privateGet(this, _cursor).col = this.document.getLine(__privateGet(this, _cursor).line).length;
      } else if (__privateGet(this, _cursor).col - 1 >= 0) {
        __privateGet(this, _cursor).col--;
        const currline = this.document.getLine(__privateGet(this, _cursor).line);
        if (__privateGet(this, _pressedKeys)["Control"] && TEXT_REGEX.test(currline[__privateGet(this, _cursor).col])) {
          while (__privateGet(this, _cursor).col - 1 >= 0 && TEXT_REGEX.test(currline[__privateGet(this, _cursor).col]))
            __privateGet(this, _cursor).col--;
          if (!TEXT_REGEX.test(currline[__privateGet(this, _cursor).col]))
            __privateGet(this, _cursor).col++;
        }
      }
    } else if (ev.key === "Delete") {
      if (__privateGet(this, _selection)) {
        __privateMethod(this, _replaceSelection, replaceSelection_fn).call(this, "");
      } else {
        this.document.deleteAt({
          line: __privateGet(this, _cursor).line,
          col: __privateGet(this, _cursor).col + 1
        });
      }
    } else if (ev.key === "Backspace") {
      const currLine = this.document.getLine(__privateGet(this, _cursor).line);
      if (__privateGet(this, _selection)) {
        __privateMethod(this, _replaceSelection, replaceSelection_fn).call(this, "");
      } else if (__privateGet(this, _cursor).col > 0) {
        if (__privateGet(this, _cursor).col !== currLine.length) {
          this.document.deleteAt(__privateGet(this, _cursor));
          this.moveCursor(0, -1);
        } else {
          this.document.deleteAt(__privateGet(this, _cursor));
        }
      } else if (__privateGet(this, _cursor).line - 1 >= 0) {
        const currline = __privateGet(this, _cursor).line;
        const rest = this.document.getLine(currline);
        this.moveCursor(-1, 0);
        __privateGet(this, _cursor).col = this.document.getLine(__privateGet(this, _cursor).line).length;
        this.document.insertAt(
          __privateGet(this, _cursor),
          rest
        );
        this.document.removeLine(currline);
      }
    } else if (ev.key === "Enter") {
      const currline = this.document.getLine(__privateGet(this, _cursor).line);
      const rest = currline.substring(__privateGet(this, _cursor).col);
      this.document.setLine(__privateGet(this, _cursor).line, currline.substring(0, __privateGet(this, _cursor).col));
      this.document.addLine(__privateGet(this, _cursor).line + 1, rest);
      this.moveCursor(1, 0);
      __privateGet(this, _cursor).col = 0;
      __privateMethod(this, _triggerEvent, triggerEvent_fn).call(this, "key", "\n");
    } else if (ev.key.length === 1) {
      if (__privateGet(this, _selection)) {
        __privateMethod(this, _replaceSelection, replaceSelection_fn).call(this, ev.key);
      } else {
        this.document.insertAt(__privateGet(this, _cursor), ev.key);
        this.moveCursor(0, 1);
      }
      __privateMethod(this, _triggerEvent, triggerEvent_fn).call(this, "key", ev.key);
    } else if (ev.key === "Home") {
      __privateGet(this, _cursor).col = 0;
    } else if (ev.key === "End") {
      __privateGet(this, _cursor).col = this.document.getLine(__privateGet(this, _cursor).line).length;
    } else if (ev.key === "Control") {
      __privateGet(this, _pressedKeys)[ev.key] = true;
    } else {
      console.log("Pressed unknown key", ev.key);
    }
  }));
};
export {
  EditorPlugin,
  EditorView,
  TokenType,
  Editor as default
};
