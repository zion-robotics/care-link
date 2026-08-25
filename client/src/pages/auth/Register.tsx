import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../lib/auth"
import api from "../../lib/api"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"

const ROLES = [
  { value: "patient", label: "Patient", desc: "Manage your health records" },
  { value: "doctor", label: "Doctor", desc: "Access and manage patient care" },
  { value: "lab", label: "Laboratory", desc: "Upload and manage test results" },
  { value: "pharmacy", label: "Pharmacy", desc: "Manage and fulfill prescriptions" },
]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "", fullName: "", role: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.role) return setError("Select a role to continue")
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/auth/register", form)
      login(res.data)
      navigate(res.data.role === "patient" ? "/patient/dashboard" : "/provider/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-[#E2ECF4] p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0D1F35]">Create your account</h1>
          <p className="text-sm text-[#6B8CAE] mt-1">Join CareLink and take control of your health records</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <div>
            <p className="text-sm font-medium text-[#0D1F35] mb-2">I am a</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r.value }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    form.role === r.value
                      ? "border-[#1A6DB5] bg-[#1A6DB5]/5"
                      : "border-[#E2ECF4] hover:border-[#1A6DB5]/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-[#0D1F35]">{r.label}</p>
                  <p className="text-xs text-[#6B8CAE] mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-[#DC2626]">{error}</p>}
          <Button type="submit" loading={loading} className="w-full mt-2">Create account</Button>
        </form>
        <p className="text-sm text-center text-[#6B8CAE] mt-6">
          Already have an account? <Link to="/login" className="text-[#1A6DB5] font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
