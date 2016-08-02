INSERT INTO team_plays_in_tournament_match (team_id, match_id, tournament_id, score, bounceback_points, overtime_tossups_gotten)
(
    SELECT team_id, match_id, tournament_id, score, bounceback_points, overtime_tossups_gotten
    FROM
    (
        SELECT
            unnest(cast($1 as varchar[])) as team_id,
            unnest(cast($2 as varchar[])) as match_id,
            unnest(cast($3 as varchar[])) as tournament_id,
            unnest(cast($4 as integer[])) as score,
            unnest(cast($5 as integer[])) as bounceback_points,
            unnest(cast($6 as integer[])) as overtime_tossups_gotten
    ) as inner_table
)
RETURNING *;