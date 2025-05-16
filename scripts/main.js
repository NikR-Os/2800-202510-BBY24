function showMap() {

    //---------------------------------------------------------------------------------
    // STEP ONE:  Find out where the user is first
    // If the user allows location access, use their location to initialize the map;
    // Otherwise, use the default location.
    //---------------------------------------------------------------------------------
    //Default location (YVR city hall) 49.26504440741209, -123.11540318587558
    let defaultCoords = { lat: 49.2490, lng: -123.0019 };



    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Locaion object as a key-value pair
                let userCoords = {
                    lng: position.coords.longitude,
                    lat: position.coords.latitude
                };
                console.log(userCoords);
                initializeMap(userCoords);
            }, (error) => {
                console.warn("Geolocation error:", error);
                initializeMap(defaultCoords); // Load with default location
            }
        )
    } else {
        console.error("Geolocation is not supported.");
        initializeMap(defaultCoords); // Load with default location
    }


    //---------------------------------------------------------------------------------
    // STEP TWO:  Initialize the map
    // This function will create the map object and add the user's location to the map
    // as a pin. It will also add an event listener for when the user clicks on the map
    // to get the route from the user's location to the clicked location.
    //
    // @params   coords:  an object with the user's location as a key-value pair
    //---------------------------------------------------------------------------------
    function initializeMap(coords) {

        //---------------------------------------------------------------
        // Convert the key value pair structure to an array of coordinates
        //---------------------------------------------------------------
        var userLocation = [coords.lng, coords.lat];   //user's location 
        console.log(userLocation);
        //----------------------
        // Create the map "map"
        //----------------------
        mapboxgl.accessToken = 'pk.eyJ1IjoiLWNsYW5rYXBsdW0tIiwiYSI6ImNtODR0Zm54YzJhenAyanEza2Z3eG50MmwifQ.Kx9Kioj3BBgqC5-pSkZkNg';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/-clankaplum-/cmah0v57300sl01rffo7kdydx', // Styling URL,
            center: userLocation, // center the map at the user's location
            //center: [-123.0019, 49.2490], // Starting position
            zoom: 15,
            projection: 'mercator' // Force Mercator projection
        });

        //---------------------------------------------------------------------------------
        // Add the user's location to the map
        //---------------------------------------------------------------------------------
        showPoint(map, userLocation);

        //---------------------------------------------------------------------------------
        // Add the clicked location to the map
        // After the click, get the route from the user's location to the clicked location
        //---------------------------------------------------------------------------------
        getClickedLocation(map, (clickedLocation) => {
            getRoute(map, userLocation, clickedLocation);
        });

        //---------------------------------------------------------------------------------
        // recenters the map onto the user.
        //---------------------------------------------------------------------------------
        recenterMap(map, userLocation);

        //---------------------------------
        // Add interactive pins for the sessions
        //---------------------------------
        loadSessions(map);
    }
}
showMap();

function recenterMap(map, userLocation) {
    document.getElementById("recenter-button").addEventListener("click", () => {
        map.flyTo({ center: userLocation, zoom: 15 })
    })
}

// update the Length button's text when a dropdown item is selected.
function updateLength(length) {
    document.getElementById("lengthInput").textContent = length;
    document.getElementById("sessionLengthValue").value = length;
    checkFormReady(); // call validation check
}

// Fetch all sessions and populate the map
async function loadSessions(map) {
    try {
        const response = await fetch('http://localhost:8000/sessions');
        if (!response.ok) {
            console.error("Failed to load session data:", response.statusText);
            return;
        }

        const sessions = await response.json();
        console.log("Sessions fetched:", sessions);
        addSessionPins(map, sessions);
    } catch (error) {
        console.error("Error loading sessions:", error);
    }
}

function addSessionPins(map, sessions) {
    const features = sessions.map(session => {
        const { geolocation, length, ownerName, ownerEmail, subject } = session;
        if (!geolocation) return null;

        return {
            type: 'Feature',
            properties: {
                description: `Session of ${length} minutes`,
                owner: ownerName,
                email: ownerEmail,
                subject: subject || 'default'
            },
            geometry: {
                type: 'Point',
                coordinates: [geolocation.longitude, geolocation.latitude]
            }
        };
    }).filter(feature => feature !== null);

    map.on('load', async () => {
        const sessionSubjects = ["math", "writing", "business", "computer", "art", "trades", "default"];

        try {
            await Promise.all(sessionSubjects.map(subject => loadImageToMap(map, subject)));
            addSessionPinsLayer(map, features);
        } catch (error) {
            console.error("Error loading images:", error);
        }
    });
}

function loadImageToMap(map, subject) {
    return new Promise((resolve, reject) => {
        map.loadImage(`http://localhost:8000/images/${subject}_pin.png`, (error, image) => {
            if (error) return reject(error);
            map.addImage(`${subject}_pin`, image);
            resolve();
        });
    });
}

