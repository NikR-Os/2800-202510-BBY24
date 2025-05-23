window.latestCoords = null;

function checkAuth() {
    const userId = sessionStorage.getItem('userId');
    const currentPage = window.location.pathname.split('/').pop();

    // List of protected pages that require login
    const protectedPages = ['main.html', 'adminMain.html', 'profile.html', 'setting.html'];

    if (protectedPages.includes(currentPage) && !userId) {
        // Redirect to index.html if not logged in
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

// Run the check before anything else
if (!checkAuth()) {
    // Stop execution if not authenticated
    throw new Error("Unauthorized access - redirecting to login");
}
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
            console.log("[Geo] Starting watchPosition — continuous tracking initialized.");

            navigator.geolocation.watchPosition(
                (position) => {
                    console.log("[Geo] watchPosition update received:", position.coords);

                    try {
                        currentUserLocation = [position.coords.longitude, position.coords.latitude];
                        window.latestCoords = currentUserLocation;

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
function recenterMap(map, getLocation) {
    document.getElementById("recenter-button").addEventListener("click", () => {
        const coords = getLocation();
        map.flyTo({ center: coords, zoom: 15 });
    });
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
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/sessions`);
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
        const baseUrl = window.location.origin;
        map.loadImage(`${baseUrl}/images/${subject}_pin.png`, (error, image) => {
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
    try {
        // Show loading state
        const directionsPanel = document.getElementById('directions-panel');
        directionsPanel.innerHTML = `
            <div class="card-header">
                <h3><i class="fas fa-directions me-2"></i>Directions</h3>
                <button class="close-btn" onclick="document.getElementById('pop-menu').style.display='none'">&times;</button>
            </div>
            <div class="card-body">
                <div class="text-center py-3">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Calculating route...</p>
                </div>
            </div>
        `;

        document.getElementById('pop-menu').style.display = 'block';

        // Make directions request
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
        );

        if (!query.ok) throw new Error('Failed to fetch directions');

        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;
        const steps = data.legs[0].steps;
        const minutesDuration = Math.round(data.duration / 60);
        const distance = (data.distance / 1000).toFixed(1);

        // Update directions panel
        directionsPanel.innerHTML = `
            <div class="card-header">
                <h3><i class="fas fa-directions me-2"></i>Directions</h3>
                <button class="close-btn" onclick="document.getElementById('pop-menu').style.display='none'">&times;</button>
            </div>
            <div class="card-body">
                <div class="route-summary d-flex justify-content-between align-items-center mb-3">
                    <div class="route-time">
                        <i class="fas fa-clock text-success me-2"></i>
                        <span>${minutesDuration} min</span>
                    </div>
                    <div class="route-distance">
                        <i class="fas fa-route text-success me-2"></i>
                        <span>${distance} km</span>
                    </div>
                </div>
                <div class="steps-list">
                    ${steps.map((step, index) => `
                        <div class="step">
                            <div class="step-icon">
                                ${getStepIcon(step.maneuver.type, step.maneuver.modifier)}
                            </div>
                            <div class="step-text">
                                <div class="step-instruction">${step.maneuver.instruction}</div>
                                <div class="step-distance">${(step.distance / 1000).toFixed(1)} km</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary w-100" style="background-color: #4a8c5e" onclick="document.getElementById('pop-menu').style.display='none'">
                    <i class="fas fa-times me-2"></i>Close
                </button>
            </div>
        `;

        // Draw route on map
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };

        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        } else {
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
                    'line-color': '#4a8c5e',
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            });
        }

    } catch (error) {
        console.error('Error getting directions:', error);
        directionsPanel.innerHTML = `
            <div class="card-header">
                <h3><i class="fas fa-directions me-2"></i>Directions</h3>
                <button class="close-btn" onclick="document.getElementById('pop-menu').style.display='none'">&times;</button>
            </div>
            <div class="card-body">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to get directions. Please try again.
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary w-100" onclick="document.getElementById('pop-menu').style.display='none'">
                    <i class="fas fa-times me-2"></i>Close
                </button>
            </div>
        `;
    }
}

// Updated icon mapping with proper Font Awesome classes
function getStepIcon(type, modifier) {
    const icons = {
        'turn': {
            'left': 'fa-arrow-left',
            'right': 'fa-arrow-right',
            'sharp left': 'fa-arrow-left-long',
            'sharp right': 'fa-arrow-right-long',
            'slight left': 'fa-arrow-left',
            'slight right': 'fa-arrow-right',
            'uturn': 'fa-arrow-rotate-left',
            'default': 'fa-arrow-right'
        },
        'depart': 'fa-location-dot',
        'arrive': 'fa-flag-checkered',
        'continue': 'fa-arrow-right',
        'roundabout': 'fa-rotate-right',
        'rotary': 'fa-arrows-rotate',
        'fork': 'fa-code-fork',
        'merge': 'fa-arrow-right-arrow-left',
        'new name': 'fa-signature',
        'default': 'fa-arrow-right'
    };

    if (type === 'turn') {
        return `<i class="fas ${icons.turn[modifier] || icons.turn.default}"></i>`;
    }
    return `<i class="fas ${icons[type] || icons.default}"></i>`;
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

        const subjectSelect = document.getElementById("subjectSelect");
        const programSubject = sessionStorage.getItem("programSubject");
        if (subjectSelect && subjectSelect.options.length <= 1) {
            console.log("[main.js] Populating subject dropdown:", programSubject);
            subjectSelect.innerHTML = `<option value="">Select one...</option>`;

            if (programSubject) {
                // Add the program's subject (e.g., "math")
                const optionMain = document.createElement("option");
                optionMain.value = programSubject;
                optionMain.textContent = programSubject.charAt(0).toUpperCase() + programSubject.slice(1);
                subjectSelect.appendChild(optionMain);
            }

            // Add 'Other' as fallback
            const optionOther = document.createElement("option");
            optionOther.value = "default";
            optionOther.textContent = "Other";
            subjectSelect.appendChild(optionOther);
        }
    }
}
window.toggleMotivationBar = function () {
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
};





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
                    console.log("[FormSubmit] Calling writeSessions() now...");

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
        console.log("[main.js] About to make fetch call");
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


//getMotivationBtn click listener ends here)

document.addEventListener("DOMContentLoaded", async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
        console.warn("[UX] No user ID found in sessionStorage.");
        return;
    }

    try {
        const res = await fetch(`/profile/${userId}`);
        const user = await res.json();

        if (user.session) {
            console.log("[UX] Active session found for user — disabling Create Session.");
            const createBtn = document.querySelector(".btn-sage");
            if (createBtn) {
                createBtn.setAttribute("aria-disabled", "true");
                createBtn.classList.add("disabled");
                createBtn.style.opacity = "0.8";
                createBtn.style.pointerEvents = "none"; // disables click but keeps hover and tooltip
                createBtn.title = "You already have an active session.";
            }
        } else {
            console.log("[UX] No active session — Create Session is enabled.");
        }
    } catch (err) {
        console.error("[UX] Error checking user session status:", err);
    }
});

// create a sparkles effect on button click
document.getElementById('toggleMotivationBarBtn').addEventListener('click', function (e) {
    createSparkles(e.clientX, e.clientY);
});

function createSparkles(x, y) {
    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        // Use colors for sparkles
        const colors = ['#e0f7e5', '#a7f2b3', '#c8f5d0'];
        sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];

        document.body.appendChild(sparkle);

        // Random movement
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        let posX = x;
        let posY = y;

        const animate = () => {
            posX += Math.cos(angle) * velocity;
            posY += Math.sin(angle) * velocity;
            sparkle.style.left = `${posX}px`;
            sparkle.style.top = `${posY}px`;
        };

        let interval = setInterval(animate, 16);
        setTimeout(() => {
            clearInterval(interval);
            sparkle.remove();
        }, 1000);
    }
}

