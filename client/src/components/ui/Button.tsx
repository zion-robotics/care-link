import { ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger"
  loading?: boolean
}

export function Button({ variant = "primary", loading, className, children, ...props }: ButtonProps) {
  const base = "px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-[#1A6DB5] text-white hover:bg-[#155d9e]",
    outline: "border border-[#1A6DB5] text-[#1A6DB5] hover:bg-[#1A6DB5] hover:text-white",
    danger: "border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white",
  }
  return (
    <button className={cn(base, variants[variant], className)} disabled={loading || props.disabled} {...props}>
      {loading ? "Loading..." : children}
    </button>
  )
}
