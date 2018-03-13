
$('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 3,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false
});

const loader = document.querySelector('#loader');
const loaderLabel = document.querySelector('#loader-text');
loaderLabel.textContent = 'Verificando tus credenciales... \n';
locations = JSON.parse(sessionStorage.getItem('locations'));


var option = $('<option disabled selected></option>').attr("value", "").text("Selecciona una Ubicación");
$("#ubicacion").empty().append(option);

for(var i = 0; i < locations.length; i++){
    option = $('<option></option>').attr("value", locations[i].id).text(locations[i].name);
    $("#ubicacion").append(option);
}

$(document).ready(function() {
    $('#dropdown1').change(function() {
        alert($(this).val());
    });
});


loader.style.visibility = 'hidden';
loaderLabel.textContent = 'Cargando...';


uvaObject = {
    "title": undefined,
    "phrase": undefined,
    "type": "special",
    "info": {

        "info_link": undefined
    },
    "img": undefined,
    "dateUp": undefined,
    "dateDown": undefined,
    "loc": undefined,
    "loc_name": undefined
};


img = { link: undefined };
miniaturaImg = { link: undefined };

document.querySelector('#submit').addEventListener('click', function () {

    loader.style.visibility = 'visible';

    var miniatura;

    miniatura = document.querySelector('#img-miniatura');


    var elementos = {
        titulo: document.querySelector('#titulo').value.trim(),
        frase: document.querySelector('#frase').value,
        fechaSubida: Date.parse(document.querySelector('#fecha-subida').value),
        fechaBajada: Date.parse(document.querySelector('#fecha-bajada').value),
        ubicacion: document.querySelector('#ubicacion').value,
        link: document.querySelector('#link').value,
        ubicacion_name: document.querySelector('#ubicacion').selectedOptions[0].text
    };

    loaderLabel.textContent = 'Verificando los datos...';


    const camposValidados = validarCampos(elementos);

    if(!camposValidados.status){
        displayAlert(camposValidados.message);
        return
    }


    uvaObject.title = elementos.titulo;
    uvaObject.type = "special";
    uvaObject.dateUp = elementos.fechaSubida;
    uvaObject.dateDown = elementos.fechaBajada;
    uvaObject.loc = elementos.ubicacion;
    uvaObject.info.info_link = elementos.link;
    uvaObject.phrase = elementos.frase;
    uvaObject.loc_name = elementos.ubicacion_name;



    loaderLabel.textContent = 'Cargando imagenes...';

    subirImagen(miniatura, "Miniatura", miniaturaImg);


});

function validarCampos(campos){

    fechaMinima = Date.parse("January 1, 2018");
    fechaMaxima = Date.parse("January 1, 2019");

    if(campos.titulo === ""){ return({status: false, message: "El campo 'titulo' está vacio."}) }
    else if(campos.fechaSubida < fechaMinima || campos.fechaSubida > fechaMaxima || isNaN(campos.fechaSubida)){ return({status: false, message: "Fecha incorrecta"})}
    else if(campos.fechaBajada < fechaMinima || campos.fechaBajada > fechaMaxima || isNaN(campos.fechaBajada)){ return({status: false, message: "Fecha incorrecta"})}
    else if(campos.ubicacion === ""){return({status: false, message: "Falta seleccionar la ubicación en la que aparecera el evento"})}
    else { return({status: true}) }

}

function subirImagen(path, imageName, urlPath){

    if(path.files[0] === undefined){
        response = displayConfirm('No hay imagen seleccionada. ¿Deseas continuar?');
        if(response){
            urlPath.link = '';
            sendToUVA()
        }
        else{
            return {status: false, message: "No hay " + imageName}
        }

    }

    var settings = {

        "async": true,
        "crossDomain": true,
        "url": "https://api.imgur.com/3/image",
        "method": "POST",
        "headers": {
            "Authorization": "Client-ID 4409588f10776f7"
        },
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": path.files[0]
    };

    $.ajax(settings).done(function (response) {

        response = JSON.parse(response);
        const validatedResponse = validateResponse(response);
        if(validatedResponse.status){
            urlPath.link = validatedResponse.link;
            sendToUVA();
            return
        }
        else{

            return {status: false, message: validatedResponse.message}
        }

    });

}



function validateResponse(response){
    if(response.success){
        return{status: true, link: response.data.link}
    }
    else{
        return{status: false, message: "Error al subir la imagen"}
    }
}

function sendToUVA() {
    uvaObject.img = miniaturaImg.link;

    if(typeof uvaObject.img === "undefined" ){


    }else{
        loaderLabel.textContent = 'Guardando en la base de datos';
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://uva-api.herokuapp.com/event",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "x-auth": sessionStorage.getItem('x-auth'),
                "Cache-Control": "no-cache"
            },
            "processData": false,
            "data": JSON.stringify(uvaObject)
        };


        $.ajax(settings).done(function (response) {
            loader.style.visibility = 'hidden';
            location.href = "./select-event.html"
        });


    }

}

function displayAlert(alertMessage){
    loader.style.visibility = 'hidden';
    alert(alertMessage);
}

function displayConfirm(confirmMessage){
    loader.style.visibility = 'hidden';
    return confirm(confirmMessage);
}