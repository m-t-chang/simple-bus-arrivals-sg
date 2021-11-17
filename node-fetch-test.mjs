// to run this file, use this command in terminal
//
//      API_ACCOUNT_KEY=<account key, no quotes> node <filename>

import fetch from "node-fetch";
/*
// template
const response = await fetch("https://api.github.com/users/github");
const data = await response.json();

console.log(data);
*/

/*const myHeaders = new fetch.Headers({
    AccountKey: config.API_ACCOUNT_KEY,
    accept: "application/json",
});*/

const response = await fetch(
    "http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=500",
    {
        headers: {
            AccountKey: process.env.API_ACCOUNT_KEY,
            accept: "application/json",
        },
    }
);
const myJson = await response.json(); //extract JSON from the http response

// do something with myJson
console.log(typeof myJson);
console.log(myJson.value[0]);

// try saving the file
import * as fs from "fs";

fs.writeFile("file-test.json", JSON.stringify(myJson.value), (err) => {
    if (err) {
        throw err;
    }
    console.log("JSON data is saved.");
});
