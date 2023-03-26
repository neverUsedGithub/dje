const lerp = (from, to, t) => from + t * (to - from);
// const smoothstep = (from, to, amt) => 
//   lerp(from, to, amt ** 2 * (3 - 2 * amt));
// const cosine = (from, to, t) => 
//   lerp(from, to, -Math.cos(Math.PI * t) / 2 + 0.5);

const EASING_FUNCTION = lerp;

function getColorFor(theme, scopes) {
  let current = theme.foreground;

  for (const scope of scopes)
    if (theme[scope]) current = theme[scope];

  return current;
}

function getContextColor(color, startX, endX, context) {
  if (color && color.type === "gradient") {
    const grad = context.createLinearGradient(startX, 0, endX, 0);

    for (const [ stopOffset, stopColor ] of color.stops)
      grad.addColorStop(stopOffset, stopColor);
    
    return grad;
  }

  return typeof color === "string"
    ? color
    : getContextColor(color.color, startX, endX, context);
}

function colorToString(color, fontSize, fontFamily) {
  if (
    typeof color === "string" ||
    !color || (!color.style && !color.fontWeight)
  ) return `${fontSize}px ${fontFamily}`;

  return (color.style ? color.style + " " : "") +
         (color.fontWeight ? color.fontWeight + " " : "") +
         `${fontSize}px ${fontFamily}`;
}

export default class EditorView {
  /** @type {HTMLCanvasElement} */
  #canvasEl;
  /** @type {CanvasRenderingContext2D} */
  #context;
  #editor;
  #cursorTimer;
  #lastTime;
  #drawnCamera;
  #lastScale;
  #characterWidth;
  #characterHeight;
  #getTokens;
  #fontFamily;

  constructor(userTheme) {
    this.theme = {
      foreground: "#eee",
      background: "#222",
      ...userTheme
    };
  }

  /**
   * @param {import("./editor.js").default} editor 
   */
  attachEditor({ editor, canvasEl, context, getTokens }) {
    this.lineHeight = 50;
    this.fontSize = 30;
    this.animationSpeed = 2;
    this.cursorBlinkTime = 0.5;
    
    this.#fontFamily = "monospace"
    this.#canvasEl = canvasEl;
    this.#context = context;
    this.#editor = editor;
    this.#cursorTimer = 0;
    this.#lastTime = null;
    this.#getTokens = getTokens;
    this.#drawnCamera = { x: 0, y: 0 };
    this.#context.font = `${this.fontSize}px ${this.#fontFamily}`;
    this.#lastScale = 1;

    this.#adjustFont();

    this.#editor.on("press", () => {
      this.#cursorTimer = 0;
    })
    requestAnimationFrame(this.#draw.bind(this));
  }

  #adjustFont() {
    const metrics = this.#context.measureText("A");
    this.#characterWidth = metrics.width;
    this.#characterHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  }

  #drawSelection(transform, lineHeight, charWidth, charHeight, selection) {
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
    this.#context.fillStyle = this.theme.selection;
    for (let line = selection.start.line; line <= selection.end.line; line++) {
      
      if (line === selection.start.line && selection.start.line === selection.end.line) {
        this.#context.fillRect(
          transform.x + selection.start.col * charWidth,
          transform.y + line * lineHeight - lineHeight,
          (selection.end.col - selection.start.col) * charWidth,
          charHeight
        )
      }
      else if (line === selection.start.line) {
        this.#context.fillRect(
          transform.x + selection.start.col * charWidth,
          transform.y + line * lineHeight - lineHeight,
          Math.max(
            (this.#editor.document.getLine(line).length - selection.start.col) * charWidth,
            charWidth
          ),
          charHeight
        )
      }
      else if (line === selection.end.line) {
        this.#context.fillRect(
          transform.x + 0,
          transform.y + line * lineHeight - lineHeight,
          selection.end.col * charWidth,
          charHeight
        )
      }
      else {
        this.#context.fillRect(
          transform.x + 0,
          transform.y + line * lineHeight - lineHeight,
          Math.max(this.#editor.document.getLine(line).length * charWidth, charWidth),
          charHeight
        )
      }
    }
  }

  #draw(time) {
    if (this.#lastTime === null) {
      this.#lastTime = time;
      return requestAnimationFrame(this.#draw.bind(this));
    }

    const delta = Math.min(time - this.#lastTime, 100) / 1000;
    this.#lastTime = time;
    this.#context.fillStyle = this.theme.background;

    const maxLineLength = Math.max(
      ...this.#editor.document.getLines().map(l => l.length)
    );
    const scaleTarget = Math.min(1 + 32 / maxLineLength, 7);
    const scale = EASING_FUNCTION(this.#lastScale, scaleTarget, this.animationSpeed * delta);
    this.#lastScale = scale;    
    const charWidth = this.#characterWidth * scale;
    const charHeight = this.#characterHeight * scale;
    const lineHeight = this.lineHeight * scale;
    const fontSize = this.fontSize * scale;
    this.#context.font = `${fontSize}px ${this.#fontFamily}`;

    this.#context.fillRect(
      0, 0, this.#canvasEl.width, this.#canvasEl.height
    );

    const cameraTarget = {
      x: -this.#editor.getCursor().col * charWidth,
      y: -this.#editor.getCursor().line * lineHeight
    };

    this.#drawnCamera = {
      x: EASING_FUNCTION(this.#drawnCamera.x, cameraTarget.x, this.animationSpeed * delta),
      y: EASING_FUNCTION(this.#drawnCamera.y, cameraTarget.y, this.animationSpeed * delta)
    };

    const transform = {
      x: this.#canvasEl.width / 2 + this.#drawnCamera.x,
      y: this.#canvasEl.height / 2 + this.#drawnCamera.y
    };

    if (this.#editor.getSelection()) {
      this.#drawSelection(transform, lineHeight, charWidth, charHeight, {
        start: this.#editor.getSelection().start,
        end: this.#editor.getSelection().end || this.#editor.getCursor()
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
    const tokens = this.#getTokens();
    for (let lineNo = 0; lineNo < tokens.length; lineNo++) {
      let col = 0;
      for (const token of tokens[lineNo]) {
        const color = getColorFor(this.theme, token.scopes);
        this.#context.font = colorToString(color, fontSize, this.#fontFamily);
        this.#context.fillStyle = getContextColor(
          color,
          transform.x + col * charWidth, transform.x + col * charWidth + token.value.length * charWidth,
          this.#context
        );

        this.#context.textBaseline = "top";
        this.#context.fillText(
          token.value,
          transform.x + col * charWidth,
          transform.y + lineNo * lineHeight - lineHeight + charHeight / 5
        );
        col += token.value.length;
      }
    }

    this.#cursorTimer += delta;
    this.#context.fillStyle = this.theme.cursorColor || this.theme.foreground;
    if (this.#cursorTimer > this.cursorBlinkTime) {
      this.#context.fillStyle = "transparent";
      if (this.#cursorTimer > this.cursorBlinkTime * 2) {
        this.#cursorTimer = 0;
        this.#context.fillStyle = this.theme.cursorColor || this.theme.foreground;
      }
    }
    
    this.#context.fillRect(
      transform.x + this.#editor.getCursor().col * charWidth,
      transform.y + this.#editor.getCursor().line * lineHeight - lineHeight,
      charWidth / 8, charHeight
    );
    
    requestAnimationFrame(this.#draw.bind(this));
  }
}