mapboxgl.accessToken = 'pk.eyJ1IjoiLWNsYW5rYXBsdW0tIiwiYSI6ImNtODR0Zm54YzJhenAyanEza2Z3eG50MmwifQ.Kx9Kioj3BBgqC5-pSkZkNg';

navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`);
        const data = await response.json();
        const placeName = data.features[0]?.place_name || "Unknown location";
        console.log("You are at:", placeName);
        const locationDiv = document.getElementById("location");
    if (locationDiv) {
      locationDiv.textContent = ` Current Location: ${placeName}`;
    }

  } catch (error) {
    console.error("Failed to reverse geocode:", error);
  }
});
