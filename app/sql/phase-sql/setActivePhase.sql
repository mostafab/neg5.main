UPDATE tournament
SET active_phase_id = $2 
WHERE id = $1 AND $2 IN (
    SELECT P.id
    FROM tournament_phase P
    WHERE P.tournament_id = $1
)
RETURNING *;
