import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { CustomError } from "../types";

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req : Request, res: Response, next: NextFunction) => {

    const payload = req.headers.authorization;

    if (!JWT_SECRET) {
        res.status(500).json({ error: "Server misconfiguration: JWT_SECRET is missing" });
        return ;
    }

    if (!payload || !payload.startsWith("Bearer")) {
        const error = new CustomError ("Authentication== failed");
        error.statusCode = 401;
        next(error);
        return;
    }

    const token = payload?.split(" ")[1];

    if (!token) {
        const error = new CustomError ("Authentication== failed");
        error.statusCode = 401;
        next(error);
        return;
    }

    try {
        const userToken = verify(token, JWT_SECRET) as {userId : string};
        req.body.user = {
            userId: userToken.userId
        };
        console.log("herere");
        
        console.log(userToken);
        next();
    } catch (error) {
        console.log(error);
        next("Authentication failed")
    }
} 