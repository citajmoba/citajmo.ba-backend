const msg = require("../config/msg.config.js");

module.exports = (sequelize, Sequelize) => {
    const Book = sequelize.define("books", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING(200),
            allowNull: false,
            validate: {
                notNull: {
                  msg: msg.MSG_TITLE_OR_AUTHOR_EMPTY
                }
            }
        },
        author: {
            type: Sequelize.STRING(100),
            allowNull: false,
            validate: {
                notNull: {
                  msg: msg.MSG_TITLE_OR_AUTHOR_EMPTY,
                }
              }
        },
        summary: {
            type: Sequelize.TEXT
        },
        publication_year: {
            type: Sequelize.INTEGER,
            validate: {
                customValidator(value) {
                    if (value) {
                      const intValue = parseInt(value);
                      const currentYear = new Date().getFullYear();
                      if ((intValue < 0) || (intValue > currentYear)) {
                        throw new Error(msg.MSG_ERR_PUB_YEAR_INVALID);
                      }
                    }      
                }
            }
        },
        value: {
            type: Sequelize.INTEGER,
            defaultValue: 5,
            validate: {
                customValidator(value) {
                    if (value) {
                      const intValue = parseInt(value);
                      if ((intValue < 1) || (intValue > 10)) {
                        throw new Error(msg.MSG_ERR_VALUE_INTEGER);
                      }
                    }      
                }
            }, 
        },

        status: {
            type: Sequelize.STRING(10),
            allowNull: false,
            defaultValue: "WIP",
            validate: {
                isIn: {
                    args: [['WIP', 'unpublished', 'published']],
                    msg: "Invalid book status. It must be 'WIP', 'unpublished' or 'published'"
                }
            }
        }
    }, {
        indexes: [{
            unique: true,
            fields: ['author', 'title'],
            name: 'unique_book'
            }
        ]}
    );
    Book.associate = function(models) {
        Book.belongsToMany(models.genre, { 
            through: "books_genres" 
        });
        Book.belongsToMany(models.period, { 
            through: "books_periods" 
        });
        Book.belongsToMany(models.nationality, { 
            through: "books_nationalities", 
            as: 'bookNationalities'
        });
        Book.belongsToMany(models.location, { 
            through: "books_locations" 
        });
        Book.hasMany(models.question, {
            as: 'Question'
        });
        Book.belongsTo(models.ageLevel);
        Book.belongsTo(models.difficulty);
        Book.belongsTo(models.user);
    };
    return Book;
};