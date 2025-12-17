import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './shared/config/i18n'
import App from './App'
import './styles/global.css'
import { initPerformanceMonitoring } from './shared/utils/performance'

// Initialisation du monitoring de performance
initPerformanceMonitoring()

// Initialisation de la base de données IndexedDB
import { initDatabase } from './shared/database'
initDatabase()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </BrowserRouter>
  </React.StrictMode>
)
