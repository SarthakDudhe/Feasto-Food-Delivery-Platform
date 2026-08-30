import "dotenv/config"
import express from "express";
import cors from "cors"
import { Connectdb } from "./configs/db.js";
import FoodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import AIrouter from "./routes/aiRoute.js";
import riderRouter from "./routes/riderRoute.js";
import { Server } from "socket.io";
import http from "http";

//app configs
const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});
const port = 4000;

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log(`[Socket] User Connected: ${socket.id}`);

  // Join a room specific to the order
  socket.on("join_order_room", (orderId) => {
    if (!orderId) return;
    const room = String(orderId);
    socket.join(room);
    console.log(`[Socket] Socket ${socket.id} joined room: ${room}`);
  });

  // Handle sending a message between customer and rider
  socket.on("send_message", (data) => {
    if (!data || !data.orderId) return;
    const room = String(data.orderId);
    console.log(`[Socket] Message in order ${room} from ${data.sender}: "${data.text}"`);
    // Broadcast to room
    socket.to(room).emit("receive_message", data);
    // Broadcast event fallback
    socket.broadcast.emit(`receive_message_${room}`, data);
  });

  // Handle real-time rider GPS broadcast to order room and admin fleet map
  socket.on("rider_location_broadcast", (data) => {
    if (data && data.orderId) {
      const room = String(data.orderId);
      socket.to(room).emit("rider_location_update", data);
    }
    socket.broadcast.emit("fleet_rider_location_update", data);
  });

  // Handle rider duty toggle notification
  socket.on("rider_duty_change", (data) => {
    socket.broadcast.emit("fleet_rider_duty_update", data);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] User Disconnected:", socket.id);
  });
});

//middlewares
app.use(express.json())
app.use(cors())

//DB connection
Connectdb();

//api endpoints
app.use("/api/food", FoodRouter)
app.use("/images", express.static("uploads"))
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/ai", AIrouter)
app.use("/api/rider", riderRouter)

app.get("/", (req, res) => {
  res.send("Server is Live !")
})

server.listen(port, () => {
  console.log(`Server is live at port ${port}`)
})