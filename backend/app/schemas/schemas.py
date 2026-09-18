from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: str
    role: Optional[str] = "admin"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

# Analytics Schemas
class AnalyticsPoint(BaseModel):
    record_date: datetime
    ndvi_value: float
    carbon_sequestration_rate: float
    cumulative_carbon: float
    canopy_cover_percent: float
    biodiversity_shannon_index: float
    soil_organic_carbon: float

    class Config:
        from_attributes = True

# Site Schemas
class SiteBase(BaseModel):
    name: str
    description: Optional[str] = ""
    baseline_carbon_density: Optional[float] = 120.0
    biodiversity_status: Optional[str] = "High"

class SiteCreate(SiteBase):
    geometry: Dict[str, Any]  # GeoJSON Geometry object (Polygon / MultiPolygon) or Feature

class SiteResponse(SiteBase):
    id: int
    project_id: int
    area_hectares: float
    geometry: Dict[str, Any]
    created_at: datetime
    latest_ndvi: Optional[float] = 0.72
    total_carbon_seq: Optional[float] = 0.0

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = ""
    biome_type: Optional[str] = "Afforestation"
    target_carbon_credits: Optional[float] = 10000.0
    status: Optional[str] = "Active"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    biome_type: Optional[str] = None
    target_carbon_credits: Optional[float] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    sites_count: int = 0
    total_area_hectares: float = 0.0
    total_carbon_accumulated: float = 0.0
    sites: List[SiteResponse] = []

    class Config:
        from_attributes = True
