import { useParams } from "react-router-dom"
import {  useRecoilValue } from "recoil";
import { userAtom } from "../store/atoms/userAtom";
import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { ProfileCard } from "../components/ProfileCard";
import { FriendsCard } from "../components/FriendsCard";
import { Post, User } from "../types";
import { PostCard } from "../components/PostCard";
import { Loading } from "../components/Loading";
import { deletePost, fetchPosts, getUserInfo, likePost, viewUserProfile } from "../utils";


export const Profile = () => {
    const {id} = useParams();
    const user = useRecoilValue(userAtom).user;
    const [userInfo, setUserInfo] = useState<User | null>(user);
    //const posts  = useRecoilValue(postAtom);
    const [loading, setLoading] = useState(false);
    const [ posts, setPosts ] = useState<Post[]>()

    const uri = `post/get-user-post/${id}`;
    
    const handleDelete = async (id: string) => {
        await deletePost(id, user?.token as string);
        await getPosts();
    };
    const handleLikePost = async (uri: string) => {
        await likePost(uri, user?.token as string);
        await getPosts();
    };

    const getUser = async () => {     
        const res = await getUserInfo(user?.token as string,id);
        console.log(res);
        setUserInfo(res);
    };

    const getPosts = async () => {
        await fetchPosts({
            token: user?.token as string ,
            setPosts: setPosts,
            uri: uri
        } )
        setLoading(false);
    };

    const viewCounthandler = async (id: string) => {
            await viewUserProfile(user?.token as string, id)
    }
    useEffect(() => {
        setLoading(true);
        getUser();
        getPosts();
    }, [id])
     
    return (
        <>
            <div className="home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor  h-screen overflow-hidden">
                <TopBar />
                <div className="w-full flex gap-2 lg:gap-4 md:pl-4 pt-5 pb-10 h-full">
                    {/* Left */}
                    <div className="hidden w-1/3 lg:1/4 md:flex flex-col gap-6 h-full overflow-y-auto ">
                        <ProfileCard user={userInfo}/>

                        <div className="block lg:hidden">
                            <FriendsCard friends={userInfo?.friends} />
                        </div>
                    </div>
                    {/* Center */}
                    <div className="flex-1 h-full bg-primary px-4 flex flex-col gap-6 overflow-y-auto">
                        {loading ? (
                            <Loading />
                        ) :  posts !== undefined && posts.length > 0  ? (
                            posts.map((post) => (
                                <PostCard 
                                    post={post}
                                    key={post._id}
                                    user={user}
                                    deletePost={handleDelete}
                                    likePost={handleLikePost}
                                    viewCount={() => viewCounthandler}
                                />
                            ))
                        ) : (
                            <div className="flex w-full h-full items-center justify-center"> 
                                <p className="text-lg text-ascent-2">No Post Available</p>
                            </div>
                        )}
                    </div>
                    {/* Right */}
                    <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
                        <FriendsCard friends={userInfo?.friends} />
                    </div>
                </div>
            </div>
        </>
    )
}