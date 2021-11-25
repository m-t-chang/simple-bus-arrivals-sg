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
            // NOTE: ideally this should be fetching the time instead
            card.duration = Math.floor(service.next.duration_ms / 60000);
            card.duration2 = Math.floor(service.next2.duration_ms / 60000);
            card.duration3 = Math.floor(service.next3.duration_ms / 60000);
            //console.log("mins", minsUntilArrival);

            card.arrivalObject = service;
        }
    }
    //console.log("end of fetchBusArrivals", myJson);
    //console.log(card);

    // update display after updating data
    //displayCards();
    displayCardDurations();
};

class ArrivalCard {
    constructor(busStopCode, serviceNo) {
        this.busStopCode = busStopCode;
        this.serviceNo = serviceNo;
        this.duration = null;
        this.arrivalObject = null;
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

// for calculating Haversine distance between two lat-long
// from https://stackoverflow.com/a/48805273/17439719
/**
 * Calculates the haversine distance between point A, and B.
 * @param {number[]} latlngA [lat, lng] point A
 * @param {number[]} latlngB [lat, lng] point B
 * @param {boolean} isMiles If we are using miles, else km.
 */
const haversineDistance = ([lat1, lon1], [lat2, lon2], isMiles = false) => {
    const toRadian = (angle) => (Math.PI / 180) * angle;
    const distance = (a, b) => (Math.PI / 180) * (a - b);
    const RADIUS_OF_EARTH_IN_KM = 6371;

    const dLat = distance(lat2, lat1);
    const dLon = distance(lon2, lon1);

    lat1 = toRadian(lat1);
    lat2 = toRadian(lat2);

    // Haversine Formula
    const a =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.asin(Math.sqrt(a));

    let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

    if (isMiles) {
        finalDistance /= 1.60934;
    }

    return finalDistance;
};

function sortBusStopsByDistance() {
    // get geolocation of user, and sort the stops by distance
    console.log(
        "Fetching geolocation and calculating distances to bus stops..."
    );
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // console.log(
            //     "user's position",
            //     position.coords.latitude,
            //     position.coords.longitude
            // );

            // calculate distance to all stops and save that info
            busStops.forEach(
                (busStop) =>
                    (busStop.distanceFromUser = haversineDistance(
                        [position.coords.latitude, position.coords.longitude],
                        [busStop.Latitude, busStop.Longitude]
                    ))
            );
            //console.log("busStops array", busStops);

            // sort the busStops array by distance
            busStops.sort((a, b) => a.distanceFromUser - b.distanceFromUser);

            // populate the Bus Stop picker
            populateBusStopsMenu(busStops);

            console.log("...finished sorting bus stop options by distance.");
        },
        (error) => {
            console.log("Error when trying to get geolocation:", error);
        }
    );
}

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
            .querySelector("template")
            .content.cloneNode(true);

        // modify elements
        divCard.querySelector(".stop-description").innerText =
            card.stopObject.Description;
        divCard.querySelector(".stop-road").innerText =
            card.stopObject.RoadName;
        divCard.querySelector(".service-no").innerText = card.serviceNo;
        divCard.querySelector(".duration").innerText =
            card.duration >= 0 ? card.duration : 0;
        divCard.querySelector(".card-bottom").innerText = `Later buses:
        ${card.duration2} mins
        ${card.duration3} mins`;

        // append
        document.querySelector("#card-stack").append(divCard);
    });
}

