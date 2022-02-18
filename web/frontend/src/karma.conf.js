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
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-spec-reporter')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [],
    exclude: [],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      dir: path.join(__dirname, '../test-coverage'), // so it will add coverage report into test-coverage dir on frontend root level
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
          statements: 1,
          lines: 1,
          branches: 1,
          functions: 1
        },
        each: { // thresholds per file
          statements: 80,
          lines: 80,
          branches: 40,
          functions: 80,
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
      ? ['progress', 'coverage-istanbul', 'spec']
      : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: true,
    browserDisconnectTolerance: 2, // maximum number of tries a browser will attempt in the case of a disconnection
    browserNoActivityTimeout: 400000,
    browserDisconnectTimeout: 10000,
    browsers: ['ChromeHeadlessNoSandbox', 'ChromeNoSandbox'], // only used for running tests as root within docker container
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--headless']
      },
      ChromeNoSandbox: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  });
};
