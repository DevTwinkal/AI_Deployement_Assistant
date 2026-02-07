import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TamboProvider } from './tambo' // Import from local instead of package
import { tambo } from './tambo'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <TamboProvider client={tambo}>
        <App />
      </TamboProvider>
    </ErrorBoundary>
  </StrictMode>,
)
