import { Statement } from "../frontend/ast"
import Environment from "./environment"

export type ValueType = 
    | 'null'
    | 'number'
    | 'string'
    | 'boolean'
    | 'object'
    | 'stdfun'
    | 'function'

export interface RuntimeValue {
    type: ValueType
}

export interface NullValue extends RuntimeValue {
    type: 'null'
    value: 'null'
}

export interface BooleanValue extends RuntimeValue {
    type: 'boolean'
    value: boolean
}

export interface NumberValue extends RuntimeValue {
    type: 'number'
    value: number
}

export interface StringValue extends RuntimeValue {
    type: 'string'
    value: string
}

export interface ObjectValue extends RuntimeValue {
    type: 'object'
    properties: Map<string, RuntimeValue>
}

export type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue

export interface NativeFunValue extends RuntimeValue {
    type: 'stdfun'
    call: FunctionCall
}

export interface FunctionValue extends RuntimeValue {
    type: 'function'
    name: string
    parameters: string[]
    declarationEnv: Environment
    body: Statement[]
}