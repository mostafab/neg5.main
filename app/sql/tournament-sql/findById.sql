SELECT  
        T.id, 
        T.name, 
        T.hidden, 
        T.location, 
        T.question_set, 
        T.tournament_date, 
        T.comments, 
        T.director_id, 
        T.parts_per_bonus, 
        T.bonus_point_value, 
        T.max_active_players_per_team, 
        T.bouncebacks,
        T.active_phase_id,
        array_agg(json_build_object('type', TV.tossup_answer_type, 'value', TV.tossup_value)) AS tossup_point_scheme,
        P.name as active_phase_name
        
FROM tournament T

LEFT OUTER JOIN

tournament_tossup_values TV

ON T.id = TV.tournament_id

LEFT OUTER JOIN tournament_phase P

ON T.active_phase_id = P.id AND T.id = P.tournament_id

WHERE T.id = $1

GROUP BY T.id, P.name

