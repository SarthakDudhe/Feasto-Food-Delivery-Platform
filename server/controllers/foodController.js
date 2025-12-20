import foodModel from "../models/foodModel.js";
import fs from "fs"



//add food items

const addFood = async (req,res) => {
  let image_filename = `${req.file.filename}`;
  const food = new foodModel({
    name:req.body.name,
    description:req.body.description,
    price:req.body.price,
    category:req.body.category,
    image:image_filename
  })

try {
    await food.save();
    res.json({success:true,message:"Food Added Successfully"})
} catch (error) {
    console.log(error.message)
    res.json({success:false,message:"Error"})
}


}

//List all food

const listFood = async (req,res) => {
  try {
    const foods = await foodModel.find({});
    res.json({success:true,data:foods})
  } catch (error) {
     console.log(error.message)
    res.json({success:false,message:"Error"})
  }
}

//Remove food items

const removeFood = async (req,res) => {
  try {
    const{id} = req.body;
    const foodItem = await foodModel.findById(id);
    fs.unlink(`uploads/${foodItem.image}`,()=>{})

await foodModel.findByIdAndDelete(id)
res.json({success:true,message:"Food Removed !"})


  } catch (error) {
      console.log(error.message)
    res.json({success:false,message:"Error"})
  }
}





export {addFood,listFood,removeFood}