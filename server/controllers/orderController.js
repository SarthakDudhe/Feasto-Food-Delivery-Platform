import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Stripe from "stripe"
import { getCouponDiscount } from "../utils/coupons.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


//Placing user Order from frontend
const placeOrder = async (req,res) => {

const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173"

  try {
    const subtotal = req.body.items.reduce((total,item)=>total + (item.price * item.quantity),0);
    const deliveryFee = subtotal === 0 ? 0 : 2;
    const { coupon, discount } = getCouponDiscount(req.body.couponCode,subtotal);
    const orderAmount = subtotal - discount + deliveryFee;

    const newOrder = new orderModel({
        userId:req.body.userId,
        items:req.body.items,
        amount:orderAmount,
        address:req.body.address,
        notes:req.body.notes || "",
        coupon:coupon ? {
            code:coupon.code,
            discount
        } : null,
        deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString()
    })

await newOrder.save();
await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

const line_Items = req.body.items.map((item)=>({
price_data:{
    currency:"inr",
    product_data:{
        name:item.name
    },
    unit_amount:item.price*100*90
},
quantity:item.quantity
}))

if (deliveryFee > 0) {
line_Items.push({
    price_data:{
        currency:"inr",
        product_data:{
            name:"Delivery Charges"
        },
        unit_amount:deliveryFee*100*90
    },
    quantity:1
})
}

const sessionConfig = {
    line_items:line_Items,
    mode:"payment",
    success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
       cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
}

if (coupon && discount > 0) {
    const stripeCoupon = await stripe.coupons.create({
        amount_off:Math.round(discount*100*90),
        currency:"inr",
        duration:"once",
        name:`${coupon.code} discount`
    })

    sessionConfig.discounts = [{coupon:stripeCoupon.id}]
}

const session = await stripe.checkout.sessions.create(sessionConfig)

res.json({success:true,session_url:session.url})

  } catch (error) {
        console.log(error.message)
    res.json({success:false,message:"Error"})
  }  
}


const verifyOrder = async (req,res) => {
     const{orderId,success}=req.body;
    try {
       if (success == "true") {
        await orderModel.findByIdAndUpdate(orderId,{payment:true});
        res.json({success:true,message:"Paid"})
       }
       else{
        await orderModel.findByIdAndDelete(orderId);
        res.json({success:false,message:"Payment Failed"})
       }


    } catch (error) {
                console.log(error.message)
    res.json({success:false,message:"Error"})
    }
}

//User Orders for Frontend
const userOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    } catch (error) {
    console.log(error.message)
    res.json({success:false,message:"Error"}) 
    }
}

//List orders for admin panel
const listOrders = async (req,res) => {
    try {
     const orders = await orderModel.find({})
    res.json({success:true,data:orders})    
    } catch (error) {
          console.log(error.message)
    res.json({success:false,message:"Error"})   
    }
   
}

//Api for updating the order status
const updateStatus = async(req,res)=>{
    try {
        const { orderId, status } = req.body;
        const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        
        // Broadcast real-time status update to customer & fleet
        const io = req.app.get("io");
        if (io && order) {
          const room = String(orderId);
          console.log(`[Socket Broadcast] Order ${room} status changed to: ${status}`);
          io.to(room).emit("order_status_update", { orderId, status });
          io.emit(`order_status_${room}`, { orderId, status });
        }

        res.json({success:true,message:"Status Updated Successfully", data: order});
    } catch (error) {
    console.log(error.message)
    res.json({success:false,message:"Error"})     
    }
}

