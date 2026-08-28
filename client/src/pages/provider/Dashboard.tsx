import { useEffect, useState } from "react"
import api from "../../lib/api"

export default function ProviderDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    api.get("/provider/analytics").then(r => setAnalytics(r.data))
  }, [])

  const cards = [
    { label: "Pending requests", value: analytics?.pendingConsents ?? "..." },
    { label: "Records created", value: analytics?.records ?? "..." },
    { label: "Prescriptions issued", value: analytics?.prescriptions ?? "..." },
    { label: "Lab results uploaded", value: analytics?.labResults ?? "..." },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0D1F35] mb-1">Overview</h1>
      <p className="text-sm text-[#475569] mb-8">Your activity at a glance</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-lg border border-[#CBD5E1] p-5">
            <p className="text-2xl font-bold text-[#0D1F35]">{c.value}</p>
            <p className="text-sm text-[#475569] mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
