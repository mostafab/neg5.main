SELECT id, name
FROM tournament_phase 
WHERE id = $2 AND tournament_id = $1
LIMIT 1