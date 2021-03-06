const express = require("express");
const bodyParser = require("body-parser");

var cors = require("cors");
const functions = require("./functions");
const db = require("./database/database");

const app = express();
const port = 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port, async () => {
  console.log(`Server is listening on port ${port}`);
});

/* 

  Sherlock

*/

/* 
  GET Barear Tokens
*/
app.get("/getTokens", async (req, res) => {
  const tokens = await functions.getTokens();
  res.send(tokens);
});

/* 
  GET Available Collections
*/
app.get("/getAvailableCollections", async (req, res) => {
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;

  const availableCollections = await functions.getAvailableCollections(
    accessToken
  );

  res.send(availableCollections);
});

/* 
  GET Collection Schema
*/
app.get("/getCollectionSchema/:collectionName", async (req, res) => {
  const collectionName = req.params.collectionName;

  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;

  const collectionSchema = await functions.getCollectionSchema(
    accessToken,
    collectionName
  );

  res.send(collectionSchema);
});

/* 
  POST Get Specific Data (fully customizable -> requires data in body!)
*/
app.post("/getSpecificData/:collectionName", async (req, res) => {
  const collectionName = req.params.collectionName;
  const body = req.body;
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;

  const specificData = await functions.getSpecificData(
    accessToken,
    collectionName,
    body
  );

  res.send(specificData);
});

/* 
  GET all bikes
*/
app.get("/getAllBikesFromSherlock", async (req, res) => {
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;
  const response = await functions.getAllBikesFromSherlock(accessToken);
  res.send(response);
})

/* 
  GET bike by id
*/
app.get("/getBikeByIdFromSherlock/:id", async (req, res) => {
  const id = req.params.id;
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;
  const response = await functions.getBikeByIdFromSherlock(accessToken, id);
  res.send(response);
})

/* 
  GET all contracts of a specific customer
*/
app.get("/getAllCustomerContractsFromSherlock/:id", async (req, res) => {
  const id = req.params.id;
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;
  const response = await functions.getAllCustomerContracts(accessToken, id);
  res.send(response);
})


/* 
  GET contract by id
*/
app.get("/getContractByIdFromSherlock/:id", async (req, res) => {
  const id = req.params.id;
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;
  const response = await functions.getContractById(accessToken, id);
  res.send(response);
})

/* 
  POST upload contract to Sherlock
*/
app.post("/addContractToSherlock", async (req, res) => {
  const body = req.body;
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;
  const response = await functions.addContractToSherlock(accessToken, body);
  res.send(response);
})

/* 
  Add Database User to Sherlock
*/
app.post("/addUserToSherlock", async (req, res) => {
  const body = req.body;
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;
  const response = await functions.addUserToSherlock(accessToken, body);
  res.send("Done");
})

/* GET all Users from Sherlock */
app.get("/getAllCustomersFromSherlock", async (req, res) => {
  const tokens = await functions.getTokens();
  const access_token = tokens.access_token;
  const response = await functions.getAllUsers(access_token);
  res.send(response);
})

/* GET all Users from Sherlock */
app.get("/getCustomerByIdFromSherlock/:id", async (req, res) => {
  const id = req.params.id;
  const tokens = await functions.getTokens();
  const access_token = tokens.access_token;
  const response = await functions.getUserById(access_token, id);
  res.send(response);
})

/* 
  DELETE User from Sherlock
*/
app.delete("/deleteUserFromSherlock/:id", async (req, res) => {
  const id = req.params.id;
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;
  const response = await functions.deleteUserFromSherlock(accessToken, id);
  res.send(response);
})


/* 

  Database 

*/

/* 
  GET All Bikes
*/
app.get("/getAllBikes", async (req, res) => {
  const response = await db.getAllDataFromTable("Fahrrad");
  res.send(response);
});

/* 
  GET Bike Filter Options
*/
app.get("/getBikeFilterOptions", async (req, res) => {
  const response = await db.getBikeFilterOptions();
  res.send(response);
});

/* 
  GET Bike By ID
*/
app.get("/getBikeById/:id", async (req, res) => {
  const bikeId = req.params.id;
  const response = await db.getBikeById(bikeId);
  res.send(response);
});

/* 
  POST get Bikes By Filter Options
*/
app.post("/getBikesByFilterOptions", async (req, res) => {
  const body = req.body;
  const response = await db.getBikesByFilterOptions(body);
  res.send(response);
});

/* 
  POST Update Bike Status 
*/
app.post("/updateBikeStatus/:id", async (req, res) => {
  const bikeId = req.params.id;
  const status = req.query.status;
  const response = await db.updateBikeStatus(bikeId, status);
  res.send(`Bike status was changed to ${status}`);
});

/* 
  POST Create New Bike 
*/
app.post("/createNewBike", async (req, res) => {
  const body = req.body;
  const response = await db.createNewBike(body);
  res.send(response);
});

/* 
  DELETE Bike 
*/
app.delete("/deleteBike/:id", async (req, res) => {
  const id = req.params.id;
  const response = await db.deleteBike(id);
  res.send(response);
});

/* 
  GET All Contracts
*/
app.get("/getAllContracts", async (req, res) => {
  const response = await db.getAllDataFromTable("Auftrag");
  res.send(response);
});

/* 
  POST New Contract
*/
app.post("/createNewContract", async (req, res) => {
  const body = req.body;
  const response = await db.createNewContract(body);
  res.send(response);
});

/* 
  DELETE All Customers Contracts
*/
app.delete("/deleteCustomerContracts/:id", async (req, res) => {
  const id = req.params.id;
  const response = await db.deleteCustomerContracts(id);
  res.send(response);
});

/* 
  GET All Customers
*/
app.get("/getAllCustomers", async (req, res) => {
  const response = await db.getAllDataFromTable("Kunde");
  res.send(response);
});

/* 
  POST Create New Customer
*/
app.post("/createNewCustomer", async (req, res) => {
  const body = req.body;
  
  let response = await db.createNewCustomer(body);
  if (response == 200) {
    response = "Customer was created + uploaded to Sherlock"
  }
  
  res.send(response);
});

/* 
  DELETE Customer
*/
app.delete("/deleteCustomer/:id", async (req, res) => {
  const id = req.params.id;
  const response = await db.deleteCustomer(id);
  res.send(response);
});

/*
  LogIn
*/ 

app.post("/logIn", async (req, res) => {
  const body = req.body;
  const response = await db.logIn(body._userID, body.lastName);
  // console.log(response);
  res.send(response);
});

/*
  getCustomer
*/

app.get("/getCustomer/:id", async (req, res) => {
  const id = req.params.id;
  const response = await db.getCustomer(id);
  res.send(response);
});
