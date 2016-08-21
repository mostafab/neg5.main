DELETE

FROM tournament_player 

WHERE id = $2 AND tournament_id = $1

RETURNING id;