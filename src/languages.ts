import { TokenType } from "./editor";

export class Token {
  type: string;
  value: string;

  constructor(type: string, value: string) {
    this.type = type;
    this.value = value;
  }
}

export function string(value: string): Token {
  return { type: "string", value };
}

export function number(value: string): Token {
  return { type: "number", value };
}

export function comment(value: string): Token {
  return { type: "comment", value };
}

export function keyword(value: string): Token {
  return { type: "keyword", value };
}

export function builtin(value: string): Token {
  return { type: "builtin", value };
}

export function variableName(value: string): Token {
  return { type: "variableName", value };
}

export function className(value: string): Token {
  return { type: "className", value };
}

export function functionName(value: string): Token {
  return { type: "functionName", value };
}

export function boolean(value: string): Token {
  return { type: "boolean", value };
}

export function regex(value: string): Token {
  return { type: "regex", value };
}

export function operator(value: string): Token {
  return { type: "operator", value };
}

export function constant(value: string): Token {
  return { type: "constant", value };
}

export function property(value: string): Token {
  return { type: "property", value };
}

export function punctuation(value: string): Token {
  return { type: "punctuation", value };
}

export function tagName(value: string): Token {
  return { type: "tagName", value };
}

export function plain(value: string): Token {
  return { type: "text", value };
}