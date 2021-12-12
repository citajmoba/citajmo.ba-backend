// this routine creates and optionally seeds a new database
// seeding is enabled by option --seedDB
// if db already exists, error occurs

const args = require('minimist')(process.argv.slice(2));
const pgtools = require("pgtools");
require('dotenv').config();
console.log(process.env.DB_NAME);
(async () => {
  // create new database
    await pgtools.createdb(
        {
            user: process.env.DB_USER, 
            host: process.env.DB_HOST, 
            password: process.env.DB_PASSWORD, 
            port: process.env.DB_PORT 
        },
        process.env.DB_NAME,
        function(err, res) {
            if (err) {
            console.error(err);
            process.exit(-1);
            }
            console.log(res);
        });
  // create tables
  const db = require("./models");
  //sync the db
  await db.sequelize.sync();
  await db.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent;', {raw: true});
  // seed the database
  if (args.hasOwnProperty('seedDB')) {require("./config/seed_data")(db)};
})();
