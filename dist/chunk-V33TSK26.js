// src/languages.ts
var Token = class {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
};
function string(value) {
  return { type: "string", value };
}
function number(value) {
  return { type: "number", value };
}
function keyword(value) {
  return { type: "keyword", value };
}
function builtin(value) {
  return { type: "builtin", value };
}
function comment(value) {
  return { type: "comment", value };
}
function identifier(value) {
  return { type: "identifier", value };
}
function modifier(value) {
  return { type: "modifier", value };
}
function punctuation(value) {
  return { type: "punctuation", value };
}
function plain(value) {
  return { type: "text", value };
}

export {
  Token,
  string,
  number,
  keyword,
  builtin,
  comment,
  identifier,
  modifier,
  punctuation,
  plain
};
