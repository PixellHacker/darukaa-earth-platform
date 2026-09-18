import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MapViewer from './components/MapViewer';
import AnalyticsPanel from './components/AnalyticsPanel';
import ProjectModal from './components/ProjectModal';
import SiteModal from './components/SiteModal';
import AuthModal from './components/AuthModal';
import { projectService, siteService, analyticsService, authService } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [summary, setSummary] = useState(null);
  
  // UI states
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initial load
  useEffect(() => {
    // Check saved user
    const savedUser = authService.getStoredUser();
    if (savedUser) setUser(savedUser);

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projs, stats] = await Promise.all([
        projectService.getProjects(),
        analyticsService.getPlatformSummary()
      ]);
      setProjects(projs);
      setSummary(stats);

      // Flatten all sites with biome type info
      const sitesList = [];
      projs.forEach((p) => {
        if (p.sites) {
          p.sites.forEach((s) => {
            sitesList.push({
              ...s,
              biome_type: p.biome_type,
              project_title: p.title
            });
          });
        }
      });
      setAllSites(sitesList);

      // Default select first site if available and none selected
      if (sitesList.length > 0 && !selectedSite) {
        setSelectedSite(sitesList[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleSelectSite = (site) => {
    setSelectedSite(site);
  };

  const handleToggleDrawingMode = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setDrawingMode((prev) => !prev);
  };

  const handleCompleteDrawing = (polygonCoords) => {
    setDrawingMode(false);
    setDrawnPolygon(polygonCoords);
    setIsSiteModalOpen(true);
  };

  const handleCancelDrawing = () => {
    setDrawingMode(false);
    setDrawnPolygon(null);
  };

  const handleSiteCreated = (newSite) => {
    loadDashboardData();
    setSelectedSite(newSite);
  };

  const handleProjectCreated = (newProj) => {
    loadDashboardData();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNewProject={() => {
          if (!user) {
            setIsAuthModalOpen(true);
          } else {
            setIsProjectModalOpen(true);
          }
        }}
        summary={summary}
        drawingMode={drawingMode}
        onToggleDrawingMode={handleToggleDrawingMode}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Sidebar
          projects={projects}
          selectedSite={selectedSite}
          onSelectSite={handleSelectSite}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Central Map Canvas */}
        <main style={{ flex: 1, position: 'relative', height: '100%' }}>
          <MapViewer
            sites={allSites}
            selectedSite={selectedSite}
            onSelectSite={handleSelectSite}
            drawingMode={drawingMode}
            onCompleteDrawing={handleCompleteDrawing}
            onCancelDrawing={handleCancelDrawing}
          />
        </main>

        {/* Right Analytics Drawer */}
        {selectedSite && (
          <AnalyticsPanel
            site={selectedSite}
            onClose={() => setSelectedSite(null)}
          />
        )}
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <SiteModal
        isOpen={isSiteModalOpen}
        onClose={() => {
          setIsSiteModalOpen(false);
          setDrawnPolygon(null);
        }}
        polygonCoordinates={drawnPolygon}
        projects={projects}
        onSiteCreated={handleSiteCreated}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
