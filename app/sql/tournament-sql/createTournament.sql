INSERT INTO tournament (id, name, tournament_date, question_set, comments, location, director_id) 
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;