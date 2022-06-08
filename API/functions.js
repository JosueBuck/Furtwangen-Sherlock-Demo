const axios = require("axios").default;
require("dotenv").config();
const qs = require("qs");
var FormData = require("form-data");
var fs = require("fs");

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
      //console.log(response);
      return response;
    })
    .catch(function (error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        return error;
      } else if (error.request) {
        console.log(error.request);
        return error;
      } else {
        console.log("Error", error.message);
        return error;
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
  return tokens.data;
}

async function getAvailableCollections(_accessToken) {
  const headers = { Authorization: `Bearer ${_accessToken}` };
  const data = {};
  const url = "/def-api/search/available-collections";
  const availableCollections = await useApi("get", url, headers, data);
  console.log(availableCollections.data);
  return availableCollections.data;
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

async function getAllBikesFromSherlock(_accessToken) {
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
    types: ["Fahrrad"]
  };
  const url = `/def-api/search/Fahrrad_Verleih`;
  const contracts = await useApi("post", url, headers, data);
  return contracts.data.results;
}

async function getBikeByIdFromSherlock(_accessToken, _id) {
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
    types: ["Fahrrad"],
    filter: {
      logic: "and",
      filters: [
        {
          field: "FahrradID",
          operator: "eq",
          value: _id,
        },
      ],
    },
  };
  const url = `/def-api/search/Fahrrad_Verleih`;
  const contracts = await useApi("post", url, headers, data);
  return contracts.data.results;
}

async function addBikeToSherlock(_accessToken, _bike) {
  const date = "----" + getCurrentDate();
  const url = "/def-api/import/datapackages";
  const headers = {
    Authorization: `Bearer ${_accessToken}`,
    "Content-type": `multipart/form-data; boundary=${date}`,
  };
  const crlf = "\r\n";
  const system = "Fahrrad_Verleih";
  const type = "Fahrrad";
  const meta = `"Marke":{ "type":"string", "value":"${_bike.brand}"}, "Farbe":{ "type":"string", "value":"${_bike.color}"}, "Kategorie":{ "type":"string", "value":"${_bike.category}" }, "FahrradID":{ "type":"string", "value":"${_bike.bike_ID}" }, "Zustand":{ "type":"string", "value":"${_bike.status}" }, "Akku":{ "type":"string", "value":"${_bike.battery}" }, "Location":{ "type":"string", "value":"${_bike.location}" }, "Foto":{ "type":"string", "value":"${_bike.photo}" }`;
  const data_string =
    crlf +
    "--" +
    date +
    crlf +
    'Content-Disposition: form-data; name="content"' +
    crlf +
    "" +
    crlf +
    "{" +
    crlf +
    '  "system": "' +
    system +
    '",' +
    crlf +
    '  "type": "' +
    type +
    '",' +
    crlf +
    '  "referenceId": "' +
    `${_bike.bike_ID}` +
    '",' +
    crlf +
    '  "binarycontents": [' +
    crlf +
    "    {" +
    crlf +
    '      "path": "metadata+json",' +
    crlf +
    '      "contentType": "*META*",' +
    crlf +
    '      "mimeType": "application/json"' +
    crlf +
    "    }" +
    crlf +
    "  ]" +
    crlf +
    "}" +
    crlf +
    "" +
    crlf +
    "--" +
    date +
    crlf +
    'Content-Disposition: form-data; name="files"; filename="Metadata.json"' +
    crlf +
    "" +
    crlf +
    "{" +
    crlf +
    meta +
    crlf +
    "}" +
    crlf +
    "" +
    crlf +
    "--" +
    date +
    "--" +
    crlf;

  const response = await useApi("post", url, headers, data_string);
  return response.status;
}

async function deleteBikeFromSherlock(_accessToken, _id) {
  var data = new FormData();
  data.append(
    "content",
    `{\n\t"system": "Fahrrad_Verleih",\n\t"type": "Fahrrad",\n\t"referenceId": "${_id}",\n\t"binarycontents": [\n\t\t{\n\t\t\t"path": "metadata.json",\n\t\t\t"contentType": "*META*",\n\t\t\t"mimeType": "application/json"\n\t\t}\n\t]\n}`
  );
  data.append("content", "{\n}");

  var config = {
    method: 'post',
    url: `https://${DEMO_NAME}.sherlock-cloud.de/def-api/import/datapackages`,
    headers: { 
      'Authorization': `Bearer ${_accessToken}`, 
      ...data.getHeaders()
    },
    data : data
  };
  
  const response = await axios(config)
  .then(function (response) {
    console.log(response);
    console.log(response.status);
    return response.status;
  })
  /* .catch(function (error) {
    console.log(error);
  }); */

  return response;
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
  return contracts.data.results;
}

