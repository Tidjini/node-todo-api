const { User } = require("../models/User");

//create a midle weare to hide or continue to user account
//the next operation start when next() executed
const authenticate = (req, res, next) => {
  //get generate token and find user from the header
  const token = req.header("x-auth");
  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject();
      }
      //res.send(user);
      req.user = user;
      req.token = token;
      next();
    })
    .catch(err => {
      res.status(401).send(err);
    });
};

module.exports = { authenticate };
