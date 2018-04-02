const { MongoClient } = require("mongodb");
const { mongoURL } = require("../config/keys");

//const mongoURL = "mongodb://tidjini:pass@ds213759.mlab.com:13759/node-todo-api";

MongoClient.connect(mongoURL, (err, db) => {
  if (err) return console.log("Unable to connect to the database server api");

  console.log("Connect with success :-)");

  db.collection("Todos").insertOne(
    {
      text: "Something todo",
      complited: false
    },
    (err, result) => {
      if (err) return console.log("Unable to store to database");
      console.log(result);
    }
  );

  db.close();
});
