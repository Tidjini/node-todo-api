const expect = require("expect");
const request = require("supertest");

const { app } = require("../server");
const { Todo } = require("../models/Todo");
const { User } = require("../models/User");
const { ObjectID } = require("mongodb");
const {
  todos,
  TIME_OUT,
  populateTodos,
  users,
  populateUsers
} = require("./seed/seed");

beforeEach(populateUsers);

beforeEach(populateTodos);

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

describe("PATCH /todos/:id", () => {
  //this.timeout(10000);
  it("should update a todo", done => {
    //init the time out
    //
    setTimeout(done, TIME_OUT);
    const todo = {
      text: "text updated (item 1)",
      complited: true
    };
    //request from supertest : library for testing express app (handle test requesting to express application)
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send(todo)
      .expect(200)
      .expect(res => {
        //expect is simple library to do custom testing
        expect(res.body.text).toBe(todo.text);
        expect(res.body.complited).toBe(true);
        expect(res.body.complitedAt).toBeA("number");
      })
      .end(done);
  });

  it("should clear complitedAt when todo  is not completed", done => {
    setTimeout(done, TIME_OUT);
    const todo = {
      text: "text updated (item 2)",
      complited: false
    };
    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .send(todo)
      .expect(200)
      .expect(res => {
        //expect is simple library to do custom testing
        expect(res.body.text).toBe(todo.text);
        expect(res.body.complited).toBe(false);
        expect(res.body.complitedAt).toNotExist();
      })
      .end(done);
  });
});

describe("POST /users", () => {
  it("it should create a user", done => {
    //request from supertest : library for testing express app (handle test requesting to express application)
    const newUser = { email: "tijim@mail.com", password: "561651azef" };
    request(app)
      .post("/users")
      .send(newUser)
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(user.email);
      })
      .end((err, res) => {
        if (err) return done(err);
        User.findOne({ email: user.email })
          .then(user => {
            expect(user).toExist();
            expect(user.password).toNotBe(newUser.password);
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should return validation errors", done => {
    //request from supertest : library for testing express app (handle test requesting to express application)
    const user = { email: "tiji  mail.com", password: "561651azef" };
    request(app)
      .post("/users")
      .send(user)
      .expect(400)
      .end(done);
  });

  it("should not create user cause email is used", done => {
    //request from supertest : library for testing express app (handle test requesting to express application)
    //const user = { email: "tiji  mail.com", password: "561651azef" };
    request(app)
      .post("/users")
      .send({ email: users[0].email, password: "5614azaz" })
      .expect(400)
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("Should get back user {_id, email} with givin token (in header)", done => {
    setTimeout(done, TIME_OUT);
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token) //set the header
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("Should get 401 if not authenticated", done => {
    setTimeout(done, TIME_OUT);
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqaul({});
      })
      .end(done);
  });
});
