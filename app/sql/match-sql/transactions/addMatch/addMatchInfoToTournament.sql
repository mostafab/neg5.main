INSERT INTO tournament_match (id, tournament_id, round, room, moderator, packet, tossups_heard, notes, scoresheet, added_by, serial_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::json[], $10, $11)
RETURNING *;