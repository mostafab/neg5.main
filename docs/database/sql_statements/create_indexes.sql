CREATE INDEX hash_on_director_id ON tournament USING hash (director_id);

CREATE INDEX hash_on_tournament_team_tournament_id ON tournament_team USING hash (tournament_id);

CREATE INDEX hash_on_tournament_match_tournament_id ON tournament_match USING hash (tournament_id);

CREATE INDEX hash_on_tournament_player_tournament_id ON tournament_playerUSING hash (tournament_id);

CREATE INDEX hash_on_user_collaborates_username ON tournament_team USING hash (username);

CREATE INDEX hash_on_tournament_tossup_values ON tournament_tossup_values USING hash (tournament_id);