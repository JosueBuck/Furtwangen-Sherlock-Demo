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
      //console.log(response);
      return response;
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
  return tokens.data;
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
  //console.log(contracts.data.results)
  return contracts.data.results;
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
  /* const meta = '  "_id":{' + crlf +
			'    "type":"string",' + crlf +
			'    "value":"' + "Kunde_ID_UID10001" + '"' + crlf +
			'  }' + crlf; */
      //const meta = `------${date} Content-Disposition: form-data; name=content { system: ${system}, type: User, referenceId: Kunde_ID_UID10009, binarycontents: [ { path: metadata.json, contentType: *META*, mimeType: application/json } ] } ------${date} Content-Disposition: form-data; name=files; filename=Metadata.json { Kunde_ID:{ type:string, value:UID10009 }, Nachname:{ type:string, value:Breuninger }, Vorname:{ type:string, value:Eva }, Anschrift:{ type:string, value:Baumannstraße 26, 78120 Furtwangen }, Mail:{ type:string, value:eva.breuni@outlook.de }, Phone:{ type:string, value:01747287356 }, Geburtsdatum:{ type:string, value:1998-07-25 }, Geschlecht:{ type:string, value:w }, _id:{ type:string, value:Kunde_ID_UID10009 } } ------${date}--`;
      const meta = `"Kunde_ID":{ "type":"string", "value":"${_user.customer_ID}" }, "Nachname":{ "type":"string", "value":"${_user.lastname}" }, "Vorname":{ "type":"string", "value":"${_user.firstname}" }, "Anschrift":{ "type":"string", "value":"${_user.address}" }, "Mail":{ "type":"string", "value":"${_user.mail}" }, "Phone":{ "type":"string", "value":"${_user.phone}" }, "Geburtsdatum":{ "type":"string", "value":"${_user.birthday}" }, "Geschlecht":{ "type":"string", "value":"${_user.sex}" }, "_id":{ "type":"string", "value":"${_user.customer_ID}" }`;

      const data_string = crlf +
			'--' + date + crlf +
			'Content-Disposition: form-data; name="content"' + crlf +
			'' + crlf +
			'{' + crlf +
			'  "system": "' + system + '",' + crlf +
			'  "type": "' + type + '",' + crlf +
			'  "referenceId": "' + `${_user.customer_ID}` + '",' + crlf +
			'  "binarycontents": [' + crlf +
			'    {' + crlf +
			'      "path": "metadata+json",' + crlf +
			'      "contentType": "*META*",' + crlf +
			'      "mimeType": "application/json"' + crlf +
			'    }' + crlf +
			'  ]' + crlf +
			'}' + crlf +
			'' + crlf +
			'--' + date + crlf +
			'Content-Disposition: form-data; name="files"; filename="Metadata.json"' + crlf +
			'' + crlf +
			'{' + crlf +
			meta + crlf +
			'}' + crlf +
			'' + crlf +
			'--' + date + '--' + crlf;	

  const response = await useApi("post", url, headers, data_string);
  console.log(response)
  return response.status;
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
  getAllCustomerContracts,
  addUserToSherlock,
};
