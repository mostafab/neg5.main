UPDATE tournament_phase
SET name = $3
WHERE id = $2 AND tournament_id = $1
RETURNING *;