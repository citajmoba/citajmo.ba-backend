// represents the category of a question 

module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define("question_categories", {
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
    Category.associate = function(models) {
        Category.hasMany(models.question, {as: 'Question'});
    };

    return Category;
  };