INSERT INTO tournament_phase (id, tournament_id, name)
VALUES ($2, $1, $3)
RETURNING *;
