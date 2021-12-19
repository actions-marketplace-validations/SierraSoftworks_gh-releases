import {readFile as readFileCallback} from 'fs'

export async function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    readFileCallback(path, 'utf8', (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}
