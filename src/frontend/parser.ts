import { 
    AssignmentExpression,
    BinaryExpression, 
    CallExpression, 
    Expression, 
    Identifier,
    MemberExpression,
    NumericLiteral,
    ObjectLiteral,
    Program, 
    Property, 
    Statement,
    VariableDeclaration, 
    FunctionDeclaration,
    StringLiteral,
    IfStatement,
    EqualityExpression,
} from "./ast"

import { tokenize, Token, TokenType } from "./lexer"

export default class Parser {
    private tokens: Token[] = []

    private notEOF (): boolean {
        return this.tokens[0].type != TokenType.EOF
    }

    private at () {
        return this.tokens[0] as Token
    }

    private eat () {
        const prev = this.tokens.shift() as Token
        return prev
    }

    private expect (type: TokenType, error: string) {
        const prev = this.tokens.shift() as Token
        if (!prev || prev.type != type) {
            console.error('Parser Error:\n', error, prev, 'Expecting: ', type)
            process.exit(1)
        }

        return prev
    }

    public produceAST (source: string): Program {
        this.tokens = tokenize(source)

        const program: Program = {
            kind: 'Program',
            body: []
        }
        
        // Parse until end of file
        while (this.notEOF()) {
            program.body.push(this.parseStatement())
        }

        return program
    } 

    private parseStatement (): Statement {
        // skip to parseExpression
        switch (this.at().type) {
            case TokenType.Let:
                return this.parseVariableDeclaration()
            
            case TokenType.Fun:
                return this.parseFunctionDeclaration()

            case TokenType.If:
                return this.parseIfStatement()
            
            default:
                return this.parseExpression()
        }
    }
    
    private parseIfStatement(): IfStatement {
        this.expect(TokenType.If, 'Expected "if" keyword.')
        const conditional = this.parseExpression()
        const consequent: Statement[] = []
        let right: Expression
        let operator: TokenType

        this.expect(TokenType.OpenBrace, 'Expected opening brace for consequent block.')

        while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace) {
            consequent.push(this.parseStatement())
        }
      
        this.expect(TokenType.CloseBrace, 'Expected closing brace for consequent block.')
      
        let alternate: Statement[] | undefined = undefined
      
