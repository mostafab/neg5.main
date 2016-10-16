SELECT *
FROM

(
    SELECT

    M.id as match_id,
    M.tournament_id,
    M.round,
    M.room,
    M.moderator,
    M.packet,
    M.tossups_heard,
    M.notes,
    M.added_by,
    match_teams.teams

    FROM

    (
        SELECT 

        player_team_join.match_id,
        array_agg(
            json_build_object(
                'team_name', T.name,
                'team_id', T.id,
                'score', player_team_join.score,
                'bounceback_points', COALESCE(player_team_join.bounceback_points, 0),
                'overtime_tossups', COALESCE(player_team_join.overtime_tossups_gotten, 0),
                'players', player_team_join.player_match_totals
            )
        ) as teams

        FROM

        (
            SELECT
            TTM.team_id,
            TTM.match_id,
            TTM.score,
            TTM.bounceback_points,
            TTM.overtime_tossups_gotten,
            array_agg(
                json_build_object(
                    'player_id', P.id,
                    'player_name', P.name,
                    'tossups_heard', COALESCE(PPM.tossups_heard, 0),
                    'tossup_values', COALESCE(player_match_values.tossup_values, '{}')
                )
            ) as player_match_totals

            FROM
            
            team_plays_in_tournament_match TTM

            INNER JOIN

            tournament_player P

            ON TTM.team_id = P.team_id AND TTM.tournament_id = P.tournament_id

            LEFT JOIN

            player_plays_in_tournament_match PPM 

            ON P.id = PPM.player_id AND P.tournament_id = PPM.tournament_id

            INNER JOIN

            (
                SELECT 
                PMT.player_id,
                PMT.match_id,
                array_agg(
                    json_build_object('value', PMT.tossup_value, 'number', PMT.number_gotten)
                ) as tossup_values
                
                FROM

                player_match_tossup PMT

                WHERE PMT.tournament_id = $1 and ($2 IS NULL OR PMT.match_id = $2)

                GROUP BY PMT.player_id, PMT.match_id

            ) as player_match_values

            ON PPM.player_id = player_match_values.player_id AND PPM.match_id = player_match_values.match_id

            WHERE TTM.tournament_id = $1 and ($2 IS NULL OR TTM.match_id = $2) 

            GROUP BY TTM.team_id, TTM.match_id, TTM.score, TTM.bounceback_points, TTM.overtime_tossups_gotten

        ) as player_team_join

        INNER JOIN 

        tournament_team T

        ON player_team_join.team_id = T.id

        WHERE T.tournament_id = $1

        GROUP BY player_team_join.match_id

    ) as match_teams

    INNER JOIN

    tournament_match M

    ON M.id = match_teams.match_id

    WHERE M.tournament_id = $1 AND ($2 IS NULL OR M.id = $2)

) as match_information

INNER JOIN 

(
    SELECT
    MP.match_id,
    array_agg(
        json_build_object(
            'phase_id', P.id,
            'phase_name', P.name
        )
    ) as phases

    FROM

    match_is_part_of_phase MP

    INNER JOIN

    tournament_phase P

    ON MP.tournament_id = P.tournament_id AND MP.phase_id = P.id

    WHERE P.tournament_id = $1 and ($2 IS NULL OR MP.match_id = $2)

    GROUP BY MP.match_id

) as match_phases

ON match_information.match_id = match_phases.match_id








