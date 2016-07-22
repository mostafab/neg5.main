SELECT  T.id, T.name, T.location, T.question_set, T.tournament_date, T.comments, T.director_id

FROM tournament T

WHERE T.id = $1