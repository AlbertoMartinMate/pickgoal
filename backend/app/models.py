from datetime import datetime, timezone, timedelta
from app import db


STATUSES = [
    (0,    'Rookie',     '🥚'),
    (50,   'Novato',     '👟'),
    (150,  'Aficionado', '⚽'),
    (300,  'Crack',      '🌟'),
    (600,  'Experto',    '🔥'),
    (1000, 'Elite',      '💎'),
    (2000, 'Leyenda',    '👑'),
]


def get_user_status(pts):
    current_idx = 0
    for i, (threshold, _, __) in enumerate(STATUSES):
        if pts >= threshold:
            current_idx = i
    threshold, name, emoji = STATUSES[current_idx]
    next_entry = STATUSES[current_idx + 1] if current_idx + 1 < len(STATUSES) else None
    return {
        'name': name,
        'emoji': emoji,
        'threshold': threshold,
        'next_threshold': next_entry[0] if next_entry else None,
        'next_name': next_entry[1] if next_entry else None,
        'next_emoji': next_entry[2] if next_entry else None,
    }


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    country = db.Column(db.String(60))
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_bot = db.Column(db.Boolean, default=False, nullable=False)
    total_points_all_time = db.Column(db.Integer, default=0, nullable=False)
    current_division = db.Column(db.Integer, default=1, nullable=False)
    current_league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    predictions = db.relationship('Prediction', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    champion_predictions = db.relationship('ChampionPrediction', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    league_memberships = db.relationship('LeagueMember', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    board_messages = db.relationship('BoardMessage', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_email=False):
        pts_all_time = self.total_points_all_time or 0
        data = {
            'id': self.id,
            'username': self.username,
            'country': self.country,
            'is_admin': self.is_admin,
            'is_bot': self.is_bot,
            'created_at': self.created_at.isoformat(),
            'total_points_all_time': pts_all_time,
            'status': get_user_status(pts_all_time),
        }
        if include_email:
            data['email'] = self.email
        return data

    def total_points(self):
        from sqlalchemy import func
        result = db.session.query(func.sum(Prediction.total_points)).filter(
            Prediction.user_id == self.id
        ).scalar() or 0
        champion_pts = db.session.query(func.sum(ChampionPrediction.points_earned)).filter(
            ChampionPrediction.user_id == self.id
        ).scalar() or 0
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
    competition_id = db.Column(db.Integer, db.ForeignKey('competitions.id'), nullable=True)
    importance_score = db.Column(db.Float, nullable=True)

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
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=True)
    predicted_result = db.Column(db.String(1), nullable=False)  # 1, X, 2
    predicted_home = db.Column(db.Integer, nullable=False)
    predicted_away = db.Column(db.Integer, nullable=False)
    pts_result = db.Column(db.Integer, default=0)
    pts_score = db.Column(db.Integer, default=0)
    total_points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'match_id', 'league_id', name='uq_user_match_league'),)

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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=True)
    team_name = db.Column(db.String(60), nullable=False)
    points_earned = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'league_id', name='uq_champion_user_league'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'league_id': self.league_id,
            'team_name': self.team_name,
            'points_earned': self.points_earned,
            'created_at': self.created_at.isoformat(),
        }


class League(db.Model):
    __tablename__ = 'leagues'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    invite_code = db.Column(db.String(20), unique=True)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    is_official = db.Column(db.Boolean, default=False, nullable=False)
    prize = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    creator = db.relationship('User', foreign_keys=[created_by])
    members = db.relationship('LeagueMember', backref='league', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_code=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_by': self.created_by,
            'creator_username': self.creator.username if self.creator else None,
            'is_public': self.is_public,
            'is_official': self.is_official,
            'prize': self.prize,
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
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('board_messages.id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    is_pinned = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    replies = db.relationship('BoardMessage', backref=db.backref('parent', remote_side='BoardMessage.id'),
                              lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'league_id': self.league_id,
            'parent_id': self.parent_id,
            'username': self.user.username if self.user else 'Desconocido',
            'message': self.message if not self.is_deleted else '[Mensaje eliminado]',
            'is_deleted': self.is_deleted,
            'is_pinned': self.is_pinned,
            'created_at': self.created_at.isoformat(),
        }


class PushSubscription(db.Model):
    __tablename__ = 'push_subscriptions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    endpoint = db.Column(db.Text, nullable=False)
    p256dh = db.Column(db.Text, nullable=False)
    auth = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'endpoint', name='uq_push_user_endpoint'),)


class Season(db.Model):
    __tablename__ = 'seasons'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10), nullable=False)  # e.g. '26/27'
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False, default='active')  # active/finished

    jornadas = db.relationship('Jornada', backref='season', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'status': self.status,
        }


class Competition(db.Model):
    __tablename__ = 'competitions'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)  # ESP/UCL/ENG/etc
    name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Integer, nullable=False, default=1)
    max_per_jornada = db.Column(db.Integer, nullable=False, default=5)

    matches = db.relationship('Match', backref='competition', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'weight': self.weight,
            'max_per_jornada': self.max_per_jornada,
        }


