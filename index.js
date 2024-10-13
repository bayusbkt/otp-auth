import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connection from "./App/Config/Database.js";
import router from "./App/Routes/Api.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(router);

connection();
app.listen(port, () => {
  console.log("Server up and running...");
});
