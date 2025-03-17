import { FC, useState } from "react";
import { ErrMsg, Post,  PostComments,  Replay,  User } from "../types"
import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import moment from "moment";
import { MessageSquare, ThumbsUp, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { TextInput } from "./TextInput";
import { Loading } from "./Loading";
import { CustomButton } from "./CustomButton";
import { apiRequest } from "../utils";

interface PostCardProps {
    post: Post ,
    user?: User | null;
    deletePost : (id: string) => void;
    likePost : (uri : string) => void;
    viewCount: (id: string) => void
}

interface CommentFormProps {
    user?: User | null;
    id: string;
    replyAt: string;
    getComments: (event: string) => void;
}

interface ReplayCardProps {
    reply: Replay;
    user: User;
    handleLike :() => void;
}

const ReplyCard :FC<ReplayCardProps>= ({ reply, user, handleLike }) => {
    return (
      <div className='w-full py-3'>
        <div className='flex gap-3 items-center mb-1'>
          <Link to={"/profile/" + reply.userId._id}>
            <img
              src={reply.userId.profileUrl ?? NoProfile}
              alt={reply.userId.firstName}
              className='w-10 h-10 rounded-full object-cover'
            />
          </Link>
  
          <div>
            <Link to={"/profile/" + reply?.userId?._id}>
              <p className='font-medium text-base text-ascent-1'>
                {reply.userId.firstName} {reply.userId.lastName}
              </p>
            </Link>
            <span className='text-ascent-2 text-sm'>
              {moment(reply.created_At).fromNow()}
            </span>
          </div>
        </div>
  
        <div className='ml-12'>
          <p className='text-ascent-2 '>{reply?.comment}</p>
          <div className='mt-2 flex gap-6'>
            <p
              className='flex gap-2 items-center text-base text-ascent-2 cursor-pointer'
              onClick={handleLike}
            >
              {reply.likes.includes(user._id) ? (
                <ThumbsUp size={20} className="text-blue" />
              ) : (
                <ThumbsUp size={20}  />
              )}
              {reply.likes.length} Likes
            </p>
          </div>
        </div>
      </div>
    );
  };

const CommentForm :FC<CommentFormProps>= ({user, id, replyAt, getComments}) => {
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState<ErrMsg>({
        status: "",
        message: ""
    });
    const {register, handleSubmit, reset, formState:{ errors }} = useForm({
        mode: "onChange"
    });

    const onSubmit = async(data: any) => {
        setLoading(true);
        setErrMsg({
            status: "",
            message: ""
        });
        try {
            const URL = !replyAt? "post/comment/" + id : "post/reply-comment/" + id ;

            const newData = {
                comment: data.comment,
                from: user?.firstName + " " + user?.lastName,
                replyAt: replyAt
            };

            const res = await apiRequest({
                url: URL,
                data: newData,
                token: user?.token,
                method: "POST"
            });

            if (res.status === "failed") {
                setErrMsg(res);
            } else {
                reset({
                    comment: "",
                });
                setErrMsg({
                    status: "",
                    message: ""
                });
                getComments(id)
            }
            setLoading(false)
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    return(
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full border-b border-[#66666645]"
        >
            <div className="w-full flex items-center gap-2 py-4">
                <img
                    src={user?.profileUrl ?? NoProfile}
                    alt="User Image"
                    className="w-10 h-10 rounded-full object-cover"
                />

                <TextInput 
                    name="comment"
                    styles="w-full rounded-full py-3"
                    placeholder={replyAt ? `Replay @${replyAt}` : "Comment this post"}
                    register={register("comment", {
                        required:"Comment can not be empty"
                    })}
                    error={errors.comment ? String(errors.comment.message) : ""}
                />
            </div>
            {errMsg.message && (
                    <span 
                        role="alert"
                        className={`text-sm ${
                            errMsg.status === "failed"
                                ? "text-[#f64949fe]"
                                : "text-[#2ba150fe]"
                        } mt-0.5` }
                    >
                        {errMsg.message}
                    </span>
                )}

                <div className="flex items-end justify-end pb-2">
                    {loading ? (
                        <Loading />
                    ) : (
                        <CustomButton
                            title="Submit"
                            type="submit"
                            containerStyles="bg-[#0444a4] text-white py-2 px-3 rounded-full font-semibold text-sm"
                        />
                    )}
                </div>

        </form>
    )
}

export const PostCard : FC<PostCardProps> = ({ post, user, deletePost, likePost, viewCount }) => {

    const [showAll, setShowAll] = useState("");
    const [showReply, setShowReply] = useState("");
    const [comments, setComments] = useState<PostComments[]>([]);
    const [loading, setLoading] = useState(false);
    const [replyComments, setReplyComments] = useState("");
    const [showComments, setShowComments] = useState<string | null>('') ;

    const getPostComments = async (id: string) => {
        try{
            const res = await apiRequest({
                url: "post/comments/" + id,
                method: "GET",
                token: user?.token
            })
            console.log("Dandanadan ", res.data)
            return res.data;
        } catch (error) {
            console.log(error);
        }
    }

    const getComments  = async (id : string) => {
        setReplyComments("");
        const result = await getPostComments(id);
        setComments(result);
        setLoading(false)
    }

    const handleLike = async (uri : string) => {
        likePost(uri);
        await getComments(post._id);
    }

    const handleDelete = async (id : string) => {
        deletePost(id)
    } 

    const viewHandler = async (id: string) => {
        viewCount(id)
    }
    return(
        <div className="mb-2 bg-primary p-4 rounded-xl">
            <div className="flex gap-3 items-center mb-2">
                <Link to={`/profile/${post.userId._id}`}>
                    <img 
                        src={post.userId.profileUrl ?? NoProfile}
                        alt={post.userId.firstName}
                        className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-full"
                        onClick={()=>viewHandler(post.userId._id)}
                    />
                </Link>
                <div className="w-full flex justify-between">
                    <div>
                        <Link to={`/profile/${post.userId._id}`}>
                            <p className="font-medium text-lg text-ascent-1"  onClick={()=>viewHandler(post.userId._id)}>
                                {post.userId.firstName} {post.userId.lastName}
                            </p>
                        </Link>
                        <span className="text-sm text-ascent-2">{post.userId.location}</span>
                    </div>
                    <span className="hidden md:flex text-ascent-2">
                        {moment(post.createdAt ?? "2024-05-25").fromNow()}
                    </span>
                </div>
            </div>

            <div>
                {/* Text */}
                <p className="text-ascent-2">
                    {
                        showAll === post._id  ? post.description : post.description.slice(0,300)
                    }
                    {
                        post.description.length > 301 && ( 
                            showAll === post._id 
                            ? <span 
                                className="text-blue ml-2 font-medium cursor-pointer"
                                onClick={() => setShowAll("z")}
                              >
                                Show Less
                              </span> 
                            : <span 
                                className="text-blue ml-2 font-medium cursor-pointer"
                                onClick={() => setShowAll(post._id)}
                              >
                                Show More
                              </span>
                        )
                    }
                </p>
                {/*Image */}
                {   post.image && (
                        <img 
                            src={post.image}
                            alt='post image'
                            className="w-full mt-2 rounded-lg"
                        />
                    )
                }
                {/*Like Comment Delete box */}
                <div className="mt-4 flex justify-between items-center px-3 py-2 text-ascent-2 text-base border-t border-[#66666645]">
                    <p
                        className="flex gap-2 items-center text-base cursor-pointer"
                        onClick={() => handleLike("post/like/" + post._id)}
                    >
                        {post.likes?.includes(user?._id as string) ? (
                            <ThumbsUp size={20} className="text-blue" />
                        ) : (
                            <ThumbsUp size={20} />
                        )}
                        {post.likes?.length} { post.likes?.length && post.likes?.length  > 1 ? "Likes" : "Like"}
                    </p>

                    <p className="flex gap-2 items-center text-base cursor-pointer"
                       onClick={()=> {
                            setShowComments(showComments === post._id ? null : post._id);
                            getComments(post._id)
                       }}
                    >
                        <MessageSquare size={20} />
                        {post.comments?.length ?? 0} { (post.comments?.length ?? 0) > 1 ? "Comments" : "Comment"}

                    </p>

                    {user?._id === post.userId._id && 
                        <div className="flex items-center gap-1 cursor-pointer text-base text-ascent-2"
                             onClick={() =>handleDelete(post._id)}
                        >
                            <Trash2 size={20}/>
                            <span>Delete</span>
                        </div>
                    }
                </div>
                {/* Display Comments */}
                {showComments === post._id && 
                <div className="w-full mt-4 bordeer-t border-[#66666645] pt-4">
                    <CommentForm
                            user={user}
                            id={post._id}
                            getComments={() => getComments(post._id)} replyAt={""}                     
                    />
                    {loading ? (<Loading />) : 
                       comments && comments.length > 0 ? (
                            comments.map((comment) => (
                                <div className="w-full py-2" key={comment._id}> 
                                    <div className="flex gap-3 items-center mb-1">
                                        <Link to={`/profile/${comment.userId._id}`}>
                                            <img 
                                                src={comment.userId.profileUrl ?? NoProfile}
                                                alt={comment.userId.firstName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </Link>
                                        <div>
                                            <Link to={`/profile/${comment.userId._id}`}>
                                                <p className="font-medium text-base text-ascent-1">
                                                    {comment.userId.firstName} {comment.userId.lastName}
                                                </p>
                                            </Link>
                                            <span className="text-ascent-2 text-sm">
                                                {moment(comment.createdAt ?? "2024-05-30").fromNow()}
                                            </span>
                                        </div>    
                                           
                                    </div>

                                    <div className="ml-12">
                                        <p className="text-ascent-2">
                                            {comment.comment}
                                        </p>
                                        {/*Like, replay */}
                                        <div className="mt-2 flex gap-6">
                                            <p className="flex gap-2 items-center text-base text-ascent-2 cursor-pointer"
                                                onClick={() => {
                                                    handleLike("/post/like-comment/"+comment._id)
                                                }}
                                            >
                                                {comment.likes?.includes(user?._id as string) ? (
                                                    <ThumbsUp size={20} color="blue" />
                                                ) : (
                                                    <ThumbsUp size={20} />
                                                )}
                                                {comment.likes?.length} {comment.likes?.length && comment.likes?.length > 1 ? "Likes" : "Like"}
                                            </p>
                                            <span
                                                className='text-blue cursor-pointer'
                                                onClick={() => setReplyComments(comment?._id)}
                                            >
                                                 Reply
                                            </span>
                                        </div>
                                        {replyComments === comment?._id && (
                                            <CommentForm
                                                user={user}
                                                id={comment?._id}
                                                replyAt={comment?.from as string }
                                                getComments={() => getComments(post?._id)}
                                            />
                                        )}
                                    </div>

                                   {/* REPLIES */}
                                    <div className='py-2 px-8 mt-6'>
                                        {comment?.replies?.length > 0 && (
                                            <p
                                                className='text-base text-ascent-1 cursor-pointer'
                                                onClick={() =>
                                                    setShowReply(
                                                        showReply === comment?._id ? "" : comment?._id
                                                    )
                                                }
                                            >
                                                Show Replies ({comment?.replies?.length})
                                            </p>
                                        )}

                                        {showReply === comment?._id &&
                                            comment?.replies?.map((reply) => (
                                                <ReplyCard
                                                    reply={reply}
                                                    user={user as User}
                                                    key={reply._id}
                                                    handleLike={() =>
                                                        handleLike(`/post/like-comment/${comment?._id}/${reply._id}`)
                                                    }
                                                />
                                            ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <span className="flex text-sm py-4 text-ascent-2 text-center">
                                No Comments, be the First to comment
                            </span>
                        )
                    }
                </div>}
            </div>
            
        </div>
    )
}