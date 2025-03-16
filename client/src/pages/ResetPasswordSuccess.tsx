import { useSearchParams, Link } from "react-router-dom";

const ResetPasswordSuccess = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const message = searchParams.get("message");
  console.log(status);

  return (
    <div className="max-w-md mx-auto mt-10 p-5 shadow-lg rounded-lg bg-white text-center">
      {status === "success" ? (
        <>
          <h2 className="text-2xl font-bold text-green-500">Password Reset Successful!</h2>
          <p>You can now log in with your new password.</p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-red-500">{message}</h2>
          <p>Please try again later.</p>
        </>
      )}
      <Link to="/login" className="mt-4 block text-blue-500">Go to Login</Link>
    </div>
  );
};

export default ResetPasswordSuccess;
