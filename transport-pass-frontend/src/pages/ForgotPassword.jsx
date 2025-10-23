import { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setEmailSent(false);
    
    try {
      const res = await api.post("/auth/forgot-password", { email });
      
      if (res.data.emailSent) {
        setMessage("✅ Password reset link sent to your email! Please check your inbox.");
        setEmailSent(true);
      } else {
        setMessage("✅ Reset link generated! Check your email or use the link below.");
        setResetLink(res.data.resetLink);
      }
    } catch (err) {
      console.error("❌ Forgot password error", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Forgot password</h1>
        <p className="text-center text-gray-500 mb-8">We'll send a reset link to your email</p>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes("✅") 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
        
        {resetLink && !emailSent && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              🔗 If you didn't receive the email, you can use this link:
            </p>
            <a 
              href={resetLink} 
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {resetLink}
            </a>
          </div>
        )}
        
        {emailSent && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              📧 Check your email inbox (and spam folder) for the password reset link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
