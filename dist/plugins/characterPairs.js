import "../chunk-ATKLQZT6.js";

// src/plugins/characterPairs.ts
var PAIRS = {
  "{": "}",
  "[": "]",
  "(": ")",
  '"': '"',
  "'": "'"
};
var CharacterPairs = class {
  attachEditor({ editor }) {
    editor.on("key", (key) => {
      if (key in PAIRS) {
        editor.document.insertAt(
          editor.getCursor(),
          PAIRS[key]
        );
      }
    });
  }
};
export {
  CharacterPairs as default
};
