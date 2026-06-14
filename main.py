from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from agents.triage_agent import analyze_crisis
from agents.resource_agent import allocate_resources
from agents.location_agent import detect_location
from agents.coordinator_agent import generate_action_plan
from agents.risk_agent import assess_risk

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "project": "Crisis Command AI",
        "status": "running"
    }

@app.get("/analyze")
def analyze(message: str):

    crisis_result = analyze_crisis(message)
    resources = allocate_resources(message)
    location = detect_location(message)

    return {
        "priority": crisis_result["priority"],
        "department": crisis_result["department"],
        "location": location,
        "resources": resources,
        

    }
@app.get("/plan")
def plan(message: str):

    crisis_result = analyze_crisis(message)
    location = detect_location(message)
    resources = allocate_resources(message)
    risk_level = assess_risk(message)

    result = generate_action_plan(
        priority=crisis_result["priority"],
        department=crisis_result["department"],
        location=location,
        resources=resources
    )

    result["risk_level"] = risk_level

    return result