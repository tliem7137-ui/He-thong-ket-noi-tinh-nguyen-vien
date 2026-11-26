import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { OrgCreateActivityModal } from './components/OrgCreateActivityModal';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';

// Views
import { HomeGuest } from './views/guest/HomeGuest';
import { VolunteerDashboard } from './views/volunteer/VolunteerDashboard';
import { OrgDashboard } from './views/organization/OrgDashboard';
import { AdminDashboard } from './views/admin/AdminDashboard';

const MainApp = () => {
  const { userRole } = useApp();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('home');

  // Automatically route to appropriate dashboard when role changes
  useEffect(() => {
    if (userRole === 'admin') {
      setActiveTab('admin_dashboard');
    } else if (userRole === 'organization') {
      setActiveTab('org_dashboard');
    } else if (userRole === 'volunteer') {
      setActiveTab('dashboard');
    } else if (userRole === 'guest') {
      setActiveTab('home');
    }
  }, [userRole]);

  // Modals state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [createActivityModalOpen, setCreateActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // URL Path Routing for /login, /register, and /admin/login
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;

      // 1. Nếu người dùng ĐÃ ĐĂNG NHẬP mà truy cập /login, /register hoặc /admin/login:
      // Tự động chuyển hướng về Bảng điều khiển (Dashboard) tương ứng và dọn sạch URL
      if (userRole !== 'guest') {
        if (path === '/login' || path === '/register' || path === '/admin/login') {
          setLoginModalOpen(false);
          setRegisterModalOpen(false);
          setAdminLoginModalOpen(false);
          window.history.replaceState({}, '', '/');

          if (userRole === 'volunteer') {
            setActiveTab('dashboard');
          } else if (userRole === 'organization') {
            setActiveTab('org_dashboard');
          } else if (userRole === 'admin') {
            setActiveTab('admin_dashboard');
          }
          return;
        }
      }

      // 2. Nếu là khách chưa đăng nhập (guest):
      if (path === '/admin/login') {
        setAdminLoginModalOpen(true);
        setLoginModalOpen(false);
        setRegisterModalOpen(false);
      } else if (path === '/login') {
        setLoginModalOpen(true);
        setAdminLoginModalOpen(false);
        setRegisterModalOpen(false);
      } else if (path === '/register') {
        setRegisterModalOpen(true);
        setLoginModalOpen(false);
        setAdminLoginModalOpen(false);
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [userRole]);

  const openUserLogin = () => {
    if (userRole !== 'guest') {
      if (userRole === 'volunteer') setActiveTab('dashboard');
      else if (userRole === 'organization') setActiveTab('org_dashboard');
      else if (userRole === 'admin') setActiveTab('admin_dashboard');
      return;
    }
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
    }
    setLoginModalOpen(true);
    setRegisterModalOpen(false);
  };

  const closeUserLogin = () => {
    setLoginModalOpen(false);
    if (window.location.pathname === '/login') {
      window.history.pushState({}, '', '/');
    }
  };

  const openUserRegister = () => {
    if (userRole !== 'guest') {
      if (userRole === 'volunteer') setActiveTab('dashboard');
      else if (userRole === 'organization') setActiveTab('org_dashboard');
      else if (userRole === 'admin') setActiveTab('admin_dashboard');
      return;
    }
    if (window.location.pathname !== '/register') {
      window.history.pushState({}, '', '/register');
    }
    setRegisterModalOpen(true);
    setLoginModalOpen(false);
  };

  const closeUserRegister = () => {
    setRegisterModalOpen(false);
    if (window.location.pathname === '/register') {
      window.history.pushState({}, '', '/');
    }
  };

  const closeAdminLogin = () => {
    setAdminLoginModalOpen(false);
    if (window.location.pathname === '/admin/login') {
      window.history.pushState({}, '', '/');
    }
  };

  // Map activeTab to subTabs in dashboards
  const getSubTab = (tab) => {
    switch (tab) {
      // Volunteer tabs
      case 'dashboard':
        return 'overview';
      case 'registrations':
        return 'my_activities';
      case 'calendar':
        return 'calendar';
      case 'history':
        return 'history_cert';
      case 'profile':
        return 'profile';
      case 'feedback':
        return 'feedback';

      // Org tabs
      case 'org_dashboard':
        return 'overview';
      case 'org_activities':
        return 'activities';
      case 'org_registrations':
        return 'registrations';
      case 'org_attendance':
        return 'attendance';
      case 'org_profile':
        return 'profile';

      // Admin tabs
      case 'admin_dashboard':
        return 'overview';
      case 'admin_approvals':
        return 'approvals';
      case 'admin_users':
        return 'users';
      case 'admin_activities':
        return 'activities';
      case 'admin_categories':
        return 'categories_locations';
      case 'admin_feedback':
        return 'feedback';
      case 'admin_settings':
        return 'settings';

      default:
        return 'overview';
    }
  };

  const handleSubTabChange = (newSubTab) => {
    if (userRole === 'volunteer') {
      const mapping = {
        overview: 'dashboard',
        my_activities: 'registrations',
        calendar: 'calendar',
        history_cert: 'history',
        profile: 'profile',
        feedback: 'feedback',
        explore: 'explore'
      };
      setActiveTab(mapping[newSubTab] || 'dashboard');
    } else if (userRole === 'organization') {
      const mapping = {
        overview: 'org_dashboard',
        activities: 'org_activities',
        registrations: 'org_registrations',
        attendance: 'org_attendance',
        profile: 'org_profile'
      };
      setActiveTab(mapping[newSubTab] || 'org_dashboard');
    } else if (userRole === 'admin') {
      const mapping = {
        overview: 'admin_dashboard',
        approvals: 'admin_approvals',
        users: 'admin_users',
        activities: 'admin_activities',
        categories_locations: 'admin_categories',
        feedback: 'admin_feedback',
        broadcast: 'admin_broadcast',
        settings: 'admin_settings'
      };
      setActiveTab(mapping[newSubTab] || 'admin_dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      {/* 1. Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={openUserLogin}
        onOpenRegister={openUserRegister}
        onOpenCreateActivity={() => setCreateActivityModalOpen(true)}
      />

      {/* 2. Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* If user is Guest or clicks Home/Explore */}
        {userRole === 'guest' || activeTab === 'home' || activeTab === 'explore' || activeTab === 'organizations' || activeTab === 'about' ? (
          <HomeGuest
            onSelectActivity={(act) => setSelectedActivity(act)}
            onOpenRegister={openUserRegister}
            onOpenLogin={openUserLogin}
          />
        ) : userRole === 'volunteer' ? (
          <VolunteerDashboard
            activeSubTab={getSubTab(activeTab)}
            setActiveSubTab={handleSubTabChange}
            onSelectActivity={(act) => setSelectedActivity(act)}
          />
        ) : userRole === 'organization' ? (
          <OrgDashboard
            activeSubTab={getSubTab(activeTab)}
            setActiveSubTab={handleSubTabChange}
            onOpenCreateActivity={() => setCreateActivityModalOpen(true)}
            onSelectActivity={(act) => setSelectedActivity(act)}
          />
        ) : userRole === 'admin' ? (
          <AdminDashboard
            activeSubTab={getSubTab(activeTab)}
            setActiveSubTab={handleSubTabChange}
            onSelectActivity={(act) => setSelectedActivity(act)}
          />
        ) : null}
      </main>

      {/* 4. Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeUserLogin}
        onSwitchToRegister={openUserRegister}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={closeUserRegister}
        onSwitchToLogin={openUserLogin}
      />

      <OrgCreateActivityModal
        isOpen={createActivityModalOpen}
        onClose={() => setCreateActivityModalOpen(false)}
      />

      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onOpenLogin={() => {
          setSelectedActivity(null);
          openUserLogin();
        }}
      />

      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={closeAdminLogin}
      />

      {/* 5. Toasts Container */}
      <ToastContainer />

      {/* 6. Footer (Không còn nút Admin ở footer để đảm bảo an toàn) */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
