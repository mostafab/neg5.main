CREATE TABLE account (
    username varchar(20) NOT NULL,
    hash varchar(255) NOT NULL,
    hidden boolean DEFAULT false,
    PRIMARY KEY (username) 
);

CREATE TABLE tournament (
    id varchar(20) NOT NULL,
    name varchar(255) NOT NULL CHECK (char_length(name) > 0),
    tournament_date date,
    question_set varchar(255),
    comments text,
    hidden boolean,
    director_id varchar(20) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (director_id) REFERENCES account(username) ON DELETE SET NULL
);

CREATE TABLE tournament_team (
    id varchar(20) NOT NULL,
    name varchar(50) NOT NULL CHECK (char_length(name) > 0),
    tournament_id varchar(20) NOT NULL,
    added_by varchar(20) NOT NULL,
    PRIMARY KEY (id, tournament_id),
    FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES account(username) ON DELETE SET NULL,
    UNIQUE (name, tournament_id)
);

CREATE TABLE tournament_match (
    id varchar(20) NOT NULL,
    tournament_id varchar(20) NOT NULL,
    round integer DEFAULT 0 CHECK (round >= 0),
    room VARCHAR(20),
    moderator VARCHAR(20),
    packet VARCHAR(20),
    tossups_heard integer DEFAULT 0 CHECK (tossups_heard >= 0),
    added_by varchar(20) NOT NULL,
    PRIMARY KEY (id, tournament_id),
    FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES account(username) ON DELETE SET NULL
);

CREATE TABLE tournament_player (
    id varchar(20) NOT NULL,
    name varchar(50) NOT NULL CHECK (char_length(name) > 0),
    team_id varchar(20) NOT NULL,
    tournament_id varchar(20) NOT NULL,
    added_by varchar(20) NOT NULL,
    PRIMARY KEY (id, tournament_id),
    FOREIGN KEY (team_id, tournament_id) REFERENCES tournament_team(id, tournament_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES account(username) ON DELETE SET NULL
);

CREATE TABLE user_collaborates_on_tournament (
    username varchar(20) NOT NULL,
    tournament_id varchar(20) NOT NULL,
    is_admin boolean DEFAULT false,
    PRIMARY KEY (username, tournament_id),
    FOREIGN KEY (username) REFERENCES account(username) ON DELETE CASCADE,
    FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE
);

CREATE TYPE answer_type AS ENUM('Power', 'Base', 'Neg');

CREATE TABLE tournament_tossup_values (
    tournament_id varchar(20) NOT NULL,
    tossup_value integer NOT NULL,
    tossup_answer_type answer_type NOT NULL,
    PRIMARY KEY (tournament_id, tossup_value),
    FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE
);

CREATE TABLE player_plays_in_tournament_match (
    player_id varchar(20) NOT NULL,
    match_id varchar(20) NOT NULL,
    tournament_id varchar(20) NOT NULL,
    tossups_heard integer DEFAULT 0 CHECK (tossups_heard >= 0),
    PRIMARY KEY (player_id, match_id, tournament_id),
    FOREIGN KEY (player_id, tournament_id) REFERENCES tournament_player(id, tournament_id) ON DELETE CASCADE,
    FOREIGN KEY (match_id, tournament_id) REFERENCES tournament_match(id, tournament_id) ON DELETE CASCADE   
);

CREATE TABLE team_plays_in_tournament_match (
    team_id varchar(20) NOT NULL,
    match_id varchar(20) NOT NULL,
    tournament_id varchar(20) NOT NULL,
    score integer NOT NULL,
    bounceback_points integer DEFAULT 0 CHECK (bounceback_points >= 0),
    PRIMARY KEY (team_id, match_id, tournament_id),
    FOREIGN KEY (team_id, tournament_id) REFERENCES tournament_team(id, tournament_id) ON DELETE CASCADE,
    FOREIGN KEY (match_id, tournament_id) REFERENCES tournament_match(id, tournament_id) ON DELETE CASCADE  
);

CREATE TABLE player_match_tossup (
    player_id varchar(20) NOT NULL,
    match_id varchar(20) NOT NULL,
    tournament_id varchar(20) NOT NULL,
    tossup_value integer NOT NULL,
    number_gotten integer DEFAULT 0 NOT NULL CHECK (number_gotten >= 0),
    PRIMARY KEY (player_id, match_id, tournament_id, tossup_value),
    FOREIGN KEY (player_id, tournament_id) REFERENCES tournament_player(id, tournament_id) ON DELETE CASCADE,
    FOREIGN KEY (match_id, tournament_id) REFERENCES tournament_match(id, tournament_id) ON DELETE CASCADE,
    FOREIGN KEY (tournament_id, tossup_value) REFERENCES tournament_tossup_values(tournament_id, tossup_value)
);

CREATE TABLE tournament_phase (
    id varchar(20) NOT NULL,
    name varchar(50) NOT NULL CHECK (char_length(name) > 0),
    tournament_id varchar(20) NOT NULL,
    PRIMARY KEY (id, tournament_id),
    FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
    UNIQUE (name, tournament_id)  
);

CREATE TABLE match_is_part_of_phase (
    match_id varchar(20) NOT NULL,
    tournament_id varchar(20) NOT NULL,
    phase_id varchar(20) NOT NULL,
    PRIMARY KEY (match_id, tournament_id, phase_id),
    FOREIGN KEY (match_id, tournament_id) REFERENCES tournament_match(id, tournament_id) ON DELETE CASCADE,
    FOREIGN KEY (phase_id, tournament_id) REFERENCES tournament_phase(id, tournament_id)
);

CREATE TABLE tournament_division (
    id varchar(20) NOT NULL,
    name varchar(50) NOT NULL CHECK (char_length(name) > 0),
    tournament_id varchar(20) NOT NULL,
    phase_id varchar(20) NOT NULL,
    PRIMARY KEY (id, tournament_id),
    FOREIGN KEY (phase_id, tournament_id) REFERENCES tournament_phase(id, tournament_id) ON DELETE CASCADE,
    UNIQUE (tournament_id, phase_id, name)
);

CREATE TABLE tournament_team_in_division (
    team_id varchar(20) NOT NULL,
    division_id varchar(20) NOT NULL,
    tournament_id varchar(20) NOT NULL,
    PRIMARY KEY (team_id, division_id, tournament_id),
    FOREIGN KEY (division_id, tournament_id) REFERENCES tournament_division(id, tournament_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id, tournament_id) REFERENCES tournament_team(id, tournament_id) ON DELETE CASCADE
);




