import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "Darukaa.Earth Platform API"

def test_auth_and_user_flow():
    # Login as seeded admin
    login_payload = {
        "email": "admin@darukaa.earth",
        "password": "AdminPass123!"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]
    assert data["user"]["email"] == "admin@darukaa.earth"

    # Test authenticated endpoint /me
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "admin@darukaa.earth"

def test_projects_crud():
    # Login first
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@darukaa.earth",
        "password": "AdminPass123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get all projects
    proj_resp = client.get("/api/projects")
    assert proj_resp.status_code == 200
    projects = proj_resp.json()
    assert len(projects) >= 3

    # Create new project
    new_proj = {
        "title": "Amazon Rainforest Biodiversity Corridor",
        "description": "High-priority canopy protection and jaguar migration pathway.",
        "biome_type": "Afforestation",
        "target_carbon_credits": 50000.0,
        "status": "Active"
    }
    create_resp = client.post("/api/projects", json=new_proj, headers=headers)
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]

    # Retrieve created project
    single_resp = client.get(f"/api/projects/{created_id}")
    assert single_resp.status_code == 200
    assert single_resp.json()["title"] == "Amazon Rainforest Biodiversity Corridor"

def test_sites_and_polygon_creation():
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@darukaa.earth",
        "password": "AdminPass123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch first project
    projects = client.get("/api/projects").json()
    project_id = projects[0]["id"]

    # Create site with polygon
    polygon_site = {
        "name": "Test Amazon Sector Beta",
        "description": "Monitored parcel for multi-spectral remote sensing.",
        "baseline_carbon_density": 175.0,
        "biodiversity_status": "Critical",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-60.05, -3.12],
                [-60.01, -3.12],
                [-60.01, -3.16],
                [-60.05, -3.16],
                [-60.05, -3.12]
            ]]
        }
    }
    site_resp = client.post(f"/api/projects/{project_id}/sites", json=polygon_site, headers=headers)
    assert site_resp.status_code == 201
    site_data = site_resp.json()
    assert site_data["area_hectares"] > 0
    assert site_data["name"] == "Test Amazon Sector Beta"

    # Test GeoJSON FeatureCollection endpoint
    geojson_resp = client.get("/api/geospatial/geojson")
    assert geojson_resp.status_code == 200
    fc = geojson_resp.json()
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) > 0

def test_analytics_endpoints():
    sites = client.get("/api/sites").json()
    assert len(sites) > 0
    site_id = sites[0]["id"]

    # Test site time-series analytics
    analytics_resp = client.get(f"/api/analytics/sites/{site_id}")
    assert analytics_resp.status_code == 200
    records = analytics_resp.json()
    assert len(records) > 0
    assert "ndvi_value" in records[0]
    assert "carbon_sequestration_rate" in records[0]

    # Test platform summary
    platform_resp = client.get("/api/analytics/platform-summary")
    assert platform_resp.status_code == 200
    summary = platform_resp.json()
    assert summary["total_projects"] > 0
    assert summary["total_sites"] > 0
    assert summary["total_protected_hectares"] > 0
