import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../lib/auth"
import api from "../../lib/api"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/auth/login", form)
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
          <h1 className="text-2xl font-bold text-[#0D1F35]">Welcome back</h1>
          <p className="text-sm text-[#6B8CAE] mt-1">Sign in to your CareLink account</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          {error && <p className="text-sm text-[#DC2626]">{error}</p>}
          <Button type="submit" loading={loading} className="w-full mt-2">Sign in</Button>
        </form>
        <p className="text-sm text-center text-[#6B8CAE] mt-6">
          No account? <Link to="/register" className="text-[#1A6DB5] font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}
