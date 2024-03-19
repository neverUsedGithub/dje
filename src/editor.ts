import EditorDocument from "./editorDocument.js";
import EditorView, { EditorTheme } from "./editorView.js";
import type { Token } from "./languages.js";
import type { DocumentPosition, DocumentSelection } from "./editorDocument.js";
import Plaintext from "./languages/plaintext.js";

const TEXT_REGEX = /[A-z_0-9]/;
export { EditorView };

export enum TokenType {
  string = "string",
  number = "number",
  comment = "comment",
  keyword = "keyword",
  builtin = "builtin",
  variableName = "variableName",
  className = "className",
  functionName = "functionName",
  boolean = "boolean",
  regex = "regex",
  operator = "operator",
  constant = "constant",
  property = "property",
  punctuation = "punctuation",
  tagName = "tagName",
  text = "text",
}

export interface EditorLanguageMode {
  lex(contents: string): Token[][];
}

export interface EditorPluginOptions {
  editor: Editor;
  canvasEl: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  getTokens: () => Token[][];
}

export abstract class EditorPlugin {
  abstract attachEditor(options: EditorPluginOptions): void;
}

interface EditorOptions {
  element: HTMLCanvasElement | string;
  content: string;
  mode: EditorLanguageMode;
  plugins: EditorPlugin[];
  theme: EditorTheme;
  tabSize?: number;
  tabIndentsLine?: boolean;
  readOnly?: boolean;
}

function getSelectionSide(
  selection: DocumentSelection,
  side: "left" | "right"
) {
  if (
    selection.start.line < selection!.end!.line ||
    selection.start.col <= selection!.end!.col
  )
    return side === "left" ? selection.start : selection.end!;

  return side === "left" ? selection.end! : selection.start;
}

export default class Editor {
  #canvasEl: HTMLCanvasElement;
  #context: CanvasRenderingContext2D | null;
  #cursor: DocumentPosition;
  #selection: DocumentSelection | null;
  #events: Record<string, Function[]>;
  #shouldSelect: boolean;
  #inputTextArea: HTMLTextAreaElement;
  #pressedKeys: Record<string, boolean>;
  #currentMode: EditorLanguageMode;
  #tabIndentsLine: boolean;
  #tokens: Token[][];
  #plugins: EditorPlugin[];
  #view: EditorView;
  #readOnly: boolean;
  tabSize: number;
  document: EditorDocument;

  constructor({
    element,
    content,
    mode,
    plugins,
    theme,
    tabSize,
    tabIndentsLine,
    readOnly,
  }: EditorOptions) {
    this.#canvasEl = (
      typeof element === "string" ? document.querySelector(element) : element
    ) as HTMLCanvasElement;
    this.#context = null;
    this.#cursor = { line: 0, col: 0 };
    this.#events = {};
    this.#selection = null;
    this.#shouldSelect = false;
    this.#pressedKeys = {};
    this.#plugins = [];
    this.#currentMode = mode ?? new Plaintext();
    this.#view = new EditorView(theme || {});
    this.#tokens = [];
    this.#tabIndentsLine = tabIndentsLine ?? false;
    this.#readOnly = readOnly ?? false;

