const env = process.env.NODE_ENV || "development";

if (env == "development") {
  console.log("-dev-");
  process.env.PORT = 5000;
  process.env.MONGODB_URI = require("./keys").mongoURL;
} else if (env == "test") {
  console.log("-test-");

  process.env.PORT = 5000;
  process.env.MONGODB_URI = require("./keys").mongoURL;
}
