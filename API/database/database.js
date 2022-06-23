const mariadb = require("mariadb");
const mysql = require("mysql");
const functions = require("../functions"); 

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_USER,
  connectionLimit: 5,
});

/* 
  Basic
*/

async function getAllDataFromTable(_tableName) {
  let connection;
  try {
    connection = await pool.getConnection();
    const data = await connection.query(`SELECT * FROM ${_tableName}`);
    return data;
  } catch (error) {
    return error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/* 

  Bikes

*/

async function getBikeFilterOptions() {
  let connection;
  try {
    connection = await pool.getConnection();
    const brands = await connection.query(`SELECT distinct Marke FROM Fahrrad`);
    const categories = await connection.query(
      `SELECT distinct Kategorie FROM Fahrrad`
    );
    const colors = await connection.query(`SELECT distinct Farbe FROM Fahrrad`);
    const status = [{ status: 0 }, { status: 1 }, { status: 2 }];
    const filterOptions = {
      brands,
      categories,
      colors,
      status,
    };
    return filterOptions;
  } catch (error) {
    return error;
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
    return error;
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
    let status = getWhereFilter(_filterOptions.status);
    let sql = createFilterOptionSQL(brands, categories, colors, status);
    const bike = await connection.query(sql);
    return bike;
  } catch (error) {
    return error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
function createFilterOptionSQL(brands, categories, colors, status) {
  let sql = `SELECT * FROM Fahrrad`;
  let filterOptionWasAdded = false;

  if (brands != "") {
    sql += ` WHERE Marke IN (${brands})`;
    filterOptionWasAdded = true;
  }
  if (categories != "") {
    if (filterOptionWasAdded) {
      sql += " AND ";
    } else {
      sql += " WHERE ";
    }
    filterOptionWasAdded = true;
    sql += `Kategorie IN (${categories})`;
  }
  if (colors != "") {
    if (filterOptionWasAdded) {
      sql += " AND ";
    } else {
      sql += " WHERE ";
    }
    filterOptionWasAdded = true;
    sql += `Farbe IN (${colors})`;
  }
  if (status != "") {
    if (filterOptionWasAdded) {
      sql += " AND ";
    } else {
      sql += " WHERE ";
    }
    filterOptionWasAdded = true;
    sql += `Zustand IN (${status})`;
  }

  return sql;
}

function getWhereFilter(_filterOptionArray) {
  let filterOption = "";
  for (let i = 0; i < _filterOptionArray?.length; i++) {
    filterOption += `'${_filterOptionArray[i]}'`;
    if (i + 1 != _filterOptionArray.length) {
      filterOption += ",";
    }
  }
  return filterOption;
}

async function updateBikeStatus(_id, _status) {
  let connection;
  try {
    connection = await pool.getConnection();
    let response = await connection.query(
      `UPDATE Fahrrad SET Zustand='${_status}' WHERE Fahrrad_ID='${_id}'`
    );
    return response;
  } catch (error) {
    return error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function createNewBike(_bike) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let response = await connection.query(
      `INSERT INTO Fahrrad (Fahrrad_ID, Marke, Kategorie, Farbe, Zustand, Akku, Location, Foto) VALUES ('${_bike.bike_ID}', '${_bike.brand}', '${_bike.category}', '${_bike.color}', '${_bike.status}', ${_bike.battery}, '${_bike.location}', '${_bike.photo}')`
    );
    const tokens = await functions.getTokens();
    const accessToken = tokens.access_token;
    await functions.addBikeToSherlock(accessToken, _bike)
    await connection.commit();
    return 200;
  } catch (error) {
    connection.rollback();
    return error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function deleteBike(_id) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let response = await connection.query(
      `DELETE FROM Fahrrad WHERE Fahrrad_ID='${_id}'`
    );
    const tokens = await functions.getTokens();
    const accessToken = tokens.access_token;
    await functions.deleteBikeFromSherlock(accessToken, _id)
    await connection.commit();
    return 200;
  } catch (error) {
    console.log(error)
    connection.rollback();
    return error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/* 

  Contract

*/

async function createNewContract(_contractInfo) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let response = await connection.query(
      `INSERT INTO Auftrag (Auftrag_ID, Name_Kunde, Kunde_ID, Fahrrad_ID, Datum_von, Datum_bis) VALUES ('${_contractInfo.contract_ID}', '${_contractInfo.name_customer}', '${_contractInfo.customer_ID}', '${_contractInfo.bike_ID}', '${_contractInfo.date_1}', '${_contractInfo.date_2}')`
    );
    const tokens = await functions.getTokens();
    const accessToken = tokens.access_token;
    await functions.addContractToSherlock(accessToken, _contractInfo)
    await connection.commit();
    return 200;
  } catch (error) {
    connection.rollback();
    return error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function deleteCustomerContracts(_id) {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();
    let response = await connection.query(
      `DELETE FROM Auftrag WHERE Auftrag_ID='${_id}'`
    );
    if (response.affectedRows == 0) {
      response = "No contracts where found!";
    } else {
      response = "Contract was deleted!";
    }
    const tokens = await functions.getTokens();
    const accessToken = tokens.access_token;
    const sherlockResponse = await functions.deleteContractFromSherlock(accessToken, _id);
    if (sherlockResponse >= 400 || sherlockResponse == undefined) {
      throw Error("Error while uploading data to sherlock");
    }
    connection.commit();
    return response;
  } catch (error) {
    console.log("error: ", error);
    connection.rollback();
    return error.message;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/* 

  Customer

*/

async function createNewCustomer(_customerInfo) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let response = await connection.query(
      `INSERT INTO Kunde (Kunde_ID, Nachname, Vorname, Anschrift, Mail, Phone, Geburtsdatum, Geschlecht) VALUES ('${_customerInfo.customer_ID}', '${_customerInfo.lastname}', '${_customerInfo.firstname}', '${_customerInfo.address}', '${_customerInfo.mail}', ${_customerInfo.phone}, '${_customerInfo.birthday}', '${_customerInfo.sex}')`
    );
    const tokens = await functions.getTokens();
    const accessToken = tokens.access_token;
    await functions.addUserToSherlock(accessToken, _customerInfo);
    await connection.commit();
    return 200;
  } catch (error) {
    connection.rollback();
    return error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function deleteCustomer(_id) {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();
    let response = await connection.query(
      `DELETE FROM Kunde WHERE Kunde_ID='${_id}'`
    );
    await deleteCustomerContracts(_id);
    const tokens = await functions.getTokens();
    const accessToken = tokens.access_token;
    const sherlockResponse = await functions.deleteUserFromSherlock(accessToken, _id);
    if (sherlockResponse >= 400 || sherlockResponse == undefined) {
      throw Error("Error while uploading data to sherlock");
    }
    connection.commit();
    return "Customer was deleted!";
  } catch (error) {
    connection.rollback();
    return error.message;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}



/*
  GetCustomer
*/ 

async function getCustomer(_id) {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.beginTransaction();
    let usersArray = await connection.query(
      `SELECT * FROM Kunde WHERE Kunde_ID='${_id}'`
    );
    if(usersArray.length > 0){
      firstUser = usersArray[0];
      return firstUser;
    }else{
      return false;
    }
  } catch (error) {
    connection.rollback();
    return error.message;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/*
  LogIn
*/ 
async function logIn(_userID, lastName){
  let connection;
  try {
    connection = await pool.getConnection();
    const usersArray = await connection.query(
      `SELECT * FROM Kunde WHERE Kunde_ID='${_userID}'`
    );

    if(usersArray.length > 0){
      firstUser = usersArray[0];
      return firstUser.Nachname == lastName;
    }else{
      return false;
    }
  } catch (error) {
    return error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  getAllDataFromTable,
  getBikeFilterOptions,
  getBikeById,
  getBikesByFilterOptions,
  updateBikeStatus,
  createNewBike,
  deleteBike,
  createNewContract,
  deleteCustomerContracts,
  createNewCustomer,
  deleteCustomer,
  logIn,
  getCustomer,
};
