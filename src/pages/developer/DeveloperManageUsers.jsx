import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header, PageTransition } from "../../components/admin/layout";
import { ManageUsersTable } from "../../components/admin/users";
import axios from 'axios';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Plus, X, Users, FileText, Mail, Trash2 } from "lucide-react";
import Toast from "../../utils/toast";
import { cn } from "../../utils/helpers";
import { Skeleton } from "../../components/shared";

function DeveloperManageUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("Developer");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'posts', 'invitations'
  const [refreshKey, setRefreshKey] = useState(0);
  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("developerAuthToken");
        const res = await axios.get(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!token) {
          return navigate(`${import.meta.env.VITE_DEVELOPER_ROUTE}/developer/login`);
        }

        if (res.status === 200) {
          setAdminName(res.data.admin.FirstName);
        }
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
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'users' ? (
            <ManageUsersTable apiUrl={`${import.meta.env.VITE_DEVELOPER_API_URL}/developer`} tokenKey="developerAuthToken" />
          ) : activeTab === 'posts' ? (
            <UserPostsSection />
          ) : (
            <InvitationsTable key={refreshKey} setInvitationCount={setInvitationCount} />
          )}
        </div>
      </div>


      {/* Add User Modal */}
      {
        showAddUserModal && (
          <AddUserModal
            isOpen={showAddUserModal}
            onClose={() => setShowAddUserModal(false)}
            onSuccess={() => {
              setActiveTab('invitations');
              setRefreshKey(prev => prev + 1);
            }}
          />
        )
      }
    </PageTransition >
  );
}

function UserPostsSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("developerAuthToken");
        const res = await axios.get(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/view/user-posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPosts(res.data.data || []); // Use 'data' from API response
      } catch (err) {
        setError("Failed to fetch user posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = async (userId, postId) => {
    try {
      const token = localStorage.getItem("developerAuthToken");
      await axios.delete(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/delete/user-post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  const toggleExpand = (userId) => {
    setExpanded((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Helper to render job/event details
  const renderDetails = (post) => {
    if (post.postType === "job" && post.jobDetails) {
      const j = post.jobDetails;
      return (
        <div className="text-xs text-gray-700">
          <div><b>Company:</b> {j.companyName}</div>
          <div><b>Location:</b> {j.location}</div>
          <div><b>Type:</b> {j.jobType}</div>
          <div><b>Salary:</b> {j.salary}</div>
          <div><b>Deadline:</b> {j.deadline ? new Date(j.deadline).toLocaleDateString() : '-'} </div>
          <div><b>Requirements:</b> {j.requirements}</div>
        </div>
      );
    }
    if (post.postType === "event" && post.eventDetails) {
      const e = post.eventDetails;
      return (
        <div className="text-xs text-gray-700">
          <div><b>Date:</b> {e.eventDate ? new Date(e.eventDate).toLocaleDateString() : '-'} </div>
          <div><b>Location:</b> {e.location}</div>
          <div><b>Summary:</b> {e.summary}</div>
        </div>
      );
    }
    return null;
  };

  // Lightbox for media preview
  const [lightbox, setLightbox] = useState({ open: false, url: null, isVideo: false });

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
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
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
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${post.postType === 'job' ? 'bg-red-100 text-red-700' : post.postType === 'event' ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700'}`}>
                                  {post.postType}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "-"}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-800 text-sm mb-1">{post.title || 'Untitled Post'}</h4>
                              {post.content && (
                                <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                              )}
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
                                <video
                                  src={post.mediaUrl}
                                  className="w-full h-32 object-cover rounded shadow"
                                  controls
                                  title="Video"
                                />
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
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              {renderDetails(post)}
                            </div>
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

function InvitationsTable({ setInvitationCount }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("developerAuthToken");
      const res = await axios.get(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/user-invitations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.status === 1) {
        setInvitations(res.data.data || []);
        if (setInvitationCount) setInvitationCount((res.data.data || []).length);
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError("Failed to fetch invitations.");
      setInvitations([]); // Ensure it's empty array on error
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );

  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  if (!invitations || invitations.length === 0) {
    if (loading) return null; // Wait for loading
    // Debugging info
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
              <td className="py-3 px-4 text-gray-900 font-medium">
                {invite.firstName} {invite.lastName}
              </td>
              <td className="py-3 px-4 text-gray-600">{invite.email}</td>
              <td className="py-3 px-4 font-mono text-xs text-gray-500">
                {invite.plainPassword || (
                  <span className="text-gray-400 italic">Hidden/Old</span>
                )}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invite.status === "accepted"
                  ? "bg-red-100 text-red-700"
                  : new Date() > new Date(invite.expiresAt)
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {invite.status === "accepted"
                    ? "Accepted"
                    : new Date() > new Date(invite.expiresAt)
                      ? "Expired"
                      : "Pending"}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-500">
                {new Date(invite.expiresAt).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-gray-500">
                {new Date(invite.createdAt).toLocaleDateString()}
              </td>
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
    specialization: '', // stream
    batch: '',
    rollNumber: '' // studentId
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Generate password if essential fields are present
    // If graduation year is required (student/alumni), wait for it.
    // Otherwise (Faculty), generate without it (uses current year as fallback in generator).

    const needsGradYear = formData.role === 'student' || formData.role === 'alumni';
    const hasEnoughData = formData.fullName.trim() && formData.email.trim() && (!needsGradYear || (formData.graduationYear && formData.graduationYear.length === 4));

    if (hasEnoughData) {
      generatePassword();
    } else {
      // Clear password if requirements not met, so user knows it's pending input
      if (formData.password) {
        setFormData(prev => ({ ...prev, password: '' }));
      }
    }
  }, [formData.fullName, formData.email, formData.graduationYear, formData.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generatePassword = () => {
    // Defines "TIU@YY-STDXX" pattern for students
    // Defines "TIU@YY-ALMXX" pattern for alumni
    // Defines "TIU@YY-FLTXX" pattern for faculty
    // YY = last 2 digits of graduation year (or current year if not provided)
    // XX = 2 random alphanumeric chars

    let yearSuffix = "24"; // Default fallback
    if (formData.graduationYear && formData.graduationYear.length === 4) {
      yearSuffix = formData.graduationYear.slice(-2);
    } else {
      const currentYear = new Date().getFullYear().toString();
      yearSuffix = currentYear.slice(-2);
    }

    const randomChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const getRandom = () => randomChars[Math.floor(Math.random() * randomChars.length)];

    // Pattern: TIU (3) + @ (1) + YY (2) + - (1) + TYPE (3) + XX (2) = 12 characters

    let typeCode = "ALM"; // Default to Alumni
    if (formData.role === "faculty") {
      typeCode = "FLT";
    } else if (formData.role === "student") {
      typeCode = "STD";
    }

    let pass = `TIU@${yearSuffix}-${typeCode}`;
    pass += getRandom();
    pass += getRandom();

    setFormData(prev => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.role) {
      Toast.error('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      Toast.error('Please enter a valid email address');
      return;
    }

    // Validate years and additional details if role is student or alumni
    if (formData.role === 'student' || formData.role === 'alumni') {
      if (!formData.admissionYear) {
        Toast.error('Please enter an admission year');
        return;
      }
      if (!formData.graduationYear) {
        Toast.error('Please enter a graduation year');
        return;
      }
      if (parseInt(formData.graduationYear) <= parseInt(formData.admissionYear)) {
        Toast.error('Graduation year must be after admission year');
        return;
      }
      if (!formData.department?.trim()) {
        Toast.error('Please enter a department');
        return;
      }
      if (formData.role === 'student') {
        if (!formData.specialization?.trim()) {
          Toast.error('Please enter a stream/specialization');
          return;
        }
        if (!formData.batch?.trim()) {
          Toast.error('Please enter a batch');
          return;
        }
        if (!formData.rollNumber?.trim()) {
          Toast.error('Please enter a student ID');
          return;
        }
      } else if (formData.role === 'alumni') {
        if (!formData.course?.trim()) {
          Toast.error('Please enter a course');
          return;
        }
      }
    }

    // Split name
    const names = formData.fullName.trim().split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || '.'; // Fallback if no last name

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/create/user`,
        {
          firstName: firstName,
          lastName: lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          graduationYear: formData.graduationYear,
          admissionYear: formData.admissionYear,
          department: formData.department,
          course: formData.course,
          specialization: formData.specialization,
          batch: formData.batch,
          rollNumber: formData.rollNumber
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("developerAuthToken")}`,
          },
        }
      );

      if (response.data.status === 1 || response.status === 201) {
        Toast.success('Invitation sent successfully!');
        setFormData({
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
        if (onSuccess) onSuccess();
        onClose();
      } else {
        Toast.error(response.data.msg || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response && error.response.status === 401) {
        Toast.error("Session expired. Please login again.");
      } else {
        Toast.error(error.response?.data?.msg || 'An error occurred while creating the user');
      }
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {(formData.role === 'student' || formData.role === 'alumni') && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="admissionYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Year
                </label>
                <input
                  type="number"
                  id="admissionYear"
                  name="admissionYear"
                  value={formData.admissionYear || ''}
                  onChange={handleInputChange}
                  required
                  min="1950"
                  max="2099"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="YYYY"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear || ''}
                  onChange={handleInputChange}
                  required
                  min="1950"
                  max="2099"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="YYYY"
                />
              </div>
            </div>
          )}

          {formData.role === 'student' && (
            <>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. CSE, ECE"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    Stream / Specialization
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. IoT, Cybersecurity"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <input
                    type="text"
                    id="batch"
                    name="batch"
                    value={formData.batch || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 2021-2025"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="rollNumber"
                    name="rollNumber"
                    value={formData.rollNumber || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Roll / Registration No."
                  />
                </div>
              </div>
            </>
          )}

          {formData.role === 'alumni' && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. CSE, IT"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. B.Tech, MCA"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Temporary Password (Auto-generated)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed"
                placeholder="Auto-generated password"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeveloperManageUsers;
