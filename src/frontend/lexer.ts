import * as fs from 'fs'

export enum TokenType {
    // Literal Types
    Number,
    String,
    Identifier,

    // Keywords
    Let,
    Const,
    Fun,

    // Grouping * Operators
    BinaryOperator, // +, -, *, /, %
    Equals, // =
    DoubleEquals, // ==
    Comma, // ,
    Dot, // .
    Colon, // :
    Semicolon, // ;
    Quote, // "
    OpenParen, // (
    CloseParen, // )
    OpenBrace, // }
    CloseBrace, // {
    OpenBracket, // [
    CloseBracket, // ]
    Comment,
    EOF, // End of file
}

const KEYWORDS: Record<string, TokenType> = {
    'let': TokenType.Let,
    'const': TokenType.Const,
    'fun': TokenType.Fun
}

export interface Token {
    value: string,
    type: TokenType,
}

function token (value = '', type: TokenType): Token {
    return { value, type }
}

function isAlpha (source: string) {
    return source.toUpperCase() != source.toLowerCase()
}

function isSkippable (source: string) {
    return [' ', '\n', '\t', '\r'].includes(source)
}

function isInt (source: string) {
    const char = source.charCodeAt(0)
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)]
    
    return (char >= bounds[0] && char <= bounds[1])
}

export function tokenize (sourceCode: string): Token[] {
    const tokens = new Array<Token>()
    const source = sourceCode.split('')

    // Build each token until end of file
    while (source.length > 0) {
        if (source[0] == '/' && source[1] == '/') {
            source.shift()
            source.shift()
            let comment = ''
            while (source.length > 1 && String(source)[0] !== "\n" && String(source)[0] !== "\r") {
                comment += source.shift()
            }
        } else if (source[0] == '(') {
            tokens.push(token(source.shift(), TokenType.OpenParen))
        } else if (source[0] == ')') {
            tokens.push(token(source.shift(), TokenType.CloseParen))
        } else if (source[0] == '{') {
            tokens.push(token(source.shift(), TokenType.OpenBrace))
        } else if (source[0] == '}') {
            tokens.push(token(source.shift(), TokenType.CloseBrace))
        } else if (source[0] == '[') {
            tokens.push(token(source.shift(), TokenType.OpenBracket))
        } else if (source[0] == ']') {
            tokens.push(token(source.shift(), TokenType.CloseBracket))
        } else if (['+', '-', '*', '/', '%'].includes(source[0])) {
            tokens.push(token(source.shift(), TokenType.BinaryOperator))
        } else if (source[0] == '=') {
            if (source[1] == '=') {
                tokens.push(token('==', TokenType.DoubleEquals))
                source.shift()
                source.shift()
            } else {
                tokens.push(token(source.shift(), TokenType.Equals))
            }
        } else if (source[0] == ';') {
            tokens.push(token(source.shift(), TokenType.Semicolon))
        } else if (source[0] == ':') {
            tokens.push(token(source.shift(), TokenType.Colon))
        } else if (source[0] == ',') {
            tokens.push(token(source.shift(), TokenType.Comma))
        } else if (source[0] == '.') {
            tokens.push(token(source.shift(), TokenType.Dot))
        } else if (['"', '\''].includes(source[0])) {
            source.shift() // remove quote
            let string = ''

            while (source.length > 1 && source[0] != '"') {
                string += source.shift()
            }

            source.shift()
            tokens.push(token(string, TokenType.String))
        } else {
            // Handle multicharacter tokens

            // Build number token
            if (isInt(source[0])) {
                let num = ''

                while (source.length > 0 && isInt(source[0])) {
                    num += source.shift()
                }

                tokens.push(token(num, TokenType.Number))
            } else if (isAlpha(source[0])) {
                let ident = '' // foo let

                while (source.length > 0 && isAlpha(source[0])) {
                    ident += source.shift()
                }

                // Check for reserved keywords
                const reserved = KEYWORDS[ident]

                if (typeof reserved == 'number') {
                    tokens.push(token(ident, reserved))
                } else {
                    tokens.push(token(ident, TokenType.Identifier))
                }
            } else if (isSkippable(source[0])) {
                source.shift() // Skip current character
            } else {
                console.log('Unrecognized character found in source: ', source[0])
                process.exit(0)
            }
        }
    }
    
    tokens.push({ type: TokenType.EOF, value: 'EndOfFile' })

    return tokens
}