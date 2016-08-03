INSERT INTO player_match_tossup(player_id, match_id, tournament_id, tossup_value, number_gotten)
(
    SELECT player_id, match_id, tournament_id, tossup_value, number_gotten
    FROM
    (
        SELECT
            unnest(cast($1 as varchar[])) as player_id,
            unnest(cast($2 as varchar[])) as match_id,
            unnest(cast($3 as varchar[])) as tournament_id,
            unnest(cast($4 as integer[])) as tossup_value,
            unnest(cast($5 as integer[])) as number_gotten
    ) as inner_table
)

RETURNING *;