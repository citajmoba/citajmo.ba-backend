const db = require("../models");
const config = require("../config/auth.config");
const msg = require("../config/msg.config");

const User = db.models.user;
const Role = db.models.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const msgConfig = require("../config/msg.config");
const { MSG_USER_SIGNUP_SUCCESS } = require("../config/msg.config");

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: msg.MSG_USER_SIGNUP_SUCCESS });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: msg.MSG_USER_SIGNUP_SUCCESS });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: msg.MSG_USER_NOT_FOUND });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: msg.MSG_INVALID_PASSWORD
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.resetpwd = (req, res) => {
  const { email } = req.body;

  try {
    // look for email in database
    const [user] = await filterBy({ email });
    // if there is no user send back an error
    if(!user) {
      res.status(404).json({ error: "Invalid email" });
    } else {
      // otherwise we need to create a temporary token that expires in 10 mins
      const resetLink = jwt.sign({ user: user.email }, 
      resetSecret, { expiresIn: '10m' });
      // update resetLink property to be the temporary token and then send email
      await update(user.id, { resetLink });
      // we'll define this function below
      sendEmail(user, resetLink);
      res.status(200).json({ message: "Check your email"} );
    }
  } catch(error) {
    res.status(500).json({ message: error.message });
  }

}