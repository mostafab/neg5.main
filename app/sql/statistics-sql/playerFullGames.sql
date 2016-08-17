SELECT 
PL.id as player_id,
PL.name as player_name,
T.id as team_id,
T.name as team_name,
COALESCE(
    array_agg(
        json_build_object(
            'match_id', PMT.match_id,
            'tossup_totals', PMT.tossup_totals,
            'total_points', PMT.total_points,
            'gets', PMT.gets,
            'powers', PMT.powers,
            'negs', PMT.negs,
            'tossups_heard', player_tuh_per_match.player_tuh,
            'match_tossups', player_tuh_per_match.match_tuh,
            'game_played', player_tuh_per_match.gp 
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
            -- WHERE P.tournament_id = $1 AND 
            --     (   
            --         P.match_id IN 
            --         (
            --         SELECT M.id 
            --         FROM tournament_match M INNER JOIN match_is_part_of_phase MP
            --         ON M.id = MP.match_id AND M.tournament_id = MP.tournament_id
            --         WHERE MP.phase_id = $2 AND M.tournament_id = $1
            --         ) 

            --         OR $2 IS NULL
            --     )
            
        ) as pmt_subquery

    GROUP BY player_id, match_id

) AS PMT

INNER JOIN

(
    SELECT PTM.player_id, PTM.tossups_heard as player_tuh, M.tossups_heard as match_tuh, M.id as match_id, M.tournament_id, PTM.tossups_heard / M.tossups_heard::float as gp

    FROM 

    player_plays_in_tournament_match PTM

    INNER JOIN tournament_match M

    ON PTM.match_id = M.id AND PTM.tournament_id = M.tournament_id

    -- WHERE M.tournament_id = $1 AND 
    --     (   
    --         M.id IN 
    --         (
    --         SELECT M.id 
    --         FROM tournament_match M INNER JOIN match_is_part_of_phase MP
    --         ON M.id = MP.match_id AND M.tournament_id = MP.tournament_id
    --         WHERE MP.phase_id = $2 AND M.tournament_id = $1
    --         ) 

    --         OR $2 IS NULL
    --     )

) as player_tuh_per_match

ON PMT.player_id = player_tuh_per_match.player_id AND PMT.match_id = player_tuh_per_match.match_id

RIGHT JOIN

tournament_player PL

ON PMT.player_id = PL.id

INNER JOIN tournament_team T

ON PL.team_id = T.id AND PL.tournament_id = T.tournament_id

-- WHERE PL.tournament_id = $1 AND T.tournament_id = $1

GROUP BY PL.id, PL.name, T.id, T.name

ORDER BY T.id, PL.name 


