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
    // as a marker. It will also add an event listener for when the user clicks on the map
    // to get the route from the user's location to the clicked location.
    //
    //---------------------------------------------------------------------------------
    function initializeMap(coords) {
        var currentUserLocation = [coords.lng, coords.lat];
        console.log(currentUserLocation);

        mapboxgl.accessToken = 'pk.eyJ1IjoiLWNsYW5rYXBsdW0tIiwiYSI6ImNtODR0Zm54YzJhenAyanEza2Z3eG50MmwifQ.Kx9Kioj3BBgqC5-pSkZkNg';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/-clankaplum-/cmah0v57300sl01rffo7kdydx',
            center: currentUserLocation,
            zoom: 15,
            projection: 'mercator'
        });

        // ---------------------------------------------------------------------
        // Create an html element for the user's marker.
        // Add a marker for a user when the map loads. 
        // ---------------------------------------------------------------------
        const markerElement = document.createElement('div');
        markerElement.className = 'user-marker';

        const userMarker = new mapboxgl.Marker(markerElement)
            .setLngLat(currentUserLocation)
            .setPopup(new mapboxgl.Popup().setText("You are here"))
            .addTo(map);

        // ---------------------------------------------------------------------
        // Track user movement
        // Use the geolocations "watchPosition" functionality.
        // ---------------------------------------------------------------------
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    try {
                        currentUserLocation = [position.coords.longitude, position.coords.latitude];
                        console.log("User moved to:", currentUserLocation);

                        // Defensive check to avoid crashing
                        if (currentUserLocation.every(coord => typeof coord === 'number')) {
                            userMarker.setLngLat(currentUserLocation);
                            // Optional: map.flyTo({ center: updatedCoords, zoom: 15 });
                        } else {
                            console.warn("Invalid coordinates received:", currentUserLocation);
                        }
                    } catch (err) {
                        console.error("Error during location update:", err);
                    }
                },
                (err) => {
                    console.warn("watchPosition error:", err);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 10000,
                    timeout: 10000
                }
            );
        }

        // Call Recentering Functionality
        recenterMap(map, () => currentUserLocation);

        // Load the pins for the sessions
        loadSessions(map);

        // Enable route drawing
        getClickedLocation(map, (clickedLocation) => {
            getRoute(map, currentUserLocation, clickedLocation);
        });
    }

}
showMap();

// ---------------------------------------------------------------------
// Cneters the map on the user's location with the click of a button.
// ---------------------------------------------------------------------
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

    //  Populate course dropdown when form is shown
    if (!isFormVisible) {
        const courseSelect = document.getElementById("courseSelect");
        const courses = JSON.parse(sessionStorage.getItem("courses"));

        if (courses && courseSelect && courseSelect.options.length <= 1) {
            console.log("[main.js] Populating course dropdown:", courses);
            courseSelect.innerHTML = `<option value="">Select one...</option>`;
            courses.forEach(c => {
                const option = document.createElement("option");
                option.value = c;
                option.textContent = c;
                courseSelect.appendChild(option);
            });
        } else {
            console.warn("[main.js] Dropdown already populated or no courses in sessionStorage");
        }
    }
}

function toggleMotivationBar() {
  const bar = document.getElementById("motivationBar");
  const computedDisplay = window.getComputedStyle(bar).display;
  const isBarVisible = computedDisplay !== "none";

  console.log("TOGGLE triggered. Computed display:", computedDisplay, " → isVisible:", isBarVisible);
  console.log("Toggling to:", isBarVisible ? "none" : "flex");

  if (isBarVisible) {
    bar.style.display = "none";
    bar.classList.remove("d-flex");
  } else {
    bar.style.display = "flex";
    bar.classList.add("d-flex");
  }
}





// =========================
// Enable button if all form fields are valid
// =========================
function checkFormReady() {
    const desc = document.getElementById("sessionFormInput")?.value.trim();
    const length = document.getElementById("sessionLengthValue")?.value.trim();
    const course = document.getElementById("courseSelect")?.value;
    const submitBtn = document.getElementById("submitSessionBtn");

    console.log("[Debug] Form state - desc:", desc, "length:", length, "course:", course);
    if (submitBtn) {
        submitBtn.disabled = !(desc && length && course);
    }
}

// =========================
// Add listeners to ALL inputs
// =========================
document.addEventListener("DOMContentLoaded", () => {
    // Enable submit button on input
    const descInput = document.getElementById("sessionFormInput");
    const courseSelect = document.getElementById("courseSelect");
    const dropdown = document.getElementById("lengthInput");

    if (descInput) descInput.addEventListener("input", checkFormReady);
    if (courseSelect) courseSelect.addEventListener("change", checkFormReady);

    // Listen for manual changes to session length value
    const sessionLengthValue = document.getElementById("sessionLengthValue");
    if (dropdown && sessionLengthValue) {
        dropdown.addEventListener("click", () => {
            setTimeout(checkFormReady, 50); // wait briefly for async DOM updates
            const form = document.getElementById("sessionForm");
            if (form) {
                console.log("[Debug] Binding submit handler to sessionForm");
                form.addEventListener("submit", (e) => {
                    e.preventDefault();
                    console.log("[Debug] Form submit triggered.");
                    writeSessions();
                    toggleForm();
                });
            } else {
                console.warn("[Debug] sessionForm not found in DOM!");
            }

        });
    }

});
document.getElementById("getMotivationBtn").addEventListener("click", async () => {
  const topic = document.getElementById("topicInput").value.trim();
  const output = document.getElementById("motivationText");

  console.log("[getMotivationBtn] Topic submitted:", topic); // log user input

  if (!topic) {
    output.textContent = "Please enter a topic first.";
    return;
  }

  output.textContent = "Thinking... ✨";

  try {
    const response = await fetch("/api/ai/motivate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    const data = await response.json();

    console.log("[getMotivationBtn] Server response:", data); // log full response

    if (response.ok && data.message) {
      output.textContent = data.message;
    } else {
      output.textContent = "Hmm, I couldn't come up with anything just now.";
    }
  } catch (err) {
    console.error("[getMotivationBtn] Error fetching AI response:", err); //  log error
    output.textContent = "Something went wrong. Please try again later.";
  }
});


