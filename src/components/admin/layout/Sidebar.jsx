import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import axios from "axios";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminRoute = import.meta.env.VITE_ADMIN_ROUTE;

  const sidebarItems = [
    {
      id: 1,
      icon: "/icons/home.svg",
      label: "Dashboard",
      href: `${adminRoute}/admin/dashboard`,
      exact: true,
    },
    {
      id: 2,
      icon: "/icons/users.svg",
      label: "Manage Users",
      href: `${adminRoute}/admin/dashboard/users`,
    },
    {
      id: 3,
      icon: "/icons/users.svg",
      label: "Show all Admins",
      href: `${adminRoute}/admin/dashboard/admins`,
    },
    {
      id: 4,
      icon: "/icons/megaphone.svg",
      label: "Post a Notice",
      href: `${adminRoute}/admin/dashboard/announcements`,
    },
    {
      id: 5,
      icon: "/icons/briefcase.png",
      label: "Post a Career opportunity",
      href: `${adminRoute}/admin/dashboard/jobs`,
    },
    {
      id: 6,
      icon: "/icons/calendar.svg",
      label: "Post a campus calender",
      href: `${adminRoute}/admin/dashboard/events`,
    },
    {
      id: 7,
      icon: "/icons/story.png",
      label: "Post a Spotlight",
      href: `${adminRoute}/admin/dashboard/stories`,
    },
    {
      id: 8,
      icon: "/icons/heart.png",
      label: "Ask for Donation",
      href: `${adminRoute}/admin/dashboard/donations`,
      isDisabled: true, // remove it when the work is done
    },
  ];

  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          `${import.meta.env.VITE_ADMIN_API_URL}/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 200) {
          const admin = res.data.admin;

          setAdminName(admin.FirstName);
          setAdminLastName(admin.LastName);
          setAdminEmail(admin.Email);

          let profileUrl = admin.ProfileImage || "";
          if (profileUrl && !profileUrl.startsWith("http")) {
            profileUrl = import.meta.env.VITE_ADMIN_API_URL + "/" + profileUrl;
          }
          setProfilePicUrl(profileUrl);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside the footer dropdown area
      // Don't close when clicking on nav items
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click is on a nav item - if so, don't close
        const navItem = event.target.closest('.nav-item');
        if (!navItem) {
          setShowDropdown(false);
        }
      }
    };

    if (showDropdown) {
      // Use a small delay to avoid immediate closing
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate(`${adminRoute}/admin/login`);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <aside className="bg-white w-[270px] flex-shrink-0 hidden lg:block shadow-sm border-r border-gray-100 sticky top-0 h-screen z-40">
      <SidebarComponent width={270} enableGestures={false}>
        <section className="nav-items bg-white flex flex-col h-full">
          <div className="py-5 px-4 border-b border-gray-100">
            <Link to="/home" className="flex items-center gap-2">
              <img
                src="/images/Techno_logo.png"
                alt="logo"
                className="h-10 w-auto object-contain"
              />
              <h1 className="text-lg font-bold">
                TIG Alumni Village<span className="text-red-500"> Admin Portal</span>
              </h1>
            </Link>
          </div>

          <nav className="mt-4 flex flex-col gap-2 px-2">
            {sidebarItems.map(
              ({ id, icon, label, href, isDisabled, exact }) => {
                if (isDisabled) {
                  return (
                    <div
                      key={id}
                      onClick={() => alert("This section is under development")}
                      className="nav-item group flex items-center gap-2 px-4 py-3 rounded-md transition cursor-pointer text-gray-400 hover:bg-gray-100"
                    >
                      <img
                        src={icon}
                        alt={label}
                        className="size-5 opacity-50"
                      />
                      <span className="text-sm">{label}</span>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={id}
                    to={href}
                    end={exact || href === `${adminRoute}/admin/dashboard`}
                    className={({ isActive }) => {
                      // Custom active check for sub-pages
                      const isEventsActive = label === "Post a campus calender" && location.pathname.includes('/addEvents');
                      const isJobsActive = label === "Post a Career opportunity" && location.pathname.includes('/addJobs');
                      const isStoriesActive = label === "Post a Spotlight" && location.pathname.includes('/addStories');
                      // const isUsersActive = label === "Manage Users" && location.pathname.includes('/users'); // Covers detailed views if any

                      const active = isActive || isEventsActive || isJobsActive || isStoriesActive;

                      return `nav-item group flex items-center gap-2 px-4 py-3 rounded-md transition ${active
                        ? "bg-red-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                        }`;
                    }}
                  >
                    {({ isActive }) => {
                      const isEventsActive = label === "Post a campus calender" && location.pathname.includes('/addEvents');
                      const isJobsActive = label === "Post a Career opportunity" && location.pathname.includes('/addJobs');
                      const isStoriesActive = label === "Post a Spotlight" && location.pathname.includes('/addStories');
                      const active = isActive || isEventsActive || isJobsActive || isStoriesActive;

                      return (
                        <>
                          <img
                            src={icon}
                            alt={label}
                            className={`size-5 transition-all ${active
                              ? "brightness-0 invert"
                              : "group-hover:brightness-0 group-hover:invert"
                              }`}
                          />
                          <span
                            className={`${active ? "text-white" : ""} text-sm`}
                          >
                            {label}
                          </span>
                        </>
                      )
                    }}
                  </NavLink>
                );
              }
            )}
          </nav>

          <footer
            className="mt-auto border-t border-gray-100 relative"
            ref={dropdownRef}
          >
            <div className="px-4 py-4 flex items-center gap-3">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 flex-1 min-w-0 hover:bg-gray-50 rounded-md p-1 -m-1 transition-colors"
                aria-label="Profile menu"
              >
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt="Admin Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold flex-shrink-0">
                    {adminName.charAt(0)}
                    {adminLastName.charAt(0)}
                  </div>
                )}
                <article className="flex-1 min-w-0 text-left">
                  <h2 className="text-sm font-medium truncate">
                    {adminName} {adminLastName}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                </article>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${showDropdown ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Drop-up Menu */}
            {showDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <NavLink
                  to={`${adminRoute}/admin/dashboard/settings`}
                  onClick={() => setShowDropdown(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <img
                    src="/icons/icons8-settings-50.png"
                    alt="Settings"
                    className="w-5 h-5"
                  />
                  <span>Settings</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src="/icons/logout.svg"
                    alt="logout"
                    className="w-5 h-5"
                  />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </footer>
        </section>
      </SidebarComponent>
    </aside>
  );
}

export default Sidebar;
