import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./lib/auth"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import PatientLayout from "./layouts/PatientLayout"
import PatientDashboard from "./pages/patient/Dashboard"

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role && !(role === "provider" && ["doctor", "lab", "pharmacy"].includes(user.role))) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === "patient" ? "/patient/dashboard" : "/provider/dashboard"} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === "patient" ? "/patient/dashboard" : "/provider/dashboard"} /> : <Register />} />
      <Route path="/patient" element={<ProtectedRoute role="patient"><PatientLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
      </Route>
      <Route path="/provider/*" element={<ProtectedRoute role="provider"><div>Provider shell coming soon</div></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
