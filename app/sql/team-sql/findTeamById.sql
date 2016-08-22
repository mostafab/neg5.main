SELECT T.name, T.id, T.added_by, T.tournament_id, CASE WHEN team_players.players IS NULL THEN '{}' ELSE team_players.players END AS players, agg_team_divisions.team_divisions, COALESCE(team_match.games_count, 0) as games_count

FROM tournament_team T

LEFT JOIN 

(
    SELECT 
    P.team_id, 
    array_agg(json_build_object('player_name', P.name, 'player_id', P.id, 'added_by', P.added_by, 'games', COALESCE(player_games.games_counted, 0))) as players

    FROM

    tournament_player P

    LEFT JOIN 

    (
        SELECT 
        PPM.player_id, 
        COUNT(*)::integer as games_counted
        FROM player_plays_in_tournament_match PPM
        WHERE PPM.tournament_id = $1
        GROUP BY PPM.player_id
    ) as player_games

    ON P.id = player_games.player_id

    WHERE P.tournament_id = $1 AND P.team_id = $2

    GROUP BY P.team_id    

) AS team_players

ON T.id = team_players.team_id

INNER JOIN 
                                                                                                                -- Find all divisions
(

    SELECT 
    tp_cross.team_id, 
    tp_cross.tournament_id,
    array_agg(json_build_object('phase_id', tp_cross.phase_id, 'phase_name', tp_cross.phase_name, 'division_id', team_divisions.division_id, 'division_name', team_divisions.division_name)) as team_divisions 

    FROM 

        (
            SELECT T.id AS team_id, T.tournament_id, T.added_by, P.name as phase_name, P.id AS phase_id
            FROM 
            tournament_team T, tournament_phase P
            WHERE T.tournament_id = $1 AND T.id = $2
        ) AS tp_cross

        LEFT JOIN 

        (
            SELECT D.id AS division_id, D.name AS division_name, D.phase_id, TD.team_id, TD.tournament_id
            FROM 
            tournament_division D
            INNER JOIN
            tournament_team_in_division TD
            ON D.id = TD.division_id AND D.tournament_id = TD.tournament_id
            WHERE D.tournament_id = $1 AND TD.team_id = $2
        ) AS team_divisions

        ON tp_cross.phase_id = team_divisions.phase_id AND tp_cross.team_id = team_divisions.team_id

    GROUP BY tp_cross.tournament_id, tp_cross.team_id

) AS agg_team_divisions

ON T.id = agg_team_divisions.team_id

LEFT JOIN 
(
    SELECT team_id, COUNT(*)::integer as games_count
    FROM team_plays_in_tournament_match
    WHERE tournament_id = $1 AND team_id = $2
    GROUP BY team_id
) as team_match

ON T.id = team_match.team_id

WHERE T.tournament_id = $1 AND T.id = $2