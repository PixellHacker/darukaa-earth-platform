import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Project, Site, User
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, SiteResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

def format_site_response(site: Site) -> dict:
    try:
        geom = json.loads(site.geometry) if isinstance(site.geometry, str) else site.geometry
    except Exception:
        geom = {"type": "Polygon", "coordinates": []}
    
    # Calculate carbon and ndvi
    total_carbon = round(site.area_hectares * site.baseline_carbon_density, 2)
    latest_analytic = site.analytics[-1] if site.analytics else None
    latest_ndvi = round(latest_analytic.ndvi_value, 3) if latest_analytic else 0.72

    return {
        "id": site.id,
        "project_id": site.project_id,
        "name": site.name,
        "description": site.description or "",
        "area_hectares": site.area_hectares,
        "baseline_carbon_density": site.baseline_carbon_density,
        "biodiversity_status": site.biodiversity_status,
        "geometry": geom,
        "created_at": site.created_at,
        "latest_ndvi": latest_ndvi,
        "total_carbon_seq": total_carbon
    }

def format_project_response(proj: Project) -> dict:
    formatted_sites = [format_site_response(s) for s in proj.sites]
    total_area = sum(s["area_hectares"] for s in formatted_sites)
    total_carbon = sum(s["total_carbon_seq"] for s in formatted_sites)

    return {
        "id": proj.id,
        "title": proj.title,
        "description": proj.description or "",
        "biome_type": proj.biome_type,
        "target_carbon_credits": proj.target_carbon_credits,
        "status": proj.status,
        "created_at": proj.created_at,
        "updated_at": proj.updated_at,
        "sites_count": len(formatted_sites),
        "total_area_hectares": round(total_area, 2),
        "total_carbon_accumulated": round(total_carbon, 2),
        "sites": formatted_sites
    }

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [format_project_response(p) for p in projects]

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    proj_in: ProjectCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    project = Project(
        title=proj_in.title,
        description=proj_in.description,
        biome_type=proj_in.biome_type or "Afforestation",
        target_carbon_credits=proj_in.target_carbon_credits or 10000.0,
        status=proj_in.status or "Active",
        created_by_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return format_project_response(project)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return format_project_response(project)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int, 
    proj_in: ProjectUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = proj_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(project, field, val)

    db.commit()
    db.refresh(project)
    return format_project_response(project)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None
