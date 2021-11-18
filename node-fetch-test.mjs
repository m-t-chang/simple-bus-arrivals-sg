/*

The purpose of this file is to prepare the static data.

The script will create 3 .json files, which the app will use.


This file is .mjs to allow NodeJS to use import function.

To run this file, use this command in terminal

      API_ACCOUNT_KEY=<account key, no quotes> node <filename>


Assumptions:
- LTA's API call returns a JSON object, with key "metadata" and "value". 
- "Value" contains an array of objects

*/

// imports
// for more info, see: https://github.com/node-fetch/node-fetch
import fetch from "node-fetch";
import * as fs from "fs"; // for writing the .json file

// define variables
const apiSpecs = [
    {
        name: "Bus Services",
        endpoint: "http://datamall2.mytransport.sg/ltaodataservice/BusServices",
        outputFile: "data/bus-services.json",
    },
    {
        name: "Bus Routes",
        endpoint: "http://datamall2.mytransport.sg/ltaodataservice/BusRoutes",
        outputFile: "data/bus-routes.json",
    },
    {
        name: "Bus Stops",
        endpoint: "http://datamall2.mytransport.sg/ltaodataservice/BusStops",
        outputFile: "data/bus-stops.json",
    },
];

// call API
const response = await fetch(apiSpecs[0].endpoint + "?$skip=500", {
    headers: {
        AccountKey: process.env.API_ACCOUNT_KEY,
        accept: "application/json",
    },
});
const dataJson = await response.json(); //extract JSON from the http response

// test code
//console.log(typeof dataJson);
//console.log(dataJson.value[0]);

// save the file
fs.writeFile(apiSpecs[0].outputFile, JSON.stringify(dataJson.value), (err) => {
    if (err) {
        throw err;
    }
    console.log("JSON data is saved.");
});
