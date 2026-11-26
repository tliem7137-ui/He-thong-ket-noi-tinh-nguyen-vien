import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
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

const getDefaultTabForRole = (role) => {
  if (role === 'admin') return 'admin_dashboard';
  if (role === 'organization') return 'org_dashboard';
  if (role === 'volunteer') return 'dashboard';
  return 'home';
};

const MainApp = () => {
  const { userRole, activities } = useApp();

  // Derive default tab automatically when role changes without cascading setState in effect
  const [tabState, setTabState] = useState(() => ({
    role: userRole,
    tab: getDefaultTabForRole(userRole)
  }));
  const activeTab = tabState.role === userRole ? tabState.tab : getDefaultTabForRole(userRole);
  const setActiveTab = useCallback(
    (tab) => {
      setTabState({ role: userRole, tab });
    },
    [userRole]
  );

  // Modals state - initialized from current URL path for guests
  const [loginModalOpen, setLoginModalOpen] = useState(
    () => userRole === 'guest' && window.location.pathname === '/login'
  );
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(
    () => userRole === 'guest' && window.location.pathname === '/admin/login'
  );
  const [registerModalOpen, setRegisterModalOpen] = useState(
    () => userRole === 'guest' && window.location.pathname === '/register'
  );
  const [createActivityModalOpen, setCreateActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const openCreateActivityModal = () => {
    setEditingActivity(null);
    setCreateActivityModalOpen(true);
  };

  const openEditActivityModal = (act) => {
    setEditingActivity(act);
    setCreateActivityModalOpen(true);
  };

  const closeActivityModal = () => {
    setCreateActivityModalOpen(false);
    setEditingActivity(null);
  };

  // Store only activity ID so modal always reflects live activity state
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const selectedActivity = activities.find((a) => a.id === selectedActivityId) || null;

  // Clean auth URLs after login & listen to browser back/forward navigation
  useEffect(() => {
    if (userRole !== 'guest') {
      const path = window.location.pathname;
      if (path === '/login' || path === '/register' || path === '/admin/login') {
        window.history.replaceState({}, '', '/');
      }
    }

    const handlePopState = () => {
      const path = window.location.pathname;
      if (userRole !== 'guest') {
        if (path === '/login' || path === '/register' || path === '/admin/login') {
          window.history.replaceState({}, '', '/');
          setLoginModalOpen(false);
          setRegisterModalOpen(false);
          setAdminLoginModalOpen(false);
          setActiveTab(getDefaultTabForRole(userRole));
        }
        return;
      }

      setAdminLoginModalOpen(path === '/admin/login');
      setLoginModalOpen(path === '/login');
      setRegisterModalOpen(path === '/register');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [userRole, setActiveTab]);

  const effectiveLoginOpen = userRole === 'guest' && loginModalOpen;
  const effectiveRegisterOpen = userRole === 'guest' && registerModalOpen;
  const effectiveAdminLoginOpen = userRole === 'guest' && adminLoginModalOpen;

  const openUserLogin = () => {
    if (userRole !== 'guest') {
      setActiveTab(getDefaultTabForRole(userRole));
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
      setActiveTab(getDefaultTabForRole(userRole));
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
      case 'admin_broadcast':
        return 'broadcast';
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

  const handleSelectActivity = (act) => {
    setSelectedActivityId(act?.id || null);
  };

  const isGuestView =
    userRole === 'guest' ||
    activeTab === 'home' ||
    activeTab === 'explore' ||
    activeTab === 'organizations' ||
    activeTab === 'about';

  return (
    <div
      className={`min-h-screen flex flex-col text-[#1c1c1c] antialiased font-sans ${
        isGuestView ? 'bg-white' : 'bg-[#f7f9f7]'
      }`}
    >
      {/* 1. Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={openUserLogin}
        onOpenRegister={openUserRegister}
        onOpenCreateActivity={openCreateActivityModal}
      />

      {/* 2. Main Body */}
      <main
        className={
          isGuestView
            ? 'flex-1 w-full'
            : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8'
        }
      >
        {isGuestView ? (
          <HomeGuest
            activeTab={activeTab}
            onSelectActivity={handleSelectActivity}
            onOpenRegister={openUserRegister}
          />
        ) : userRole === 'volunteer' ? (
          <VolunteerDashboard
            activeSubTab={getSubTab(activeTab)}
            setActiveSubTab={handleSubTabChange}
            onSelectActivity={handleSelectActivity}
          />
        ) : userRole === 'organization' ? (
          <OrgDashboard
            activeSubTab={getSubTab(activeTab)}
            setActiveSubTab={handleSubTabChange}
            onOpenCreateActivity={openCreateActivityModal}
            onEditActivity={openEditActivityModal}
            onSelectActivity={handleSelectActivity}
          />
        ) : userRole === 'admin' ? (
          <AdminDashboard
            activeSubTab={getSubTab(activeTab)}
            setActiveSubTab={handleSubTabChange}
            onSelectActivity={handleSelectActivity}
          />
        ) : null}
      </main>

      {/* 3. Modals */}
      <LoginModal
        isOpen={effectiveLoginOpen}
        onClose={closeUserLogin}
        onSwitchToRegister={openUserRegister}
      />

      <RegisterModal
        isOpen={effectiveRegisterOpen}
        onClose={closeUserRegister}
        onSwitchToLogin={openUserLogin}
      />

      <OrgCreateActivityModal
        isOpen={createActivityModalOpen}
        editingActivity={editingActivity}
        onClose={closeActivityModal}
      />

      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivityId(null)}
        onOpenLogin={() => {
          setSelectedActivityId(null);
          openUserLogin();
        }}
      />

      <AdminLoginModal
        isOpen={effectiveAdminLoginOpen}
        onClose={closeAdminLogin}
      />

      {/* 4. Toasts Container */}
      <ToastContainer />

      {/* 5. Footer */}
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
