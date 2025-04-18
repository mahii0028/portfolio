import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "PORTFOLIO",
    });
    console.log("Connected to db");
  } catch (error) {
    console.log("db connection error", error);
  }
};

export default dbConnection;
