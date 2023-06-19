"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = void 0;
var expression_1 = require("./evaluate/expression");
var statement_1 = require("./evaluate/statement");
function evaluate(astNode, env) {
    switch (astNode.kind) {
        case 'NumericLiteral':
            return {
                value: (astNode.value),
                type: 'number'
            };
        case 'StringLiteral':
            return {
                value: (astNode.value),
                type: 'string'
            };
        case 'Identifier':
            return (0, expression_1.evaluateIdentifier)(astNode, env);
        case 'ObjectLiteral':
            return (0, expression_1.evaluateObjectExpression)(astNode, env);
        case 'CallExpression':
            return (0, expression_1.evaluateCallExpression)(astNode, env);
        case 'MemberExpression':
            return (0, expression_1.evaluateMemberExpression)(astNode, env);
        case 'AssignmentExpression':
            return (0, expression_1.evaluateAssignment)(astNode, env);
        case 'BinaryExpression':
            return (0, expression_1.evaluateBinaryExpression)(astNode, env);
        case 'EqualityExpression':
            return (0, expression_1.evaluateEqualityExpression)(astNode, env);
        case 'Program':
            return (0, statement_1.evaluateProgram)(astNode, env);
        case 'VariableDeclaration':
            return (0, statement_1.evaluateVariableDeclaration)(astNode, env);
        case 'FunctionDeclaration':
            return (0, statement_1.evaluateFunctionDeclaration)(astNode, env);
        case 'IfStatement':
            return (0, statement_1.evaluateIfStatement)(astNode, env);
        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode);
            process.exit(0);
    }
}
exports.evaluate = evaluate;