function addSessionPinsLayer(map, features) {
    map.addSource('sessions', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: features
        }
    });

    map.addLayer({
        id: 'session-pins',
        type: 'symbol',
        source: 'sessions',
        layout: {
            'icon-image': ['concat', ['get', 'subject'], '_pin'],
            'icon-size': 0.025,
            'icon-rotate': 180
        }
    });

    map.on('click', 'session-pins', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { description, owner, email } = e.features[0].properties;

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`${description} created by ${owner} (${email})`)
            .addTo(map);
    });

    map.on('mouseenter', 'session-pins', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'session-pins', () => {
        map.getCanvas().style.cursor = '';
    });
}


// Update the initializeMap function to call loadSession
function initializeMap(coords) {
    var userLocation = [coords.lng, coords.lat];
    mapboxgl.accessToken = 'pk.eyJ1IjoiLWNsYW5rYXBsdW0tIiwiYSI6ImNtODR0Zm54YzJhenAyanEza2Z3eG50MmwifQ.Kx9Kioj3BBgqC5-pSkZkNg';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: userLocation,
        zoom: 15
    });

    // Show user's location
    showPoint(map, userLocation);

    // Add session pins to the map
    loadSession(map);

    // Add click handler for getting route
    getClickedLocation(map, (clickedLocation) => {
        getRoute(map, userLocation, clickedLocation);
    });
}

// Load all of the session pin images in this function.
function loadSessionPinImages(map, session) {

}

// ---------------------------------------------------------------------
// Add a pin for point that is provided as a parameter point (lat, long)
// when the map loads. Note map.on is an event listener. 
//
// @params   map:  the map object;
//           point:  an array of [lng, lat] coordinates
// ---------------------------------------------------------------------
function showPoint(map, point) {
    map.on('load', () => {
        //a point is added via a layer
        map.addLayer({
            id: 'point',
            type: 'circle',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: point
                            }
                        }
                    ]
                }
            },
            paint: {
                'circle-radius': 10,
                'circle-color': '#3887be',
                'circle-stroke-width': 6,
                'circle-stroke-color': '#7ED9CA',
                'circle-stroke-opacity': 0.70
            }
        });
    });
}

//-----------------------------------------------------------------------------
// This function is asynchronous event listener for when the user clicks on the map.
// This function will return in the callback, the coordinates of the clicked location
// and display a pin at that location as a map layer
//
// @params   map:  the map object;
//           callback:  a function that will be called with the clicked location
//-----------------------------------------------------------------------------
function getClickedLocation(map, callback) {
    map.on('click', (event) => {
        const clickedLocation = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
        const end = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: clickedLocation
                    }
                }
            ]
        };
        if (map.getLayer('end')) {
            map.getSource('end').setData(end);
        } else {
            map.addLayer({
                id: 'end',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: clickedLocation
                                }
                            }
                        ]
                    }
                },
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#00ff00',
                    'circle-opacity': 0.50
                }
            });
        }
        console.log(clickedLocation);
        callback(clickedLocation);
    });
}

// --------------------------------------------------------------
// This is an asynchronous function that will use the API to get
// the route from start to end. It will display the route on the map
// and provide turn-by-turn directions in the sidebar.
//
// @params   map:  the start and end coordinates;
//           start and end:  arrays of [lng, lat] coordinates
// -------------------------------------------------------------
async function getRoute(map, start, end) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const steps = data.legs[0].steps;
    const minutesDuration = Math.round(data.duration / 60);

    const directionsPanel = document.getElementById('directions-panel');
    directionsPanel.innerHTML = ""; // clear previous

    // Estimate for travel time.
    const timeEstimate = document.createElement("h4");
    timeEstimate.textContent = `Estimated time: ${minutesDuration} min`;
    directionsPanel.appendChild(timeEstimate);

    // Written directions to location.
    steps.forEach((step, index) => {
        const instruction = document.createElement("p");
        instruction.textContent = `${index + 1}. ${step.maneuver.instruction}`;
        directionsPanel.appendChild(instruction);
    });

    console.log("route is " + route);
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };

    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
        map.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#00FF00',
                'line-width': 5,
                'line-opacity': 0.75
            }
        });
    }
}

/**
 * Toggles the visibility of the session creation form.
 */
function toggleForm() {
    const form = document.getElementById("sessionFormPopup");
    const button = document.querySelector(".btn-sage"); // Create Session button

    const isFormVisible = form.style.display === "block";

    // Toggle visibility
    form.style.display = isFormVisible ? "none" : "block";
    button.style.display = isFormVisible ? "inline-block" : "none"; // Hide or show button
}


// Enable the submit button only if both fields are filled
function checkFormReady() {
    const desc = document.getElementById("sessionFormInput").value.trim();
    const length = document.getElementById("sessionLengthValue").value.trim();
    const submitBtn = document.getElementById("submitSessionBtn");
    submitBtn.disabled = !(desc && length);
}
//  Add listener to check description input on every keystroke
document.addEventListener("DOMContentLoaded", () => {
    const descInput = document.getElementById("sessionFormInput");
    descInput.addEventListener("input", checkFormReady);
});

