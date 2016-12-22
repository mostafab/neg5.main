
SELECT  match_info.match_id, outer_team_result.tournament_id, 
        outer_team_result.team_1_id, outer_team_result.team_1_name, outer_team_result.team_1_score,
        outer_team_result.team_2_id, outer_team_result.team_2_name, outer_team_result.team_2_score,
         
        match_info.round, match_info.room, match_info.moderator,
        match_info.packet, match_info.tossups_heard, match_info.added_by,
        match_info.phases, match_info.scoresheet

FROM
(
    (
        SELECT  T.team_1_id, T.match_id, T.team_1_name, T.team_1_score,
                T.team_2_id, T.team_2_name, T.team_2_score,
                T.tournament_id

        FROM
            (
                -- Winner is team_1, Loser is team_2
                SELECT  
                    CASE WHEN (team_info.team_1_score >= team_info.team_2_score) THEN team_info.team_1_id ELSE team_info.team_2_id END AS team_1_id, 
                    CASE WHEN (team_info.team_1_score >= team_info.team_2_score) THEN team_info.team_1_name ELSE team_info.team_2_name END AS team_1_name, 
                    CASE WHEN (team_info.team_1_score >= team_info.team_2_score) THEN team_info.team_1_score ELSE team_info.team_2_score END AS team_1_score, 
                    
                    CASE WHEN (team_info.team_1_score < team_info.team_2_score) THEN team_info.team_1_id ELSE team_info.team_2_id END AS team_2_id, 
                    CASE WHEN (team_info.team_1_score < team_info.team_2_score) THEN team_info.team_1_name ELSE team_info.team_2_name END AS team_2_name, 
                    CASE WHEN (team_info.team_1_score < team_info.team_2_score) THEN team_info.team_1_score ELSE team_info.team_2_score END AS team_2_score, 

                    team_info.match_id AS match_id, 
                    team_info.tournament_id AS tournament_id

                FROM

                -- Below SQL in parens joins the team_plays_in_tournament_match table with itself to get the two teams in a match and joins with the tournament_team table to get the team names
                    (
                        SELECT  DISTINCT ON (team_1_info.tournament_id, team_1_info.match_id) 
                            team_1_info.match_id AS match_id, 
                            team_1_info.tournament_id AS tournament_id, 
                            team_1_info.id AS team_1_id, 
                            team_1_info.name AS team_1_name, 
                            team_1_info.score AS team_1_score, 
                            team_2_info.id AS team_2_id, 
                            team_2_info.name AS team_2_name, 
                            team_2_info.score AS team_2_score

                        FROM 
                        (
                            SELECT team_1.id as id, team_1.tournament_id AS tournament_id, team_1.name as name, team_1_match.match_id AS match_id, team_1_match.score AS score
                            FROM 
                            tournament_team team_1
                            INNER JOIN 
                            team_plays_in_tournament_match team_1_match
                            ON team_1.id = team_1_match.team_id AND team_1.tournament_id = team_1_match.tournament_id
                            
                            WHERE team_1.tournament_id = $1

                        ) AS team_1_info

                        INNER JOIN

                        (
                            SELECT team_2.id as id, team_2.tournament_id, team_2.name as name, team_2_match.match_id, team_2_match.score AS score
                            FROM 
                            tournament_team team_2
                            INNER JOIN
                            team_plays_in_tournament_match team_2_match
                            ON team_2.id = team_2_match.team_id AND team_2.tournament_id = team_2_match.tournament_id

                            WHERE team_2.tournament_id = $1

                        ) AS team_2_info

                        ON team_1_info.match_id = team_2_info.match_id AND team_1_info.tournament_id = team_2_info.tournament_id

                        WHERE team_1_info.id <> team_2_info.id

                    ) AS team_info

            ) AS T

    ) AS outer_team_result

    RIGHT OUTER JOIN
    -- Get all matches and phases that they are a part of
    (
        SELECT 
            M.tournament_id as tid, 
            M.id AS match_id, 
            M.round, 
            M.room, 
            M.moderator, 
            M.packet, 
            M.tossups_heard, 
            M.added_by,
            COALESCE(M.scoresheet, '{}') as scoresheet,
            array_agg(json_build_object('phase_id', P.id, 'phase_name', P.name)) AS phases
            
        FROM  
        match_is_part_of_phase MP JOIN tournament_phase P 
        ON MP.phase_id = P.id AND MP.tournament_id = P.tournament_id
        RIGHT JOIN tournament_match M
        ON M.tournament_id = MP.tournament_id AND M.id = MP.match_id
        WHERE M.tournament_id = $1
                
        GROUP BY M.id, M.tournament_id

        ORDER BY M.round 

    ) AS match_info

    ON outer_team_result.tournament_id = match_info.tid AND outer_team_result.match_id = match_info.match_id

)


