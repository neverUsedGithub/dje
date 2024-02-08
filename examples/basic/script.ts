// import Editor from "../../dist/editor.js";
// import Javascript from "../../dist/languages/javascript.js";
// import AutoIndent from "../../dist/plugins/autoIndent.js";
// import CharacterPairs from "../../dist/plugins/characterPairs.js";
// import PrismLanguage from "../../dist/languages/prismLanguage.js";

import Editor from "../../src/editor";
import AutoIndent from "../../src/plugins/autoIndent";
import CharacterPairs from "../../src/plugins/characterPairs";
import PrismLanguage from "../../src/languages/prismLanguage";
import * as prismjs from "prismjs";
import Plaintext from "../../src/languages/plaintext";
import Javascript from "../../src/languages/javascript";

const examples = {
  js: {
    text: `/** 
* @description A greeting function.
*/
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");`,
    mode: PrismLanguage.from(prismjs, "javascript"),
  },
  html: {
    text: `<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>DJE</title>
  <link href="style.css" rel="stylesheet" type="text/css" />
</head>

<body>
  <canvas class="editor"></canvas>
  <script src="script.ts" type="module"></script>
</body>

</html>`,
    mode: PrismLanguage.from(prismjs, "html"),
  },
} as const;

const welcomeText = `// Welcome to Dramatic Javascript Editor!

// This is a basic example demonstrating
// basic text editing features.

// Pick an example by pressing [Enter]
// After selecting an example you can return by pressing [Esc]
${Object.keys(examples).join("\n")}`;

let hasSelected = false;

const editor = new Editor({
  element: ".editor",
  content: welcomeText,
  mode: new Javascript(),
  plugins: [new AutoIndent(), new CharacterPairs()],
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
            1: "#f5cb42",
          },
        },
        fontWeight: 600,
      }, // { color: "#f5cb42", fontWeight: 600 },
      builtin: { color: "#75d9aa" },
      string: "#40b82e",
      number: "#f5cb42",
      comment: "#555555",
      operator: "#419be0",
      tagName: "#f5cb42",
      punctuation: "#555",
      property: "#419be0",
    },
  },
  tabSize: 2,
  tabIndentsLine: true,
  readOnly: true,
});

editor.on("press", (ev: KeyboardEvent) => {
  if (ev.key === "Escape" && hasSelected) {
    hasSelected = false;
    editor.setReadOnly(true);
    editor.setMode(new Javascript());
    editor.document.setText(welcomeText);
    editor.setCursor(0, 0);
    return;
  }

  if (hasSelected) return;
  if (ev.key !== "Enter") return;

  const line = editor.document.getLine(editor.getCursor().line);

  if (!(line in examples)) return;

  hasSelected = true;

  const selected = examples[line as keyof typeof examples];
  editor.setMode(selected.mode);
  editor.document.setText(selected.text);
  editor.setCursor(0, 0);
  editor.setReadOnly(false);
});

// fetch("https://unpkg.com/react@18.2.0/umd/react.development.js")
//   .then(res => res.text())
//   .then(code => {
//     editor.document.setText(code.repeat(2));
//   });

window.addEventListener("resize", () => {
  editor.fit();
});
