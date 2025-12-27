import mongoose from "mongoose";
import "dotenv/config";

export async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "whiteboard",
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Not Connected");
  }
}
