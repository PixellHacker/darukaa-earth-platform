import React, { useState } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import { projectService } from '../services/api';

export default function ProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [biomeType, setBiomeType] = useState('Afforestation');
  const [targetCredits, setTargetCredits] = useState(15000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      setError('Please provide a project title');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await projectService.createProject({
        title,
        description,
        biome_type: biomeType,
        target_carbon_credits: parseFloat(targetCredits),
        status: 'Active'
      });
      onProjectCreated(created);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
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
              <FolderPlus size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f0fdf4' }}>
                Initiate New Project
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Define project boundaries, carbon targets, and restoration biome.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Project Title</label>
            <input
              type="text"
              placeholder="e.g. Amazonian High-Canopy Corridor"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Restoration Biome</label>
            <select
              className="input-field"
              value={biomeType}
              onChange={(e) => setBiomeType(e.target.value)}
            >
              <option value="Afforestation">Afforestation / Tropical Rainforest</option>
              <option value="Mangrove">Mangrove / Blue Carbon Reserve</option>
              <option value="Peatland">Peatland / Blanket Bog Rewetting</option>
              <option value="Agroforestry">Agroforestry & Soil Regeneration</option>
            </select>
          </div>

          <div>
            <label>Target Carbon Credits (tCO₂e)</label>
            <input
              type="number"
              className="input-field"
              value={targetCredits}
              onChange={(e) => setTargetCredits(e.target.value)}
              min="100"
              step="100"
              required
            />
          </div>

          <div>
            <label>Description & Objectives</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Detail the geographic scope, local community involvement, and biodiversity baseline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Registering...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
