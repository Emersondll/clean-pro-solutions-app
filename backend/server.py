from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from geopy.distance import geodesic

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="LimpezaPro API", description="Cleaning Service Platform", version="1.0.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ================================
# MODELS
# ================================

class UserType(str):
    CUSTOMER = "customer"
    PROFESSIONAL = "professional"
    ADMIN = "admin"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    user_type: str  # customer, professional, admin
    avatar: Optional[str] = None  # base64 image
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    user_type: str
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ServiceCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    base_price: float
    unit: str  # per hour, per room, per sqm, etc.
    icon: Optional[str] = None

class Location(BaseModel):
    address: str
    city: str
    state: str
    zipcode: str
    country: str = "BR"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProfessionalProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    bio: Optional[str] = None
    services: List[str] = []  # service category IDs
    hourly_rate: float
    location: Location
    availability: Dict[str, List[str]] = {}  # {"monday": ["09:00", "17:00"], ...}
    experience_years: Optional[int] = None
    certifications: List[str] = []
    portfolio_images: List[str] = []  # base64 images
    rating: float = 0.0
    total_jobs: int = 0
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JobStatus(str):
    POSTED = "posted"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    professional_id: Optional[str] = None
    title: str
    description: str
    service_categories: List[str]  # service category IDs
    location: Location
    scheduled_date: datetime
    estimated_duration: int  # minutes
    budget_min: float
    budget_max: float
    status: str = JobStatus.POSTED
    requirements: List[str] = []
    images: List[str] = []  # base64 images
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    sender_id: str
    recipient_id: str
    content: str
    message_type: str = "text"  # text, image, system
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False

