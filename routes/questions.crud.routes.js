const { authJwt } = require("../middleware");
const controller = require("../controllers/questions.crud.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  //CRUD operations over the API

  //create a question for a book. bookId provided in the body.
  // body is structured as {question: question, answers: [answers]}
  app.post("/api/questions", controller.create);  

  // find all questions from a book with bookId
  app.get("/api/questions/:bookId", controller.findAll);

  //update a question with id. 
  app.put("/api/questions/:id", controller.update);

  /* delete question(s) from a book with bookId. 
  array if questionId's  to be deleted are provided in the body.  
  if the array is empty, all questions are deleted */
  app.delete("/api/questions/:bookId", controller.delete);

};