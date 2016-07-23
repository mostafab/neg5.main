UPDATE tournament
SET name = $2, location = $3, tournament_date = $4, question_set = $5, 
    comments = $6, hidden = $7
WHERE id = $1
RETURNING *