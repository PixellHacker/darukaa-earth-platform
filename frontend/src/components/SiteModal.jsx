import React, { useState } from 'react';
import { X, MapPin, CheckCircle2 } from 'lucide-react';
import { siteService } from '../services/api';

export default function SiteModal({
  isOpen,
  onClose,
  polygonCoordinates,
  projects = [],
  onSiteCreated
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baselineCarbon, setBaselineCarbon] = useState(140.0);
  const [bioStatus, setBioStatus] = useState('High');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !polygonCoordinates) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select a project for this site');
      return;
    }
    if (!name) {
      setError('Please enter a site name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const geojsonGeometry = {
        type: 'Polygon',
        coordinates: [polygonCoordinates]
      };

      const siteData = {
        name,
        description,
        baseline_carbon_density: parseFloat(baselineCarbon),
        biodiversity_status: bioStatus,
        geometry: geojsonGeometry
      };

      const created = await siteService.createSite(projectId, siteData);
      onSiteCreated(created);
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save site polygon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f0fdf4' }}>
                Save Drawn Site Boundary
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {polygonCoordinates.length - 1} vertices captured with geodetic projection.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label>Associate to Project</label>
            <select
              className="input-field"
              value={projectId || (projects[0]?.id || '')}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.biome_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Site Parcel Name</label>
            <input
              type="text"
              placeholder="e.g. Sector 4 East Canopy Zone"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Baseline Carbon Density (t/ha)</label>
              <input
                type="number"
                className="input-field"
                value={baselineCarbon}
                onChange={(e) => setBaselineCarbon(e.target.value)}
                min="10"
                step="5"
                required
              />
            </div>

            <div>
              <label>Biodiversity Status</label>
              <select
                className="input-field"
                value={bioStatus}
                onChange={(e) => setBioStatus(e.target.value)}
              >
                <option value="Critical">Critical Priority</option>
                <option value="High">High Vigor</option>
                <option value="Moderate">Moderate / Buffer</option>
              </select>
            </div>
          </div>

          <div>
            <label>Zone Description & Notes</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Ecosystem features, tree species, elevation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Calculating Area & Saving...' : 'Save Site & Generate Analytics'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
