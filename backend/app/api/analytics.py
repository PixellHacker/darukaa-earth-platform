from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Site, SiteAnalytics, Project
from app.schemas.schemas import AnalyticsPoint

router = APIRouter(prefix="/analytics", tags=["Analytics & Visualizations"])

@router.get("/sites/{site_id}", response_model=List[AnalyticsPoint])
def get_site_analytics(site_id: int, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    records = db.query(SiteAnalytics)\
                .filter(SiteAnalytics.site_id == site_id)\
                .order_by(SiteAnalytics.record_date.asc())\
                .all()
    return records

@router.get("/platform-summary")
def get_platform_summary(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    total_sites = db.query(Site).count()
    
    total_area = db.query(func.sum(Site.area_hectares)).scalar() or 0.0
    
    # Calculate total carbon
    sites = db.query(Site).all()
    total_carbon = sum(s.area_hectares * s.baseline_carbon_density for s in sites)

    # Average NDVI from latest records
    recent_analytics = db.query(SiteAnalytics.ndvi_value).order_by(SiteAnalytics.id.desc()).limit(20).all()
    avg_ndvi = sum(a[0] for a in recent_analytics) / len(recent_analytics) if recent_analytics else 0.74

    return {
        "total_projects": total_projects,
        "total_sites": total_sites,
        "total_protected_hectares": round(total_area, 2),
        "total_carbon_credits_tco2e": round(total_carbon, 2),
        "average_ndvi": round(avg_ndvi, 3),
        "active_monitoring_satellites": 4,
        "status": "Operational"
    }
