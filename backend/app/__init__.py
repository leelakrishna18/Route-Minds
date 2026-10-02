import os
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from app.config import Config
from app.extensions import db, migrate, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Ensure uploads directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.timetable_routes import timetable_bp
    from app.routes.safety_routes import safety_bp
    from app.routes.complaint_routes import complaint_bp
    from app.routes.sms_routes import sms_bp
    from app.routes.assistant_routes import assistant_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(timetable_bp)
    app.register_blueprint(safety_bp)
    app.register_blueprint(complaint_bp)
    app.register_blueprint(sms_bp)
    app.register_blueprint(assistant_bp)
    app.register_blueprint(admin_bp)

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "APSRTC Smart Passenger Information Platform",
            "version": "1.0.0"
        }), 200

    # Auto-initialize and seed tables if empty (crucial for serverless cold-starts)
    with app.app_context():
        try:
            is_vercel = bool(os.getenv("VERCEL"))
            if is_vercel:
                tmp_db = "/tmp/apsrtc.db"
                seed_db = os.path.join(app.config.get("BASE_DIR", ""), "apsrtc.db")
                if not os.path.exists(tmp_db) and os.path.exists(seed_db):
                    import shutil
                    shutil.copyfile(seed_db, tmp_db)
            db.create_all()

            # Ensure new columns exist in bus_services (safe migration for existing SQLite DBs)
            with db.engine.connect() as conn:
                for stmt in [
                    "ALTER TABLE bus_services ADD COLUMN fare VARCHAR(50) DEFAULT 'Standard Fare'",
                    "ALTER TABLE bus_services ADD COLUMN seating_capacity INTEGER DEFAULT 49",
                    "ALTER TABLE bus_services ADD COLUMN depot_name VARCHAR(100) DEFAULT 'Eluru Depot'",
                    "DELETE FROM users WHERE email='passenger@example.com'"
                ]:
                    try:
                        conn.execute(db.text(stmt))
                        conn.commit()
                    except Exception:
                        pass

            from app.models.timetable import Stop
            if Stop.query.count() == 0:
                from app.data.seed import seed_database
                seed_database(app)
        except Exception as e:
            app.logger.warning(f"Database auto-seed check: {e}")

    # Centralized Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "error_code": "BAD_REQUEST", "message": str(e.description if hasattr(e, 'description') else e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"success": False, "error_code": "UNAUTHORIZED", "message": "Authentication required."}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"success": False, "error_code": "FORBIDDEN", "message": "You do not have permission to access this resource."}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error_code": "NOT_FOUND", "message": "The requested API resource was not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "error_code": "METHOD_NOT_ALLOWED", "message": "HTTP method not allowed for this route."}), 405

    @app.errorhandler(413)
    def request_entity_too_large(e):
        return jsonify({"success": False, "error_code": "PAYLOAD_TOO_LARGE", "message": "Uploaded file exceeds maximum allowed limit."}), 413

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        if isinstance(e, HTTPException):
            return jsonify({"success": False, "error_code": e.name.upper().replace(" ", "_"), "message": e.description}), e.code
        # Log unexpected error
        app.logger.error(f"Unexpected server error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please try again later."
        }), 500

    return app
