This is for baseline testing purposes only

## Setup For Baseline Testing

1. In web/frontend/src/tsconfig.app.json add "../static-data/baseline-testing/baseline-interval.service.ts" to the include array
2. Import baseline-interval.service.ts into constructor for component or service that will be under test
3. Pass interval name to start_interval method so that the console.log will display name with time to complete
4. Remember to "Reverse All Changes" after testing is complete