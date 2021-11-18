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
        if (service.no === "185") {
            // display in mins, rounded down
            const minsUntilArrival = Math.floor(
                service.next.duration_ms / 60000
            );

            addTextToWebpage("Blk 347", service.no, minsUntilArrival);
        }
    }
}

function addTextToWebpage(stopName, serviceNo, mins) {
    // const newItem = document.createElement("li");
    // newItem.innerText = str;
    // messageList.appendChild(newItem);
    textStopName.innerHTML = stopName;
    textServiceNo.innerHTML = serviceNo;
    textDuration.innerHTML = `${mins} mins`;
}

const textStopName = document.getElementById("stop-name");
const textServiceNo = document.getElementById("service-no");
const textDuration = document.getElementById("duration");

fetchBusArrivals(28461);

//////// testing out read file

console.log("testing file read");

// Do some data cleaning

/*
// NOT READING FROM .JS FILES ANYMORE
// load the actual data into objects
const busStops = busStopsJson.value;
const busServices = busServicesJson.value;
const busRoutes = busRoutesJson.value;
*/

//////// test out read JSON file
// second answer from https://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript

function readTextFile(file, callback) {
    const rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
}

//usage:
let busServices;

readTextFile("data/bus-services.json", function (text) {
    const data = JSON.parse(text);
    console.log(data);

    busServices = data;

    // add options to dropdown
    busServices.map((elem) => {
        const opt = document.createElement("option");
        opt.innerText = elem.ServiceNo;
        document.querySelector("#select-service").append(opt);
    });
});
