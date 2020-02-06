const path = require('path');

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-junit-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [],
    exclude: [],
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'), reports: [ 'html', 'lcovonly' ],
      dir: path.join(__dirname, 'doc-tests-coverage'),
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: false,
      'report-config': {
        // all options available at: https://github.com/istanbuljs/istanbul-reports/blob/590e6b0089f67b723a1fdf57bc7ccc080ff189d7/lib/html/index.js#L135-L137
        html: {
          // outputs the report in ./coverage/html
          subdir: 'html'
        }
      },

      // enforce percentage thresholds
      // anything under these percentages will cause karma to fail with an exit code of 1 if not running in watch mode
      thresholds: {
        emitWarning: true, // set to `true` to not fail the test command when thresholds are not met
        global: { // thresholds for all files
          statements: 90,
          lines: 90,
          branches: 40,
          functions: 90
        },
        each: { // thresholds per file
          statements: 90,
          lines: 90,
          branches: 40,
          functions: 90,
        }
      }
    },
    htmlReporter: {
      outputDir: 'doc-tests-results/',
      pageTitle: 'Jasmine Unit Test Results',
      urlFriendlyName: true,
      namedFiles: true,
      preserveDescribeNesting: true,
      foldAll: true
    },
    junitReporter: {
      outputDir: 'doc-tests-results/',
      useBrowserName: true
    },

    preprocessors: {},
    reporters: config.angularCli && config.angularCli.codeCoverage
      ? ['progress', 'coverage-istanbul']
      : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [],
    singleRun: true,
    browserNoActivityTimeout: 60000,
    processKillTimeout: 60000,
    browserDisconnectTimeout: 60000
  });
};
