ALTER TABLE tournament_match
  ADD COLUMN serial_id varchar default NULL,
  ADD COLUMN added_at timestamp DEFAULT NOW(),
  ADD COLUMN last_updated_at timestamp DEFAULT NOW(),
  ADD CONSTRAINT unique_serial_id_tournament_id UNIQUE(serial_id, tournament_id);
