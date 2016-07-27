BEGIN;

    INSERT INTO tournament_team (id, name, tournament_id, added_by) 
    VALUES ($1, $2, $3, $4) RETURNING *;

    INSERT INTO tournament_player (id, name, team_id, tournament_id, added_by)
    SELECT id, name, team_id, tournament_id, added_by FROM
        (
            SELECT 
                unnest($5) AS id,
                unnest($6) AS name,
                unnest($7) as team_id,
                unnest($8) as tournament_id,
                unnest($9) as added_by
        ) AS inner_table
    RETURNING *;

    INSERT INTO tournament_team_in_division(team_id, division_id, tournament_id)
    SELECT team_id, division_id, tournament_id FROM
        (
            SELECT
                unnest($10) AS team_id,
                unnest($11) AS division_id,
                unnest($12) AS tournament_id

        ) AS inner_table
    RETURNING *;

COMMIT;