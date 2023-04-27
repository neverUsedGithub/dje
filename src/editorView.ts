import type { default as Editor, EditorPlugin, EditorPluginOptions, TokenType } from "./editor";
import type { DocumentSelection } from "./editorDocument";
import type { Token } from "./languages";

interface Position { x: number, y: number }
type TokenColorMain = string
                    | (
                      { type: "gradient", stops: Record<number, string> }
                      | { color: string, fontWeight?: number }
                    ) & { style: string };

export type EditorTheme = {
  cursorColor?: string;
  background?: string;
  foreground?: string;
  selection?: string;
} & Record<TokenType, TokenColorMain>

const lerp = (from: number, to: number, t: number) => from + t * (to - from);
// const smoothstep = (from, to, amt) => 
//   lerp(from, to, amt ** 2 * (3 - 2 * amt));
// const cosine = (from, to, t) => 
//   lerp(from, to, -Math.cos(Math.PI * t) / 2 + 0.5);

const EASING_FUNCTION = lerp;

function getColorFor(theme: EditorTheme, type: string) {
  let current = theme.foreground as string;
  return (theme as Record<string, string>)[type] || current;
}

function getContextColor(
  color: TokenColorMain,
  startX: number,
  endX: number,
  context: CanvasRenderingContext2D
): CanvasGradient | string {
  if (typeof color !== "string" && "type" in color && color.type === "gradient") {
    const grad = context.createLinearGradient(startX, 0, endX, 0);

    for (const [ stopOffset, stopColor ] of Object.entries(color.stops))
      grad.addColorStop(parseFloat(stopOffset), stopColor);
    
    return grad;
  }

  if (typeof color !== "string" && !("color" in color))
    throw new Error("Invalid color");

  return typeof color === "string"
    ? color
    : getContextColor(color.color, startX, endX, context);
}

function colorToFont(color: TokenColorMain, fontSize: number, fontFamily: string): string {
  if (typeof color === "string")
    return `${fontSize}px ${fontFamily}`;
  
  return ("style" in color ? color.style + " " : "") +
         ("fontWeight" in color ? color.fontWeight + " " : "") +
         `${fontSize}px ${fontFamily}`;
}

export default class EditorView implements EditorPlugin {
  #canvasEl: HTMLCanvasElement | null;
  #context: CanvasRenderingContext2D | null;
  #editor: Editor | null;
  #cursorTimer: number;
  #lastTime: number | null;
  #drawnCamera: Position;
  #lastScale: number;
  #characterWidth: number;
  #characterHeight: number;
  #getTokens: (() => Token[][]) | null;
  #fontFamily: string;
  theme: EditorTheme;
  lineHeight: number;
  fontSize: number;
  animationSpeed: number;
  cursorBlinkTime: number;

  constructor(userTheme: EditorTheme) {
    this.theme = {
      foreground: "#eee",
      background: "#222",
      cursorColor: "#aaa",
      selection: "#888",
      ...userTheme
    };
    this.lineHeight = 50;
    this.fontSize = 30;
    this.animationSpeed = 2;
    this.cursorBlinkTime = 0.5;
    this.#cursorTimer = 0;
    this.#lastTime = null;
    this.#fontFamily = "monospace";
    this.#lastScale = 1;
    this.#drawnCamera = { x: 0, y: 0 };
    this.#characterHeight = 0;
    this.#characterWidth = 0;
    this.#canvasEl = null;
    this.#context = null;
    this.#editor = null;
    this.#getTokens = null;
  }

