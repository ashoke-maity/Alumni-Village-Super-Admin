import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header, PageTransition } from "../../components/layout";
import { ManageUsersTable } from "../../components/users";
import axios from "../../apis/axios";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Plus, X, Users, FileText, Mail, Trash2, BarChart2 } from "lucide-react";
import Toast from "../../utils/toast";
import { cn } from "../../utils/helpers";
import { Skeleton } from "../../components/shared";
import socket from "../../socket/socket";

function DeveloperManageUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("Developer");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'posts', 'invitations', 'behavior'
  const [refreshKey, setRefreshKey] = useState(0);
  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("developerAuthToken");
        const res = await axios.get(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!token) return navigate(`${import.meta.env.VITE_DEVELOPER_ROUTE}/developer/login`);
        if (res.status === 200) setAdminName(res.data.admin.FirstName);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminName("Developer");
      }
    };
    fetchAdminData();
  }, [navigate]);

  return (
    <PageTransition locationKey={location.pathname} className={`dashboard wrapper mt-5 content-center space-y-6 px-2 lg:px-8`}>
      <header className="header">
        <article>
          <Header
            title="Manage Users"
            description="View and manage all users and their posts"
          />
        </article>
      </header>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Users</h2>
              <p className="text-sm text-gray-600 mt-1">
                View and manage user accounts and their posts
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New User
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'users'
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                All Users
              </div>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'posts'
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                User Posts
              </div>
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'invitations'
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invitations ({invitationCount})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('behavior')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'behavior'
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                User Behavior
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'users' ? (
            <ManageUsersTable apiUrl={`${import.meta.env.VITE_DEVELOPER_API_URL}/developer`} tokenKey="developerAuthToken" />
          ) : activeTab === 'posts' ? (
            <UserPostsSection />
          ) : activeTab === 'behavior' ? (
            <UserBehaviorSection />
          ) : (
            <InvitationsTable key={refreshKey} setInvitationCount={setInvitationCount} />
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onSuccess={() => {
            setActiveTab('invitations');
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </PageTransition>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User Posts Section
// ─────────────────────────────────────────────────────────────────────────────
function UserPostsSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [lightbox, setLightbox] = useState({ open: false, url: null, isVideo: false });

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("developerAuthToken");
        const res = await axios.get(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/view/user-posts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(res.data.data || []);
      } catch (err) {
        setError("Failed to fetch user posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleNewPost = (post) => {
      setPosts((prev) => {
        const userKey = post.userId ? (post.userId._id || post.userId).toString() : 'unknown';
        const userIndex = prev.findIndex((item) => item.user && item.user._id.toString() === userKey);

        let title = "";
        if (post.postType === "job" && post.jobDetails) title = post.jobDetails.jobTitle;
        else if (post.postType === "event" && post.eventDetails) title = post.eventDetails.eventName;
        else if (post.postType === "regular" || post.postType === "media") title = post.content ? post.content.substring(0, 40) : "";

        const formattedPost = {
          _id: post._id || post.id,
          title,
          content: post.content,
          createdAt: post.createdAt,
          postType: post.postType,
          mediaUrl: post.mediaUrl,
          jobDetails: post.jobDetails || null,
          eventDetails: post.eventDetails || null,
          comments: post.comments || [],
          likes: post.likes || [],
          savedBy: post.savedBy || [],
        };

        if (userIndex > -1) {
          return prev.map((item, idx) => {
            if (idx === userIndex) {
              const postExists = item.posts.some((p) => p._id === formattedPost._id);
              if (postExists) return item;
              return { ...item, posts: [formattedPost, ...item.posts] };
            }
            return item;
          });
        } else {
          return [{ user: post.userId ? { _id: post.userId._id || post.userId, FirstName: post.userId.FirstName || "", LastName: post.userId.LastName || "", Email: post.userId.Email || "" } : null, posts: [formattedPost] }, ...prev];
        }
      });
    };

    const handlePostDeleted = (deletedPostId) => {
      setPosts((prev) =>
        prev.map((userObj) => ({ ...userObj, posts: userObj.posts.filter((post) => post._id !== deletedPostId) }))
          .filter((userObj) => userObj.posts.length > 0)
      );
    };

    socket.on("newPost", handleNewPost);
    socket.on("postDeleted", handlePostDeleted);
    return () => { socket.off("newPost", handleNewPost); socket.off("postDeleted", handlePostDeleted); };
  }, []);

  const handleDelete = async (userId, postId) => {
    try {
      const token = localStorage.getItem("developerAuthToken");
      await axios.delete(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/delete/user-post/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => prev.map(userObj =>
        userObj.user && userObj.user._id === userId
          ? { ...userObj, posts: userObj.posts.filter(post => post._id !== postId) }
          : userObj
      ));
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const filteredPosts = posts.filter(userObj => {
    if (!userObj.user) return false;
    const name = `${userObj.user.FirstName} ${userObj.user.LastName}`.toLowerCase();
    const email = userObj.user.Email?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const toggleExpand = (userId) => setExpanded((prev) => ({ ...prev, [userId]: !prev[userId] }));

  const renderDetails = (post) => {
    if (post.postType === "job" && post.jobDetails) {
      const j = post.jobDetails;
      return (
        <div className="text-xs text-gray-700">
          <div><b>Company:</b> {j.companyName}</div>
          <div><b>Location:</b> {j.location}</div>
          <div><b>Type:</b> {j.jobType}</div>
          <div><b>Salary:</b> {j.salary}</div>
          <div><b>Deadline:</b> {j.deadline ? new Date(j.deadline).toLocaleDateString() : '-'}</div>
          <div><b>Requirements:</b> {j.requirements}</div>
        </div>
      );
    }
    if (post.postType === "event" && post.eventDetails) {
      const e = post.eventDetails;
      return (
        <div className="text-xs text-gray-700">
          <div><b>Date:</b> {e.eventDate ? new Date(e.eventDate).toLocaleDateString() : '-'}</div>
          <div><b>Location:</b> {e.location}</div>
          <div><b>Summary:</b> {e.summary}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by username or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      ) : error ? (
        <div className="text-center py-5 text-red-500">{error}</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-3 text-gray-300" />
          <p>No user posts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((userObj) => {
            const user = userObj.user;
            if (!user) return null;
            let profilePic = null;
            if (user.isGoogleUser && user.profileImage && user.profileImage.includes('googleusercontent')) {
              profilePic = user.profileImage;
            } else if (user.profileImage && user.profileImage.trim() !== '') {
              profilePic = user.profileImage.startsWith('http')
                ? user.profileImage
                : `${import.meta.env.VITE_DEVELOPER_API_URL.replace(/\/$/, '')}/${user.profileImage.replace(/^\//, '')}`;
            }
            const initials = `${user.FirstName?.[0] || ''}${user.LastName?.[0] || ''}`.toUpperCase();
            const isExpanded = expanded[user._id];
            return (
              <div key={user._id} className="border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt={`${user.FirstName} ${user.LastName}`}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={e => { e.target.onerror = null; e.target.src = '/icons/user.svg'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold border border-gray-200">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800 truncate">{user.FirstName} {user.LastName}</h3>
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {userObj.posts.length} post{userObj.posts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.Email}</p>
                  </div>
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition"
                    onClick={() => toggleExpand(user._id)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                  {userObj.posts.length === 0 ? (
                    <div className="text-gray-400 text-sm py-2">No posts for this user.</div>
                  ) : (
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      {userObj.posts.map((post) => (
                        <div key={post._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                  {post.postType}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-800 text-sm mb-1">{post.title || 'Untitled Post'}</h4>
                              {post.content && <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>}
                            </div>
                            <button
                              className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                              onClick={() => handleDelete(user._id, post._id)}
                              title="Delete Post"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                          {post.mediaUrl && (
                            <div className="mt-2">
                              {post.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                <video src={post.mediaUrl} className="w-full h-32 object-cover rounded shadow" controls title="Video" />
                              ) : (
                                <img
                                  src={post.mediaUrl}
                                  alt="media"
                                  className="w-full h-32 object-cover rounded shadow cursor-pointer"
                                  title="Click to view"
                                  onClick={() => setLightbox({ open: true, url: post.mediaUrl, isVideo: false })}
                                />
                              )}
                            </div>
                          )}
                          {renderDetails(post) && (
                            <div className="mt-2 pt-2 border-t border-gray-200">{renderDetails(post)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setLightbox({ open: false, url: null, isVideo: false })}>
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={() => setLightbox({ open: false, url: null, isVideo: false })}>&times;</button>
            {lightbox.isVideo ? (
              <video src={lightbox.url} className="w-full h-64 object-contain rounded" controls autoPlay />
            ) : (
              <img src={lightbox.url} alt="media" className="w-full h-64 object-contain rounded" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Invitations Table
// ─────────────────────────────────────────────────────────────────────────────
function InvitationsTable({ setInvitationCount }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchInvitations(); }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("developerAuthToken");
      const res = await axios.get(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/user-invitations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 1) {
        setInvitations(res.data.data || []);
        if (setInvitationCount) setInvitationCount((res.data.data || []).length);
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError("Failed to fetch invitations.");
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to cancel this user invitation?")) return;
    try {
      const token = localStorage.getItem("developerAuthToken");
      const res = await axios.delete(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/user-invitation/${invitationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 1) {
        Toast.success("Invitation cancelled successfully!");
        fetchInvitations();
      } else {
        Toast.error(res.data.msg || "Failed to cancel invitation.");
      }
    } catch (err) {
      console.error("Error cancelling invitation:", err);
      Toast.error("Failed to cancel invitation.");
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
    </div>
  );

  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <Mail className="h-16 w-16 mx-auto mb-3 text-gray-300" />
        <p>No pending invitations found</p>
        <button className="mt-4 text-xs text-blue-500 underline" onClick={fetchInvitations}>Refresh List</button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold">Email</th>
            <th className="py-3 px-4 font-semibold">Password</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Expires</th>
            <th className="py-3 px-4 font-semibold">Sent On</th>
            <th className="py-3 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {invitations.map((invite) => (
            <tr key={invite._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-gray-900 font-medium">{invite.firstName} {invite.lastName}</td>
              <td className="py-3 px-4 text-gray-600">{invite.email}</td>
              <td className="py-3 px-4 font-mono text-xs text-gray-500">
                {invite.plainPassword || <span className="text-gray-400 italic">Hidden/Old</span>}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  invite.status === "accepted" ? "bg-green-100 text-green-700"
                  : new Date() > new Date(invite.expiresAt) ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}>
                  {invite.status === "accepted" ? "Accepted" : new Date() > new Date(invite.expiresAt) ? "Expired" : "Pending"}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-500">{new Date(invite.expiresAt).toLocaleString()}</td>
              <td className="py-3 px-4 text-gray-500">{new Date(invite.createdAt).toLocaleDateString()}</td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => handleDeleteInvitation(invite._id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Cancel Invitation"
                >
                  <Trash2 className="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add User Modal
// ─────────────────────────────────────────────────────────────────────────────
function AddUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    password: '',
    graduationYear: '',
    admissionYear: '',
    department: '',
    course: '',
    specialization: '',
    batch: '',
    rollNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const needsGradYear = formData.role === 'student' || formData.role === 'alumni';
    const hasEnoughData = formData.fullName.trim() && formData.email.trim() && (!needsGradYear || (formData.graduationYear && formData.graduationYear.length === 4));
    if (hasEnoughData) generatePassword();
    else if (formData.password) setFormData(prev => ({ ...prev, password: '' }));
  }, [formData.fullName, formData.email, formData.graduationYear, formData.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    let yearSuffix = "24";
    if (formData.graduationYear && formData.graduationYear.length === 4) {
      yearSuffix = formData.graduationYear.slice(-2);
    } else {
      yearSuffix = new Date().getFullYear().toString().slice(-2);
    }
    const randomChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const getRandom = () => randomChars[Math.floor(Math.random() * randomChars.length)];
    let typeCode = "ALM";
    if (formData.role === "faculty") typeCode = "FLT";
    else if (formData.role === "student") typeCode = "STD";
    let pass = `TIU@${yearSuffix}-${typeCode}${getRandom()}${getRandom()}`;
    setFormData(prev => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.role) {
      Toast.error('Please fill in all fields'); return;
    }
    if (!formData.email.includes('@')) { Toast.error('Please enter a valid email address'); return; }
    if (formData.role === 'student' || formData.role === 'alumni') {
      if (!formData.admissionYear) { Toast.error('Please enter an admission year'); return; }
      if (!formData.graduationYear) { Toast.error('Please enter a graduation year'); return; }
      if (parseInt(formData.graduationYear) <= parseInt(formData.admissionYear)) { Toast.error('Graduation year must be after admission year'); return; }
      if (!formData.department?.trim()) { Toast.error('Please enter a department'); return; }
      if (formData.role === 'student') {
        if (!formData.specialization?.trim()) { Toast.error('Please enter a stream/specialization'); return; }
        if (!formData.batch?.trim()) { Toast.error('Please enter a batch'); return; }
        if (!formData.rollNumber?.trim()) { Toast.error('Please enter a student ID'); return; }
      } else if (formData.role === 'alumni') {
        if (!formData.course?.trim()) { Toast.error('Please enter a course'); return; }
      }
    }
    const names = formData.fullName.trim().split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || '.';
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/create/user`,
        { firstName, lastName, email: formData.email, password: formData.password, role: formData.role, graduationYear: formData.graduationYear, admissionYear: formData.admissionYear, department: formData.department, course: formData.course, specialization: formData.specialization, batch: formData.batch, rollNumber: formData.rollNumber },
        { headers: { Authorization: `Bearer ${localStorage.getItem("developerAuthToken")}` } }
      );
      if (response.data.status === 1 || response.status === 201) {
        Toast.success('Invitation sent successfully!');
        setFormData({ fullName: '', email: '', role: 'student', password: '', graduationYear: '', admissionYear: '', department: '', course: '', specialization: '', batch: '', rollNumber: '' });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        Toast.error(response.data.msg || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.status === 401) Toast.error("Session expired. Please login again.");
      else Toast.error(error.response?.data?.msg || 'An error occurred while creating the user');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Invite New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Enter full name" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Enter email address" />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {(formData.role === 'student' || formData.role === 'alumni') && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="admissionYear" className="block text-sm font-medium text-gray-700 mb-1">Admission Year</label>
                <input type="number" id="admissionYear" name="admissionYear" value={formData.admissionYear || ''} onChange={handleInputChange} required min="1950" max="2099" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="YYYY" />
              </div>
              <div className="flex-1">
                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                <input type="number" id="graduationYear" name="graduationYear" value={formData.graduationYear || ''} onChange={handleInputChange} required min="1950" max="2099" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="YYYY" />
              </div>
            </div>
          )}

          {formData.role === 'student' && (
            <>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input type="text" id="department" name="department" value={formData.department || ''} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. CSE, ECE" />
                </div>
                <div className="flex-1">
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Stream / Specialization</label>
                  <input type="text" id="specialization" name="specialization" value={formData.specialization || ''} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. IoT, Cybersecurity" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <input type="text" id="batch" name="batch" value={formData.batch || ''} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. 2021-2025" />
                </div>
                <div className="flex-1">
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input type="text" id="rollNumber" name="rollNumber" value={formData.rollNumber || ''} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Roll / Registration No." />
                </div>
              </div>
            </>
          )}

          {formData.role === 'alumni' && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" id="department" name="department" value={formData.department || ''} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. CSE, IT" />
              </div>
              <div className="flex-1">
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <input type="text" id="course" name="course" value={formData.course || ''} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. B.Tech, MCA" />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Temporary Password (Auto-generated)</label>
            <input type="text" id="password" name="password" value={formData.password} readOnly className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed" placeholder="Auto-generated password" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User Behavior Section — ranked leaderboard with activity tiers
// ─────────────────────────────────────────────────────────────────────────────
function UserBehaviorSection() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('posts');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('all');

  const buildRows = (users, postData) => {
    const postMap = {};
    postData.forEach(userObj => {
      if (!userObj.user) return;
      const uid = userObj.user._id.toString();
      let posts = userObj.posts.length, likes = 0, comments = 0, lastActive = null;
      userObj.posts.forEach(p => {
        likes += (p.likes?.length || 0);
        comments += (p.comments?.length || 0);
        if (!lastActive || new Date(p.createdAt) > new Date(lastActive)) lastActive = p.createdAt;
      });
      postMap[uid] = { posts, likes, comments, lastActive };
    });
    return users.map(u => {
      const b = postMap[u._id?.toString() || u.id?.toString()] || { posts: 0, likes: 0, comments: 0, lastActive: null };
      const tier = b.posts === 0 ? 'inactive' : b.posts <= 3 ? 'low' : 'active';
      return { id: u._id || u.id, name: `${u.FirstName} ${u.LastName}`, email: u.Email, role: u.collegeStatus || u.Role || 'user', joinedAt: u.createdAt, posts: b.posts, likes: b.likes, comments: b.comments, lastActive: b.lastActive, tier };
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('developerAuthToken');
        const base = import.meta.env.VITE_DEVELOPER_API_URL;
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, postsRes] = await Promise.all([
          axios.get(`${base}/developer/users`, { headers }),
          axios.get(`${base}/developer/view/user-posts`, { headers }),
        ]);
        setRows(buildRows(usersRes.data.status === 1 ? usersRes.data.users : [], postsRes.data.data || []));
      } catch (e) { console.error('UserBehavior fetch error:', e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const handleNewPost = (post) => {
      const uid = post.userId ? (post.userId._id || post.userId).toString() : null;
      if (!uid) return;
      setRows(prev => prev.map(r => {
        if (r.id?.toString() !== uid) return r;
        const np = r.posts + 1;
        return { ...r, posts: np, lastActive: new Date().toISOString(), tier: np === 0 ? 'inactive' : np <= 3 ? 'low' : 'active' };
      }));
    };
    const handlePostDeleted = () => {};
    socket.on('newPost', handleNewPost);
    socket.on('postDeleted', handlePostDeleted);
    return () => { socket.off('newPost', handleNewPost); socket.off('postDeleted', handlePostDeleted); };
  }, []);

  const tierConfig = {
    active:   { label: '🟢 Active',  color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', dotColor: '#22c55e' },
    low:      { label: '🟡 Low',     color: '#d97706', bg: '#fffbeb', border: '#fde68a', dotColor: '#f59e0b' },
    inactive: { label: '🔴 Inactive',color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', dotColor: '#94a3b8' },
  };

  const toggleSort = (col) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('desc'); } };
  const tierCounts = { active: 0, low: 0, inactive: 0 };
  rows.forEach(r => { if (tierCounts[r.tier] !== undefined) tierCounts[r.tier]++; });

  const processed = rows
    .filter(r => {
      const q = search.toLowerCase();
      return (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) && (filter === 'all' || r.tier === filter);
    })
    .sort((a, b) => {
      const d = sortDir === 'asc' ? 1 : -1;
      if (sortCol === 'name') return d * a.name.localeCompare(b.name);
      if (sortCol === 'role') return d * (a.role || '').localeCompare(b.role || '');
      if (sortCol === 'likes') return d * (a.likes - b.likes);
      if (sortCol === 'comments') return d * (a.comments - b.comments);
      if (sortCol === 'lastActive') return d * (new Date(a.lastActive || 0) - new Date(b.lastActive || 0));
      return d * (a.posts - b.posts);
    });

  const SortBtn = ({ col, label }) => (
    <th onClick={() => toggleSort(col)} style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: sortCol === col ? '#dc2626' : '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none', background: sortCol === col ? '#fff5f5' : '#f8fafc', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
      {label} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </th>
  );

  const formatTimeAgo = (d) => {
    if (!d) return '—';
    const ms = new Date() - new Date(d), m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), days = Math.floor(ms / 86400000);
    if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { key: 'all',      label: 'All Users',   count: rows.length,         icon: '👥', color: '#0f172a', bg: '#f8fafc', border: '#e2e8f0' },
          { key: 'active',   label: 'Active',       count: tierCounts.active,   icon: '🟢', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
          { key: 'low',      label: 'Low Activity', count: tierCounts.low,      icon: '🟡', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { key: 'inactive', label: 'Inactive',     count: tierCounts.inactive, icon: '🔴', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
        ].map(c => (
          <button key={c.key} onClick={() => setFilter(c.key)}
            style={{ background: filter === c.key ? c.bg : '#fff', border: `2px solid ${filter === c.key ? c.border : '#f1f5f9'}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.18s ease', textAlign: 'left' }}
            onMouseEnter={e => { if (filter !== c.key) e.currentTarget.style.borderColor = c.border; }}
            onMouseLeave={e => { if (filter !== c.key) e.currentTarget.style.borderColor = '#f1f5f9'; }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{c.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: c.color, lineHeight: 1 }}>{loading ? '—' : c.count}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginTop: '3px' }}>{c.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8', pointerEvents: 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', paddingLeft: '38px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', color: '#0f172a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : processed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
            <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
          </svg>
          <p style={{ margin: 0, fontWeight: 600 }}>No users match your filter</p>
        </div>
      ) : (
        <div style={{ borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>#</th>
                  <SortBtn col="name" label="User" />
                  <SortBtn col="role" label="Role" />
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>Status</th>
                  <SortBtn col="posts" label="Posts" />
                  <SortBtn col="likes" label="Likes" />
                  <SortBtn col="comments" label="Comments" />
                  <SortBtn col="lastActive" label="Last Active" />
                </tr>
              </thead>
              <tbody>
                {processed.map((r, idx) => {
                  const tc = tierConfig[r.tier];
                  const initials = r.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  const isTop3 = idx < 3 && sortCol === 'posts' && r.posts > 0;
                  return (
                    <tr key={r.id}
                      style={{ borderBottom: '1px solid #f8fafc', background: isTop3 ? '#fffbeb' : '#fff', transition: 'background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isTop3 ? '#fffbeb' : '#fff'; }}>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#94a3b8', fontWeight: 700, width: '40px' }}>
                        {sortCol === 'posts' && r.posts > 0 ? (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`) : `#${idx + 1}`}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${tc.color}22 0%, ${tc.color}10 100%)`, border: `1.5px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: tc.color, flexShrink: 0 }}>{initials}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{r.name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: '#f1f5f9', color: '#475569' }}>
                          {r.role?.charAt(0).toUpperCase() + r.role?.slice(1) || 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: tc.color, background: tc.bg, border: `1px solid ${tc.border}`, padding: '3px 10px', borderRadius: '20px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tc.dotColor, display: 'inline-block' }} />
                          {r.tier.charAt(0).toUpperCase() + r.tier.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}><span style={{ fontSize: '15px', fontWeight: 800, color: r.posts > 0 ? '#0f172a' : '#cbd5e1' }}>{r.posts}</span></td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}><span style={{ fontSize: '14px', fontWeight: 700, color: r.likes > 0 ? '#dc2626' : '#cbd5e1' }}>{r.likes > 0 ? `❤️ ${r.likes}` : '—'}</span></td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}><span style={{ fontSize: '14px', fontWeight: 700, color: r.comments > 0 ? '#7c3aed' : '#cbd5e1' }}>{r.comments > 0 ? `💬 ${r.comments}` : '—'}</span></td>
                      <td style={{ padding: '12px 14px' }}><span style={{ fontSize: '12px', color: r.lastActive ? '#64748b' : '#cbd5e1', fontWeight: 500 }}>{formatTimeAgo(r.lastActive)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 14px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
            Showing {processed.length} of {rows.length} users
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperManageUsers;
