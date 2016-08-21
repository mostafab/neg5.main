UPDATE tournament_player

SET name = $3 

WHERE tournament_id = $1 AND id = $2

RETURNING *;