from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from bson import ObjectId
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import aiofiles
import json

load_dotenv()

app = FastAPI(title="V K Shipping Services API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ADMIN_PASSWORD = "dev19patel"

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["vknath_shipping"]

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# Create uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Models
class AdminLogin(BaseModel):
    password: str

class GlobalSettings(BaseModel):
    company_name: str
    tagline: str
    about_us: str
    phone: str
    email: EmailStr
    address: str
    logo_url: Optional[str] = None

class CargoCategory(BaseModel):
    name: str
    description: str
    image_url: Optional[str] = None

class CargoItem(BaseModel):
    category_id: str
    name: str
    description: str
    image_url: Optional[str] = None

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class QuoteForm(BaseModel):
    name: str
    email: EmailStr
    phone: str
    cargo_type: str
    message: str

# Helper Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

# Authentication Route
@app.post("/api/login")
async def login(credentials: AdminLogin):
    if credentials.password == "dev19patel":
        # Create JWT token
        token_data = {"sub": "admin"}
        token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

# Global Settings Routes
@app.get("/api/settings")
async def get_global_settings():
    settings = db.global_settings.find_one()
    if settings:
        settings["_id"] = str(settings["_id"])
        return settings
    return {}

@app.put("/api/settings")
async def update_global_settings(settings: GlobalSettings, admin_user: str = Depends(verify_token)):
    db.global_settings.update_one(
        {},
        {"$set": settings.dict()},
        upsert=True
    )
    return {"message": "Settings updated successfully"}

# Cargo Categories Routes
@app.get("/api/cargo-categories")
async def get_cargo_categories():
    categories = list(db.cargo_categories.find())
    for category in categories:
        category["_id"] = str(category["_id"])
    return categories

@app.post("/api/cargo-categories")
async def create_cargo_category(category: CargoCategory, admin_user: str = Depends(verify_token)):
    result = db.cargo_categories.insert_one(category.dict())
    return {"message": "Category created successfully", "id": str(result.inserted_id)}

@app.put("/api/cargo-categories/{category_id}")
async def update_cargo_category(category_id: str, category: CargoCategory, admin_user: str = Depends(verify_token)):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    result = db.cargo_categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": category.dict()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category updated successfully"}

