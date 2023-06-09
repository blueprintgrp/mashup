import { RuntimeValue, NumberValue } from './values'
import { Program, Statement, BinaryExpression, NumericLiteral, Identifier, VariableDeclaration, AssignmentExpression, ObjectLiteral } from '../frontend/ast'
import Environment from './environment'
import { evaluateIdentifier, evaluateBinaryExpression, evaluateAssignment, evaluateObjectExpression } from './evaluate/expression'
import { evaluateProgram, evaluateVariableDeclaration } from './evaluate/statement'

export function evaluate (astNode: Statement, env: Environment): RuntimeValue {
    switch (astNode.kind) {
        case 'NumericLiteral':
            return {
                value: ((astNode as NumericLiteral).value),
                type: 'number' 
            } as NumberValue

        case 'Identifier':
            return evaluateIdentifier(astNode as Identifier, env)

        case 'ObjectLiteral':
            return evaluateObjectExpression(astNode as ObjectLiteral, env)

        case 'AssignmentExpression':
            return evaluateAssignment(astNode as AssignmentExpression, env)

        case 'BinaryExpression':
            return evaluateBinaryExpression(astNode as BinaryExpression, env)
        
        case 'Program':
            return evaluateProgram(astNode as Program, env)
        
        case 'VariableDeclaration':
            return evaluateVariableDeclaration(astNode as VariableDeclaration, env)

        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode)
            process.exit(0)
    }
}