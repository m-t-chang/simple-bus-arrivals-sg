# Technologies used

-   vanilla JavaScript
-   vanilla CSS

Project history: this was a way to push my limits of vanilla HTML, JS, and CSS knowledge.

# the approach taken

-   designed for mobile

# installation instructions

-   clone repository
-   open it and it should work

pretty simple

# unsolved problems, etc.

# Credit

-   arrivelah for providing the arrivals API

# MY STUFF - prob goes in the wiki?

# features

-   big font for usability
-   loading screen, using CSS class toggle and transitions
-   read data from LTA, which requires multiple reads because it only givecs 500 rows at a time, and there are 700 services, 5000 stops, and 20,000 entries in Routes table.
-   choose stops and services with dropdowns
-   bus stop and service selector automatically detect and only list legit values
-   save your favorites with localStorage
-   language toggle
-   can "Save to Desktop" on mobile - shows good icon and name
-   clicking a card expands it to show more details
-   geolocation: bus stop picker is sorted by distance from user, showing closest bus stops first

-   MVP:
-   choose bus stop via dropdown
-   choose bus #
    -   dynamically change the bus numbers per bus stop chosen
-   save stops
    -   be able to select bus route and stop, and save it in local storage, so it's kept between browser sessions

# next steps

-   deal with duplicate services, like services in two directions
-   deal with service outage, or bus not in service at this time
-   (more noted in Notion)
