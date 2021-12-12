const msg = require("../config/msg.config.js");

module.exports = (sequelize, Sequelize) => {
    const Answer = sequelize.define("answers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true, 
            autoIncrement: true
        },
        localId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                isInt: {
                    msg: "answer localID must be an integer"
                }, 
                customValidator(value) {
                    if (value) {
                      const intValue = parseInt(value);
                      if ((intValue < 1) || (intValue > 4)) {
                        throw new Error("localID must be an integer between 1 and 4");
                      }
                    }      
                }
            }
        },
        answer: {
            type: Sequelize.STRING(500),
            allowNull: false,
            validate: {
                notNull: {
                  msg: msg.MSG_ANSWER_EMPTY
                }
            }
        },
        correct: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
    }, {
        indexes: [{
            unique: true,
            fields: ['answer', 'questionId'],
            name: 'unique_answer'
            }
        ]}
    );

    Answer.associate = function(models) {        
        Answer.belongsTo(models.question, {
            onDelete: 'CASCADE'
        });
    }

    return Answer;
};