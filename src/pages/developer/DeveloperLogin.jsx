import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { User, Lock, Eye, EyeOff, Mail } from "lucide-react";
import LoadingOverlay from "../../components/shared/LoadingOverlay";
import Toast from "../../services/toast";

function DeveloperLogin() {
    const navigate = useNavigate();
    const [loginMethod, setLoginMethod] = useState("developerID"); // "developerID" or "email"
    const [DeveloperID, setDeveloperID] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;

    // Load temp image (profile pic) once if it exists
    useEffect(() => {
        const checkSession = () => {
            const token = localStorage.getItem("developerAuthToken");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.Role === 'developer') {
                        navigate(`${developerRoute}/developer/dashboard`, { replace: true });
                    }
                } catch (e) {
                    // Invalid token, stay on login
                }
            }
        };
        checkSession();

        const image = localStorage.getItem("tempProfilePic");
        if (image) {
            setTempImage(image);
            localStorage.removeItem("tempProfilePic"); // clear after one use
            Toast.success("Profile updated successfully!");
        }
    }, [navigate, developerRoute]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const loginData = {
                Password,
                ...(loginMethod === "developerID" ? { DeveloperID } : { Email })
            };

            // Using specific endpoint for developer login
            const response = await axios.post(
                `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/login`,
                loginData
            );

            if (response.data.status === 1) {
                // Verify role if necessary, though backend should handle it
                localStorage.setItem("developerAuthToken", response.data.token);
                localStorage.setItem("developerData", JSON.stringify(response.data.admin)); // Reusing admin object structure
                Toast.success("Login successful! Redirecting to dashboard...");
                setTimeout(() => {
                    navigate(`${developerRoute}/developer/dashboard`);
                }, 1000);
            } else {
                setError(response.data.msg || "Login failed");
                Toast.error(response.data.msg || "Login failed");
            }
        } catch (error) {
            console.log("Axios error:", error);
            let errorMessage = "An error occurred. Please try again later.";

            if (error.response) {
                console.error("Error response:", error.response.data);
                errorMessage = error.response.data.msg || errorMessage;
            } else {
                console.error("Request error:", error);
            }

            setError(errorMessage);
            Toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-12">
            <LoadingOverlay loading={loading} message="Signing in..." />

            <div className="w-full max-w-md">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                    {/* Gradient accent at top */}
                    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600"></div>

                    <div className="px-8 pt-12 pb-8">
                        {/* Image Preview Section */}
                        {tempImage && (
                            <div className="text-center mb-6">
                                <img
                                    src={tempImage}
                                    alt="Updated Profile"
                                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-blue-500 shadow"
                                />
                                <p className="text-sm text-gray-500 mt-2">Your new profile picture</p>
                            </div>
                        )}

                        {/* Logo and title */}
                        <div className="flex flex-col items-center mb-8">
                            <img
                                src="/images/Techno_logo.png"
                                alt="Techno Logo"
                                className="h-24 w-auto mb-4 object-contain"
                            />
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">TIG Alumni Village Developer Portal</h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                                Managing Platform Development
                            </p>
                        </div>

                        {/* Login Method Toggle */}
                        <div className="mb-6">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setLoginMethod("developerID")}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${loginMethod === "developerID"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    <User className="w-4 h-4 inline mr-2" />
                                    Developer ID
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLoginMethod("email")}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${loginMethod === "email"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Developer ID or Email field */}
                            <div className="space-y-2">
                                <label htmlFor={loginMethod} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {loginMethod === "developerID" ? "Developer ID" : "Email Address"}
                                </label>
                                <div className="relative rounded-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {loginMethod === "developerID" ? (
                                            <User className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <input
                                        id={loginMethod}
                                        name={loginMethod}
                                        type={loginMethod === "developerID" ? "text" : "email"}
                                        required
                                        value={loginMethod === "developerID" ? DeveloperID : Email}
                                        onChange={(e) => {
                                            if (loginMethod === "developerID") {
                                                setDeveloperID(e.target.value.trim());
                                            } else {
                                                setEmail(e.target.value.trim());
                                            }
                                        }}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder={loginMethod === "developerID" ? "Enter your Developer ID" : "Enter your email address"}
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <div className="relative rounded-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="Password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={Password}
                                        onChange={(e) => setPassword(e.target.value.trim())}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeveloperLogin;
