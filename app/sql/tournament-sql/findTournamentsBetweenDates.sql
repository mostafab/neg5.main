select id, tournament_date, question_set, name, location
from tournament
where tournament_date::date <= ${endDate}::date and tournament_date::date >= ${startDate} AND (hidden = false OR hidden IS NULL)