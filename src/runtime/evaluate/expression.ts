import { AssignmentExpression, BinaryExpression, Identifier, ObjectLiteral } from "../../frontend/ast"
import Environment from "../environment"
import { evaluate } from "../interpreter"
import { NullValue, NumberValue, ObjectValue, RuntimeValue } from "../values"

export function evaluateNumericBinaryExpression (leftHandSide: NumberValue, rightHandSide: NumberValue, operator: string): NumberValue {
    let result: number

    if (operator == '+') result = leftHandSide.value + rightHandSide.value
    else if (operator == '-' ) result = leftHandSide.value - rightHandSide.value
    else if (operator == '*') result = leftHandSide.value * rightHandSide.value
    else if (operator == '/') result = leftHandSide.value / rightHandSide.value // TODO: Divison by zero checks
    else result = leftHandSide.value % rightHandSide.value

    return { value: result, type: 'number' }
}

export function evaluateBinaryExpression (binop: BinaryExpression, env: Environment): RuntimeValue {
    const leftHandSide = evaluate(binop.left, env)
    const rightHandSide = evaluate(binop.right, env)

    if (leftHandSide.type == 'number' && rightHandSide.type == 'number') {
        return evaluateNumericBinaryExpression(leftHandSide as NumberValue, rightHandSide as NumberValue, binop.operator)
    }

    // One or both are NULL
    return { type: 'null', value: 'null' } as NullValue
}

export function evaluateIdentifier (ident: Identifier, env: Environment): RuntimeValue {
    const val = env.lookupVar(ident.symbol)
    return val
}

export function evaluateAssignment(node: AssignmentExpression, env: Environment): RuntimeValue {
    if (node.assigne.kind !== 'Identifier')
        throw `Invalid left hand side in assignment expression ${JSON.stringify(node.assigne)}.`

    const varname = ((node.assigne) as Identifier).symbol

    return env.assignVar(varname, evaluate(node.value, env))
}

export function evaluateObjectExpression(obj: ObjectLiteral, env: Environment): RuntimeValue {
    const object = { type: 'object', properties: new Map() } as ObjectValue 
    
    for (const { key, value } of obj.properties) {
        const runtimeValue = (value == undefined) ? env.lookupVar(key) : evaluate(value, env)

        object.properties.set(key, runtimeValue)
    }

    return object
}