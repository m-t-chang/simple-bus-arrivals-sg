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
const fetchArrivalsForCard = async (card) => {
    const response = await fetch(busArrivalApiCall(card.busStopCode));
    const myJson = await response.json(); //extract JSON from the http response

    // update the card with the returned data
    for (let service of myJson.services) {
        if (service.no === card.serviceNo) {
            // display in mins, rounded down
            const minsUntilArrival = Math.floor(
                service.next.duration_ms / 60000 // this should be fetching the time instead
            );

            card.duration = minsUntilArrival;
            //console.log("mins", minsUntilArrival);
        }
    }
    //console.log("end of fetchBusArrivals", myJson);
    //console.log(card);

    // update display after updating data
    displayCards();
};

class ArrivalCard {
    constructor(busStopCode, serviceNo) {
        this.busStopCode = busStopCode;
        this.serviceNo = serviceNo;
        this.duration = null;
        // this needs to store busStopCode as well. But I'm not sure what the data will look like yet
        // also data updating. The card should probably store the estimated arrival time,
        //      then calculate the duration on a faster refresh (1s? 5s?) than the data update.

        this.stopObject = busStops.find(
            (busStop) => busStop.BusStopCode === busStopCode
        );
        this.stopName = getBusStopDescription(this.stopObject);
    }
}

function updateCardStack() {
    // for each card, call the api
    cardStack.map(fetchArrivalsForCard);
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
    //console.log(datasetList);

    busServices = datasetList[0].data;
    busRoutes = datasetList[1].data;
    busStops = datasetList[2].data;

    // add options to dropdown
    populateBusServicesMenu(busServices);
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
        //console.log(card);

        // get card template
        const divCard = document
            .querySelector("#card-template")
            .cloneNode(true);
        divCard.removeAttribute("style");
        divCard.removeAttribute("id");

        // modify elements
        divCard.querySelector(".stop-description").innerText =
            card.stopObject.Description;
        divCard.querySelector(".stop-road").innerText =
            card.stopObject.RoadName;
        divCard.querySelector(".service-no").innerText = card.serviceNo;
        divCard.querySelector(".duration").innerText =
            card.duration >= 0 ? card.duration : 0;

        // append
        document.querySelector("#card-stack").append(divCard);
    });
}

function getBusStopDescription(busStop) {
    // input a busStop object
    // return a string
    //return `${busStop.BusStopCode} - ${busStop.RoadName} - ${busStop.Description}`;
    return `${busStop.RoadName} - ${busStop.Description}`;
}

function populateBusStopsMenu(busStopsArray) {
    document.querySelector("#list-stops").textContent = "";
    busStopsArray.forEach((elem) => {
        const opt = document.createElement("option");
        opt.innerText = getBusStopDescription(elem);
        opt.value = elem.BusStopCode;
        document.querySelector("#list-stops").append(opt);
    });
}

function populateBusServicesMenu(busServicesArray) {
    // input is an array of Bus Service objects, such as "busServices"
    document.querySelector("#list-services").textContent = "";
    busServicesArray.forEach((elem) => {
        if (elem.Direction !== 1) return; // only display Direction 1 routes, to avoid duplicates
        const opt = document.createElement("option");
        opt.innerText = elem.ServiceNo;
        document.querySelector("#list-services").append(opt);
    });
}

function toggleLanguage() {
    // advance the counter
    langIndex++;
    if (langIndex === langOptions.length) langIndex = 0;

    // save it
    localStorage.setItem("langIndex", langIndex);

    displayProperLanguage();
}

function displayProperLanguage() {
    // adjust display - get all spans with language tag
    document.querySelectorAll("span").forEach((elem) => {
        // if language tag is not empty...
        if (elem.lang !== "") {
            // then compare tag to pref
            if (elem.lang === langOptions[langIndex]) {
                // enable
                elem.classList.remove("lang-hide");
            } else {
                // hide
                elem.classList.add("lang-hide");
            }
        }
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

    // update data and draw cards
    refreshData();

    // put into local storage
    localStorage.setItem("cardStack", JSON.stringify(cardStack));
}

function refreshData() {
    var currentdate = new Date();
    var datetime =
        "Refreshing data: " +
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

    updateCardStack();
}

function clearCards() {
    localStorage.clear();
    cardStack.length = 0;
    displayCards();
}

function updateStopsForService(e) {
    //console.log("updating bus stops for ", e.target.value);

    // use reduce to get an array of busStopCodes, instead of filter which gives
    // an array of BusRoute objects
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

function updateServicesForStop(e) {
    //console.log("updating bus services for ", e.target.value);

    // use reduce to get an array of busServiceNo, instead of filter which gives
    // an array of BusRoute objects
    const serviceNosAtStop = busRoutes.reduce((prev, elem) => {
        if (elem.BusStopCode === e.target.value) {
            prev.push(elem.ServiceNo);
        }
        return prev;
    }, []);
    //console.log(serviceNosAtStop);

    // turn the array of serviceNos into BusService objects
    const servicesAtStop = busServices.filter((service) =>
        serviceNosAtStop.includes(service.ServiceNo)
    );
    //console.log("services at stop", servicesAtStop);

    populateBusServicesMenu(servicesAtStop);
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
//console.log("localstorage", localStorage.getItem("cardStack"));
if (localStorage.getItem("cardStack") !== null) {
    cardStack.push(...JSON.parse(localStorage.getItem("cardStack")));
}
const langOptions = ["en", "zh"];
let langIndex = 0; // default is english
if (localStorage.getItem("langIndex") !== null) {
    langIndex = localStorage.getItem("langIndex");
}
displayProperLanguage(); // run this before page loads

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
        .querySelector("button#toggle-lang")
        .addEventListener("click", toggleLanguage);

    // note: this callback is on change, not input.
    // Input would be faster, maybe, but more resource intensive?
    // https://www.w3schools.com/jsref/obj_event.asp
    document
        .querySelector("#select-service")
        .addEventListener("change", updateStopsForService);
    document
        .querySelector("#select-stop")
        .addEventListener("change", updateServicesForStop);

    // refresh data
    // this calls displayCards after data is loaded
    refreshData();

    // start repeating to update
    //setInterval(refreshData, 5000);
    // DEBUG: pausing the refresh so i can inspect elements

    ////////////////////////////////////////////////////////////////////
    // loading overlay
    ////////////////////////////////////////////////////////////////////

    // hide the loading screen after a certain amount of time
    const loadingOverlay = document.querySelector("div.loading");
    window.setTimeout(() => {
        loadingOverlay.classList.add("hidden");
    }, 700);
};
