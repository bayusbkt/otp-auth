import "dotenv/config";
import mongoose from "mongoose";

const connection = () => {
  mongoose.connect(process.env.DB_URL, {
    dbName: `${process.env.DB_NAME}`,
  });

  const con = mongoose.connection;
  con.on("error", (error) => {
    console.log("Connection Error: ", error);
  });

  con.on("disconnected", () => {
    console.log("Database Disconnected");
  });

  con.on("connected", () => {
    console.log("Database Connected");
  });
};

export default connection;
