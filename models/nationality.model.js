// represents the nationality to which te book belongs.
// in some cases, that may be different from the nationality of the author

module.exports = (sequelize, Sequelize) => {
    const Nationality = sequelize.define("book_nationalities", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false
      }
    });
  
    Nationality.associate = function(models) {
      Nationality.belongsToMany(models.book, { 
          through: "books_nationalities" 
      });
    };

    return Nationality;
  };