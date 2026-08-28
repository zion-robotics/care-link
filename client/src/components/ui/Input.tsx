import type { InputHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[#0D1F35]">{label}</label>
      <input
        className={cn(
          "px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors",
          "border-[#E2ECF4] bg-white focus:border-[#1A6DB5] focus:ring-2 focus:ring-[#1A6DB5]/20",
          error && "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
}
