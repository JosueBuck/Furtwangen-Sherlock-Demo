const mariadb = require("mariadb");
const mysql = require("mysql");

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_USER,
  connectionLimit: 5,
});


async function getAllDataFromTable(_tableName) {
  let connection;
  try {
    connection = await pool.getConnection();
    const data = await connection.query(`SELECT * FROM ${_tableName}`);
    return data;
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}



module.exports = {
  getAllDataFromTable
};
