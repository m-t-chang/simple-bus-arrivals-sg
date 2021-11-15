"use strict";

// wrapper function to generate the URL for API call by inserting the parameter
// into the URL string
// API is LTA DataMall
function busArrivalApiCall(busStopCode) {
    return `https://arrivelah2.busrouter.sg/?id=${busStopCode}`;
    //return `http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${busStopCode}`;
}

// create Header for API
const myHeaders = new Headers({
    AccountKey: config.API_ACCOUNT_KEY,
    accept: "application/json",
});

// copied from https://stackoverflow.com/questions/36975619/how-to-call-a-rest-web-service-api-from-javascript
// using Fetch API https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
const fetchBusArrivals = async (busStopCode) => {
    const response = await fetch(busArrivalApiCall(busStopCode), {
        //headers: myHeaders,
    });
    const myJson = await response.json(); //extract JSON from the http response
    // do something with myJson
    return myJson;
};

const arrivals = fetchBusArrivals(28461);
console.log(arrivals);
