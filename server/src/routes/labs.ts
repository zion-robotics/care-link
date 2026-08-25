import { Router } from "express"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"

const router = Router()

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const results = await prisma.labResult.findMany({
    where: { patientId: req.user!.userId },
    include: { lab: { include: { providerProfile: true } } },
    orderBy: { createdAt: "desc" },
  })
  return res.json(results)
})

export default router
