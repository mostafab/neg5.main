UPDATE tournament
    SET bonus_point_value = $2, parts_per_bonus = $3
    WHERE id = $1 AND NOT EXISTS (
        SELECT id 
        FROM tournament_match
        WHERE tournament_id = $1
    )
RETURNING bonus_point_value, parts_per_bonus;