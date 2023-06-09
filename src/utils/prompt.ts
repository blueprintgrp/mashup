import * as readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

export default function (prefix = '>'): Promise<string> {
    return new Promise((resolve) => {
      rl.question(`${prefix} `, (input: string) => {
        resolve(input)
      })
    })
  }