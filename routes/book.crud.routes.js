const { authJwt } = require("../middleware");
const controller = require("../controllers/book.crud.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  //CRUD operations over the API

  //create new book
  app.post("/api/books", controller.create);  

  //search all books
  app.get("/api/books", controller.findAll);

  //find one book by id
  app.get("/api/books/:id", controller.findOne);

  //update a book. id provided in the params.
  app.put("/api/books/:id", controller.update);

  // delete a book. id provided in the params. also deletes all related questions.
  app.delete("/api/books/:id", controller.delete);
};