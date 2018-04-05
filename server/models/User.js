const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

//instance method for each user UserSchema.methods
// NOTE: not using for arrow func cause we need to access to "this" keyword

//Override toJSON func (it called when the instance is called)
UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ["_id", "email"]);
};

UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = "auth";
  const token = jwt
    .sign({ _id: user._id.toHexString(), access }, "abc123")
    .toString(); // DATA + Secret value
  user.tokens.push({ access, token });

  //return the promise here from the server..
  return user.save().then(() => {
    //this return the token local var (Client side not server side)
    return token;
  });
};

//use mongoose middleware (take action in given event) before save the user we need to hash the password
//is look like express middleware call next to continue

// NOTE: here before saving we must call the function with next param
UserSchema.pre("save", function(next) {
  const user = this;
  //here this fun will be called before each save (and it's error; cause we need to track just the password changement)
  //to resolve this we need to check password changement
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
//UserSchema.methods.generateHashPassword = function(password) {};

//statics methods for Class (Some method attach the class not the instance)
UserSchema.statics.findByToken = function(token) {
  const User = this; // NOTE: this => for the class (the model)
  let decoded;
  try {
    decoded = jwt.verify(token, "abc123");
  } catch (e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject();
  }
  // NOTE: tokens.token => parcour each token object in tokens array stored in user object (also true for access)
  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

UserSchema.statics.findByCreadentials = function(email, password) {
  const User = this; // NOTE: this => for the class (the model)
  return User.findOne({ email }).then(user => {
    if (!user) {
      //if user don't exist return reject promise to fire the catch in the call
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      //verify the password with bcrypt method
      //if pass match return the user
      //else logout
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

const User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