async function getContractById(_accessToken, _id) {
  const headers = {
    Authorization: `Bearer ${_accessToken}`
  };
  const data = {
    __comment: "Search contract by id",
    page: 0,
    pageSize: 100,
    query: "",
    systems: ["Fahrrad_Verleih"],
    types: ["Auftrag"],
    filter: {
      logic: "and",
      filters: [
        {
          field: "Auftragsnummer",
          operator: "eq",
          value: _id,
        },
      ],
    },
  };
  const url = `/def-api/search/Fahrrad_Verleih`;
  const contracts = await useApi("post", url, headers, data);
  console.log(contracts);
  return contracts.data.results;
}

async function addContractToSherlock(_accessToken, _contract) {
  const date = "----" + getCurrentDate();
  const url = "/def-api/import/datapackages";
  const headers = {
    Authorization: `Bearer ${_accessToken}`,
    "Content-type": `multipart/form-data; boundary=${date}`,
  };
  const crlf = "\r\n";
  const system = "Fahrrad_Verleih";
  const type = "Auftrag";
  const meta = `"Auftragsnummer":{ "type":"string", "value":"${_contract.contract_ID}"}, "Name Kunde":{ "type":"string", "value":"${_contract.name_customer}"}, "KundeID":{ "type":"string", "value":"${_contract.customer_ID}" }, "Fahrrad_ID":{ "type":"string", "value":"${_contract.bike_ID}" }, "Datum_von":{ "type":"string", "value":"${_contract.date_1}" }, "Datum_bis":{ "type":"string", "value":"${_contract.date_2}" }`;
  const data_string =
    crlf +
    "--" +
    date +
    crlf +
    'Content-Disposition: form-data; name="content"' +
    crlf +
    "" +
    crlf +
    "{" +
    crlf +
    '  "system": "' +
    system +
    '",' +
    crlf +
    '  "type": "' +
    type +
    '",' +
    crlf +
    '  "referenceId": "' +
    `${_contract.contract_ID}` +
    '",' +
    crlf +
    '  "binarycontents": [' +
    crlf +
    "    {" +
    crlf +
    '      "path": "metadata+json",' +
    crlf +
    '      "contentType": "*META*",' +
    crlf +
    '      "mimeType": "application/json"' +
    crlf +
    "    }" +
    crlf +
    "  ]" +
    crlf +
    "}" +
    crlf +
    "" +
    crlf +
    "--" +
    date +
    crlf +
    'Content-Disposition: form-data; name="files"; filename="Metadata.json"' +
    crlf +
    "" +
    crlf +
    "{" +
    crlf +
    meta +
    crlf +
    "}" +
    crlf +
    "" +
    crlf +
    "--" +
    date +
    "--" +
    crlf;

  const response = await useApi("post", url, headers, data_string);
  return response.status;
}

async function deleteContractFromSherlock(_accessToken, _id) {
  const date = "----" + getCurrentDate();
  const headers = {
    Authorization: `Bearer ${_accessToken}`,
    "Content-type": `multipart/form-data; boundary=${date}`,
  };
  const url = `/def-api/import/datapackages`;

  var data = new FormData();
  data.append(
    "content",
    `{\n\t"system": "Fahrrad_Verleih",\n\t"type": "Auftrag",\n\t"referenceId": "${_id}",\n\t"binarycontents": [\n\t\t{\n\t\t\t"path": "metadata.json",\n\t\t\t"contentType": "*META*",\n\t\t\t"mimeType": "application/json"\n\t\t}\n\t]\n}`
  );
  data.append("content", "{\n}");

  var config = {
    method: 'post',
    url: `https://${DEMO_NAME}.sherlock-cloud.de/def-api/import/datapackages`,
    headers: { 
      'Authorization': `Bearer ${_accessToken}`, 
      ...data.getHeaders()
    },
    data : data
  };
  
  const response = await axios(config)
  .then(function (response) {
    console.log(response);
    console.log(response.status);
    return response.status;
  })
  .catch(function (error) {
    console.log(error);
  });

  return response;
}

