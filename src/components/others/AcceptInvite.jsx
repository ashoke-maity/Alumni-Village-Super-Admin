import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from "../../apis/axios";
import { toast } from 'react-toastify';
import LoadingScreen from '../common/LoadingScreen';

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('processing'); // processing, success, error

    useEffect(() => {
        const processInvite = async () => {
            const token = searchParams.get('token');

            if (!token) {
                toast.error('Invalid invitation link');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.post(`${import.meta.env.VITE_USER_API_URL}/user/accept-invite`, {
                    token
                });

                if (response.data.status === 1) {
                    toast.success(response.data.msg);
                    setStatus('success');
                    setLoading(false);
                    // Optional: Redirect after a delay
                    setTimeout(() => {
                        navigate('/login', { state: { fromAcceptInvite: true } });
                    }, 3000);
                } else {
                    toast.info(response.data.msg || "Please login to continue");
                    navigate('/login');
                }
            } catch (error) {
                console.error('Invite acceptance error:', error);
                toast.info(error.response?.data?.msg || 'Please login to continue');
                navigate('/login');
            }
        };

        processInvite();
    }, [searchParams, navigate]);

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                {status === 'success' ? (
                    <div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h2>
                        <p className="text-gray-600 mb-6">Your account has been successfully created.</p>
                        <p className="text-sm text-gray-500">Redirecting to login...</p>
                        <button
                            onClick={() => navigate('/login', { state: { fromAcceptInvite: true } })}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Failed</h2>
                        <p className="text-gray-600 mb-6">We couldn't process your invitation. The link may be invalid or expired.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcceptInvite;
