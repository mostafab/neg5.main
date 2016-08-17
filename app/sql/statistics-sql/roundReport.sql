SELECT *,
    CAST(
        round(COALESCE(
            (round_sums.round_cumulative_score - round_sums.round_cumulative_tossup_points - round_sums.round_cumulative_bouncebacks) / NULLIF(round_sums.round_cumulative_gets - round_sums.round_cumulative_overtime, 0)::numeric
            , 0), 
        2) as double precision) as round_ppb

FROM

(
    SELECT
    summed_matches.round,
    COALESCE(SUM(tossups_heard)::integer, 0) AS round_tossups_heard,
    SUM(cumulative_score)::integer AS round_cumulative_score,
    COALESCE(SUM(cumulative_bouncebacks)::integer, 0) AS round_cumulative_bouncebacks,
    COALESCE(SUM(cumulative_overtime_tossups)::integer, 0) AS round_cumulative_overtime,
    COALESCE(SUM(cumulative_tossup_points)::integer, 0) AS round_cumulative_tossup_points,
    COALESCE(SUM(cumulative_gets)::integer, 0) AS round_cumulative_gets

    FROM

    (
        SELECT 
        M.round,
        M.tossups_heard,
        match_combined_totals.cumulative_score,
        match_combined_totals.cumulative_bouncebacks,
        match_combined_totals.cumulative_overtime_tossups,
        match_combined_totals.cumulative_tossup_points,
        match_combined_totals.cumulative_gets

        FROM

        (
            SELECT 
            TTM.match_id,
            SUM(TTM.score)::integer as cumulative_score,
            SUM(TTM.bounceback_points)::integer as cumulative_bouncebacks,
            SUM(TTM.overtime_tossups_gotten)::integer as cumulative_overtime_tossups,
            SUM(team_tossup_totals.total_match_tossup_points)::integer as cumulative_tossup_points,
            SUM(team_tossup_totals.gets)::integer as cumulative_gets

            FROM

            team_plays_in_tournament_match TTM

            LEFT JOIN

            (
                SELECT 
                P.team_id,
                point_totals.match_id,
                SUM(product) as total_match_tossup_points,
                SUM(number_gotten) FILTER(WHERE answer_type <> 'Neg') as gets

                FROM
                (
                    SELECT 
                    PMT.player_id, 
                    PMT.match_id, 
                    PMT.tossup_value,
                    PMT.number_gotten,
                    TV.tossup_answer_type as answer_type,
                    (PMT.tossup_value * PMT.number_gotten) as product
                    
                    FROM player_match_tossup PMT INNER JOIN tournament_tossup_values TV

                    ON PMT.tossup_value = TV.tossup_value AND PMT.tournament_id = TV.tournament_id

                    WHERE TV.tournament_id = $1

                ) AS point_totals

                INNER JOIN tournament_player P

                ON point_totals.player_id = P.id

                WHERE P.tournament_id = $1 AND (
                    $2 IS NULL 
                    OR 
                    point_totals.match_id IN (
                        SELECT MP.match_id
                        FROM
                        match_is_part_of_phase MP
                        WHERE MP.phase_id = $2 AND MP.tournament_id = $1
                    )
                )
                GROUP BY P.team_id, point_totals.match_id

            ) as team_tossup_totals

            ON TTM.team_id = team_tossup_totals.team_id AND TTM.match_id = team_tossup_totals.match_id

            WHERE TTM.tournament_id = $1 AND (
                $2 IS NULL
                OR 
                TTM.match_id IN (
                    SELECT MP2.match_id
                    FROM 
                    match_is_part_of_phase MP2
                    WHERE MP2.phase_id = $2 AND MP2.tournament_id = $1
                )
            )

            GROUP BY TTM.match_id

        ) as match_combined_totals

        INNER JOIN

        tournament_match M 

        ON M.id = match_combined_totals.match_id

        WHERE M.tournament_id = $1 

    ) as summed_matches

    GROUP BY summed_matches.round

) AS round_sums

INNER JOIN 

(

    select 
    M.round as match_round, 
    CAST(round(AVG(TTM.score), 2) as double precision) as ppg_round_average 

    from team_plays_in_tournament_match TTM

    inner join

    tournament_match M

    ON TTM.match_id = M.id AND TTM.tournament_id = M.tournament_id

    WHERE M.tournament_id = $1 AND
    (
        $2 IS NULL
        OR
        M.id IN (
            SELECT MP3.match_id
            FROM 
            match_is_part_of_phase MP3
            WHERE MP3.phase_id = $2 AND MP3.tournament_id = $1
        )
    )

    GROUP BY M.round 

) AS round_ppg

ON round_sums.round = round_ppg.match_round

ORDER BY round_sums.round




