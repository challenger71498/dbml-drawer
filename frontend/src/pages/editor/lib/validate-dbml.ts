import { Parser } from '@dbml/core'
import type { CompilerDiagnostic } from '@dbml/core'
import type { DbmlDiagnostic } from '../model/dbml-diagnostics'

export type DbmlValidationResult =
  | {
      valid: true
      diagnostics: []
    }
  | {
      valid: false
      diagnostics: DbmlDiagnostic[]
    }

export function validateDbml(source: string): DbmlValidationResult {
  try {
    Parser.parse(source, 'dbml')

    return {
      valid: true,
      diagnostics: [],
    }
  } catch (error) {
    const diagnostics = normalizeDbmlError(error)

    return {
      valid: false,
      diagnostics,
    }
  }
}

function normalizeDbmlError(error: unknown): DbmlDiagnostic[] {
  const compilerDiagnostics = getCompilerDiagnostics(error)

  if (compilerDiagnostics.length === 0) {
    return [
      {
        message: getErrorMessage(error),
        severity: 'error',
      },
    ]
  }

  return compilerDiagnostics.map((diagnostic) => ({
    message: diagnostic.message,
    severity: diagnostic.type === 'warning' ? 'warning' : 'error',
    line: diagnostic.location.start.line,
    column: diagnostic.location.start.column,
    endLine: diagnostic.location.end?.line,
    endColumn: diagnostic.location.end?.column,
  }))
}

function getCompilerDiagnostics(error: unknown): CompilerDiagnostic[] {
  if (
    typeof error === 'object' &&
    error !== null &&
    'diags' in error &&
    Array.isArray(error.diags)
  ) {
    return error.diags.filter(isCompilerDiagnostic)
  }

  return []
}

function isCompilerDiagnostic(value: unknown): value is CompilerDiagnostic {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const diagnostic = value as Partial<CompilerDiagnostic>

  return (
    typeof diagnostic.message === 'string' &&
    typeof diagnostic.location?.start?.line === 'number' &&
    typeof diagnostic.location.start.column === 'number'
  )
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return 'Invalid DBML syntax.'
}
