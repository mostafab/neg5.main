UPDATE tournament 
SET max_active_players_per_team = $2, bouncebacks = $3
WHERE id = $1
RETURNING id, max_active_players_per_team, bouncebacks;