  attachEditor({ editor, canvasEl, context, getTokens }: EditorPluginOptions) {
    this.#canvasEl = canvasEl;
    this.#context = context;
    this.#editor = editor;
    this.#getTokens = getTokens;
    this.#context.font = `${this.fontSize}px ${this.#fontFamily}`;

    this.#adjustFont();

    this.#editor.on("press", () => {
      this.#cursorTimer = 0;
    })
    requestAnimationFrame(this.#draw.bind(this));
  }

  #adjustFont() {
    const metrics = this.#context!.measureText("A");
    this.#characterWidth = metrics.width;
    this.#characterHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  }

  #drawSelection(
    transform: { x: number, y: number },
    lineHeight: number,
    charWidth: number,
    charHeight: number,
    selection: DocumentSelection
  ): void {
    if (!selection.end) {
      console.warn("Tried to draw a selection without an ending.");
      return;
    }

    if (selection.start.line > selection.end.line ||
       (
        selection.start.line === selection.end.line &&
        selection.start.col > selection.end.col
       ))
      return this.#drawSelection(
        transform, lineHeight, charWidth, charHeight,
        {
          start: selection.end,
          end: selection.start
        }
      );

    // Selection start < selection end
    this.#context!.fillStyle = this.theme.selection as string;
    for (let line = selection.start.line; line <= selection.end.line; line++) {
      
      if (line === selection.start.line && selection.start.line === selection.end.line) {
        this.#context!.fillRect(
          transform.x + selection.start.col * charWidth,
          transform.y + line * lineHeight - lineHeight,
          (selection.end.col - selection.start.col) * charWidth,
          charHeight
        )
      }
      else if (line === selection.start.line) {
        this.#context!.fillRect(
          transform.x + selection.start.col * charWidth,
          transform.y + line * lineHeight - lineHeight,
          Math.max(
            (this.#editor!.document.getLine(line).length - selection.start.col) * charWidth,
            charWidth
          ),
          charHeight
        )
      }
      else if (line === selection.end.line) {
        this.#context!.fillRect(
          transform.x + 0,
          transform.y + line * lineHeight - lineHeight,
          selection.end.col * charWidth,
          charHeight
        )
      }
      else {
        this.#context!.fillRect(
          transform.x + 0,
          transform.y + line * lineHeight - lineHeight,
          Math.max(this.#editor!.document.getLine(line).length * charWidth, charWidth),
          charHeight
        )
      }
    }
  }

  #draw(time: number): void {
    if (this.#lastTime === null) {
      this.#lastTime = time;
      requestAnimationFrame(this.#draw.bind(this));
      return;
    }

    const delta = Math.min(time - this.#lastTime, 100) / 1000;
    this.#lastTime = time;
    this.#context!.fillStyle = this.theme.background as string;

    const maxLineLength = Math.max(
      ...this.#editor!.document.getLines().map(l => l.length)
    );
    const scaleTarget = Math.min(1 + 32 / maxLineLength, 7);
    // @ts-ignore
    const scale = EASING_FUNCTION(this.#lastScale, scaleTarget, this.animationSpeed * delta);
    this.#lastScale = scale;    
    const charWidth = this.#characterWidth * scale;
    const charHeight = this.#characterHeight * scale;
    // @ts-ignore
    const lineHeight = this.lineHeight * scale;
    // @ts-ignore
    const fontSize = this.fontSize * scale;
    // @ts-ignore
    this.#context.font = `${fontSize}px ${this.#fontFamily}`;

    this.#context!.fillRect(
      0, 0, this.#canvasEl!.width, this.#canvasEl!.height
    );

    const cameraTarget = {
      x: -this.#editor!.getCursor().col * charWidth,
      y: -this.#editor!.getCursor().line * lineHeight
    };

    this.#drawnCamera = {
      // @ts-ignore
      x: EASING_FUNCTION(this.#drawnCamera.x, cameraTarget.x, this.animationSpeed * delta),
      // @ts-ignore
      y: EASING_FUNCTION(this.#drawnCamera.y, cameraTarget.y, this.animationSpeed * delta)
    };

    const transform = {
      x: this.#canvasEl!.width / 2 + this.#drawnCamera.x,
      y: this.#canvasEl!.height / 2 + this.#drawnCamera.y
    };

    const sel = this.#editor!.getSelection();
    if (sel) {
      this.#drawSelection(transform, lineHeight, charWidth, charHeight, {
        start: sel.start,
        end: sel.end || this.#editor!.getCursor()
      });
    } 
  
    /*
    for (let i = 0; i < this.#editor.document.getLines().length; i++) {
      this.#context.fillStyle = this.theme.foreground;
      
      this.#context.textBaseline = "top";
      this.#context.fillText(
        this.#editor.document.getLines()[i],
        transform.x + 0,
        transform.y + i * lineHeight - lineHeight + charHeight / 5
      );
    }
    */
    const tokens = this.#getTokens!();
    for (let lineNo = 0; lineNo < tokens.length; lineNo++) {
      let col = 0;
      for (const token of tokens[lineNo]) {
        const color = getColorFor(this.theme, token.type);
        this.#context!.font = colorToFont(color, fontSize, this.#fontFamily);
        this.#context!.fillStyle = getContextColor(
          color,
          transform.x + col * charWidth, transform.x + col * charWidth + token.value.length * charWidth,
          this.#context!
        );

        this.#context!.textBaseline = "top";
        this.#context!.fillText(
          token.value,
          transform.x + col * charWidth,
          transform.y + lineNo * lineHeight - lineHeight + charHeight / 5
        );
        col += token.value.length;
      }
    }

    this.#cursorTimer += delta;
    this.#context!.fillStyle = (this.theme.cursorColor || this.theme.foreground) as string;
    // @ts-ignore
    if (this.#cursorTimer > this.cursorBlinkTime) {
      this.#context!.fillStyle = "transparent";
      // @ts-ignore
      if (this.#cursorTimer > this.cursorBlinkTime * 2) {
        this.#cursorTimer = 0;
        this.#context!.fillStyle = (this.theme.cursorColor || this.theme.foreground) as string;
      }
    }
    
    this.#context!.fillRect(
      transform.x + this.#editor!.getCursor().col * charWidth,
      transform.y + this.#editor!.getCursor().line * lineHeight - lineHeight,
      charWidth / 8, charHeight
    );
    
    requestAnimationFrame(this.#draw.bind(this));
  }
}