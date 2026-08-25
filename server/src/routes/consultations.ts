import { Router } from "express"
import { z } from "zod"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"
import { requireRole } from "../middleware/role"

const router = Router()

router.post("/", requireAuth, requireRole("doctor"), async (req: AuthRequest, res) => {
  const parsed = z.object({ patientId: z.string() }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }

  const consent = await prisma.consentRequest.findFirst({
    where: { patientId: parsed.data.patientId, providerId: req.user!.userId, status: "approved" },
  })
  if (!consent) {
    return res.status(403).json({ error: "You need approved access before starting a consultation", code: "NO_CONSENT" })
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: parsed.data.patientId,
      providerId: req.user!.userId,
      type: "telemedicine",
      scheduledAt: new Date(),
      consultation: {
        create: {
          patientId: parsed.data.patientId,
          doctorId: req.user!.userId,
        },
      },
    },
    include: { consultation: true },
  })

  return res.status(201).json(appointment.consultation)
})

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const consult = await prisma.consultation.findUnique({
    where: { id: (req.params.id as string) },
    include: {
      messages: { include: { sender: { include: { patientProfile: true, providerProfile: true } } }, orderBy: { sentAt: "asc" } },
      patient: { include: { patientProfile: true } },
      doctor: { include: { providerProfile: true } },
    },
  })
  if (!consult) return res.status(404).json({ error: "Consultation not found", code: "NOT_FOUND" })
  if (consult.patientId !== req.user!.userId && consult.doctorId !== req.user!.userId) {
    return res.status(403).json({ error: "Access denied", code: "FORBIDDEN" })
  }
  return res.json(consult)
})

router.post("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const parsed = z.object({ message: z.string().min(1) }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Message cannot be empty", code: "VALIDATION_ERROR" })
  }

  const consult = await prisma.consultation.findUnique({ where: { id: (req.params.id as string) } })
  if (!consult) return res.status(404).json({ error: "Consultation not found", code: "NOT_FOUND" })
  if (consult.patientId !== req.user!.userId && consult.doctorId !== req.user!.userId) {
    return res.status(403).json({ error: "Access denied", code: "FORBIDDEN" })
  }

  const msg = await prisma.consultationMessage.create({
    data: { consultationId: (req.params.id as string), senderId: req.user!.userId, message: parsed.data.message },
    include: { sender: { include: { patientProfile: true, providerProfile: true } } },
  })
  return res.status(201).json(msg)
})

router.patch("/:id/close", requireAuth, requireRole("doctor"), async (req: AuthRequest, res) => {
  const parsed = z.object({ summary: z.string().optional() }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }

  const consult = await prisma.consultation.findFirst({
    where: { id: (req.params.id as string), doctorId: req.user!.userId },
  })
  if (!consult) return res.status(404).json({ error: "Consultation not found", code: "NOT_FOUND" })

  const updated = await prisma.consultation.update({
    where: { id: (req.params.id as string) },
    data: { status: "closed", summary: parsed.data.summary, closedAt: new Date() },
  })

  if (parsed.data.summary) {
    await prisma.medicalRecord.create({
      data: {
        patientId: consult.patientId,
        doctorId: req.user!.userId,
        title: "Telemedicine consultation notes",
        notes: parsed.data.summary,
        visitDate: new Date(),
      },
    })
  }

  return res.json(updated)
})

export default router
