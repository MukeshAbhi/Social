import express from "express";
import cors from "cors";
import morgan from "morgan";
import 'dotenv/config';
import dbConnection from "./db";
import errorMiddleware from "./middleware/errorMiddleware";
import { router } from "./routes";

const app = express();

const port = process.env.PORT || 3000;

dbConnection();

app.use(cors());

app.use(express.json({ limit: "10mb"}));
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"));

app.use("/api/v1",router);

//error middleware
app.use(errorMiddleware)

app.listen(port,() => {
    console.log(`Server running on ${port}` )
});