import React, { useState, useEffect } from 'react';
import axios from "../../apis/axios";
import socket from "../../socket/socket";

const API = () => import.meta.env.VITE_DEVELOPER_API_URL;
const TOKEN = () => localStorage.getItem('developerAuthToken');

const TYPE_CONFIG = {
  regular: { label: 'Posts',  color: '#dc2626', bg: '#fef2f2' },
  job:     { label: 'Jobs',   color: '#7c3aed', bg: '#faf5ff' },
  event:   { label: 'Events', color: '#0891b2', bg: '#ecfeff' },
  media:   { label: 'Media',  color: '#d97706', bg: '#fffbeb' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const ms = Date.now() - new Date(dateStr);
  const m = Math.floor(ms / 60000);
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(ms / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function UserActivityPanel() {
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState(new Set());

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API()}/developer/view/user-posts`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      setPostData(res.data.data || []);
    } catch (e) {
      console.error('UserActivityPanel fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleNewPost = (post) => {
      const uid = post.userId ? (post.userId._id || post.userId).toString() : 'unknown';
      const formatted = {
        _id: post._id || post.id,
        postType: post.postType,
        content: post.content,
        createdAt: post.createdAt || new Date().toISOString(),
        likes: post.likes || [],
        comments: post.comments || [],
        jobDetails: post.jobDetails || null,
        eventDetails: post.eventDetails || null,
      };
      setPostData(prev => {
        const idx = prev.findIndex(u => u.user && u.user._id.toString() === uid);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], posts: [formatted, ...updated[idx].posts] };
          return updated;
        }
        return [{ user: post.userId || { _id: uid }, posts: [formatted] }, ...prev];
      });
      setNewIds(n => new Set([...n, formatted._id]));
      setTimeout(() => setNewIds(n => { const s = new Set(n); s.delete(formatted._id); return s; }), 8000);
    };

    const handlePostDeleted = (id) => {
      setPostData(prev => prev.map(u => ({ ...u, posts: u.posts.filter(p => p._id !== id) })).filter(u => u.posts.length > 0));
    };

    socket.on('newPost', handleNewPost);
    socket.on('postDeleted', handlePostDeleted);
    return () => { socket.off('newPost', handleNewPost); socket.off('postDeleted', handlePostDeleted); };
  }, []);

  // Compute aggregates
  const allPosts = postData.flatMap(u => u.posts || []);
  const totalPosts = allPosts.length;
  const totalLikes = allPosts.reduce((s, p) => s + (p.likes?.length || 0), 0);
  const totalComments = allPosts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  const typeCounts = { regular: 0, job: 0, event: 0, media: 0 };
  allPosts.forEach(p => { if (typeCounts[p.postType] !== undefined) typeCounts[p.postType]++; });

  // Top 5 users
  const topUsers = postData
    .filter(u => u.user)
    .map(u => ({ user: u.user, count: u.posts.length, likes: u.posts.reduce((s, p) => s + (p.likes?.length || 0), 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent 8 posts (flat, sorted by createdAt)
  const recentPosts = allPosts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
    .map(p => {
      const userObj = postData.find(u => u.posts.some(q => q._id === p._id));
      return { ...p, user: userObj?.user || null };
    });

  return (
    <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>👥 User Portal Activity</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Live feed of all user content</div>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          LIVE
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
        {[
          { label: 'Total Posts', value: totalPosts, icon: '📝', color: '#dc2626', bg: '#fef2f2' },
          { label: 'Total Likes', value: totalLikes, icon: '❤️', color: '#7c3aed', bg: '#faf5ff' },
          { label: 'Comments', value: totalComments, icon: '💬', color: '#0891b2', bg: '#ecfeff' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>{s.icon}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {loading ? '—' : s.value}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Post Type Breakdown */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Post Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(typeCounts).map(([type, count]) => {
            const cfg = TYPE_CONFIG[type];
            const pct = totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0;
            return (
              <div key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{cfg.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: '5px', borderRadius: '99px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Top Users */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>🏆 Top Users</div>
          {loading ? (
            <div style={{ color: '#cbd5e1', fontSize: '12px' }}>Loading...</div>
          ) : topUsers.length === 0 ? (
            <div style={{ color: '#cbd5e1', fontSize: '12px' }}>No activity yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {topUsers.map((u, i) => {
                const initials = `${u.user.FirstName?.[0] || ''}${u.user.LastName?.[0] || ''}`.toUpperCase() || '?';
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={u.user._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef2f2', border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#dc2626', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {medals[i] || `#${i + 1}`} {u.user.FirstName} {u.user.LastName}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{u.count} posts · ❤️ {u.likes}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Recent Activity</div>
          {loading ? (
            <div style={{ color: '#cbd5e1', fontSize: '12px' }}>Loading...</div>
          ) : recentPosts.length === 0 ? (
            <div style={{ color: '#cbd5e1', fontSize: '12px' }}>No posts yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
              {recentPosts.map(p => {
                const cfg = TYPE_CONFIG[p.postType] || TYPE_CONFIG.regular;
                const isNew = newIds.has(p._id);
                const preview = p.postType === 'job' ? p.jobDetails?.jobTitle
                  : p.postType === 'event' ? p.eventDetails?.eventName
                  : (p.content || '').slice(0, 30);
                return (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '5px 8px', background: isNew ? '#fef9ec' : '#f8fafc', borderRadius: '8px', border: `1px solid ${isNew ? '#fde68a' : '#f1f5f9'}` }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '1px 5px', borderRadius: '8px', flexShrink: 0, marginTop: '1px' }}>
                      {cfg.label.toUpperCase()}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {preview || '—'}
                        {isNew && <span style={{ marginLeft: '4px', fontSize: '9px', fontWeight: 800, color: '#dc2626', background: '#fef2f2', padding: '0px 4px', borderRadius: '4px' }}>NEW</span>}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{timeAgo(p.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
