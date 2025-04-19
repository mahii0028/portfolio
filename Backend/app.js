import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dbConnection from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";

import messageRouter from "./routes/messageRouter.js";
import userRouter from "./routes/userRouter.js";
import timelineRouter from "./routes/timelineRouter.js";
import softwaresRouter from "./routes/softwaresRouter.js";
import skillRouter from "./routes/skillRouter.js";
import projectRouter from "./routes/projectRouter.js";

dotenv.config({ path: "./config/config.env" });

const app = express();

// ✅ Middleware to handle CORS preflight caching
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "600"); // cache preflight for 10 mins
  next();
});

// ✅ Optimized CORS setup (static for dev)
app.use(
  cors({
    origin: "http://localhost:5173", // or use process.env.CLIENT_URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Core Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File Upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/softwares", softwaresRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/project", projectRouter);

// DB Connection
dbConnection();

// Error Handling Middleware
app.use(errorMiddleware);

export default app;
