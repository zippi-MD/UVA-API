const { locations } = require('../models/locations');

const getLocation = function (lat, lon) {
    console.log('lat: ' + lat + ' lon: ' + lon);
    uva_lugar_mas_cercano(lat, lon);
};

var uva_lugar = "";
var uva_distancia;
var coordenadasGeolocalizacion = locations;

function distancia_entre_coordenadas(lat1, lon1, lat2, lon2){
    let R = 6371; // km (This is the constant for km)
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    if (d > 1) return Math.round(d * 1000);
    else if (d <= 1) return Math.round(d * 1000);
    return d;
}

function comparator(a, b) {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
}

function meter_to_km(distance) {
    if (distance.toString().length > 3) {
        distance = Math.round(distance / 1000);
        return distance + ' Kilometros';
    } else {
        return distance + ' Metros';
    }
}

function uva_lugar_mas_cercano(x_coordinate, y_coordinate){

    let distance_from_places = [];
    let max_distance = 2500;

    console.log('Calculando las distancias.');
    for (let counter = 0; counter < coordenadasGeolocalizacion.length; counter++) {
        let distance_value = distancia_entre_coordenadas(x_coordinate, y_coordinate, coordenadasGeolocalizacion[counter].lat, coordenadasGeolocalizacion[counter].lon);
        distance_from_places.push([distance_value, coordenadasGeolocalizacion[counter]]);
    }

    distance_from_places = distance_from_places.sort(this.comparator);
    console.log(distance_from_places[0][1]);

    if(distance_from_places[0][0] < max_distance){
        uva_lugar = distance_from_places[0][1];
        uva_distancia = meter_to_km(distance_from_places[0][0]);
    }
    else {
        uva_lugar = 'default';
    }

    return distance_from_places;

}

module.exports = {
    getLocation
};