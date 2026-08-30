import express from "express"
import { 
    loginRider, 
    registerRider, 
    listRiders, 
    verifyRider, 
    updateRiderAccountStatus, 
    updateVerificationParameters, 
    addMisconductReport, 
    updateRiderDocuments, 
    settleRiderPayout, 
    getFleetMapData, 
    toggleRiderDuty,
    getRiderProfile,
    getRiderOrders,
    updateRiderLiveGps
} from "../controllers/riderController.js"

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
riderRouter.post("/toggle-duty", toggleRiderDuty)
riderRouter.post("/profile", getRiderProfile)
riderRouter.post("/orders", getRiderOrders)
riderRouter.post("/update-gps", updateRiderLiveGps)

export default riderRouter;

