import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  UserCheck,
  UserPlus,
  Bookmark,
  Calendar,
  Briefcase,

  ChevronRight,
  Image,
  User,
} from "lucide-react";

function ProfileSidebar({
  connectionStats,
  setShowConnectionsPopup,
  setShowFollowingPopup,
  navigate,
  onViewChange,
  currentView = "feed",
  firstName = "",
  lastName = "",
  profileImage = "",
  bio = "",
}) {
  const [imgError, setImgError] = useState(false);
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""
    }`.toUpperCase();

  // Add console log to debug profile image
  useEffect(() => {
    console.log("Profile Image URL:", profileImage);
  }, [profileImage]);

  const location = useLocation();
  const currentPath = location.pathname;

  // Helper to determine if a link is active
  const isActive = (path) => currentPath === path;
  
  // Helper to determine if a view is active
  const isViewActive = (view) => currentView === view;
  
  // Handle view change
  const handleViewChange = (view) => {
    if (onViewChange) {
      onViewChange(view);
    } else if (navigate) {
      // Fallback to navigation if onViewChange not provided
      const routeMap = {
        "saved-posts": "/saved-posts",
        "events": "/get-events",
        "jobs": "/get-jobs",
        "my-posts": "/my-posts",
      };
      navigate(routeMap[view] || "/home");
    }
  };

  return (
    <div className="space-y-5 w-full max-w-sm min-w-0 flex-shrink-0">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full min-w-0">
        <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 h-24 relative">
          <div className="absolute inset-0 bg-black opacity-10"></div>
        </div>
        <div className="px-6 pb-6 pt-0 -mt-12 relative z-10">
          <div className="bg-red-500 rounded-full w-24 h-24 flex items-center justify-center text-white font-semibold uppercase overflow-hidden mx-auto">
            {profileImage && !imgError ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 object-cover rounded-full"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  console.error("Image src:", profileImage);
                  setImgError(true);
                }}
                onLoad={() => console.log("Image loaded successfully")}
              />
            ) : (
              <span className="text-6xl">{initials || <User size={80} />}</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mt-4 text-center">
            {firstName || ""} {lastName || ""}
          </h2>
          {/* Bio */}
          {bio && (
            <div className="mt-4 px-2 w-full min-w-0">
              <p className="text-sm text-gray-600 text-center line-clamp-3 break-words overflow-hidden">
                {bio}
              </p>
            </div>
          )}
          {/* Connection Stats */}
          <div className="grid grid-cols-2 gap-6 mt-4 w-full">
            <div
              className="text-center cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-colors duration-300"
              onClick={() =>
                setShowConnectionsPopup && setShowConnectionsPopup(true)
              }
            >
              <div className="flex items-center justify-center space-x-2 text-red-600 mb-1">
                <UserCheck size={18} />
                <span className="text-lg font-semibold">
                  {connectionStats?.connections}
                </span>
              </div>
              <p className="text-sm text-gray-600">Connections</p>
            </div>
            <div
              className="text-center cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-colors duration-300"
              onClick={() =>
                setShowFollowingPopup && setShowFollowingPopup(true)
              }
            >
              <div className="flex items-center justify-center space-x-2 text-red-600 mb-1">
                <UserPlus size={18} />
                <span className="text-lg font-semibold">
                  {connectionStats?.following}
                </span>
              </div>
              <p className="text-sm text-gray-600">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-5 hover:shadow-xl transition-shadow duration-300 w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h2>
        <div className="space-y-3">
          <a
            href="#"
            className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-300 ${isViewActive("saved-posts") || isActive("/saved-posts") ? "bg-red-100 text-red-700 font-semibold" : "hover:bg-red-50"}`}
            onClick={(e) => {
              e.preventDefault();
              handleViewChange("saved-posts");
            }}
          >
            <Bookmark size={18} className="text-red-500 mr-3" />
            <span className="text-gray-700">Saved Items</span>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </a>
          <a
            href="#"
            className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-300 ${isViewActive("events") || isActive("/get-events") ? "bg-red-100 text-red-700 font-semibold" : "hover:bg-red-50"}`}
            onClick={(e) => {
              e.preventDefault();
              handleViewChange("events");
            }}
          >
            <Calendar size={18} className="text-red-500 mr-3" />
            <span className="text-gray-700">All Events</span>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </a>
          <a
            href="#"
            className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-300 ${isViewActive("jobs") || isActive("/get-jobs") ? "bg-red-100 text-red-700 font-semibold" : "hover:bg-red-50"}`}
            onClick={(e) => {
              e.preventDefault();
              handleViewChange("jobs");
            }}
          >
            <Briefcase size={18} className="text-red-500 mr-3" />
            <span className="text-gray-700">Available Jobs</span>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </a>
          <a
            href="#"
            className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-300 ${isViewActive("my-posts") || isActive("/my-posts") ? "bg-red-100 text-red-700 font-semibold" : "hover:bg-red-50"}`}
            onClick={(e) => {
              e.preventDefault();
              handleViewChange("my-posts");
            }}
          >
            <Image size={18} className="text-red-500 mr-3" />
            <span className="text-gray-700">My Posts</span>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </a>

        </div>
      </div>
    </div>
  );
}

export default ProfileSidebar;
