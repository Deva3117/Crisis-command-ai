def detect_location(message):

    message = message.lower()

    if "building a" in message:
        return "Building A"

    elif "room 204" in message:
        return "Room 204"

    elif "river road" in message:
        return "River Road"

    elif "hospital" in message:
        return "Hospital Block"

    elif "hostel" in message:
        return "Hostel Block"

    elif "lab" in message:
        return "Laboratory"

    elif "office" in message:
        return "Office Building"

    return "Location Unknown"