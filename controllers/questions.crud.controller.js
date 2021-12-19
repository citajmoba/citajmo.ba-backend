const db = require("../models");
const Question = db.models.question;
const Answer = db.models.answer;

const msg = require("../config/msg.config.js");
const { response } = require("express");

  //create a question for a book with bookId.
exports.create = (req, res) => {
    const noAnswers = req.body.answers.length ? req.body.answers.length : 0;

     // Validate the question
     if (!req.body.question.question) {
        res.status(400).send({
            message: msg.MSG_QUESTION_EMPTY
          });
          return
    }

     // Validate number of answers
     if ((noAnswers == 0) || (req.body.question.numberOfAnswers != noAnswers)) {
        res.status(400).send({
            message: msg.MSG_ERR_CREATE_ANSWER
          });
        return;
    }
    //replace đ with dj to facilitate search on non-accented keyboards
    req.body.question.question.replace("đ","dj").replace("Đ", "Dj");

    // Save Question in the database
    Question.create(req.body.question)
        .then(question => {
            let promiseArray = [];
            req.body.answers.forEach( el => {
                // prepare array of promises for Promise.all
                promiseArray.push(question.createAnswer(el))
            });
            // create all the answers in one shot using Promise.all
            const allPromise = Promise.all(promiseArray);
            allPromise.then( answers => {
                res.send({question: question, answers: answers})
            })
        })
        .catch(err => {
            switch (err.name) {
                case "SequelizeValidationError":
                  res.status(400).send({
                    message: msg.MSG_ERR_VALIDATION_QUESTION + " : " + err.message + " : " + err.name
                  });
                  break; 
              /* sequelize does not support custom error messages for
                  the unique constraint across multiple columns so 
                  the error message must be created here */
                case "SequelizeUniqueConstraintError":
                  res.status(400).send({message: msg.MSG_ERR_QUESTION_EXISTS  + " : " + err.message + " : " + err.name});
                  break; 
                
                default:
                  res.status(500).send({
                      message: msg.MSG_ERR_CREATE_QUESTION + " : " + err.message + " : " + err.name
                  });
              }
        });     
};  

// find all questions from a book with bookId provided as a body param
exports.findAll = (req, res) => {
    Question.findAll({ 
            where: { bookId: req.params.bookId },
            include: {
                model: Answer,
                as: 'Answer',
                attributes: ['id', 'localId', 'answer', 'correct']
            } 
        })
        .then(data => { 
            const formattedResponse = data.map( el => {
                return {
                    question: {
                      id: el.id,
                      question: el.question,
                      comment: el.comment,
                      userId: el.userId,
                      bookId: el.bookId,
                      difficultyLevelId: el.difficultyLevelId,
                      questionCategoryId: el.questionCategoryId,
                      numberOfAnswers: el.numberOfAnswers,
                      approved: el.approved
                    },
                    answers: el.Answer
                }
            })
            res.send(formattedResponse);
        })
        .catch(err => {
            res.status(500).send({
                message:
                err.message || msg.MSG_ERR_SEARCH_QUESTION
            });
        });

};

//update a question from a book with question id provided as a param. 
//update the answers along with the question
exports.update = (req, res) => {
     // Validate number of answers
     if (req.body.question.numberOfAnswers != req.body.answers.length) {
        res.status(400).send({
            message: msg.MSG_ERR_CREATE_ANSWER
          });
        return;
    }
     //replace đ with dj to facilitate search on non-accented keyboards
     if (req.body.question.question) 
        {req.body.question.question.replace("đ","dj").replace("Đ", "Dj");}; 

    const questionId = req.params.id; 
    Question.update(req.body.question, {
        where: { id: questionId },
        returning: true
      })
        .then( ([num, [data]]) => {  //num is the number of updated questions
          if (num != 1) {
            res.status(400).send({message: msg.MSG_QUESTION_NOT_EXIST})
          } else {
            // update the answers 
            let promiseArray = [];
            req.body.answers.forEach( a => {
                promiseArray.push(Answer.update(a, {where: {id: a.id}}))
            })
            return Promise.all(promiseArray);
        }
        })
        .then(res.send({message: msg.MSG_UPDATE_SUCCESS}))
        .catch(err => {
            
            switch (err.name) {
                case "SequelizeValidationError":
                  res.status(400).send({
                      message: msg.MSG_ERR_VALIDATION_QUESTION + " : " + err.message + " : " + err.name
                  });
                  break; 
              /* sequelize does not support custom error messages for
                  the unique constraint across multiple columns so 
                  the error message must be created here */
                case "SequelizeUniqueConstraintError":
                  res.status(400).send({
                      message: msg.MSG_ERR_QUESTION_EXISTS  + " : " + err.message + " : " + err.name
                    });
                  break; 
                
                default:
                  res.status(500).send({
                      message: msg.MSG_UPDATE_FAILURE  + " : " + err.message + " : " + err.name
                  });
              }
        });
};

/* delete question(s) from a book with bookId provided as a param. 
Question id provided in the body
If the body is empty, all the questions for the bookId are deleted
Deleting a question automatically delets all the answers to that question */
exports.delete = (req, res) => {

    // delete individual questions, if there are any 
    if (req.body.id) {
        Question.destroy({
            where: { id: req.body.id, bookId: req.params.bookId }
          })
            .then(num => {
              if (num == 1) {
                res.send({
                  message: msg.MSG_QUESTION_DELETE_SUCCESS
                });
              } else {
                res.status(400).send({
                  message: msg.MSG_QUESTION_DELETE_FAILURE + "." + msg.MSG_QUESTION_NOT_EXIST
                });
              }
            })
            .catch(err => {
              res.status(500).send({
                message: msg.MSG_QUESTION_DELETE_FAILURE
              });
            });
    } else {
        // delete all questions 
        Question.destroy({ where: {bookId: bookId}})
        .then(num => {
            if (num > 0) {
              res.send({
                message: msg.MSG_QUESTION_DELETE_SUCCESS + ` (${num})`
              });
            } else {
              res.status(400).send({
                message: msg.MSG_QUESTION_DELETE_FAILURE + "." + msg.MSG_QUESTION_NOT_EXIST
              });
            }
          })
        .catch(err => {
            res.status(500).send({
                message: msg.MSG_QUESTION_DELETE_FAILURE
            });
        });
    }; 
};
