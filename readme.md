# technologies used

-   vanilla JS
-   vanilla CSS
-   hosted on VPS

# the approach taken

-   designed for mobile

# installation instructions

# unsolved problems, etc.

# MY STUFF

# features

-   big font for usability
-   loading screen, using CSS class toggle and transitions
-   read data from LTA, which requires multiple reads because it only givecs 500 rows at a time, and there are 700 services, 5000 stops, and 20,000 entries in Routes table.
-   choose stops and services with dropdowns
-   bus stop and service selector automatically detect and only list legit values
-   save your favorites with localStorage
-   language toggle
-   can "Save to Desktop" on mobile - shows good icon and name

-   MVP:
-   choose bus stop via dropdown
-   choose bus #
    -   dynamically change the bus numbers per bus stop chosen
-   save stops
    -   be able to select bus route and stop, and save it in local storage, so it's kept between browser sessions

# next steps

-   deal with duplicate services, like services in two directions
-   deal with service outage, or bus not in service at this time
