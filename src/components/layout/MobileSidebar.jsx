import { SidebarComponent } from '@syncfusion/ej2-react-navigations';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navitems from './Navitems';
import axios from "../../apis/axios";

const MobileSidebar = () => {
    const navigate = useNavigate();
    const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;
    const sidebarRef = React.useRef(null);
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminLastName, setAdminLastName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [profilePicUrl, setProfilePicUrl] = useState("");

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
                    setAdminName(admin.FirstName);
                    setAdminLastName(admin.LastName);
                    setAdminEmail(admin.Email);

                    // Set profile pic URL if available
                    setProfilePicUrl(admin.ProfileImage || "");
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };

        fetchAdminData();
    }, []);

    const toggleSidebar = () => {
        if (sidebarRef.current) {
            if (isOpen) {
                sidebarRef.current.hide();
            } else {
                sidebarRef.current.show();
            }
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className='mobile-sidebar wrapper'>
            <header className="flex justify-between items-center py-4 border-b border-gray-200">
                <Link to="/" className="flex items-center gap-2">
                    <h1 className="text-xl">Developer <span className='text-blue-500'>Portal</span></h1>
                </Link>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {profilePicUrl ? (
                            <img
                                src={profilePicUrl}
                                alt={`${adminName} profile`}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                                {adminName.charAt(0)}{adminLastName.charAt(0)}
                            </div>
                        )}
                        <span className="text-sm font-medium hidden sm:inline">{adminName}</span>
                    </div>

                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-100"
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                    >
                        <img
                            src={isOpen ? '/icons/close.svg' : '/icons/menu.svg'}
                            alt={isOpen ? 'close menu' : 'open menu'}
                            className='size-6 min-w-[24px] min-h-[24px]'
                            onError={e => { e.target.onerror = null; e.target.src = '/icons/menu.svg'; }}
                        />
                    </button>
                </div>
            </header>

            <SidebarComponent
                width={270}
                ref={sidebarRef}
                created={() => sidebarRef.current.hide()}
                closeOnDocumentClick={true}
                showBackdrop={true}
                type='Over'
                position='Left'
                className="mobile-nav-sidebar"
            >
                <Navitems />
            </SidebarComponent>
        </div>
    );
};

export default MobileSidebar;
