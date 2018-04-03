const mongoose = require("mongoose");
const { mongoURL } = require("../../config/keys");
//const mongoURL = "mongodb://tidjini:pass@ds213759.mlab.com:13759/node-todo-api";

mongoose.Promise = global.Promise;

const mongo_uri = process.env.MONGODB_URI || mongoURL;

mongoose.connect(mongo_uri);

module.exports = {
  mongoose
};