# ================================
# UTILITY FUNCTIONS
# ================================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    payload = verify_jwt_token(token)
    user = await db.users.find_one({"id": payload["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ================================
# AUTHENTICATION ROUTES
# ================================

@api_router.post("/auth/register")
async def register_user(user_data: UserRegister):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        user_type=user_data.user_type,
        avatar=user_data.avatar
    )
    
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create JWT token
    token = create_jwt_token(user.id, user.email)
    
    return {
        "user": {k: v for k, v in user_dict.items() if k != "password"},
        "token": token,
        "message": "Registration successful"
    }

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    token = create_jwt_token(user["id"], user["email"])
    
    return {
        "user": {k: v for k, v in user.items() if k != "password"},
        "token": token,
        "message": "Login successful"
    }

@api_router.get("/auth/me")
async def get_current_user_info(current_user: Dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password"}

# ================================
# SERVICE CATEGORIES ROUTES
# ================================

@api_router.get("/services/categories", response_model=List[ServiceCategory])
async def get_service_categories():
    categories = await db.service_categories.find().to_list(100)
    return [ServiceCategory(**cat) for cat in categories]

@api_router.post("/services/categories", response_model=ServiceCategory)
async def create_service_category(category: ServiceCategory, current_user: Dict = Depends(get_current_user)):
    if current_user["user_type"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.service_categories.insert_one(category.dict())
    return category

# ================================
# PROFESSIONAL PROFILES ROUTES
# ================================

@api_router.post("/professionals/profile", response_model=ProfessionalProfile)
async def create_professional_profile(profile: ProfessionalProfile, current_user: Dict = Depends(get_current_user)):
    if current_user["user_type"] != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    profile.user_id = current_user["id"]
    
    # Check if profile already exists
    existing_profile = await db.professional_profiles.find_one({"user_id": current_user["id"]})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    await db.professional_profiles.insert_one(profile.dict())
    return profile

@api_router.get("/professionals/profile")
async def get_professional_profile(current_user: Dict = Depends(get_current_user)):
    profile = await db.professional_profiles.find_one({"user_id": current_user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.put("/professionals/profile")
async def update_professional_profile(profile_update: dict, current_user: Dict = Depends(get_current_user)):
    if current_user["user_type"] != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    profile_update["updated_at"] = datetime.utcnow()
    
    result = await db.professional_profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": profile_update}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    updated_profile = await db.professional_profiles.find_one({"user_id": current_user["id"]})
    return updated_profile

@api_router.get("/professionals/search")
async def search_professionals(
    service_category: Optional[str] = None,
    city: Optional[str] = None,
    max_distance: float = 50.0,  # km
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
):
    query = {}
    
    if service_category:
        query["services"] = {"$in": [service_category]}
    
    if city:
        query["location.city"] = {"$regex": city, "$options": "i"}
    
    professionals = await db.professional_profiles.find(query).to_list(100)
    
    # Filter by distance if coordinates provided
    if latitude and longitude:
        filtered_professionals = []
        for prof in professionals:
            if prof.get("location", {}).get("latitude") and prof.get("location", {}).get("longitude"):
                prof_location = (prof["location"]["latitude"], prof["location"]["longitude"])
                user_location = (latitude, longitude)
                distance = geodesic(user_location, prof_location).kilometers
                
                if distance <= max_distance:
                    prof["distance_km"] = round(distance, 2)
                    filtered_professionals.append(prof)
        
        # Sort by distance
        professionals = sorted(filtered_professionals, key=lambda x: x["distance_km"])
    
    return professionals

# ================================
# JOBS ROUTES
# ================================

@api_router.post("/jobs", response_model=Job)
async def create_job(job: Job, current_user: Dict = Depends(get_current_user)):
    if current_user["user_type"] != "customer":
        raise HTTPException(status_code=403, detail="Customer access required")
    
    job.customer_id = current_user["id"]
    await db.jobs.insert_one(job.dict())
    return job

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(
    status: Optional[str] = None,
    current_user: Dict = Depends(get_current_user)
):
    query = {}
    
    if current_user["user_type"] == "customer":
        query["customer_id"] = current_user["id"]
    elif current_user["user_type"] == "professional":
        query["$or"] = [
            {"professional_id": current_user["id"]},
            {"status": "posted"}  # Available jobs
        ]
    
    if status:
        query["status"] = status
    
    jobs = await db.jobs.find(query).sort("created_at", -1).to_list(100)
    return [Job(**job) for job in jobs]

@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str, current_user: Dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user has access to this job
    if current_user["user_type"] == "customer" and job["customer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user["user_type"] == "professional" and job.get("professional_id") != current_user["id"] and job["status"] != "posted":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return job

@api_router.put("/jobs/{job_id}/assign")
async def assign_job(job_id: str, current_user: Dict = Depends(get_current_user)):
    if current_user["user_type"] != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["status"] != "posted":
        raise HTTPException(status_code=400, detail="Job is not available")
    
    # Update job status and assign professional
    await db.jobs.update_one(
        {"id": job_id},
        {
            "$set": {
                "professional_id": current_user["id"],
                "status": "assigned",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Job assigned successfully"}

@api_router.put("/jobs/{job_id}/status")
async def update_job_status(job_id: str, status_data: dict, current_user: Dict = Depends(get_current_user)):
    new_status = status_data.get("status")
    if new_status not in ["in_progress", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check permissions
    if current_user["user_type"] == "customer" and job["customer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user["user_type"] == "professional" and job.get("professional_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.jobs.update_one(
        {"id": job_id},
        {
            "$set": {
                "status": new_status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": f"Job status updated to {new_status}"}

# ================================
# MESSAGING ROUTES
# ================================

@api_router.post("/messages", response_model=Message)
async def send_message(message: Message, current_user: Dict = Depends(get_current_user)):
    message.sender_id = current_user["id"]
    
    # Validate that sender has access to this job
    job = await db.jobs.find_one({"id": message.job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if (current_user["user_type"] == "customer" and job["customer_id"] != current_user["id"]) or \
       (current_user["user_type"] == "professional" and job.get("professional_id") != current_user["id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.messages.insert_one(message.dict())
    return message

@api_router.get("/messages/{job_id}")
async def get_job_messages(job_id: str, current_user: Dict = Depends(get_current_user)):
    # Validate access to job
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if (current_user["user_type"] == "customer" and job["customer_id"] != current_user["id"]) or \
       (current_user["user_type"] == "professional" and job.get("professional_id") != current_user["id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = await db.messages.find({"job_id": job_id}).sort("timestamp", 1).to_list(1000)
    return [Message(**msg) for msg in messages]

# ================================
# DASHBOARD/STATS ROUTES
# ================================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: Dict = Depends(get_current_user)):
    if current_user["user_type"] == "customer":
        total_jobs = await db.jobs.count_documents({"customer_id": current_user["id"]})
        active_jobs = await db.jobs.count_documents({
            "customer_id": current_user["id"],
            "status": {"$in": ["posted", "assigned", "in_progress"]}
        })
        completed_jobs = await db.jobs.count_documents({
            "customer_id": current_user["id"],
            "status": "completed"
        })
        
        return {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "completed_jobs": completed_jobs
        }
    
    elif current_user["user_type"] == "professional":
        profile = await db.professional_profiles.find_one({"user_id": current_user["id"]})
        if not profile:
            return {"error": "Profile not found"}
        
        assigned_jobs = await db.jobs.count_documents({"professional_id": current_user["id"]})
        completed_jobs = await db.jobs.count_documents({
            "professional_id": current_user["id"],
            "status": "completed"
        })
        
        return {
            "total_jobs": profile.get("total_jobs", 0),
            "assigned_jobs": assigned_jobs,
            "completed_jobs": completed_jobs,
            "rating": profile.get("rating", 0.0)
        }
    
    return {"error": "Invalid user type"}

# ================================
# SEED DATA ROUTE (FOR DEVELOPMENT)
# ================================

@api_router.post("/seed/categories")
async def seed_service_categories():
    categories = [
        {
            "id": str(uuid.uuid4()),
            "name": "Limpeza Residencial",
            "description": "Limpeza geral de residências",
            "base_price": 50.0,
            "unit": "por hora",
            "icon": "home"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Limpeza Comercial",
            "description": "Limpeza de escritórios e estabelecimentos comerciais",
            "base_price": 80.0,
            "unit": "por hora",
            "icon": "business"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Limpeza Pós-Obra",
            "description": "Limpeza após reformas e construções",
            "base_price": 120.0,
            "unit": "por m²",
            "icon": "construction"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Limpeza de Carpetes",
            "description": "Lavagem e higienização de carpetes",
            "base_price": 25.0,
            "unit": "por m²",
            "icon": "carpet"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Limpeza de Vidros",
            "description": "Limpeza de janelas e superfícies de vidro",
            "base_price": 15.0,
            "unit": "por m²",
            "icon": "window"
        }
    ]
    
    await db.service_categories.delete_many({})  # Clear existing
    await db.service_categories.insert_many(categories)
    
    return {"message": f"Seeded {len(categories)} service categories"}

# Include router and configure app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()