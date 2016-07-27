SELECT A.username, A.name, U.is_admin
FROM user_collaborates_on_tournament U 
NATURAL JOIN
account A
WHERE U.tournament_id = $1;