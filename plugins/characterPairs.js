
const PAIRS = {
  "{": "}",
  "[": "]",
  "(": ")",
  '"': '"',
  "'": "'"
}

export default class CharacterPairs {
  /**
   * Character auto pair plugin.
   * @param {import('../editor.js').default} editor
   */
  attachEditor(editor) {
    editor.on("key", key => {
      if (PAIRS[key]) {
        editor.document.insertAt(
          editor.getCursor(), PAIRS[key]
        );
      }
    });
  }
}