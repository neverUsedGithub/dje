import type { EditorLanguageMode } from "../editor";
import type { Token } from "../languages";
import * as token from "../languages";
import { Token as PrismToken, Languages as PrismLanguages, tokenize as prismTokenize } from "prismjs";

const PRISM_TOKENS: Record<string, (value: string) => Token> = {
  "number": token.number,
  "keyword": token.keyword,
  "builtin": token.builtin,
  "class-name": token.className,
  "function": token.functionName,
  "variable": token.variableName,
  "boolean": token.boolean,
  "regex": token.regex,
  "operator": token.operator,
  "constant": token.constant,
  "property": token.property,
  "punctuation": token.punctuation,
  "comment": token.comment,
  "tag": token.tagName,
  "parameter": token.variableName,
  "template-string": token.string,
  "template-punctuation": token.string,
  "string": token.string,
  "interpolation-punctuation": token.punctuation,
  "doc-comment": token.comment,
  "text": token.plain
}

export interface PrismImport {
    languages: PrismLanguages;
    tokenize: typeof prismTokenize;
}

export default class PrismLanguage {
  static from(prism: PrismImport, language: string) {
    return {
      lex: (text: string) => {
        if (!prism.languages[language])
          throw new Error(`Language '${language}' doesn't exist, or hasn't been loaded yet.`)

        const tokens: (string | PrismToken)[] = prism.tokenize(text, prism.languages[language]);
        const lines: Token[][] = [[]];

        function addString(str: string, parent?: string) {
            const parts = str.split("\n");

            for (let i = 0; i < parts.length; i++) {
                lines[lines.length - 1].push(
                    parent && parent in PRISM_TOKENS ? PRISM_TOKENS[parent](parts[i]) : token.plain(str)
                );
                if (i !== parts.length - 1) lines.push([]);
            }
        }

        function addPrismToken(tok: string | PrismToken, parent?: string) {
            if (typeof tok === "string") {
                addString(tok, parent);
                return;
            }

            if (Array.isArray(tok.content)) {
                for (const child of tok.content) addPrismToken(child, tok.type);
                return;
            }

            if (typeof tok.content === "string") {
                addString(tok.content, tok.type);
                return;
            }

            return addPrismToken(tok.content, tok.type);
        }

        for (const prismToken of tokens) {
          addPrismToken(prismToken, "text");
        }

        return lines;
      }
    } as EditorLanguageMode
  }
}