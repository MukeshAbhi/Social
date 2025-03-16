import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { userId, token } = useParams();
  const [message, setMessage] = useState("Verifying...");
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/verify/${userId}/${token}`);
        setMessage(response.data.message);
        if (response.data.status === "success") {
          setStatus("success");
          setTimeout(() => navigate("/login"), 10000); // Redirect to login after 3s
        } else {
          setStatus("error");
        }
      } catch (error) {
        setMessage("Invalid or expired verification link.");
        setStatus("error");
      }
    };
    verifyEmail();
  }, [userId, token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center">
        {status === "loading" && <h2 className="text-lg font-semibold">Verifying...</h2>}
        {status === "success" && (
          <>
            <h2 className="text-[#008000] font-bold text-xl">✅ Email Verified!</h2>
            <p>{message}</p>
            <Link to={"/login"} className="mt-5 text-2xl">Login</Link>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-red-600 font-bold text-xl">❌ Verification Failed</h2>
            <p>{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
