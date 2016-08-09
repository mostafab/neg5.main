INSERT INTO tournament_match (id, tournament_id, round, room, moderator, packet, tossups_heard, notes, added_by)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;