import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth()
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/register" element={<div>Register</div>} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <div>Feed</div>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App