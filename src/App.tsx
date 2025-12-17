import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useStore } from './store/useStore'
import Layout from './components/Layout/Layout'
import LoadingScreen from './components/Loading/LoadingScreen'
import ErrorBoundary from './components/Error/ErrorBoundary'
import { initApp } from './shared/utils/appInitializer'

// Lazy loading des pages
const HomePage = lazy(() => import('./pages/Home/HomePage'))
const CategorySelection = lazy(() => import('./pages/CategorySelection/CategorySelection'))
const RallyLearning = lazy(() => import('./pages/Learning/RallyLearning'))
const FormulaLearning = lazy(() => import('./pages/Learning/FormulaLearning'))
const EnduranceLearning = lazy(() => import('./pages/Learning/EnduranceLearning'))
const DriftLearning = lazy(() => import('./pages/Learning/DriftLearning'))
const PracticeTrack = lazy(() => import('./pages/Practice/PracticeTrack'))
const ProgressDashboard = lazy(() => import('./pages/Progress/ProgressDashboard'))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'))

function App() {
  const { isInitialized, initializeApp } = useStore()

  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  if (!isInitialized) {
    return <LoadingScreen message="Initialisation du simulateur..." />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="categories" element={<CategorySelection />} />
            <Route path="learn">
              <Route path="rally" element={<RallyLearning />} />
              <Route path="formula" element={<FormulaLearning />} />
              <Route path="endurance" element={<EnduranceLearning />} />
              <Route path="drift" element={<DriftLearning />} />
            </Route>
            <Route path="practice">
              <Route path="track/:trackId" element={<PracticeTrack />} />
            </Route>
            <Route path="progress" element={<ProgressDashboard />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
