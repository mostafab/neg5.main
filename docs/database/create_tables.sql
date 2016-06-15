CREATE TABLE user (
    username varchar(20) NOT NULL,
    hash varchar(255) NOT NULL,
    hidden boolean DEFAULT false,
    primary key (username)
);

CREATE TABLE tournament (
    id serial NOT NULL,
    name varchar(255) NOT NULL,
    tournament_date date,
    question_set varchar(255),
    comments text,
    hidden boolean,
    director_id varchar(20) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (director_id) REFERENCES user(username)
);

CREATE TABLE tournament_team (
    id serial NOT NULL,
    name varchar(50) NOT NULL,
    tournament_id integer NOT NULL,
    added_by varchar(20) NOT NULL,
    PRIMARY KEY (id, tournament_id),
    FOREIGN KEY (tournament_id) REFERENCES tournament(id),
    FOREIGN KEY (added_by) REFERENCES user,
    UNIQUE (name, tournament_id)
);

CREATE TABLE tournament_match (
    id serial NOT NULL,
    tournament_id integer NOT NULL,
    round integer DEFAULT 0 CHECK (round >= 0),
    room VARCHAR(20),
    moderator VARCHAR(20),
    packet VARCHAR(20),
    tossups_heard integer DEFAULT 0 CHECK (tossups_heard >= 0),
    added_by varchar(20) NOT NULL,
    PRIMARY KEY (id, tournament_id),
    FOREIGN KEY (tournament_id) REFERENCES tournament(id)
);

