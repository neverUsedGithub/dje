
# Dramatic Javascript Editor
An extensible code editor inspired by [ded](https://github.com/tsoding/ded).

# Getting Started
First install the editor library with `npm i https://github.com/neverUsedGithub/dje`. After installing the library import it in a js file.
```js
import Editor from "jde";
```
Then create an editor instance like this
```js
new Editor({
  // needs to be a canvas element or
  // a selector to one.
  element: ".editor",
  // the content of the editor
  content: `console.log("Hello, world!")`,
  // a list of plugins the editor should use
  plugins: [],
  // the theme the editor should use
  theme: {},
  // size of tabs in spaces
  tabSize: 2
})
```
The editor should now be displayed on your webpage! To see all of the possible methods look to the source code, since there is no documentation yet.