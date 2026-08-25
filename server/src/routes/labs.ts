import { Router } from "express"
import { z } from "zod"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"
import { requireRole } from "../middleware/role"

const router = Router()

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const results = await prisma.labResult.findMany({
    where: { patientId: req.user!.userId },
    include: { lab: { include: { providerProfile: true } } },
    orderBy: { createdAt: "desc" },
  })
  return res.json(results)
})

const UploadResultSchema = z.object({
  patientId: z.string(),
  testName: z.string().min(2),
  resultSummary: z.string().optional(),
  fileUrl: z.string().url().optional(),
  testDate: z.string().optional(),
})

router.post("/", requireAuth, requireRole("lab"), async (req: AuthRequest, res) => {
  const parsed = UploadResultSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" })
  }

  const result = await prisma.labResult.create({
    data: {
      patientId: parsed.data.patientId,
      labId: req.user!.userId,
      testName: parsed.data.testName,
      resultSummary: parsed.data.resultSummary,
      fileUrl: parsed.data.fileUrl,
      testDate: parsed.data.testDate ? new Date(parsed.data.testDate) : undefined,
    },
  })

  return res.status(201).json(result)
})

export default router
