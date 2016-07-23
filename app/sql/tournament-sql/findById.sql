SELECT  T.id, T.name, T.hidden, T.location, T.question_set, T.tournament_date, T.comments, T.director_id, 
        array_agg(json_build_object('type', TV.tossup_answer_type, 'value', TV.tossup_value)) AS tossup_point_scheme
        
FROM tournament T

LEFT OUTER JOIN

tournament_tossup_values TV

ON T.id = TV.tournament_id

WHERE T.id = $1

GROUP BY T.id

