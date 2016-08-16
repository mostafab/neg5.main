SELECT *,
	COALESCE(
        cast(round(
            (total_points::numeric - total_bounceback_points::numeric - raw_total_tossup_points::numeric) / NULLIF(raw_total_gets::numeric - total_overtime_tossups::numeric, 0), 2) as double precision), 
        0) as ppb
FROM

(

    SELECT 
    T.id as team_id,
    T.name as team_name,

    COALESCE(cast(team_match_totals.ppg as double precision), 0) as ppg,
    COALESCE(cast(team_match_totals.papg as double precision), 0) as papg,
    COALESCE(cast(team_match_totals.ppg - team_match_totals.papg as double precision), 0) as margin,
    COALESCE(cast(team_match_totals.total_overtime_tossups as integer), 0) as total_overtime_tossups,
    COALESCE(cast(team_match_totals.total_points as integer), 0) as total_points,
    COALESCE(cast(team_match_totals.total_bounceback_points as integer), 0) as total_bounceback_points,
    COALESCE(cast(team_match_totals.total_tuh as integer), 0) as total_tuh,
    COALESCE(cast(team_match_totals.num_games as integer), 0) as num_games,
    COALESCE(cast(team_match_totals.wins as integer), 0) as wins,
    COALESCE(cast(team_match_totals.losses as integer), 0) as losses,
    COALESCE(cast(team_match_totals.ties as integer), 0) as ties,
    COALESCE(round(team_match_totals.wins / NULLIF(team_match_totals.num_games::numeric, 0), 3), 0) as win_percentage,
    COALESCE(cast(team_tossup_totals.raw_total_gets as integer), 0) as raw_total_gets,
    COALESCE(cast(team_tossup_totals.total_negs as integer), 0) as total_negs,
    COALESCE(cast(team_tossup_totals.total_powers as integer), 0) as total_powers,
    COALESCE(cast(team_tossup_totals.raw_total_tossup_points as integer), 0) as raw_total_tossup_points,
    COALESCE(team_tossup_totals.tossup_totals, '{}') as tossup_totals,

    team_division.phase_id,
    team_division.division_id,
    team_division.division_name

    FROM 

    (
        SELECT 
        team_id, 
        array_agg(json_build_object('value', tossup_value, 'total', total, 'answer_type', tossup_answer_type)) as tossup_totals, 
        SUM(product) as raw_total_tossup_points, 
        SUM(total) FILTER(WHERE tossup_answer_type <> 'Neg') as raw_total_gets,
        SUM(total) FILTER(WHERE tossup_answer_type = 'Neg') as total_negs,
        SUM(total) FILTER(WHERE tossup_answer_type = 'Power') as total_powers

        FROM

        (

            SELECT P.team_id, PMT.tossup_value, SUM(number_gotten) as total, TV.tossup_answer_type, PMT.tossup_value * SUM(PMT.number_gotten) as product

            FROM 

            player_match_tossup PMT INNER JOIN tournament_tossup_values TV 

            ON PMT.tournament_id = TV.tournament_id AND PMT.tossup_value = TV.tossup_value

            INNER JOIN

            tournament_player P 

            ON PMT.tournament_id = P.tournament_id AND PMT.player_id = P.id

            WHERE P.tournament_id = $1 AND
                (
                    PMT.match_id IN 
                    (
                    SELECT M.id 
                    FROM tournament_match M INNER JOIN match_is_part_of_phase MP
                    ON M.id = MP.match_id AND M.tournament_id = MP.tournament_id
                    WHERE MP.phase_id = $2 AND M.tournament_id = $1
                    ) 

                    OR $2 IS NULL
                )

            GROUP BY P.team_id, PMT.tossup_value, TV.tossup_answer_type

            ORDER BY team_id

        ) as tossup_sums

        GROUP BY team_id

    ) as team_tossup_totals

    RIGHT JOIN

    (

        SELECT 
        team_id, 
        COUNT(*) as num_games, 
        COUNT(*) FILTER(WHERE score > opponent_score) as wins,
        COUNT(*) FILTER(WHERE score < opponent_score) as losses,
        COUNT(*) FILTER(WHERE score = opponent_score) as ties,
        SUM(tossups_heard) as total_tuh,
        SUM(score) as total_points,
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

                WHERE M.tournament_id = $1 AND 
                (
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

        GROUP BY team_id

    ) as team_match_totals

    ON team_match_totals.team_id = team_tossup_totals.team_id

    RIGHT JOIN

    tournament_team T

    ON team_match_totals.team_id = T.id

    LEFT JOIN 

    (

        SELECT 
        P.id AS phase_id,
        D.id as division_id,
        D.name AS division_name,
        TTD.team_id as team_id

        FROM

        tournament_phase P 

        INNER JOIN 
        
        tournament_division D

        ON P.tournament_id = D.tournament_id AND P.id = D.phase_id

        INNER JOIN tournament_team_in_division TTD

        ON D.id = TTD.division_id AND D.tournament_id = TTD.tournament_id

        WHERE P.tournament_id = $1 AND D.tournament_id = $1 AND P.id = $2
        AND TTD.tournament_id = $1

    ) as team_division

    ON T.id = team_division.team_id

    WHERE T.tournament_id = $1

) as formatted_results











