CREATE INDEX hash_on_director_id ON tournament (director_id);

CREATE INDEX hash_on_tournament_team_tournament_id ON tournament_team (tournament_id);

CREATE INDEX hash_on_tournament_match_tournament_id ON tournament_match (tournament_id);
CREATE INDEX index_on_tournament_match_round ON tournament_match (round);

CREATE INDEX hash_on_tournament_player_tournament_id ON tournament_player (tournament_id);

CREATE INDEX hash_on_user_collaborates_username ON user_collaborates_on_tournament (username);

CREATE INDEX hash_on_tournament_tossup_values_tournament_id ON tournament_tossup_values (tournament_id);

CREATE INDEX hash_on_player_plays_in_match_tournament_id ON player_plays_in_tournament_match (tournament_id);
CREATE INDEX hash_on_player_plays_in_match_player_id ON player_plays_in_tournament_match (player_id);

CREATE INDEX hash_on_team_plays_in_match_tournament_id ON team_plays_in_tournament_match (tournament_id);
CREATE INDEX hash_on_team_plays_in_match_team_id ON team_plays_in_tournament_match (team_id);

CREATE INDEX hash_on_player_match_tossup_tournament_id ON player_match_tossup (tournament_id);
CREATE INDEX hash_on_player_match_tossup_player_id ON player_match_tossup (player_id);
CREATE INDEX hash_on_player_match_tossup_match_id ON player_match_tossup (match_id);

CREATE INDEX hash_on_tournament_phase_tournament_id ON tournament_phase (tournament_id);

