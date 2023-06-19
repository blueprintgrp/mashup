#! /usr/bin/env node

import * as fs from 'fs'
import * as util from 'util'

import { version, state } from '../package.json'

import Parser from './frontend/parser'
import { evaluate } from './runtime/interpreter'
import prompt from './utils/prompt'
import Environment, { createGlobalEnvironment } from './runtime/environment'
import { argv } from 'process'

const parser = new Parser()
const env = createGlobalEnvironment()

let sourcePath: string

if (argv[2]) {
    sourcePath = argv[2]
    file()
} else {
    repl()
}

async function file() {
    console.log()
    const source = fs.readFileSync(sourcePath.toString()).toString()
    const program = parser.produceAST(source)
    const result = evaluate(program, env)
}

async function repl () {
    console.log()
    const date = new Date(Date.now())
    console.log(`Nitro ${version} (${date.toDateString()}) on ${state}`)
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
        //console.log(result)
    }
}