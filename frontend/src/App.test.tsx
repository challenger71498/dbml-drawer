import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the initial workspace shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'DBML Drawer' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Diagram canvas' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Rendering surface ready')).toBeInTheDocument()
  })
})
