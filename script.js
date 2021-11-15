"use strict";

// wrapper function to generate the URL for API call by inserting the parameter
// into the URL string
// API is LTA DataMall
// using ArriveLah's proxy server to access LTA data. See https://github.com/cheeaun/arrivelah
function busArrivalApiCall(busStopCode) {
    return `https://arrivelah2.busrouter.sg/?id=${busStopCode}`;
}

// copied from https://stackoverflow.com/questions/36975619/how-to-call-a-rest-web-service-api-from-javascript
// using Fetch API https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
const fetchBusArrivals = async (busStopCode) => {
    const response = await fetch(busArrivalApiCall(busStopCode));
    const myJson = await response.json(); //extract JSON from the http response
    // do something with myJson
    displayArriavals(myJson);
};

function displayArriavals(myJson) {
    for (let service of myJson.services) {
        // display in mins, rounded down
        const minsUntilArrival = Math.floor(service.next.duration_ms / 60000);

        addTextToWebpage(`${service.no}: ${minsUntilArrival} mins`);
    }
}

function addTextToWebpage(str) {
    const newItem = document.createElement("li");
    newItem.innerText = str;
    messageList.appendChild(newItem);
}

const messageList = document.getElementById("output");

fetchBusArrivals(28461);
