import { TokenType } from "./editor";

export interface Token {
  type: TokenType;
  value: string;
}

export function string(value: string): Token {
  return { type: TokenType.string, value };
}

export function number(value: string): Token {
  return { type: TokenType.number, value };
}

export function comment(value: string): Token {
  return { type: TokenType.comment, value };
}

export function keyword(value: string): Token {
  return { type: TokenType.keyword, value };
}

export function builtin(value: string): Token {
  return { type: TokenType.builtin, value };
}

export function variableName(value: string): Token {
  return { type: TokenType.variableName, value };
}

export function className(value: string): Token {
  return { type: TokenType.className, value };
}

export function functionName(value: string): Token {
  return { type: TokenType.functionName, value };
}

export function boolean(value: string): Token {
  return { type: TokenType.boolean, value };
}

export function regex(value: string): Token {
  return { type: TokenType.regex, value };
}

export function operator(value: string): Token {
  return { type: TokenType.operator, value };
}

export function constant(value: string): Token {
  return { type: TokenType.constant, value };
}

export function property(value: string): Token {
  return { type: TokenType.property, value };
}

export function punctuation(value: string): Token {
  return { type: TokenType.punctuation, value };
}

export function tagName(value: string): Token {
  return { type: TokenType.tagName, value };
}

export function plain(value: string): Token {
  return { type: TokenType.text, value };
}