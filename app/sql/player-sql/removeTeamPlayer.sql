DELETE

FROM tournament_player 

WHERE id = $2 AND tournament_id = $1 AND NOT EXISTS (
    SELECT player_id 
    FROM player_plays_in_tournament_match
    WHERE player_id = $2 AND tournament_id = $1
)

RETURNING id;