INSERT INTO match_is_part_of_phase(match_id, tournament_id, phase_id)
(
    SELECT match_id, tournament_id, phase_id FROM
    (
        SELECT
            unnest(cast($1 as varchar[])) as match_id,
            unnest(cast($2 as varchar[])) as tournament_id,
            unnest(cast($3 as varchar[])) as phase_id
    ) AS inner_table
)
RETURNING *;