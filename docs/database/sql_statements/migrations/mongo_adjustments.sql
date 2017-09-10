alter table account alter column username type varchar(255);
alter table account add column mongo_id varchar(200);

alter table tournament alter column director_id type varchar(255);
alter table tournament_team alter column added_by type varchar(255);
alter table tournament_match alter column added_by type varchar(255);
alter table tournament_player alter column added_by type varchar(255);
alter table user_collaborates_on_tournament alter column username type varchar(255);

alter table tournament_phase alter column name type varchar(255);
alter table tournament_division alter column name type varchar(255);

alter table tournament_team alter column name type varchar(255);
alter table tournament_player alter column name type varchar(255);

alter table tournament_match alter column room type varchar(255);
alter table tournament_match alter column moderator type varchar(255);
alter table tournament_match alter column packet type varchar(255);