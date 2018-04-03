const expect = require("expect");
const request = require("supertest");

const { app } = require("../server");
const { Todo } = require("../models/Todo");
const { ObjectID } = require("mongodb");

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

const TIME_OUT = 0;
//remove before each done method
beforeEach(done => {
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
});

//TO regroup tests (same categorie)
describe("POST /todos", () => {
  //this.timeout(10000);
  it("should create a new todo", done => {
    //init the time out
    setTimeout(done, TIME_OUT);

    const text = "Test";

    //request from supertest : library for testing express app (handle test requesting to express application)
    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        //expect is simple library to do custom testing
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err);
        //get all todos to check if the todo is realy stored
        Todo.find({ text })
          .then(todos => {
            //expecting that we added just one // NOTE: GOTO beforeEach if your already add data (init db to Collection)
            expect(todos.length).toBe(1);
            //re-check the value
            expect(todos[0].text).toBe(text);
            //call done method to out the result
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should not create a todo with invalid body request", done => {
    setTimeout(done, TIME_OUT);
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find()
          .then(todos => {
            //expecting that we added just one // NOTE: GOTO beforeEach if your already add data (init db to Collection)
            expect(todos.length).toBe(2);
            //call done method to out the result
            done();
          })
          .catch(err => done(err));
      });
  });
});
describe("GET /todos", () => {
  it("should get all todos list", done => {
    setTimeout(done, TIME_OUT);
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should get todo item by valid id", done => {
    setTimeout(done, TIME_OUT);
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should not get not found todo item", done => {
    setTimeout(done, TIME_OUT);
    const id = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it("should not get todo item by invalid id", done => {
    //setTimeout(done, TIME_OUT);
    const id = "5ac24acd7d636a3bf493f2b2zefzef";
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should delete todo item by valid id", done => {
    setTimeout(done, TIME_OUT);
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(todos[0]._id.toHexString())
          .then(todo => {
            //expecting that we added just one // NOTE: GOTO beforeEach if your already add data (init db to Collection)
            expect(todo).toNotExist();
            //call done method to out the result
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should not delete not found todo item", done => {
    setTimeout(done, TIME_OUT);
    const id = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it("should not delete todo item by invalid id", done => {
    //setTimeout(done, TIME_OUT);
    const id = "5ac24acd7d636a3bf493f2b2zefzef";
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
});
