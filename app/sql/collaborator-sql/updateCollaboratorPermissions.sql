UPDATE user_collaborates_on_tournament
SET is_admin = $3
WHERE
username = $2 AND tournament_id = $1
RETURNING *;