require("dotenv");
const config = require("../config/db.config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.models = {};


db.models.user = require("../models/user.model.js")(sequelize, Sequelize);
db.models.role = require("../models/role.model.js")(sequelize, Sequelize);
db.models.book = require("../models/book.model.js")(sequelize, Sequelize);
db.models.genre = require("../models/genre.model.js")(sequelize, Sequelize);
db.models.question = require("../models/question.model.js")(sequelize, Sequelize);
db.models.answer = require("../models/answer.model.js")(sequelize, Sequelize);
db.models.period = require("../models/period.model.js")(sequelize, Sequelize);
db.models.nationality = require("../models/nationality.model.js")(sequelize, Sequelize);
db.models.location = require("../models/location.model.js")(sequelize, Sequelize);
db.models.difficulty = require("../models/difficulty.model.js")(sequelize, Sequelize);
db.models.category = require("../models/questionCategory.model.js")(sequelize, Sequelize);
db.models.ageLevel = require("../models/ageLevel.model.js")(sequelize, Sequelize);

// establish model associations, defined in the models
for (const model in db.models) {
  db.models[model].associate(db.models)
};

db.ROLES = ["reader", "contributor", "admin"];

module.exports = db;