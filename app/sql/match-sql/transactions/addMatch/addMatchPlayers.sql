INSERT INTO player_plays_in_tournament_match (player_id, match_id, tournament_id, tossups_heard)
(
    SELECT player_id, match_id, tournament_id, tossups_heard
    FROM 
    (
        SELECT
            unnest(cast($1 as varchar[])) as player_id,
            unnest(cast($2 as varchar[])) as match_id,
            unnest(cast($3 as varchar[])) as tournament_id,
            unnest(cast($4 as integer[])) AS tossups_heard
    ) as inner_table
)
RETURNING *;