// Retrieve a single order detail
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Security check: ensure order belongs to requesting user
    if (order.userId !== req.body.userId) {
      return res.json({ success: false, message: "Unauthorized access to order" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error" });
  }
}

// Get order statistics and analytics for Admin Dashboard
const getOrderAnalytics = async (req, res) => {
  try {
    const orders = await orderModel.find({ payment: true });
    
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let categorySales = {};
    let dailyRevenue = {};

    // Initialize last 7 days of daily revenue
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyRevenue[dateString] = 0;
    }

    orders.forEach(order => {
      totalRevenue += order.amount;
      
      // Calculate daily trends
      if (order.date) {
        const orderDate = new Date(order.date);
        const dateString = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dailyRevenue[dateString] !== undefined) {
          dailyRevenue[dateString] += order.amount;
        }
      }

      // Calculate category counts
      if (order.items) {
        order.items.forEach(item => {
          const category = item.category || "Other";
          const qty = item.quantity || 1;
          const salesVal = item.price * qty;
          categorySales[category] = (categorySales[category] || 0) + salesVal;
        });
      }
    });

    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // Convert dailyRevenue to array for chart line
    const revenueTrend = Object.keys(dailyRevenue).map(key => ({
      date: key,
      revenue: Math.round(dailyRevenue[key])
    }));

    // Convert categorySales to array
    const categoryTrend = Object.keys(categorySales).map(key => ({
      category: key,
      value: Math.round(categorySales[key])
    }));

    res.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        revenueTrend,
        categoryTrend,
        recentOrders: orders.slice(-5).reverse() // Last 5 orders
      }
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Error" });
  }
};

// Assign a delivery rider to an order (with phone & GPS location)
const assignRider = async (req, res) => {
  try {
    const { orderId, riderId, riderName, riderPhone, riderLat, riderLng } = req.body;

    if (!orderId || !riderName || !riderId) {
      return res.json({ success: false, message: "orderId, riderId and riderName are required" });
    }

    const updatePayload = {
      riderId,
      riderName,
      riderPhone: riderPhone || "",
      riderUpdatedAt: new Date(),
    };

    // Only update coordinates if both are provided and are valid numbers
    if (riderLat !== undefined && riderLng !== undefined &&
        !isNaN(parseFloat(riderLat)) && !isNaN(parseFloat(riderLng))) {
      updatePayload.riderLat = parseFloat(riderLat);
      updatePayload.riderLng = parseFloat(riderLng);
    }

    const order = await orderModel.findByIdAndUpdate(orderId, updatePayload, { new: true });

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Broadcast rider assignment to customer
    const io = req.app.get("io");
    if (io) {
      const room = String(orderId);
      console.log(`[Socket Broadcast] Rider ${riderName} assigned to order: ${room}`);
      io.to(room).emit("order_rider_assigned", {
        orderId,
        riderId,
        riderName,
        riderPhone: order.riderPhone,
        status: order.status,
      });
      io.emit(`order_rider_${room}`, {
        orderId,
        riderId,
        riderName,
        riderPhone: order.riderPhone,
        status: order.status,
      });
    }

    res.json({ success: true, message: "Rider assigned successfully", data: order });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Error assigning rider" });
  }
};

// Live update rider location and/or status from rider portal/app
const updateRiderLocation = async (req, res) => {
  try {
    const { orderId, riderLat, riderLng, status } = req.body;

    if (!orderId) {
      return res.json({ success: false, message: "orderId is required" });
    }

    const updatePayload = {
      riderUpdatedAt: new Date(),
    };

    if (riderLat !== undefined && riderLng !== undefined &&
        !isNaN(parseFloat(riderLat)) && !isNaN(parseFloat(riderLng))) {
      updatePayload.riderLat = parseFloat(riderLat);
      updatePayload.riderLng = parseFloat(riderLng);
    }

    if (status) {
      updatePayload.status = status;
    }

    const order = await orderModel.findByIdAndUpdate(orderId, updatePayload, { new: true });

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    const io = req.app.get("io");
    if (io && status) {
      const room = String(orderId);
      io.to(room).emit("order_status_update", { orderId, status });
      io.emit(`order_status_${room}`, { orderId, status });
    }

    res.json({ success: true, message: "Rider location & status updated", data: order });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Error updating rider location" });
  }
};

