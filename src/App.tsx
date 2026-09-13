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
import { AboutPage } from './components/pages/AboutPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsPage } from './components/pages/TermsPage';
import { TestPage } from './components/pages/TestPage';
import { Footer } from './components/Footer';

export default function App() {
  const transitData = useTransitData();
  const {
    routes,
    stops,
    loading,
  } = transitData;

  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Scroll to top when changing pages
  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black selection:bg-black selection:text-white antialiased flex flex-col justify-between font-sans">
      {/* Floating Glassmorphism Header with Integrated Search */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onSelectRouteId={handleSelectRouteById}
        onSelectRoute={(route) => handleSelectRouteById(route.route_id)}
      />

      {/* Main Page View Routing */}
      <main className="flex-1">
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
          />
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
      {currentPage !== 'home' && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}
