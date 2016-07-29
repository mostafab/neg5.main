INSERT INTO tournament_team (id, name, tournament_id, added_by) 
VALUES ($1, $2, $3, $4)
RETURNING *;