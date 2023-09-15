require("dotenv").config();
import mongoose from "mongoose";

const dbUrl: string = process.env.MONGO_URI || "";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then(() => {
      console.log("Database Connected!");
    });
  } catch (error: any) {
    console.log(error.messag);
    setTimeout(() => connectDB, 5000);
  }
};

export default connectDB;
