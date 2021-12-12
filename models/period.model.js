//represents the literary period the book belongs to

module.exports = (sequelize, Sequelize) => {
    const Period = sequelize.define("periods", {
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
  
    Period.associate = function(models) {
      Period.belongsToMany(models.book, { 
          through: "books_periods" 
      });
    };

    return Period;
  };