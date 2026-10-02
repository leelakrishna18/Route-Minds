import re
from datetime import date, datetime
from app.models.timetable import Stop, Route, BusService
from app.services.timetable_service import search_buses

# Telugu and English keyword mappings
CITY_ALIASES = {
    "eluru": "Eluru",
    "ఏలూరు": "Eluru",
    "vijayawada": "Vijayawada",
    "విజయవాడ": "Vijayawada",
    "hyderabad": "Hyderabad",
    "హైదరాబాద్": "Hyderabad",
    "visakhapatnam": "Visakhapatnam",
    "vizag": "Visakhapatnam",
    "విశాఖపట్నం": "Visakhapatnam",
    "tirupati": "Tirupati",
    "తిరుపతి": "Tirupati",
    "kurnool": "Kurnool",
    "కర్నూలు": "Kurnool",
    "kadapa": "Kadapa",
    "కడప": "Kadapa",
    "rajahmundry": "Rajahmundry",
    "రాజమండ్రి": "Rajahmundry",
    "chintalapudi": "Chintalapudi",
    "చింతలపూడి": "Chintalapudi",
    "bhimavaram": "Bhimavaram",
    "భీమవరం": "Bhimavaram",
    "dwarakatirumala": "Dwarakatirumala",
    "ద్వారకాతిరుమల": "Dwarakatirumala",
    "sattupalli": "Sattupalli",
    "సత్తుపల్లి": "Sattupalli",
    "jangareddigudem": "Jangareddigudem",
    "జంగారెడ్డిగూడెం": "Jangareddigudem"
}

def extract_cities(text: str) -> tuple[str, str]:
    text_lower = text.lower()
    found = []
    
    # Check for direct occurrences
    for alias, standardized in CITY_ALIASES.items():
        if alias in text_lower and standardized not in found:
            found.append(standardized)
    
    if len(found) >= 2:
        return found[0], found[1]
    elif len(found) == 1:
        # Default source to Eluru if only one destination mentioned
        if found[0] != "Eluru":
            return "Eluru", found[0]
        else:
            return "Eluru", "Vijayawada"
    return None, None

