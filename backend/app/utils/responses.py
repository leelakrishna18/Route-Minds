from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    payload = {
        "success": True,
        "message": message,
        "data": data
    }
    return jsonify(payload), status_code

def error_response(message="An error occurred", error_code="ERROR", errors=None, status_code=400):
    payload = {
        "success": False,
        "message": message,
        "error_code": error_code,
        "errors": errors or []
    }
    return jsonify(payload), status_code