class Jornada(db.Model):
    __tablename__ = 'jornadas'

    id = db.Column(db.Integer, primary_key=True)
    season_id = db.Column(db.Integer, db.ForeignKey('seasons.id'), nullable=False)
    number = db.Column(db.Integer, nullable=False)
    date_start = db.Column(db.DateTime, nullable=False)
    date_end = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(10), nullable=False, default='upcoming')  # upcoming/active/finished

    jornada_matches = db.relationship('JornadaMatch', backref='jornada', lazy='dynamic', cascade='all, delete-orphan')
    duelos = db.relationship('Duelo', backref='jornada', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'season_id': self.season_id,
            'number': self.number,
            'date_start': self.date_start.replace(tzinfo=timezone.utc).isoformat(),
            'date_end': self.date_end.replace(tzinfo=timezone.utc).isoformat(),
            'status': self.status,
        }


class JornadaMatch(db.Model):
    __tablename__ = 'jornada_matches'

    id = db.Column(db.Integer, primary_key=True)
    jornada_id = db.Column(db.Integer, db.ForeignKey('jornadas.id'), nullable=False)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    odds_1 = db.Column(db.Float, nullable=True)
    odds_x = db.Column(db.Float, nullable=True)
    odds_2 = db.Column(db.Float, nullable=True)
    calculated_at = db.Column(db.DateTime, nullable=True)

    match = db.relationship('Match', backref='jornada_matches')
    predictions_v2 = db.relationship('PredictionV2', backref='jornada_match', lazy='dynamic', cascade='all, delete-orphan')

    __table_args__ = (db.UniqueConstraint('jornada_id', 'match_id', name='uq_jornada_match'),)

    def to_dict(self):
        return {
            'id': self.id,
            'jornada_id': self.jornada_id,
            'match_id': self.match_id,
            'odds_1': self.odds_1,
            'odds_x': self.odds_x,
            'odds_2': self.odds_2,
            'calculated_at': self.calculated_at.isoformat() if self.calculated_at else None,
        }


class PredictionV2(db.Model):
    __tablename__ = 'predictions_v2'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    jornada_match_id = db.Column(db.Integer, db.ForeignKey('jornada_matches.id'), nullable=False)
    predicted_result = db.Column(db.String(1), nullable=False)  # 1/X/2
    units_wagered = db.Column(db.Integer, nullable=False, default=1)  # 0-5
    points_earned = db.Column(db.Float, nullable=True)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'jornada_match_id', 'league_id', name='uq_v2_user_jmatch_league'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'jornada_match_id': self.jornada_match_id,
            'predicted_result': self.predicted_result,
            'units_wagered': self.units_wagered,
            'points_earned': self.points_earned,
            'league_id': self.league_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }


class Duelo(db.Model):
    __tablename__ = 'duelos'

    id = db.Column(db.Integer, primary_key=True)
    jornada_id = db.Column(db.Integer, db.ForeignKey('jornadas.id'), nullable=False)
    division_league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=False)
    player1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    player2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    points_player1 = db.Column(db.Float, default=0.0)
    points_player2 = db.Column(db.Float, default=0.0)
    winner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    div_points_p1 = db.Column(db.Integer, default=0)  # 3/1/0
    div_points_p2 = db.Column(db.Integer, default=0)  # 3/1/0

    player1 = db.relationship('User', foreign_keys=[player1_id])
    player2 = db.relationship('User', foreign_keys=[player2_id])
    winner = db.relationship('User', foreign_keys=[winner_id])

    def to_dict(self):
        return {
            'id': self.id,
            'jornada_id': self.jornada_id,
            'division_league_id': self.division_league_id,
            'player1_id': self.player1_id,
            'player2_id': self.player2_id,
            'points_player1': self.points_player1,
            'points_player2': self.points_player2,
            'winner_id': self.winner_id,
            'div_points_p1': self.div_points_p1,
            'div_points_p2': self.div_points_p2,
        }


class DivisionMember(db.Model):
    __tablename__ = 'division_members'

    id = db.Column(db.Integer, primary_key=True)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_bot = db.Column(db.Boolean, default=False, nullable=False)
    division = db.Column(db.Integer, nullable=False, default=1)
    season_div_points = db.Column(db.Integer, default=0, nullable=False)
    season_total_points = db.Column(db.Float, default=0.0, nullable=False)
    position = db.Column(db.Integer, nullable=True)
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref='division_memberships')

    __table_args__ = (db.UniqueConstraint('league_id', 'user_id', name='uq_division_member'),)

    def to_dict(self):
        return {
            'id': self.id,
            'league_id': self.league_id,
            'user_id': self.user_id,
            'is_bot': self.is_bot,
            'division': self.division,
            'season_div_points': self.season_div_points,
            'season_total_points': self.season_total_points,
            'position': self.position,
            'joined_at': self.joined_at.isoformat(),
        }
