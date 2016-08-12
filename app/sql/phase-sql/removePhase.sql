DELETE FROM
tournament_phase P
WHERE P.id = $2 AND P.tournament_id = $1
RETURNING *;