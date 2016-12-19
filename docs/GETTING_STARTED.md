# Getting Started
Here are the basic steps to set up the Neg 5 server.

1. Clone the repo:
        git clone https://github.com/mostafab/neg5.git
        
2. Neg 5's web server runs on Node.js with the Express framework. As such, you
will need to [download Node](https://nodejs.org/en/) before you can run the
server.

3. Install all NPM dependencies at the top level of the repo 
(in the same location as package.json). If Node was installed correctly, NPM should have also
been installed with it. Run ```npm install``` to install application
dependencies as well as development dependencies (Babel, Gulp, Karma, Jasmine).
Look at package.json for details on which specific packages were installed.
        
4. So you've got Node.js and all Neg 5's dependencies installed? Great!
Now you need a database. Neg 5 uses Postgresql as its data store. First, Install the [Postgres server](https://www.postgresql.org/). 
Neg 5 uses version 9.5, but 9.6 and above should work just fine.

5. After installing Postgres, this will also install PgAdmin. Within PgAdmin,
create a development database. It doesn't matter what you name it, as we'll see
in a few steps. For more information on how to use PgAdmin, please see the
Postgres docs.

6. Within this database, run the SQL statement in ```sql_statements/create_tables.sql```.
This will create all necessary database tables. You can do this through PgAdmin.

7. Create a file named ```configuration.json``` in one file directory above the
directory where you cloned the repo. For example, if you cloned the repo at
```C:\Documents\projects```, you would create ```configuration.json```
in ```C:\Documents```. The application reads this file at startup to determine a few
configuration settings, like the database connection string, environment, and key 
values. You can use this as a template. 

    ```
 {
        "databaseConnections" : {
                "postgres" : {
                    "development": "postgres://#username:#password@localhost:5432/#databaseName"
                }
        },
        "env" : "development",
        "jwt" : {
            "secret" : "MyJSONSecret"
        },
        "port" : 8080
}
```
Remember the database you created in step 5? For the database string in 
```databaseConnections.postgres.development```, replace ```#username``` with the username you
created, ```#password``` with the password you created for that username, and ````#databaseName```
with the name of the database you created. If you would rather use a remote database for development,
you can simply create another key-value pair with the key being the environment and the value being
the connection string to the database. Remember to change the value of ```env``` to the 
appropriate name if you do this. By default, Postgres will listen on port 5432. Based on
how you set up your database, this could be different.
Neg 5 uses JSON Web Tokens to authenticate every request. The ```jwt.secret``` 
is simply the secret you want to use to encode and decode the information in a request. Change
this to whatever you wish.
The port is of course just the port that the Express server listens on. Feel free to change this
to your favorite port number :)

8. Ok, we're almost done, I promise! At this point, if all the other steps went well, you should be
able to start the server by running ```npm start```.
The terminal should print a message stating "Express serving running on port X", where X is the port
specified in ```configuration.json```. Open up a web browser and navigate to localhost:X to confirm.

For information on workflow and contributing, please see the [contributing guide](CONTRIBUTING.md).

If you think there's a step missing here, please let me know! 