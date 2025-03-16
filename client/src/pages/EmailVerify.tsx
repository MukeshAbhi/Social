import { useSearchParams } from "react-router-dom";

export default function Verified() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");
    const message = searchParams.get("message");

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {status === "success" ? (
                <div className="text-center p-6 bg-green-100 border border-green-400 rounded-lg shadow-lg">
                    <h1 className="text-green-600 text-2xl font-bold">✅ Email Verified</h1>
                    <p className="text-gray-700 mt-2">{message}</p>
                    <a href="/login" className="mt-4 px-6 py-2 bg-blue text-white rounded-md">Go to Login</a>
                </div>
            ) : (
                <div className="text-center p-6 bg-red-100 border border-red-400 rounded-lg shadow-lg">
                    <h1 className="text-red-600 text-2xl font-bold">❌ Verification Failed</h1>
                    <p className="text-gray-700 mt-2">{message || "Something went wrong. Please try again."}</p>
                </div>
            )}
        </div>
    );
}
