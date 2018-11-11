# Getting Started
Here are the basic steps to set up the Neg 5 server.

1. Clone the repo:
        git clone https://github.com/mostafab/neg5.main.git
        
2. Neg 5's web server runs on Node.js with the Express framework. As such, you
will need to [download Node](https://nodejs.org/en/) before you can run the
server.

3. Install all required dependencies at the top level of the repo 
(in the same location as package.json) using ```npm install```.
Look at ```package.json``` for details on which specific packages were installed.
        
4. Now you need to download Postgresql as its data store. First, Install the [Postgres server](https://www.postgresql.org/). 
Neg 5 uses version 9.5, but 9.6 and above should work just fine.

5. Using your favorite database interaction tool, create a local development database called ```quizbowl``` with a username and password.

6. Within this database, run the bootstraping SQL in ```sql_statements/create_tables.sql``` and ```sql_statements/create_indexes.sql```.
This will create all necessary database tables.
You will also need to run all the SQL migrations inside ```docs/database/sql_statements/migrations```

7. Neg 5 reads certain environment variables on server startup to connect to its database, setup server secrets, etc. to be set for startup to work properly. To recreate this locally, create a ```.env``` file in the top-level directory and populate it with the following values, substituting in your own as required.

```
OWN_NODE_ENV=LOCAL
PG_DB_URL_LOCAL=postgres://<username>:<password>@localhost:5432/quizbowl
PG_DB_READ_ONLY_LOCAL=postgres://<username>:<password>@localhost:5432/quizbowl
STATS_BASE_URL_LOCAL=http://localhost:3000
STATS_API_BASE_URL_LOCAL=http://localhost:9000
NEG5_API_BASE_URL=http://localhost:1337
JWT_SECRET=<Secret>
PORT=8080
npm_lifecycle_event=test
STATS_CACHE_TTL=1
STATIC_ASSETS_CACHE_TIME_MS=20
```

8. At this point, you should be able to start the server by running ```npm start```.
The terminal should print a message stating "Express serving running on port X", where X is the port
specified in the above ```.env``` file. Open up a web browser and navigate to localhost:X to verify.

For information on workflow and contributing, please see the [contributing guide](CONTRIBUTING.md).

If you think there's a step missing here, please let me know! 