SELECT  

tournament.id, 
tournament.name, 
tournament.location, 
tournament.question_set, 
tournament.tournament_date, 
tournament.director_id, 
union_result.is_admin,
CASE WHEN tournament.director_id = $1 THEN true ELSE false END AS is_owner

FROM

(
        SELECT T.id, T.director_id AS username, TRUE as is_admin
        FROM tournament T
        WHERE T.director_id = $1

        UNION

        SELECT U.tournament_id as id, U.username AS username, U.is_admin
        FROM user_collaborates_on_tournament U
        WHERE U.username = $1

) AS union_result

INNER JOIN 

tournament 

ON union_result.id = tournament.id