    this.#inputTextArea = document.createElement("textarea");
    this.#inputTextArea.style.position = "absolute";
    this.#inputTextArea.style.top = "-99999px";
    this.#inputTextArea.style.left = "-99999px";
    this.#inputTextArea.style.width = "0px";
    this.#inputTextArea.style.height = "0px";
    document.body.appendChild(this.#inputTextArea);
    this.focus();

    this.tabSize = tabSize ?? 4;
    this.document = new EditorDocument(content, () => this.#generateTokens());

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

  on(name: string, callback: (...args: any) => void) {
    if (!this.#events[name]) this.#events[name] = [];

    this.#events[name].push(callback);
  }

  #triggerEvent(name: string, ...args: any[]) {
    if (this.#events[name])
      for (let i = 0; i < this.#events[name].length; i++)
        this.#events[name][i](...args);
  }

  setMode(mode: EditorLanguageMode) {
    this.#currentMode = mode;
  }

  getSelection() {
    return this.#selection;
  }

  moveCursor(lines: number, cols: number) {
    this.#cursor.line += lines;
    if (this.#cursor.line < 0) this.#cursor.line = 0;
    else if (this.#cursor.line >= this.document.getLines().length)
      this.#cursor.line = this.document.getLines().length - 1;

    this.#cursor.col += cols;
    if (this.#cursor.col < 0) this.#cursor.col = 0;
    else if (this.#cursor.col > this.document.getLine(this.#cursor.line).length)
      this.#cursor.col = this.document.getLine(this.#cursor.line).length;
  }

  setReadOnly(value: boolean) {
    this.#readOnly = value;
  }

  getReadOnly() {
    return this.#readOnly;
  }

  setCursor(line: number, col: number) {
    this.#cursor.line = line;
    this.#cursor.col = col;

    this.moveCursor(0, 0);
  }

  getCursor() {
    return { ...this.#cursor };
  }

  use(plugin: EditorPlugin) {
    plugin.attachEditor({
      editor: this,
      canvasEl: this.#canvasEl,
      context: this.#context as CanvasRenderingContext2D,
      getTokens: () => this.#tokens,
    });
    this.#plugins.push(plugin);
  }

  focus() {
    this.#inputTextArea.focus();
  }

  fit() {
    this.#canvasEl.width = (
      this.#canvasEl.parentElement as HTMLElement
    ).clientWidth;
    this.#canvasEl.height = (
      this.#canvasEl.parentElement as HTMLElement
    ).clientHeight;
    this.#context = this.#canvasEl.getContext("2d");
  }

  #replaceSelection(text: string) {
    if (!this.#selection) return;

    if (!this.#selection.end) this.#selection.end = { ...this.#cursor };

    this.document.replaceRange(this.#selection, text);
    if (
      this.#selection.start.line > this.#selection.end.line ||
      (this.#selection.start.line === this.#selection.end.line &&
        this.#selection.start.col > this.#selection.end.col)
    ) {
      this.#cursor.line = this.#selection.end.line;
      this.#cursor.col = this.#selection.end.col + text.length;
    } else {
      this.#cursor.line = this.#selection.start.line;
      this.#cursor.col = this.#selection.start.col + text.length;
    }
    this.#selection = null;
  }

  #addListeners() {
    this.#canvasEl.addEventListener("click", () => {
      this.focus();
    });

    this.#inputTextArea.addEventListener("keyup", (ev) => {
      ev.preventDefault();
      delete this.#pressedKeys[ev.key];

      if (ev.key === "Shift") {
        this.#shouldSelect = false;
        if (!this.#selection) return;

        this.#selection.end = {
          line: this.#cursor.line,
          col: this.#cursor.col,
        };
      }
    });

    this.#inputTextArea.addEventListener("keydown", async (ev) => {
      ev.preventDefault();

      this.#pressedKeys[ev.key] = true;
      this.#triggerEvent("press", ev);

      if (
        ev.key === "ArrowUp" ||
        ev.key === "ArrowDown" ||
        ev.key === "ArrowLeft" ||
        ev.key === "ArrowRight" ||
        ev.key === "Home" ||
        ev.key === "End"
      ) {
        if (this.#shouldSelect) {
          this.#selection = {
            start: { line: this.#cursor.line, col: this.#cursor.col },
            end: null,
          };
          this.#shouldSelect = false;
        }
        if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight")
          if (this.#selection && this.#selection.end) this.#selection = null;
      }

      if (ev.key === "Shift") {
        this.#shouldSelect = true;
      } else if (ev.key === "ArrowDown") {
        if (this.#cursor.line + 1 < this.document.getLines().length) {
          this.moveCursor(1, 0);
        }
      } else if (ev.key === "ArrowUp") {
        if (this.#cursor.line - 1 >= 0) {
          this.moveCursor(-1, 0);
        }
      } else if (ev.key === "ArrowRight") {
        if (this.#selection && this.#selection.end) {
          const pos = getSelectionSide(this.#selection, "right");
          this.#cursor.col = pos.col;
          this.#cursor.line = pos.line;
          this.#selection = null;
          return;
        }

        const currline = this.document.getLine(this.#cursor.line);
        if (
          this.#cursor.line + 1 < this.document.getLines().length &&
          this.#cursor.col + 1 > currline.length
        ) {
          this.moveCursor(1, 0);
          this.#cursor.col = 0;
        } else if (this.#cursor.col < currline.length) {
          this.#cursor.col++;

          if (
            this.#pressedKeys["Control"] &&
            TEXT_REGEX.test(currline[this.#cursor.col - 1])
          ) {
            while (
              this.#cursor.col + 1 <= currline.length &&
              TEXT_REGEX.test(currline[this.#cursor.col])
            ) {
              this.#cursor.col++;
            }
          }
        }
      } else if (ev.key === "ArrowLeft") {
        if (this.#selection && this.#selection.end) {
          const pos = getSelectionSide(this.#selection, "left");
          this.#cursor.col = pos.col;
          this.#cursor.line = pos.line;
          this.#selection = null;
          return;
        }

        if (this.#cursor.col - 1 < 0 && this.#cursor.line - 1 >= 0) {
          this.moveCursor(-1, 0);
          this.#cursor.col = this.document.getLine(this.#cursor.line).length;
        } else if (this.#cursor.col - 1 >= 0) {
          this.#cursor.col--;

          const currline = this.document.getLine(this.#cursor.line);
          if (
            this.#pressedKeys["Control"] &&
            TEXT_REGEX.test(currline[this.#cursor.col])
          ) {
            while (
              this.#cursor.col - 1 >= 0 &&
              TEXT_REGEX.test(currline[this.#cursor.col])
            )
              this.#cursor.col--;

            if (!TEXT_REGEX.test(currline[this.#cursor.col]))
              this.#cursor.col++;
          }
        }
      } else if (ev.key === "Home") {
        this.#cursor.col = 0;
      } else if (ev.key === "End") {
        this.#cursor.col = this.document.getLine(this.#cursor.line).length;
      } else if (ev.key === "Control") {
        this.#pressedKeys[ev.key] = true;
      } else if (ev.key === "a" && this.#pressedKeys["Control"]) {
        const lineCount = this.document.getLineCount();
        this.#selection = {
          start: { line: 0, col: 0 },
          end: {
            line: lineCount - 1,
            col: this.document.getLine(lineCount - 1).length,
          },
        };
        return;
      }

      if (this.#readOnly) return;

      if (ev.key === "Tab") {
        if (this.#selection) {
          if (this.#selection.end) {
            let startLine = this.#selection.start.line;
            let endLine = this.#selection.end.line;

            if (endLine < startLine) {
              startLine = endLine;
              endLine = this.#selection.start.line;
            }

            for (let lineI = startLine; lineI <= endLine; lineI++) {
              const line = this.document.getLine(lineI);

              if (this.#pressedKeys["Shift"]) {
                if (line.startsWith(" ".repeat(this.tabSize)))
                  this.document.setLine(lineI, line.substring(this.tabSize));
              } else {
                this.document.setLine(lineI, " ".repeat(this.tabSize) + line);
              }
            }
          }
        } else if (!this.#tabIndentsLine) {
          this.document.insertAt(this.#cursor, " ".repeat(this.tabSize));
          this.#cursor.col += 2;
        } else {
          if (this.#pressedKeys["Shift"]) {
            const currline = this.document.getLine(this.#cursor.line);
            if (currline.startsWith(" ".repeat(this.tabSize))) {
              this.moveCursor(0, -this.tabSize);
              this.document.setLine(
                this.#cursor.line,
                currline.substring(this.tabSize)
              );
            }
          } else {
            this.document.setLine(
              this.#cursor.line,
              " ".repeat(this.tabSize) +
                this.document.getLine(this.#cursor.line)
            );
            this.moveCursor(0, this.tabSize);
          }
        }
      } else if (this.#pressedKeys["Control"] && ev.key === "v") {
        const clipText = await navigator.clipboard.readText();
        const split = clipText.split("\n");

        this.document.insertAt(this.#cursor, clipText);
        this.moveCursor(split.length - 1, split[split.length - 1].length);
      } else if (this.#pressedKeys["Control"] && ev.key === "c") {
        if (this.#selection)
          await navigator.clipboard.writeText(
            this.document.getRange(this.#selection)
          );
      } else if (ev.key === "Delete") {
        if (this.#selection) {
          this.#replaceSelection("");
        } else {
          this.document.deleteAt({
            line: this.#cursor.line,
            col: this.#cursor.col + 1,
          });
        }
      } else if (ev.key === "Backspace") {
        const currLine = this.document.getLine(this.#cursor.line);

        if (this.#selection) {
          this.#replaceSelection("");
        } else if (this.#cursor.col > 0) {
          if (this.#cursor.col !== currLine.length) {
            this.document.deleteAt(this.#cursor);
            this.moveCursor(0, -1);
          } else {
            this.document.deleteAt(this.#cursor);
          }
        } else if (this.#cursor.line - 1 >= 0) {
          const currline = this.#cursor.line;
          const rest = this.document.getLine(currline);

          this.moveCursor(-1, 0);
          this.#cursor.col = this.document.getLine(this.#cursor.line).length;
          this.document.insertAt(this.#cursor, rest);

          this.document.removeLine(currline);
        }
      } else if (ev.key === "Enter") {
        if (this.#selection && this.#selection.end) {
          this.document.replaceRange(this.#selection, "\n");
          this.#selection = null;
          this.moveCursor(1, 0);
        } else {
          const currline = this.document.getLine(this.#cursor.line);
          const rest = currline.substring(this.#cursor.col);
          this.document.setLine(
            this.#cursor.line,
            currline.substring(0, this.#cursor.col)
          );

          this.document.addLine(this.#cursor.line + 1, rest);
          this.moveCursor(1, 0);
          this.#cursor.col = 0;

          this.#triggerEvent("key", "\n");
        }
      } else if (ev.key.length === 1) {
        if (this.#selection) {
          this.#replaceSelection(ev.key);
        } else {
          this.document.insertAt(this.#cursor, ev.key);
          this.moveCursor(0, 1);
        }

        this.#triggerEvent("key", ev.key);
      }
    });
  }
}
