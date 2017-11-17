CREATE TYPE stats_report_type AS ENUM('team', 'individual', 'team_full', 'individual_full', 'round_report');

CREATE TABLE tournament_stat_report (
  id bigserial,
  tournament_id varchar(20) NOT NULL,
  phase_id varchar(20),
  statistics json NOT NULL,
  report_type stats_report_type NOT NULL,
  created_at timestamp DEFAULT NOW() NOT NULL,
  last_updated_at timestamp DEFAULT NOW() NOT NULL,

  PRIMARY KEY (id),
  FOREIGN KEY (tournament_id) REFERENCES tournament(id),
  FOREIGN KEY (tournament_id, phase_id) REFERENCES tournament_phase(tournament_id, id),
  UNIQUE(tournament_id, phase_id, report_type)
);

CREATE INDEX tournament_stat_report_tournament_id ON tournament_stat_report(tournament_id);
