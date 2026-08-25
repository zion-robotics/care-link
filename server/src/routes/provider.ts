import { Router } from "express"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"
import { requireRole } from "../middleware/role"

const router = Router()

router.get("/patients/search", requireAuth, requireRole("doctor", "lab", "pharmacy"), async (req: AuthRequest, res) => {
  const q = String(req.query.q || "").trim()
  if (q.length < 2) return res.json([])

  const patients = await prisma.patientProfile.findMany({
    where: { fullName: { contains: q, mode: "insensitive" } },
    include: { user: { select: { id: true, email: true } } },
    take: 10,
  })
  return res.json(patients)
})

router.get("/analytics", requireAuth, requireRole("doctor", "lab", "pharmacy"), async (req: AuthRequest, res) => {
  const providerId = req.user!.userId
  const role = req.user!.role

  const [pendingConsents, records, prescriptions, labResults] = await Promise.all([
    prisma.consentRequest.count({ where: { providerId, status: "pending" } }),
    role === "doctor" ? prisma.medicalRecord.count({ where: { doctorId: providerId } }) : 0,
    role === "doctor" ? prisma.prescription.count({ where: { doctorId: providerId } }) : 0,
    role === "lab" ? prisma.labResult.count({ where: { labId: providerId } }) : 0,
  ])

  return res.json({ pendingConsents, records, prescriptions, labResults })
})

export default router
