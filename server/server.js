const express = require("express");
const bodyParser = require("body-parser");
const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/Todo");
const { User } = require("./models/User");
const { ObjectID } = require("mongodb");
const { authenticate } = require("./middleware/authenticate");

require("./config/config");

const _ = require("lodash");

const app = new express();

app.use(bodyParser.json());

//TODOS
//Private
app.post("/todos", authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then(
    doc => {
      res.send(doc);
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.get("/todos", authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id }).then(
    todos => {
      res.send({ todos });
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.get("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Todo.findOne({ _id: id, _creator: req.user._id }).then(
    todo => {
      if (todo == null) return res.status(404).send("TODO not found");
      res.send({ todo });
    },
    err => {
      res.status(400).send();
    }
  );
});

app.delete("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Todo.findOneAndRemove({ _id: id, _creator: req.user._id }).then(
    todo => {
      if (todo == null) return res.status(404).send("TODO not found");
      res.send({ todo });
    },
    err => {
      res.status(400).send();
    }
  );
});

app.patch("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  //previous way to pck data from body
  // const todo = new Todo({
  //   text: req.body.text
  // });
  //new version with lodash (picks item if it exist)
  const body = _.pick(req.body, ["text", "complited"]);

  if (_.isBoolean(body.complited) && body.complited) {
    body.complitedAt = new Date().getTime();
  } else {
    body.complited = false;
    body.complitedAt = null;
  }

  Todo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .then(todo => {
      if (todo == null) return res.status(404).send("TODO not found");
      res.send({ todo });
    })
    .catch(err => {
      res.status(400).send();
    });
});

//TODOS

//USERS
//post request
app.post("/users", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);
  const user = new User(body);

  user
    .save()
    .then(user => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

//for private response to specefic user (use authenticate middleware)
app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
});

app.post("/users/login", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);

  User.findByCreadentials(body.email, body.password)
    .then(user => {
      user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(err => {
      res.status(400).send();
    });
});

//here we must be in private route (use authenticate) to log out
app.delete("/users/me/token", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Started on Port", PORT);
});

module.exports = {
  app
};
