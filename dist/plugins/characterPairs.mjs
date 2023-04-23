import "../chunk-OMT57NJ7.mjs";

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
      if (PAIRS[key]) {
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
