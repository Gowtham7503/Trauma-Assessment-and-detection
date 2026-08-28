from flask import Flask
from flask_cors import CORS

from config.config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    from app.routes.auth_routes import auth_bp
    from app.routes.chat_routes import chat_bp
    from app.routes.assessment_routes import assessment_bp
    from app.routes.case_routes import case_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(assessment_bp, url_prefix="/api/assessment")
    app.register_blueprint(case_bp, url_prefix="/api/cases")

    return app

