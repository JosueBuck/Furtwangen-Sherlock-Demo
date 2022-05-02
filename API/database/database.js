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

async function getBikeFilterOptions() {
  let connection;
  try {
    connection = await pool.getConnection();
    const brands = await connection.query(`SELECT distinct Marke FROM Fahrrad`);
    const categories = await connection.query(
      `SELECT distinct Kategorie FROM Fahrrad`
    );
    const colors = await connection.query(`SELECT distinct Farbe FROM Fahrrad`);
    const filterOptions = {
      brands,
      categories,
      colors,
    };
    return filterOptions;
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getBikeById(_id) {
  let connection;
  try {
    connection = await pool.getConnection();
    const bike = await connection.query(
      `SELECT * FROM Fahrrad WHERE Fahrrad_ID='${_id}'`
    );
    return bike;
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getBikesByFilterOptions(_filterOptions) {
  let connection;
  try {
    connection = await pool.getConnection();
    let brands = getWhereFilter(_filterOptions.brands);
    let categories = getWhereFilter(_filterOptions.categories);
    let colors = getWhereFilter(_filterOptions.colors);
    let sql = createFilterOptionSQL(brands, categories, colors)
    const bike = await connection.query(
      sql
    );
    return bike;
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
function createFilterOptionSQL(brands, categories, colors) {
  let sql = `SELECT * FROM Fahrrad `;
  let filterOptionWasAdded = false;

  if (brands != "") {
    sql += `WHERE Marke IN (${brands})`;
    filterOptionWasAdded = true;
  }
  if (categories != "") {
    if(filterOptionWasAdded) {
      sql += " AND "
    } else {
      sql += "WHERE "
    }
    filterOptionWasAdded = true;
    sql += `Kategorie IN (${categories})`;
  }
  if (colors != "") {
    if(filterOptionWasAdded) {
      sql += " AND "
    } else {
      sql += "WHERE "
    }
    sql += `Farbe IN (${colors})`;
  }

  return sql;
}

function getWhereFilter(_filterOptionArray) {
  let filterOption = "";
  for (let i = 0; i < _filterOptionArray.length; i++) {
    filterOption += `'${_filterOptionArray[i]}'`;
    if (i+1 != _filterOptionArray.length) {
      filterOption += ",";
    }
  }
  return filterOption;
}

module.exports = {
  getAllDataFromTable,
  getBikeFilterOptions,
  getBikeById,
  getBikesByFilterOptions
};
