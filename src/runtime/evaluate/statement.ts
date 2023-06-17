import { Expression, FunctionDeclaration, IfStatement, Program, VariableDeclaration } from "../../frontend/ast"
import { TokenType } from "../../frontend/lexer"
import Environment from "../environment"
import { evaluate } from "../interpreter"
import { RuntimeValue, NullValue, FunctionValue, BooleanValue, NumberValue } from "../values"

export function evaluateProgram(program: Program, env: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = { type: 'null', value: 'null' } as NullValue

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env)
    }

    return lastEvaluated
}

export function evaluateVariableDeclaration(declaration: VariableDeclaration, env: Environment): RuntimeValue {
    const value = declaration.value ? evaluate(declaration.value, env) : { value: 'null', type: 'null' } as NullValue

    return env.declareVar(declaration.identifier, value, declaration.constant)
}

export function evaluateFunctionDeclaration(declaration: FunctionDeclaration, env: Environment): RuntimeValue {
    const fun = {
        type: 'function',
        name: declaration.name,
        parameters: declaration.parameters,
        declarationEnv: env,
        body: declaration.body
    } as FunctionValue

    return env.declareVar(declaration.name, fun, true)
}

export function evaluateIfStatement(statement: IfStatement, env: Environment): RuntimeValue {
    const conditional: RuntimeValue = evaluate(statement.conditional, env)

    if (conditional.type == 'boolean') {
        const result = (conditional as BooleanValue)
        const runtimeVal = result as RuntimeValue
        if (isTruthy(runtimeVal)) {
            if (Array.isArray(statement.consequent)) {
                // Evaluate each statement in the consequent array
                for (const consequentStatement of statement.consequent) {
                  evaluate(consequentStatement, env);
                }
            } else {
                // Evaluate the single consequent statement
                return evaluate(statement.consequent, env);
            }
        } else {
            if (statement.alternate) {
                if (Array.isArray(statement.alternate)) {
                    // Evaluate each statement in the alternate array
                    for (const alternateStatement of statement.alternate) {
                      evaluate(alternateStatement, env);
                    }
                } else {
                    // Evaluate the single alternate statement
                    return evaluate(statement.alternate, env);
                }
            }
        }
    } else {
        if (isTruthy(conditional)) {
            if (Array.isArray(statement.consequent)) {
              // Evaluate each statement in the consequent array
              for (const consequentStatement of statement.consequent) {
                evaluate(consequentStatement, env);
              }
            } else {
              // Evaluate the single consequent statement
              return evaluate(statement.consequent, env);
            }
        } else {
            if (statement.alternate) {
                if (Array.isArray(statement.alternate)) {
                    // Evaluate each statement in the alternate array
                    for (const alternateStatement of statement.alternate) {
                      evaluate(alternateStatement, env);
                    }
                } else {
                    // Evaluate the single alternate statement
                    return evaluate(statement.alternate, env);
                }
            }
        }
    }
      
    return { type: 'null', value: 'null' } as NullValue
}

function isTruthy(conditional: RuntimeValue) {
    if (conditional.type == 'boolean') {
        const bool = (conditional as BooleanValue).value
        if (bool) return true
        else return false
    }

    if (conditional) {
        return true
    } else {
        return false
    }
}