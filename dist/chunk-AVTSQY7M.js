import {
  plain
} from "./chunk-V33TSK26.js";

// src/languages/plaintext.ts
var Plaintext = class {
  lex(text) {
    const lines = [[]];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\n")
        lines.push([]);
      let content = "";
      while (text[i] !== "\n")
        content += text[i++];
      lines[lines.length - 1].push(plain(content));
      if (text[i] === "\n")
        lines.push([]);
    }
    return lines;
  }
};

export {
  Plaintext
};
