import EditorDocument from "./editorDocument.js";
import EditorView from "./editorView.js";

const TEXT_REGEX = /[A-z_0-9]/;
export { EditorView };

export default class Editor {
  #canvasEl;
  #context;
  #cursor;
  #selection;
  #events;
  #shouldSelect;
  #inputTextArea;
  #pressedKeys;
  #currentMode;
  #tokens;
  #plugins;
  #view;

  constructor({ element, content, mode, plugins, theme, tabSize }) {
    /** @type {HTMLCanvasElement} */
    this.#canvasEl = typeof element === "string" ? document.querySelector(element) : element;
    /** @type {CanvasRenderingContext2D} */
    this.#context = null;
    this.#cursor = { line: 0, col: 0 };
    this.#events = {};
    this.#selection = null;
    this.#shouldSelect = false;
    this.#pressedKeys = {};
    this.#plugins = [];
    this.#currentMode = mode;
    this.#view = new EditorView(theme || {});
    
    this.#inputTextArea = document.createElement("textarea");
    this.#inputTextArea.style.position = "absolute";
    this.#inputTextArea.style.top = "-99999px";
    this.#inputTextArea.style.left = "-99999px";
    this.#inputTextArea.style.width = "0px";
    this.#inputTextArea.style.height = "0px";
    document.body.appendChild(this.#inputTextArea);
    this.focus();
    
    this.tabSize = tabSize;
    this.document = new EditorDocument(content, () => this.#generateTokens())
    
    this.fit();
    this.#generateTokens();
    this.#addListeners();

    this.use(this.#view);
    if (plugins) for (const pl of plugins) this.use(pl);
  }

  #generateTokens() {
    // When editor changed, move the cursor 0 lines and 0 cols
    // so, if its in an illegal state it can get clamped.
    this.moveCursor(0, 0);
    this.#tokens = this.#currentMode.lex(this.document.getText());
  }

  getTokens() {
    return this.#tokens;
  }

  on(name, callback) {
    if (!this.#events[name])
      this.#events[name] = [];

    this.#events[name].push(callback);
  }

  #triggerEvent(name, ...args) {
    if (this.#events[name])
      for (let i = 0; i < this.#events[name].length; i++)
      this.#events[name][i](...args);
  }

  getSelection() {
    return this.#selection;
  }

  moveCursor(lines, cols) {
    this.#cursor.line += lines;
    if (this.#cursor.line < 0) this.#cursor.line = 0;
    else if (this.#cursor.line >= this.document.getLines().length)
      this.#cursor.line = this.document.getLines().length - 1;
    
    this.#cursor.col += cols;
    if (this.#cursor.col < 0) this.#cursor.col = 0;
    else if (this.#cursor.col > this.document.getLine(this.#cursor.line).length)
      this.#cursor.col = this.document.getLine(this.#cursor.line).length;
  }
  getCursor() { return { ...this.#cursor }; }
  getPlugin(id) { return this.#plugins[id]; }

  use(plugin) {
    plugin.attachEditor(this, this.#canvasEl, this.#context, () => this.#tokens);
    this.#plugins.push(plugin);
  }

  focus() {
    this.#inputTextArea.focus();
  }
  
  fit() {
    this.#canvasEl.width = this.#canvasEl.parentElement.clientWidth;
    this.#canvasEl.height = this.#canvasEl.parentElement.clientHeight;
    this.#context = this.#canvasEl.getContext("2d");
  }

  #replaceSelection(text) {
    if (!this.#selection.end)
      this.#selection.end = { ...this.#cursor };

    this.document.replaceRange(this.#selection, text);
    if (this.#selection.start.line > this.#selection.end.line ||
      (
        this.#selection.start.line === this.#selection.end.line &&
        this.#selection.start.col > this.#selection.end.col
      )
    ) {
      this.#cursor.line = this.#selection.end.line;
      this.#cursor.col = this.#selection.end.col + text.length;
    }
    else {
      this.#cursor.line = this.#selection.start.line;
      this.#cursor.col = this.#selection.start.col + text.length;
    }
    this.#selection = null;
  }

  #addListeners() {
    this.#canvasEl.addEventListener("click", () => {
      this.focus();
    })

    this.#inputTextArea.addEventListener("keyup", ev => {
      ev.preventDefault();
      
      if (ev.key === "Shift") {
        this.#shouldSelect = false;
        if (!this.#selection) return;

        this.#selection.end = { line: this.#cursor.line, col: this.#cursor.col };
      }
      
      delete this.#pressedKeys[ev.key];
    });

    this.#inputTextArea.addEventListener("keydown", ev => {
      ev.preventDefault();

      this.#pressedKeys[ev.key] = true;
      this.#triggerEvent("press", ev);
      if (ev.key === "ArrowUp" ||
          ev.key === "ArrowDown" ||
          ev.key === "ArrowLeft" ||
          ev.key === "ArrowRight") {
        if (this.#shouldSelect) {
          this.#selection = {
            start: { line: this.#cursor.line, col: this.#cursor.col },
            end: null
          };
          this.#shouldSelect = false;
        }
        if (this.#selection && this.#selection.end)
          this.#selection = null;
      }
      if (ev.key === "Shift") {
        if (this.#selection) this.#selection = null;
        else this.#shouldSelect = true;
      }
      else if (ev.key === "Tab") {
        this.document.insertAt(this.#cursor, " ".repeat(this.tabSize));
        this.#cursor.col += 2;
      }
      else if (ev.key === "ArrowDown") {
        if (this.#cursor.line + 1 < this.document.getLines().length) {
          this.moveCursor(1, 0);
        }
      }
      else if (ev.key === "ArrowUp") {
        if (this.#cursor.line - 1 >= 0) {
          this.moveCursor(-1, 0);
        }
      }
      else if (ev.key === "ArrowRight") {
        const currline = this.document.getLine(this.#cursor.line);
        if (this.#cursor.line + 1 < this.document.getLines().length && this.#cursor.col + 1 > currline.length) {
          this.moveCursor(1, 0);
          this.#cursor.col = 0;
        }
        else if (this.#cursor.col < currline.length) {
          this.#cursor.col++;

          if (
            this.#pressedKeys["Control"] &&
            TEXT_REGEX.test(currline[this.#cursor.col - 1])
          ) {

            while (this.#cursor.col + 1 <= currline.length && TEXT_REGEX.test(currline[this.#cursor.col])) {
              this.#cursor.col++;
            }
          }
        }
      }
      else if (ev.key === "ArrowLeft") {
        if (this.#cursor.col - 1 < 0 && this.#cursor.line - 1 >= 0) {
          this.moveCursor(-1, 0);
          this.#cursor.col = this.document.getLine(this.#cursor.line).length;
        }
        else if (this.#cursor.col - 1 >= 0) {
          this.#cursor.col--;

          const currline = this.document.getLine(this.#cursor.line);
          if (
            this.#pressedKeys["Control"] &&
            TEXT_REGEX.test(currline[this.#cursor.col])
          ) {

            while (this.#cursor.col - 1 >= 0 && TEXT_REGEX.test(currline[this.#cursor.col]))
              this.#cursor.col--;

            if (!TEXT_REGEX.test(currline[this.#cursor.col]))
              this.#cursor.col++;
          }
        }
      }
      else if (ev.key === "Delete") {
        const currLine = this.document.getLine(this.#cursor.line);

        if (this.#selection) {
          this.#replaceSelection("");
        }
        else {
          this.document.deleteAt({
            line: this.#cursor.line,
            col: this.#cursor.col + 1
          });
        }
      }
      else if (ev.key === "Backspace") {
        const currLine = this.document.getLine(this.#cursor.line);

        if (this.#selection) {
          this.#replaceSelection("");
        }
        else if (this.#cursor.col > 0) {
          if (this.#cursor.col !== currLine.length) {
            this.document.deleteAt(this.#cursor);
            this.moveCursor(0, -1);
          }
          else {
            this.document.deleteAt(this.#cursor);
          }
        }
        else if (this.#cursor.line - 1 >= 0) {
          const currline = this.#cursor.line;
          const rest = this.document.getLine(currline);

          this.moveCursor(-1, 0);
          this.#cursor.col = this.document.getLine(this.#cursor.line).length;
          this.document.insertAt(
            this.#cursor, rest
          );

          this.document.removeLine(currline);
        }
      }
      else if (ev.key === "Enter") {
        const currline = this.document.getLine(this.#cursor.line);
        const rest = currline.substring(this.#cursor.col);
        this.document.setLine(this.#cursor.line, currline.substring(0, this.#cursor.col));
      
        this.document.addLine(this.#cursor.line + 1, rest);
        this.moveCursor(1, 0);
        this.#cursor.col = 0;
        
        this.#triggerEvent("key", "\n");
      }
      else if (ev.key.length === 1) {
        if (this.#selection) {
          this.#replaceSelection(ev.key);
        }
        else {
          this.document.insertAt(this.#cursor, ev.key);
          this.moveCursor(0, 1);
        }
        
        this.#triggerEvent("key", ev.key);
      }
      else if (ev.key === "Home") {
        this.#cursor.col = 0;
      }
      else if (ev.key === "End") {
        this.#cursor.col = this.document.getLine(this.#cursor.line).length;
      }
      else if (ev.key === "Control") {
        this.#pressedKeys[ev.key] = true;
      }
      else {
        console.log("Pressed unknown key", ev.key);
      }
      
    })
  }
}