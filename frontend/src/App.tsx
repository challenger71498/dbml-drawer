import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export function App() {
  return (
    <main className="app-shell">
      <section
        className="workspace-panel workspace-panel--editor"
        aria-labelledby="editor-heading"
      >
        <div className="panel-header">
          <p className="eyebrow">Frontend</p>
          <h1 id="editor-heading">DBML Drawer</h1>
        </div>
        <div className="placeholder-surface">
          <p>DBML editor workspace</p>
        </div>
      </section>

      <section
        className="workspace-panel workspace-panel--diagram"
        aria-labelledby="diagram-heading"
      >
        <div className="panel-header">
          <p className="eyebrow">Preview</p>
          <h2 id="diagram-heading">Diagram canvas</h2>
        </div>
        <div className="placeholder-surface placeholder-surface--diagram">
          <p>Rendering surface ready</p>
          <span>API: {apiBaseUrl}</span>
        </div>
      </section>
    </main>
  )
}
