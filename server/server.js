import "dotenv/config"
import express from "express";
import cors from "cors"
import { Connectdb } from "./configs/db.js";
import FoodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";



//app configs
const app = express()
//middlewares
app.use(express.json())
app.use(cors())


//DB connection
Connectdb();
//api endpoints
app.use("/api/food",FoodRouter)
app.use("/images",express.static("uploads"))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)

app.get("/",(req,res)=>{
res.send("Server is Live !")
})

const PORT = process.env.PORT || 4000

app.listen(PORT,()=>{console.log(`Server is live at port ${PORT}`)})