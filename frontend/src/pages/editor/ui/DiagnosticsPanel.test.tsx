import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DiagnosticsPanel } from './DiagnosticsPanel'

describe('DiagnosticsPanel', () => {
  it('shows an empty diagnostics state', () => {
    render(<DiagnosticsPanel diagnostics={[]} />)

    expect(screen.getByText('No diagnostics')).toBeInTheDocument()
    expect(screen.getByText('0 issues')).toBeInTheDocument()
  })

  it('shows diagnostic messages and positions', () => {
    render(
      <DiagnosticsPanel
        diagnostics={[
          {
            message: 'Expected closing brace.',
            severity: 'error',
            line: 4,
            column: 2,
          },
        ]}
      />,
    )

    expect(screen.getByText('Expected closing brace.')).toBeInTheDocument()
    expect(screen.getByText('Line 4, column 2')).toBeInTheDocument()
    expect(screen.getByText('1 issue')).toBeInTheDocument()
  })
})
