import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header, PageTransition } from "../../components/admin/layout";
import {
  DeveloperStats,
  UserActivityChart,
  JobOpeningsChart,
  EventsChart,
  StoriesOverview,
  DeveloperAnnouncementsView
} from "../../components/developer/dashboard";
import axios from 'axios';

function DeveloperDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("Developer");

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
          setAdminName(res.data.admin.FirstName); // fetching the firstname from the database
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
            title={`Welcome, ${adminName} 👋`}
            description="Track Alumni Activities, Manage Events and Jobs"
          />
        </article>
      </header>

      {/* Stats Overview */}
      <section>
        <DeveloperStats />
      </section>

      {/* Announcements Section */}
      <section>
        <DeveloperAnnouncementsView />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserActivityChart />
        <div className="grid grid-cols-1 gap-6">
          <JobOpeningsChart />
        </div>
      </section>

      {/* Events and Stories Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventsChart />
        <StoriesOverview />
      </section>
    </PageTransition>
  );
}

export default DeveloperDashboard;