        if (this.at().type === TokenType.Else) {
          this.eat() // Skip "else" keyword
      
          if (this.at().type === TokenType.If) {
            // Handle "else if" case
            alternate = [this.parseIfStatement()]
          } else {
            // Handle "else" case
            alternate = []
      
            this.expect(TokenType.OpenBrace, 'Expected opening brace for alternate block.')
      
            while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace) {
              alternate.push(this.parseStatement())
            }
      
            this.expect(TokenType.CloseBrace, 'Expected closing brace for alternate block.')
          }
        }
      
        return {
          kind: 'IfStatement',
          conditional,
          operator,
          right,
          consequent,
          alternate,
        } as IfStatement
      }
    
    private parseFunctionDeclaration(): Statement {
        this.eat()
        const name = this.expect(TokenType.Identifier, 'Expected function name following fun keyword.').value
        const args = this.parseArgs()
        const params: string[] = []

        for (const arg of args) {
            if (arg.kind !== 'Identifier') {
                console.log(arg)
                console.log('Expected parameters to be of type string inside function declaration.')
                process.exit(1)
            }

            params.push((arg as Identifier).symbol)
        }

        this.expect(TokenType.OpenBrace, 'Expected function body following declaration')
        const body: Statement[] = []

        while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace) {
            body.push(this.parseStatement())
        }

        this.expect(TokenType.CloseBrace, 'Closing brace expected inside function declaration.')
        
        const fun = {
            body,
            name,
            parameters: params,
            kind: 'FunctionDeclaration'
        } as FunctionDeclaration

        return fun
    }
    
    private parseVariableDeclaration(): Statement {
        this.eat()
        const identifier = this.expect(
            TokenType.Identifier, 
            'Expected identifier name following let | const keywords.'
        ).value

        if (!(this.at().type == TokenType.Equals)) {
            return { kind: 'VariableDeclaration', identifier, constant: false } as VariableDeclaration
        }

        this.expect(TokenType.Equals, 'Expected equals token following identifier in variable declaration.')

        const declaration = {
            kind: 'VariableDeclaration',
            value: this.parseExpression(),
            identifier,
            constant: false
        } as VariableDeclaration

        return declaration
    }

    private parseExpression (): Expression {
        return this.parseAssignmentExpression()
    }

    private parseAssignmentExpression(): Expression {
        const left = this.parseObjectExpression()
        
        if (this.at().type == TokenType.Equals) {
            this.eat()
            const value: Expression = this.parseAssignmentExpression()
            return { value, assigne: left, kind: 'AssignmentExpression' } as AssignmentExpression
        }

        return left
    }

    private parseObjectExpression(): Expression {
        if (this.at().type !== TokenType.OpenBrace) {
            return this.parseAdditiveExpression()
        }

        this.eat()
        const properties = new Array<Property>()

        while (this.notEOF() && this.at().type != TokenType.CloseBrace) {
            const key = this.expect(TokenType.Identifier, 'Object literal key expected.').value

            // Allows shorthand key: value -> key
            if (this.at().type == TokenType.Comma) {
                this.eat() // eat comma

                properties.push({ key, kind: 'Property' })
                continue

            } else if (this.at().type == TokenType.CloseBrace) {
                properties.push({ key, kind: 'Property' })
                continue
            }

            this.expect(TokenType.Colon, 'Missing colon following identifier in ObjectExpression.')
            const value = this.parseExpression()

            properties.push({ kind: 'Property', value, key })
            if (this.at().type != TokenType.CloseBrace) {
                this.expect(TokenType.Comma, 'Expected comma or closing brace following property.')
            }
        }

        this.expect(TokenType.CloseBrace, "Object literal missing closing brace.")

        return { kind: 'ObjectLiteral', properties } as ObjectLiteral
    }

    private parseAdditiveExpression (): Expression {
        let left = this.parseMultiplicitaveExpression()

        while (['+', '-'].includes(this.at().value)) {
            const operator = this.eat().value
            const right = this.parseMultiplicitaveExpression()
            left = {
                kind: 'BinaryExpression',
                left, right, operator
            } as BinaryExpression
        }

        return left
    }

    private parseMultiplicitaveExpression (): Expression {
        let left = this.parseCallMemberExpression()

        while (['/', '*', '%'].includes(this.at().value)) {
            const operator = this.eat().value
            const right = this.parseCallMemberExpression()
            left = {
                kind: 'BinaryExpression',
                left, right, operator
            } as BinaryExpression
        }

        return left
    }

    private parseCallMemberExpression(): Expression {
        const member = this.parseMemberExpression()

        if (this.at().type == TokenType.OpenParen) {
            return this.parseCallExpression(member)
        }

        return member
    }

    private parseCallExpression(caller: Expression): Expression {
        let callExpression: Expression = {
            kind: 'CallExpression',
            caller,
            args: this.parseArgs()
        } as CallExpression

        if (this.at().type == TokenType.OpenParen) {
            callExpression = this.parseCallExpression(callExpression)
        }

        return callExpression
    }

    private parseArgs(): Expression[] {
        this.expect(TokenType.OpenParen, 'Expected an open parenthesis')

        const args = this.at().type == TokenType.CloseParen
            ? []
            : this.parseArgumentsList()
        
        this.expect(TokenType.CloseParen, 'Missing closing parenthesis inside arguments list')

        return args
    }

    private parseArgumentsList(): Expression[] {
        const args = [this.parseAssignmentExpression()]

        while (this.at().type == TokenType.Comma && this.eat()) {
            args.push(this.parseAssignmentExpression())
        }

        return args
    }

    private parseMemberExpression(): Expression {
        let object = this.parsePrimaryExpression()

        while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket) {
            const operator = this.eat()
            let property: Expression
            let computed: boolean

            if (operator.type == TokenType.Dot) {
                computed = false
                property = this.parsePrimaryExpression()

                if (property.kind != 'Identifier') {
                    console.log(`Cannot use dot operator without right hand side being an identifier.`)
                    process.exit(1)
                }
            } else {
                computed = true
                property = this.parseExpression()

                this.expect(TokenType.CloseBracket, 'Missing closing bracket in computed value.')
            }

            object = { kind: 'MemberExpression', object, property, computed } as MemberExpression
        }

        return object
    }

    private parsePrimaryExpression(): Expression {
        const token = this.at().type

        switch (token) {
            case TokenType.Identifier:
                return { kind: 'Identifier', symbol: this.eat().value } as Identifier

            case TokenType.Number:
                return { kind: 'NumericLiteral', value: parseFloat(this.eat().value) } as NumericLiteral
            
            case TokenType.String:
                return { kind: 'StringLiteral', value: this.eat().value } as StringLiteral

            case TokenType.OpenParen: {
                this.eat() // eat the opening paren
                const left = this.parseExpression()
                let operator: TokenType
                let right: Expression
                let value: Expression

                if (this.at().type == TokenType.DoubleEquals || this.at().type == TokenType.NotEqual) {
                    operator = this.eat().type
                    right = this.parseExpression()
                    value = { kind: 'EqualityExpression', left, operator, right } as EqualityExpression
                } else {
                    value = left
                }

                this.expect(
                    TokenType.CloseParen,
                    'Unexpected token found inside parenthesised expression. Excpected closing parenthesis'
                ) // eat the closing paren

                return value
            }

            default:
                console.error('Unexpected token found during parsing: ', this.at())
                process.exit(1)
        }
    }
}