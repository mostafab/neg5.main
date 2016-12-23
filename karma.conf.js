// Karma configuration
// Generated on Wed Aug 03 2016 19:43:32 GMT-0400 (Eastern Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-cookies.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-animate.min.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'app/public/js/ng/app.js',
      'app/public/js/ng/index.js',
      'app/public/js/ng/home.js',
      'app/public/js/ng/services/*.js',
      'app/public/js/ng/controllers/*.js',
      'tests/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // htmlReporter: {
    //   outputDir: 'karma_html', // where to put the reports  
    //   templatePath: null, // set if you moved jasmine_template.html 
    //   focusOnFailures: true, // reports show failures on start 
    //   namedFiles: false, // name files instead of creating sub-directories 
    //   pageTitle: null, // page title for reports; browser info by default 
    //   urlFriendlyName: false, // simply replaces spaces with _ for files/dirs 
    //   reportName: 'report-summary-filename', // report summary filename; browser info by default 
      
      
    //   // experimental 
    //   preserveDescribeNesting: false, // folded suites stay folded  
    //   foldAll: false, // reports start folded (only with preserveDescribeNesting) 
    // },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
