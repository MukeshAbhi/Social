import {  NextFunction, Request, Response } from "express";
import Verification from "../db/models/emailVerificationModel";
import Users from "../db/models/userModel";
import { compare, hash } from "bcrypt";
import { CustomError } from "../types";
import PasswordReset from "../db/models/PasswordReset";
import { resetPasswordLink } from "./help";
import { sign } from "jsonwebtoken";
import FriendRequest from "../db/models/friendRequest";

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyEmail = async (req: Request, res: Response) => {
    const { userId, token } = req.params;
   
    try {
        const result = await Verification.findOne({ userId });

        if (!result) {
            const message = "Invalid verification link. Try again later."
            res.json({
                status: "error",
                message: message,
                redirectUrl: `/users/verified?status=error&message=${message}`,
            });
            return; 
        }

        const { expiresAt, token: hashedToken } = result;

        if (expiresAt && expiresAt.getTime() < Date.now()) {
            await Verification.findOneAndDelete({ userId });
            await Users.findOneAndDelete({ _id: userId });
            const message = "Verification token has expired."
            res.json({
                status: "error",
                message: message,
                redirectUrl: `/users/verified?status=error&message=${message}`,
            });
            return;
        }

        const isMatch = await compare(token, hashedToken as string);

        if (!isMatch) {
            const message = "Invalid verification token."
            res.json({
                status: "error",
                message: message,
                redirectUrl: `/users/verified?status=error&message=${message}`,
            });
            return;
        }

        await Users.findOneAndUpdate({ _id: userId }, { verified: true });
        await Verification.findOneAndDelete({ userId });
        const message = "Email verified successfully!"
        res.json({
            status: "success",
            message: message,
            redirectUrl: `/users/verified?status=success&message=${message}`,
        });
        
    } catch (err) {
        console.error(err);
        res.json({
            status: "error",
            message: "Something went wrong ",
            redirectUrl: `/users/verified?status=error&message=`,
        });
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
    
    try {

        const { email } = req.body;

        const user = await Users.findOne({ email});

        if (!user) {
            res.status(404).json({
                status: "FAILED",
                message: "Email adress not found"
            });
            return;
        } 

        // To check if user alredy requested for password reset

        const existingRequest = await PasswordReset.findOne({ email });
        if (existingRequest) {
            if (existingRequest.expiresAt && existingRequest.expiresAt.getTime() > Date.now()) {
                res.status(201).json({
                    status: "PENDING",
                    message: "Reset Password link has already been sent to your email "
                });
            }
            // if the password is expried 
            await PasswordReset.findOneAndDelete({ email });
        }

        // to reset password
        await resetPasswordLink(user, res);
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error})
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { userId, token } = req.params;

    try {
        const user = await Users.findOne({ _id : userId});

        if (!user) {
            const message = "Invalid Link. Try again";
            res.json({
                status: "error",
                message: message,
                redirectUrl: `/users/reset-status?status=error&message=${message}`,
            });
            return;
        }

        const resetPassword = await PasswordReset.findOne({ userId});
        
        if (!resetPassword) {
            const message = "Invalid Link. Try again";
            res.json({
                status: "error",
                message: message,
                redirectUrl: `/users/reset-status?status=error&message=${message}`,
            });
            return;
        }

        const { expiresAt, token: resetToken } = resetPassword;

        if (expiresAt && expiresAt.getTime() < Date.now()) {
            const message = "Link has expired. Please try again!"
            res.json({
                status: "error",
                message: message,
                redirectUrl: `/users/reset-status?status=error&message=${message}`,
            });
            return;
        } else {
            const isMatch = compare(token, resetToken as string);

            if (!isMatch) {
                const message = "Invalid Link. Try again";
                res.json({
                    status: "error",
                    message: message,
                    redirectUrl: `/users/reset-status?status=error&message=${message}`,
                });
                return;
            } else {
                res.json({
                    status: "success",
                    redirectUrl: `/users/change-password?&id=${userId}`,
                });
            }
        }
    } catch (err) {
        console.log(err)
        res.json({
            status: "error",
            message: "Somethig went wrong",
            redirectUrl: `/users/reset-status?status=error&message=`,
        });
    }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    
    try {

        const { userId, password } = req.body;
    
        const hashedpassword = await hash(password, 10);
        
        const user = await Users.findByIdAndUpdate(
            { _id: userId },
            { password: hashedpassword }
        );
            
            if (user) {
                await PasswordReset.findOneAndDelete({ userId });
                console.log("Here");
                const message = "Password rest is successfull";
                res.json({
                    status: "success",
                    message: "Password reset successful",
                    redirectUrl: `/users/reset-status?status=success&message=${message}`,
                });
            }
        } catch (error) {
            console.log(error);
            res.status(404).json({ message: error });
      }

};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // from middleware
        const { userId } = req.body.user;
        console.log("here  ",userId)
        const { id } = req.params;

        const user = await Users.findById(id ?? userId).populate("friends");

        if (!user) {
            res.status(200).json({
                message: "User Not Found",
                success: false,
            });
            return; 
        }

        user.password = "";

        res.status(200).json({
            success: true,
            user: user
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error
        })
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, location, contact, profession, profileUrl } = req.body;

        if (!(firstName || lastName || location || profession || contact || profileUrl)) {
            const error = new CustomError ("Please provide the required fields");
            next(error);
            return;
        }

        const { userId } = req.body.user;

        const updateUser = {
            firstName, lastName, location, contact, profession, profileUrl ,_id : userId
        };

        const user = await Users.findByIdAndUpdate( userId, updateUser, { 
            new: true
        })

        if (!user) {
            next(new CustomError("User not found", 404));
            return; 
        }

        await user?.populate({path: "friends", select: "-password"});
        const token = sign({userId:user._id}, JWT_SECRET as string);

        user.password = "";

        res.status(200).json({
            sucess: true,
            message: "User updated successfully",
            user,
            token,
        });


    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error});
    }
};

