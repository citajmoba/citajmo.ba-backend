module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        acc_no: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(30),
            allowNull: false
        },
        lastname: {
            type: Sequelize.STRING(30)
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        dob: {
            type: Sequelize.DATEONLY
        },
        username: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        password: {
            type: Sequelize.STRING(60),
            allowNull: false
        },
        type: {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: "regular"
        },
        point_balance: {
            type: Sequelize.INTEGER
        }

    });

    User.associate = function(models) {
        User.belongsToMany(models.role, { 
            through: "users_roles" 
        });

        User.hasMany(models.question, {
            as: 'Question'
        });

        User.hasMany(models.book, {
            as: 'Book'
        })
    };
    return User;
};
