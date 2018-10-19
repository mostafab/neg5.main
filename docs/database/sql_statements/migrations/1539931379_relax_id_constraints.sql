BEGIN;

alter table tournament_team
	alter column id type varchar(255);

alter table tournament_team_in_division
	alter column team_id type varchar(255);

alter table team_plays_in_tournament_match
	alter column team_id type varchar(255);

alter table tournament_player
  alter column team_id type varchar(255);

alter table tournament_player
	alter column id type varchar(255);

alter table player_plays_in_tournament_match
  alter column player_id type varchar(255);

alter table player_match_tossup
  alter column player_id type varchar(255);

alter table tournament_match
	alter column id type varchar(255);

alter table team_plays_in_tournament_match
  alter column match_id type varchar(255);

alter table player_plays_in_tournament_match
  alter column match_id type varchar(255);

alter table player_match_tossup
  alter column match_id type varchar(255);

alter table match_is_part_of_phase
  alter column match_id type varchar(255);

alter table tournament_phase
  alter column id type varchar(255);

alter table tournament_division
  alter column phase_id type varchar(255);

alter table match_is_part_of_phase
  alter column phase_id type varchar(255);

alter table tournament
  alter column active_phase_id type varchar(255);

alter table tournament_stat_report
  alter column phase_id type varchar(255);

COMMIT;

