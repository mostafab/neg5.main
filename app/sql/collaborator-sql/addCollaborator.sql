INSERT INTO user_collaborates_on_tournament(tournament_id, username, is_admin)
VALUES ($1, $2, $3)
RETURNING *;