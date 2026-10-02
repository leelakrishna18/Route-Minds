import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def is_allowed_file(filename: str) -> bool:
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in current_app.config["ALLOWED_EXTENSIONS"]

def save_uploaded_file(file_storage) -> dict:
    """
    Saves an uploaded file securely into the configured upload directory.
    Returns metadata dict: {file_name, file_path, mime_type, file_size_bytes}
    """
    if not file_storage or file_storage.filename == "":
        raise ValueError("No file selected for upload.")
    
    if not is_allowed_file(file_storage.filename):
        allowed = ", ".join(current_app.config["ALLOWED_EXTENSIONS"])
        raise ValueError(f"Invalid file type. Allowed formats: {allowed}")

    # Generate secure random filename preserving extension
    original_name = secure_filename(file_storage.filename)
    extension = original_name.rsplit(".", 1)[1].lower() if "." in original_name else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{extension}"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    destination_path = os.path.join(upload_folder, unique_filename)

    file_storage.save(destination_path)
    file_size = os.path.getsize(destination_path)

    # Max size enforcement
    if file_size > current_app.config["MAX_CONTENT_LENGTH"]:
        os.remove(destination_path)
        max_mb = current_app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)
        raise ValueError(f"File size exceeds maximum allowed limit of {max_mb} MB.")

    mime_type = file_storage.content_type or "image/jpeg"

    return {
        "file_name": original_name,
        "unique_filename": unique_filename,
        "file_path": destination_path,
        "mime_type": mime_type,
        "file_size_bytes": file_size
    }
