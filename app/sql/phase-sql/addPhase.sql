INSERT INTO tournament_phase (id, tournament_id, name)

SELECT $2, $1, $3

WHERE NOT EXISTS
(
    SELECT id
    FROM tournament_phase P
    WHERE lower(P.name) = lower($3)
)

RETURNING *;
