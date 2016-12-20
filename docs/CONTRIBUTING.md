# Contributing
These are the guidelines for contributions:

1. If you plan on contributing, please make a fork of the repo and develop
on that.
2. Every contribution will go through a pull request on the 
***dev*** branch. Please make all pull requests to that branch. 
3. Every pull request must include appropriate unit tests if it is a code change.
I write my tests using Jasmine and Karma. [Here's a good guide to using those tools](https://scotch.io/tutorials/testing-angularjs-with-jasmine-and-karma-part-1).
 

# ES6 to ES5 Transpilation
As you may have noticed, Neg 5's file structure has a ```src``` folder
and a ```build``` folder. Both of these hold server side code. Similarly,
there are folders named ```es6``` and ```js``` within the ```public``` folder.
Both the ```es6``` and ```src``` folders hold ES6 Javascript code, which Babel
transpiles down to ES5 code and pipes to the other two folders. To set up automatic
Babel transpilation, run the ```gulp``` command. This will prompt gulp to
automatically listen for file changes and transpile the appropriate files as specified
by ```gulpfile.babel.js```. For client side javascript, gulp takes the files in ```app/public/es6``` and
transpiles them to ```app/public/js/ng```, then takes those files and minifies them to ```app/public/js/min/bundle.js```.

You should never have to manually change the transpiled files.

The ```configuration.json``` file also allows you to specify if you want to serve minified client side Javascript or not. 
Setting a top-level key called ```minifyJs``` value to ```true``` will serve the minified, bundled version in ```app/public/js/min/bundle.js```.
Omitting this key or setting it to false will serve the normal files and make gulp skip minification after transpiling.  
Take a look at the jade files and ```gulpfile.babel.js``` to see how this works.  

For a guide on ES6 Javascript, please check out [this very helpful guide](https://github.com/lukehoban/es6features).

# Angular

Neg 5's front end is written with AngularJS 1.5. If you don't know Angular, that's ok!
Now's a great time to learn. I recommend starting with the official docs or just 
looking through the jade files and angular files in the project.




