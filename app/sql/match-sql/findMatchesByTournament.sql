
SELECT *

FROM
(
    (
        SELECT M.id AS match_id, M.round, M.room, M.moderator, M.packet, M.tossups_heard, M.added_by,
                T.team_1_id, T.team_1_name, T.team_1_score,
                T.team_2_id, T.team_2_name, T.team_2_score,
                T.tournament_id

        FROM

            tournament_match M

            JOIN  

            (
                SELECT team_info.team_1_id AS team_1_id, team_info.team_1_name AS team_1_name, team_info.team_1_score AS team_1_score, 
                        team_info.team_2_id AS team_2_id, team_info.team_2_name AS team_2_name, team_info.team_2_score AS team_2_score,
                        team_info.match_id AS match_id, team_info.tournament_id AS tournament_id

                FROM

                -- Below SQL in parens joins the team_plays_in_tournament_match table with itself to get the two teams in a match and joins with the tournament_team table to get the team names
                    (
                        SELECT  team_1_info.match_id AS match_id, team_1_info.tournament_id AS tournament_id, team_1_info.id AS team_1_id, team_1_info.name AS team_1_name, team_1_info.score AS team_1_score, 
                                team_2_info.id AS team_2_id, team_2_info.name AS team_2_name, team_2_info.score AS team_2_score

                        FROM 
                        (
                            SELECT team_1.id as id, team_1.tournament_id AS tournament_id, team_1.name as name, team_1_match.match_id AS match_id, team_1_match.score AS score
                            FROM 
                            tournament_team team_1
                            JOIN 
                            team_plays_in_tournament_match team_1_match
                            ON team_1.id = team_1_match.team_id AND team_1.tournament_id = team_1_match.tournament_id
                        ) AS team_1_info

                        JOIN

                        (
                            SELECT team_2.id as id, team_2.tournament_id, team_2.name as name, team_2_match.match_id, team_2_match.score AS score
                            FROM 
                            tournament_team team_2
                            JOIN
                            team_plays_in_tournament_match team_2_match
                            ON team_2.id = team_2_match.team_id AND team_2.tournament_id = team_2_match.tournament_id
                        ) AS team_2_info

                        ON team_1_info.match_id = team_2_info.match_id AND team_1_info.tournament_id = team_2_info.tournament_id

                        WHERE team_1_info.id <> team_2_info.id

                    ) AS team_info

            ) AS T

            ON T.match_id = M.id AND M.tournament_id = T.tournament_id

    ) AS outer_team_result

    JOIN 
    -- Get all phases that matches are a part of
    (
        SELECT MP.tournament_id as tid, MP.match_id AS match_id, P.id as phase_id, P.name AS phase_name
        FROM  
        match_is_part_of_phase MP, tournament_phase P
        WHERE MP.phase_id = P.id AND MP.tournament_id = P.tournament_id

    ) AS match_phases

    ON outer_team_result.match_id = match_phases.match_id AND outer_team_result.tournament_id = match_phases.tid

)

WHERE outer_team_result.tournament_id = $1;
