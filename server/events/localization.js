const { Location } = require('../models/locations');

var uva_lugar;
default_events = [];
var uva_distancia;
var coordenadasGeolocalizacion;
let default_title = 'Lo sentimos, te encuentras demasiado lejos de una zona con cobertura.';
let default_phrase = 'A continuación apareceran los lugares más cercanos a ti con cobertura, puedes ver su posición exacta en el mapa.';
let default_img = 'https://www.publicdomainpictures.net/pictures/30000/nahled/evening-landscape-13530956185Aw.jpg';


const getNearestLocation = function (lat, lon, locations) {

    coordenadasGeolocalizacion = locations;
    uva_lugar_mas_cercano(lat, lon);
    return {
        location: uva_lugar,
        default_events: default_events
    };
};


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
        return distance + ' km';
    } else {
        return distance + ' m';
    }
}

function uva_lugar_mas_cercano(x_coordinate, y_coordinate){

    let distance_from_places = [];

    for (let counter = 0; counter < coordenadasGeolocalizacion.length; counter++) {
        let distance_value = distancia_entre_coordenadas(x_coordinate, y_coordinate, coordenadasGeolocalizacion[counter].lat, coordenadasGeolocalizacion[counter].lon);
        distance_from_places.push([distance_value, coordenadasGeolocalizacion[counter]]);
    }

    distance_from_places = distance_from_places.sort(this.comparator);

    if(distance_from_places[0][0] < distance_from_places[0][1].loc_size){
        uva_lugar = distance_from_places[0][1];
        uva_distancia = meter_to_km(distance_from_places[0][0]);
    }
    else {
        uva_lugar = {
            name: ':/',
            img: default_img,
            markers: []
        };

        var markers = [];
        default_events = [];

        default_events.push({
            title: default_title,
            phrase: default_phrase,
            img: '',
            type: 'note'
        });


        for(var i = 0; i < distance_from_places.length && i < 5; i++){
            let location = distance_from_places[i][1];
            let distance = distance_from_places[i][0];
            markers.push({
                title: location.name,
                phrase: location.phrase,
                img: '',
                latitude: location.lat,
                longitude: location.lon
            });
            default_events.push({
                title: location.name,
                phrase: location.phrase,
                latitude: location.lat,
                longitude: location.lon,
                img: location.img,
                distance: meter_to_km(distance),
                type: 'default'
            });
        }

        uva_lugar.markers = markers;

    }


}

module.exports = {
    getNearestLocation: getNearestLocation
};