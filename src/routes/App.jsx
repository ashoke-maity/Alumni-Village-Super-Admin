import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Developer Imports
import DeveloperLogin from '../pages/developer/DeveloperLogin';
import DeveloperLayout from '../components/layout/DeveloperLayout';
import DeveloperDashboard from '../pages/developer/DeveloperDashboard';
import DeveloperManageUsers from '../pages/developer/DeveloperManageUsers';
import DeveloperManageAdmins from '../pages/developer/DeveloperManageAdmins';
import DeveloperAnnouncements from '../pages/developer/DeveloperAnnouncements';
import DeveloperAdminAnnouncements from '../pages/developer/DeveloperAdminAnnouncements';
import DeveloperJobPosting from '../pages/developer/DeveloperJobPosting';
import DeveloperList from '../pages/developer/DeveloperList';
import DeveloperEvents from '../pages/developer/DeveloperEvents';
import DeveloperStories from '../pages/developer/DeveloperStories';
import DeveloperDonations from '../pages/developer/DeveloperDonations';
import DeveloperSettings from '../pages/developer/DeveloperSettings';
import NotFound from '../pages/NotFound';

const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        {/* Redirect Root path to Login */}
        <Route path="/" element={<Navigate to={`${developerRoute}/developer/login`} replace />} />

        {/* Developer Routes */}
        <Route path={`${developerRoute}/developer/login`} element={<DeveloperLogin />} />

        {/* Protected Developer Routes */}
        <Route element={<DeveloperLayout />}>
          <Route path={`${developerRoute}/developer/dashboard`} element={<DeveloperDashboard />} />
          <Route path={`${developerRoute}/developer/dashboard/users`} element={<DeveloperManageUsers />} />
          <Route path={`${developerRoute}/developer/dashboard/admins`} element={<DeveloperManageAdmins />} />
          <Route path={`${developerRoute}/developer/dashboard/settings`} element={<DeveloperSettings />} />
          <Route path={`${developerRoute}/developer/dashboard/events`} element={<DeveloperEvents />} />
          <Route path={`${developerRoute}/developer/dashboard/jobs`} element={<DeveloperJobPosting />} />
          <Route path={`${developerRoute}/developer/dashboard/stories`} element={<DeveloperStories />} />
          <Route path={`${developerRoute}/developer/dashboard/announcements`} element={<DeveloperAnnouncements />} />
          <Route path={`${developerRoute}/developer/dashboard/developers`} element={<DeveloperList />} />
          <Route path={`${developerRoute}/developer/dashboard/admin-announcements`} element={<DeveloperAdminAnnouncements />} />
          <Route path={`${developerRoute}/developer/dashboard/donations`} element={<DeveloperDonations />} />
        </Route>

        {/* not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;