import type { EditorPlugin } from "../editor";

const PAIRS = {
  "{": "}",
  "[": "]",
  "(": ")",
  '"': '"',
  "'": "'"
}

export default class CharacterPairs implements EditorPlugin {
  attachEditor({ editor }) {
    editor.on("key", key => {
      if (PAIRS[key]) {
        editor.document.insertAt(
          editor.getCursor(), PAIRS[key]
        );
      }
    });
  }
}