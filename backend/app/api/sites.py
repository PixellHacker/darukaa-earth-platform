import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Project, Site, SiteAnalytics, User
from app.schemas.schemas import SiteCreate, SiteResponse
from app.utils.geo import calculate_polygon_area_hectares
from app.api.auth import get_current_user
from app.api.projects import format_site_response

router = APIRouter(tags=["Sites & Geospatial"])

def generate_site_analytics(site_id: int, area_ha: float, baseline_carbon: float, db: Session):
    """Generate realistic 12-month historical & monitoring time-series for a site."""
    now = datetime.utcnow()
    # Baseline growth trend
    current_cum_carbon = baseline_carbon * area_ha * 0.75
    
    for i in range(12, -1, -1):
        record_date = now - timedelta(days=i * 30)
        # Seasonal sinusoidal variation for NDVI
        seasonal = 0.08 * (1.0 if (record_date.month in [6, 7, 8, 9]) else -0.5)
        ndvi = min(0.92, max(0.35, 0.62 + (12 - i) * 0.015 + seasonal))
        
        annual_rate = round(area_ha * (4.2 + ndvi * 3.5), 2)
        current_cum_carbon += round(annual_rate / 12, 2)
        canopy = min(95.0, round(45.0 + (12 - i) * 1.8 + ndvi * 10, 1))
        biodiversity = min(4.8, round(2.8 + (12 - i) * 0.12 + (ndvi - 0.5), 2))
        soil_carbon = round(38.0 + (12 - i) * 0.9, 1)

        analytic = SiteAnalytics(
            site_id=site_id,
            record_date=record_date,
            ndvi_value=round(ndvi, 3),
            carbon_sequestration_rate=annual_rate,
            cumulative_carbon=round(current_cum_carbon, 2),
            canopy_cover_percent=canopy,
            biodiversity_shannon_index=biodiversity,
            soil_organic_carbon=soil_carbon
        )
        db.add(analytic)
    db.commit()

@router.post("/projects/{project_id}/sites", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site_for_project(
    project_id: int,
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Calculate actual area in hectares from the drawn polygon
    area_ha = calculate_polygon_area_hectares(site_in.geometry)
    
    geom_str = json.dumps(site_in.geometry)

    site = Site(
        project_id=project.id,
        name=site_in.name,
        description=site_in.description or f"Restoration zone in {project.title}",
        area_hectares=area_ha,
        baseline_carbon_density=site_in.baseline_carbon_density or 120.0,
        biodiversity_status=site_in.biodiversity_status or "High",
        geometry=geom_str
    )
    db.add(site)
    db.commit()
    db.refresh(site)

    # Automatically generate analytics for visualization
    generate_site_analytics(site.id, area_ha, site.baseline_carbon_density, db)
    db.refresh(site)

    return format_site_response(site)

@router.get("/sites", response_model=List[SiteResponse])
def get_all_sites(db: Session = Depends(get_db)):
    sites = db.query(Site).all()
    return [format_site_response(s) for s in sites]

@router.get("/sites/{site_id}", response_model=SiteResponse)
def get_site(site_id: int, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return format_site_response(site)

@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(site_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(site)
    db.commit()
    return None

@router.get("/geospatial/geojson")
def get_sites_geojson(db: Session = Depends(get_db)):
    """Return all sites as a GeoJSON FeatureCollection for Mapbox GL / MapLibre layers."""
    sites = db.query(Site).all()
    features = []

    for site in sites:
        try:
            geom = json.loads(site.geometry) if isinstance(site.geometry, str) else site.geometry
            if geom.get("type") == "Feature":
                geom = geom.get("geometry")
        except Exception:
            continue

        latest_analytic = site.analytics[-1] if site.analytics else None

        features.append({
            "type": "Feature",
            "id": site.id,
            "geometry": geom,
            "properties": {
                "id": site.id,
                "project_id": site.project_id,
                "name": site.name,
                "project_name": site.project.title if site.project else "Unknown",
                "area_hectares": site.area_hectares,
                "biodiversity_status": site.biodiversity_status,
                "biome_type": site.project.biome_type if site.project else "General",
                "latest_ndvi": round(latest_analytic.ndvi_value, 3) if latest_analytic else 0.72,
                "total_carbon": round(site.area_hectares * site.baseline_carbon_density, 2)
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }
