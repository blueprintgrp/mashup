import * as readline from 'readline-sync'

export default function (prefix = '>'): string {
    const result = readline.question(`${prefix} `)
    return result
}