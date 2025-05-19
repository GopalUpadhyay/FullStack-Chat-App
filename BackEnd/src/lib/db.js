import mongoose from "mongoose";

export const ConnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB is Connected On: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error In Connecting To MongoDB:" + error);
  }
};
