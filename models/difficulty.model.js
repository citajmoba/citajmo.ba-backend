module.exports = (sequelize, Sequelize) => {
    const Difficulty = sequelize.define("difficulty_levels", {
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

    Difficulty.associate = function(models) {
      Difficulty.hasMany(models.question, {as: 'Question'});
      Difficulty.hasMany(models.book, {as: 'Book'});
    };
  
    return Difficulty;
  };