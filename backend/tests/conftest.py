import pytest
from app import create_app
from app.config import TestConfig
from app.extensions import db
from app.data.seed import seed_database
from app.models.user import User
from app.services.auth_service import generate_tokens

@pytest.fixture(scope="session")
def app():
    app = create_app(TestConfig)
    with app.app_context():
        seed_database(app)
        yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def admin_token(app):
    with app.app_context():
        admin = User.query.filter_by(role="admin").first()
        token_data = generate_tokens(admin)
        return token_data["access_token"]

@pytest.fixture
def passenger_token(app):
    with app.app_context():
        passenger = User.query.filter_by(role="passenger").first()
        token_data = generate_tokens(passenger)
        return token_data["access_token"]
