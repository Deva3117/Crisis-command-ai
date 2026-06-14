def allocate_resources(message):
    message = message.lower()

    if "fire" in message:
        return [
            "2 Fire Trucks",
            "1 Rescue Team",
            "1 Ambulance"
        ]

    elif "flood" in message:
        return [
            "3 Rescue Boats",
            "2 Medical Teams",
            "1 Disaster Unit"
        ]

    elif "medical" in message:
        return [
            "1 Ambulance",
            "1 Emergency Medical Team"
        ]

    return [
        "1 General Response Team"
    ]