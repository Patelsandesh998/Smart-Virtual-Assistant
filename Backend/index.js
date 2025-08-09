import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import geminiResponse from "./gemini.js";
import chalk from "chalk";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "https://smart-virtual-assistant-1.onrender.com" // add your deployed frontend URL here
    ],
    credentials: true,
  })
);

// Enable preflight for all routes
app.options("*", cors());

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  connectDb();
  console.log(chalk.green.bold(`Server started on port ${port}`));
});
