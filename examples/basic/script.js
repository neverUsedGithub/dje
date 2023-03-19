import Editor from "./DJE/editor.js";
import Javascript from "./DJE/languages/javascript.js";
import AutoIndent from "./DJE/plugins/autoIndent.js";
import CharacterPairs from "./DJE/plugins/characterPairs.js";

const inst = new Editor({
  element: ".editor",
  content: `function greet(name: string) {
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
  }
});
