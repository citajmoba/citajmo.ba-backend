module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("roles", {
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
  
    Role.associate = function(models) {
      Role.belongsToMany(models.user, { 
          through: "users_roles" 
        });
    };

    return Role;
  };