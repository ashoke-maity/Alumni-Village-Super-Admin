import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

const DeveloperLayout = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <main className="developer-layout bg-gray-50 min-h-screen flex">
            {!isMobile && <Sidebar />}
            {isMobile && <MobileSidebar />}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </main>
    );
};

export default DeveloperLayout;
