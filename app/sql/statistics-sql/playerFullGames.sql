SELECT 
PL.id as player_id,
PL.name as player_name,
PL.team_id as team_id,
T.name as team_name,
COALESCE(
    array_agg(
        json_build_object(
            'match_id', PMT.match_id,
            'round', player_match_general.round,
            'opponent_team_id', player_match_general.opponent_team_id,
            'opponent_team_name', player_match_general.opponent_team_name,
            'tossup_totals', PMT.tossup_totals,
            'total_points', PMT.total_points,
            'gets', PMT.gets,
            'powers', PMT.powers,
            'negs', PMT.negs,
            'tossups_heard', player_match_general.player_tuh,
            'match_tossups', player_match_general.match_tuh,
            'game_played', player_match_general.gp 
        )
    ) FILTER (WHERE PMT.match_id IS NOT NULL), '{}') as matches

FROM 
(
    SELECT 
    player_id, 
    match_id, 
    array_agg(json_build_object('value', tossup_value, 'total', number_gotten, 'answer_type', tossup_answer_type)) as tossup_totals, 
    SUM(product)::integer as total_points,
    COALESCE(SUM(number_gotten) FILTER (WHERE tossup_answer_type <> 'Neg'), 0)::integer AS gets,
    COALESCE(SUM(number_gotten) FILTER (WHERE tossup_answer_type = 'Power'), 0)::integer AS powers,
    COALESCE(SUM(number_gotten) FILTER (WHERE tossup_answer_type = 'Neg'), 0)::integer AS negs

    FROM
        (
            SELECT P.player_id AS player_id, P.match_id, P.tossup_value, TV.tossup_answer_type, P.number_gotten, P.tossup_value * P.number_gotten as product
            FROM
            player_match_tossup P INNER JOIN tournament_tossup_values TV
            ON P.tournament_id = TV.tournament_id AND P.tossup_value = TV.tossup_value
            WHERE P.tournament_id = $1 AND 
                (   
                    $2 IS NULL

                    OR 
                    
                    P.match_id IN 
                    (
                    SELECT M.id 
                    FROM tournament_match M INNER JOIN match_is_part_of_phase MP
                    ON M.id = MP.match_id AND M.tournament_id = MP.tournament_id
                    WHERE MP.phase_id = $2 AND M.tournament_id = $1
                    ) 
                )
            
        ) as pmt_subquery

    GROUP BY player_id, match_id

) AS PMT

INNER JOIN

(

    SELECT 
    player_id,
    player_tuh,
    match_tuh,
    match_id,
    team_match_info.tournament_id,
    team_match_info.round,
    gp,
    opponent_team_id,
    OPPONENT.name as opponent_team_name

    FROM

    (
        SELECT 
        P.id as player_id, 
        PTM.tossups_heard as player_tuh, 
        M.tossups_heard as match_tuh, 
        M.round as round,
        M.id as match_id, 
        M.tournament_id, 
        PTM.tossups_heard / M.tossups_heard::float as gp,
        TTM.team_id as opponent_team_id

        FROM 

        player_plays_in_tournament_match PTM

        INNER JOIN tournament_match M

        ON PTM.match_id = M.id AND PTM.tournament_id = M.tournament_id

        INNER JOIN tournament_player P ON PTM.player_id = P.id AND PTM.tournament_id = P.tournament_id

        INNER JOIN team_plays_in_tournament_match TTM 

        ON TTM.team_id <> P.team_id AND PTM.match_id = TTM.match_id AND PTM.tournament_id = TTM.tournament_id  -- Get the opponent team_id

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

    ) as team_match_info 

    INNER JOIN

    tournament_team OPPONENT

    ON team_match_info.opponent_team_id = OPPONENT.id AND team_match_info.tournament_id = OPPONENT.tournament_id

    WHERE OPPONENT.tournament_id = $1

) as player_match_general

ON PMT.player_id = player_match_general.player_id AND PMT.match_id = player_match_general.match_id

RIGHT JOIN

tournament_player PL

ON PMT.player_id = PL.id

INNER JOIN tournament_team T

ON PL.team_id = T.id AND PL.tournament_id = T.tournament_id

WHERE PL.tournament_id = $1 AND T.tournament_id = $1

GROUP BY PL.id, PL.name, PL.team_id, T.name

ORDER BY T.name, PL.name 


