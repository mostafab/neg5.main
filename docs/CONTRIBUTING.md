# Contributing
These are the guidelines for contributions:

1. If you plan on contributing, please make a fork of the repo and develop
on that.
2. Every contribution will go through a pull request targeted to the master branch. When openingn a PR, please make that your target branch.
3. Every pull request must include appropriate unit tests if it is a code change.
I write my tests using Jasmine and Karma. [Here's a good guide to using those tools](https://scotch.io/tutorials/testing-angularjs-with-jasmine-and-karma-part-1).
 

# ES6 to ES5 Transpilation
As you may have noticed, Neg 5's file structure has a ```src``` folder
and a ```build``` folder. Both of these hold server side code. The front-end code lives in the 
there are folders named ```es6``` and ```es5``` within the ```public/javascript``` folder.
Both the ```es6``` and ```src``` folders hold ES6 Javascript code, which Babel
transpiles down to ES5 code and pipes to the other two folders. To set up automatic
Babel transpilation for front-end code, run the ```npm run webpack``` command. This will prompt webpack to
automatically listen for file changes and transpile the appropriate files into a
```app.bundle.js```. Server-side code will automatically be transpiled after running ```npm run start`.

You should never have to manually change the transpiled files.

For a guide on ES6 Javascript, please check out [this very helpful guide](https://github.com/lukehoban/es6features).

# Angular

Neg 5's front end is written with AngularJS 1.5. If you don't know Angular, that's ok!
Now's a great time to learn. I recommend starting with the official docs or just 
looking through the jade files and angular files in the project.

# Style Guide
This project includes an ```.eslintrc.json``` file for ESLint configuration.
It follows the [Airbnb Javascript style guide.](https://github.com/airbnb/javascript)
If you use Visual Studio Code, please install the ESLint extension.
VS Code should automatically pick up the ```.eslintrc.json``` and warn of any
style errors. Please follow the warnings as closely as you can.

If you don't use Visual Studio Code, please use ESLint with the given
```eslintrc.json``` with your preferred text editor.  