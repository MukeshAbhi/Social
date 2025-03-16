import { Router } from "express";
import {authRouter }from "./authRoutes";
import { userRouter } from "./userRoutes";
import { postRouter } from "./postRoutes";


export const router = Router();

router.use(`/auth`, authRouter); //auth/register
router.use(`/users`, userRouter);
router.use(`/post`,postRouter);

