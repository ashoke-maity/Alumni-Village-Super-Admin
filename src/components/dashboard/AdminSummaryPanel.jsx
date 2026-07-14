import React, { useState, useEffect } from 'react';
import axios from "../../apis/axios";
import socket from "../../socket/socket";

const API = () => import.meta.env.VITE_DEVELOPER_API_URL;
const TOKEN = () => localStorage.getItem('developerAuthToken');

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const ms = Date.now() - new Date(dateStr);
  const m = Math.floor(ms / 60000);
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(ms / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function AdminSummaryPanel() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get(`${API()}/developer/admin/all-admins`, {
          headers: { Authorization: `Bearer ${TOKEN()}` },
        });
        if (res.data.status === 1) setAdmins(res.data.admins || []);
      } catch (e) {
        console.error('AdminSummaryPanel fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // Real-time online/offline tracking
  useEffect(() => {
    const handleOnline = (adminId) => {
      setAdmins(prev => prev.map(a => a._id?.toString() === adminId?.toString() ? { ...a, isOnline: true } : a));
    };
    const handleOffline = (data) => {
      const adminId = data?.adminId || data;
      setAdmins(prev => prev.map(a => a._id?.toString() === adminId?.toString() ? { ...a, isOnline: false, lastSeen: new Date().toISOString() } : a));
    };
    socket.on('adminOnline', handleOnline);
    socket.on('adminOffline', handleOffline);
    return () => { socket.off('adminOnline', handleOnline); socket.off('adminOffline', handleOffline); };
  }, []);

  const onlineCount = admins.filter(a => a.isOnline).length;
  const offlineCount = admins.length - onlineCount;

  return (
    <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>🛡️ Admin Portal Overview</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Live admin status monitoring</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '3px 10px' }}>
            🟢 {onlineCount} Online
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '3px 10px' }}>
            ⚫ {offlineCount} Offline
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '18px' }}>
        {[
          { label: 'Total Admins', value: admins.length, icon: '🛡️', color: '#dc2626', bg: '#fef2f2' },
          { label: 'Online Now',   value: onlineCount,   icon: '🟢', color: '#059669', bg: '#f0fdf4' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {loading ? '—' : s.value}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Admin list */}
      {loading ? (
        <div style={{ color: '#cbd5e1', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Loading admins...</div>
      ) : admins.length === 0 ? (
        <div style={{ color: '#cbd5e1', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No admins found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
          {admins.map(admin => {
            const initials = `${admin.FirstName?.[0] || ''}${admin.LastName?.[0] || ''}`.toUpperCase() || 'A';
            return (
              <div
                key={admin._id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: admin.isOnline ? '#f0fdf4' : '#f8fafc', border: `1px solid ${admin.isOnline ? '#bbf7d0' : '#f1f5f9'}`, borderRadius: '10px', transition: 'all 0.2s ease' }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: admin.isOnline ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: admin.isOnline ? '#fff' : '#94a3b8' }}>
                    {initials}
                  </div>
                  <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', background: admin.isOnline ? '#22c55e' : '#94a3b8', border: '2px solid #fff', boxShadow: admin.isOnline ? '0 0 0 2px rgba(34,197,94,0.3)' : 'none' }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {admin.FirstName} {admin.LastName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {admin.Email}
                  </div>
                </div>

                {/* Status */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: admin.isOnline ? '#059669' : '#94a3b8' }}>
                    {admin.isOnline ? '● Online' : '● Offline'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>
                    {admin.isOnline ? 'Active now' : `Last: ${timeAgo(admin.lastSeen)}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
