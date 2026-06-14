import random

def generate_action_plan(priority, department, location, resources):
    actions = []

    if priority == "CRITICAL":
        actions.append("Dispatch emergency responders immediately")
        actions.append("Notify command center")
        actions.append("Prepare evacuation")

    elif priority == "HIGH":
        actions.append("Alert response team")
        actions.append("Assess situation")
        actions.append("Prepare resources")

    else:
        actions.append("Monitor situation")
        actions.append("Record incident")

    incident_id = f"INC-{random.randint(1000,9999)}"

    return {
        "incident_id": incident_id,
        "location": location,
        "department": department,
        "priority": priority,
        "resources": resources,
        "actions": actions
    }