async function addUserToSherlock(_accessToken, _user) {
  const date = "----" + getCurrentDate();
  const url = "/def-api/import/datapackages";
  const headers = {
    Authorization: `Bearer ${_accessToken}`,
    "Content-type": `multipart/form-data; boundary=${date}`,
  };
  const crlf = "\r\n";
  const system = "Fahrrad_Verleih";
  const type = "User";
  const meta = `"Kunde_ID":{ "type":"string", "value":"${_user.customer_ID}" }, "Nachname":{ "type":"string", "value":"${_user.lastname}" }, "Vorname":{ "type":"string", "value":"${_user.firstname}" }, "Anschrift":{ "type":"string", "value":"${_user.address}" }, "Mail":{ "type":"string", "value":"${_user.mail}" }, "Phone":{ "type":"string", "value":"${_user.phone}" }, "Geburtsdatum":{ "type":"string", "value":"${_user.birthday}" }, "Geschlecht":{ "type":"string", "value":"${_user.sex}" }, "_id":{ "type":"string", "value":"${_user.customer_ID}" }`;
  const data_string =
    crlf +
    "--" +
    date +
    crlf +
    'Content-Disposition: form-data; name="content"' +
    crlf +
    "" +
    crlf +
    "{" +
    crlf +
    '  "system": "' +
    system +
    '",' +
    crlf +
    '  "type": "' +
    type +
    '",' +
    crlf +
    '  "referenceId": "' +
    `${_user.customer_ID}` +
    '",' +
    crlf +
    '  "binarycontents": [' +
    crlf +
    "    {" +
    crlf +
    '      "path": "metadata+json",' +
    crlf +
    '      "contentType": "*META*",' +
    crlf +
    '      "mimeType": "application/json"' +
    crlf +
    "    }" +
    crlf +
    "  ]" +
    crlf +
    "}" +
    crlf +
    "" +
    crlf +
    "--" +
    date +
    crlf +
    'Content-Disposition: form-data; name="files"; filename="Metadata.json"' +
    crlf +
    "" +
    crlf +
    "{" +
    crlf +
    meta +
    crlf +
    "}" +
    crlf +
    "" +
    crlf +
    "--" +
    date +
    "--" +
    crlf;

  const response = await useApi("post", url, headers, data_string);
  return response.status;
}

async function getAllUsers(_accessToken) {
  const data = {
    comment: "suche alle Kunden",
    page: 0,
    pageSize: 100,
    query: "",
    systems: ["Fahrrad_Verleih"],
    types: ["User"]
  };

  const headers = { Authorization: `Bearer ${_accessToken}` };
  const url = `/def-api/search/Fahrrad_Verleih`;

  const user = await useApi("post", url, headers, data);
  console.log(user);
  return user.data.results;
}

async function getUserById(_accessToken, _id) {
  const data = {
    comment: "suche alle Kunden",
    page: 0,
    pageSize: 100,
    query: "",
    systems: ["Fahrrad_Verleih"],
    types: ["User"],
    filter: {
      logic: "and",
      filters: [
        {
          field: "KundeID",
          operator: "eq",
          value: _id
        }
      ]
    }
  };

  const headers = { Authorization: `Bearer ${_accessToken}` };
  const url = `/def-api/search/Fahrrad_Verleih`;

  const user = await useApi("post", url, headers, data);
  console.log(user);
  return user.data.results;
}

async function deleteUserFromSherlock(_accessToken, _id) {
  const date = "----" + getCurrentDate();
  const headers = {
    Authorization: `Bearer ${_accessToken}`,
    "Content-type": `multipart/form-data; boundary=${date}`,
  };
  const url = `/def-api/import/datapackages`;

  var data = new FormData();
  data.append(
    "content",
    `{\n\t"system": "Fahrrad_Verleih",\n\t"type": "User",\n\t"referenceId": "${_id}",\n\t"binarycontents": [\n\t\t{\n\t\t\t"path": "metadata.json",\n\t\t\t"contentType": "*META*",\n\t\t\t"mimeType": "application/json"\n\t\t}\n\t]\n}`
  );
  data.append("content", "{\n}");

  var config = {
    method: 'post',
    url: `https://${DEMO_NAME}.sherlock-cloud.de/def-api/import/datapackages`,
    headers: { 
      'Authorization': `Bearer ${_accessToken}`, 
      ...data.getHeaders()
    },
    data : data
  };
  
  const response = await axios(config)
  .then(function (response) {
    console.log(response);
    console.log(response.status);
    return response.status;
  })
  .catch(function (error) {
    console.log(error);
  });

  return response;
}

function getCurrentDate() {
  let date = new Date(); //10 May 2019, 3:30:20 PM
  let dateStr = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }); // 10/05/19

  let arr = dateStr.split("/"); // [ '10', '05', '19' ]
  let d = arr[0]; //e.g. 10
  let m = arr[1]; //e.g. 5
  let y = arr[2]; //e.g. 19

  let timeStr = date.toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }); //
  let arr2 = timeStr.split(":"); // 15:30:20
  let H = arr2[0]; //e.g. 15
  let i = arr2[1]; //e.g. 30
  let s = arr2[2]; //e.g. 20

  let ymdHms = y + m + d + H + i + s;

  console.log(ymdHms); //190510153020
  return ymdHms;
}

module.exports = {
  getTokens,
  getAvailableCollections,
  getCollectionSchema,
  getSpecificData,
  addBikeToSherlock,
  deleteBikeFromSherlock,
  getAllBikesFromSherlock,
  getBikeByIdFromSherlock,
  getAllCustomerContracts,
  getContractById,
  addContractToSherlock,
  deleteContractFromSherlock,
  addUserToSherlock,
  getAllUsers,
  getUserById,
  deleteUserFromSherlock,
};
