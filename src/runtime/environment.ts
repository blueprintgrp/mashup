import * as util from 'node:util'
import * as read from 'node:readline'

import { BooleanValue, NativeFunValue, NullValue, NumberValue, ObjectValue, RuntimeValue, StringValue } from "./values"
import prompt from '../utils/prompt'

export function createGlobalEnvironment () {
    const env = new Environment()

    // Standard Variables
    env.declareVar('true', { value: true, type: 'boolean' } as BooleanValue, true)
    env.declareVar('false', { value: false, type: 'boolean' } as BooleanValue, true)
    env.declareVar('null', { value: 'null', type: 'null' } as NullValue, true)

    // Standard Functions
    function println(args: RuntimeValue[], scope: Environment) {
        let log: any[] = []

        for (const arg of args) {
            switch (arg.type) {
                case 'number':
                    log.push(((arg as NumberValue).value))
                    continue
                case 'string':
                    log.push((arg as StringValue).value)
                    continue
                case 'boolean':
                    log.push(((arg as BooleanValue).value))
                    continue
                case 'null':
                    log.push(((arg as NullValue).value))
                    continue
                default:
                    log.push(arg)
            }
        }

        console.log(util.format.apply(this, log))

        return { type: 'null', value: 'null' } as NullValue 
    }

    function terminate(args: RuntimeValue[], scope: Environment) {
        if (args[0] == undefined || args[0].type != 'number') {
            console.log(`Process exited with exit code: 1`)
            process.exit(1)
        } else if ((args[0] as NumberValue).value == 0) {
            console.log(`Process exited with exit code: 0`)
            process.exit(0)
        } else {
            console.log(`Process exited with exit code: 1`)
            process.exit(1)
        }

        return { type: 'null', value: 'null' } as NullValue
    }

    env.declareVar('println', { type: 'stdfun', call: println } as NativeFunValue, true)
    env.declareVar('terminate', { type: 'stdfun', call: terminate } as NativeFunValue, true)

    return env
}

export default class Environment {
    private parent?: Environment
    private variables: Map<string, RuntimeValue>
    private constants : Set<string>

    constructor (parentENV?: Environment) {
        const global = parentENV ? true : false

        this.parent = parentENV
        this.variables = new Map()
        this.constants = new Set()
    }

    public declareVar (varname: string, value: RuntimeValue, constant: boolean): RuntimeValue {
        if (this.variables.has(varname)) {
            throw `Cannot declare variable ${varname}. As it already is defined.`
        }

        this.variables.set(varname, value)

        if (constant) {
            this.constants.add(varname)
        }

        return value
    }

    public assignVar (varname: string, value: RuntimeValue): RuntimeValue {
        const env = this.resolve(varname)
        
        if (env.constants.has(varname)) {
            throw `Cannot reasign to variable ${varname} as it's declared as a constant.`
        }

        env.variables.set(varname, value)

        return value
    }

    public lookupVar (varname: string): RuntimeValue {
        const env = this.resolve(varname)
        
        return env.variables.get(varname) as RuntimeValue
    }

    public resolve (varname: string): Environment {
        if (this.variables.has(varname)) 
            return this
        
        if (this.parent == undefined)
            throw `Cannot resolve ${varname} as it does not exist.`

        return this.parent.resolve(varname)  
    }
}