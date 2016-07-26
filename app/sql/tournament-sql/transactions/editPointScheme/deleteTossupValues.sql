DELETE 
    FROM tournament_tossup_values
    WHERE tournament_id = $1 AND
    NOT EXISTS -- Delete ONLY IF there are no games
    (
        SELECT id
        FROM tournament_match
        WHERE tournament_id = $1
    );