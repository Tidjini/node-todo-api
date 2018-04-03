const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/Todo');
const { User } = require('./models/User');
const { ObjectID } = require('mongodb');

const app = new express();

const PORT = 5000; //precess.env.PORT ||

app.use(bodyParser.json());

//post request
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
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

app.get('/todos', (req, res) => {
  Todo.find().then(
    todos => {
      res.send({ todos });
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Todo.findById(id).then(
    todo => {
      if (todo == null) return res.status(404).send('TODO not found');
      res.send({ todo });
    },
    err => {
      res.status(400).send();
    }
  );
});

app.listen(PORT, () => {
  console.log('Started on Port', PORT);
});

module.exports = {
  app
};
