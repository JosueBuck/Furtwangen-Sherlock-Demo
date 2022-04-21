const axios = require("axios").default;
require('dotenv').config()
const qs = require("qs");

/* API Values */
const DEMO_NAME = "furtwangen";
const FAHRRAD_VERLEIH = "Fahrrad_Verleih";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BASIC_URL = `https://${DEMO_NAME}.sherlock-cloud.de`;

async function getTokens() {
  const headers = { "content-type": "application/x-www-form-urlencoded" };

  const data = {
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  const url = "/auth/realms/Sherlock/protocol/openid-connect/token";

  const tokens = await useApi("post", url, headers, data);
  return tokens;
}

async function getAvailableCollections(_accessToken) {
  const headers = { Authorization: `Bearer ${_accessToken}` };

  const data = {};

  const url = "/def-api/search/available-collections";

  const availableCollections = await useApi("get", url, headers, data);
  return availableCollections;
}

async function getCollectionSchema(_accessToken, _collectionName) {
  const headers = { Authorization: `Bearer ${_accessToken}` };

  const data = {};

  const url = `/def-api/search/${_collectionName}/schema`;

  const availableCollections = await useApi("get", url, headers, data);
  return availableCollections;
}

async function useApi(_method, _url, _headers, _data) {
  const response = await axios({
    method: _method,
    headers: _headers,
    url: `${BASIC_URL}${_url}`,
    data: qs.stringify(_data),
  })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
    });

  return response;
}

module.exports = {
  getTokens,
  getAvailableCollections,
  getCollectionSchema
};
