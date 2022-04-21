const express = require("express");
var cors = require('cors');
var functions = require("./functions");

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://127.0.0.1:5500'
}));

app.listen(port, async () => {
  console.log(`Server is listening on port ${port}`);
});

app.get("/getTokens", async (req, res) => {
  const tokens = await functions.getTokens();
  res.send(tokens);
});

app.get("/getAvailableCollections", async (req, res) => {
  const tokens = await functions.getTokens();
  const accessToken = tokens.access_token;

  const availableCollections = await functions.getAvailableCollections(
    accessToken
  );

  res.send(availableCollections);
});

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