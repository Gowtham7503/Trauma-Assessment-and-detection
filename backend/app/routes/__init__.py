from .auth_routes import auth_bp
from .chat_routes import chat_bp
from .assessment_routes import assessment_bp
from .case_routes import case_bp


def register_routes(app):

    app.register_blueprint(
        auth_bp
    )

    app.register_blueprint(
        chat_bp
    )

    app.register_blueprint(
        assessment_bp
    )

    app.register_blueprint(
        case_bp
    )