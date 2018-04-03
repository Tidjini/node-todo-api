const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

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

const User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
