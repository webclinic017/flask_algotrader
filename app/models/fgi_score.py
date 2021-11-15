from .. import db


class Fgi_score(db.Model):
    __tablename__ = 'Fgi_Scores'
    id = db.Column('id', db.Integer, primary_key=True)
    score_time = db.Column('score_time_cnn', db.DateTime)
    fgi_value = db.Column('fgi_value_cnn', db.Integer)
    fgi_text = db.Column('fgi_text_cnn', db.String)

    def add_score(self):
        db.session.add(self)
        db.session.commit()

