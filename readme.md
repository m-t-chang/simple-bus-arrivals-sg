# Simple Bus Arrivals SG

Simple Bus Arrivals SG is an accessible and mobile-first web app for checking bus arrival timings in Singapore. It is intended for users who have trouble reading small fonts, have reduced finger dexterity, are not English speakers, are unfamiliar with technology, or just want a distraction-free app to check bus arrival times.

-   Large, high-contrast fonts
-   Selected bus stops and services are saved to your browser's local storage
-   Detects your location for easy bus stop selection
-   Multiple languages

## Technologies Used

-   Vanilla HTML5, CSS3, and JavaScript (ES6)
-   Node.js (only needed to run the script that downloads bus service/route/stop data)

## Usage Instructions

The app is hosted at https://m-t-chang.github.io/simple-bus-arrivals-sg/.

For quick access on a mobile device, you can add the app to your home screen. In Android Chrome, use the "Add to Home screen" menu option.

## Installation Instructions

To set up your own version of this app, simply clone repository and it should work.

Note that HTTPS is required for the geolocation API to work.

If LTA changes bus services, routes, or stops, run "get-LTA-data.mjs" to download new data from LTA's API and create a new JSON file.

## Known Issues

-   User is allowed to add a new stop without filling in both Bus Stop and Bus Service No. fields.
-   Inputs are not validated.
-   Bug: if the user enters a value into Bus Stop before the code finishes finding the closest bus stops, the process doesn't complete and the Bus Stops never get sorted by distance.
-   Some parts of the website are not translated to both languages.
-   The website should inform the user when no bus arrival time is retrieved (e.g. the service is not currently running) instead of simply not displaying a number.
-   There is no UI element to indicate that the arrival time cards can be clicked on to reveal more information.
-   The data source has information that is not included, such as the direction of the bus service, terminal stop, hours of service, capacity, etc.

## Credits

Many thanks to **[arrivelah](https://github.com/cheeaun/arrivelah)** for providing an API to access LTA's bus arrival time data.
