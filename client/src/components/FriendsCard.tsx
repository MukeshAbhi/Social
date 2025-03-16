import { Link } from "react-router-dom";
import { Friend } from "../types"
import { NoProfile } from "../assets";

interface FriendsProps {
    friends?: Friend[];
}

export const FriendsCard :React.FC<FriendsProps> = ({ friends }) => {
  
    return(
        <div className="bg-primary shadow-sm rounded-lg px-6 py-5">
            <div className="flex items-center justify-between text-ascent-1 pd-2 border-b border-[#66666645]">
                <span className="text-ascent-1 text-lg">Friends</span>
                <span className="text-ascent-1 text-lg">{friends?.length}</span>
            </div>

            <div className="w-full flex flex-col gap-4 pt-4">
                {
                    friends?.map((friend) => (
                        <Link 
                            to={`/profile/${friend._id}`}
                            key={friend._id}
                            className="w-full flex gap-4 items-center cursor-pointer "
                        >
                        <img src={friend.profileUrl ?? NoProfile} alt={friend.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <p className="text-base front-medium text-ascent-1"> 
                                {friend.firstName} {friend.lastName}
                            </p>
                            <span className="text-sm text-ascent-2">
                                {friend.profession ?? "No profession"}
                            </span>
                        </div>
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}