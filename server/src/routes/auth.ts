import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import { z } from "zod"
import prisma from "../lib/prisma"
import { signToken } from "../lib/jwt"

const router = Router()

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["patient", "doctor", "lab", "pharmacy"]),
  fullName: z.string().min(2),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post("/register", async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }

  const { email, password, role, fullName } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists", code: "EMAIL_TAKEN" })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      ...(role === "patient"
        ? { patientProfile: { create: { fullName } } }
        : { providerProfile: { create: { fullName } } }),
    },
  })

  const token = signToken({ userId: user.id, role: user.role })
  return res.status(201).json({ token, role: user.role, userId: user.id })
})

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password", code: "INVALID_CREDENTIALS" })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: "Incorrect email or password", code: "INVALID_CREDENTIALS" })
  }

  const token = signToken({ userId: user.id, role: user.role })
  return res.json({ token, role: user.role, userId: user.id })
})

export default router
