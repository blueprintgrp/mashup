import * as fs from 'fs'
import * as util from 'util'

import { version } from '../package.json'

import Parser from './frontend/parser'
import { evaluate } from './runtime/interpreter'
import prompt from './utils/prompt'
import Environment, { createGlobalEnvironment } from './runtime/environment'

const parser = new Parser()
const env = createGlobalEnvironment()

run()

async function run() {
    const source = fs.readFileSync('./examples/test.mp').toString()
    const program = parser.produceAST(source)
    const result = evaluate(program, env)

    console.log(util.inspect(result, true, null, true))
    process.exit(1)
}

async function repl () {
    console.log(`Mashup ${version} on ts-node`)
    console.log(`Type "exit" to exit.`)
    while (true) {
        const source = await prompt()

        if (source.includes('exit')) {
            process.exit(1)
        }

        if (!source) {
            continue
        }

        const program = parser.produceAST(source)
        
        const result = evaluate(program, env)
        console.log(result)
    }
}