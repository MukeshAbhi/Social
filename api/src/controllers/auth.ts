import { NextFunction, Request, Response } from "express";
import z from "zod";
import Users from "../db/models/userModel";
import { compare, hash } from "bcrypt";
import {sign} from "jsonwebtoken";
import 'dotenv/config';
import { CustomError } from "../types";
import { sendVerificationEmail } from "./help";

const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(6),
});

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password} = req.body;
    const parsedData =  loginSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        console.log(parsedData.error);
        const error = new CustomError("Please provide vaild inputs");
        error.statusCode = 400;
        next(error);
        return;
    }

    try {
        const user = await Users.findOne({ email }).select("+password").populate({
            path: "friends",
            select: "firstName lastName location profileUrl "
        })
        
        if (!user) {
            const error = new CustomError("Invalid email or password");
            error.statusCode = 400;
            next(error);
            return;
        };
        
        // bcrypt
        const isMatch = await compare(password, user.password);

        if (!isMatch) {
            const error = new CustomError("Invalid email or password");
            error.statusCode = 400;
            //console.log(isMatch)
            next(error);
            return;
        };
        //to make shure password is not leaked
        user.password = "";

        if (!user.verified) {
            const error = new CustomError("User email is not verified. Check your email account and verify your email");
            error.statusCode = 401;
            next( error );
            return;
        };

        const token = sign({ userId: user._id}, JWT_SECRET as string );
        res.status(201).json({
            success: true,
            message: "Logged in succesfully",
            user,
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error})
        
    }
}

const registerSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    password: z.string().min(6)
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const {firstName, lastName, email, password} = req.body;
    const parsedData = registerSchema.safeParse(req.body);
    // zod validation
    if (!parsedData.success) {
        const error = new CustomError("Invalid Inputs");
        error.statusCode = 400;
        console.log("here 1")
        next(error)
        return;
    }
    
    try {
        const userExist = await Users.findOne({email});
        if (userExist) {
            const error = new CustomError("Email Address already exists");
            error.statusCode = 400;
            console.log("here 2")
            console.log(error);
            next(error)
            return;
        } 

        const hashedPassword = await hash( parsedData.data.password, 10);
        console.log("here 3")
        const user = await Users.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })
        console.log("here 4")
        if (!user) {
            const error = new CustomError("Failed to create User / DB issue");
            error.statusCode = 500;
            console.log(error.message);
            next(error);
            return;
        }
        console.log("here 5")
        sendVerificationEmail(user, res);

    } catch (error) {
        console.log(error);
        next(error);
    }
}