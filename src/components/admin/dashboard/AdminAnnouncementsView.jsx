import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminAnnouncementsView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const adminRoute = import.meta.env.VITE_ADMIN_ROUTE;

  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        `${import.meta.env.VITE_ADMIN_API_URL}/admin/get-announcements`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data && res.data.announcements) {
        // Show only the latest 3 announcements
        const latestAnnouncements = res.data.announcements
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setAnnouncements(latestAnnouncements);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      setError("No announcements yet");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold flex items-center">
          <Bell className="mr-2 text-blue-500" size={20} />
          Announcements
        </h2>
        <Link
          to={`${adminRoute}/admin/dashboard/announcements`}
          className="text-red-500 text-sm hover:underline flex items-center"
        >
          Manage Announcements
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-20 rounded"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-5 text-gray-500">
          <p>{error}</p>
          <Link
            to={`${adminRoute}/admin/dashboard/announcements`}
            className="text-red-500 text-sm hover:underline mt-2 inline-block"
          >
            Post your first announcement
          </Link>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Bell className="mx-auto mb-3 text-gray-300" size={40} />
          <p>No announcements have been posted yet</p>
          <Link
            to={`${adminRoute}/admin/dashboard/announcements`}
            className="text-red-500 text-sm hover:underline mt-2 inline-block"
          >
            Post your first announcement
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{announcement.title}</h3>
                {announcement.developerId && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full border border-blue-200">
                    Dev
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">{announcement.content}</p>
              <div className="mt-2 text-xs text-gray-400">
                Posted on {formatDate(announcement.createdAt)}
              </div>
            </div>
          ))}

          {/* View all link */}
          {announcements.length > 0 && (
            <div className="text-center pt-2">
              <Link
                to={`${adminRoute}/admin/dashboard/announcements`}
                className="text-red-500 text-sm hover:underline inline-flex items-center"
              >
                View all announcements
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementsView;

