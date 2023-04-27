import {
  comment,
  identifier,
  keyword,
  modifier,
  number,
  plain,
  punctuation,
  string
} from "../chunk-V33TSK26.js";
import "../chunk-ATKLQZT6.js";

// src/languages/javascript.ts
var ID_START = /[\$A-Za-z_]/;
var ID_REST = /[\$A-Za-z_0-9]/;
var NUMBERS = /[0-9]/;
var KEYWORDS = ["await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "implements", "import", "in", "instanceof", "interface", "let", "new", "null", "package", "private", "protected", "public", "return", "super", "switch", "static", "this", "throw", "try", "true", "typeof", "var", "void", "while", "with", "yield"];
var Javascript = class {
  lex(text) {
    const lines = [[]];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\n")
        lines.push([]);
      else if (ID_START.test(text[i])) {
        let content = text[i];
        i++;
        while (text[i] && ID_REST.test(text[i])) {
          content += text[i++];
        }
        i--;
        if (KEYWORDS.includes(content))
          lines[lines.length - 1].push(keyword(content));
        else
          lines[lines.length - 1].push(identifier(content));
      } else if (text[i] === '"' || text[i] === "'") {
        let content = text[i];
        i++;
        while (text[i]) {
          if (text[i] === content[0] && !(content.length >= 2 && content[content.length - 1] === "\\")) {
            content += text[i++];
            break;
          }
          if (text[i] === "\n")
            break;
          content += text[i++];
        }
        i--;
        lines[lines.length - 1].push(string(content));
      } else if (text[i] === "`") {
        let content = text[i];
        i++;
        while (text[i]) {
          if (text[i] === "`" && !(content.length >= 2 && content[content.length - 1] === "\\")) {
            content += text[i++];
            break;
          }
          if (content[content.length - 1] !== "\\" && text[i] === "$" && text[i + 1] === "{") {
            const start = i;
            let count = 1;
            i += 2;
            while (count > 0 && i < text.length) {
              if (text[i] === "{")
                count++;
              else if (text[i] === "}")
                count--;
              i++;
            }
            if (count === 0) {
              const inner = text.substring(start, i);
              lines[lines.length - 1].push(string(content));
              content = "";
              lines[lines.length - 1].push(modifier("$"));
              lines[lines.length - 1].push(punctuation("{"));
              const innerLines = this.lex(inner.substring(2, inner.length - 1));
              for (let j = 0; j < innerLines.length; j++) {
                lines[lines.length - 1].push(...innerLines[j]);
                if (j !== innerLines.length - 1)
                  lines.push([]);
              }
              lines[lines.length - 1].push(punctuation("}"));
              continue;
            } else {
              i = start;
            }
          }
          if (text[i] === "\n") {
            lines[lines.length - 1].push(string(content));
            content = "";
            lines.push([]);
            i++;
            continue;
          }
          content += text[i++];
        }
        i--;
        lines[lines.length - 1].push(string(content));
      } else if (text[i] !== "0" && NUMBERS.test(text[i])) {
        let num = text[i++];
        while (text[i] && NUMBERS.test(text[i]))
          num += text[i++];
        i--;
        lines[lines.length - 1].push(number(num));
      } else if (text[i] === "/" && text[i + 1] === "/") {
        let comment2 = text[i++] + text[i++];
        while (text[i] && text[i] !== "\n")
          comment2 += text[i++];
        i--;
        lines[lines.length - 1].push(comment(comment2));
      } else if (text[i] === "/" && text[i + 1] === "*") {
        let content = text[i++] + text[i++];
        while (text[i]) {
          if (text[i] === "*" && text[i + 1] === "/") {
            content += text[i++] + text[i++];
            break;
          }
          if (text[i] === "\n") {
            lines[lines.length - 1].push(comment(content));
            content = "";
            lines.push([]);
            i++;
            continue;
          }
          content += text[i++];
        }
        i--;
        lines[lines.length - 1].push(comment(content));
      } else {
        lines[lines.length - 1].push(plain(text[i]));
      }
    }
    return lines;
  }
};
export {
  Javascript as default
};
