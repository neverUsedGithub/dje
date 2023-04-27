import type { EditorPlugin, EditorPluginOptions } from "../editor";

const PAIRS: Record<string, string> = {
  "{": "}",
  "[": "]",
  "(": ")",
  '"': '"',
  "'": "'"
}

export default class CharacterPairs implements EditorPlugin {
  attachEditor({ editor }: EditorPluginOptions) {
    editor.on("key", (key: string) => {
      if (key in PAIRS) {
        editor.document.insertAt(
          editor.getCursor(), PAIRS[key]
        );
      }
    });
  }
}