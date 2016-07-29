INSERT INTO tournament_team_in_division(team_id, division_id, tournament_id)
SELECT team_id, division_id, tournament_id FROM
    (
        SELECT
            unnest(cast($1 as varchar[])) AS team_id,
            unnest(cast($2 as varchar[])) AS division_id,
            unnest(cast($3 as varchar[])) AS tournament_id

    ) AS inner_table
RETURNING *;