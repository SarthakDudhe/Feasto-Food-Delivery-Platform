import userModel from "../models/userModel.js"


//Add items to user cart


const addToCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId)
        let cartData = await userData.cartData;
        if (!cartData[req.body.itemId]) {
           cartData[req.body.itemId] = 1 
        }else{
            cartData[req.body.itemId] +=1;
        }

await userModel.findByIdAndUpdate(req.body.userId,{cartData})
 res.json({success:true,message:"Added To Cart"})
    } catch (error) {
            console.log(error.message)
    res.json({success:false,message:"Error"})  
    }
}



//Remove items from user cart

const removeFromCart = async (req,res) => {
    try {
           let userData = await userModel.findById(req.body.userId)
           let cartData = await userData.cartData;
           if(cartData[req.body.itemId] >0)
           {
             cartData[req.body.itemId] -=1;
           }
await userModel.findByIdAndUpdate(req.body.userId,{cartData})
 res.json({success:true,message:"Item Removed from Cart"})
    } catch (error) {
                    console.log(error.message)
    res.json({success:false,message:"Error"})  
    }
}

//Fetch user cart data

const getCart = async (req,res) => {
  try {
    const {userId} = req.body
    let userData = await userModel.findById(userId)
    let cartData = await userData.cartData
    res.json({success:true,cartData})
  } catch (error) {
    console.log(error.message)
    res.json({success:false,message:"Error Hai !"})  
  }
}







export {addToCart,removeFromCart,getCart}