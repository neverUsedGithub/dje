import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-P73PLKE6.js";

// src/editorDocument.ts
var _lines, _genTokens;
var EditorDocument = class {
  constructor(content, genTokens) {
    __privateAdd(this, _lines, void 0);
    __privateAdd(this, _genTokens, void 0);
    __privateSet(this, _lines, content.split("\n"));
    __privateSet(this, _genTokens, genTokens);
  }
  deleteAt({ line, col }) {
    const ln = __privateGet(this, _lines)[line];
    __privateGet(this, _lines)[line] = ln.substring(0, col - 1) + ln.substring(col);
    __privateGet(this, _genTokens).call(this);
  }
  insertAt({ line, col }, text) {
    if (text.includes("\n")) {
      const lines = text.split("\n");
      const restText = __privateGet(this, _lines)[line].substring(col);
      this.setLine(line, __privateGet(this, _lines)[line].substring(0, col) + lines[0]);
      for (let offset = 1; offset < lines.length; offset++) {
        this.addLine(line + offset, lines[offset] + (offset === lines.length - 1 ? restText : ""));
      }
      return;
    }
    const ln = __privateGet(this, _lines)[line];
    __privateGet(this, _lines)[line] = ln.substring(0, col) + text + ln.substring(col);
    __privateGet(this, _genTokens).call(this);
  }
  removeLine(line) {
    __privateGet(this, _lines).splice(line, 1);
    __privateGet(this, _genTokens).call(this);
  }
  addLine(line, text) {
    __privateGet(this, _lines).splice(line, 0, text);
    __privateGet(this, _genTokens).call(this);
  }
  positionToIndex({ line, col }) {
    let index = col;
    for (let i = 0; i < line; i++) {
      index += __privateGet(this, _lines)[i].length + 1;
    }
    return index;
  }
  replaceRange({ start, end }, replacement) {
    if (!end)
      throw new Error("Unexpected value for replaceRange({ start, end }, replacement), end cannot be undefined.");
    if (start.line > end.line || start.line === end.line && start.col > end.col)
      return this.replaceRange({
        start: end,
        end: start
      }, replacement);
    let text = __privateGet(this, _lines).join("\n");
    const startR = this.positionToIndex(start);
    const endR = this.positionToIndex(end);
    text = text.substring(0, startR) + replacement + text.substring(endR);
    __privateSet(this, _lines, text.split("\n"));
    __privateGet(this, _genTokens).call(this);
  }
  getRange({ start, end }) {
    if (!end)
      throw new Error("Unexpected value for getRange({ start, end }), end cannot be undefined.");
    if (start.line > end.line || start.line === end.line && start.col > end.col)
      return this.getRange({ start: end, end: start });
    const text = __privateGet(this, _lines).join("\n");
    const startR = this.positionToIndex(start);
    const endR = this.positionToIndex(end);
    return text.substring(startR, endR);
  }
  setLine(line, text) {
    __privateGet(this, _lines)[line] = text;
    __privateGet(this, _genTokens).call(this);
  }
  getText() {
    return __privateGet(this, _lines).join("\n");
  }
  setText(content) {
    __privateSet(this, _lines, content.split("\n"));
    __privateGet(this, _genTokens).call(this);
  }
  getLines() {
    return __privateGet(this, _lines);
  }
  getLine(line) {
    return __privateGet(this, _lines)[line];
  }
};
_lines = new WeakMap();
_genTokens = new WeakMap();

export {
  EditorDocument
};
