select id, tournament_date, question_set, name, location
from tournament
where now()::date - tournament_date::date < ${maxDays} and (hidden = false OR hidden IS NULL)