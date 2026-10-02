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
    "bezawada": "Vijayawada",
    "బెజవాడ": "Vijayawada",
    "hyderabad": "Hyderabad",
    "హైదరాబాద్": "Hyderabad",
    "visakhapatnam": "Visakhapatnam",
    "vizag": "Visakhapatnam",
    "విశాఖపట్నం": "Visakhapatnam",
    "వైజాగ్": "Visakhapatnam",
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
    "జంగారెడ్డిగూడెం": "Jangareddigudem",
    "tadepalligudem": "Tadepalligudem",
    "తాడేపల్లిగూడెం": "Tadepalligudem",
    "guntur": "Guntur",
    "గుంటూరు": "Guntur",
    "narasapuram": "Narasapuram",
    "నరసాపురం": "Narasapuram",
    "ravulapalem": "Ravulapalem",
    "రావులపాలెం": "Ravulapalem",
    "chennai": "Chennai",
    "చెన్నై": "Chennai",
    "srisailam": "Srisailam",
    "శ్రీశైలం": "Srisailam",
    "anantapur": "Anantapur",
    "అనంతపురం": "Anantapur"
}

def extract_cities(text: str) -> tuple[str, str]:
    text_lower = text.lower()
    
    # Sort aliases by length descending so longer compound names match first
    sorted_aliases = sorted(CITY_ALIASES.items(), key=lambda x: len(x[0]), reverse=True)
    
    positions = []
    for alias, standardized in sorted_aliases:
        idx = text_lower.find(alias)
        if idx != -1 and standardized not in [p[1] for p in positions]:
            positions.append((idx, standardized))
    
    # Sort by appearance in the text
    positions.sort(key=lambda x: x[0])
    found = [p[1] for p in positions]

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
    Supports natural questions like 'eluru to vijayawada', 'morning buses to hyderabad',
    women's safety queries, helpline numbers, passenger complaints, and SMS route codes.
    """
    clean_query = (query or "").strip().lower()
    is_telugu = (language == "te") or any(ord(char) >= 0x0C00 and ord(char) <= 0x0C7F for char in clean_query)

    # Emergency & Helpline enquiry
    if any(k in clean_query for k in ["helpline", "phone", "contact", "enquiry number", "number", "ఫోన్", "నంబర్", "హెల్ప్‌లైన్"]):
        if is_telugu:
            ans = (
                "APSRTC ముఖ్యమైన హెల్ప్‌లైన్ నంబర్లు:\n"
                "• అత్యవసర సహాయం (పోలీస్ / అంబులెన్స్): 112\n"
                "• ఏలూరు బస్ స్టేషన్ ఎంక్వైరీ: 08812-230303\n"
                "• మహిళా భద్రత హెల్ప్‌లైన్: 181 / 112\n"
                "• APSRTC రాష్ట్ర కస్టమర్ కేర్: 0866-2570005"
            )
        else:
            ans = (
                "APSRTC Essential Helplines:\n"
                "• National Emergency (Police / Medical): 112\n"
                "• Eluru Depot Enquiry Counter: 08812-230303\n"
                "• Women Safety Helpline: 181 / 112\n"
                "• APSRTC Central Customer Care: 0866-2570005"
            )
        return {
            "intent": "HELPLINE_INFO",
            "language": "te" if is_telugu else "en",
            "response": ans,
            "quick_replies": ["Buses from Eluru to Vijayawada", "Women's Safety", "Register Complaint"]
        }

    src_name, dst_name = extract_cities(clean_query)

    # Detect time-of-day preference
    time_window = None # (start_hour, end_hour)
    time_desc_en = ""
    time_desc_te = ""
    if any(k in clean_query for k in ["morning", "ఉదయం", "తెల్లవారుజామున"]):
        time_window = ("04:00", "11:59")
        time_desc_en = "morning "
        time_desc_te = "ఉదయం "
    elif any(k in clean_query for k in ["afternoon", "మధ్యాహ్నం"]):
        time_window = ("12:00", "16:59")
        time_desc_en = "afternoon "
        time_desc_te = "మధ్యాహ్నం "
    elif any(k in clean_query for k in ["evening", "సాయంత్రం", "సాయంకాలం"]):
        time_window = ("17:00", "20:59")
        time_desc_en = "evening "
        time_desc_te = "సాయంత్రం "
    elif any(k in clean_query for k in ["night", "రాత్రి"]):
        time_window = ("21:00", "23:59")
        time_desc_en = "night "
        time_desc_te = "రాత్రి "

    # 1. Bus Schedule Enquiry
    has_bus_keywords = any(k in clean_query for k in [
        "bus", "buses", "timing", "timings", "schedule", "time", "reach", "travel", "ticket",
        "బస్సు", "బస్సులు", "సమయం", "సమయాలు", "ఎప్పుడు", "వెళ్ళే", "వెళ్లాలి", "నుండి", "వరకు"
    ])
    has_cities = bool(src_name and dst_name)
    has_direction = bool(dst_name and any(k in clean_query for k in ["to", "for", "వరకు", "కి", "కు", "వైపు"]))

    if has_bus_keywords or has_cities or has_direction:
        if src_name and dst_name:
            src_stop = Stop.query.filter(Stop.name.ilike(f"%{src_name}%")).first()
            dst_stop = Stop.query.filter(Stop.name.ilike(f"%{dst_name}%")).first()
            
            if src_stop and dst_stop:
                today = date.today()
                results = search_buses(src_stop.id, dst_stop.id, today)
                
                # Apply time-of-day filter if specified
                if time_window and results:
                    filtered = [s for s in results if time_window[0] <= s["boarding_time"] <= time_window[1]]
                    if filtered:
                        results = filtered

                if results:
                    top_services = results[:4]
                    timings_en = ", ".join([f"{s['boarding_time']} ({s['bus_type']})" for s in top_services])
                    timings_te = ", ".join([f"{s['boarding_time']} ({s['bus_type']})" for s in top_services])
                    
                    if is_telugu:
                        answer = (
                            f"{src_stop.name_te or src_stop.name} నుండి {dst_stop.name_te or dst_stop.name} కు ఈరోజు {time_desc_te}అందుబాటులో ఉన్న బస్సులు: {timings_te}. "
                            f"మొత్తం {len(results)} షెడ్యూల్డ్ సర్వీసులు ఉన్నవి. గమనిక: ఇవి డిపో బోర్డు ప్రకారం నిర్ణీత వేళలు."
                        )
                    else:
                        answer = (
                            f"Scheduled {time_desc_en}buses from {src_stop.name} to {dst_stop.name} today: {timings_en}. "
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
                        },
                        "quick_replies": [
                            f"Morning buses to {dst_stop.name}",
                            f"Evening buses to {dst_stop.name}",
                            "Helpline numbers"
                        ]
                    }
                else:
                    if is_telugu:
                        answer = f"మా రికార్డులలో {src_stop.name_te or src_stop.name} నుండి {dst_stop.name_te or dst_stop.name} కు ప్రత్యక్ష షెడ్యూల్డ్ సర్వీసులు లేవు. దయచేసి విజయవాడ మీదుగా చూసుకోండి."
                    else:
                        answer = f"No direct scheduled services found in depot records from {src_stop.name} to {dst_stop.name} for today. Please check connecting routes via Vijayawada."
                    return {"intent": "BUS_SCHEDULE_NOT_FOUND", "language": "te" if is_telugu else "en", "response": answer, "data": None}
            elif src_stop and not dst_stop:
                if is_telugu:
                    answer = f"{src_name} నుండి మీరు ఏ ఊరికి ప్రయాణించాలనుకుంటున్నారు? (ఉదా: విజయవాడ, హైదరాబాద్, రాజమండ్రి)"
                else:
                    answer = f"Where would you like to travel from {src_name}? (e.g. Vijayawada, Hyderabad, Rajahmundry)"
                return {"intent": "BUS_SCHEDULE_PROMPT_DEST", "language": "te" if is_telugu else "en", "response": answer, "data": None}
        else:
            if is_telugu:
                answer = "మీరు ఏ మార్గంలో బస్సుల వేళలు తెలుసుకోవాలనుకుంటున్నారు? (ఉదా: 'ఏలూరు నుండి విజయవాడ' లేదా 'హైదరాబాద్ వెళ్ళే బస్సులు')"
            else:
                answer = "Which bus route would you like to check? (e.g. 'Eluru to Vijayawada', 'Eluru to Hyderabad', or 'Buses to Vizag')"
            return {"intent": "BUS_SCHEDULE_PROMPT_ROUTE", "language": "te" if is_telugu else "en", "response": answer, "data": None}

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