def process_assistant_query(query: str, language: str = "en") -> dict:
    """
    Bilingual assistant query handler for English ('en') and Telugu ('te').
    """
    clean_query = (query or "").strip().lower()
    is_telugu = (language == "te") or any(ord(char) >= 0x0C00 and ord(char) <= 0x0C7F for char in clean_query)

    # 1. Bus Schedule Enquiry
    # English keywords: bus, buses, schedule, timing, from, to
    # Telugu keywords: బస్సు, బస్సులు, సమయం, నుండి, వరకు
    if any(k in clean_query for k in ["bus", "buses", "timing", "schedule", "బస్సు", "బస్సులు", "సమయం", "ఎప్పుడు"]):
        src_name, dst_name = extract_cities(clean_query)
        if src_name and dst_name:
            src_stop = Stop.query.filter(Stop.name.ilike(f"%{src_name}%")).first()
            dst_stop = Stop.query.filter(Stop.name.ilike(f"%{dst_name}%")).first()
            
            if src_stop and dst_stop:
                today = date.today()
                results = search_buses(src_stop.id, dst_stop.id, today)
                if results:
                    top_services = results[:4]
                    timings_en = ", ".join([f"{s['boarding_time']} ({s['bus_type']})" for s in top_services])
                    timings_te = ", ".join([f"{s['boarding_time']} ({s['bus_type']})" for s in top_services])
                    
                    if is_telugu:
                        answer = (
                            f"{src_stop.name_te or src_stop.name} నుండి {dst_stop.name_te or dst_stop.name} కు ఈరోజు అందుబాటులో ఉన్న బస్సులు: {timings_te}. "
                            f"మొత్తం {len(results)} షెడ్యూల్డ్ సర్వీసులు ఉన్నవి. గమనిక: ఇవి బోర్డు ప్రకారం నిర్ణీత వేళలు."
                        )
                    else:
                        answer = (
                            f"Scheduled buses from {src_stop.name} to {dst_stop.name} today: {timings_en}. "
                            f"Total {len(results)} scheduled services found in depot records. (Note: These are scheduled timetable timings)."
                        )
                    return {
                        "intent": "BUS_SCHEDULE",
                        "language": "te" if is_telugu else "en",
                        "response": answer,
                        "data": {
                            "source": src_stop.name,
                            "destination": dst_stop.name,
                            "count": len(results),
                            "services": results[:5]
                        }
                    }
                else:
                    if is_telugu:
                        answer = f"మా రికార్డులలో {src_stop.name_te or src_stop.name} నుండి {dst_stop.name_te or dst_stop.name} కు ఈ తేదీకి షెడ్యూల్డ్ సర్వీసులు కనిపించలేదు."
                    else:
                        answer = f"No scheduled services found in our available depot records from {src_stop.name} to {dst_stop.name} for today."
                    return {"intent": "BUS_SCHEDULE_NOT_FOUND", "language": "te" if is_telugu else "en", "response": answer, "data": None}

    # 2. Women's Safety Enquiry
    # Keywords: safety, emergency, contact, 112, భద్రత, అత్యవసరం, కాంటాక్ట్
    if any(k in clean_query for k in ["safe", "safety", "women", "emergency", "112", "భద్రత", "మహిళ", "అత్యవసరం"]):
        if is_telugu:
            answer = (
                "మహిళా భద్రత ఫీచర్ ద్వారా మీరు మీ నమ్మకమైన వ్యక్తులను (Trusted Contacts) జోడించవచ్చు, "
                "మీ అనుమతితో మాత్రమే లైవ్ లొకేషన్ పంచుకోవచ్చు, మరియు అత్యవసర సమయాల్లో నేరుగా 112 డయల్ చేయవచ్చు."
            )
        else:
            answer = (
                "Our Women's Safety feature allows you to add trusted emergency contacts, "
                "share your location via a temporary secure link with explicit permission, and access a direct 112 emergency dialer."
            )
        return {"intent": "WOMENS_SAFETY_INFO", "language": "te" if is_telugu else "en", "response": answer}

    # 3. Complaint Enquiry
    # Keywords: complaint, grievance, issue, delay, clean, ఫిర్యాదు, సమస్య, ఆలస్యం
    if any(k in clean_query for k in ["complaint", "grievance", "report", "issue", "dirty", "delay", "ఫిర్యాదు", "సమస్య"]):
        if is_telugu:
            answer = (
                "ఫిర్యాదుల పోర్టల్ ద్వారా మీరు బస్సు ఆలస్యం, సిబ్బంది ప్రవర్తన, శుభ్రత లేదా ఇతర సమస్యలపై ఫోటోలతో సహా ఫిర్యాదు చేయవచ్చు. "
                "సమర్పించిన తర్వాత మీకు ఒక రిఫరెన్స్ నంబర్ లభిస్తుంది, దానితో పురోగతిని ట్రాక్ చేయవచ్చు."
            )
        else:
            answer = (
                "Through the Passenger Complaint Portal, you can submit issues regarding delays, cleanliness, staff behaviour, or bus condition with optional photos. "
                "You will receive a unique Reference ID to track status updates."
            )
        return {"intent": "COMPLAINT_INFO", "language": "te" if is_telugu else "en", "response": answer}

    # 4. SMS Service Enquiry
    # Keywords: sms, text, offline, message, ఎస్ఎంఎస్, మెసేజ్
    if any(k in clean_query for k in ["sms", "offline", "message", "కోడ్", "ఎస్ఎంఎస్", "మెసేజ్"]):
        if is_telugu:
            answer = (
                "ఇంటర్నెట్ లేకపోయినా SMS ద్వారా బస్సు సమాచారం పొందవచ్చు. "
                "ఉదాహరణకు 'VJY' అని మా నంబర్ కు SMS పంపితే విజయవాడ బస్సుల వేళలు వస్తాయి. ఇతర కోడ్‌లు: HYD, RJY, TPG."
            )
        else:
            answer = (
                "You can receive bus timings via SMS even without internet. "
                "Send a route code (e.g. VJY for Vijayawada, HYD for Hyderabad, RJY for Rajahmundry) to the APSRTC SMS number."
            )
        return {"intent": "SMS_INFO", "language": "te" if is_telugu else "en", "response": answer}

    # 5. Default Fallback
    if is_telugu:
        answer = (
            "నమస్కారం! నేను APSRTC స్మార్ట్ అసిస్టెంట్ ను. మీరు నన్ను బస్సుల వేళలు (ఉదా: 'ఏలూరు నుండి విజయవాడ బస్సులు'), "
            "మహిళా భద్రత, లేదా ఫిర్యాదుల నమోదు గురించి అడగవచ్చు."
        )
    else:
        answer = (
            "Hello! I am your APSRTC Smart Assistant. You can ask me for bus timings (e.g., 'Buses from Eluru to Vijayawada'), "
            "women's safety assistance, passenger complaints, or SMS route codes in English or Telugu."
        )
    return {"intent": "GENERAL_HELP", "language": "te" if is_telugu else "en", "response": answer}
