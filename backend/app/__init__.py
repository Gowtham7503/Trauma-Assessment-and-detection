from flask import Flask

from flask_cors import CORS

from config.config import Config

from app.routes import (
    register_routes
)


def create_app():

    app = Flask(
        __name__
    )

    app.config.from_object(
        Config
    )

    CORS(app)

    register_routes(
        app
    )

    @app.route("/")
    def home():

        return jsonify_response(
            {
                "success": True,
                "message":
                    "NHAA Trauma Assessment Backend"
            }
        )

    @app.route("/health")
    def health():

        return jsonify_response(
            {
                "success": True,
                "status": "healthy"
            }
        )

    return app


def jsonify_response(data):

    from flask import jsonify

    return jsonify(data)
