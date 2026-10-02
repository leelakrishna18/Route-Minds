import sys
from app import create_app
from app.data.seed import seed_database

app = create_app()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "seed":
        print("Initializing and seeding database with APSRTC verified records...")
        seed_database(app)
        print("Seeding completed successfully.")
    else:
        app.run(host="0.0.0.0", port=5001, debug=True)
