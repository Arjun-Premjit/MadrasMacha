import React, { useState, useEffect } from 'react';
import { useTransitData } from './hooks/useTransitData';
import { Header, PageView } from './components/Header';
import { EditorialHome } from './components/EditorialHome';
import { RoutesPage } from './components/pages/RoutesPage';
import { RouteDetailPage } from './components/pages/RouteDetailPage';
import { StopsPage } from './components/pages/StopsPage';
import { StopDetailPage } from './components/pages/StopDetailPage';
import { MtcPage } from './components/pages/MtcPage';
import { MetroPage } from './components/pages/MetroPage';
import { FareCalculatorPage } from './components/pages/FareCalculatorPage';
import { AboutPage } from './components/pages/AboutPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsPage } from './components/pages/TermsPage';
import { TestPage } from './components/pages/TestPage';
import { LoginPage, AuthUser } from './components/pages/LoginPage';
import { Footer } from './components/Footer';

export default function App() {
  const transitData = useTransitData();
  const {
    routes,
    stops,
    loading,
  } = transitData;

  const [currentPage, setCurrentPage] = useState<PageView>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Validate active session token on application load
  useEffect(() => {
    const token = localStorage.getItem('mm_session_token');
    if (!token) {
      setIsAuthChecking(false);
      setCurrentPage('login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setCurrentPage('home');
        } else {
          localStorage.removeItem('mm_session_token');
          setCurrentUser(null);
          setCurrentPage('login');
        }
      })
      .catch(() => {
        setCurrentPage('login');
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  // Secure navigation: Unauthenticated users are strictly held on the login page
  const handleNavigate = (page: PageView) => {
    if (!currentUser && page !== 'login') {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('mm_session_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem('mm_session_token');
    setCurrentUser(null);
    setCurrentPage('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRouteById = (routeId: string) => {
    setSelectedRouteId(routeId);
    handleNavigate('route-detail');
  };

  const handleSelectStopById = (stopId: string) => {
    setSelectedStopId(stopId);
    handleNavigate('stop-detail');
  };

  // Listen for Escape key to close navigation overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white text-xs font-black flex items-center justify-center animate-pulse">
            MM
          </div>
          <span className="text-xs font-semibold text-neutral-600">
            Validating security session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black selection:bg-black selection:text-white antialiased flex flex-col justify-between font-sans">
      {/* Floating Glassmorphism Header with Integrated Search (active on transit pages) */}
      {currentPage !== 'login' && currentUser && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onSelectRouteId={handleSelectRouteById}
          onSelectRoute={(route) => handleSelectRouteById(route.route_id)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Main Page View Routing */}
      <main className="flex-1">
        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={(token, user) => {
              setCurrentUser(user);
              handleNavigate('home');
            }}
          />
        )}

        {currentPage === 'home' && (
          <EditorialHome
            onNavigate={handleNavigate}
            onSelectRoute={handleSelectRouteById}
            onSelectStop={handleSelectStopById}
          />
        )}

        {currentPage === 'routes' && (
          <RoutesPage
            onSelectRoute={handleSelectRouteById}
          />
        )}

        {currentPage === 'route-detail' && (
          <RouteDetailPage
            routeId={selectedRouteId || '18751'}
            initialStopId={selectedStopId || undefined}
            onBack={() => handleNavigate('routes')}
            onSelectStop={handleSelectStopById}
          />
        )}

        {currentPage === 'stops' && (
          <StopsPage
            onSelectStop={handleSelectStopById}
            onSelectRouteById={handleSelectRouteById}
          />
        )}

        {currentPage === 'stop-detail' && (
          <StopDetailPage
            stopId={selectedStopId || 'CMRL_01'}
            onBack={() => handleNavigate('stops')}
            onSelectRoute={handleSelectRouteById}
          />
        )}

        {currentPage === 'mtc' && (
          <MtcPage
            routes={routes}
            onSelectRoute={(route) => handleSelectRouteById(route.route_id)}
          />
        )}

        {currentPage === 'metro' && (
          <MetroPage
            routes={routes}
            onSelectRoute={(route) => handleSelectRouteById(route.route_id)}
            onSelectStop={(stop) => handleSelectStopById(stop.stop_id)}
          />
        )}

        {currentPage === 'fare' && (
          <FareCalculatorPage onBack={() => handleNavigate('home')} />
        )}

        {currentPage === 'about' && (
          <AboutPage />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPolicyPage onBack={() => handleNavigate('home')} />
        )}

        {currentPage === 'terms' && (
          <TermsPage onBack={() => handleNavigate('home')} />
        )}

        {currentPage === 'test' && (
          <TestPage onBack={() => handleNavigate('home')} />
        )}
      </main>

      {/* MadrasMacha Footer on subpages */}
      {currentPage !== 'home' && currentPage !== 'login' && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}