@app.delete("/api/cargo-categories/{category_id}")
async def delete_cargo_category(category_id: str, admin_user: str = Depends(verify_token)):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    result = db.cargo_categories.delete_one({"_id": ObjectId(category_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# Cargo Items Routes
@app.get("/api/cargo-items")
async def get_cargo_items():
    items = list(db.cargo_items.find())
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@app.get("/api/cargo-items/category/{category_id}")
async def get_cargo_items_by_category(category_id: str):
    items = list(db.cargo_items.find({"category_id": category_id}))
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@app.post("/api/cargo-items")
async def create_cargo_item(item: CargoItem, admin_user: str = Depends(verify_token)):
    result = db.cargo_items.insert_one(item.dict())
    return {"message": "Item created successfully", "id": str(result.inserted_id)}

@app.put("/api/cargo-items/{item_id}")
async def update_cargo_item(item_id: str, item: CargoItem, admin_user: str = Depends(verify_token)):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    result = db.cargo_items.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": item.dict()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Item updated successfully"}

@app.delete("/api/cargo-items/{item_id}")
async def delete_cargo_item(item_id: str, admin_user: str = Depends(verify_token)):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    result = db.cargo_items.delete_one({"_id": ObjectId(item_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Item deleted successfully"}

# File Upload Route
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), admin_user: str = Depends(verify_token)):
    file_extension = file.filename.split(".")[-1]
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = f"uploads/{filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {"filename": filename, "file_path": file_path, "url": f"/uploads/{filename}"}

# Contact and Lead Generation Routes
@app.post("/api/contact")
async def submit_contact_form(form_data: ContactForm):
    # Save to database
    lead_data = form_data.dict()
    lead_data["type"] = "contact"
    lead_data["created_at"] = datetime.utcnow()
    db.leads.insert_one(lead_data)
    
    # Get company settings for email
    settings = db.global_settings.find_one()
    company_email = settings.get("email", "export@vknathgroup.in") if settings else "export@vknathgroup.in"
    
    # Send email notification
    subject = f"New Contact Form Submission: {form_data.subject}"
    body = f"""
    New contact form submission received:
    
    Name: {form_data.name}
    Email: {form_data.email}
    Subject: {form_data.subject}
    Message: {form_data.message}
    
    Submitted on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}
    """
    
    email_sent = send_email(company_email, subject, body)
    
    return {
        "message": "Contact form submitted successfully",
        "email_sent": email_sent
    }

@app.post("/api/quote")
async def submit_quote_form(form_data: QuoteForm):
    # Save to database
    lead_data = form_data.dict()
    lead_data["type"] = "quote"
    lead_data["created_at"] = datetime.utcnow()
    db.leads.insert_one(lead_data)
    
    # Get company settings for email
    settings = db.global_settings.find_one()
    company_email = settings.get("email", "export@vknathgroup.in") if settings else "export@vknathgroup.in"
    
    # Send email notification
    subject = f"New Quote Request: {form_data.cargo_type}"
    body = f"""
    New quote request received:
    
    Name: {form_data.name}
    Email: {form_data.email}
    Phone: {form_data.phone}
    Cargo Type: {form_data.cargo_type}
    Message: {form_data.message}
    
    Submitted on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}
    """
    
    email_sent = send_email(company_email, subject, body)
    
    return {
        "message": "Quote request submitted successfully",
        "email_sent": email_sent
    }

# Leads Management Routes (Admin only)
@app.get("/api/leads")
async def get_leads(admin_user: str = Depends(verify_token)):
    leads = list(db.leads.find().sort("created_at", -1))
    for lead in leads:
        lead["_id"] = str(lead["_id"])
        if "created_at" in lead:
            lead["created_at"] = lead["created_at"].isoformat()
    return leads

@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: str, admin_user: str = Depends(verify_token)):
    if not ObjectId.is_valid(lead_id):
        raise HTTPException(status_code=400, detail="Invalid lead ID")
    
    result = db.leads.delete_one({"_id": ObjectId(lead_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {"message": "Lead deleted successfully"}

# Initialize seed data
@app.on_event("startup")
async def startup_event():
    # Check if data exists, if not seed it
    if db.global_settings.count_documents({}) == 0:
        default_settings = {
            "company_name": "V K SHIPPING SERVICES",
            "tagline": "WE CARRY, WE CARE",
            "about_us": "We are a leading import-export company with years of experience in international trade. Our expertise lies in connecting businesses across borders and facilitating seamless global commerce.",
            "phone": "+91-7573041747/7573041744",
            "email": "export@vknathgroup.in",
            "address": "Office No. M-1, first floor, Kashish Arcade, Master Marine Services Pvt. Ltd, near Zero Point, Mundra, Gujarat 370421"
        }
        db.global_settings.insert_one(default_settings)
    
    # Seed cargo categories if they don't exist
    if db.cargo_categories.count_documents({}) == 0:
        categories = [
            {"name": "Auto Line", "description": "Exporting Two-wheelers and Four-wheelers"},
            {"name": "Heavy Machinery", "description": "Including Excavators, JCBs, and trucks"},
            {"name": "Agri Products", "description": "Specific items like Coriander (ધાણા) and Cumin (જીરું)"},
            {"name": "Plumbing Items", "description": "Materials such as Pipes, Elbows, and related fittings"}
        ]
        result = db.cargo_categories.insert_many(categories)
        
        # Seed cargo items if they don't exist
        if db.cargo_items.count_documents({}) == 0:
            items = [
                # Auto Line Items
                {"category_id": str(result.inserted_ids[0]), "name": "Motorcycles - Sport Bikes", "description": "High-performance sport bikes for international markets"},
                {"category_id": str(result.inserted_ids[0]), "name": "Cars - Sedan Models", "description": "Comfortable sedan vehicles suitable for family transportation"},
                {"category_id": str(result.inserted_ids[0]), "name": "SUVs - Luxury Models", "description": "Premium sport utility vehicles with advanced features"},
                
                # Heavy Machinery Items
                {"category_id": str(result.inserted_ids[1]), "name": "Excavators - 20 Ton", "description": "Heavy-duty excavators for construction and mining operations"},
                {"category_id": str(result.inserted_ids[1]), "name": "JCB Backhoe Loaders", "description": "Versatile backhoe loaders for digging and loading operations"},
                {"category_id": str(result.inserted_ids[1]), "name": "Cargo Trucks - 10 Ton", "description": "Heavy-duty trucks for transportation and logistics"},
                
                # Agri Products Items
                {"category_id": str(result.inserted_ids[2]), "name": "Coriander Seeds (ધાણા)", "description": "Premium quality coriander seeds for culinary and medicinal use"},
                {"category_id": str(result.inserted_ids[2]), "name": "Cumin Seeds (જીરું)", "description": "Aromatic cumin seeds essential for various cuisines worldwide"},
                {"category_id": str(result.inserted_ids[2]), "name": "Turmeric Powder", "description": "Pure turmeric powder known for its color and health benefits"},
                
                # Plumbing Items Items
                {"category_id": str(result.inserted_ids[3]), "name": "PVC Pipes - Various Sizes", "description": "High-quality PVC pipes for plumbing and irrigation systems"},
                {"category_id": str(result.inserted_ids[3]), "name": "Pipe Fittings - Elbows", "description": "Durable elbow fittings for pipe connections and direction changes"},
                {"category_id": str(result.inserted_ids[3]), "name": "Valves - Ball Valves", "description": "Precision ball valves for flow control in plumbing systems"}
            ]
            db.cargo_items.insert_many(items)

@app.post("/api/seed-cargo-items")
async def seed_cargo_items():
    try:
        # Get existing categories
        categories = list(db.cargo_categories.find({}))
        
        if len(categories) == 0:
            return {"message": "No categories found. Please seed categories first."}
        
        # Clear existing items
        db.cargo_items.delete_many({})
        
        # Create items for each category
        items = []
        for category in categories:
            if category["name"] == "Auto Line":
                items.extend([
                    {"category_id": str(category["_id"]), "name": "Motorcycles - Sport Bikes", "description": "High-performance sport bikes for international markets"},
                    {"category_id": str(category["_id"]), "name": "Cars - Sedan Models", "description": "Comfortable sedan vehicles suitable for family transportation"},
                    {"category_id": str(category["_id"]), "name": "SUVs - Luxury Models", "description": "Premium sport utility vehicles with advanced features"}
                ])
            elif category["name"] == "Heavy Machinery":
                items.extend([
                    {"category_id": str(category["_id"]), "name": "Excavators - 20 Ton", "description": "Heavy-duty excavators for construction and mining operations"},
                    {"category_id": str(category["_id"]), "name": "JCB Backhoe Loaders", "description": "Versatile backhoe loaders for digging and loading operations"},
                    {"category_id": str(category["_id"]), "name": "Cargo Trucks - 10 Ton", "description": "Heavy-duty trucks for transportation and logistics"}
                ])
            elif category["name"] == "Agri Products":
                items.extend([
                    {"category_id": str(category["_id"]), "name": "Coriander Seeds (ધાણા)", "description": "Premium quality coriander seeds for culinary and medicinal use"},
                    {"category_id": str(category["_id"]), "name": "Cumin Seeds (જીરું)", "description": "Aromatic cumin seeds essential for various cuisines worldwide"},
                    {"category_id": str(category["_id"]), "name": "Turmeric Powder", "description": "Pure turmeric powder known for its color and health benefits"}
                ])
            elif category["name"] == "Plumbing Items":
                items.extend([
                    {"category_id": str(category["_id"]), "name": "PVC Pipes - Various Sizes", "description": "High-quality PVC pipes for plumbing and irrigation systems"},
                    {"category_id": str(category["_id"]), "name": "Pipe Fittings - Elbows", "description": "Durable elbow fittings for pipe connections and direction changes"},
                    {"category_id": str(category["_id"]), "name": "Valves - Ball Valves", "description": "Precision ball valves for flow control in plumbing systems"}
                ])
        
        # Insert items
        if items:
            result = db.cargo_items.insert_many(items)
            return {
                "message": f"Successfully seeded {len(items)} cargo items",
                "items_count": len(items)
            }
        else:
            return {"message": "No items to seed"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve frontend build (production)
import os.path
frontend_build = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
if os.path.exists(frontend_build):
    app.mount("/", StaticFiles(directory=frontend_build, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
