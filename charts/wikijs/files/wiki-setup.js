const path = require('path');
const autoload = require('auto-load');
const Knex = require('knex');
const Promise = require('bluebird');
const fs = require('fs');
const http = require('http');

let WIKI = {
  IS_DEBUG: process.env.NODE_ENV === 'development',
  IS_MASTER: true,
  ROOTPATH: process.cwd(),
  SERVERPATH: path.join(process.cwd(), 'server'),
  Error: require('./helpers/error'),
  configSvc: require('./core/config'),
  kernel: require('./core/kernel')
}
global.WIKI = WIKI
WIKI.configSvc.init()
WIKI.logger = require('./core/logger').init('MASTER');

dbClient = 'mysql2'
dbConfig = {
  host: WIKI.config.db.host,
  user: WIKI.config.db.user,
  password: WIKI.config.db.pass,
  database: WIKI.config.db.db,
  port: WIKI.config.db.port
}

knex = Knex({
  client: dbClient,
  useNullAsDefault: true,
  asyncStackTraces: WIKI.IS_DEBUG,
  connection: dbConfig,
  pool: {
  ...WIKI.config.pool,
  async afterCreate(conn, done) {
    // -> Set Connection App Name
    switch (WIKI.config.db.type) {
    case 'postgres':
      await conn.query(`set application_name = 'Wiki.js'`)
      done()
      break
    default:
      done()
      break
    }
  }
  },
  debug: WIKI.IS_DEBUG
})

data = JSON.stringify({
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminPasswordConfirm: process.env.ADMIN_PASSWORD,
  siteUrl: process.env.URL,
  telemetry: false
})

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/finalize',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

samlData = JSON.parse(fs.readFileSync('./server/saml.json'));
samlData.cert = process.env.SSO_IDP_CRT;
samlData.privateCert = process.env.SAML_KEY;
samlData.decryptionPvk = process.env.SAML_KEY;
samlData.issuer = process.env.URL;

//Function to inject SAML config into DB
function updateSamlConfig() {
  knex('authentication')
  .where('key','=','saml')
  .update({
     isEnabled: 1,
     config: JSON.stringify(samlData),
     selfRegistration: 1,
     autoEnrollGroups: '{"v":[1]}'
  }).then(function(res) {
     console.log(res);
     process.exit();
  });
}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve,millis));
}
async function main() {
  await sleep(5000);
  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
    updateSamlConfig();
    res.on('data', d => {
      console.log("Init complete")
      process.stdout.write(d);
    });
  });
  req.on('error', error => {
    console.error(error)
    main();
  })
  req.write(data)
  req.end();
}
console.log("Starting initialization script");
main();
