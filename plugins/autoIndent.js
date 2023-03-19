
function countString(string, chars) {
  let count = {};
  for (let i = 0; i < string.length; i++)
    for (let j = 0; j < chars.length; j++)
      if (string[i] === chars[j]) {
        count[chars[j]] = (count[chars[j]] || 0) + 1;
        break;
      }
  return count;
}

export default class AutoIndent {
  /**
   * Auto indentation plugin. Indents after every '{'.
   * @param {import('../editor.js').default} editor
   */
  attachEditor(editor) {
    const indent = " ".repeat(editor.tabSize);
    editor.on("key", (key) => {
      if (key !== "\n") return;
      const cursor = editor.getCursor();
      // const lastLine = editor.document.getLine(cursor.line - 1);
      // if (!lastLine.trim().endsWith("{")) return;
      
      const counted = countString(
        editor.document.getText()
          .substring(0, editor.document.positionToIndex(cursor)),
        [ "{", "}" ]
      );
      
      const openq = Math.max(
        (counted["{"] || 0) - (counted["}"] || 0),
        0
      );
      
      editor.document.insertAt(cursor, indent.repeat(openq));
      editor.moveCursor(0, editor.tabSize * openq);

      const currline = editor.document.getLine(cursor.line);
      if (currline.endsWith("}")) {
        editor.document.setLine(
          cursor.line, currline.substring(0, currline.indexOf("}"))
        );
        editor.document.addLine(cursor.line + 1, indent.repeat(openq - 1) + "}");
      }
    })
  }
}