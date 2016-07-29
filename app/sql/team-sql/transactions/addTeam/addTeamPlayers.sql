INSERT INTO tournament_player (id, name, team_id, tournament_id, added_by)
SELECT id, name, team_id, tournament_id, added_by FROM
    (
        SELECT 
            unnest(cast($1 AS varchar[])) AS id,
            unnest(cast($2 AS varchar[])) AS name,
            unnest(cast($3 as varchar[])) as team_id,
            unnest(cast($4 AS varchar[])) as tournament_id,
            unnest(cast($5 as varchar[])) as added_by
    ) AS inner_table
RETURNING *;