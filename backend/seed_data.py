import json
from datetime import datetime, timedelta
from app.database import engine, Base, SessionLocal
from app.models.models import User, Project, Site, SiteAnalytics
from app.security import get_password_hash
from app.api.sites import generate_site_analytics
from app.utils.geo import calculate_polygon_area_hectares

def seed():
    print("Initializing Database & Seeding Data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Seed Users
    admin_users = [
        ("admin@darukaa.earth", "Darukaa Admin", "AdminPass123!", "admin"),
        ("ankita.dasgupta@darukaa.com", "Ankita Dasgupta", "DarukaaPass2026!", "admin"),
        ("harsh.kumar@darukaa.com", "Harsh Kumar", "DarukaaPass2026!", "admin"),
        ("utkarsh.gauniyal@darukaa.com", "Utkarsh Gauniyal", "DarukaaPass2026!", "admin"),
        ("guneet.mutreja@darukaa.com", "Guneet Mutreja", "DarukaaPass2026!", "admin"),
    ]

    primary_admin = None
    for email, name, pwd, role in admin_users:
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            u = User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash(pwd),
                role=role
            )
            db.add(u)
            db.commit()
            db.refresh(u)
            if email == "admin@darukaa.earth":
                primary_admin = u
        else:
            if email == "admin@darukaa.earth":
                primary_admin = existing

    # Check if projects already exist
    if db.query(Project).count() > 0:
        print("Data already seeded.")
        db.close()
        return

    # 2. Seed Projects & Sites
    sample_projects = [
        {
            "title": "Sundarbans Mangrove Blue Carbon Reserve",
            "description": "Restoration of tidal halophytic mangrove ecosystems to maximize blue carbon sequestration and protect coastal communities.",
            "biome_type": "Mangrove",
            "target_carbon_credits": 25000.0,
            "status": "Active",
            "sites": [
                {
                    "name": "Matla River Estuary Zone A",
                    "description": "Rhizophora mucronata and Avicennia marina restoration belt along the tidal flats.",
                    "baseline_carbon_density": 210.0,
                    "biodiversity_status": "Critical",
                    "coordinates": [
                        [88.62, 21.95],
                        [88.75, 21.95],
                        [88.78, 21.88],
                        [88.65, 21.85],
                        [88.62, 21.95]
                    ]
                },
                {
                    "name": "Gosaba Island Mangrove Fringe",
                    "description": "High-density seedling nurseries and coastal mudflat replanting zone.",
                    "baseline_carbon_density": 185.0,
                    "biodiversity_status": "High",
                    "coordinates": [
                        [88.79, 22.15],
                        [88.89, 22.18],
                        [88.92, 22.11],
                        [88.81, 22.09],
                        [88.79, 22.15]
                    ]
                }
            ]
        },
        {
            "title": "Western Ghats Cloud Forest Corridor",
            "description": "Rewilding endemic evergreen montane rainforests and indigenous agroforestry buffer zones in a global biodiversity hotspot.",
            "biome_type": "Afforestation",
            "target_carbon_credits": 40000.0,
            "status": "Active",
            "sites": [
                {
                    "name": "Silent Valley Core Catchment",
                    "description": "Continuous moist deciduous and evergreen canopy with native Dipterocarpus trees.",
                    "baseline_carbon_density": 160.0,
                    "biodiversity_status": "Critical",
                    "coordinates": [
                        [76.40, 11.08],
                        [76.52, 11.12],
                        [76.55, 11.02],
                        [76.43, 10.98],
                        [76.40, 11.08]
                    ]
                },
                {
                    "name": "Attappadi Agroforestry Buffer",
                    "description": "Community shade-grown coffee and multipurpose native timber restoration.",
                    "baseline_carbon_density": 115.0,
                    "biodiversity_status": "High",
                    "coordinates": [
                        [76.62, 11.02],
                        [76.72, 11.05],
                        [76.74, 10.95],
                        [76.61, 10.92],
                        [76.62, 11.02]
                    ]
                }
            ]
        },
        {
            "title": "Cairngorms Peatland Rewetting Sanctuary",
            "description": "Restoration of degraded blanket bogs through ditch blocking, sphagnum moss reintroduction, and emissions avoidance.",
            "biome_type": "Peatland",
            "target_carbon_credits": 15000.0,
            "status": "Verified",
            "sites": [
                {
                    "name": "Glen Feshie Upper Moorlands",
                    "description": "Sphagnum rewetting zone preventing methane and carbon oxidization.",
                    "baseline_carbon_density": 280.0,
                    "biodiversity_status": "Moderate",
                    "coordinates": [
                        [-3.85, 57.02],
                        [-3.72, 57.06],
                        [-3.68, 56.98],
                        [-3.81, 56.95],
                        [-3.85, 57.02]
                    ]
                }
            ]
        }
    ]

    for pdata in sample_projects:
        proj = Project(
            title=pdata["title"],
            description=pdata["description"],
            biome_type=pdata["biome_type"],
            target_carbon_credits=pdata["target_carbon_credits"],
            status=pdata["status"],
            created_by_id=primary_admin.id if primary_admin else None
        )
        db.add(proj)
        db.commit()
        db.refresh(proj)

        for sdata in pdata["sites"]:
            geom = {
                "type": "Polygon",
                "coordinates": [sdata["coordinates"]]
            }
            area_ha = calculate_polygon_area_hectares(geom)
            site = Site(
                project_id=proj.id,
                name=sdata["name"],
                description=sdata["description"],
                area_hectares=area_ha,
                baseline_carbon_density=sdata["baseline_carbon_density"],
                biodiversity_status=sdata["biodiversity_status"],
                geometry=json.dumps(geom)
            )
            db.add(site)
            db.commit()
            db.refresh(site)

            generate_site_analytics(site.id, area_ha, site.baseline_carbon_density, db)

    print("Sample projects, sites, and analytics seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed()
