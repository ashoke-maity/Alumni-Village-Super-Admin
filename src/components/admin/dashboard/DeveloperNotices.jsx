import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Skeleton } from '../../shared';

const DeveloperNotices = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("authToken");

                // Fetch announcements from the API
                const res = await axios.get(
                    `${import.meta.env.VITE_ADMIN_API_URL}/admin/get-announcements`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (res.data && res.data.announcements) {
                    // Filter only developer announcements targeted for admins
                    const devAnnouncements = res.data.announcements.filter(a => a.developerId && a.target === 'admin');
                    setAnnouncements(devAnnouncements);
                } else {
                    setAnnouncements([]);
                }
            } catch (error) {
                console.error("Error fetching announcements:", error);
                setError("Could not load system notices");
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    // Format date to show how long ago
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return `${diffMinutes} min ago`;
            }
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 mb-6">
                <div className="flex items-center mb-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="ml-3 h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        );
    }

    if (error) {
        return null; // Fail silently or show error
    }

    if (announcements.length === 0) {
        return null; // Don't show anything if there are no developer notices
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-3 px-5">
                <h2 className="text-white font-bold flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-2 overflow-hidden text-blue-600">
                        {/* Using a generic system/dev icon or the logo if preferred */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-terminal"><polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" /></svg>
                    </div>
                    System Notice
                </h2>
            </div>

            <div className="divide-y divide-gray-100">
                {announcements.map((announcement) => (
                    <div key={announcement._id} className="p-4 hover:bg-blue-50 transition-colors">
                        <div className="flex items-start">
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-gray-800">{announcement.title}</h3>
                                    <span className="text-xs text-gray-500">{formatTimeAgo(announcement.createdAt)}</span>
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{announcement.content}</p>
                                {announcement.link && (
                                    <a
                                        href={announcement.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 text-xs mt-2 inline-block hover:underline"
                                    >
                                        View Link
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeveloperNotices;
