import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Layers, MousePointerClick, Check, X, Maximize2, Compass } from 'lucide-react';

// Free high-resolution open tile style specification that works 100% without any API key!
const OPEN_DARK_STYLE = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, © CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20
    }
  ]
};

export default function MapViewer({
  sites = [],
  selectedSite,
  onSelectSite,
  drawingMode,
  onCompleteDrawing,
  onCancelDrawing
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Mapbox map
  useEffect(() => {
    if (map.current) return;

    // Mapbox requires accessToken to be non-empty
    const token = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGFydWthYS1kZW1vIiwiYSI6ImNsc3ptdjA5eTAwMjIyanBkbnR3aGZkNXkifQ.demo_token_fallback';
    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: OPEN_DARK_STYLE, // High-res open raster tiles that never require a Mapbox key
        center: [80.0, 18.0], // Centered on South Asia / Global tropics
        zoom: 4.2,
        pitch: 20,
      });

      map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', (err) => {
        console.warn('Mapbox GL event error handled gracefully:', err);
      });
    } catch (mapError) {
      console.error('Mapbox initialization fallback triggered:', mapError);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update GeoJSON layers for existing sites
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const geojsonData = {
      type: 'FeatureCollection',
      features: sites.map((s) => {
        let geom = s.geometry;
        if (typeof geom === 'string') {
          try { geom = JSON.parse(geom); } catch (e) { geom = { type: 'Polygon', coordinates: [] }; }
        }
        if (geom.type === 'Feature') geom = geom.geometry;

        return {
          type: 'Feature',
          id: s.id,
          properties: {
            id: s.id,
            name: s.name,
            area_hectares: s.area_hectares,
            biome_type: s.biome_type || 'Afforestation',
            latest_ndvi: s.latest_ndvi || 0.75,
            total_carbon: s.total_carbon_seq || 0
          },
          geometry: geom
        };
      })
    };

    // If source exists, update data; else create
    if (map.current.getSource('sites-data')) {
      map.current.getSource('sites-data').setData(geojsonData);
    } else {
      map.current.addSource('sites-data', {
        type: 'geojson',
        data: geojsonData
      });

      // Polygon fill layer
      map.current.addLayer({
        id: 'sites-fill',
        type: 'fill',
        source: 'sites-data',
        paint: {
          'fill-color': [
            'match',
            ['get', 'biome_type'],
            'Mangrove', '#06b6d4',
            'Peatland', '#f59e0b',
            'Afforestation', '#10b981',
            '#10b981' // default emerald
          ],
          'fill-opacity': 0.45
        }
      });

      // Polygon boundary stroke with neon effect
      map.current.addLayer({
        id: 'sites-stroke',
        type: 'line',
        source: 'sites-data',
        paint: {
          'line-color': [
            'match',
            ['get', 'biome_type'],
            'Mangrove', '#38bdf8',
            'Peatland', '#fbbf24',
            'Afforestation', '#34d399',
            '#34d399'
          ],
          'line-width': 2.5,
          'line-opacity': 0.9
        }
      });

      // Click on polygon site
      map.current.on('click', 'sites-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const siteId = e.features[0].properties.id;
          const found = sites.find((s) => s.id === siteId);
          if (found) onSelectSite(found);
        }
      });

      // Cursor change on hover
      map.current.on('mouseenter', 'sites-fill', () => {
        if (!drawingMode && map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'sites-fill', () => {
        if (!drawingMode && map.current) map.current.getCanvas().style.cursor = '';
      });
    }
  }, [sites, mapLoaded]);

  // Fly to selected site
  useEffect(() => {
    if (!map.current || !selectedSite || !mapLoaded) return;
    try {
      let geom = selectedSite.geometry;
      if (typeof geom === 'string') geom = JSON.parse(geom);
      if (geom.type === 'Feature') geom = geom.geometry;

      const coords = geom.coordinates ? geom.coordinates[0] : null;
      if (coords && coords.length > 0) {
        const center = coords[0];
        map.current.flyTo({
          center: [center[0], center[1]],
          zoom: 11,
          duration: 1800,
          essential: true
        });
      }
    } catch (e) {
      console.error('Fly to error:', e);
    }
  }, [selectedSite, mapLoaded]);

  // Handle Interactive Drawing Click
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleMapClick = (e) => {
      if (!drawingMode) return;
      const newPoint = [parseFloat(e.lngLat.lng.toFixed(5)), parseFloat(e.lngLat.lat.toFixed(5))];
      setDrawingPoints((prev) => [...prev, newPoint]);
    };

    if (drawingMode) {
      map.current.getCanvas().style.cursor = 'crosshair';
      map.current.on('click', handleMapClick);
    } else {
      map.current.getCanvas().style.cursor = '';
      setDrawingPoints([]);
    }

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [drawingMode, mapLoaded]);

  // Render Drawing polygon preview
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const drawingGeoJSON = {
      type: 'FeatureCollection',
      features: []
    };

    if (drawingPoints.length >= 3) {
      drawingGeoJSON.features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...drawingPoints, drawingPoints[0]]]
        }
      });
    } else if (drawingPoints.length >= 2) {
      drawingGeoJSON.features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: drawingPoints
        }
      });
    }

    if (map.current.getSource('drawing-source')) {
      map.current.getSource('drawing-source').setData(drawingGeoJSON);
    } else {
      map.current.addSource('drawing-source', {
        type: 'geojson',
        data: drawingGeoJSON
      });

      map.current.addLayer({
        id: 'drawing-fill',
        type: 'fill',
        source: 'drawing-source',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.35
        }
      });

      map.current.addLayer({
        id: 'drawing-stroke',
        type: 'line',
        source: 'drawing-source',
        paint: {
          'line-color': '#34d399',
          'line-width': 2.5,
          'line-dasharray': [2, 2]
        }
      });
    }
  }, [drawingPoints, mapLoaded]);

  const finishDrawing = () => {
    if (drawingPoints.length < 3) {
      alert('Please click at least 3 points on the map to define a polygon site.');
      return;
    }
    // Close polygon
    const closed = [...drawingPoints, drawingPoints[0]];
    onCompleteDrawing(closed);
    setDrawingPoints([]);
  };

  const cancelDrawing = () => {
    setDrawingPoints([]);
    onCancelDrawing();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Map Container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Drawing Mode Banner & Controls */}
      {drawingMode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 18, 15, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid #10b981',
          borderRadius: '16px',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.3)',
          zIndex: 40,
          animation: 'slideUp 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0fdf4' }}>
              Polygon Tool: <span style={{ color: '#34d399' }}>Click anywhere on map to add vertices</span>
            </div>
            <span style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}>
              {drawingPoints.length} vertices
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={finishDrawing}
              disabled={drawingPoints.length < 3}
              className="btn-primary"
              style={{
                padding: '7px 14px',
                fontSize: '0.8rem',
                opacity: drawingPoints.length < 3 ? 0.5 : 1
              }}
            >
              <Check size={14} />
              Complete Site Polygon
            </button>
            <button
              onClick={cancelDrawing}
              className="btn-danger"
              style={{ padding: '7px 12px', fontSize: '0.8rem' }}
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        background: 'rgba(10, 16, 14, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        zIndex: 30,
        fontSize: '0.75rem',
        color: '#e2e8f0'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Biome Classifications
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }} />
            <span>Afforestation / Cloud Forest</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#06b6d4' }} />
            <span>Mangrove / Blue Carbon</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f59e0b' }} />
            <span>Peatland Rewetting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
