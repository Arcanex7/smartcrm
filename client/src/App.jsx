import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './Context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Landing from './pages/Landing'   
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Pipeline from './pages/Pipeline'
import AIAssistant from './pages/AIAssistant'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#13161F',
              color: '#F0EEE9',
              border: '1px solid rgba(139,92,246,0.2)',
              fontSize: '13px'
            }
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/home" element={<Landing />} />
          <Route path="/" element={<Navigate to="/home" replace />} /> {/* ✅ added replace */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/leads"
            element={
              <PrivateRoute>
                <Leads />
              </PrivateRoute>
            }
          />

          <Route
            path="/pipeline"
            element={
              <PrivateRoute>
                <Pipeline />
              </PrivateRoute>
            }
          />

          <Route
            path="/ai"
            element={
              <PrivateRoute>
                <AIAssistant />
              </PrivateRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <PrivateRoute requiredRole="manager">
                <Analytics />
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute requiredRole="admin">
                <Settings />
              </PrivateRoute>
            }
          />

          {/* Optional: Catch-all route */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App