import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"

const NAV = [
  { to: "/provider/dashboard", label: "Overview" },
  { to: "/provider/patients", label: "Patients" },
  { to: "/provider/records", label: "Records" },
  { to: "/provider/prescriptions", label: "Prescriptions" },
  { to: "/provider/labs", label: "Lab Results" },
]

export default function ProviderLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex">
      <aside className="w-60 bg-white border-r border-[#CBD5E1] flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-[#CBD5E1]">
          <span className="text-lg font-bold text-[#0D1F35]">CareLink</span>
          <p className="text-xs text-[#475569] mt-0.5">Provider Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-[#1A6DB5] text-white" : "text-[#475569] hover:bg-[#F0F4F8]"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-[#CBD5E1]">
          <button onClick={() => { logout(); navigate("/login") }} className="w-full px-3 py-2 rounded-lg text-sm text-[#475569] hover:bg-[#F0F4F8] text-left transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      <main className="ml-60 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
