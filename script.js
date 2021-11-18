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
    document.querySelector(".stop-name").innerHTML = stopName;
    document.querySelector(".service-no").innerHTML = serviceNo;
    document.querySelector(".duration").innerHTML = `${mins} mins`;
}

class ArrivalCard {
    constructor(stopName, serviceNo) {
        this.stopName = stopName;
        this.serviceNo = serviceNo;
        this.duration = null;
    }
}

const cardStack = [new ArrivalCard("Blk 347", "###")];

function displayCards() {
    cardStack.map((card) => {
        // create elements
        const divCard = document.createElement("div");
        divCard.className = "card";

        const divStopName = document.createElement("div");
        divStopName.innerHTML = card.stopName;
        divStopName.className = "stop-name";

        const divServiceNo = document.createElement("div");
        divServiceNo.innerHTML = card.serivceNo;
        divServiceNo.className = "service-no";

        const divDuration = document.createElement("div");
        divDuration.innerHTML = card.duration;
        divDuration.className = "duration";

        // append
        divCard.append(divStopName, divServiceNo, divDuration);
        document.querySelector("#card-stack").append(divCard);

        console.log(divCard);
    });
}

fetchBusArrivals(28461);

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

function addCard(e) {
    // save the selection to data
    const selectedService = document.querySelector("#select-service").value;
    cardStack.push(new ArrivalCard("xxx", selectedService));

    // update display
    displayCards();

    // put into local storage
    localStorage.setItem("cardStack", JSON.stringify(cardStack));
}

function refreshData() {
    console.log("refresh data placeholder");

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

// add callbacks
document.querySelector("button#add").addEventListener("click", addCard);
document.querySelector("button#refresh").addEventListener("click", refreshData);
document
    .querySelector("button#clear-all")
    .addEventListener("click", clearCards);

// start repeating to update
//setInterval(refreshData, 5000);

// test local storage
console.log(localStorage);
localStorage.setItem("test1", "hello");
