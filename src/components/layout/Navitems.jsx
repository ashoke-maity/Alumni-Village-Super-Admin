import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "../../apis/axios";

export default function Navitems() {
    const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;
    const navigate = useNavigate();
    const location = useLocation();
    const [adminName, setAdminName] = useState("Developer");
    const [adminEmail, setAdminEmail] = useState("");
    const [profilePicUrl, setProfilePicUrl] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem("developerAuthToken");
                if (!token) return;

                const res = await axios.get(
                    `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.status === 200) {
                    const admin = res.data.admin;
                    const first = admin.FirstName;
                    const last = admin.LastName;
                    const fullName = `${first} ${last}`.trim();

                    setFirstName(first);
                    setLastName(last);
                    setAdminName(fullName);
                    setAdminEmail(admin.Email);

                    setProfilePicUrl(admin.ProfileImage || "");
                }
            } catch (error) {
                console.error("Error fetching developer data:", error);
            }
        };

        fetchAdminData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                const navItem = event.target.closest('.nav-item');
                if (!navItem) {
                    setShowDropdown(false);
                }
            }
        };

        if (showDropdown) {
            setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 100);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const handleLogout = () => {
        localStorage.removeItem("developerAuthToken");
        navigate(`${developerRoute}/developer/login`);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const sidebarItems = [
        {
            id: 1,
            icon: "/icons/home.svg",
            label: "Dashboard",
            href: `${developerRoute}/developer/dashboard`,
            exact: true,
        },
        {
            id: 2,
            icon: "/icons/users.svg",
            label: "Manage Users",
            href: `${developerRoute}/developer/dashboard/users`,
        },
        {
            id: 3,
            icon: "/icons/users.svg",
            label: "Manage Admins",
            href: `${developerRoute}/developer/dashboard/admins`,
        },
        {
            id: 4,
            icon: "/icons/megaphone.svg",
            label: "Announcements",
            href: `${developerRoute}/developer/dashboard/announcements`,
        },
        {
            id: 4.1,
            icon: "/icons/users.svg",
            label: "Show developers",
            href: `${developerRoute}/developer/dashboard/developers`,
        },
        {
            id: 5,
            icon: "/icons/briefcase.png",
            label: "Job Openings",
            href: `${developerRoute}/developer/dashboard/jobs`,
        },
        {
            id: 6,
            icon: "/icons/calendar.svg",
            label: "Events",
            href: `${developerRoute}/developer/dashboard/events`,
        },
        {
            id: 7,
            icon: "/icons/story.png",
            label: "Stories",
            href: `${developerRoute}/developer/dashboard/stories`,
        },
        {
            id: 8,
            icon: "/icons/heart.png",
            label: "Donations",
            href: `${developerRoute}/developer/dashboard/donations`,
            isDisabled: true,
        },
    ];

    return (
        <section className="nav-items bg-white w-full flex flex-col justify-between h-full">
            <div>
                <div className="py-5 px-4 border-b border-gray-100">
                    <h1 className="text-lg font-bold">Developer Menu</h1>
                </div>

                <nav className="mt-4 flex flex-col gap-2 px-2">
                    {sidebarItems.map(({ id, icon, label, href, exact, isDisabled }) => {
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
                                end={exact}
                                className={({ isActive }) => {
                                    return `nav-item group flex items-center gap-2 px-4 py-3 rounded-md transition ${isActive
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`;
                                }}
                            >
                                {({ isActive }) => (
                                    <>
                                        <img
                                            src={icon}
                                            alt={label}
                                            className={`size-5 transition-all ${isActive
                                                ? "brightness-0 invert"
                                                : "group-hover:brightness-0 group-hover:invert"
                                                }`}
                                        />
                                        <span className={`${isActive ? "text-white" : ""} text-sm`}>{label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <footer className="mt-auto border-t border-gray-100 relative" ref={dropdownRef}>
                <div className="px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center gap-3 flex-1 min-w-0 hover:bg-gray-50 rounded-md p-1 -m-1 transition-colors"
                        aria-label="Profile menu"
                    >
                        {profilePicUrl ? (
                            <img
                                src={profilePicUrl}
                                alt={adminName}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold flex-shrink-0">
                                {firstName.charAt(0)}{lastName.charAt(0)}
                            </div>
                        )}
                        <article className="flex-1 min-w-0 text-left">
                            <h2 className="text-sm font-medium truncate">{adminName}</h2>
                            <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                        </article>
                        <svg
                            className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Drop-up Menu */}
                {showDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <NavLink
                            to={`${developerRoute}/developer/dashboard/settings`}
                            onClick={() => setShowDropdown(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive
                                    ? "bg-blue-50 text-blue-700"
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
                            <img src="/icons/logout.svg" alt="logout" className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </footer>
        </section >
    );
}
