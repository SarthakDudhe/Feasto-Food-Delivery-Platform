import express from "express"
import { loginRider, registerRider, listRiders, verifyRider, updateRiderAccountStatus, updateVerificationParameters, addMisconductReport, updateRiderDocuments, settleRiderPayout, getFleetMapData } from "../controllers/riderController.js"

const riderRouter = express.Router()

riderRouter.post("/register", registerRider)
riderRouter.post("/login", loginRider)
riderRouter.get("/list", listRiders)
riderRouter.get("/fleet-map", getFleetMapData)
riderRouter.post("/verify", verifyRider)
riderRouter.post("/update-status", updateRiderAccountStatus)
riderRouter.post("/update-verification", updateVerificationParameters)
riderRouter.post("/add-misconduct", addMisconductReport)
riderRouter.post("/update-documents", updateRiderDocuments)
riderRouter.post("/settle-payout", settleRiderPayout)

export default riderRouter;
