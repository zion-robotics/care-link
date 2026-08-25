import { Router } from "express"
import { z } from "zod"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"
import { requireRole } from "../middleware/role"

const router = Router()

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const records = await prisma.medicalRecord.findMany({
    where: { patientId: req.user!.userId },
    include: { doctor: { include: { providerProfile: true } } },
    orderBy: { createdAt: "desc" },
  })
  return res.json(records)
})

const CreateRecordSchema = z.object({
  patientId: z.string(),
  title: z.string().min(2),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  visitDate: z.string().optional(),
})

router.post("/", requireAuth, requireRole("doctor"), async (req: AuthRequest, res) => {
  const parsed = CreateRecordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }

  const consent = await prisma.consentRequest.findFirst({
    where: { patientId: parsed.data.patientId, providerId: req.user!.userId, status: "approved" },
  })
  if (!consent) {
    return res.status(403).json({ error: "You do not have approved access to this patient", code: "NO_CONSENT" })
  }

  const record = await prisma.medicalRecord.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: req.user!.userId,
      title: parsed.data.title,
      diagnosis: parsed.data.diagnosis,
      notes: parsed.data.notes,
      visitDate: parsed.data.visitDate ? new Date(parsed.data.visitDate) : undefined,
    },
  })

  await prisma.consentAuditLog.create({
    data: {
      consentId: consent.id,
      patientId: parsed.data.patientId,
      providerId: req.user!.userId,
      action: "created_record",
      recordId: record.id,
    },
  })

  return res.status(201).json(record)
})

export default router
