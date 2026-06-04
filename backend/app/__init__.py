import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
mail = Mail()


def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///pickgoal.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24h
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": [
             "https://pickgoal.es",
             "https://www.pickgoal.es",
             "http://localhost:5173",
         ]}},
         supports_credentials=True)

    from app.routes.auth import auth_bp
    from app.routes.matches import matches_bp
    from app.routes.predictions import predictions_bp
    from app.routes.leagues import leagues_bp
    from app.routes.board import board_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(matches_bp, url_prefix='/api/matches')
    app.register_blueprint(predictions_bp, url_prefix='/api/predictions')
    app.register_blueprint(leagues_bp, url_prefix='/api/leagues')
    app.register_blueprint(board_bp, url_prefix='/api/board')

    with app.app_context():
        db.create_all()

    return app
