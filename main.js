"use strict";

////////////////////////////////////////////////////////////////////
// model methods
////////////////////////////////////////////////////////////////////

// wrapper function to generate the URL for API call by inserting the parameter
// into the URL string
// API is LTA DataMall
// using ArriveLah's proxy server to access LTA data. See https://github.com/cheeaun/arrivelah
function busArrivalApiCall(busStopCode) {
    return `https://arrivelah2.busrouter.sg/?id=${busStopCode}`;
}

// copied from https://stackoverflow.com/questions/36975619/how-to-call-a-rest-web-service-api-from-javascript
// using Fetch API https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
const fetchBusArrivals = async (card) => {
    const response = await fetch(busArrivalApiCall(card.busStopCode));
    const myJson = await response.json(); //extract JSON from the http response
    // do something with myJson
    //displayArriavals(myJson);

    // update the card with the returned data
    for (let service of myJson.services) {
        if (service.no === card.serviceNo) {
            // display in mins, rounded down
            const minsUntilArrival = Math.floor(
                service.next.duration_ms / 60000 // this should be fetching the time instead
            );

            card.duration = `${minsUntilArrival} mins`;
            console.log("mins", minsUntilArrival);
        }
    }
    console.log("end of fetchBusArrivals", myJson);
    console.log(card);

    // update display
    // I think this has to go here? because this is an async function
    displayCards();
};

/*
// replaced by new code above
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
    document.querySelector(".stop-name").innerHTML = stopName;
    document.querySelector(".service-no").innerHTML = serviceNo;
    document.querySelector(".duration").innerHTML = `${mins} mins`;
}
*/

class ArrivalCard {
    constructor(busStopCode, serviceNo) {
        this.busStopCode = busStopCode;
        this.stopName = busStopCode; // placeholder
        this.serviceNo = serviceNo;
        this.duration = null;
        // this needs to store busStopCode as well. But I'm not sure what the data will look like yet
        // also data updating. The card should probably store the estimated arrival time,
        //      then calculate the duration on a faster refresh (1s? 5s?) than the data update.
    }
}

function updateCardStack() {
    // for each card, call the api
    cardStack.map(updateCard);
}

function updateCard(card) {
    console.log("updating card:", card);

    // use the card's info to call API
    fetchBusArrivals(card);
}

//////// read in JSON file with bus reference data
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

readTextFile("data/bus-reference-data.json", function (text) {
    const datasetList = JSON.parse(text);
    console.log(datasetList);

    busServices = datasetList[0].data;
    busRoutes = datasetList[1].data;
    busStops = datasetList[2].data;

    // add options to dropdown
    busServices.forEach((elem) => {
        const opt = document.createElement("option");
        opt.innerText = elem.ServiceNo;
        document.querySelector("#list-services").append(opt);
    });
    populateBusStopsMenu(busStops);
});

////////////////////////////////////////////////////////////////////
// view methods
////////////////////////////////////////////////////////////////////

function displayCards() {
    // wipe the prev display
    document.querySelector("#card-stack").textContent = "";

    // display all cards
    cardStack.map((card) => {
        console.log(card);

        // create elements
        const divCard = document.createElement("div");
        divCard.className = "card";

        const divStopName = document.createElement("div");
        divStopName.innerText = card.stopName;
        divStopName.className = "stop-name";

        const divServiceNo = document.createElement("div");
        divServiceNo.innerText = card.serviceNo;
        divServiceNo.className = "service-no";

        const divDuration = document.createElement("div");
        divDuration.innerText = card.duration;
        divDuration.className = "duration";

        // append
        divCard.append(divStopName, divServiceNo, divDuration);
        document.querySelector("#card-stack").append(divCard);
    });
}

function populateBusStopsMenu(busStopsArray) {
    document.querySelector("#list-stops").textContent = "";
    busStopsArray.forEach((elem) => {
        const opt = document.createElement("option");
        opt.innerText = `${elem.BusStopCode} - ${elem.RoadName} - ${elem.Description}`;
        opt.value = elem.BusStopCode;
        document.querySelector("#list-stops").append(opt);
    });
}

////////////////////////////////////////////////////////////////////
// controller methods
////////////////////////////////////////////////////////////////////

function addCard(e) {
    // save the selection to data
    const selectedStop = document.querySelector("#select-stop").value; // for now, store the stop ID in card.stopName
    const selectedService = document.querySelector("#select-service").value;
    cardStack.push(new ArrivalCard(selectedStop, selectedService));

    // update display
    displayCards();

    // put into local storage
    localStorage.setItem("cardStack", JSON.stringify(cardStack));
}

function refreshData() {
    console.log("refresh data placeholder");

    updateCardStack();

    var currentdate = new Date();
    var datetime =
        "Last Sync: " +
        currentdate.getDate() +
        "/" +
        (currentdate.getMonth() + 1) +
        "/" +
        currentdate.getFullYear() +
        " @ " +
        currentdate.getHours() +
        ":" +
        currentdate.getMinutes() +
        ":" +
        currentdate.getSeconds();

    console.log(datetime);
}

function clearCards() {
    localStorage.clear();
}

function updateStopsForService(e) {
    //console.log("updating bus stops for ", e.target.value);

    // use reduce to get an array of busStopCodes, instead of filter which gives
    // an array of BusStop objects
    const stopCodesOnRoute = busRoutes.reduce((prev, elem) => {
        if (elem.ServiceNo === e.target.value) {
            prev.push(elem.BusStopCode);
        }
        return prev;
    }, []);
    //console.log(stopCodesOnRoute);

    // use the array of BusStopCodes to filter the array of BusStops
    // use map, to retain the original order of the route
    const stopsOnRoute = stopCodesOnRoute.map((code) =>
        busStops.find((busStop) => busStop.BusStopCode === code)
    );
    //console.log("stops on route", stopsOnRoute);

    populateBusStopsMenu(stopsOnRoute);
}

////////////////////////////////////////////////////////////////////
// main code
////////////////////////////////////////////////////////////////////

// define global variables
let busServices;
let busRoutes;
let busStops;

// load data from local storage, if it exists
const cardStack = [];
console.log("localstorage", localStorage.getItem("cardStack"));
if (localStorage.getItem("cardStack") !== null) {
    cardStack.push(...JSON.parse(localStorage.getItem("cardStack")));
}

// on page load:
window.onload = () => {
    // add callbacks
    document.querySelector("button#add").addEventListener("click", addCard);
    document
        .querySelector("button#refresh")
        .addEventListener("click", refreshData);
    document
        .querySelector("button#clear-all")
        .addEventListener("click", clearCards);
    document
        .querySelector("#select-service")
        .addEventListener("change", updateStopsForService);

    // start repeating to update
    //setInterval(refreshData, 5000);

    // get data [OLD CODE]
    //fetchBusArrivals(28461);

    // update display
    displayCards();
};

////////////////////////////////////////////////////////////////////
// loading overlay
////////////////////////////////////////////////////////////////////

// hide the loading screen after a certain amount of time
const loadingOverlay = document.querySelector("div.loading");
window.setTimeout(() => {
    loadingOverlay.classList.add("hidden");
}, 1200);
