module.exports = (sequelize, Sequelize) => {
    const Genre = sequelize.define("genres", {
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
  
    Genre.associate = function(models) {
      Genre.belongsToMany(models.book, { 
          through: "books_genres" 
      });
    };

    return Genre;
  };