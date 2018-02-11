SELECT match_information.*, COALESCE(match_phases.phases, '{}') as phases
FROM

(
    SELECT

    M.id,
    M.tournament_id as "tournamentId",
    M.round,
    M.tossups_heard as "tossupsHeard",
    match_teams.teams

    FROM

    (
        SELECT 

        player_team_join.match_id,
        array_agg(
            json_build_object(
                'matchId', player_team_join.match_id,
                'teamId', player_team_join.team_id,
                'score', player_team_join.score,
                'bouncebackPoints', COALESCE(player_team_join.bounceback_points, 0),
                'overtimeTossups', COALESCE(player_team_join.overtime_tossups_gotten, 0),
                'players', player_team_join.player_match_totals
            )
        ) as teams

        FROM

        (
            SELECT
            TTM.tournament_id,
            TTM.team_id,
            TTM.match_id,
            TTM.score,
            TTM.bounceback_points,
            TTM.overtime_tossups_gotten,
            array_agg(
                json_build_object(
                    'playerId', TP.id,
                    'matchId', PPM.match_id,
                    'teamId', TP.team_id,
                    'tossupsHeard', COALESCE(PPM.tossups_heard, 0),
                    'tossupValues', COALESCE(player_match_values.tossup_values, '{}')
                )
            ) as player_match_totals

            FROM
            
            team_plays_in_tournament_match TTM

            INNER JOIN

            player_plays_in_tournament_match PPM 

            ON TTM.match_id = PPM.match_id AND TTM.tournament_id = PPM.tournament_id

            INNER JOIN tournament_player TP

            ON TP.team_id = TTM.team_id AND TP.id = PPM.player_id

            INNER JOIN

            (
                SELECT 
                PMT.player_id,
                PMT.match_id,
                array_agg(
                    json_build_object('value', PMT.tossup_value, 'number', PMT.number_gotten, 'playerId', PMT.player_id, 'matchId', PMT.match_id)
                ) as tossup_values
                
                FROM

                player_match_tossup PMT

                WHERE PMT.tournament_id = $1

                GROUP BY PMT.player_id, PMT.match_id

            ) as player_match_values

            ON PPM.player_id = player_match_values.player_id AND PPM.match_id = player_match_values.match_id

            WHERE TTM.tournament_id = $1

            GROUP BY TTM.tournament_id, TTM.team_id, TTM.match_id, TTM.score, TTM.bounceback_points, TTM.overtime_tossups_gotten

        ) as player_team_join

        WHERE player_team_join.tournament_id = $1

        GROUP BY player_team_join.match_id

    ) as match_teams

    INNER JOIN

    tournament_match M

    ON M.id = match_teams.match_id

    WHERE M.tournament_id = $1

) as match_information

LEFT JOIN

(
    SELECT
    MP.match_id,
    array_agg(
        json_build_object(
            'id', P.id,
            'name', P.name
        )
    ) as phases

    FROM

    match_is_part_of_phase MP

    INNER JOIN

    tournament_phase P

    ON MP.tournament_id = P.tournament_id AND MP.phase_id = P.id

    WHERE P.tournament_id = $1

    GROUP BY MP.match_id

) as match_phases

ON match_information.id = match_phases.match_id








