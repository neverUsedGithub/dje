export interface DocumentPosition { line: number, col: number }
export interface DocumentSelection {
  start: DocumentPosition,
  end: DocumentPosition | null
}

export default class EditorDocument {
  #lines: string[];
  #genTokens: () => void;

  constructor(content: string, genTokens: () => void) {
    this.#lines = content.split("\n");
    this.#genTokens = genTokens;
  }

  deleteAt({ line, col }: DocumentPosition) {
    const ln = this.#lines[line];
    
    this.#lines[line] = ln.substring(0, col - 1) + ln.substring(col);
    this.#genTokens();
  }

  insertAt({ line, col }: DocumentPosition, text: string) {
    if (text.includes("\n")) {
      const lines = text.split("\n");
      const restText = this.#lines[line].substring(col);
      this.setLine(line, this.#lines[line].substring(0, col) + lines[0]);
      
      for (let offset = 1; offset < lines.length; offset++) {
        this.addLine(line + offset, lines[offset] + (offset === lines.length - 1 ? restText : ""));
      }
      return;
    }

    const ln = this.#lines[line];

    this.#lines[line] = ln.substring(0, col) + text + ln.substring(col);
    this.#genTokens();
  }

  removeLine(line: number) {
    this.#lines.splice(line, 1);
    this.#genTokens();
  }

  addLine(line: number, text: string) {
    this.#lines.splice(line, 0, text);
    this.#genTokens();
  }

  positionToIndex({ line, col }: DocumentPosition) {
    let index = col;
    
    for (let i = 0; i < line; i++) {
      index += this.#lines[i].length + 1;
    }
    
    return index;
  }

  replaceRange({ start, end }: DocumentSelection, replacement: string): void {
    if (!end)
      throw new Error("Unexpected value for replaceRange({ start, end }, replacement), end cannot be undefined.");

    if (start.line > end.line ||
      (
       start.line === end.line &&
       start.col > end.col
      ))
      return this.replaceRange({
        start: end, end: start
      }, replacement);

    let text = this.#lines.join("\n");
    const startR = this.positionToIndex(start);
    const endR = this.positionToIndex(end);

    text = text.substring(0, startR) +
           replacement +
           text.substring(endR);

    this.#lines = text.split("\n");
    this.#genTokens();
  }

  getRange({ start, end }: DocumentSelection): string {
    if (!end)
      throw new Error("Unexpected value for getRange({ start, end }), end cannot be undefined.");

    if (start.line > end.line ||
      (
       start.line === end.line &&
       start.col > end.col
      ))
      return this.getRange({ start: end, end: start });

    const text = this.#lines.join("\n");
    const startR = this.positionToIndex(start);
    const endR = this.positionToIndex(end);

    return text.substring(startR, endR);
  }

  setLine(line: number, text: string) {
    this.#lines[line] = text;
    this.#genTokens();
  }

  getText() {
    return this.#lines.join("\n");
  }

  setText(content: string) {
    this.#lines = content.split("\n");
    this.#genTokens();
  }

  getLines() {
    return this.#lines;
  }

  getLine(line: number) {
    return this.#lines[line];
  }
}