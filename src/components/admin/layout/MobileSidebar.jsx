import { SidebarComponent } from '@syncfusion/ej2-react-navigations';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navitems from './Navitems';
import axios from 'axios';

const MobileSidebar = () => {
  const navigate = useNavigate();
  const adminRoute = import.meta.env.VITE_ADMIN_ROUTE;
  const sidebarRef = React.useRef(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

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
          
          // Set profile pic URL if available
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
          {/* <img
            src='/icons/logo3.png'
            alt='logo'
            className='size-[30px]'
          /> */}
         <h1 className="text-xl">Alumni <span className='text-red-500'>Connect</span></h1>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt={`${adminName} profile`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
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