import { useEffect, useState } from "react"
import api from "../../lib/api"
import { ConsentCard } from "../../components/patient/ConsentCard"

export default function Consent() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchRequests() {
    try {
      const res = await api.get("/consent/requests")
      setRequests(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  async function handleApprove(id: string) {
    await api.patch(`/consent/${id}/respond`, { status: "approved" })
    fetchRequests()
  }

  async function handleDeny(id: string) {
    await api.patch(`/consent/${id}/respond`, { status: "denied" })
    fetchRequests()
  }

  async function handleRevoke(id: string) {
    await api.patch(`/consent/${id}/revoke`)
    fetchRequests()
  }

  if (loading) return <p className="text-sm text-[#6B8CAE]">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0D1F35] mb-1">Access control</h1>
      <p className="text-sm text-[#6B8CAE] mb-8">Manage who can see your health records</p>
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2ECF4] p-8 text-center">
          <p className="text-[#6B8CAE] text-sm">No access requests yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map(r => (
            <ConsentCard
              key={r.id}
              id={r.id}
              providerName={r.provider.providerProfile?.fullName ?? "Unknown"}
              facility={r.provider.providerProfile?.facilityName ?? "Unknown facility"}
              role={r.provider.role}
              reason={r.reason}
              requestedAt={r.requestedAt}
              status={r.status}
              onApprove={handleApprove}
              onDeny={handleDeny}
              onRevoke={handleRevoke}
            />
          ))}
        </div>
      )}
    </div>
  )
}
