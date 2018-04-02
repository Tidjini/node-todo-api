const expect = require("expect");
const request = require("supertest");

const { app } = require("../server");
const { Todo } = require("../models/Todo");

//TO regroup tests (same categorie)
describe("POST /todos", () => {
  //this.timeout(10000);

  //remove before each done method
  beforeEach(done => {
    //init the time out
    //this.timeout(10000);
    setTimeout(done, 0);

    Todo.remove({}).then(() => {
      done();
    });
  });
  it("should create a new todo", done => {
    //init the time out
    setTimeout(done, 0);

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
        Todo.find()
          .then(todos => {
            //expecting that we added just one // NOTE: GOTO beforeEach if your already add data (init db to Collection)
            expect(todos.length).toBe(1);
            //re-check the value
            expect(todos[0].text).toBe(text);
            //call done method to out the result
            done();
          })
          .catch(err => done(e));
      });
  });

  it("should not create a todo with invalid body request", done => {
    setTimeout(done, 0);
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find()
          .then(todos => {
            //expecting that we added just one // NOTE: GOTO beforeEach if your already add data (init db to Collection)
            expect(todos.length).toBe(0);

            //call done method to out the result
            done();
          })
          .catch(err => done(e));
      });
  });
});
