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

export function keyword(value: string): Token {
  return { type: "keyword", value };
}

export function builtin(value: string): Token {
  return { type: "builtin", value };
}

export function comment(value: string): Token {
  return { type: "comment", value };
}

export function identifier(value: string): Token {
  return { type: "identifier", value };
}

export function modifier(value: string): Token {
  return { type: "modifier", value };
}

export function punctuation(value: string): Token {
  return { type: "punctuation", value };
}

export function plain(value: string): Token {
  return { type: "text", value };
}