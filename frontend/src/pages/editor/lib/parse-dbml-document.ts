import { Parser } from '@dbml/core'
import type { DbmlDatabase } from '../model/dbml-entities'

export function parseDbmlDocument(source: string): DbmlDatabase {
  return Parser.parse(source, 'dbml')
}
