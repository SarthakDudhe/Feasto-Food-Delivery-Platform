import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";

const FoodRouter = express.Router()



//Image Storage engine

const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})

FoodRouter.post("/add",upload.single("image"),addFood)
FoodRouter.get("/list",listFood)
FoodRouter.post("/remove",removeFood)

export default FoodRouter