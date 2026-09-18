from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="admin")  # admin, analyst, viewer
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="creator")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    biome_type = Column(String(100), default="Afforestation")  # Mangrove, Peatland, Afforestation, Agroforestry
    target_carbon_credits = Column(Float, default=10000.0)
    status = Column(String(50), default="Active")  # Active, Planning, Verified
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    area_hectares = Column(Float, default=0.0)
    baseline_carbon_density = Column(Float, default=120.0)  # tons CO2e / hectare
    biodiversity_status = Column(String(50), default="High")  # Critical, High, Moderate
    
    # Store GeoJSON Geometry as JSON text string (Portable across SQLite & PostGIS)
    geometry = Column(Text, nullable=False) 
    
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="sites")
    analytics = relationship("SiteAnalytics", back_populates="site", cascade="all, delete-orphan")

class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    record_date = Column(DateTime, default=datetime.utcnow)
    ndvi_value = Column(Float, nullable=False)  # Normalized Difference Vegetation Index: 0.0 - 1.0
    carbon_sequestration_rate = Column(Float, nullable=False)  # tons CO2e/year
    cumulative_carbon = Column(Float, nullable=False)  # cumulative tons CO2e
    canopy_cover_percent = Column(Float, nullable=False)  # 0 - 100%
    biodiversity_shannon_index = Column(Float, nullable=False)  # 1.0 - 5.0
    soil_organic_carbon = Column(Float, default=45.0)  # g/kg

    site = relationship("Site", back_populates="analytics")
