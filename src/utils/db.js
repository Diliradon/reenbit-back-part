import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/reenbit';
    
    await mongoose.connect(connectionString);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
    process.exit(1);
  }
};
