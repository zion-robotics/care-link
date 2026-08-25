import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../lib/jwt"

export interface AuthRequest extends Request {
  user?: { userId: string; role: string }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated", code: "UNAUTHENTICATED" })
  }
  try {
    const token = header.split(" ")[1]
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: "Invalid or expired token", code: "INVALID_TOKEN" })
  }
}
