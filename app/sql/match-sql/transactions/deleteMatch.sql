DELETE

FROM

tournament_match

WHERE tournament_id = $1 AND id = $2;