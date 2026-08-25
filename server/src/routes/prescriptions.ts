import { Router } from "express"
import { z } from "zod"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"
import { requireRole } from "../middleware/role"

const router = Router()

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const prescriptions = await prisma.prescription.findMany({
    where: { patientId: req.user!.userId },
    include: { doctor: { include: { providerProfile: true } } },
    orderBy: { issuedAt: "desc" },
  })
  return res.json(prescriptions)
})

const CreatePrescriptionSchema = z.object({
  patientId: z.string(),
  medications: z.array(z.object({ name: z.string(), dosage: z.string(), frequency: z.string(), duration: z.string() })),
  notes: z.string().optional(),
})

router.post("/", requireAuth, requireRole("doctor"), async (req: AuthRequest, res) => {
  const parsed = CreatePrescriptionSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }

  const consent = await prisma.consentRequest.findFirst({
    where: { patientId: parsed.data.patientId, providerId: req.user!.userId, status: "approved" },
  })
  if (!consent) {
    return res.status(403).json({ error: "You do not have approved access to this patient", code: "NO_CONSENT" })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const prescription = await prisma.prescription.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: req.user!.userId,
      medications: parsed.data.medications,
      notes: parsed.data.notes,
      expiresAt,
    },
  })

  return res.status(201).json(prescription)
})

export default router
