import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TamboProvider } from './tambo' // Import from local instead of package
import { tambo } from './tambo/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <TamboProvider client={tambo}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TamboProvider>
    </ErrorBoundary>
  </StrictMode>,
)
