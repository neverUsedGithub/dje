import Editor from "../../editor.js";
import Javascript from "../../languages/javascript.js";
import AutoIndent from "../../plugins/autoIndent.js";
import CharacterPairs from "../../plugins/characterPairs.js";

const inst = new Editor({
  element: ".editor",
  content: `/** 
 * @description A greeting function.
 */
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");`,
  mode: new Javascript(),
  plugins: [
    new AutoIndent,
    new CharacterPairs
  ],
  theme: {
    background: "#111115",
    foreground: "#eee",
    cursorColor: "#ccc",
    selection: "#333335ee",
    keyword: { color: "#f5cb42", fontWeight: 600 },
    builtin: { color: "#75d9aa" },
    string: "#40b82e",
    number: "#f5cb42",
    comment: "#555555"
  },
  tabSize: 2
});
