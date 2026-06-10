export type DbmlDiagnostic = {
  message: string
  severity: 'error' | 'warning'
  line?: number
  column?: number
  endLine?: number
  endColumn?: number
}
