// Return value should be: Line[]
// where: type Token = { scopes: string[], value: string }
//        type Line = Token[]

const ID_START = /[\$A-Za-z_]/;
const ID_REST = /[\$A-Za-z_0-9]/;
const NUMBERS = /[0-9]/;

const KEYWORDS = ["await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "implements", "import", "in", "instanceof", "interface", "let", "new", "null", "package", "private", "protected", "public", "return", "super", "switch", "static", "this", "throw", "try", "true", "typeof", "var", "void", "while", "with", "yield"];

export default class Javascript {
  lex(text) {
    const lines = [ [] ];

    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\n") lines.push([]);

      else if (ID_START.test(text[i])) {
        let content = text[i];

        i++;
        while (text[i] && ID_REST.test(text[i])) {
          content += text[i ++];
        }
        i--;

        let scopes = [ "identifier" ];

        if (KEYWORDS.includes(content)) scopes.push("keyword");

        lines[lines.length - 1].push({
          scopes: scopes,
          value: content,
        });
      }

      else if (text[i] === '"' || text[i] === "'") {
        let content = text[i];
        i++;

        while (text[i]) {
          if (text[i] === content[0] &&
            !(content.length >= 2 &&
              content[content.length - 1] === "\\")
          ) {
            content += text[i++];
            break;
          }
          if (text[i] === "\n") break;
          content += text[i++];
        }
        i--;
        
        lines[lines.length - 1].push({
          scopes: [ "string" ],
          value: content,
        });
      }

      else if (text[i] === "`") {
        let content = text[i];
        i++;

        while (text[i]) {
          if (text[i] === "`" &&
            !(content.length >= 2 &&
              content[content.length - 1] === "\\")
          ) {
            content += text[i++];
            break;
          }
          if (text[i] === "\n") {
            lines[lines.length - 1].push({
              scopes: [ "string", "multiline-string" ],
              value: content,
            });
            content = "";
            lines.push([]);
            i++;
            continue;
          }
          content += text[i++];
        }
        i--;
        
        lines[lines.length - 1].push({
          scopes: [ "string", "multiline-string" ],
          value: content,
        });
      }

      else if (text[i] !== "0" && NUMBERS.test(text[i])) {
        let num = text[i++];

        while (text[i] && NUMBERS.test(text[i]))
          num += text[i++];
        
        i--;

        lines[lines.length - 1].push({
          scopes: [ "number" ],
          value: num,
        });
      }

      else if (text[i] === "/" && text[i + 1] === "/") {
        let comment = text[i++] + text[i++];
        while (text[i] && text[i] !== "\n")
          comment += text[i++];
        i--;

        lines[lines.length - 1].push({
          scopes: [ "comment" ],
          value: comment,
        });
      }

      else if (text[i] === "/" && text[i + 1] === "*") {
        let content = text[i++] + text[i++];

        while (text[i]) {
          if (text[i] === "*" && text[i + 1] === "/") {
            content += text[i++] + text[i++];
            break;
          }
          if (text[i] === "\n") {
            lines[lines.length - 1].push({
              scopes: [ "comment", "multiline-comment" ],
              value: content,
            });
            content = "";
            lines.push([]);
            i++;
            continue;
          }
          content += text[i++];
        }
        i--;
        
        lines[lines.length - 1].push({
          scopes: [ "comment", "multiline-comment" ],
          value: content,
        });
      }

      else {
        lines[lines.length - 1].push({
          scopes: [],
          value: text[i],
        });
      }
    }
    
    return lines;
  }
}
