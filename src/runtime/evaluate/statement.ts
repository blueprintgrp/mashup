import { FunctionDeclaration, Program, VariableDeclaration } from "../../frontend/ast"
import Environment from "../environment"
import { evaluate } from "../interpreter"
import { RuntimeValue, NullValue, FunctionValue } from "../values"

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