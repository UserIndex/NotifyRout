 
const axios = require("axios").default;

// Your coordinates
const yourLatitude = 0;
const yourLongitude = 0;

// Calculate the relative direction in degrees
function calculateRelativeDirection(yourLat, yourLon, vehicleLat, vehicleLon) {
  // Convert latitude and longitude from degrees to radians
  const yourLatRad = (Math.PI / 180) * yourLat;
  const yourLonRad = (Math.PI / 180) * yourLon;
  const vehicleLatRad = (Math.PI / 180) * vehicleLat;
  const vehicleLonRad = (Math.PI / 180) * vehicleLon;

  // Calculate the difference in longitude
  const deltaLon = vehicleLonRad - yourLonRad;

  // Calculate the relative direction in radians
  const relativeDirectionRad = Math.atan2(
    Math.sin(deltaLon),
    Math.cos(yourLatRad) * Math.tan(vehicleLatRad) - Math.sin(yourLatRad) * Math.cos(deltaLon)
  );

  // Convert relative direction from radians to degrees
  const relativeDirectionDeg = (180 / Math.PI) * relativeDirectionRad;

  return relativeDirectionDeg;
}

(async () => {
  // Request data for each route vehicle
  const options_0 = {
    method: "GET",
    url: "https://api.tranzy.dev",
    headers: {
      "X-Agency-Id": "4",
      Accept: "application/json",
      "X-API-KEY": "YourAPIKey",
    },
  };
  try {
    const { data } = await axios.request(options_0);
    const routeId = 46;

    const filteredData = data.filter((obj) => obj.route_id === routeId);

    let nearestVehicle = null;
    let nearestDistance = Number.MAX_VALUE;

    const extractedData = filteredData
      .map((obj) => ({
        speed: obj.speed,
        routeId: obj.route_id,
        latitude: obj.latitude,
        longitude: obj.longitude,
        tripId: obj.trip_id,
        relativeDirection: calculateRelativeDirection(
          yourLatitude,
          yourLongitude,
          obj.latitude,
          obj.longitude
        ),
      }))
      .filter((obj) => obj.tripId !== null);

    console.log("Extracted Data 0:", extractedData);

    // Determine which vehicles are coming your way
    const vehiclesComingYourWay = extractedData.filter(
      (obj) => Math.abs(obj.relativeDirection) < 90
    );

    console.log("Vehicles coming your way:", vehiclesComingYourWay);

    // Find the nearest vehicle
    for (const vehicle of vehiclesComingYourWay) {
      const distance = Math.sqrt(
        Math.pow(yourLatitude - vehicle.latitude, 2) +
        Math.pow(yourLongitude - vehicle.longitude, 2)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestVehicle = vehicle;
      }
    }

    // Create a link to Google Maps with the coordinates of the nearest vehicle
    if (nearestVehicle) {
      const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${nearestVehicle.latitude},${nearestVehicle.longitude}`;
      console.log("Link to nearest vehicle on Google Maps:", googleMapsLink);
    } else {
      console.log("No nearest vehicle found.");
    }
  } catch (error) {
    console.log(error);
  }
})();
