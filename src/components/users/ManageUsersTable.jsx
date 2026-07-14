import React, { useState, useEffect } from 'react';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Page,
} from "@syncfusion/ej2-react-grids";
import { cn, formatDate } from "../../utils/helpers";
import { Skeleton } from "../shared";
import Toast from "../../utils/toast";
import axios from "../../apis/axios";
import socket from '../../socket/socket';
import { Pencil, Trash2 } from "lucide-react";
import EditUserModal from './EditUserModal';

export default function ManageUsersTable({ apiUrl = import.meta.env.VITE_ADMIN_API_URL, tokenKey = "authToken" }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const pageSize = 5;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  // WebSocket listeners for real-time user updates
  useEffect(() => {
    const handleUserRegistered = (newUser) => {
      const formatted = {
        id: newUser._id,
        name: `${newUser.FirstName} ${newUser.LastName}`,
        email: newUser.Email,
        joinedAt: new Date(newUser.createdAt).toISOString().split("T")[0],
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt ? new Date(newUser.updatedAt).toISOString() : null,
        status: newUser.Role || "user",
        plainPassword: newUser.plainPassword,
        permissions: newUser.permissions || {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        isGoogleUser: newUser.isGoogleUser,
        profilePic: newUser.isGoogleUser && newUser.profileImage ? newUser.profileImage : (newUser.profileImage && newUser.profileImage.trim() !== ''
          ? (newUser.profileImage.startsWith('http')
            ? newUser.profileImage
            : `${apiUrl.replace(/\/$/, '')}/${newUser.profileImage.replace(/^\//, '')}`)
          : null),
      };

      setUsers((prev) => {
        const exists = prev.some((u) => u.id === formatted.id);
        if (exists) return prev;
        return [formatted, ...prev];
      });
      setFilteredUsers((prev) => {
        const exists = prev.some((u) => u.id === formatted.id);
        if (exists) return prev;
        return [formatted, ...prev];
      });
    };

    const handleUserUpdated = (updatedUser) => {
      const formatted = {
        id: updatedUser._id,
        name: `${updatedUser.FirstName} ${updatedUser.LastName}`,
        email: updatedUser.Email,
        joinedAt: new Date(updatedUser.createdAt).toISOString().split("T")[0],
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt ? new Date(updatedUser.updatedAt).toISOString() : null,
        status: updatedUser.Role || "user",
        plainPassword: updatedUser.plainPassword,
        permissions: updatedUser.permissions || {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        isGoogleUser: updatedUser.isGoogleUser,
        profilePic: updatedUser.isGoogleUser && updatedUser.profileImage ? updatedUser.profileImage : (updatedUser.profileImage && updatedUser.profileImage.trim() !== ''
          ? (updatedUser.profileImage.startsWith('http')
            ? updatedUser.profileImage
            : `${apiUrl.replace(/\/$/, '')}/${updatedUser.profileImage.replace(/^\//, '')}`)
          : null),
      };

      const updateFunc = (u) => (u.id === formatted.id ? formatted : u);
      setUsers((prev) => prev.map(updateFunc));
      setFilteredUsers((prev) => prev.map(updateFunc));
    };

    const handleUserDeleted = (deletedUserId) => {
      const filterFunc = (u) => u.id !== deletedUserId;
      setUsers((prev) => prev.filter(filterFunc));
      setFilteredUsers((prev) => prev.filter(filterFunc));
    };

    socket.on("userRegistered", handleUserRegistered);
    socket.on("userUpdated", handleUserUpdated);
    socket.on("userDeleted", handleUserDeleted);

    return () => {
      socket.off("userRegistered", handleUserRegistered);
      socket.off("userUpdated", handleUserUpdated);
      socket.off("userDeleted", handleUserDeleted);
    };
  }, [apiUrl]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
          },
        }
      );

      if (response.data.status === 1) {
        const formattedUsers = response.data.users.map((user) => ({
          id: user._id,
          name: `${user.FirstName} ${user.LastName}`,
          email: user.Email,
          joinedAt: new Date(user.createdAt).toISOString().split("T")[0],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
            ? new Date(user.updatedAt).toISOString()
            : null,
          status: user.Role || "user",
          plainPassword: user.plainPassword, // Added field for display
          permissions: user.permissions || {
            create: false,
            read: true,
            update: false,
            delete: false,
          },
          isGoogleUser: user.isGoogleUser,
          profilePic: user.isGoogleUser && user.profileImage ? user.profileImage : (user.profileImage && user.profileImage.trim() !== ''
            ? (user.profileImage.startsWith('http')
              ? user.profileImage
              : `${apiUrl.replace(/\/$/, '')}/${user.profileImage.replace(/^\//, '')}`)
            : null),
        }));
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } else {
        Toast.error("Error fetching users: " + response.data.msg);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      Toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const result = users.filter(
        (user) =>
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(result);
    } else {
      setFilteredUsers(users);
    }
  };

  const handlePageChange = (args) => {
    setCurrentPage(args.currentPage);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${apiUrl}/delete/user`,
        {
          data: { userID: userId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
          },
        }
      );

      if (response.data.status === 1) {
        const updatedUsers = users.filter((user) => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        Toast.success("User deleted successfully");
      } else {
        Toast.error("Failed to delete user: " + response.data.msg);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Toast.error("An error occurred while deleting the user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  const handleEditSuccess = (updatedUser) => {
    // Update local state
    const updatedUsers = users.map((user) =>
      user.id === updatedUser._id ? {
        ...user,
        name: `${updatedUser.FirstName} ${updatedUser.LastName}`,
        email: updatedUser.Email,
        plainPassword: updatedUser.plainPassword || user.plainPassword,
      } : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
  };

  // Mobile card view
  const renderMobileView = () => (
    <div className="grid grid-cols-1 gap-4">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{user.name}</h4>
            <span
              className={cn(
                "text-xs py-1 px-2 rounded",
                user.status === "user"
                  ? "bg-success-50 text-success-700"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              {user.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div>
              <p className="text-gray-500">Joined</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Update</p>
              <p className="font-medium">
                {user.updatedAt ? formatDate(user.updatedAt) : "—"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleEdit(user.id)}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(user.id)}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>


      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by username or email"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          ))}
        </div>
      ) : isMobile ? (
        renderMobileView()
      ) : (
        /* Desktop view - SyncFusion Grid */
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <GridComponent
            dataSource={filteredUsers}
            gridLines="None"
            allowPaging={true}
            pageSettings={{ pageSize, currentPage }}
            actionComplete={handlePageChange}
          >
            <ColumnsDirective>
              <ColumnDirective
                field="name"
                headerText="Name"
                width="180"
                textAlign="Left"
                template={(data) => {
                  const initials = data.name
                    ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : '?';
                  let avatarUrl = null;
                  if (data.isGoogleUser && data.profilePic && data.profilePic.includes('googleusercontent')) {
                    avatarUrl = data.profilePic;
                  } else if (data.profilePic) {
                    avatarUrl = data.profilePic;
                  }
                  return (
                    <div className="flex items-center gap-2">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={data.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={e => { e.target.onerror = null; e.target.src = '/icons/user.svg'; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold border border-gray-200">
                          {initials}
                        </div>
                      )}
                      <span>{data.name}</span>
                    </div>
                  );
                }}
              />
              <ColumnDirective
                field="email"
                headerText="Email"
                width="200"
                textAlign="Left"
              />
              <ColumnDirective
                field="createdAt"
                headerText="Joined"
                width="120"
                textAlign="Left"
                template={(data) => formatDate(data.createdAt)}
              />
              <ColumnDirective
                field="status"
                headerText="Type"
                width="100"
                textAlign="Left"
                template={(data) => (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      data.status === "user"
                        ? "bg-success-50 text-success-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        data.status === "user"
                          ? "bg-success-500"
                          : "bg-gray-500"
                      )}
                    ></span>
                    {data.status}
                  </span>
                )}
              />
              <ColumnDirective
                field="plainPassword"
                headerText="Password"
                width="150"
                textAlign="Left"
                template={(data) => (
                  <span className="font-mono text-xs text-gray-500">
                    {data.plainPassword || <span className="text-gray-400 italic">Hidden/Old</span>}
                  </span>
                )}
              />
              <ColumnDirective
                field="actions"
                headerText="Actions"
                width="150"
                textAlign="Left"
                template={(data) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(data.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-full text-red-600 hover:text-red-800 transition"
                      title="Edit User"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(data.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-full text-red-600 hover:text-red-800 transition"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              />
            </ColumnsDirective>
            <Inject services={[Page]} />
          </GridComponent>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
      </div>

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onSuccess={handleEditSuccess}
        apiUrl={apiUrl}
        tokenKey={tokenKey}
      />
    </div>
  );
} 