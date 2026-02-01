import {GoogleGenAI} from "@google/genai"
import { extractContext } from "../utils/helper.js"
import {RecipePrompt } from "../prompt/Foodprompt.js";
const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

// export const generateRecommendations = async (req,res) => {
//     try {
//         const {inp_text} = req.body;
//         const { weather,timeOfDay,diet,maxPrice} = extractContext(inp_text);

//         const prompt = RecommendPrompt( weather,timeOfDay,diet,maxPrice);

//         const response = await ai.models.generateContent({
//             model:"gemini-3-flash-preview",
//              contents: prompt,
//         })

//         return res.json({success:true,response});


//     } catch (error) {
        
//     }
// }


export const generateRecommendations = async (req, res) => {
  try {
    const { inp_text } = req.body;

    const {foodItem} = extractContext(inp_text);

    const prompt = RecipePrompt(foodItem);

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    // 4️⃣ Extract only the recipe text
    const text =
      aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      return res.status(404).json({
        success: false,
        message: "No recipe found for this dish.",
      });
    }

    return res.json({
      success: true,
      data: text, // clean array
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
    });
  }
};



