"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lexer_1 = require("./lexer");
var Parser = /** @class */ (function () {
    function Parser() {
        this.tokens = [];
    }
    Parser.prototype.notEOF = function () {
        return this.tokens[0].type != lexer_1.TokenType.EOF;
    };
    Parser.prototype.at = function () {
        return this.tokens[0];
    };
    Parser.prototype.eat = function () {
        var prev = this.tokens.shift();
        return prev;
    };
    Parser.prototype.expect = function (type, error) {
        var prev = this.tokens.shift();
        if (!prev || prev.type != type) {
            console.error('Parser Error:\n', error, prev, 'Expecting: ', type);
            process.exit(1);
        }
        return prev;
    };
    Parser.prototype.produceAST = function (source) {
        this.tokens = (0, lexer_1.tokenize)(source);
        var program = {
            kind: 'Program',
            body: []
        };
        // Parse until end of file
        while (this.notEOF()) {
            program.body.push(this.parseStatement());
        }
        return program;
    };
    Parser.prototype.parseStatement = function () {
        // skip to parseExpression
        switch (this.at().type) {
            case lexer_1.TokenType.Let:
            case lexer_1.TokenType.Const:
                return this.parseVariableDeclaration();
            case lexer_1.TokenType.Fun:
                return this.parseFunctionDeclaration();
            case lexer_1.TokenType.If:
                return this.parseIfStatement();
            default:
                return this.parseExpression();
        }
    };
    Parser.prototype.parseIfStatement = function () {
        this.expect(lexer_1.TokenType.If, 'Expected "if" keyword.');
        var conditional = this.parseExpression();
        var consequent = [];
        var right;
        var operator;
        this.expect(lexer_1.TokenType.OpenBrace, 'Expected opening brace for consequent block.');
        while (this.at().type !== lexer_1.TokenType.EOF && this.at().type !== lexer_1.TokenType.CloseBrace) {
            consequent.push(this.parseStatement());
        }
        this.expect(lexer_1.TokenType.CloseBrace, 'Expected closing brace for consequent block.');
        var alternate = undefined;
        if (this.at().type === lexer_1.TokenType.Else) {
            this.eat(); // Skip "else" keyword
            if (this.at().type === lexer_1.TokenType.If) {
                // Handle "else if" case
                alternate = [this.parseIfStatement()];
            }
            else {
                // Handle "else" case
                alternate = [];
                this.expect(lexer_1.TokenType.OpenBrace, 'Expected opening brace for alternate block.');
                while (this.at().type !== lexer_1.TokenType.EOF && this.at().type !== lexer_1.TokenType.CloseBrace) {
                    alternate.push(this.parseStatement());
                }
                this.expect(lexer_1.TokenType.CloseBrace, 'Expected closing brace for alternate block.');
            }
        }
        return {
            kind: 'IfStatement',
            conditional: conditional,
            operator: operator,
            right: right,
            consequent: consequent,
            alternate: alternate,
        };
    };
    Parser.prototype.parseFunctionDeclaration = function () {
        this.eat();
        var name = this.expect(lexer_1.TokenType.Identifier, 'Expected function name following fun keyword.').value;
        var args = this.parseArgs();
        var params = [];
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            if (arg.kind !== 'Identifier') {
                console.log(arg);
                console.log('Expected parameters to be of type string inside function declaration.');
                process.exit(1);
            }
            params.push(arg.symbol);
        }
        this.expect(lexer_1.TokenType.OpenBrace, 'Expected function body following declaration');
        var body = [];
        while (this.at().type !== lexer_1.TokenType.EOF && this.at().type !== lexer_1.TokenType.CloseBrace) {
            body.push(this.parseStatement());
        }
        this.expect(lexer_1.TokenType.CloseBrace, 'Closing brace expected inside function declaration.');
        var fun = {
            body: body,
            name: name,
            parameters: params,
            kind: 'FunctionDeclaration'
        };
        return fun;
    };
    Parser.prototype.parseVariableDeclaration = function () {
        var isConstant = this.eat().type == lexer_1.TokenType.Const;
        var identifier = this.expect(lexer_1.TokenType.Identifier, 'Expected identifier name following let | const keywords.').value;
        if (this.at().type == lexer_1.TokenType.Semicolon) { // TODO: Remove semicolons
            this.eat();
            if (isConstant)
                console.log('Must assign value to constant expression. No value provided.');
            process.exit(1);
            return { kind: 'VariableDeclaration', identifier: identifier, constant: false };
        }
        this.expect(lexer_1.TokenType.Equals, 'Expected equals token following identifier in variable declaration.');
        var declaration = {
            kind: 'VariableDeclaration',
            value: this.parseExpression(),
            identifier: identifier,
            constant: isConstant
        };
        // this.expect(TokenType.Semicolon, 'Variable declaration statement must end with semicolon.')
        return declaration;
    };
    Parser.prototype.parseExpression = function () {
        return this.parseAssignmentExpression();
    };
    Parser.prototype.parseAssignmentExpression = function () {
        var left = this.parseObjectExpression();
        if (this.at().type == lexer_1.TokenType.Equals) {
            this.eat();
            var value = this.parseAssignmentExpression();
            return { value: value, assigne: left, kind: 'AssignmentExpression' };
        }
        return left;
    };
    Parser.prototype.parseObjectExpression = function () {
        if (this.at().type !== lexer_1.TokenType.OpenBrace) {
            return this.parseAdditiveExpression();
        }
        this.eat();
        var properties = new Array();
        while (this.notEOF() && this.at().type != lexer_1.TokenType.CloseBrace) {
            var key = this.expect(lexer_1.TokenType.Identifier, 'Object literal key expected.').value;
            // Allows shorthand key: value -> key
            if (this.at().type == lexer_1.TokenType.Comma) {
                this.eat(); // eat comma
                properties.push({ key: key, kind: 'Property' });
                continue;
            }
            else if (this.at().type == lexer_1.TokenType.CloseBrace) {
                properties.push({ key: key, kind: 'Property' });
                continue;
            }
            this.expect(lexer_1.TokenType.Colon, 'Missing colon following identifier in ObjectExpression.');
            var value = this.parseExpression();
            properties.push({ kind: 'Property', value: value, key: key });
            if (this.at().type != lexer_1.TokenType.CloseBrace) {
                this.expect(lexer_1.TokenType.Comma, 'Expected comma or closing brace following property.');
            }
        }
        this.expect(lexer_1.TokenType.CloseBrace, "Object literal missing closing brace.");
        return { kind: 'ObjectLiteral', properties: properties };
    };
    Parser.prototype.parseAdditiveExpression = function () {
        var left = this.parseMultiplicitaveExpression();
        while (['+', '-'].includes(this.at().value)) {
            var operator = this.eat().value;
            var right = this.parseMultiplicitaveExpression();
            left = {
                kind: 'BinaryExpression',
                left: left,
                right: right,
                operator: operator
            };
        }
        return left;
    };
    Parser.prototype.parseMultiplicitaveExpression = function () {
        var left = this.parseCallMemberExpression();
        while (['/', '*', '%'].includes(this.at().value)) {
            var operator = this.eat().value;
            var right = this.parseCallMemberExpression();
            left = {
                kind: 'BinaryExpression',
                left: left,
                right: right,
                operator: operator
            };
        }
        return left;
    };
    Parser.prototype.parseCallMemberExpression = function () {
        var member = this.parseMemberExpression();
        if (this.at().type == lexer_1.TokenType.OpenParen) {
            return this.parseCallExpression(member);
        }
        return member;
    };
    Parser.prototype.parseCallExpression = function (caller) {
        var callExpression = {
            kind: 'CallExpression',
            caller: caller,
            args: this.parseArgs()
        };
        if (this.at().type == lexer_1.TokenType.OpenParen) {
            callExpression = this.parseCallExpression(callExpression);
        }
        return callExpression;
    };
    Parser.prototype.parseArgs = function () {
        this.expect(lexer_1.TokenType.OpenParen, 'Expected an open parenthesis');
        var args = this.at().type == lexer_1.TokenType.CloseParen
            ? []
            : this.parseArgumentsList();
        this.expect(lexer_1.TokenType.CloseParen, 'Missing closing parenthesis inside arguments list');
        return args;
    };
    Parser.prototype.parseArgumentsList = function () {
        var args = [this.parseAssignmentExpression()];
        while (this.at().type == lexer_1.TokenType.Comma && this.eat()) {
            args.push(this.parseAssignmentExpression());
        }
        return args;
    };
    Parser.prototype.parseMemberExpression = function () {
        var object = this.parsePrimaryExpression();
        while (this.at().type == lexer_1.TokenType.Dot || this.at().type == lexer_1.TokenType.OpenBracket) {
            var operator = this.eat();
            var property = void 0;
            var computed = void 0;
            if (operator.type == lexer_1.TokenType.Dot) {
                computed = false;
                property = this.parsePrimaryExpression();
                if (property.kind != 'Identifier') {
                    console.log("Cannot use dot operator without right hand side being an identifier.");
                    process.exit(1);
                }
            }
            else {
                computed = true;
                property = this.parseExpression();
                this.expect(lexer_1.TokenType.CloseBracket, 'Missing closing bracket in computed value.');
            }
            object = { kind: 'MemberExpression', object: object, property: property, computed: computed };
        }
        return object;
    };
    Parser.prototype.parsePrimaryExpression = function () {
        var token = this.at().type;
        switch (token) {
            case lexer_1.TokenType.Identifier:
                return { kind: 'Identifier', symbol: this.eat().value };
            case lexer_1.TokenType.Number:
                return { kind: 'NumericLiteral', value: parseFloat(this.eat().value) };
            case lexer_1.TokenType.String:
                return { kind: 'StringLiteral', value: this.eat().value };
            case lexer_1.TokenType.OpenParen: {
                this.eat(); // eat the opening paren
                var left = this.parseExpression();
                var operator = void 0;
                var right = void 0;
                var value = void 0;
                if (this.at().type == lexer_1.TokenType.DoubleEquals || this.at().type == lexer_1.TokenType.NotEqual) {
                    operator = this.eat().type;
                    right = this.parseExpression();
                    value = { kind: 'EqualityExpression', left: left, operator: operator, right: right };
                }
                else {
                    value = left;
                }
                this.expect(lexer_1.TokenType.CloseParen, 'Unexpected token found inside parenthesised expression. Excpected closing parenthesis'); // eat the closing paren
                return value;
            }
            default:
                console.error('Unexpected token found during parsing: ', this.at());
                process.exit(1);
        }
    };
    return Parser;
}());
exports.default = Parser;
