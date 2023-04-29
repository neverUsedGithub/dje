import Editor from "../../dist/editor.js";
import Javascript from "../../dist/languages/javascript.js";
import AutoIndent from "../../dist/plugins/autoIndent.js";
import CharacterPairs from "../../dist/plugins/characterPairs.js";

const editor = new Editor({
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
    new CharacterPairs,
  ],
  theme: {
    background: "#111115",
    foreground: "#eee",
    cursorColor: "#ccc",
    selection: "#333335ee",
    tokens: {
      keyword: {
        color: {
          type: "gradient",
          stops: {
            0: "#f5a142",
            1: "#f5cb42"
          }
        },
        fontWeight: 600
      },// { color: "#f5cb42", fontWeight: 600 },
      builtin: { color: "#75d9aa" },
      string: "#40b82e",
      number: "#f5cb42",
      comment: "#555555",
    }
  },
  tabSize: 2,
  tabIndentsLine: true
});

// fetch("https://unpkg.com/react@18.2.0/umd/react.development.js")
//   .then(res => res.text())
//   .then(code => {
//     editor.document.setText(code.repeat(2));
//   });

window.addEventListener("resize", () => {
  editor.fit();
});