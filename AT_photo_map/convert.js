const fs = require('fs');

// Read the ExifTool JSON
const raw = JSON.parse(fs.readFileSync('photos.json'));

// Function to convert DMS to decimal
function dmsToDecimal(dms) {

    const parts = dms.match(/(\d+) deg (\d+)' ([\d.]+)" ([NSEW])/);

    if (!parts) return null;

    let degrees = parseFloat(parts[1]);
    let minutes = parseFloat(parts[2]);
    let seconds = parseFloat(parts[3]);
    let direction = parts[4];

    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (direction === 'S' || direction === 'W') {
        decimal *= -1;
    }

    return decimal;
}

// Create GeoJSON
const geojson = {
    type: "FeatureCollection",
    features: []
};

// Loop through photos
raw.forEach(photo => {

    if (photo.GPSLatitude && photo.GPSLongitude) {

        const lat = dmsToDecimal(photo.GPSLatitude);
        const lon = dmsToDecimal(photo.GPSLongitude);

        geojson.features.push({
            type: "Feature",
            properties: {
                image: `photos/${photo.FileName}`,
                caption: photo.FileName
            },
            geometry: {
                type: "Point",
                coordinates: [lon, lat]
            }
        });

    }

});

// Write GeoJSON file
fs.writeFileSync(
    'photos.geojson',
    JSON.stringify(geojson, null, 2)
);

console.log('GeoJSON created!');