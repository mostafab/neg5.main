begin;

alter table player_plays_in_tournament_match
drop constraint player_plays_in_tournament_match_player_id_fkey;

alter table player_plays_in_tournament_match
add constraint player_plays_in_tournament_match_tournament_player_fkey
foreign key (player_id, tournament_id)
references tournament_player(id, tournament_id)
on delete cascade;

commit;

