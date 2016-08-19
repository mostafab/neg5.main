SELECT *

FROM

(
    SELECT 
    PL.id as player_id, 
    PL.name as player_name, 
    T.name as team_name, 
    T.id as team_id,
    COALESCE(player_tuh.total_player_tuh, 0) as total_player_tuh, 
    COALESCE(cast(player_tuh.total_gp as double precision), 0) as games_played, 
    COALESCE(PMT.tossup_totals, '{}') as tossup_totals, 
    COALESCE(PMT.total_points, 0) as total_points, 
    COALESCE(cast(round(PMT.total_points / player_tuh.total_player_tuh::decimal, 2) as double precision), 0) as points_per_tossup, 
    COALESCE(cast(round(PMT.total_points / player_tuh.total_gp::decimal, 2) as double precision), 0) as points_per_game

    FROM 
    (
        SELECT tournament_id, player_id, array_agg(json_build_object('value', tossup_value, 'total', total, 'answer_type', tossup_answer_type)) as tossup_totals, SUM(product)::integer as total_points
        FROM
            (
                SELECT P.tournament_id, P.player_id AS player_id, P.tossup_value, TV.tossup_answer_type, SUM(P.number_gotten) AS total, P.tossup_value * SUM(P.number_gotten) as product
                FROM
                player_match_tossup P INNER JOIN tournament_tossup_values TV
                ON P.tournament_id = TV.tournament_id AND P.tossup_value = TV.tossup_value
                WHERE P.tournament_id = $1 AND 
                    (   
                        P.match_id IN 
                        (
                        SELECT M.id 
                        FROM tournament_match M INNER JOIN match_is_part_of_phase MP
                        ON M.id = MP.match_id AND M.tournament_id = MP.tournament_id
                        WHERE MP.phase_id = $2 AND M.tournament_id = $1
                        ) 

                        OR $2 IS NULL
                    )
                GROUP BY P.player_id, P.tournament_id, P.tossup_value, TV.tossup_answer_type
                ORDER BY P.tossup_value desc
                
            ) as pmt_subquery
        GROUP BY player_id, tournament_id
    ) AS PMT

    INNER JOIN

    (
        SELECT player_id, tournament_id, SUM(player_tuh)::integer as total_player_tuh, round(cast(SUM(gp) as numeric), 2) as total_gp
        FROM
        (
            SELECT PTM.player_id, PTM.tossups_heard as player_tuh, M.tossups_heard as match_tuh, M.id as match_id, M.tournament_id, PTM.tossups_heard / M.tossups_heard::float as gp

            FROM 

            player_plays_in_tournament_match PTM

            INNER JOIN tournament_match M

            ON PTM.match_id = M.id AND PTM.tournament_id = M.tournament_id

            WHERE M.tournament_id = $1 AND 
                (   
                    M.id IN 
                    (
                    SELECT M.id 
                    FROM tournament_match M INNER JOIN match_is_part_of_phase MP
                    ON M.id = MP.match_id AND M.tournament_id = MP.tournament_id
                    WHERE MP.phase_id = $2 AND M.tournament_id = $1
                    ) 

                    OR $2 IS NULL
                )

        ) as player_gp_agg

        GROUP BY player_id, tournament_id

    ) as player_tuh

    ON PMT.player_id = player_tuh.player_id AND PMT.tournament_id = player_tuh.tournament_id

    RIGHT JOIN

    tournament_player PL

    ON PMT.player_id = PL.id AND PMT.tournament_id = PL.tournament_id

    INNER JOIN tournament_team T

    ON PL.team_id = T.id AND PL.tournament_id = T.tournament_id

    WHERE PL.tournament_id = $1 AND T.tournament_id = $1

) as averages

ORDER BY points_per_tossup desc, points_per_game desc


