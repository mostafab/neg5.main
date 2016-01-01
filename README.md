![alt tag](https://github.com/mostafab/neg5/blob/master/public/img/logo.png)

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
  * Now if you try starting the node server by running ```npm start``` in the directory, a message telling you that the server has started should pop up in your terminal. If you go to ```localhost:1337``` in your browser, you'll be able to see the site. You won't be able to do anything, though. We'll fix that now. 
  * The first problem is not being able to connect to a database. If you take a look at ```config/env/development.js```, you'll see why. The ```db_deployment``` variable means nothing right now. To fix that, you'll need to provide a valid url instead of what there is now, either to a local or remote database. The folks over at Mongo have written great tutorials on how to set up a local mongo instance. If you don't want to go through the hassle of setting up your own database, I suggest signing up with [mongolab.com](http://mongolab.com). 
  * If you went with a remote database, all you need to change is the ```db_deployment``` variable in ```config/env/development.js``` to point to the address of your database. If using a local mongo instance, change the last part of ```db_local``` in ```development.js``` to whatever you named your database, and in ```config/mongoose.js```, change the line ```var db = mongoose.connect(config.db_deployment)``` to ```var db = mongoose.connect(config.db_local)``` so that mongoose knows where to connect to the database. 

If you've gotten through all that, everything should be good to go! Feel free to contact me if you have any questions or have any ideas for new features or fixes. I want this project to be THE go to tool for quiz bowl tournament management, so let's make it even better! If you think something you've added should be a part of the app, let me know!
