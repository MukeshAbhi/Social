import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"

export const PassWordResetStatus = () => {
    const { userId, token } = useParams();
    const [message, setMessage] = useState("Verifying...");
    const [status, setStatus] = useState("loading");
    const navigate = useNavigate();
    const [executed, setExecuted] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!userId || !token || executed) return; 

        const verify = async() => {
               try {
                    const res = await axios.get(`${API_URL}/users/reset-password/${userId}/${token}`)
                    setMessage(res.data.message);
                    console.log(res);
                    console.log("Here 1");

                    if (res.data.status = "success") {
                        setStatus("success");
                        navigate(res.data.redirectUrl);
                        return;
                    } else {
                        setStatus("error");
                        console.log("Here 3");
                      }
               } catch(error) {
                    setMessage("Invalid or expired verification link.");
                    setStatus("error");
                    console.log("Here 4");
               }
        }
        verify();
        setExecuted(true);
    }, [userId, token])

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center">
                {status === "loading" && (
                <h2 className="text-red-600 font-bold text-xl">Verification in process ..!!</h2>
                )}
        
                {status === "error" ? (
                <>
                <h2 className="text-red-600 font-bold text-xl">❌ Verification Failed</h2>
                <p>{message}</p>
                <Link to={"/login"} className="mt-5 text-2xl">Login</Link>
                </>
                ) : null}
            </div>
        </div>
    )
}