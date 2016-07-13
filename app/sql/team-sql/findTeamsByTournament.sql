SELECT team.id AS team_id, team.tournament_id AS tournament_id, team.name, team.added_by, team_division_info.team_divisions
FROM 
(
    tournament_team team

    INNER JOIN

    (
        SELECT test.team_id AS team_id, test.team_divisions AS team_divisions
        FROM 
        (
            SELECT  team_divisions.team_id as team_id, 
                    array_agg(array[phase.id::varchar, phase.name::varchar, team_divisions.division_name::varchar, team_divisions.division_id::varchar]) AS team_divisions
            FROM

            (       
                SELECT  team_division.team_id AS team_id, division.id AS division_id, division.name AS division_name, division.phase_id AS phase_id, division.tournament_id AS tournament_id
                FROM
                tournament_team_in_division team_division
                INNER JOIN
                tournament_division division
                ON team_division.tournament_id = division.tournament_id AND team_division.division_id = division.id 
                -- WHERE division.tournament_id = $1
            ) AS team_divisions

            INNER JOIN

            tournament_phase phase 

            ON phase.id = team_divisions.phase_id AND phase.tournament_id = team_divisions.tournament_id 

            GROUP BY team_divisions.team_id, phase.tournament_id

        ) AS test
        
    ) AS team_division_info

    ON team.id = team_division_info.team_id
)

ORDER BY team.name

-- SELECT  team.tournament_id, team.id AS team_id, team.name AS team_name, team.added_by,
--         array_agg(array[phase.id::varchar, phase.name::varchar, t_division.name::varchar, t_division.id::varchar]) AS team_divisions

-- FROM 

-- tournament_team team

-- INNER JOIN 

-- tournament_team_in_division team_division

-- ON team.id = team_division.team_id AND team.tournament_id = team_division.tournament_id

-- INNER JOIN tournament_division t_division 

-- ON team_division.division_id = t_division.id AND team_division.tournament_id = t_division.tournament_id
--     AND team.tournament_id = t_division.tournament_id

-- INNER JOIN tournament_phase phase

-- ON phase.id = t_division.phase_id AND phase.tournament_id = t_division.tournament_id

-- -- WHERE team.tournament_id = $1

-- GROUP BY team.id, team.tournament_id

-- ORDER BY team.name

 






    
    

