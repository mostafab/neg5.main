INSERT INTO tournament_division(id, name, phase_id, tournament_id)
VALUES ($2, $3, $4, $1)
RETURNING *;