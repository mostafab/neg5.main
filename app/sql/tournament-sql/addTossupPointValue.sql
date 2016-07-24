INSERT INTO tournament_tossup_values (tournament_id, tossup_answer_type, tossup_value)

SELECT $1, $2, $3

-- Will only add this row if there are no games added for this tournament
WHERE
NOT EXISTS
(
    SELECT id
    FROM tournament_match
    WHERE tournament_id = $1
)

RETURNING *;