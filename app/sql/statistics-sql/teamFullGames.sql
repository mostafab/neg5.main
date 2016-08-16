SELECT 
team_id,
team_name,
COALESCE(array_agg(
    json_build_object(
        'match_id', match_id,
        'tossup_totals', tossup_totals,
        'tossup_points', raw_total_tossup_points,
        'total_gets', total_gets,
        'total_negs', total_negs,
        'total_powers', total_powers,
        'opponent_id', opponent_team_id,
        'opponent_name', opponent_team_name,
        'opponent_score', opponent_score,
        'round', round,
        'tossups_heard', tossups_heard,
        'score', score,
        'bounceback_points', bounceback_points,
        'overtime_tossups', overtime_tossups,
        'result', match_result,
        'ppb', ppb
    )
) FILTER(WHERE match_id IS NOT NULL), '{}') as matches

FROM

(
    SELECT *,
        COALESCE(
                cast(round(
                    (score::numeric - bounceback_points::numeric - raw_total_tossup_points::numeric) / NULLIF(total_gets::numeric - overtime_tossups::numeric, 0), 2) as double precision), 
                0) as ppb

    FROM

    (
        SELECT 

        T.id as team_id,
        T.name as team_name,
        team_match_totals.match_id,
        COALESCE(team_tossup_totals_per_match.tossup_totals, '{}') as tossup_totals,
        COALESCE(team_tossup_totals_per_match.raw_total_tossup_points, 0) as raw_total_tossup_points,
        COALESCE(team_tossup_totals_per_match.raw_total_gets, 0) as total_gets,
        COALESCE(team_tossup_totals_per_match.total_negs, 0) as total_negs,
        COALESCE(team_tossup_totals_per_match.total_powers, 0) as total_powers,
        team_match_totals.opponent_team_id,
        team_match_totals.opponent_team_name,
        team_match_totals.round,
        COALESCE(team_match_totals.tossups_heard, 0) as tossups_heard,
        COALESCE(team_match_totals.score) as score,
        team_match_totals.opponent_score,
        COALESCE(team_match_totals.bounceback_points, 0) as bounceback_points,
        COALESCE(team_match_totals.overtime_tossups, 0) as overtime_tossups,
        team_match_totals.match_result

        FROM 

        (
            SELECT 
            team_id, 
            match_id,
            array_agg(json_build_object('value', tossup_value, 'total', total, 'answer_type', tossup_answer_type)) as tossup_totals, 
            SUM(product) as raw_total_tossup_points, 
            SUM(total) FILTER(WHERE tossup_answer_type <> 'Neg') as raw_total_gets,
            SUM(total) FILTER(WHERE tossup_answer_type = 'Neg') as total_negs,
            SUM(total) FILTER(WHERE tossup_answer_type = 'Power') as total_powers

            FROM

            (

                SELECT P.team_id, PMT.match_id, PMT.tossup_value, SUM(number_gotten) as total, TV.tossup_answer_type, PMT.tossup_value * SUM(PMT.number_gotten) as product

                FROM 

                player_match_tossup PMT INNER JOIN tournament_tossup_values TV 

                ON PMT.tournament_id = TV.tournament_id AND PMT.tossup_value = TV.tossup_value

                INNER JOIN

                tournament_player P 

                ON PMT.tournament_id = P.tournament_id AND PMT.player_id = P.id

                WHERE P.tournament_id = $1 AND
                    (
                        $2 IS NULL

                        OR
                        
                        PMT.match_id IN 
                        (
                        SELECT M.id 
                        FROM tournament_match M INNER JOIN match_is_part_of_phase MP
                        ON M.id = MP.match_id AND M.tournament_id = MP.tournament_id
                        WHERE MP.phase_id = $2 AND M.tournament_id = $1
                        ) 
                    )

                GROUP BY P.team_id, PMT.match_id, PMT.tossup_value, TV.tossup_answer_type

            ) as tossup_sums

            GROUP BY team_id, match_id

        ) as team_tossup_totals_per_match

        RIGHT JOIN

        (

            SELECT 
            team_id,
            opponent_team_id,
            OPPONENT.name as opponent_team_name,
            match_id,
            round,
            tossups_heard,
            score,
            opponent_score,
            bounceback_points,
            overtime_tossups,
            CASE WHEN (score > opponent_score) THEN 'W'::varchar(1) 
                    WHEN (score < opponent_score) THEN 'L'::varchar(1)
                    ELSE 'T'::varchar(1)
                    END as match_result

            from
            (

                select 
                T.id AS team_id, 
                CASE WHEN (T.id = innerq.team_1_id) THEN innerq.team_2_id ELSE innerq.team_1_id END as opponent_team_id,
                innerq.match_id, 
                innerq.round,
                innerq.tossups_heard,
                CASE WHEN (T.id = innerq.team_1_id) THEN team_1_score ELSE team_2_score END AS score, 
                CASE WHEN (T.id = innerq.team_1_id) THEN team_2_score ELSE team_1_score END AS opponent_score,
                CASE WHEN (T.id = innerq.team_1_id) THEN team_1_bounceback_points ELSE team_2_bounceback_points END AS bounceback_points,
                CASE WHEN (T.id = innerq.team_1_id) THEN team_1_overtime_tossups ELSE team_2_overtime_tossups END AS overtime_tossups
            
                from 
                (
                    select DISTINCT ON(M.id, M.tournament_id) 
                    M.tournament_id, 
                    M.id as match_id, 
                    M.round,
                    M.tossups_heard, 
                    A.team_id AS team_1_id, 
                    A.score AS team_1_score,
                    A.bounceback_points AS team_1_bounceback_points,
                    A.overtime_tossups_gotten AS team_1_overtime_tossups,  
                    B.team_id as team_2_id, 
                    B.score AS team_2_score,
                    B.bounceback_points AS team_2_bounceback_points,
                    B.overtime_tossups_gotten AS team_2_overtime_tossups
                    
                    from team_plays_in_tournament_match A
                    INNER JOIN
                    team_plays_in_tournament_match B
                    ON A.match_id = B.match_id AND A.tournament_id = B.tournament_id AND A.team_id <> B.team_id

                    INNER JOIN tournament_match M

                    ON A.match_id = M.id AND M.tournament_id = A.tournament_id

                    WHERE M.tournament_id = $1 AND 
                    (
                        $2 IS NULL
                        
                        OR

                        M.id IN 
                        (
                        SELECT M.id 
                        FROM tournament_match M INNER JOIN match_is_part_of_phase MP
                        ON M.id = MP.match_id AND M.tournament_id = MP.tournament_id
                        WHERE MP.phase_id = $2 AND M.tournament_id = $1
                        )

                    )

                ) as innerq

                INNER JOIN tournament_team T

                ON (T.id = innerq.team_1_id OR T.id = innerq.team_2_id) AND T.tournament_id = innerq.tournament_id 	

                WHERE T.tournament_id = $1

            ) as outerq

            INNER JOIN tournament_team OPPONENT

            ON OPPONENT.id = outerq.opponent_team_id

            ORDER BY round NULLS FIRST

        ) as team_match_totals

        ON team_match_totals.team_id = team_tossup_totals_per_match.team_id AND team_match_totals.match_id = team_tossup_totals_per_match.match_id

        RIGHT JOIN tournament_team T

        ON team_match_totals.team_id = T.id 

        WHERE T.tournament_id = $1

    ) as result

) result_with_ppb

GROUP BY team_id, team_name

ORDER BY team_name




















