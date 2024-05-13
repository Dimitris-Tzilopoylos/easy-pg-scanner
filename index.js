const loadDatabase = require("./lib");

loadDatabase({
  port: 5435,
  user: "postgres",
  host: "localhost",
  password: "postgres",
  database: "postgres",
}).then((res) => {
  console.log(res);
});
