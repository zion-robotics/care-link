import { Router } from "express"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"

const router = Router()

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const records = await prisma.medicalRecord.findMany({
    where: { patientId: req.user!.userId },
    include: { doctor: { include: { providerProfile: true } } },
    orderBy: { createdAt: "desc" },
  })
  return res.json(records)
})

export default router
