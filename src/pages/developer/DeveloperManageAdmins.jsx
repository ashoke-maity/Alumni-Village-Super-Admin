import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header, PageTransition } from "../../components/layout";
import axios from "../../apis/axios";
import { Plus, X, Trash2, Mail, KeyRound, Search, ChevronDown, Shield, ShieldOff, Clock, UserPlus } from "lucide-react";
import Toast from "../../utils/toast";
import { cn } from "../../utils/helpers";
import { Skeleton } from "../../components/shared";
import socket from "../../socket/socket";

const API = () => import.meta.env.VITE_DEVELOPER_API_URL;
const TOKEN = () => localStorage.getItem("developerAuthToken");

function timeAgo(dateStr) {
  if (!dateStr) return "Never";
  const ms = Date.now() - new Date(dateStr);
  const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), d = Math.floor(ms / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function DeveloperManageAdmins() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admins, setAdmins] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invLoading, setInvLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("admins"); // 'admins' | 'invitations'
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API()}/developer/admin/all-admins`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      if (res.data.status === 1) setAdmins(res.data.admins || []);
    } catch (e) {
      Toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    setInvLoading(true);
    try {
      const res = await axios.get(`${API()}/developer/admin/invitations`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      if (res.data.status === 1) setInvitations(res.data.invitations || []);
    } catch (e) {
      Toast.error("Failed to fetch invitations");
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchInvitations();
  }, []);

  // Live online/offline tracking
  useEffect(() => {
    const onOnline = (adminId) => setAdmins(prev => prev.map(a => a._id?.toString() === adminId?.toString() ? { ...a, isOnline: true } : a));
    const onOffline = (data) => {
      const id = data?.adminId || data;
      setAdmins(prev => prev.map(a => a._id?.toString() === id?.toString() ? { ...a, isOnline: false, lastSeen: new Date().toISOString() } : a));
    };
    socket.on("adminOnline", onOnline);
    socket.on("adminOffline", onOffline);
    return () => { socket.off("adminOnline", onOnline); socket.off("adminOffline", onOffline); };
  }, []);

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const res = await axios.delete(`${API()}/developer/admin/delete-admin/${adminId}`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      if (res.data.status === 1) {
        setAdmins(prev => prev.filter(a => a._id !== adminId));
        Toast.success("Admin deleted successfully");
      } else {
        Toast.error(res.data.msg || "Failed to delete admin");
      }
    } catch (e) {
      Toast.error("An error occurred while deleting the admin");
    }
  };

  const handleCancelInvitation = async (invId) => {
    try {
      const res = await axios.delete(`${API()}/developer/admin/cancel-invitation/${invId}`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      if (res.data.status === 1) {
        setInvitations(prev => prev.filter(i => i._id !== invId));
        Toast.success("Invitation cancelled");
      } else {
        Toast.error(res.data.msg || "Failed to cancel invitation");
      }
    } catch (e) {
      Toast.error("Failed to cancel invitation");
    }
  };

  // Stats
  const onlineCount = admins.filter(a => a.isOnline).length;
  const pendingInvites = invitations.filter(i => i.status === "pending").length;

  const filtered = admins.filter(a => {
    const q = search.toLowerCase();
    return !q || `${a.FirstName} ${a.LastName}`.toLowerCase().includes(q) || a.Email?.toLowerCase().includes(q);
  });

  const tabStyle = (tab) => ({
    padding: "14px 0",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: `2px solid ${activeTab === tab ? "#dc2626" : "transparent"}`,
    color: activeTab === tab ? "#dc2626" : "#6b7280",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    background: "none",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  });

  return (
    <PageTransition locationKey={location.pathname} className="dashboard wrapper mt-5 content-center space-y-6 px-2 lg:px-8">
      <header className="header">
        <article>
          <Header title="Manage Admins" description="Invite, monitor, and manage all admin accounts" />
        </article>
      </header>

      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" }}>

        {/* ── Stats Header ── */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 90% 50%, rgba(220,38,38,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.8px", marginBottom: "4px" }}>ADMIN MANAGEMENT</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>🛡️ Admin Control Panel</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>Monitor, manage and invite all platform administrators</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", flex: 1, maxWidth: "520px" }}>
              {[
                { label: "Total Admins",   value: admins.length,   icon: "🛡️", color: "#dc2626" },
                { label: "Online Now",     value: onlineCount,     icon: "🟢", color: "#22c55e" },
                { label: "Offline",        value: admins.length - onlineCount, icon: "⚫", color: "#94a3b8" },
                { label: "Pending Invites",value: pendingInvites,  icon: "📨", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "16px", marginBottom: "2px" }}>{s.icon}</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{loading ? "—" : s.value}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sub-header: Tabs + Add Button + Search ── */}
        <div style={{ padding: "0 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <nav style={{ display: "flex", gap: "24px" }}>
            <button style={tabStyle("admins")} onClick={() => setActiveTab("admins")}>
              <Shield size={15} /> All Admins ({admins.length})
            </button>
            <button style={tabStyle("invitations")} onClick={() => setActiveTab("invitations")}>
              <Mail size={15} /> Invitations ({invitations.length})
            </button>
          </nav>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#b91c1c"}
            onMouseLeave={e => e.currentTarget.style.background = "#dc2626"}
          >
            <UserPlus size={15} /> Invite Admin
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: "24px" }}>

          {activeTab === "admins" && (
            <>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: "18px", maxWidth: "420px" }}>
                <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search admins by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", paddingLeft: "36px", paddingRight: "14px", paddingTop: "9px", paddingBottom: "9px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#0f172a", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              {/* Admin Cards */}
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8" }}>
                  <Shield size={40} style={{ margin: "0 auto 12px", display: "block", color: "#e2e8f0" }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "15px" }}>No admins found</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filtered.map(admin => {
                    const initials = `${admin.FirstName?.[0] || ""}${admin.LastName?.[0] || ""}`.toUpperCase() || "A";
                    return (
                      <div
                        key={admin._id}
                        style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", border: "1.5px solid #f1f5f9", borderRadius: "14px", background: "#fff", transition: "all 0.18s ease" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {/* Avatar with online ring */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: admin.isOnline ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: admin.isOnline ? "#fff" : "#94a3b8", border: `2px solid ${admin.isOnline ? "#dc2626" : "#e2e8f0"}` }}>
                            {initials}
                          </div>
                          <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "11px", height: "11px", borderRadius: "50%", background: admin.isOnline ? "#22c55e" : "#94a3b8", border: "2px solid #fff", boxShadow: admin.isOnline ? "0 0 0 2px rgba(34,197,94,0.25)" : "none" }} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{admin.FirstName} {admin.LastName}</span>
                            <span style={{ fontSize: "10px", fontWeight: 700, color: admin.isOnline ? "#059669" : "#94a3b8", background: admin.isOnline ? "#f0fdf4" : "#f8fafc", border: `1px solid ${admin.isOnline ? "#bbf7d0" : "#e2e8f0"}`, padding: "1px 7px", borderRadius: "20px" }}>
                              {admin.isOnline ? "● Online" : "● Offline"}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "14px", marginTop: "4px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>{admin.Email}</span>
                            {admin.AdminID && <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>ID: {admin.AdminID}</span>}
                            <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "3px" }}>
                              <Clock size={10} />
                              {admin.isOnline ? "Active now" : `Last seen: ${timeAgo(admin.lastSeen)}`}
                            </span>
                          </div>
                        </div>

                        {/* Password preview */}
                        {admin.Password && (
                          <div style={{ flexShrink: 0, minWidth: "120px", display: "none" }}>
                            <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, marginBottom: "2px" }}>Password</div>
                            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#475569" }}>{admin.Password?.length < 30 ? admin.Password : "••••••••"}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button
                            onClick={() => { setSelectedAdmin(admin); setShowPassModal(true); }}
                            title="Change password"
                            style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", transition: "all 0.15s ease" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "#3b82f6"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
                          >
                            <KeyRound size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            title="Delete admin"
                            style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1.5px solid #fecdd3", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#dc2626", transition: "all 0.15s ease" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#dc2626"; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "invitations" && (
            <div>
              {invLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                </div>
              ) : invitations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8" }}>
                  <Mail size={40} style={{ margin: "0 auto 12px", display: "block", color: "#e2e8f0" }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "15px" }}>No invitations sent yet</p>
                  <p style={{ margin: "6px 0 0", fontSize: "13px" }}>Click "Invite Admin" to send a new invitation</p>
                </div>
              ) : (
                <div style={{ borderRadius: "14px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Name", "Email", "Status", "Expires", "Sent", ""].map(h => (
                          <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", textAlign: "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map(inv => {
                        const statusColors = {
                          pending:  { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                          accepted: { color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
                          expired:  { color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" },
                        };
                        const sc = statusColors[inv.status] || statusColors.expired;
                        return (
                          <tr key={inv._id} style={{ borderBottom: "1px solid #f8fafc", background: "#fff" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                            <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{inv.firstName} {inv.lastName}</td>
                            <td style={{ padding: "12px 14px", fontSize: "12px", color: "#64748b" }}>{inv.email}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, padding: "2px 9px", borderRadius: "20px" }}>
                                {(inv.status || "pending").charAt(0).toUpperCase() + (inv.status || "pending").slice(1)}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94a3b8" }}>{inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                            <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94a3b8" }}>{inv.createdAt ? timeAgo(inv.createdAt) : "—"}</td>
                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                              {inv.status === "pending" && (
                                <button
                                  onClick={() => handleCancelInvitation(inv._id)}
                                  style={{ padding: "5px 10px", border: "1.5px solid #fecdd3", background: "#fff1f2", color: "#dc2626", borderRadius: "7px", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#dc2626"; }}
                                >
                                  <X size={11} /> Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: "10px 14px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
                    {invitations.length} invitation{invitations.length !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newInv) => {
            if (newInv) setInvitations(prev => [newInv, ...prev]);
            setActiveTab("invitations");
            setShowAddModal(false);
            fetchInvitations();
          }}
        />
      )}

      {showPassModal && selectedAdmin && (
        <ChangePasswordModal
          admin={selectedAdmin}
          onClose={() => { setShowPassModal(false); setSelectedAdmin(null); }}
          onSuccess={() => { setShowPassModal(false); setSelectedAdmin(null); }}
        />
      )}
    </PageTransition>
  );
}

// ─── Add Admin (Invite) Modal ─────────────────────────────────────────────────
function AddAdminModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "admin" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) { Toast.error("Name and email are required"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API()}/developer/admin/send-invitation`, { ...form }, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      if (res.data.status === 1) {
        Toast.success("Invitation sent successfully!");
        onSuccess(res.data.invitation || null);
      } else {
        Toast.error(res.data.msg || "Failed to send invitation");
      }
    } catch (e) {
      Toast.error(e.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px", margin: "16px", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Invite New Admin</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "5px" }}>First Name *</label>
              <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required placeholder="First" style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "5px" }}>Last Name</label>
              <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Last" style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "5px" }}>Email Address *</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="admin@example.com" style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: "10px", paddingTop: "6px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "9px", background: "#fff", color: "#475569", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "9px", background: loading ? "#e2e8f0" : "#dc2626", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ admin, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || password.length < 6) { Toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await axios.put(`${API()}/developer/admin/change-password/${admin._id}`, { newPassword: password }, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      if (res.data.status === 1) {
        Toast.success("Password changed successfully!");
        onSuccess();
      } else {
        Toast.error(res.data.msg || "Failed to change password");
      }
    } catch (e) {
      Toast.error(e.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "380px", margin: "16px", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Change Password</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>
        <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#64748b" }}>
          Setting new password for <strong>{admin.FirstName} {admin.LastName}</strong>
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "5px" }}>New Password *</label>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
              style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "9px", background: "#fff", color: "#475569", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "9px", background: loading ? "#e2e8f0" : "#3b82f6", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Saving…" : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeveloperManageAdmins;
