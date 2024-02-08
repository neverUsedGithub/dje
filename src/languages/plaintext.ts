import { EditorLanguageMode } from "../editor";
import type { Token } from "../languages";
import * as token from "../languages";

export default class Plaintext implements EditorLanguageMode {
  lex(text: string) {
    const lines: Token[][] = [[]];

    let i = 0;
    while (i < text.length) {
      while (i < text.length && text[i] === "\n") {
        lines.push([]);
        i++;
      }
      let content = "";
      while (i < text.length && text[i] !== "\n") content += text[i++];
      lines[lines.length - 1].push(token.plain(content));
    }

    console.log(lines);

    return lines;
  }
}
