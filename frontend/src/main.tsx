import { bootstrapApp } from '@/app/main'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element was not found.')
}

bootstrapApp(root)
