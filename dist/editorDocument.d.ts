interface DocumentPosition {
    line: number;
    col: number;
}
interface DocumentSelection {
    start: DocumentPosition;
    end: DocumentPosition | null;
}
declare class EditorDocument {
    #private;
    constructor(content: string, genTokens: () => void);
    deleteAt({ line, col }: DocumentPosition): void;
    insertAt({ line, col }: DocumentPosition, text: string): void;
    removeLine(line: number): void;
    addLine(line: number, text: string): void;
    positionToIndex({ line, col }: DocumentPosition): number;
    replaceRange({ start, end }: DocumentSelection, replacement: string): void;
    getRange({ start, end }: DocumentSelection): string;
    setLine(line: number, text: string): void;
    getText(): string;
    setText(content: string): void;
    getLines(): string[];
    getLine(line: number): string;
}

export { DocumentPosition, DocumentSelection, EditorDocument as default };
