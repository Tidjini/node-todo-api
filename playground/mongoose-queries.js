const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/Todo');
const { User } = require('../server/models/User');

//to check our get by id reuest
const id = '5ac24acd7d636a3bf493f2b2';

User.findById(id)
  .then(user => {
    if (user == null) return console.log('user id not found');
    console.log('User', user);
  })
  .catch(e => log);
