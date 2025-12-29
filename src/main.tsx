import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

// Register service worker using Vite PWA plugin
if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegistered(registration: ServiceWorkerRegistration | undefined) {
        console.log('Service worker registered:', registration);
      },
      onRegisterError(error: Error) {
        console.error('Service worker registration failed:', error);
      },
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <HelmetProvider>
        <ErrorBoundary>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

