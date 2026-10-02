from flask import Blueprint, request
from app.services.assistant_service import process_assistant_query
from app.utils.responses import success_response, error_response

assistant_bp = Blueprint("assistant", __name__, url_prefix="/api/v1/assistant")

@assistant_bp.route("/query", methods=["POST"])
def assistant_query():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    language = data.get("language", "en") # "en" or "te"

    if not message:
        return error_response("Message cannot be empty.", "EMPTY_QUERY", status_code=400)

    result = process_assistant_query(message, language=language)
    return success_response(result)

@assistant_bp.route("/suggestions", methods=["GET"])
def get_suggestions():
    lang = request.args.get("lang", "en")
    if lang == "te":
        suggestions = [
            "ఏలూరు నుండి విజయవాడ బస్సులు ఎప్పుడు ఉన్నాయి?",
            "హైదరాబాద్ వెళ్ళే బస్సుల వేళలు ఏమిటి?",
            "మహిళా భద్రత ఫీచర్ ఎలా ఉపయోగించాలి?",
            "ఫిర్యాదు ఎలా నమోదు చేయాలి?",
            "SMS ద్వారా బస్సు సమాచారం ఎలా పొందాలి?"
        ]
    else:
        suggestions = [
            "What buses are available from Eluru to Vijayawada?",
            "What time are the buses to Hyderabad?",
            "How do I use the Women's Safety feature?",
            "How can I submit a passenger complaint?",
            "How do I get route information via SMS?"
        ]
    return success_response({"language": lang, "suggestions": suggestions})
