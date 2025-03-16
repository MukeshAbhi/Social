import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

export const EmailVerification = () => {
  const { userId, token } = useParams();
  const [message, setMessage] = useState("Verifying...");
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();
  const [executed, setExecuted] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    if (!userId || !token || executed) return; // Ensure userId and token exist

    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/verify/${userId}/${token}`);
        setMessage(response.data.message);
        console.log(response);
        console.log("Here 1");

        if (response.data.status === "success") {
          setStatus("success");
          console.log("Here 2");
          setTimeout(() => navigate("/login"), 10000); // Redirect to login after 3s
          return;
        } else {
          setStatus("error");
          console.log("Here 3");
        }
      } catch (error) {
        setMessage("Invalid or expired verification link.");
        setStatus("error");
        console.log("Here 4");
      }
    };

    verifyEmail();
    setExecuted(true); // Prevent future calls in development mode
  }, [userId, token, API_URL, executed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center">
        {status === "loading" && (
          <h2 className="text-red-600 font-bold text-xl">Verification in process ..!!</h2>
        )}
  
        {status === "success" ? (
          <>
            <h2 className="text-[#008000] font-bold text-xl">✅ Email Verified!</h2>
            <p>{message}</p>
            <Link to={"/login"} className="mt-5 text-2xl">Login</Link>
          </>
        ) : status === "error" ? (
          <>
            <h2 className="text-red-600 font-bold text-xl">❌ Verification Failed</h2>
            <p>{message}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}

