import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import axios from "../../apis/axios";
import socket from "../../socket/socket";

/**
 * Superadmin dashboard statistics — all backend connections and socket listeners preserved.
 */
const DeveloperStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalEvents: 0,
    totalStories: 0,
  });
  const [trends, setTrends] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalEvents: 0,
    totalStories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("developerAuthToken");
        const [userRes, jobRes, eventRes, storyRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_DEVELOPER_API_URL}/user-count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_DEVELOPER_API_URL}/job-count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_DEVELOPER_API_URL}/event-count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_DEVELOPER_API_URL}/story-count`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats({
          totalUsers: userRes.data.userCount + (userRes.data.adminCount || 0),
          totalJobs: jobRes.data.jobCount,
          totalEvents: eventRes.data.eventCount,
          totalStories: storyRes.data.storyCount,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const flash = (key, delta) => {
      setStats((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
      setTrends((prev) => ({ ...prev, [key]: delta }));
      setTimeout(() => setTrends((prev) => ({ ...prev, [key]: 0 })), 4000);
    };

    const handleUserRegistered = () => flash("totalUsers", 1);
    const handleUserDeleted = () => flash("totalUsers", -1);
    const handleNewJob = () => flash("totalJobs", 1);
    const handleJobDeleted = () => flash("totalJobs", -1);
    const handleNewEvent = () => flash("totalEvents", 1);
    const handleEventDeleted = () => flash("totalEvents", -1);
    const handleNewStory = () => flash("totalStories", 1);
    const handleStoryDeleted = () => flash("totalStories", -1);

    socket.on("userRegistered", handleUserRegistered);
    socket.on("userDeleted", handleUserDeleted);
    socket.on("new_job", handleNewJob);
    socket.on("jobDeleted", handleJobDeleted);
    socket.on("new_event", handleNewEvent);
    socket.on("eventDeleted", handleEventDeleted);
    socket.on("new_story", handleNewStory);
    socket.on("storyDeleted", handleStoryDeleted);

    return () => {
      socket.off("userRegistered", handleUserRegistered);
      socket.off("userDeleted", handleUserDeleted);
      socket.off("new_job", handleNewJob);
      socket.off("jobDeleted", handleJobDeleted);
      socket.off("new_event", handleNewEvent);
      socket.off("eventDeleted", handleEventDeleted);
      socket.off("new_story", handleNewStory);
      socket.off("storyDeleted", handleStoryDeleted);
    };
  }, []);

  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: "/icons/users.svg", trend: trends.totalUsers, accentColor: "#dc2626" },
    { title: "Total Jobs", value: stats.totalJobs, icon: "/icons/briefcase.png", trend: trends.totalJobs, accentColor: "#7c3aed" },
    { title: "Total Events", value: stats.totalEvents, icon: "/icons/calendar.svg", trend: trends.totalEvents, accentColor: "#0891b2" },
    { title: "Total Stories", value: stats.totalStories, icon: "/icons/story.png", trend: trends.totalStories, accentColor: "#d97706" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
      {cards.map((card) => (
        <StatsCard key={card.title} title={card.title} value={card.value} icon={card.icon} loading={loading} trend={card.trend} accentColor={card.accentColor} />
      ))}
    </div>
  );
};

export default DeveloperStats;