SELECT *
FROM 

(
    SELECT
        T.id,
        T.name,
        COALESCE(array_agg(json_build_object('name', P.name, 'id', P.id, 'teamId', P.team_id)) FILTER (WHERE P.name IS NOT NULL), '{}') as players
        
    FROM
    
    tournament_team T
    
    LEFT JOIN 
    
    tournament_player P
    
    ON T.id = P.team_id AND T.tournament_id = P.tournament_id
    
    WHERE T.tournament_id = ${tournamentId}
    
    GROUP BY T.id, T.tournament_id
    
) as team_players














    
    