export const sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
        const { requestTo } = req.body;
    
        const requestExist = await FriendRequest.findOne({
            requestFrom: userId,
            requestTo,
        });

        if (requestExist) {
            const error = new CustomError("Friend Request alredy sent");
            next(error);
            return;
        }

        const accountExist = await FriendRequest.findOne({
            requestFrom: requestTo,
            requestTo: userId
        });

        if (accountExist) {
            const error = new CustomError("Friend Request alredy sent");
            next(error);
            return;
        }

        const newRequest = await FriendRequest.create({
            requestFrom: userId,
            requestTo,
        });

        if (!newRequest) {
            const error = new CustomError("Failed to send request");
            next(error);
            return;
        }

        res.status(201).json({
            success: true,
            message: "Friend Request sent successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error 
        })
    }
};

export const getFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
            console.log(userId);
        const request = await FriendRequest.find({
            requestTo: userId,
            requestStatus: "Pending"
        })
            .populate({
                path: "requestFrom",
                select: "firstName lastName profileUrl profession",
            })
            .limit(10)
            .sort({
                _id: -1
            })
            
        res.status(200).json({
            success: true,
            data: request
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error 
        });
    }
};

export const handleRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;

        const { rId, status } = req.body;
      
        const requestExist = await FriendRequest.findById(rId);

        if (!requestExist) {
            const error = new CustomError("No Friend Request Found.");
            next(error);
            return;
        };

        const newRequest = await FriendRequest.findByIdAndUpdate({_id: rId}, { requestStatus: status});

        if (!newRequest) {
            const error = new CustomError("Failed to update.");
            next(error);
            return;
        }

        if ( status === "Accepted") {
            const user = await Users.findById(userId);
            const friend = await Users.findById(newRequest.requestFrom);

            if (!user || !friend || !newRequest.requestFrom || !newRequest.requestTo) {
                console.error("User or friend not found, or invalid request data.");
                return;
            }
            // use transcation here 
            user.friends.push(newRequest.requestFrom);
            await user.save();

            friend.friends.push(newRequest.requestTo);
            await friend.save();
        }

        res.status(201).json({
            success: true,
            message: 'Friend Request ' + status,
        })



    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error 
        });
    }
};

export const profileViews = async (req: Request, res: Response, next: NextFunction) => {
   try {
    const { userId } = req.body.user;
    const { id } = req.body;
    
    const user = await Users.findById(id);
   
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    
    user.views.push(userId);
    await user?.save();

    res.status(201).json({
        success: true,
        message: "Successfully"
    });
   } catch (error) {
    console.log(error);
    res.status(500).json({
        message: "auth error",
        success: false,
        error: error 
    });
}


};

export const suggestedFriend = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        const { userId } = req.body.user;

        let queryObject : any = {};

        queryObject._id = { $ne: userId};

        queryObject.friends = { $nin: userId};

        let queryResult = Users.find(queryObject)
            .limit(10)
            .select("firstName lastName profileUrl profession");

        const suggestedFriends = await queryResult;
       
        res.status(200).json({
            success: true,
            data: suggestedFriends
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error 
        });
    }
    
};