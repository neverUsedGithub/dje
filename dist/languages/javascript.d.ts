import { E as EditorLanguageMode } from '../editor-ecb8b469.js';
import { Token } from '../languages.js';
import '../editorDocument.js';

declare class Javascript implements EditorLanguageMode {
    lex(text: string): Token[][];
}

export { Javascript as default };
