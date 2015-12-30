# neg5
Quizbowl tournament management system based in the cloud

### Table of Contents

* [What Exactly is Neg 5?](#intro)
* [Getting Started](#getting-started)

# <a name="intro"></a> What Exactly is Neg 5?
Neg 5 is a web application written by a quiz bowler to help other quiz bowl tournament moderators and directors run their tournaments in a collaborative manner and eliminate some of the common problems they run into at every event. A potentially unlimited number of staffers are able to work together to enter team information, game information, and handle team registration all in one application. For more information about what it can and to give it a try, check out [neg5.org](http://neg5.org). If you want to run the software as an isolated instance and not have to use the site, you can do that, too! You just need to provide the server and the database. More details below. 

# <a name='getting-started'></a> Getting Started
There are few things you'll have to configure before you can start working on the project on your machine. I'll try listing them out here:
  * First and foremost, since Neg 5 is powered by Node.js, you'll need to install that [here](http://nodejs.org)
  * Second, you'll have to install mongoDB to be able to store any sort of persistent data. Get that [here](http://mongodb.org)
  * Third, download this repo: ```git clone https://github.com/mostafab/neg5.git``. 
  * Install the required packages found in package.json by cd'ing into the git repo and running ```npm install```

