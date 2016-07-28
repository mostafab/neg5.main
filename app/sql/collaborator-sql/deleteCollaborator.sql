DELETE 
FROM user_collaborates_on_tournament UT
where tournament_id = $1 AND username = $2
RETURNING *;