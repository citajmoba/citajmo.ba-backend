/* represent a question from a book
a question can only be a multiple choice 
with either 2 or 4 answers */
 const msg = require("../config/msg.config.js")

module.exports = (sequelize, Sequelize) => {
    const Question = sequelize.define("questions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        question: {
            type: Sequelize.STRING(500),
            allowNull: false,
            validate: {
                notNull: {
                  msg: msg.MSG_QUESTION_EMPTY
                }
            }
        },
        comment: {
            type: Sequelize.TEXT
        },
        numberOfAnswers: {
            type: Sequelize.INTEGER,
            allowNull: false,
            type: Sequelize.INTEGER,
            validate: {
                isInt: {
                    msg: msg.MSG_ERR_NUM_ANS_INVALID
                }, 
                isIn: {
                    args: [[2, 4]],
                    msg: msg.MSG_ERR_NUM_ANS_INVALID
                }, 
            }
        },
        approved: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
    Question.associate = function(models) {
        Question.hasMany(models.answer, {
            as: 'Answer', 
            onDelete: 'CASCADE', 
            hooks: true
        });
        Question.belongsTo(models.book);
        Question.belongsTo(models.difficulty);
        Question.belongsTo(models.user);
        Question.belongsTo(models.category);
    }
    return Question;
};