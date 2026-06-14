def assess_risk(message):

    message = message.lower()

    if "fire" in message and "lab" in message:
        return "CRITICAL"

    elif "fire" in message and "hostel" in message:
        return "CRITICAL"

    elif "flood" in message:
        return "CRITICAL"

    elif "fire" in message:
        return "HIGH"

    elif "medical" in message:
        return "MEDIUM"

    return "LOW"