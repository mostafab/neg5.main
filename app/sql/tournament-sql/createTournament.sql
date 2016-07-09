BEGIN;

    INSERT INTO tournament (id, name, tournament_date, question_set, comments, director_id) 
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;


    -- Using query file to load SQL Statements has an issue with multi insert queries.
    -- This is a workaround to put each column in each query in the multi insert
    -- into its own array and using unnest to create a temporary table
    -- $7 = tournament_id
    -- $8 = tossup_value
    -- $9 = tossup_answer_type

    INSERT INTO tournament_tossup_values (tournament_id, tossup_value, tossup_answer_type)
    SELECT id, value, cast(type as answer_type) FROM 
        (
            SELECT
                unnest($7) AS id,
                unnest($8) AS value,
                unnest($9) AS type               
        ) AS inner_table;

COMMIT;