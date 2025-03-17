import { useRecoilState, useRecoilValue } from "recoil"
import { userAtom } from "../store/atoms/userAtom"
import { TopBar } from "../components/TopBar";
import { ProfileCard } from "../components/ProfileCard";
import { FriendsCard } from "../components/FriendsCard";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import { CustomButton } from "../components/CustomButton";
import { Check, FileVideo, ImagePlay, ImagePlus, UserRoundPlus } from "lucide-react";
import { TextInput } from "../components/TextInput";
import { useForm } from "react-hook-form";
import { ErrMsg, User } from "../types";
import { Loading } from "../components/Loading";
import { PostCard } from "../components/PostCard";
import { EditProfile } from "../components/EditProfile";
import { apiRequest, deletePost, fetchPosts, getUserInfo, handleFileUpload, likePost, sendFrienRequest, viewUserProfile } from "../utils";
import { postAtom } from "../store/atoms/postAtom";
import { useAuth } from "../customHooks/useAuth";

interface FriendRequest {
    _id: string;
    requestFrom: {
        _id: string;
        firstName: string;
        lastName: string;
        profileUrl: string;
        profession: string;
    };
}

export const Home = () => {
    
    const user = useRecoilValue(userAtom).user;
    const edit = useRecoilValue(userAtom).edit;
    const [ friendRequest, setFriendRequest ] = useState<FriendRequest[]>([]);
    const [ suggestedFriends, setSuggestedFriends ] = useState<User[]>([]);
    const  {register, handleSubmit, formState:{ errors }, reset } = useForm();
    const [ errMsg, setErrMsg ] = useState<ErrMsg>({
        message: "",
        status: ""
    });
    const [ file, setFile ] = useState<File | null>(null);
    const [ posting, setPosting ] = useState<boolean>(false);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ posts, setPosts ] = useRecoilState(postAtom);
    const [ sentRequest, setSentRequest ] = useState<{ [key: string]: boolean }>({})
    const { login } = useAuth();


    const handlePostSubmit = async (data: any) => {
        setPosting(true);
        setErrMsg({message: "",
            status: ""});

        try {
            const uri = file && (await handleFileUpload(file));
            
            const newData = uri ? { ...data, image: uri} : data;

            const res = await apiRequest({
                url: "post/create-post",
                data: newData,
                token: user?.token,
                method: "POST"
            });

            if (res.status === "failed") {
                setErrMsg(res);
            } else {
                reset({
                    description: ""
                });
                setFile(null);
                setErrMsg({message: "",
                    status: ""});
                await fetchPost();
            }
            setPosting(false);
        } catch(error) {
            console.log(error);
            setPosting(false);
        }
    };

    const fetchPost = async () => {
        await fetchPosts({
            token: user?.token ? user.token : "",
            setPosts: setPosts,
        })
        setLoading(false);
    };

    const handlePostLike  = async (uri: any) => {
        await likePost(uri, user?.token as string );

        await fetchPost();
    };

    const handleDelete = async (id: string) => {
        await deletePost(id, user?.token as string);
        await fetchPost();
    };
    
    const fetchFriendRequest = async () => {
        try {
            const res = await apiRequest({
                url: "users/get-friend-request",
                token: user?.token,
                method: "POST"
            });
            
            setFriendRequest(res.data);
        } catch(error) {
            console.log(error);
        }
    };

    const fetchSuggestedFriends = async () => {
        try {
            const res = await apiRequest({
                url: "users/suggested-friends",
                token: user?.token,
                method: "POST"
            });
            setSuggestedFriends(res.data);
        } catch(error) {
            console.log(error);
        }
    };

    const handleFriendRequest = async (id: string) => {
        try{
            
            await sendFrienRequest( user?.token as string, id );
            await fetchSuggestedFriends();
            setSentRequest((prev) => ({ ...prev, [id]: true }));
        } catch(error) {
            console.log(error)
        }
    };

    const acceptFriendRequest = async (id: string, status: string) => {
        try {
    
            await apiRequest({
                url: "users/accept-request",
                token: user?.token as string,
                method: "POST",
                data: { rId: id, status}
            });
           
           await fetchFriendRequest();
           
           await fetchSuggestedFriends();
           
        } catch(error) {
            console.log(error);
        }
    };

    const getUser = async () => {
        
        const res = await getUserInfo(user?.token as string);
        const newData = { token: user?.token, ...res };
        login(newData);
    };

    const viewCounthandler = async (id: string) => {
        await viewUserProfile(user?.token as string, id)
    }

    useEffect( () => {

        setLoading(true);
        getUser();
        fetchPost();
        fetchFriendRequest();
        fetchSuggestedFriends(); 
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]; // Use optional chaining

        if (!selectedFile) return; // Handle null case

        if (selectedFile.size > 5120 * 1024) {
            alert('File size exceeds 5MB!');
            return;
        }

        setFile(selectedFile); 
    };

    return (
        <>
        <div className="home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor  h-screen overflow-hidden">
            <TopBar />

            <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full">
                {/* LEFT */}
                <div className="hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
                    <ProfileCard user={user}/>
                    <FriendsCard friends={user?.friends} />
                </div>

                {/* CENTER */}
                <div className="flex-1 h-full  px-4 flex flex-col gap-6 overflow-y-auto rounded-lg">
                     {/* Description Input Box */}
                    <form 
                        className="bg-primary px-4 rounded-lg"
                        onSubmit={handleSubmit(handlePostSubmit)}
                    >
                        <div className="w-full flex items-center gap-2 py-4 border-b border-[#66666645]">
                            <img 
                                src={user?.profileUrl ?? NoProfile} 
                                alt="User Image"
                                className="w-14 h-14 rounded-full object-cover"
                            /> 
                            <TextInput 
                                styles="w-full rounded-full py-5"
                                placeholder="What's on your mind"
                                register={register("description", {
                                    required: "Write something about post"
                                })}
                                error={errors.description ? String(errors.description.message) : ""}
                                name="description"       
                                type="text"                     
                            />
                            {errMsg?.message && (
                                <span 
                                    className={`text-sm ${
                                        errMsg.status == 'failed'
                                        ? "text-[#f64949fe]"
                                        : "text-[#2ba150fe]"
                                    } mt-0.5`}>
                                        {errMsg.message}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between py-4">
                            {/* Image */}
                            <label
                                htmlFor="imgUpload"
                                className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                            >
                                <input 
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id='imgUpload'
                                    data-max-size = '5120'
                                    accept='.jpg, .png, .jpeg'
                                />
                                <ImagePlus />
                                <span>Image</span>
                            </label>
                            {/* Video */}
                            <label
                                htmlFor="videoUpload"
                                className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                            >
                                <input 
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id='videoUpload'
                                    data-max-size = '5120'
                                    accept='.mp4, .wav'
                                />
                                <FileVideo />
                                <span>Video</span>
                            </label>
                            {/* GIF */}
                            <label
                                htmlFor="vgifUpload"
                                className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                            >
                                <input 
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id='vgifUpload'
                                    data-max-size = '5120'
                                    accept='.gif'
                                />
                                <ImagePlay />
                                <span>GIF</span>
                            </label>
                            {/* Post Button */}
                            <div>
                                {posting ? (
                                    <Loading />
                                ) : (
                                    <CustomButton 
                                        type="submit"
                                        title="Post"
                                        containerStyles="hover:bg-blue bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm"
                                    />
                                )}
                            </div>
                        </div>

                    </form>

                    {loading ? (<Loading />) : posts.length > 0 ? (
                        posts.filter(post => post).map((post,index) => (
                            
                            <PostCard key={post._id || `fallback-key-${index}`} post={post}
                                      user={user}
                                      deletePost={handleDelete}
                                      likePost={handlePostLike}
                                      viewCount={viewCounthandler}
                            />
                        ))
                    ) : (
                        <div className="flex w-full h-full items-center justify-center">
                            <p className="text-lg text-ascent-2"> No Post Available </p>
                        </div>

                    )}
                </div>

                {/* RIGHT */}
                <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto ">
                    {/* Friend Requests */}
                    <div className="w-full bg-primary shadow-sm rounded-lg px-6 py-5">
                        <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
                             <span>Friend Request</span>
                             <span>{friendRequest.length}</span>
                        </div>
                        <div className="w-full flex flex-col gap-4 pt-4 ">
                            {
                                friendRequest.map(({_id, requestFrom: from}) => (
                                    <div 
                                        key={_id}
                                        className="flex items-center justify-between"
                                    >
                                        <Link 
                                            to={"/profile/"+ from._id}
                                            className="w-full flex gap-4 items-center cursor-pointer"
                                        >
                                            <img
                                                src={from.profileUrl ?? NoProfile} 
                                                alt={from.firstName} 
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="text-base font-medium text-ascent-1">
                                                    {from.firstName} {from.lastName}
                                                </p>
                                                <span className="text-sm text-ascent-2">
                                                    {from.profession ?? "No Profession"}
                                                </span>
                                            </div>
                                        </Link>

                                        <div className="flex gap-1">
                                            <CustomButton
                                                title="Accept"
                                                containerStyles="bg-[#0444a4] text-xs text-white px-2 py-1 hover:bg-blue rounded-full"
                                                onClick={()=>acceptFriendRequest(_id, "Accepted")}
                                            />
                                            <CustomButton
                                                title="Deny"
                                                containerStyles="border border-[#666] hover:bg-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full"
                                                onClick={()=>acceptFriendRequest(_id, "Denied")}
                                            />
                                        </div>  
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Friend Suggestion */}
                    <div className="w-full bg-primary shadow-sm rounded-lg px-5 py-5">
                        <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
                            <span>Friend Suggestion</span>
                        </div>
                        <div className="w-full flex flex-col gap-4 pt-4">
                            {
                                suggestedFriends.map((friend) => (
                                    <div
                                     key= {friend._id}
                                     className="flex items-center justify-between"
                                    >
                                        <Link 
                                            to={"/profile/" + friend._id}
                                            key={friend._id}
                                            className="w-full gap-4 flex items-center cursor-pointer"
                                        >
                                            <img 
                                                src={friend.profileUrl ?? NoProfile}
                                                alt={friend.firstName}
                                                className="w-10 h-10 object-cover rounded-full"
                                            />
                                            <div className="flex-1">
                                                <p className="text-base text-ascent-1 font-medium ">
                                                    {friend.firstName} {friend.lastName}
                                                </p>
                                                <span className="text-sm text-ascent-2">
                                                    {friend.profession ?? "No Profession"}
                                                </span>
                                            </div>
                                        </Link>
                                        <button 
                                            className="bg-[#0444a430] text-sm text-white p-1 rounded " 
                                            onClick={() => handleFriendRequest(friend._id)}
                                            disabled={sentRequest[friend._id]}
                                            >
                                            {sentRequest[friend._id] ? <Check size={20} className="text-[#0f52b6]" /> : <UserRoundPlus size={20} className="text-[#0f52b6]" />}
                                        </button>
                                    </div>
                                ) )
                            }

                        </div>

                    </div>
                </div>
            </div>
        </div>
        {edit && <EditProfile />}
        </>
    );
};