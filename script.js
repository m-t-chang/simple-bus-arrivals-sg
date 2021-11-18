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
    document.querySelector(".stop-name").innerHTML = stopName;
    document.querySelector(".service-no").innerHTML = serviceNo;
    document.querySelector(".duration").innerHTML = `${mins} mins`;
}

class ArrivalCard {
    constructor(stopName, serviceNo) {
        this.stopName = stopName;
        this.serviceNo = serviceNo;
        this.duration = null;
        // this needs to store stopID as well. But I'm not sure what the data will look like yet
        // also data updating. The card should probably store the estimated arrival time,
        //      then calculate the duration on a faster refresh (1s? 5s?) than the data update.
    }
}

function updateCardStack() {
    // for each card, call the api
    cardStack.map(updateCard);
}

function updateCard(card) {
    // placeholder
    console.log(card);
}

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

////////////////////////////////////////////////////////////////////
// view methods
////////////////////////////////////////////////////////////////////

function displayCards() {
    // wipe the prev display
    document.querySelectorAll(".card").forEach((elem) => elem.remove());

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

////////////////////////////////////////////////////////////////////
// main code
////////////////////////////////////////////////////////////////////

// define global variables
let busServices;
const cardStack = [new ArrivalCard("Blk 347", "###")];

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

    // start repeating to update
    //setInterval(refreshData, 5000);

    // test local storage
    console.log(localStorage);
    localStorage.setItem("test1", "hello");

    // get data [OLD CODE]
    //fetchBusArrivals(28461);
};
