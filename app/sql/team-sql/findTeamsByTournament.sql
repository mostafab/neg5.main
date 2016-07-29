SELECT team.id AS team_id, team.tournament_id AS tournament_id, team.name, team.added_by, team_division_info.team_divisions
FROM 
(
    tournament_team team

    LEFT OUTER JOIN

    (
        SELECT test.team_id AS team_id, test.team_divisions AS team_divisions
        FROM 
        (
            SELECT  team_divisions.team_id as team_id, 
                    -- array_agg(array[phase.id::varchar, phase.name::varchar, team_divisions.division_name::varchar, team_divisions.division_id::varchar]) AS team_divisions,
                    array_agg(json_build_object('phase_id', phase.id, 'phase_name', phase.name, 'division_name', team_divisions.division_name, 'division_id', team_divisions.division_id)) AS team_divisions
            FROM

            (       
                SELECT  team_division.team_id AS team_id, division.id AS division_id, division.name AS division_name, division.phase_id AS phase_id, division.tournament_id AS tournament_id
                FROM
                tournament_team_in_division team_division
                INNER JOIN
                tournament_division division
                ON team_division.tournament_id = division.tournament_id AND team_division.division_id = division.id 
                WHERE division.tournament_id = $1
            ) AS team_divisions

            INNER JOIN

            tournament_phase phase 

            ON phase.id = team_divisions.phase_id AND phase.tournament_id = team_divisions.tournament_id 
            
            GROUP BY team_divisions.team_id, phase.tournament_id

        ) AS test
        
    ) AS team_division_info

    ON team.id = team_division_info.team_id
)

WHERE tournament_id = $1

ORDER BY team.name
 






    
    

