create table scoresheet (
  id bigserial,
  tournament_id varchar(20) REFERENCES tournament(id),
  moderator text,
  notes text,
  on_tossup boolean,
  packet text,
  room text,
  round int,
  submitted boolean,
  phases json,
  cycles json,
  current_cycle json
);
