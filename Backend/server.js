import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import userRoute from "./routes/userRoute.js"
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

connectDB();

app.use(cors({
  origin: "http://localhost:5173",   
  credentials: true                   
}));

app.use(express.json());
app.use(cookieParser());

// API endpoints
const port = process.env.PORT || 5000;

// Test Route
app.get("/", (req, res) => {
  res.send("Server is Running");
});


app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/user" ,userRoute )

app.listen(port, () => {
  console.log("Server is started On Port", port);
});
