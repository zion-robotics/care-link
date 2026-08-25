import { Router } from "express"
import { z } from "zod"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"
import { requireRole } from "../middleware/role"

const router = Router()

// Provider: send a request
router.post("/request", requireAuth, requireRole("doctor", "lab", "pharmacy"), async (req: AuthRequest, res) => {
  const parsed = z.object({ patientId: z.string(), reason: z.string().min(10) }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }

  const existing = await prisma.consentRequest.findFirst({
    where: { patientId: parsed.data.patientId, providerId: req.user!.userId, status: "pending" },
  })
  if (existing) {
    return res.status(409).json({ error: "You already have a pending request for this patient", code: "DUPLICATE_REQUEST" })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const consent = await prisma.consentRequest.create({
    data: {
      patientId: parsed.data.patientId,
      providerId: req.user!.userId,
      reason: parsed.data.reason,
      expiresAt,
    },
  })

  await prisma.notification.create({
    data: {
      userId: parsed.data.patientId,
      type: "consent_request",
      title: "Access request",
      body: `A provider is requesting access to your records`,
    },
  })

  return res.status(201).json(consent)
})

// Patient: list incoming requests
router.get("/requests", requireAuth, requireRole("patient"), async (req: AuthRequest, res) => {
  const requests = await prisma.consentRequest.findMany({
    where: { patientId: req.user!.userId },
    include: { provider: { include: { providerProfile: true } } },
    orderBy: { requestedAt: "desc" },
  })
  return res.json(requests)
})

// Patient: respond to a request
router.patch("/:id/respond", requireAuth, requireRole("patient"), async (req: AuthRequest, res) => {
  const parsed = z.object({ status: z.enum(["approved", "denied"]) }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Status must be approved or denied", code: "VALIDATION_ERROR" })
  }

  const consent = await prisma.consentRequest.findFirst({
    where: { id: (req.params.id as string), patientId: req.user!.userId },
  })
  if (!consent) return res.status(404).json({ error: "Request not found", code: "NOT_FOUND" })

  const updated = await prisma.consentRequest.update({
    where: { id: (req.params.id as string) },
    data: { status: parsed.data.status, respondedAt: new Date() },
  })
  return res.json(updated)
})

// Patient: revoke access
router.patch("/:id/revoke", requireAuth, requireRole("patient"), async (req: AuthRequest, res) => {
  const consent = await prisma.consentRequest.findFirst({
    where: { id: (req.params.id as string), patientId: req.user!.userId, status: "approved" },
  })
  if (!consent) return res.status(404).json({ error: "Approved consent not found", code: "NOT_FOUND" })

  const updated = await prisma.consentRequest.update({
    where: { id: (req.params.id as string) },
    data: { status: "denied", respondedAt: new Date() },
  })
  return res.json(updated)
})

// Patient: audit log
router.get("/audit", requireAuth, requireRole("patient"), async (req: AuthRequest, res) => {
  const logs = await prisma.consentAuditLog.findMany({
    where: { patientId: req.user!.userId },
    include: { provider: { include: { providerProfile: true } } },
    orderBy: { accessedAt: "desc" },
  })
  return res.json(logs)
})

export default router
