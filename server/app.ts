require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.routes";

//body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

//cors - cross origin resource sharing
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// error middleware
app.use(ErrorMiddleware);

// routes
app.use("/api/", userRouter);

// testing API
app.get("/", (req: Request, res: Response, next: NextFunction) =>
  res.send("Hello How Are You...")
);

// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} Not Found!`) as any;
  err.statusCode = 404;
  next(err);
});
