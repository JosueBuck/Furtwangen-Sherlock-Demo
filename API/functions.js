const axios = require("axios").default;
require("dotenv").config();
const qs = require("qs");

/* API Values */
const DEMO_NAME = "furtwangen";
const FAHRRAD_VERLEIH = "Fahrrad_Verleih";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BASIC_URL = `https://${DEMO_NAME}.sherlock-cloud.de`;

/* 
  <<Body Handler>>

  Axios converts everything for the body to json automatically.
  This functions allows to change the format of the body.
*/
function handleBody(_data, _isUrlEncoded) {
  if (_isUrlEncoded) {
    return qs.stringify(_data);
  } else {
    return _data;
  }
}

async function useApi(_method, _url, _headers, _data, _isUrlEncoded) {
  const response = await axios({
    method: _method,
    headers: _headers,
    url: `${BASIC_URL}${_url}`,
    data: handleBody(_data, _isUrlEncoded),
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
        console.log("Error", error.message);
      }
    });

  return response;
}

async function getTokens() {
  const headers = { "content-type": "application/x-www-form-urlencoded" };

  const data = {
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  const url = "/auth/realms/Sherlock/protocol/openid-connect/token";

  const tokens = await useApi("post", url, headers, data, true);
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

async function getSpecificData(_accessToken, _collectionName, _body) {
  const headers = {
    Authorization: `Bearer ${_accessToken}`,
    "content-type": "application/json",
  };

  const data = _body;

  const url = `/def-api/search/${_collectionName}`;

  const specificData = await useApi("post", url, headers, data);
  return specificData;
}

async function getAllCustomerContracts(_accessToken, _id) {
  const headers = {
    Authorization: `Bearer ${_accessToken}`,
    "content-type": "application/json",
  };
  const data = {
    __comment: "Search all contracts with specific cusomter id",
    page: 0,
    pageSize: 100,
    query: "",
    systems: ["Fahrrad_Verleih"],
    types: ["Auftrag"],
    filter: {
      logic: "and",
      filters: [
        {
          field: "KundeID",
          operator: "eq",
          value: _id,
        },
      ],
    },
  };
  const url = `/def-api/search/Fahrrad_Verleih`;

  const contracts = await useApi("post", url, headers, data);
  return contracts;
}

module.exports = {
  getTokens,
  getAvailableCollections,
  getCollectionSchema,
  getSpecificData,
  getAllCustomerContracts,
};
