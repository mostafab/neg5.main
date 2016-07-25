SELECT username, name, email 
FROM account
WHERE username LIKE $1 OR name LIKE $1 OR email LIKE $1
        AND (hidden = false OR hidden IS NULL);