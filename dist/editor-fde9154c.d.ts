import EditorDocument, { DocumentSelection } from './editorDocument.js';
import { Token } from './languages.js';

declare type TokenColorColor = string | {
    type: "gradient";
    stops: Record<number, string>;
};
declare type TokenColor = TokenColorColor | {
    color: TokenColorColor;
    style?: string;
    fontWeight?: number;
};
declare type EditorTokenTheme = Record<string, TokenColor>;
declare type EditorTheme = {
    cursorColor?: string;
    background?: string;
    foreground?: string;
    selection?: string;
    tokens?: EditorTokenTheme;
};
declare class EditorView implements EditorPlugin {
    #private;
    theme: EditorTheme;
    lineHeight: number;
    fontSize: number;
    animationSpeed: number;
    cursorBlinkTime: number;
    constructor(userTheme: EditorTheme);
    attachEditor({ editor, canvasEl, context, getTokens }: EditorPluginOptions): void;
}

declare enum TokenType {
    "string" = 0,
    "number" = 1,
    "comment" = 2,
    "keyword" = 3,
    "builtin" = 4,
    "identifier" = 5
}
interface EditorLanguageMode {
    lex(contents: string): Token[][];
}
interface EditorPluginOptions {
    editor: Editor;
    canvasEl: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    getTokens: () => Token[][];
}
declare abstract class EditorPlugin {
    abstract attachEditor(options: EditorPluginOptions): void;
}
interface EditorOptions {
    element: HTMLCanvasElement | string;
    content: string;
    mode: EditorLanguageMode;
    plugins: EditorPlugin[];
    theme: EditorTheme;
    tabSize?: number;
    tabIndentsLine?: boolean;
}
declare class Editor {
    #private;
    tabSize: number;
    document: EditorDocument;
    constructor({ element, content, mode, plugins, theme, tabSize, tabIndentsLine }: EditorOptions);
    getTokens(): Token[][];
    on(name: string, callback: (...args: any) => void): void;
    getSelection(): DocumentSelection | null;
    moveCursor(lines: number, cols: number): void;
    getCursor(): {
        line: number;
        col: number;
    };
    use(plugin: EditorPlugin): void;
    focus(): void;
    fit(): void;
}

export { EditorLanguageMode as E, TokenType as T, EditorPlugin as a, EditorPluginOptions as b, EditorView as c, EditorTheme as d, Editor as e };
