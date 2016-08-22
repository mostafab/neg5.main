DELETE 

FROM tournament_team

WHERE tournament_id = $1 and id = $2 AND NOT EXISTS (
    SELECT team_id
    FROM team_plays_in_tournament_match 
    WHERE team_id = $2
)

RETURNING id;