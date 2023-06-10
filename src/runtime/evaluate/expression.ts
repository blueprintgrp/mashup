import { AssignmentExpression, BinaryExpression, CallExpression, Identifier, MemberCallExpression, MemberExpression, ObjectLiteral, Property } from "../../frontend/ast"
import Environment from "../environment"
import { evaluate } from "../interpreter"
import { FunctionValue, NativeFunValue, NullValue, NumberValue, ObjectValue, RuntimeValue, StringValue } from "../values"

export function evaluateNumericBinaryExpression (leftHandSide: NumberValue, rightHandSide: NumberValue, operator: string): NumberValue {
    let result: number

    if (operator == '+') result = leftHandSide.value + rightHandSide.value
    else if (operator == '-' ) result = leftHandSide.value - rightHandSide.value
    else if (operator == '*') result = leftHandSide.value * rightHandSide.value
    else if (operator == '/') result = leftHandSide.value / rightHandSide.value // TODO: Divison by zero checks
    else result = leftHandSide.value % rightHandSide.value

    return { value: result, type: 'number' }
}

export function evaluateStringBinaryExpression (leftHandSide: StringValue, rightHandSide: StringValue, operator: string): StringValue {
    let result: string

    if (operator == '+') result = leftHandSide.value + rightHandSide.value
    else throw `Cannot use operator "${operator}" in string binary expression.`

    return { value: result, type: 'string' }
}

export function evaluateBinaryExpression (binop: BinaryExpression, env: Environment): RuntimeValue {
    const leftHandSide = evaluate(binop.left, env)
    const rightHandSide = evaluate(binop.right, env)

    if (leftHandSide.type == 'number' && rightHandSide.type == 'number') {
        return evaluateNumericBinaryExpression(leftHandSide as NumberValue, rightHandSide as NumberValue, binop.operator)
    } else if (leftHandSide.type == 'string' && rightHandSide.type == 'string') {
        return evaluateStringBinaryExpression(leftHandSide as StringValue, rightHandSide as StringValue, binop.operator)
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

export function evaluateCallExpression(expression: CallExpression, env: Environment): RuntimeValue {
    const args = expression.args.map((arg) => evaluate(arg, env))
    const fun = evaluate(expression.caller, env)

    if (fun.type == 'stdfun') {
        const result = (fun as NativeFunValue).call(args, env)
        return result
    }
    
    if (fun.type == 'function') {
        const func = fun as FunctionValue
        const scope = new Environment(func.declarationEnv)

        for (let i = 0; i < func.parameters.length; i++) {
            // TODO: Check the bounds here
            // verify arity of function
            const varname = func.parameters[i]

            scope.declareVar(varname, args[i], false)
        }

        let result: RuntimeValue = { type: 'null', value: 'null' } as NullValue
        // evaluate the function body line by line
        for (const statement of func.body) {
            result = evaluate(statement, scope)
        }

        return result
    }

    throw 'Cannot call value that is not a function: ' + JSON.stringify(fun)
}

export function evaluateMemberExpression(expression: MemberExpression, env: Environment): RuntimeValue {
    const object = evaluate(expression.object, env)
    const property = (expression.property as Identifier).symbol
  
    if (object.type === 'object') {
        const objValue = object as ObjectValue
        const propertyValue = objValue.properties.get(property)
        
        if (propertyValue !== undefined) {
            return propertyValue
        } else {
            throw `Property "${property}" does not exist on object.`
      }
    } else {
        throw 'Cannot access property on non-object value.'
    }
}