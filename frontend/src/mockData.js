// Comprehensive fallback data ensuring 100% functionality on live web deployments
export const FALLBACK_PROJECTS = [
  {
    id: 'p1',
    title: 'Western Ghats Cloud Forest Corridor',
    description: 'Rewilding endemic evergreen montane rainforests and indigenous agroforestry buffer zones in a global biodiversity hotspot.',
    biome_type: 'Afforestation',
    target_carbon_credits: 40000.0,
    status: 'Active',
    sites: [
      {
        id: 's1',
        project_id: 'p1',
        name: 'Silent Valley Core Catchment',
        description: 'Continuous moist deciduous and evergreen canopy with native Dipterocarpus trees.',
        baseline_carbon_density: 160.0,
        area_hectares: 16054.21,
        total_carbon_seq: 2568673.6,
        latest_ndvi: 0.88,
        biodiversity_status: 'Critical',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [76.40, 11.08],
              [76.52, 11.12],
              [76.55, 11.02],
              [76.43, 10.98],
              [76.40, 11.08]
            ]
          ]
        }
      },
      {
        id: 's2',
        project_id: 'p1',
        name: 'Attappadi Agroforestry Buffer',
        description: 'Community shade-grown coffee and multipurpose native timber restoration.',
        baseline_carbon_density: 115.0,
        area_hectares: 14172.19,
        total_carbon_seq: 1629801.8,
        latest_ndvi: 0.76,
        biodiversity_status: 'High',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [76.62, 11.02],
              [76.72, 11.05],
              [76.74, 10.95],
              [76.61, 10.92],
              [76.62, 11.02]
            ]
          ]
        }
      }
    ]
  },
  {
    id: 'p2',
    title: 'Sundarbans Mangrove Blue Carbon Reserve',
    description: 'Restoration of tidal halophytic mangrove ecosystems to maximize blue carbon sequestration and protect coastal communities.',
    biome_type: 'Mangrove',
    target_carbon_credits: 25000.0,
    status: 'Active',
    sites: [
      {
        id: 's3',
        project_id: 'p2',
        name: 'Matla River Estuary Zone A',
        description: 'Rhizophora mucronata and Avicennia marina restoration belt along the tidal flats.',
        baseline_carbon_density: 210.0,
        area_hectares: 13222.01,
        total_carbon_seq: 2776622.1,
        latest_ndvi: 0.82,
        biodiversity_status: 'Critical',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [88.62, 21.95],
              [88.75, 21.95],
              [88.78, 21.88],
              [88.65, 21.85],
              [88.62, 21.95]
            ]
          ]
        }
      },
      {
        id: 's4',
        project_id: 'p2',
        name: 'Gosaba Island Mangrove Fringe',
        description: 'High-density seedling nurseries and coastal mudflat replanting zone.',
        baseline_carbon_density: 185.0,
        area_hectares: 8551.71,
        total_carbon_seq: 1582066.4,
        latest_ndvi: 0.79,
        biodiversity_status: 'High',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [88.79, 22.15],
              [88.89, 22.18],
              [88.92, 22.11],
              [88.81, 22.09],
              [88.79, 22.15]
            ]
          ]
        }
      }
    ]
  },
  {
    id: 'p3',
    title: 'Cairngorms Peatland Rewetting Sanctuary',
    description: 'Restoration of degraded blanket bogs through ditch blocking, sphagnum moss reintroduction, and emissions avoidance.',
    biome_type: 'Peatland',
    target_carbon_credits: 15000.0,
    status: 'Verified',
    sites: [
      {
        id: 's5',
        project_id: 'p3',
        name: 'Glen Feshie Upper Moorlands',
        description: 'Sphagnum rewetting zone preventing methane and carbon oxidization.',
        baseline_carbon_density: 280.0,
        area_hectares: 7524.49,
        total_carbon_seq: 2106857.2,
        latest_ndvi: 0.48,
        biodiversity_status: 'Moderate',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-3.85, 57.02],
              [-3.72, 57.06],
              [-3.68, 56.98],
              [-3.81, 56.95],
              [-3.85, 57.02]
            ]
          ]
        }
      }
    ]
  }
];

export const FALLBACK_SUMMARY = {
  total_projects: 3,
  total_sites: 5,
  total_protected_area_ha: 59524.61,
  total_carbon_stock_tco2e: 10664021.1,
  avg_ndvi: 0.74,
  biomes_count: {
    Afforestation: 2,
    Mangrove: 2,
    Peatland: 1
  }
};

// Generate realistic time-series analytics records for any site
export const generateFallbackAnalytics = (siteId) => {
  const dates = [
    '2025-09-01', '2025-11-01', '2026-01-01', '2026-03-01', 
    '2026-05-01', '2026-07-01', '2026-09-01'
  ];
  
  const baseNdvi = siteId === 's5' ? 0.42 : siteId === 's3' || siteId === 's4' ? 0.78 : 0.84;
  const baseCanopy = siteId === 's5' ? 25.0 : siteId === 's3' || siteId === 's4' ? 82.0 : 88.0;
  const baseCarbon = siteId === 's1' ? 2400000 : siteId === 's2' ? 1500000 : siteId === 's3' ? 2600000 : siteId === 's4' ? 1480000 : 2000000;

  return dates.map((dt, idx) => ({
    id: `ts-${siteId}-${idx}`,
    site_id: siteId,
    record_date: dt,
    ndvi_value: parseFloat((baseNdvi + (idx * 0.012)).toFixed(2)),
    canopy_cover_percentage: parseFloat((baseCanopy + (idx * 0.8)).toFixed(1)),
    carbon_sequestration_rate: parseFloat((18500 + idx * 850).toFixed(1)),
    cumulative_carbon: parseFloat((baseCarbon + (idx * 28000)).toFixed(1)),
    biodiversity_index: parseFloat((0.82 + idx * 0.015).toFixed(2))
  }));
};
