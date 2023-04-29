import { E as EditorLanguageMode } from '../editor-fde9154c.js';
import { Token } from '../languages.js';
import '../editorDocument.js';

declare class Plaintext implements EditorLanguageMode {
    lex(text: string): Token[][];
}

export { Plaintext as default };
