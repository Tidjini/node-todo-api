const mongoose = require("mongoose");

let mongo_uri;
if (process.env.PRODUCTION !== "PROD") {
  mongo_uri = require("../../config/keys").mongoURL;
} else {
  mongo_uri = process.env.MONGODB_URI;
}
//const mongoURL = "mongodb://tidjini:pass@ds213759.mlab.com:13759/node-todo-api";

mongoose.Promise = global.Promise;

mongoose.connect(mongo_uri);

module.exports = {
  mongoose
};
