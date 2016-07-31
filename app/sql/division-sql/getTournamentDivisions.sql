SELECT D.id AS division_id, D.name AS division_name, D.tournament_id, P.id AS phase_id, P.name AS phase_name
FROM tournament_division D
INNER JOIN
tournament_phase P
ON D.phase_id = P.id AND D.tournament_id = P.tournament_id
WHERE D.tournament_id = $1;
