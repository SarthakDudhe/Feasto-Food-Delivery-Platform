import express from "express";
import { generateRecommendations } from "../controllers/aiController.js";

const AIrouter = express.Router()

AIrouter.post("/chat-recommend",generateRecommendations);


export default AIrouter;