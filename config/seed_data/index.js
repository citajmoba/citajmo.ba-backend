//import seed data into the daabase
 module.exports = function(db) {
    (async () => {
        
        const models = db.models;

        const age_levels_table = require("./age_levels.json");
        const book_nationalities_table = require("./book_nationalities.json");
        const difficulty_levels_table = require("./difficulty_levels.json");
        const genres_table = require("./genres.json");
        const locations_table = require("./locations.json");
        const periods_table = require("./periods.json");
        const question_categories_table = require("./question_categories.json");
        const roles_table = require("./roles.json");

        const promiseArray = [
        models.location.bulkCreate(locations_table),
        models.period.bulkCreate(periods_table),
        models.genre.bulkCreate(genres_table),
        models.nationality.bulkCreate(book_nationalities_table),
        models.difficulty.bulkCreate(difficulty_levels_table),
        models.ageLevel.bulkCreate(age_levels_table),
        models.category.bulkCreate(question_categories_table),
        models.role.bulkCreate(roles_table)
        ];
        await Promise.all(promiseArray,null,err => console.log('general data load failure: ' + err.message));

        const users_table = require("./users.json");
        const users_roles_table = require("./users_roles.json");
        const users = await models.user.bulkCreate(users_table, {returning: true});

        users.forEach (async user => {
        // create array of rows from users_roles table figuring user
        const filteredRoles = users_roles_table.filter(el => el.userId === user.id);

        //turn this array into a list of role id's for the user
        const roles = filteredRoles.map(el => models.role.findByPk(el.roleId));

        //associate the roles with the user and return the user model
        const results = await Promise.all(roles);
        await user.setRoles(results);
        });

        const books_genres_table = require("./books_genres.json");
        const books_locations_table = require("./books_locations.json");
        const books_nationalities_table = require("./books_nationalities.json");
        const books_periods_table = require("./books_periods.json");
        const books_table = require("./books.json");

        const books = await models.book.bulkCreate(books_table, {returning: true});
        books.forEach (async book => {
            // create array of rows from books_genres table figuring book
            const filteredGenres = books_genres_table.filter(el => el.bookId === book.id);

            // create array of rows from books_periods table figuring book
            const filteredPeriods = books_periods_table.filter(el => el.bookId === book.id);

            // create array of rows from books_locations table figuring book
            const filteredLocations = books_locations_table.filter(el => el.bookId === book.id);

            // create array of rows from books_genres table figuring book
            const filteredNationalities = books_nationalities_table.filter(el => el.bookId === book.id);

            //turn this array into a list of genre id's for the book
            const genres = filteredGenres.map(el => models.genre.findByPk(el.genreId));
            const results = await Promise.all(genres);
            await book.setGenres(results);

            const periods = filteredPeriods.map(el => models.period.findByPk(el.periodId));
            const results_1 = await Promise.all(periods);
            await book.setPeriods(results_1);

            const locations = filteredLocations.map(el => models.location.findByPk(el.locationId));
            const results_2 = await Promise.all(locations);
            await book.setLocations(results_2);

            const nationalities = filteredNationalities.map(el => models.nationality.findByPk(el.bookNationalityId));
            const results_3 = await Promise.all(nationalities);
            await book.setBookNationalities(results_3);
        });

        const answers_table = require("./answers.json");
        const questions_table = require("./questions.json");
        await models.question.bulkCreate(questions_table);
        await models.answer.bulkCreate(answers_table);
    })();
};