import React from 'react';
import { useNavigate } from 'react-router-dom';

const actions = [
  {
    id: 'manage-users',
    label: 'Manage Users',
    desc: 'View & edit alumni',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: '#dc2626', bg: '#fff1f2', border: '#fecdd3',
    route: '/developer/dashboard/users',
  },
  {
    id: 'post-announcement',
    label: 'New Announcement',
    desc: 'Broadcast a message',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe',
    route: '/developer/dashboard/announcements',
  },
  {
    id: 'post-job',
    label: 'Post a Job',
    desc: 'Add new opportunity',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
    route: '/developer/dashboard/jobs',
  },
  {
    id: 'manage-admins',
    label: 'Manage Admins',
    desc: 'Admin accounts',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    route: '/developer/dashboard/admins',
  },
];

const QuickActions = ({ routePrefix = '' }) => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Quick Actions</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Jump to common tasks</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {actions.map((action) => (
          <button
            key={action.id}
            id={`quick-action-dev-${action.id}`}
            onClick={() => navigate(`${routePrefix}${action.route}`)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', padding: '16px', borderRadius: '12px', background: action.bg, border: `1.5px solid ${action.border}`, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${action.color}20`; e.currentTarget.style.borderColor = action.color; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = action.border; }}
          >
            <div style={{ color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: `${action.color}15` }}>
              {action.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{action.label}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{action.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
