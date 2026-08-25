import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRouter from "./routes/auth"
import patientsRouter from "./routes/patients"
import recordsRouter from "./routes/records"
import prescriptionsRouter from "./routes/prescriptions"
import labsRouter from "./routes/labs"
import consentRouter from "./routes/consent"
import providerRouter from "./routes/provider"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/auth", authRouter)
app.use("/api/patients", patientsRouter)
app.use("/api/records", recordsRouter)
app.use("/api/prescriptions", prescriptionsRouter)
app.use("/api/labs", labsRouter)
app.use("/api/consent", consentRouter)
app.use("/api/provider", providerRouter)

app.get("/api/health", (_, res) => res.json({ status: "ok" }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
