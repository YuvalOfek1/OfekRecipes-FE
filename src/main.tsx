import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
          success: { iconTheme: { primary: '#ff914d', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ff4d61', secondary: '#fff' } }
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
)
