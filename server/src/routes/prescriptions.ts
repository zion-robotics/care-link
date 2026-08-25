import { Router } from "express"
import prisma from "../lib/prisma"
import { requireAuth, AuthRequest } from "../middleware/auth"

const router = Router()

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const prescriptions = await prisma.prescription.findMany({
    where: { patientId: req.user!.userId },
    include: { doctor: { include: { providerProfile: true } } },
    orderBy: { issuedAt: "desc" },
  })
  return res.json(prescriptions)
})

export default router
