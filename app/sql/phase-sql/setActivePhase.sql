UPDATE tournament
SET active_phase_id = $2 
WHERE id = $1
RETURNING *;
