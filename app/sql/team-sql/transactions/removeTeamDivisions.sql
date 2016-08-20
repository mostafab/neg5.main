DELETE 

FROM tournament_team_in_division

WHERE tournament_id = $1 AND team_id = $2;

