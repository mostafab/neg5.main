SELECT tp_cross.team_name as name, tp_cross.team_id, tp_cross.tournament_id, tp_cross.added_by, 
    array_agg(json_build_object('phase_id', tp_cross.phase_id, 'phase_name', tp_cross.phase_name, 'division_id', team_divisions.division_id, 'division_name', team_divisions.division_name)) as team_divisions 

FROM 

    (
        SELECT T.name AS team_name, T.id AS team_id, T.tournament_id, T.added_by, P.name as phase_name, P.id AS phase_id
        FROM 
        tournament_team T, tournament_phase P
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


-- SELECT team.id AS team_id, team.tournament_id AS tournament_id, team.name, team.added_by, team_division_info.team_divisions
-- FROM 
-- (
--     tournament_team team

--     LEFT OUTER JOIN

--     (
--         SELECT test.team_id AS team_id, test.team_divisions AS team_divisions
--         FROM 
--         (
--             SELECT  team_division.team_id as team_id,
--                     array_agg(json_build_object('phase_id', divisions.phase_id, 'phase_name', divisions.phase_name, 'division_name', divisions.division_name, 'division_id', divisions.division_id)) AS team_divisions
--             FROM
--             (
--                 SELECT tournament_division.id AS division_id, tournament_division.name AS division_name, phase.id AS phase_id, phase.name AS phase_name, phase.tournament_id
--                 FROM
--                 tournament_division 
--                 RIGHT OUTER JOIN
--                 tournament_phase phase
--                 ON tournament_division.phase_id = phase.id AND tournament_division.tournament_id = phase.tournament_id
--                 WHERE phase.tournament_id = $1
--             ) AS divisions

--             LEFT OUTER JOIN

--             tournament_team_in_division team_division

--             ON divisions.division_id = team_division.division_id AND divisions.tournament_id = team_division.tournament_id
            
--             GROUP BY team_division.team_id, divisions.tournament_id

--         ) AS test
        
--     ) AS team_division_info

--     ON team.id = team_division_info.team_id
-- )

-- WHERE tournament_id = $1

-- ORDER BY team.name
 



-- SELECT team.id AS team_id, team.tournament_id AS tournament_id, team.name, team.added_by, team_division_info.team_divisions
-- FROM 
-- (
--     tournament_team team

--     LEFT OUTER JOIN

--     (
--         SELECT test.team_id AS team_id, test.team_divisions AS team_divisions
--         FROM 
--         (
--             SELECT  divisions.team_id as team_id,
--                     array_agg(json_build_object('phase_id', phase.id, 'phase_name', phase.name, 'division_name', divisions.division_name, 'division_id', divisions.division_id)) AS team_divisions
--             FROM

--             (       
--                 SELECT  team_division.team_id AS team_id, division.id AS division_id, division.name AS division_name, division.phase_id AS phase_id, division.tournament_id AS tournament_id
--                 FROM
--                 tournament_team_in_division team_division
--                 INNER JOIN
--                 tournament_division division
--                 ON team_division.tournament_id = division.tournament_id AND team_division.division_id = division.id 
--                 WHERE division.tournament_id = $1
--             ) AS divisions

--             RIGHT OUTER JOIN

--             tournament_phase phase 

--             ON phase.id = divisions.phase_id AND phase.tournament_id = divisions.tournament_id 
            
--             GROUP BY divisions.team_id, phase.tournament_id

--         ) AS test
        
--     ) AS team_division_info

--     ON team.id = team_division_info.team_id
-- )

-- WHERE tournament_id = $1

-- ORDER BY team.name
 

-- SELECT T.name AS team_name, T.id AS team_id, T.added_by, P.name AS phase_name, P.id AS phase_id
-- FROM
-- tournament_team T, tournament_phase P
-- WHERE T.tournament_id = $1








    
    

