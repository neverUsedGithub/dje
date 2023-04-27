declare class Token {
    type: string;
    value: string;
    constructor(type: string, value: string);
}
declare function string(value: string): Token;
declare function number(value: string): Token;
declare function keyword(value: string): Token;
declare function builtin(value: string): Token;
declare function comment(value: string): Token;
declare function identifier(value: string): Token;
declare function modifier(value: string): Token;
declare function punctuation(value: string): Token;
declare function plain(value: string): Token;

export { Token, builtin, comment, identifier, keyword, modifier, number, plain, punctuation, string };
