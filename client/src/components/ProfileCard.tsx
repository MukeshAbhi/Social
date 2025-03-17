import { useRecoilState } from "recoil";
import { userAtom } from "../store/atoms/userAtom";
import { Friend, User } from "../types"
import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import { UserPen, MapPinHouse, BriefcaseBusiness, Instagram, Facebook, Twitter, UserRoundPlus, Check  } from 'lucide-react';
import moment from "moment";
import { useState } from "react";
import { sendFrienRequest } from "../utils";



type ProfileCardProps = {
    user: User | null;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {

    const [object, setObject] = useRecoilState(userAtom);
    const profileOwner = object.user;
    const [ sentRequest, setSentRequest ] = useState<{ [key: string]: boolean }>({})
    const clickHandler = () => {
        setObject((currentValue) => ({
            ...currentValue, edit: true
        }))
    };
    const handleFriendRequest = async (id: string) => {
            try{
                
                await sendFrienRequest( profileOwner?.token as string, id );
                setSentRequest((prev) => ({ ...prev, [id]: true }));
            } catch(error) {
                console.log(error)
            }
        };

    return(
        <div className="w-full bg-primary flex flex-col items-center shadow-sm rounded-xl px-6 py-4">
            <div className="w-full flex items-center justify-between border-b pb-5 border-[#66666645]">
                <Link to={`/profile/${user?._id}`} className="flex gap-2 "> 
                    <img src={user?.profileUrl ?? NoProfile} alt={user?.email} 
                        className="w-14 h-14 object-cover rounded-full"
                     />
                    <div className="flex flex-col">
                    <div className="flex  justify-center">
                        <p className="text-lg font-medium text-ascent-1">
                            {user?.firstName} {user?.lastName}
                        </p>
                    </div>
                    <span className="text-ascent-2 text-sm">
                        {user?.profession ?? "Not yet working"}
                    </span>
                    </div>
                </Link>
                
                <div >
                    {user?._id === profileOwner?._id ? (
                        <UserPen className="text-blue cursor-pointer" onClick={clickHandler} />
                    ) : !profileOwner?.friends?.some((friend :  Friend ) => friend?._id === user?._id) ? (
                        <button
                            className="bg-[#0444a430] text-sm text-white p-1 rounded"
                            onClick={() => handleFriendRequest(user?._id as string)}
                            disabled={sentRequest[user?._id as string]}
                        >
                            {sentRequest[user?._id as string] ? <Check size={20} className="text-[#0f52b6]" /> : <UserRoundPlus size={20} className="text-[#0f52b6]" />}
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
                <div className="flex gap-2 items-center text-ascent-2">
                    <MapPinHouse className="text-xl text-ascent-1 " />
                    <span>
                        {user?.location ?? "Add Location"}
                    </span>
                </div>
                <div className="flex gap-2 items-center text-ascent-2">
                     <BriefcaseBusiness className="text-xl text-ascent-1"/>   
                     <span>
                        {user?.profession ?? "Add Profession"}
                     </span>
                </div>
            </div>

            <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
                <p className="text-xl text-ascent-1 font-semibold">
                    {user?.friends?.length} Friends
                </p>

                <div className="flex justify-between items-center">
                    <span className="text-ascent-2">
                        Who viewed your profile
                    </span>
                    <span className="text-ascent-1 text-lg">
                        {user?.views?.length}
                    </span>
                </div>

                <span className="text-base text-blue" >
                    {user?.verified ? "Verified Account" : "Not Verified"}
                </span>

                <div className="flex items-center justify-between">
                    <span className="text-ascent-2 ">
                        Joined
                    </span>
                    <span className="text-ascent-1 " >
                        {moment(user?.createdAt).fromNow()}
                    </span>
                </div>
            </div>
            
            <div className="w-full flex flex-col gap-4 py-4 pb-6">
                <p className="text-ascent-1 text-lg font-semibold">
                       Social Profile
                </p>
                <div className="flex gap-2 items-center text-ascent-2">
                    <Instagram className="text-xl text-ascent-1"/>
                    <span className="text-lg text-ascent-2"><Link to={"https://www.instagram.com/accounts/login/?next=%2F&source=mobile_nav"}>Instagram</Link></span>
                </div>
                <div className="flex gap-2 items-center text-ascent-2">
                    <Facebook className="text-xl text-ascent-1"/>
                    <span className="text-lg text-ascent-2"><Link to={"https://www.facebook.com/"}>FaceBook</Link></span>
                </div>
                <div className="flex gap-2 items-center text-ascent-2">
                    <Twitter className="text-xl text-ascent-1"/>
                    <span className="text-lg text-ascent-2"><Link to={"https://x.com/i/flow/login"}>Twitter</Link></span>
                </div>
            </div>

        </div>
    )
};