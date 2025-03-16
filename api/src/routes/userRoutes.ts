import { Router } from "express";
import { changePassword, getFriendRequest, getUser, handleRequest, profileViews, requestPasswordReset, resetPassword, sendFriendRequest, suggestedFriend, updateUser, verifyEmail } from "../controllers/user";
import { authMiddleware } from "../middleware/authMiddleware";


export const userRouter = Router();


// user email verification
userRouter.get("/verify/:userId/:token", verifyEmail);

// password-rest 
userRouter.post("/request-passwordreset", requestPasswordReset);
userRouter.get("/reset-password/:userId/:token", resetPassword);
userRouter.post("/reset-password", changePassword);

// user routes
userRouter.post("/get-user/:id?",authMiddleware, getUser)
userRouter.put("/update-user", authMiddleware, updateUser )

// friend request
userRouter.post("/friend-request", authMiddleware, sendFriendRequest);
userRouter.post("/get-friend-request", authMiddleware, getFriendRequest);

// accept / deny friend request
userRouter.post("/accept-request", authMiddleware, handleRequest); 

// view profile
userRouter.post("/profile-view", authMiddleware, profileViews);

// suggest friends
userRouter.post("/suggested-friends", authMiddleware, suggestedFriend);
