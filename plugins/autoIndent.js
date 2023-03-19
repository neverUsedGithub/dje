
export default class AutoIndent {
  /**
   * Auto indentation plugin. Indents after every '{'.
   * @param {import('../editor.js').default} editor
   */
  attachEditor(editor) {

    editor.on("key", (key) => {
      if (key !== "\n") return;
      const cursor = editor.getCursor();
      const lastLine = editor.document.getLine(cursor.line - 1);
      if (!lastLine.trim().endsWith("{")) return;
      
      const openq = editor.document.getText()
        .substring(0, editor.document.positionToIndex(cursor))
        .split("{").length - 1;
      
      editor.document.insertAt(cursor, "  ".repeat(openq));
      editor.moveCursor(0, openq * 2);

      const currline = editor.document.getLine(cursor.line);

      if (currline.endsWith("}")) {
        editor.document.setLine(
          cursor.line, currline.substring(0, currline.indexOf("}"))
        );
        editor.document.addLine(cursor.line + 1, "  ".repeat(openq - 1) + "}");
      }
    })
  }
}