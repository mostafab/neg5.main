INSERT INTO -- Insert ONLY IF there are no games
    tournament_tossup_values
        SELECT tid, value, cast(type as answer_type) FROM 
            (
                SELECT
                    unnest(cast($2 AS varchar[])) AS tid,
                    unnest(cast($3 AS int[])) AS value,
                    unnest(cast($4 AS answer_type[])) AS type               
            ) AS rows
    WHERE 
    NOT EXISTS 
    (
        SELECT id
        FROM tournament_match
        WHERE tournament_id = $1
    )
RETURNING *;