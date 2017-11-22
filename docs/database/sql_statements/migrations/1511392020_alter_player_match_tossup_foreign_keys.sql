begin;

alter table player_match_tossup
drop constraint player_match_tossup_player_id_fkey;

alter table player_match_tossup
add constraint player_match_tossup_player_id_fkey
foreign key (player_id, tournament_id)
references tournament_player(id, tournament_id)
on delete cascade;

alter table player_match_tossup
add constraint player_match_tossup_player_plays_in_tournament_match_fkey
foreign key (player_id, match_id, tournament_id)
references player_plays_in_tournament_match(player_id, match_id, tournament_id)
on delete cascade;

commit;

