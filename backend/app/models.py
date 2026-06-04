from datetime import datetime, timezone, timedelta
from app import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    country = db.Column(db.String(60))
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    predictions = db.relationship('Prediction', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    champion_prediction = db.relationship('ChampionPrediction', backref='user', uselist=False, cascade='all, delete-orphan')
    league_memberships = db.relationship('LeagueMember', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    board_messages = db.relationship('BoardMessage', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_email=False):
        data = {
            'id': self.id,
            'username': self.username,
            'country': self.country,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat(),
        }
        if include_email:
            data['email'] = self.email
        return data

    def total_points(self):
        from sqlalchemy import func
        result = db.session.query(func.sum(Prediction.total_points)).filter(
            Prediction.user_id == self.id
        ).scalar() or 0
        champion_pts = self.champion_prediction.points_earned if self.champion_prediction else 0
        return result + champion_pts


class Match(db.Model):
    __tablename__ = 'matches'

    PHASES = ['group', 'r32', 'r16', 'quarters', 'semis', 'third', 'final']
    STATUSES = ['scheduled', 'live', 'finished']

    id = db.Column(db.Integer, primary_key=True)
    api_id = db.Column(db.Integer, unique=True, nullable=False)
    phase = db.Column(db.String(20), nullable=False)
    group_name = db.Column(db.String(10))
    home_team = db.Column(db.String(60), nullable=False)
    away_team = db.Column(db.String(60), nullable=False)
    match_datetime = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='scheduled', nullable=False)
    home_score_90 = db.Column(db.Integer)
    away_score_90 = db.Column(db.Integer)
    home_score_final = db.Column(db.Integer)
    away_score_final = db.Column(db.Integer)
    result_90 = db.Column(db.String(1))  # 1, X, 2
    last_updated = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    predictions = db.relationship('Prediction', backref='match', lazy='dynamic', cascade='all, delete-orphan')

    def is_locked(self):
        dt_utc = self.match_datetime.replace(tzinfo=timezone.utc)
        return self.status != 'scheduled' or datetime.now(timezone.utc) >= dt_utc - timedelta(minutes=30)

    def to_dict(self):
        dt_iso = self.match_datetime.replace(tzinfo=timezone.utc).isoformat()
        return {
            'id': self.id,
            'api_id': self.api_id,
            'phase': self.phase,
            'group_name': self.group_name,
            'home_team': self.home_team,
            'away_team': self.away_team,
            'match_datetime': dt_iso,
            'status': self.status,
            'is_locked': self.is_locked(),
            'home_score_90': self.home_score_90,
            'away_score_90': self.away_score_90,
            'home_score_final': self.home_score_final,
            'away_score_final': self.away_score_final,
            'result_90': self.result_90,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
        }

    def points_for_phase(self):
        phase_points = {
            'group': (1, 1),
            'r32': (2, 2),
            'r16': (3, 3),
            'quarters': (4, 4),
            'semis': (5, 5),
            'third': (5, 5),
            'final': (6, 6),
        }
        return phase_points.get(self.phase, (1, 1))


class Prediction(db.Model):
    __tablename__ = 'predictions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    predicted_result = db.Column(db.String(1), nullable=False)  # 1, X, 2
    predicted_home = db.Column(db.Integer, nullable=False)
    predicted_away = db.Column(db.Integer, nullable=False)
    pts_result = db.Column(db.Integer, default=0)
    pts_score = db.Column(db.Integer, default=0)
    total_points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'match_id', name='uq_user_match'),)

    def to_dict(self, reveal_score=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'match_id': self.match_id,
            'predicted_result': self.predicted_result,
            'pts_result': self.pts_result,
            'pts_score': self.pts_score,
            'total_points': self.total_points,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
        if reveal_score:
            data['predicted_home'] = self.predicted_home
            data['predicted_away'] = self.predicted_away
        return data


class ChampionPrediction(db.Model):
    __tablename__ = 'champion_predictions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    team_name = db.Column(db.String(60), nullable=False)
    points_earned = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'team_name': self.team_name,
            'points_earned': self.points_earned,
            'created_at': self.created_at.isoformat(),
        }


class League(db.Model):
    __tablename__ = 'leagues'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    invite_code = db.Column(db.String(20), unique=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    creator = db.relationship('User', foreign_keys=[created_by])
    members = db.relationship('LeagueMember', backref='league', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_code=False):
        data = {
            'id': self.id,
            'name': self.name,
            'created_by': self.created_by,
            'creator_username': self.creator.username if self.creator else None,
            'is_public': self.is_public,
            'member_count': self.members.count(),
            'created_at': self.created_at.isoformat(),
        }
        if include_code:
            data['invite_code'] = self.invite_code
        return data


class LeagueMember(db.Model):
    __tablename__ = 'league_members'

    id = db.Column(db.Integer, primary_key=True)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('league_id', 'user_id', name='uq_league_member'),)


class BoardMessage(db.Model):
    __tablename__ = 'board_messages'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'Desconocido',
            'message': self.message if not self.is_deleted else '[Mensaje eliminado]',
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat(),
        }
