DELETE 
FROM tournament_division
WHERE tournament_id = $1 AND id = $2
RETURNING id;