/*
This is supposed to be a subset of displayCards function
It only updates the durations. 
*/
function displayCardDurations() {
    // get all the cards from the DOM,
    // Iterate thru each one,.
    // and update the duration fields from the data
    const divCardArray = document.querySelector("#card-stack").children;

    for (let i = 0; i < divCardArray.length; i++) {
        //console.log(divCardArray[i]);
        divCardArray[i].querySelector(".duration").innerText =
            cardStack[i].duration >= 0 ? cardStack[i].duration : 0;

        divCardArray[i].querySelector(".card-bottom").innerText = `Later buses:
            ${cardStack[i].duration2} mins
            ${cardStack[i].duration3} mins`;
    }
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

function openKebabMenu(e) {
    document.querySelector("div.kebab-menu").classList.add("kebab-show");
    document.querySelector("div.kebab-menu").classList.remove("kebab-hide");
    document
        .querySelector(".kebab-menu-backdrop")
        .classList.add("kebab-show-backdrop");
}

function closeKebabMenu(e) {
    document.querySelector("div.kebab-menu").classList.remove("kebab-show");
    document.querySelector("div.kebab-menu").classList.add("kebab-hide");
    document
        .querySelector(".kebab-menu-backdrop")
        .classList.remove("kebab-show-backdrop");
}

////////////////////////////////////////////////////////////////////
// controller methods
////////////////////////////////////////////////////////////////////

function addCard() {
    // save the selection to data
    const selectedStop = document.querySelector("#select-stop").value; // for now, store the stop ID in card.stopName
    const selectedService = document.querySelector("#select-service").value;
    cardStack.push(new ArrivalCard(selectedStop, selectedService));

    // draw cards
    displayCards();

    // update data and display
    refreshData();

    // reset the inputs
    document.querySelector("#select-stop").value = "";
    document.querySelector("#select-service").value = "";
    populateBusServicesMenu(busServices);
    populateBusStopsMenu(busStops);

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

    closeKebabMenu();
}

function clearCards() {
    if (window.confirm("Clear cards and local storage?")) {
        // clears local storage
        // this also affects language preference
        localStorage.clear();

        // clear cards on the screen
        cardStack.length = 0;
        displayCards();
    } else {
        // do nothing
        return;
    }

    closeKebabMenu();
}

function updateStopsForService(e) {
    //console.log("updating bus stops for ", e.target.value);

    // if input is blank, then display all stops
    if (e.target.value === "") {
        populateBusStopsMenu(busStops);
        return;
    }

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

    // if input is blank, then display all services
    if (e.target.value === "") {
        populateBusServicesMenu(busServices);
        return;
    }

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

function expandCard(e) {
    // guard clause - block out things that shouldn't react to being clicked on
    if (e.target.id === "card-stack") return;
    //console.log(e.target);

    // get the card element
    const card = e.target.closest(".card");

    // assign it the expanded class
    card.querySelector(".card-bottom").classList.toggle("expanded-card");
}

////////////////////////////////////////////////////////////////////
// main code
////////////////////////////////////////////////////////////////////

// define global variables
let busServices;
let busRoutes;
let busStops;

// read in reference data
readTextFile("data/bus-reference-data.json", function (text) {
    const datasetList = JSON.parse(text);
    //console.log(datasetList);

    busServices = datasetList[0].data;
    busRoutes = datasetList[1].data;
    busStops = datasetList[2].data;

    // add options to dropdown
    populateBusServicesMenu(busServices);
    populateBusStopsMenu(busStops);

    // use user location to sort bus stop options
    sortBusStopsByDistance();
});

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
    document
        .querySelector("button#refresh")
        .addEventListener("click", refreshData);
    document
        .querySelector("button#clear-all")
        .addEventListener("click", clearCards);
    document
        .querySelector("button#toggle-lang")
        .addEventListener("click", toggleLanguage);
    document
        .querySelector("button#kebab")
        .addEventListener("click", openKebabMenu);
    document
        .querySelector("div.kebab-menu-backdrop")
        .addEventListener("click", closeKebabMenu);

    // callback for expanding card
    document.querySelector("#card-stack").addEventListener("click", expandCard);

    // note: this callback is on change, not input.
    // Input would be faster, maybe, but more resource intensive?
    // https://www.w3schools.com/jsref/obj_event.asp
    document
        .querySelector("#select-service")
        .addEventListener("change", updateStopsForService);
    document
        .querySelector("#select-stop")
        .addEventListener("change", updateServicesForStop);

    // draw the cards
    displayCards();

    // refresh data
    // this calls displayCardDurations after data is loaded
    refreshData();

    // start repeating to update
    setInterval(refreshData, 15000);

    ////////////////////////////////////////////////////////////////////
    // loading overlay
    ////////////////////////////////////////////////////////////////////

    // hide the loading screen after a certain amount of time
    const loadingOverlay = document.querySelector("div.loading");
    window.setTimeout(() => {
        loadingOverlay.classList.add("hidden");
    }, 700);
};
