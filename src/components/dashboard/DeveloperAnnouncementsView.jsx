import React, { useState, useEffect } from 'react';
import axios from "../../apis/axios";
import { Link } from 'react-router-dom';
import socket from "../../socket/socket";

const DeveloperAnnouncementsView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;

  useEffect(() => { fetchAnnouncements(); }, []);

  // WebSocket listeners for real-time announcements
  useEffect(() => {
    const handleNewAnnouncement = (ann) => {
      setAnnouncements((prev) => {
        const exists = prev.some((a) => a._id === ann._id);
        if (exists) return prev;
        return [ann, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      });
    };
    const handleAnnouncementEdited = (editedAnn) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === editedAnn._id ? editedAnn : a))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      );
    };
    const handleAnnouncementDeleted = (id) => {
      setAnnouncements((prev) => prev.filter((a) => a._id !== id).slice(0, 5));
    };

    socket.on("newAnnouncement", handleNewAnnouncement);
    socket.on("announcementEdited", handleAnnouncementEdited);
    socket.on("announcementDeleted", handleAnnouncementDeleted);
    return () => {
      socket.off("newAnnouncement", handleNewAnnouncement);
      socket.off("announcementEdited", handleAnnouncementEdited);
      socket.off("announcementDeleted", handleAnnouncementDeleted);
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("developerAuthToken");
      const res = await axios.get(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/get-announcements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.announcements) {
        setAnnouncements(res.data.announcements
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5));
      } else {
        setAnnouncements([]);
      }
    } catch {
      setError("No announcements yet");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const diffMs = new Date() - new Date(dateString);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getColor = (idx) => {
    const colors = [
      { dot: '#dc2626', bg: '#fff1f2', border: '#fecdd3', badge: '#fee2e2', badgeText: '#dc2626' },
      { dot: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe', badge: '#ede9fe', badgeText: '#7c3aed' },
      { dot: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', badge: '#cffafe', badgeText: '#0e7490' },
      { dot: '#d97706', bg: '#fffbeb', border: '#fde68a', badge: '#fef3c7', badgeText: '#d97706' },
      { dot: '#059669', bg: '#f0fdf4', border: '#bbf7d0', badge: '#dcfce7', badgeText: '#059669' },
    ];
    return colors[idx % colors.length];
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Announcements</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Latest updates from your team</p>
          </div>
        </div>
        <Link
          to={`${developerRoute}/developer/dashboard/announcements`}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', background: '#fff1f2', border: '1px solid #fecdd3' }}
        >
          Manage
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>

      <div style={{ padding: '8px 0' }}>
        {loading ? (
          <div style={{ padding: '16px 24px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e2e8f0', marginTop: '5px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '13px', background: '#f1f5f9', borderRadius: '6px', width: '60%', marginBottom: '8px' }} />
                  <div style={{ height: '11px', background: '#f1f5f9', borderRadius: '6px', width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error || announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f8fafc', border: '2px dashed #e2e8f0', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>No announcements yet</p>
            <Link to={`${developerRoute}/developer/dashboard/announcements`} style={{ color: '#dc2626', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
              Post your first announcement →
            </Link>
          </div>
        ) : (
          <div style={{ padding: '8px 24px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '4px', top: '16px', bottom: '16px', width: '2px', background: 'linear-gradient(to bottom, #e2e8f0, transparent)' }} />
              {announcements.map((ann, idx) => {
                const color = getColor(idx);
                return (
                  <div key={ann._id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '12px 0', borderBottom: idx < announcements.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color.dot, flexShrink: 0, marginTop: '6px', boxShadow: `0 0 0 3px ${color.bg}, 0 0 0 4px ${color.border}`, position: 'relative', zIndex: 1 }} />
                    <div style={{ flex: 1, background: color.bg, borderRadius: '12px', border: `1px solid ${color.border}`, padding: '12px 14px', transition: 'transform 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{ann.title}</h3>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatTimeAgo(ann.createdAt)}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ann.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <Link to={`${developerRoute}/developer/dashboard/announcements`} style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                View all announcements →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperAnnouncementsView;
