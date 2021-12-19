import {basename} from 'path'

export interface FileSpec {
  source: string
  target: string
}

export function parseFilesList(files: string | null): FileSpec[] {
  return (files || '')
    .split('\n')
    .map(file => file.trim())
    .filter(file => !!file)
    .map(parseFileSpec)
}

export function parseFileSpec(file: string): FileSpec {
  const parts = file.split(' | ')
  if (parts.length < 2) {
    return {source: file, target: basename(file)}
  }

  return {source: parts[0].trim(), target: parts[1].trim()}
}
