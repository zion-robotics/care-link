import { Button } from "../ui/Button"

interface ConsentCardProps {
  id: string
  providerName: string
  facility: string
  role: string
  reason: string
  requestedAt: string
  status: "pending" | "approved" | "denied"
  onApprove?: (id: string) => void
  onDeny?: (id: string) => void
  onRevoke?: (id: string) => void
}

export function ConsentCard({ id, providerName, facility, role, reason, requestedAt, status, onApprove, onDeny, onRevoke }: ConsentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E2ECF4] p-6 shadow-sm relative">
      <span className="absolute top-4 right-4 text-[#6B8CAE]">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </span>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#1A6DB5]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[#1A6DB5]">{providerName[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0D1F35]">{providerName}</p>
          <p className="text-sm text-[#6B8CAE]">{role} at {facility}</p>
          <p className="text-sm text-[#0D1F35] mt-3 leading-relaxed">{reason}</p>
          <p className="text-xs text-[#6B8CAE] mt-2">{new Date(requestedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>
      {status === "pending" && (
        <div className="flex gap-3 mt-5 pt-4 border-t border-[#E2ECF4]">
          <Button variant="primary" onClick={() => onApprove?.(id)} className="flex-1">Approve access</Button>
          <Button variant="danger" onClick={() => onDeny?.(id)} className="flex-1">Deny</Button>
        </div>
      )}
      {status === "approved" && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E2ECF4]">
          <span className="text-sm text-[#0D9488] font-medium">Access granted</span>
          <Button variant="danger" onClick={() => onRevoke?.(id)}>Revoke</Button>
        </div>
      )}
      {status === "denied" && (
        <div className="mt-5 pt-4 border-t border-[#E2ECF4]">
          <span className="text-sm text-[#DC2626] font-medium">Access denied</span>
        </div>
      )}
    </div>
  )
}
