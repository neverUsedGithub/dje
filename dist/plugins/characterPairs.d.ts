import { a as EditorPlugin, b as EditorPluginOptions } from '../editor-fde9154c.js';
import '../editorDocument.js';
import '../languages.js';

declare class CharacterPairs implements EditorPlugin {
    attachEditor({ editor }: EditorPluginOptions): void;
}

export { CharacterPairs as default };
