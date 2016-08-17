SELECT 

M.id as match_id,
M.round,
match_combined_totals.*

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

        ) AS point_totals

        INNER JOIN tournament_player P

        ON point_totals.player_id = P.id

        GROUP BY P.team_id, point_totals.match_id

    ) as team_tossup_totals

    ON TTM.team_id = team_tossup_totals.team_id

    GROUP BY TTM.match_id

) as match_combined_totals

INNER JOIN

tournament_match M 

ON M.id = match_combined_totals.match_id

