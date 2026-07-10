import React, { useState, useEffect } from 'react';
import { cn, formatDate } from "../../../utils/helpers";
import { Skeleton } from "../../shared";
import Toast from "../../../utils/toast";
import AddAdminModal from "../AddAdminModal";
import EditAdminModal from "../EditAdminModal";
import { Plus, Users, UserCheck, UserX, Trash2, Mail, Clock, Edit, MoreVertical, CheckCircle, MinusCircle } from "lucide-react";
import axios from "axios";
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Page,
} from "@syncfusion/ej2-react-grids";

export default function ManageAdminsTable({ apiUrl = import.meta.env.VITE_ADMIN_API_URL, tokenKey = "authToken", canManage = false, setInvitationCount }) {

  const [admins, setAdmins] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' or 'invitations'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch admins
      const adminsResponse = await axios.get(
        `${apiUrl}/admin/all-admins`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
          },
        }
      );

      // Fetch invitations
      const invitationsResponse = await axios.get(
        `${apiUrl}/admin/invitations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
          },
        }
      );

      let formattedAdmins = [];
      let formattedInvitations = [];

      if (adminsResponse.data.status === 1) {
        formattedAdmins = adminsResponse.data.admins.map((admin) => {
          // Format profile image URL
          let profilePic = null;
          if (admin.ProfileImage && admin.ProfileImage.trim() !== '') {
            profilePic = admin.ProfileImage.startsWith('http')
              ? admin.ProfileImage
              : `${apiUrl.replace(/\/$/, '')}/${admin.ProfileImage.replace(/^\//, '')}`;
          }

          return {
            id: admin._id,
            name: `${admin.FirstName} ${admin.LastName}`,
            firstName: admin.FirstName,
            lastName: admin.LastName,
            email: admin.Email,
            adminID: admin.AdminID,
            joinedAt: new Date(admin.createdAt).toISOString().split("T")[0],
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
              ? new Date(admin.updatedAt).toISOString()
              : null,
            isOnline: admin.isOnline || false,
            lastSeen: admin.lastSeen || null,
            profilePic: profilePic,
            password: admin.plainPassword, // Use planPassword for display
          };
        });
        setAdmins(formattedAdmins);
      }

      if (invitationsResponse.data.status === 1) {
        formattedInvitations = invitationsResponse.data.invitations.map((invitation) => ({
          id: invitation.id,
          name: `${invitation.firstName} ${invitation.lastName}`,
          email: invitation.email,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          acceptedAt: invitation.acceptedAt,
          invitedBy: invitation.invitedBy?.name || 'Unknown',
          createdAt: invitation.createdAt,
          isExpired: invitation.isExpired,
        }));
        setInvitations(formattedInvitations);
        if (setInvitationCount) setInvitationCount(formattedInvitations.length);
      }

      // Set initial filtered data
      setFilteredData(formattedAdmins);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      Toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const currentData = activeTab === 'admins' ? admins : invitations;

    if (query) {
      const result = currentData.filter(
        (item) =>
          item.email.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(result);
    } else {
      setFilteredData(currentData);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setFilteredData(tab === 'admins' ? admins : invitations);
  };

  const handleDeleteInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to delete this invitation? This will allow the email to be used for a new invitation.")) return;

    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${apiUrl}/admin/cancel-invitation/${invitationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
          },
        }
      );

      if (response.data.status === 1) {
        const updatedInvitations = invitations.filter((invitation) => invitation.id !== invitationId);
        setInvitations(updatedInvitations);
        setFilteredData(updatedInvitations);
        Toast.success("Invitation deleted successfully");
      } else {
        Toast.error("Failed to delete invitation: " + response.data.msg);
      }
    } catch (error) {
      console.error("Error deleting invitation:", error);
      Toast.error("An error occurred while deleting the invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdminSuccess = () => {
    fetchData(); // Refresh data after adding new admin
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowEditAdminModal(true);
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) return;

    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${apiUrl}/admin/delete-admin/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
          },
        }
      );

      if (response.data.status === 1) {
        const updatedAdmins = admins.filter((admin) => admin.id !== adminId);
        setAdmins(updatedAdmins);
        setFilteredData(updatedAdmins);
        Toast.success("Admin deleted successfully");
      } else {
        Toast.error("Failed to delete admin: " + response.data.msg);
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      Toast.error(error.response?.data?.msg || "An error occurred while deleting the admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdminSuccess = () => {
    fetchData(); // Refresh data after editing admin
  };

  const getStatusBadge = (status, isExpired) => {
    if (status === 'accepted') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Accepted</span>;
    } else if (status === 'pending' && !isExpired) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>;
    }
  };

  const getOnlineStatus = (isOnline, lastSeen) => {
    if (isOnline) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          Online
        </span>
      );
    } else {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-500 border border-red-100"
          title={lastSeen ? `Last seen: ${new Date(lastSeen).toLocaleString()}` : "Offline"}
        >
          <div className="w-2 h-2 bg-red-300 rounded-full"></div>
          Offline
        </span>
      );
    }
  };

  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredData.map((item) => {
        const initials = item.name
          ? item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : '?';
        let avatarUrl = activeTab === 'admins' ? item.profilePic : null;

        return (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {activeTab === 'admins' && (
                  <>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={e => { e.target.onerror = null; e.target.src = '/icons/user.svg'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold border border-gray-200 flex-shrink-0">
                        {initials}
                      </div>
                    )}
                  </>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{item.email}</p>
                </div>
              </div>
              {activeTab === 'admins' ? (
                getOnlineStatus(item.isOnline, item.lastSeen)
              ) : (
                getStatusBadge(item.status, item.isExpired)
              )}
            </div>
            <div className="text-xs text-gray-400">
              {activeTab === 'admins' ? (
                `Joined: ${item.joinedAt}`
              ) : (
                `Invited: ${new Date(item.createdAt).toLocaleDateString()}`
              )}
            </div>
            {activeTab === 'admins' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEditAdmin(item)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAdmin(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
            {activeTab === 'invitations' && (
              <button
                onClick={() => handleDeleteInvitation(item.id)}
                className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete Invitation
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">


      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{canManage ? "Manage Admins" : "Show all Admins"}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {canManage ? "View and manage admin accounts and invitations" : "View registered administrators"}
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Invite Admin
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => handleTabChange('admins')}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'admins'
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Admins ({admins.length})
            </div>
          </button>

          {canManage && (
            <button
              onClick={() => handleTabChange('invitations')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'invitations'
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invitations ({invitations.length})
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
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

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : isMobile ? (
          renderMobileView()
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'admins' ? (
              <GridComponent
                dataSource={filteredData}
                gridLines="None"
                allowPaging={true}
                actionComplete={(args) => {
                  if (args.requestType === 'paging') setCurrentPage(args.currentPage);
                }}
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
                      let avatarUrl = data.profilePic;
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
                  <ColumnDirective field="email" headerText="Email" width="200" textAlign="Left" />
                  <ColumnDirective field="adminID" headerText="Admin ID" width="120" textAlign="Left" />
                  {tokenKey === 'developerAuthToken' && (
                    <ColumnDirective
                      field="password"
                      headerText="Password"
                      width="200"
                      textAlign="Left"
                      template={(data) => (
                        <div className="truncate text-xs font-mono text-gray-500" title={data.password}>
                          {data.password || <span className="text-gray-400 italic">Hidden/Old</span>}
                        </div>
                      )}
                    />
                  )}
                  <ColumnDirective field="status" headerText="Status" width="100" textAlign="Left" template={(data) => getOnlineStatus(data.isOnline, data.lastSeen)} />
                  <ColumnDirective field="joinedAt" headerText="Joined" width="120" textAlign="Left" />
                  {canManage && (
                    <ColumnDirective
                      field="actions"
                      headerText="Actions"
                      width="150"
                      textAlign="Left"
                      template={(data) => (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAdmin(data)}
                            className="text-indigo-600 hover:text-indigo-800 p-1"
                            title="Edit Admin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(data.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    />
                  )}
                </ColumnsDirective>
                <Inject services={[Page]} />
              </GridComponent>
            ) : (
              <GridComponent
                dataSource={filteredData}
                gridLines="None"
                allowPaging={true}
                actionComplete={(args) => {
                  if (args.requestType === 'paging') setCurrentPage(args.currentPage);
                }}
              >
                <ColumnsDirective>
                  <ColumnDirective field="name" headerText="Name" width="180" textAlign="Left" />
                  <ColumnDirective field="email" headerText="Email" width="200" textAlign="Left" />
                  <ColumnDirective field="status" headerText="Status" width="100" textAlign="Left" template={(data) => getStatusBadge(data.status, data.isExpired)} />
                  <ColumnDirective field="invitedBy" headerText="Invited By" width="160" textAlign="Left" />
                  <ColumnDirective field="createdAt" headerText="Invited On" width="120" textAlign="Left" template={(data) => new Date(data.createdAt).toLocaleDateString()} />
                  <ColumnDirective
                    field="actions"
                    headerText="Actions"
                    width="150"
                    textAlign="Left"
                    template={(data) => (
                      <button
                        onClick={() => handleDeleteInvitation(data.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Invitation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  />
                </ColumnsDirective>
                <Inject services={[Page]} />
              </GridComponent>
            )}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onSuccess={handleAddAdminSuccess}
        apiUrl={apiUrl}
        tokenKey={tokenKey}
      />

      {/* Edit Admin Modal */}
      <EditAdminModal
        isOpen={showEditAdminModal}
        onClose={() => setShowEditAdminModal(false)}
        admin={selectedAdmin}
        onSuccess={handleEditAdminSuccess}
        apiUrl={apiUrl}
        tokenKey={tokenKey}
      />
    </div >
  );
} 