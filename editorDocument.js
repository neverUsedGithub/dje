export default class EditorDocument {
  #lines;
  #genTokens;

  constructor(content, genTokens) {
    this.#lines = content.split("\n");
    this.#genTokens = genTokens;
  }

  deleteAt({ line, col }) {
    const ln = this.#lines[line];
    
    this.#lines[line] = ln.substring(0, col - 1) + ln.substring(col);
    this.#genTokens();
  }

  insertAt({ line, col }, text) {
    const ln = this.#lines[line];

    this.#lines[line] = ln.substring(0, col) + text + ln.substring(col);
    this.#genTokens();
  }

  removeLine(line) {
    this.#lines.splice(line, 1);
    this.#genTokens();
  }

  addLine(index, line) {
    this.#lines.splice(index, 0, line);
    this.#genTokens();
  }

  positionToIndex({ line, col }) {
    let index = col;
    
    for (let i = 0; i < line; i++) {
      index += this.#lines[i].length + 1;
    }
    
    return index;
  }

  replaceRange({ start, end }, replacement) {
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

  setLine(index, line) {
    this.#lines.splice(index, 1, line);
    this.#genTokens();
  }

  getText() {
    return this.#lines.join("\n");
  }

  setText(content) {
    this.#lines = content.split("\n");
    this.#genTokens();
  }

  getLines() {
    return this.#lines;
  }

  getLine(index) {
    return this.#lines[index];
  }
}