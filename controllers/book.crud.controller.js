const db = require("../models");
const Book = db.models.book;
const Period = db.models.period;
const Genre = db.models.genre;
const Nationality = db.models.nationality;
const Location = db.models.location;
const Op = db.Sequelize.Op;
const msg = require("../config/msg.config.js");

const setBookAssociations = async (book, data) => {
    //promiseArray is the returned array of promises
    let promiseArray = [];

    // this passes the book object on along wth the returned promisses 
    const bookPromise = new Promise((resolve) => {
        resolve(book)
    });
    promiseArray.push(bookPromise);

    if (data.periods && data.periods.length > 0) {
        const periods = await Period.findAll( {
            where: {
                name: {
                [Op.or]: data.periods
                }
            }
        });
        promiseArray.push(book.setPeriods(periods));
    };

    if (data.genres && data.genres.length > 0) {
        const genres  = await Genre.findAll({
        where: {
            name: {
            [Op.or]: data.genres
            }
        }
        });
        promiseArray.push(book.setGenres(genres));
    };

    if (data.bookNationalities && data.bookNationalities.length > 0) {
        const nationalities = await Nationality.findAll({
        where: {
            name: {
            [Op.or]: data.bookNationalities
            }
        }
        });
        promiseArray.push(book.setBookNationalities(nationalities));
    };

    if (data.locations && data.locations.length > 0) {
        const locations = await Location.findAll({
        where: {
            name: {
            [Op.or]: data.locations
            }
        }
        });
        promiseArray.push(book.setLocations(locations));
    };

    return Promise.all(promiseArray); 
}

// Create and Save a new Book
exports.create = (req, res) => {
    // Validate title and author.
    if ((!req.body.title) || (!req.body.author)) {
        res.status(400).send({
          message: msg.MSG_TITLE_OR_AUTHOR_EMPTY
        });
        return;
    };
    
    //replace đ with dj in the title and author to facilitate search
    // on non-accented keyboards
    req.body.title.replace("đ","dj").replace("Đ", "Dj");
    req.body.author.replace("đ","dj").replace("Đ", "Dj");

    req.body.status = req.body.status ? req.body.status : "WIP";
    
    // Save the book in the database
    Book.create(req.body)
    .then(data => setBookAssociations(data, req.body) )
      .then((associations) => res.send(associations[0])) //associations[0] is the newly created book object w/out associations
      .catch(err => {  
        switch (err.name) {
          case "SequelizeValidationError":
            res.status(400).send({
                message: msg.MSG_ERR_VALIDATION_BOOK  + " : " + err.message + " : " + err.name
            });
            break; 
        /* sequelize does not support custom error messages for
            the unique constraint across multiple columns so 
            the error message must be created here */
          case "SequelizeUniqueConstraintError":
            console.log(err);
            res.status(400).send({
                message: msg.MSG_ERR_BOOK_EXISTS + " : " + err.message + " : " + err.name
            });
            break; 
          
          default:
            res.status(500).send({
                message: msg.MSG_ERR_CREATE_BOOK + " : " + err.message + " : " + err.name
            });
        }
    });
};

// Retrieve all books satisfying a filter from the database.
exports.findAll = (req, res) => {
    //filter array for the 'books' table
    const filterArr = [];

    // construct the filter arrays 
    for (const field in req.query) {
        switch (field) {
            case "title":
            case "author":  

                // create search filter with accented characters (š,đ,ž,č,ć)
                const newFilterAccented = {};        
                newFilterAccented[field] = {[Op.iLike]: `%${req.query[field]}%`};

                //create search filter with unaccented characters
                const newFilterUnaccented = {};  
                newFilterUnaccented[field] = db.Sequelize.where(db.Sequelize.fn('unaccent', db.Sequelize.col(field)), {
                    [Op.iLike]: `%${req.query[field]}%` });

                filterArr.push( { [Op.or]: [newFilterAccented, newFilterUnaccented] } );
                break;

            case "periods":
                filterArr.push({'$Period.name$': req.query[field]});
                break;
            case "genres":
                filterArr.push({'$Genre.name$': req.query[field]});
                break;
            case "bookNationalities":
                filterArr.push({'$Nationality.name$': req.query[field]});
                break;
            case "locations":
                filterArr.push({'$Location.name$': req.query[field]});
                break;
            default:
                let newFilter = {};
                newFilter[field] = req.query[field];
                filterArr.push(newFilter);
        }   
    };
    //include array for the associated tables
    const includeArr = [{
        model: Period,
        attributes: ['name'],
    },
    {
        model: Genre,
        attributes: ['name'],
    },
    {
        model: Location,
        attributes: ['name'],
    },
    {
        model: Nationality,
        as: 'bookNationalities',
        attributes: ['name'],
    }];

    //find statement starts here
    Book.findAll({ where: { [Op.and]:  filterArr }, include: includeArr})
        .then(data => { 
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                err.message || msg.MSG_ERR_SEARCH_BOOK
            });
        });
};

// Find a single Book with an id
exports.findOne = (req, res) => {
    Book.findByPk(req.params.id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                err.message || msg.MSG_ERR_SEARCH_BOOK
            });
        });
};

// Update a Book by the id in the request
exports.update = (req, res) => {
    //replace đ with dj in the title and author to facilitate search
    // on non-accented keyboards
    req.body.title.replace("đ","dj").replace("Đ", "Dj");
    req.body.author.replace("đ","dj").replace("Đ", "Dj");

    const id = req.params.id;

    Book.update(req.body, {
      where: { id: id },
      returning: true
    })
        //model.update returns a two-member array
        //the 1st member 'num' is the number of updated rows
        //the 2nd member '[data]' is an array of updated rows 
      .then(([num, [data]]) => {
        if (num == 1) {
          setBookAssociations(data, req.body);  
          res.send({
            message: msg.MSG_UPDATE_SUCCESS
          });
        } else {
          res.send({
            message: msg.MSG_UPDATE_FAILURE
          });
        }
      })
      .catch(err => {
        switch (err.name) {
            case "SequelizeValidationError":
              res.status(400).send({
                  message: msg.MSG_ERR_VALIDATION_BOOK  + " : " + err.message + " : " + err.name
              });
              break; 
          /* sequelize does not support custom error messages for
              the unique constraint across multiple columns so 
              the error message must be created here */
            case "SequelizeUniqueConstraintError":
              res.status(400).send({
                  message: msg.MSG_ERR_BOOK_EXISTS  + " : " + err.message + " : " + err.name
                });
              break; 
            
            default:
              res.status(500).send({
                  message: msg.MSG_UPDATE_FAILURE_WITH_ID + id  + " : " + err.message + " : " + err.name
              });
          }
      });
};

// Delete a book with the specified id in the params
exports.delete = (req, res) => {
    const id = req.params.id;

    Book.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: msg.MSG_DELETE_SUCCESS
          });
        } else {
          res.status(400).send({
            message: msg.MSG_DELETE_FAILURE + "." + msg.MSG_BOOK_NOT_EXIST
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: msg.MSG_DELETE_FAILURE
        });
      });
};
