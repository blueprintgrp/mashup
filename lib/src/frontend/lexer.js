"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Literal Types
    TokenType[TokenType["Number"] = 0] = "Number";
    TokenType[TokenType["String"] = 1] = "String";
    TokenType[TokenType["Identifier"] = 2] = "Identifier";
    // Keywords
    TokenType[TokenType["Let"] = 3] = "Let";
    TokenType[TokenType["Fun"] = 4] = "Fun";
    TokenType[TokenType["If"] = 5] = "If";
    TokenType[TokenType["Else"] = 6] = "Else";
    // Grouping * Operators
    TokenType[TokenType["BinaryOperator"] = 7] = "BinaryOperator";
    TokenType[TokenType["Equals"] = 8] = "Equals";
    TokenType[TokenType["DoubleEquals"] = 9] = "DoubleEquals";
    TokenType[TokenType["NotEqual"] = 10] = "NotEqual";
    TokenType[TokenType["Comma"] = 11] = "Comma";
    TokenType[TokenType["Dot"] = 12] = "Dot";
    TokenType[TokenType["Colon"] = 13] = "Colon";
    TokenType[TokenType["Quote"] = 14] = "Quote";
    TokenType[TokenType["OpenParen"] = 15] = "OpenParen";
    TokenType[TokenType["CloseParen"] = 16] = "CloseParen";
    TokenType[TokenType["OpenBrace"] = 17] = "OpenBrace";
    TokenType[TokenType["CloseBrace"] = 18] = "CloseBrace";
    TokenType[TokenType["OpenBracket"] = 19] = "OpenBracket";
    TokenType[TokenType["CloseBracket"] = 20] = "CloseBracket";
    TokenType[TokenType["Comment"] = 21] = "Comment";
    TokenType[TokenType["EOF"] = 22] = "EOF";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var KEYWORDS = {
    'let': TokenType.Let,
    'fun': TokenType.Fun,
    'if': TokenType.If,
    'else': TokenType.Else,
};
function token(value, type) {
    if (value === void 0) { value = ''; }
    return { value: value, type: type };
}
function isAlpha(source) {
    return source.toUpperCase() != source.toLowerCase();
}
function isSkippable(source) {
    return [' ', '\n', '\t', '\r'].includes(source);
}
function isInt(source) {
    var char = source.charCodeAt(0);
    var bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (char >= bounds[0] && char <= bounds[1]);
}
function tokenize(sourceCode) {
    var tokens = new Array();
    var source = sourceCode.split('');
    // Build each token until end of file
    while (source.length > 0) {
        if (source[0] == '/' && source[1] == '/') {
            source.shift();
            source.shift();
            var comment = '';
            while (source.length > 1 && String(source)[0] !== "\n" && String(source)[0] !== "\r") {
                comment += source.shift();
            }
        }
        else if (source[0] == '(') {
            tokens.push(token(source.shift(), TokenType.OpenParen));
        }
        else if (source[0] == ')') {
            tokens.push(token(source.shift(), TokenType.CloseParen));
        }
        else if (source[0] == '{') {
            tokens.push(token(source.shift(), TokenType.OpenBrace));
        }
        else if (source[0] == '}') {
            tokens.push(token(source.shift(), TokenType.CloseBrace));
        }
        else if (source[0] == '[') {
            tokens.push(token(source.shift(), TokenType.OpenBracket));
        }
        else if (source[0] == ']') {
            tokens.push(token(source.shift(), TokenType.CloseBracket));
        }
        else if (['+', '-', '*', '/', '%'].includes(source[0])) {
            tokens.push(token(source.shift(), TokenType.BinaryOperator));
        }
        else if (source[0] == '=') {
            if (source[1] == '=') {
                source.shift();
                source.shift();
                tokens.push(token('==', TokenType.DoubleEquals));
            }
            else {
                tokens.push(token(source.shift(), TokenType.Equals));
            }
        }
        else if (source[0] == '!') {
            if (source[1] == '=') {
                source.shift();
                source.shift();
                tokens.push(token('!=', TokenType.NotEqual));
            }
        }
        else if (source[0] == ':') {
            tokens.push(token(source.shift(), TokenType.Colon));
        }
        else if (source[0] == ',') {
            tokens.push(token(source.shift(), TokenType.Comma));
        }
        else if (source[0] == '.') {
            tokens.push(token(source.shift(), TokenType.Dot));
        }
        else if (['"', '\''].includes(source[0])) {
            source.shift(); // remove quote
            var string = '';
            while (source.length > 1 && source[0] != '"') {
                string += source.shift();
            }
            source.shift();
            tokens.push(token(string, TokenType.String));
        }
        else {
            // Handle multicharacter tokens
            // Build number token
            if (isInt(source[0])) {
                var num = '';
                while (source.length > 0 && isInt(source[0])) {
                    num += source.shift();
                }
                tokens.push(token(num, TokenType.Number));
            }
            else if (isAlpha(source[0])) {
                var ident = ''; // foo let
                while (source.length > 0 && isAlpha(source[0])) {
                    ident += source.shift();
                }
                // Check for reserved keywords
                var reserved = KEYWORDS[ident];
                if (typeof reserved == 'number') {
                    tokens.push(token(ident, reserved));
                }
                else {
                    tokens.push(token(ident, TokenType.Identifier));
                }
            }
            else if (isSkippable(source[0])) {
                source.shift(); // Skip current character
            }
            else {
                console.log('Unrecognized character found in source: ', source[0]);
                process.exit(1);
            }
        }
    }
    tokens.push({ type: TokenType.EOF, value: 'EndOfFile' });
    return tokens;
}
exports.tokenize = tokenize;
