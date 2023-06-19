import { RuntimeValue, NumberValue, StringValue } from './values'
import { Program, Statement, BinaryExpression, NumericLiteral, Identifier, VariableDeclaration, AssignmentExpression, ObjectLiteral, CallExpression, FunctionDeclaration, StringLiteral, MemberExpression, IfStatement, EqualityExpression } from '../frontend/ast'
import Environment from './environment'
import { evaluateIdentifier, evaluateBinaryExpression, evaluateAssignment, evaluateObjectExpression, evaluateCallExpression, evaluateMemberExpression, evaluateEqualityExpression } from './evaluate/expression'
import { evaluateFunctionDeclaration, evaluateIfStatement, evaluateProgram, evaluateVariableDeclaration } from './evaluate/statement'

export function evaluate (astNode: Statement, env: Environment): RuntimeValue {
    switch (astNode.kind) {
        case 'NumericLiteral':
            return {
                value: ((astNode as NumericLiteral).value),
                type: 'number' 
            } as NumberValue
        
        case 'StringLiteral':
            return {
                value: ((astNode as StringLiteral).value),
                type: 'string'
            } as StringValue

        case 'Identifier':
            return evaluateIdentifier(astNode as Identifier, env)

        case 'ObjectLiteral':
            return evaluateObjectExpression(astNode as ObjectLiteral, env)
        
        case 'CallExpression':
            return evaluateCallExpression(astNode as CallExpression, env)
        
        case 'MemberExpression':
            return evaluateMemberExpression(astNode as MemberExpression, env)

        case 'AssignmentExpression':
            return evaluateAssignment(astNode as AssignmentExpression, env)

        case 'BinaryExpression':
            return evaluateBinaryExpression(astNode as BinaryExpression, env)
        
        case 'EqualityExpression':
            return evaluateEqualityExpression(astNode as EqualityExpression, env)

        case 'Program':
            return evaluateProgram(astNode as Program, env)
        
        case 'VariableDeclaration':
            return evaluateVariableDeclaration(astNode as VariableDeclaration, env)
            
        case 'FunctionDeclaration':
            return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env)
        
        case 'IfStatement':
            return evaluateIfStatement(astNode as IfStatement, env)

        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode)
            process.exit(1)
    }
}