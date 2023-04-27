import "../chunk-ATKLQZT6.js";

// src/plugins/autoIndent.ts
function countString(string, chars) {
  const count = {};
  for (let i = 0; i < string.length; i++)
    for (let j = 0; j < chars.length; j++)
      if (string[i] === chars[j]) {
        count[chars[j]] = (count[chars[j]] || 0) + 1;
        break;
      }
  return count;
}
var AutoIndent = class {
  attachEditor({ editor }) {
    const indent = " ".repeat(editor.tabSize);
    editor.on("key", (key) => {
      if (key !== "\n")
        return;
      const cursor = editor.getCursor();
      const counted = countString(
        editor.document.getText().substring(0, editor.document.positionToIndex(cursor)),
        ["{", "}"]
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
          cursor.line,
          currline.substring(0, currline.indexOf("}"))
        );
        editor.document.addLine(cursor.line + 1, indent.repeat(openq - 1) + "}");
      }
    });
  }
};
export {
  AutoIndent as default
};
