import { Router } from "express"
import { z } from "zod"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"

const router = Router()

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.userId },
  })
  if (!profile) return res.status(404).json({ error: "Profile not found", code: "NOT_FOUND" })
  return res.json(profile)
})

const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  genotype: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  insuranceStatus: z.enum(["uninsured", "insured", "nhis"]).optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
})

router.patch("/me", requireAuth, async (req: AuthRequest, res) => {
  const parsed = UpdateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }
  const profile = await prisma.patientProfile.update({
    where: { userId: req.user!.userId },
    data: parsed.data,
  })
  return res.json(profile)
})

export default router
