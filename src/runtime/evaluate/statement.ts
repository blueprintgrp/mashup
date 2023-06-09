import { Program, VariableDeclaration } from "../../frontend/ast"
import Environment from "../environment"
import { evaluate } from "../interpreter"
import { RuntimeValue, NullValue } from "../values"

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