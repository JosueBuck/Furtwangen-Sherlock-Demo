const express = require("express");
const bodyParser = require("body-parser");

var cors = require("cors");
const functions = require("./functions");
const db = require("./database/database");

const app = express();
const port = 3000;

app.use(cors({ origin: "http://127.0.0.1:5500" }));
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
  GET Collection Schema
*/
app.post("/getSpecificData/:collectionName", async (req, res) => {
  const collectionName = req.params.collectionName;
  const body = req.body;
  console.log(collectionName);
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;

  const specificData = await functions.getSpecificData(accessToken, collectionName, body);

  res.send(specificData);
});

/* 

  Database 

*/

/* 
  GET All Bikes
*/
app.get("/getAllBikes", async (req, res) => {
  const bikes = await db.getAllDataFromTable("Fahrrad");
  res.send(bikes);
});

/* 
  GET All Contracts
*/
app.get("/getAllContracts", async (req, res) => {
  const bikes = await db.getAllDataFromTable("Auftrag");
  res.send(bikes);
});

/* 
  GET All Customers
*/
app.get("/getAllCustomers", async (req, res) => {
  const bikes = await db.getAllDataFromTable("Kunde");
  res.send(bikes);
});
