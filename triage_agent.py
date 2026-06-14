def analyze_crisis(message):
    message = message.lower()

    if "fire" in message:
        return {
            "priority": "HIGH",
            "department": "Fire Department"
        }

    elif "flood" in message:
        return {
            "priority": "HIGH",
            "department": "Disaster Response Team"
        }

    elif "medical" in message:
        return {
            "priority": "CRITICAL",
            "department": "Ambulance Service"
        }

    return {
        "priority": "MEDIUM",
        "department": "General Emergency Team"
    }