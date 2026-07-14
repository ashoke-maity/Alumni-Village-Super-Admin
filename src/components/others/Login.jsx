import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../apis/axios";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";

import { toast } from "react-toastify";
import LoadingScreen from "../common/LoadingScreen";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Sign in form state
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check valid session on mount
  useEffect(() => {
    // Check if we came from AcceptInvite - if so, forcefully clear session
    if (location.state?.fromAcceptInvite) {
      localStorage.removeItem("authToken");
      // Clear the state so refreshing doesn't keep us logged out if user logs in later? 
      // Actually navigate replace is safer but for now just clear token is enough to stop auto-redirect.
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // If token valid and we are on login page, redirect
        if (decoded.profileSetupComplete) {
          navigate("/home", { replace: true });
        } else {
          navigate("/profile-setup", { replace: true });
        }
      } catch (e) {
        // Invalid token
        localStorage.removeItem("authToken");
      }
    }
  }, [navigate, location]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_USER_API_URL}/user/login`,
        { Email, Password }
      );
      if (res.status === 200 && res.data?.token) {
        localStorage.setItem("authToken", res.data.token);

        // Check profile setup status from response
        const isComplete = res.data.profileSetupComplete;

        toast.success("Login successful!");
        setLoading(false);

        // Directly navigate without transition or loading screen
        if (isComplete) {
          navigate("/home", { replace: true });
        } else {
          // Navigate to profile setup with flag indicating it's from login
          navigate("/profile-setup", {
            replace: true,
            state: { fromLogin: true }
          });
        }
      } else {
        toast.error(res.data?.msg || "Login failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Email login error:", error);
      toast.error(error.response?.data?.msg || "Login failed");
      setLoading(false);
    }
  };

  const formVariants = {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -50, scale: 0.95 }
  };



  return (
    <>
      {loading && <LoadingScreen />}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-50 to-cyan-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Gradient accent at top */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600"></div>

            <div className="px-8 pt-12 pb-8">
              {/* Logo and title */}
              <motion.div
                className="flex flex-col items-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >

                <motion.img
                  src="/images/Techno_logo.png"
                  alt="Techno Logo"
                  className="w-32 h-auto mb-4 object-contain"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                />
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome to TIG Alumni Village
                </h1>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Sign in to reconnect with your alumni network
                </p>
              </motion.div>

              {/* Animated Form Container */}
              <motion.div
                variants={formVariants}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      value={Email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        value={Password}
                        onChange={(e) => setPassword(e.target.value.trim())}
                        required
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-6 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Sign In
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