// Verify delivery OTP
const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    if (!orderId || !otp) {
      return res.json({ success: false, message: "orderId and otp are required" });
    }
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    if (order.deliveryOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    
    // Mark as delivered
    order.status = "Delivered";
    await order.save();

    // Broadcast delivery completion to customer & fleet
    const io = req.app.get("io");
    if (io) {
      const room = String(orderId);
      console.log(`[Socket Broadcast] Order ${room} delivered by rider!`);
      io.to(room).emit("order_status_update", { orderId, status: "Delivered" });
      io.emit(`order_status_${room}`, { orderId, status: "Delivered" });
    }

    // Credit Rider wallet & earnings
    if (order.riderId) {
      try {
        const { default: riderModel } = await import("../models/riderModel.js");
        const rider = await riderModel.findById(order.riderId);
        if (rider) {
          if (!rider.earnings) {
            rider.earnings = { totalEarned: 0, cashCollected: 0, pendingPayout: 0 };
          }
          const commission = Math.max(3.5, Math.round(order.amount * 0.15 * 100) / 100);
          rider.earnings.totalEarned = (rider.earnings.totalEarned || 0) + commission;

          if (order.payment) {
            // Online paid order -> Digital payout credited to pending balance
            rider.earnings.pendingPayout = (rider.earnings.pendingPayout || 0) + commission;
          } else {
            // Cash on Delivery -> Rider collected customer cash
            rider.earnings.cashCollected = (rider.earnings.cashCollected || 0) + order.amount;
          }

          await rider.save();
        }
      } catch (err) {
        console.error("Error crediting rider earnings:", err);
      }
    }
    
    res.json({ success: true, message: "Order successfully delivered & earnings credited!" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Error verifying OTP" });
  }
}

// Add a chat message
const addChatMessage = async (req, res) => {
  try {
    const { orderId, sender, text } = req.body;
    if (!orderId || !sender || !text) {
      return res.json({ success: false, message: "orderId, sender, and text are required" });
    }
    
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    const message = { sender, text, timestamp: new Date() };
    order.chat.push(message);
    await order.save();
    
    res.json({ success: true, message: "Chat added", chat: order.chat });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Error adding chat" });
  }
}

// Submit Rider Review
const submitRiderReview = async (req, res) => {
  try {
    const { orderId, rating, feedback } = req.body;
    if (!orderId || !rating) {
      return res.json({ success: false, message: "orderId and rating are required" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.isRated) {
      return res.json({ success: false, message: "Order already rated" });
    }

    order.riderRating = rating;
    order.isRated = true;
    await order.save();

    // Update Rider's average rating
    if (order.riderId) {
      import("../models/riderModel.js").then(async ({ default: riderModel }) => {
        const rider = await riderModel.findById(order.riderId);
        if (rider) {
          const newTotalRatings = rider.totalRatings + 1;
          const newAverageRating = ((rider.averageRating * rider.totalRatings) + rating) / newTotalRatings;
          rider.totalRatings = newTotalRatings;
          rider.averageRating = newAverageRating;

          // Automated Escalation for low ratings
          if (rating <= 3 && feedback) {
            let severity = "Low";
            if (feedback.toLowerCase().includes("safety") || feedback.toLowerCase().includes("tampered")) {
              severity = "High";
              if (rider.accountStatus === "Active") rider.accountStatus = "Suspended";
            } else if (feedback.toLowerCase().includes("damaged") || feedback.toLowerCase().includes("unprofessional")) {
              severity = "Medium";
            }
            
            rider.misconductReports.push({
              reason: `Customer Rating (${rating} Stars): ${feedback}`,
              severity,
              date: new Date()
            });
          }

          await rider.save();
        }
      }).catch(err => console.error("Error loading riderModel for rating:", err));
    }

    res.json({ success: true, message: "Review submitted successfully!" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Error submitting review" });
  }
}

export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus,getOrderDetail,getOrderAnalytics,assignRider,updateRiderLocation,verifyDeliveryOtp,addChatMessage,submitRiderReview}
