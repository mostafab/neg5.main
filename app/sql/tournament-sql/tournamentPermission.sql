SELECT T.id AS tournament_id, T.director_id, U.username, U.is_admin,
    CASE WHEN T.director_id = $2 THEN true ELSE false END AS is_owner 

FROM 
    tournament T 
        LEFT JOIN 
    user_collaborates_on_tournament U
        ON T.id = U.tournament_id

WHERE T.id= $1 AND (T.director_id = $2 OR U.username = $2)

LIMIT 1

