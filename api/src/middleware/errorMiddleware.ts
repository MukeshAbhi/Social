import { Request, Response, NextFunction} from "express";
import { CustomError } from "../types";

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";
  let success = "failed";

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((el) => el.message)
      .join(", ");
  }

  // Handle Duplicate Key Error (MongoDB)
  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    message = `${Object.values(err.keyValue).join(", ")} field must be unique!`;
  }

  res.status(statusCode).json({
    success,
    message,
  });
};

export default errorMiddleware;
