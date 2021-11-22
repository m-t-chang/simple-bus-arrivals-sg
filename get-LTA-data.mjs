"use strict";
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
// NOTE: the order of datasets is hard-coded! Don't change it.
const datasetList = [
    {
        name: "Bus Services",
        endpoint: "http://datamall2.mytransport.sg/ltaodataservice/BusServices",
        data: [],
    },
    {
        name: "Bus Routes",
        endpoint: "http://datamall2.mytransport.sg/ltaodataservice/BusRoutes",
        data: [],
    },
    {
        name: "Bus Stops",
        endpoint: "http://datamall2.mytransport.sg/ltaodataservice/BusStops",
        data: [],
    },
];
const outputFileName = "data/bus-reference-data.json";

////////////////////////////////////////////////////////////
// Get data from API
////////////////////////////////////////////////////////////
/*
Relevant notes on LTA's API:
- you can only get 500 rows at a time
- expected response is an object with 2 keys, metainfo and value. 
- "value" contains an array of objects

Code makes API calls synchronously, for simplicity. Speed is not an issue
here, since this code is only run once.
*/

// loop through the 3 data sets to retrieve, transform, and save the data
for (const dataset of datasetList) {
    // get the data, 500 rows at a time
    let rowsRemainingFlag = true;
    let skipRows = 0;
    while (rowsRemainingFlag) {
        // DEBUG
        //console.log(dataset.name);
        //console.log("skipRows:", skipRows);

        // call API
        const response = await fetch(dataset.endpoint + `?$skip=${skipRows}`, {
            headers: {
                AccountKey: process.env.API_ACCOUNT_KEY,
                accept: "application/json",
            },
        });
        const dataJson = await response.json(); //extract JSON from the http response

        // if we got data, then save it. Otherwise, stop the loop
        console.log("rows in response:", dataJson.value.length);
        if (dataJson.value.length === 0) {
            rowsRemainingFlag = false;
        } else {
            // parse the response (an array): push the 500 onto storage
            dataset.data.push(...dataJson.value);

            // set the skip parameter to get next 500 rows
            skipRows += 500;
        }
    }
}

// save the data into one JSON file
fs.writeFile(outputFileName, JSON.stringify(datasetList), (err) => {
    if (err) {
        throw err;
    }
    console.log("JSON data is saved.");
});
