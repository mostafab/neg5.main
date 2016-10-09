SELECT *
FROM 

(
    SELECT tp_cross.team_name as name, tp_cross.team_id, tp_cross.tournament_id, tp_cross.added_by, 
        array_agg(json_build_object('phase_id', tp_cross.phase_id, 'phase_name', tp_cross.phase_name, 'division_id', team_divisions.division_id, 'division_name', team_divisions.division_name)) as team_divisions 

    FROM 

        (
            SELECT T.name AS team_name, T.id AS team_id, T.tournament_id, T.added_by, P.name as phase_name, P.id AS phase_id
            FROM 
            tournament_team T LEFT JOIN tournament_phase P
            ON 1 = 1
            WHERE T.tournament_id = $1
        ) AS tp_cross

        LEFT JOIN 

        (
            SELECT D.id AS division_id, D.name AS division_name, D.phase_id, TD.team_id, TD.tournament_id
            FROM 
            tournament_division D
            INNER JOIN
            tournament_team_in_division TD
            ON D.id = TD.division_id AND D.tournament_id = TD.tournament_id
            WHERE D.tournament_id = $1
        ) AS team_divisions

        ON tp_cross.phase_id = team_divisions.phase_id AND tp_cross.team_id = team_divisions.team_id

    GROUP BY tp_cross.tournament_id, tp_cross.team_id, tp_cross.team_name, tp_cross.added_by
    
) as team_phases

INNER JOIN

(
    SELECT T.id as team_id, 
        array_agg(json_build_object('player_name', P.name, 'player_id', P.id)) as players
        
    FROM
    
    tournament_team T
    
    LEFT JOIN 
    
    tournament_player P
    
    ON T.id = P.team_id AND T.tournament_id = P.tournament_id
    
    WHERE T.tournament_id = $1 AND P.tournament_id = $1
    
    GROUP BY T.id
    
) as team_players

ON team_phases.team_id = team_players.team_id














    
    

