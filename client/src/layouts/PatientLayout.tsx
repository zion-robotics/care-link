import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"

const NAV = [
  { to: "/patient/dashboard", label: "Overview" },
  { to: "/patient/records", label: "My Records" },
  { to: "/patient/prescriptions", label: "Prescriptions" },
  { to: "/patient/labs", label: "Lab Results" },
  { to: "/patient/appointments", label: "Appointments" },
  { to: "/patient/consent", label: "Access Control" },
]

export default function PatientLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <nav className="bg-white border-b border-[#E2ECF4] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="text-lg font-bold text-[#0D1F35]">CareLink</span>
        <div className="flex items-center gap-6">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-[#1A6DB5]" : "text-[#6B8CAE] hover:text-[#0D1F35]"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="text-sm text-[#6B8CAE] hover:text-[#DC2626] transition-colors">Sign out</button>
        </div>
      </nav>
      <main className="max-w-[780px] mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
