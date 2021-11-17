"use strict";

/*

Purpose of this code is to download reference data and save it locally.

Data to download:
- bus services
- bus stops

This will access LTA's APIs directly.

This is meant to be run from localhost via Node, and only run adhoc. 
It will not be run as part of using the webpage.

This is an ETL script basically.

OUTPUT: 
- bus-stops.json
- bus-services.json

*/
const jsonString = '{"name":"John", "age":30, "city":"New York"}';

const newObject = JSON.parse(jsonString);

console.log(newObject);
console.log(typeof newObject);

// from https://nodejs.dev/learn/reading-files-with-nodejs
const fs = require("fs");

// read file
let dataAsJson = "";
try {
    dataAsJson = fs.readFileSync("bus-stops.json", "utf8");
} catch (err) {
    console.error(err);
}
const dataObject = JSON.parse(dataAsJson);

//console.log(Object.keys(dataObject));

///////////////////////////////
// Download data from API
///////////////////////////////

// create Header for API
const myHeaders = new Headers({
    AccountKey: config.API_ACCOUNT_KEY,
    accept: "application/json",
});

const fetchBusStops = async () => {
    const response = await fetch(
        "http://datamall2.mytransport.sg/ltaodataservice/BusStops",
        {
            headers: myHeaders,
        }
    );
    const myJson = await response.json(); //extract JSON from the http response

    // do something with myJson
    console.log(myJson);
};

fetchBusStops();

// use node-fetch to make API requests
// see: https://stackabuse.com/making-http-requests-in-node-js-with-node-fetch/
