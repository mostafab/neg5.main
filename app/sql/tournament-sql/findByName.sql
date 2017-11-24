SELECT id, tournament_date, question_set, name, location
from tournament
WHERE (id = ${originalQuery} OR lower(name) like ${searchName}) AND (hidden = false OR hidden IS NULL)
ORDER BY name