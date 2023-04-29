import { EditorLanguageMode } from "../editor";
import type { Token } from "../languages";
import * as token from "../languages";

export default class Plaintext implements EditorLanguageMode {
  lex(text: string) {
    const lines: Token[][] = [ [] ];

    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\n") lines.push([]);

      let content = "";
      while (text[i] !== "\n")
        content += text[i++];
      lines[lines.length - 1].push(token.plain(content));

      if (text[i] === "\n") lines.push([]);
    }
    
    return lines;
  }
}
