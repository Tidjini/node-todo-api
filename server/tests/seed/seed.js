const { Todo } = require("../../models/Todo");
const { User } = require("../../models/User");
const { ObjectID } = require("mongodb");

const jwt = require("jsonwebtoken");
const TIME_OUT = 0;

const userIdOne = new ObjectID();
const userIdTwo = new ObjectID();
const users = [
  {
    _id: userIdOne,
    email: "tidjin@example.com",
    password: "userOnePass",
    tokens: [
      {
        access: "auth",
        token: jwt
          .sign({ _id: userIdOne.toHexString(), access: "auth" }, "abc123")
          .toString()
      }
    ]
  },
  {
    _id: userIdTwo,
    email: "mess@example.com",
    password: "userTwoPass"
  }
];

//remove before each done method
const populateUsers = done => {
  //init the time out
  //this.timeout(10000);
  setTimeout(done, TIME_OUT);
  //
  User.remove({})
    .then(() => {
      // NOTE: insertMany will not give us the good result cause we use middleware, may be one of the passwords will save as plain text
      // we save each user apart, and waiting untill all users done of saving and we return the promise resulte
      // => Promise.all([..., .....]);
      //return Todo.insertMany(todos);
      const userOnePromise = new User(users[0]).save();
      const userTwoPromise = new User(users[1]).save();
      return Promise.all([userOnePromise, userTwoPromise]);
    })
    .then(() => done());
};

const todos = [
  {
    _id: new ObjectID(),
    text: "First Test Todo"
  },
  {
    _id: new ObjectID(),
    text: "Second Test Todo"
  }
];

//remove before each done method
const populateTodos = done => {
  //init the time out
  //this.timeout(10000);
  setTimeout(done, TIME_OUT);
  //
  Todo.remove({})
    .then(() => {
      //for getting some data
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

module.exports = { todos, users, TIME_OUT, populateTodos, populateUsers };
