import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import { EditorPage } from '@/pages/editor'

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/editor" element={<EditorPage />} />
        <Route path="*" element={<Navigate to="/editor" replace />} />
      </Routes>
    </Router>
  )
}
