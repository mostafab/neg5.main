SELECT *

FROM 

(
    SELECT team_id, array_agg(json_build_object('value', tossup_value, 'total', total, 'answer_type', tossup_answer_type)) as tossup_totals, 
        SUM(product) as raw_total_points, SUM(total) FILTER(WHERE tossup_answer_type <> 'Neg') as raw_total_gets

    FROM

    (

        SELECT P.team_id, PMT.tossup_value, SUM(number_gotten) as total, TV.tossup_answer_type, PMT.tossup_value * SUM(PMT.number_gotten) as product

        FROM 

        player_match_tossup PMT INNER JOIN tournament_tossup_values TV 

        ON PMT.tournament_id = TV.tournament_id AND PMT.tossup_value = TV.tossup_value

        INNER JOIN

        tournament_player P 

        ON PMT.tournament_id = P.tournament_id AND PMT.player_id = P.id

        GROUP BY P.team_id, PMT.tossup_value, TV.tossup_answer_type

        ORDER BY team_id

    ) as tossup_sums

    GROUP BY team_id

) as ss

RIGHT JOIN

(

    SELECT 
    team_id, 
    COUNT(*) as num_games, 
    COUNT(*) FILTER(WHERE score > opponent_score) as wins,
    COUNT(*) FILTER(WHERE score < opponent_score) as losses,
    COUNT(*) FILTER(WHERE score = opponent_score) as ties,
    SUM(tossups_heard) as total_tuh,
    SUM(bounceback_points) AS total_bounceback_points,
    SUM(overtime_tossups) AS total_overtime_tossups,
    round(AVG(score), 2) as ppg,
    round(AVG(opponent_score), 2) as papg

    from
    (

        select 
        T.id AS team_id, 
        T.name as team_name, 
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

        ) as innerq

        INNER JOIN tournament_team T

        ON (T.id = innerq.team_1_id OR T.id = innerq.team_2_id) AND T.tournament_id = innerq.tournament_id 	

    ) as outerq

    GROUP BY team_id

) as hehe

ON hehe.team_id = ss.team_id

INNER JOIN

tournament_team T

ON hehe.team_id = T.id










