import React, { useState } from 'react';
import { 
  FolderTree, 
  MapPin, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Filter, 
  Compass, 
  ChevronLeft,
  ChevronRightSquare
} from 'lucide-react';

export default function Sidebar({
  projects = [],
  selectedSite,
  onSelectSite,
  isOpen,
  onToggle
}) {
  const [search, setSearch] = useState('');
  const [selectedBiome, setSelectedBiome] = useState('All');
  const [expandedProjects, setExpandedProjects] = useState({});

  const toggleExpand = (projectId) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Filter projects & sites
  const filteredProjects = projects.filter((p) => {
    const matchesBiome = selectedBiome === 'All' || p.biome_type === selectedBiome;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sites?.some((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    return matchesBiome && matchesSearch;
  });

  return (
    <div style={{
      position: 'relative',
      height: 'calc(100vh - 68px)',
      display: 'flex',
      zIndex: 40
    }}>
      {/* Sidebar Content */}
      <aside style={{
        width: isOpen ? '340px' : '0px',
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'rgba(10, 16, 14, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: isOpen ? '1px solid var(--border-color)' : 'none',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ width: '340px', padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderTree size={18} color="#10b981" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f0fdf4' }}>
                Projects & Sites
              </h3>
            </div>
            <span style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              color: '#94a3b8'
            }}>
              {projects.length} Active
            </span>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search projects or sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', fontSize: '0.82rem', padding: '8px 12px 8px 36px' }}
            />
          </div>

          {/* Biome Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
            {['All', 'Afforestation', 'Mangrove', 'Peatland'].map((biome) => (
              <button
                key={biome}
                onClick={() => setSelectedBiome(biome)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedBiome === biome ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedBiome === biome ? '#ffffff' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                {biome}
              </button>
            ))}
          </div>

          {/* Project & Sites Tree List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.82rem' }}>
                No projects found matching query.
              </div>
            ) : (
              filteredProjects.map((project) => {
                const isExpanded = expandedProjects[project.id] !== false; // default open
                return (
                  <div key={project.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                    {/* Project Row */}
                    <div
                      onClick={() => toggleExpand(project.id)}
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isExpanded ? <ChevronDown size={16} color="#94a3b8" /> : <ChevronRight size={16} color="#94a3b8" />}
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0fdf4' }}>
                            {project.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {project.biome_type} • {project.sites?.length || 0} sites
                          </div>
                        </div>
                      </div>
                      <span className={`badge badge-${project.biome_type?.toLowerCase() || 'afforestation'}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Nested Sites */}
                    {isExpanded && project.sites && (
                      <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '6px 8px' }}>
                        {project.sites.length === 0 ? (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', padding: '6px 10px' }}>
                            No sites yet. Use "Draw New Site" on map.
                          </div>
                        ) : (
                          project.sites.map((site) => {
                            const isSelected = selectedSite?.id === site.id;
                            return (
                              <div
                                key={site.id}
                                onClick={() => onSelectSite(site)}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                                  border: isSelected ? '1px solid #10b981' : '1px solid transparent',
                                  margin: '2px 0',
                                  transition: 'all 0.15s'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <MapPin size={14} color={isSelected ? '#34d399' : '#64748b'} />
                                  <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#f0fdf4' : '#cbd5e1' }}>
                                    {site.name}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                                  {site.area_hectares} ha
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '18px',
          left: isOpen ? '340px' : '0px',
          zIndex: 42,
          background: 'rgba(10, 16, 14, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-color)',
          borderLeft: 'none',
          borderRadius: '0 8px 8px 0',
          color: '#94a3b8',
          padding: '8px 4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}
