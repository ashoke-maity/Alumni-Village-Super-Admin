import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header, PageTransition } from "../../components/admin/layout";
import ManageAdminsTable from "../../components/admin/admins";
import axios from 'axios';

function DeveloperManageAdmins() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("Developer");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          setAdminName(res.data.admin.FirstName);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminName("Developer");
      }
    };

    fetchAdminData();
  }, [navigate]);

  return (
    <PageTransition locationKey={location.pathname} className="dashboard wrapper mt-5 content-center space-y-6 px-2 lg:px-8">
      <header className="header">
        <article>
          <Header
            title="Manage Admins"
            description="Invite new admins, manage existing admins, and monitor their status"
          />
        </article>
      </header>

      {/* Manage Admins Table */}
      <section>
        <ManageAdminsTable
          apiUrl={`${import.meta.env.VITE_DEVELOPER_API_URL}/developer`}
          tokenKey="developerAuthToken"
          canManage={true}
          setInvitationCount={setInvitationCount}
        />
      </section>
    </PageTransition>
  );
}

export default DeveloperManageAdmins;
