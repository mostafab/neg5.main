SELECT  T.id, T.name, T.director_id, U.is_admin, 
        CASE WHEN T.director_id=$1 THEN true ELSE false END AS is_owner 
FROM tournament T LEFT JOIN user_collaborates_on_tournament U ON T.id=U.tournament_id
WHERE T.director_id=$1 OR U.username=$1;