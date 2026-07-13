import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageTransition } from "../../components/admin/layout";
import {
  DeveloperStats,
  UserActivityChart,
  JobOpeningsChart,
  EventsChart,
  StoriesOverview,
  DeveloperAnnouncementsView,
  QuickActions,
  UserActivityPanel,
  AdminSummaryPanel,
} from "../../components/developer/dashboard";
import axios from "axios";
import socket from "../../socket/socket";

function DeveloperDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("Developer");
  const [isLive, setIsLive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;

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

  // Live clock + socket status
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const onConnect = () => setIsLive(true);
    const onDisconnect = () => setIsLive(false);
    setIsLive(socket.connected);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      clearInterval(timer);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });



  return (
    <PageTransition locationKey={location.pathname}>
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "0" }}>

        {/* ── Hero Banner ── */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #dc2626 100%)",
          padding: "32px 32px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `radial-gradient(circle at 80% 50%, rgba(220,38,38,0.15) 0%, transparent 50%),
              radial-gradient(circle at 10% 80%, rgba(255,255,255,0.03) 0%, transparent 40%)` }} />
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "rgba(220,38,38,0.08)", pointerEvents: "none" }} />

          <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: "0.5px" }}>
                    SUPERADMIN CONTROL CENTER
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", background: isLive ? "rgba(22,163,74,0.2)" : "rgba(107,114,128,0.2)", border: `1px solid ${isLive ? "rgba(22,163,74,0.4)" : "rgba(107,114,128,0.4)"}`, borderRadius: "20px", padding: "3px 10px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: isLive ? "#22c55e" : "#6b7280", boxShadow: isLive ? "0 0 6px #22c55e" : "none", animation: isLive ? "pulse-live 1.5s ease-in-out infinite" : "none" }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: isLive ? "#86efac" : "#9ca3af", letterSpacing: "0.3px" }}>{isLive ? "LIVE" : "OFFLINE"}</span>
                  </div>
                </div>
                <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.15 }}>
                  {getGreeting()}, {adminName} 👋
                </h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.55)", fontSize: "14px" }}>
                  Full-platform oversight — users, content, admins &amp; announcements.
                </p>
              </div>

              {/* Clock */}
              <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "14px 20px", textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>{formatTime(currentTime)}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes pulse-live {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.3); }
            }
          `}</style>
        </div>

        {/* ── Main Content ── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 24px 48px", display: "flex", flexDirection: "column", gap: "22px" }}>

          {/* KPI Stats — single row of counters */}
          <DeveloperStats />

          {/* Quick Actions */}
          <QuickActions routePrefix={`${developerRoute}`} />

          {/* User Portal + Admin Portal panels side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "22px" }}>
            <UserActivityPanel />
            <AdminSummaryPanel />
          </div>

          {/* Charts — 2 column */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "22px" }}>
            <UserActivityChart />
            <JobOpeningsChart />
          </div>

          {/* Events + Stories */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "22px" }}>
            <EventsChart />
            <StoriesOverview />
          </div>

          {/* Announcements — full width */}
          <DeveloperAnnouncementsView />
        </div>
      </div>
    </PageTransition>
  );
}

export default DeveloperDashboard;
