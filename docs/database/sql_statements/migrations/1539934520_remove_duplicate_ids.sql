BEGIN;

delete from tournament_match where id in (
select id
from tournament_match
group by id
having count(*) > 1 );

CREATE UNIQUE INDEX tournament_match_id_unique on tournament_match(id);

delete from team_plays_in_tournament_match where team_id in (
select id
from tournament_team
group by id
having count(*) > 1	
);

delete from tournament_team where id in (
select id
from tournament_team
group by id
having count(*) > 1);

CREATE UNIQUE INDEX tournament_team_id_unique on tournament_team(id);

delete from tournament_player where id in (
select id
from tournament_player
group by id
having count(*) > 1);

CREATE UNIQUE INDEX tournament_player_id_unique on tournament_player(id);

delete from tournament_division where id in (
select id
from tournament_division
group by id
having count(*) > 1);

CREATE UNIQUE INDEX tournament_division_id_unique on tournament_division(id);

delete from tournament_phase where id in (
select id
from tournament_phase
group by id
having count(*) > 1);

CREATE UNIQUE INDEX tournament_phase_id_unique on tournament_phase(id);

COMMIT;



