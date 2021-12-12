module.exports = (sequelize, Sequelize) => {
    const AgeLevel = sequelize.define("age_levels", {
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

    AgeLevel.associate = function(models) {
        AgeLevel.hasMany(models.book, {as: 'Book'});
    };
  
    return AgeLevel;
  };