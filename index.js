const loadDatabase = require("./lib");

loadDatabase({ user: "postgres", port: 5435, password: "postgres" }).then(
  (x) => {
    console.log(x);
  }
);

module.exports = loadDatabase;
