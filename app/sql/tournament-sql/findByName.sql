SELECT id, tournament_date, question_set, name, location
from tournament
WHERE lower(name) like ${searchName} AND (hidden = false OR hidden IS NULL)
ORDER BY name