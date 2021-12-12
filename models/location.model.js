// represents the physical locations where books are stored  

module.exports = (sequelize, Sequelize) => {
    const Location = sequelize.define("locations", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(50)
      },
      city: {
        type: Sequelize.STRING(30)
      }
    });
  
    Location.associate = function(models) {
      Location.belongsToMany(models.book, { 
          through: "books_locations" 
      });
    };

    return Location;
  };