import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/global.css'

export function bootstrapApp(root: HTMLElement) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
