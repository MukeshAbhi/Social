import { NextFunction, Request, Response } from "express";
import { CustomError } from "../types";
import Post from "../db/models/postModel";
import Users from "../db/models/userModel";
import Comments from "../db/models/commentModel";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;

        const { description, image } = req.body;

        if (!description) {
            const error = new CustomError("You must provide a description");
            next(error);
            return;
        }

        const post = await Post.create({
            userId,
            description,
            image
        });

        if (!post) {
            const error = new CustomError("Failed to create post");
            next(error);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Post created successfully",
            data: post
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({message: error})
    }

};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
        const { search } = req.body;

        const user = await Users.findById(userId);
        const friends = user?.friends.toString().split(",") ?? [];
        friends.push(userId);
        
        // "or" for match at least one condition and "regex" for value that matches the given search string and "i" for case insensitivity
        const searchPostQuery = {
            $or: [
                {
                    description: { $regex: search, $options: "i"}
                }
            ]
        }

        const posts = await Post.find(search ? searchPostQuery : {})
            .populate({
                path: "userId",
                select: "firstName lastName location profileUrl"
            })
            .sort({ _id: -1})/* Sort newest first */
            .limit(10);

        if (!posts) {
            const error = new CustomError("Failed to fetch Post")
            next(error);
            return;
        }
        
        const friendsPosts = posts.filter((post) => {
            const str = post.userId?._id.toString();
            return str ? friends.includes(str) : {};
        });

        const othersPosts = posts.filter((post) => {
            const str = post.userId?._id.toString();
            return str ? !friends.includes(str) : {};
        });

        let postsResult = null;

        if (friendsPosts.length > 0) {
            postsResult = search ? friendsPosts : [ ...friendsPosts, ...othersPosts ];
        } else {
            postsResult = posts;
        }

        res.status(200).json({
            success: true,
            message: "successful",
            data: postsResult
        })


    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error});
    }
};

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;
        const post = await Post.findById(id).populate({
            path: "userId",
            select: "firstName lastName location profileUrl"
        });

        if (!post) {
            const error = new CustomError("Failed to fetch Post")
            next(error);
            return;
        }

        res.status(200).json({
            sucess: true,
            message: "successful",
            data: post,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error})
    }
};

export const getUserPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const post = await Post.find({ userId: id })
            .populate({
                path: "userId",
                select: "firstName lastName profileUrl location "
            })
            .sort({
                _id: -1
            });

        if (!post) {
            const error = new CustomError("Failed to fetch Post")
            next(error);
            return;
        };

        res.status(200).json({
            sucess: true,
            message: "successfully",
            data: post,
        });

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error });
    }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const postComments = await Comments.find({ postId:id })
            .populate({
                path: "userId",
                select: "firstName lastName profileUrl location "
            })
            .populate({
                path: "replies.userId",
                select: "firstName lastName profileUrl location "
            })
            .sort({ _id : -1});
           
            
        if (!postComments) {
            const error = new CustomError("Failed to fetch Comments");
            next(error);
            return;
        };        

        res.status(200).json({
            sucess: true,
            message: "successful",
            data: postComments,
        });

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error})
        
    }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const post = await Post.findById( id );

        if (!post) {
            const error = new CustomError("Failed to fetch Post")
            next(error);
            return;
        }

        // use Transcations here
        const isPresent = post?.likes.includes(String(userId));

        if (!isPresent) {
            post?.likes.push(userId);
        } else {
            post.likes = post?.likes.filter((pId) => pId !== String(userId));
        }

        const newPost = await Post.findByIdAndUpdate(id, post, {
            new: true /* Ensures that the updated post is returned instead of the old version  */
        })

        res.status(200).json({
            sucess: true,
            message: "successful",
            data: newPost,
        });
    } catch(error) {
        console.log(error);
        res.status(404).json({ message: error})
    }
};

export const likrPostComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
        const { id, rId } = req.params;

        try {
            if (rId === null || rId === undefined || rId === "false" ) {
                const comment = await Comments.findById(id);

                if (!comment) {
                    const error = new CustomError("Failed to fetch Comment");
                    next(error);
                    return;
                }

                const isMatch = comment?.likes.includes(String(userId));

                if (!isMatch) {
                    comment?.likes.push(userId);
                } else {
                    comment.likes = comment?.likes.filter((i) => i !== String(userId));
                }

                const updatedComment = await Comments.findByIdAndUpdate(id, comment, {
                    new: true,
                })
                console.log(updatedComment)
                res.status(201).json(updatedComment);
            } else {
                const replyComments = await Comments.findOne(
                    { _id: id},
                    {
                        replies : {
                            $elemMatch: {
                                _id: rId
                            },
                        },
                    },
                );

                if (!replyComments) {
                    const error = new CustomError("Failed to fetch Comment");
                    next(error);
                    return;
                }

                const isMatch = replyComments?.replies[0].likes.includes(String(userId));

                if (!isMatch) {
                    replyComments?.replies[0].likes.push(userId);
                } else {
                    replyComments.replies[0].likes = replyComments?.replies[0].likes.filter((i) => i !== String(userId));
                };

                const selectQuery = { _id: id, "replies._id": rId };

                const updateQuery = {
                    $set: {
                        "replies.$.likes" : replyComments.replies[0].likes,
                    }
                }
                const updatedComment = await Comments.updateOne(selectQuery, updateQuery, { new : true} )

                res.status(201).json(updatedComment);
            }
        } catch (error) {
            console.log(error);
            res.status(404).json({ message: error});
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error});
    }
};

export const commentPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, from } = req.body;
        const { userId } = req.body.user;
        const { id } = req.params;
        
        if (comment === null ) {
            const error = new CustomError("Comment is required");
            error.code = 404;
            next(error);
            return;
        }
    
        const newComment = await Comments.create({ comment, from, userId, postId: id})
       
        //populating posts with comments
        const post = await Post.findById(id);
       
        if (!post) {
            const error = new CustomError("Failed to featch post");
            error.code = 404;
            next(error);
            return;
        }
       
        post?.comments.push(newComment._id);
       
        const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
        
        res.status(201).json(newComment);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error});
    }
}

export const replyPostComment = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body.user;
    const { comment, replyAt, from } = req.body;
    const { id } = req.params;

    if (comment === null ) {
        const error = new CustomError("Comment is required");
        error.code = 404;
        next(error);
        return;
    }

    try {
        const commentInfo = await Comments.findById(id);

        commentInfo?.replies.push({
            comment,
            replyAt,
            from,
            userId,
            created_At: Date.now(),
        });

        commentInfo?.save();

        res.status(200).json(commentInfo);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error });
    }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const post = await Post.findById(id);

        if (!post) {
            const error = new CustomError("Failed to fetch Post")
            next(error);
            return;
        }

        console.log("userId " , userId);
        console.log("post.userId.id  ",post?.userId?._id );
        
        if (String(post?.userId?._id) === String(userId)) {
            await Post.findByIdAndDelete(id); 
        } else {
            const error = new CustomError("Failed to delete Post");
            error.code = 404;
            next(error);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Deleted successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error });
    }
}