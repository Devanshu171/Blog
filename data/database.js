// using pckage mysql2

const mysql = require("mysql2/promise");

// creates pool of connection i.e alot of req is reaching
// needs a object as paramete
const pool = mysql.createPool({
  // need url of server here we are using local machine so
  // it it localhost
  host: "localhost",
  // name of database in that server
  database: "blog",
  // user and password  of defaul user that we set
  user: "root",
  password: "dev123",
});

// sending pool to others file
module.exports = pool;
