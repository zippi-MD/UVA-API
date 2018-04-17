$('#fecha-subida').pickadate({
    format: 'mmmm dd, yyyy'
});
$('#fecha-bajada').pickadate({
    format: 'mmmm dd, yyyy'
});

const loader = document.querySelector('#loader');
$('#alert').hide();

const loaderLabel = document.querySelector('#loader-text');
loaderLabel.textContent = 'Verificando tus credenciales... \n';

var locations = JSON.parse(sessionStorage.getItem('locations'));

var option = $('<option disabled selected></option>').attr("value", "").text("Selecciona una Ubicación");
$("#ubicacion").empty().append(option);


for(var i = 0; i < locations.length; i++){
    option = $('<option></option>').attr("value", JSON.stringify(locations[i])).text(locations[i].name);
    $("#ubicacion").append(option);
}

$(document).ready(function() {
    $('#ubicacion').change(function() {

        let place = JSON.parse($(this).val()).locations;

        var option = $('<option disabled selected></option>').attr("value", "").text("Selecciona un lugar (Opcional)");
        $("#lugar").empty().append(option);

        for(var i = 0; i < place.length; i++){
            option = $('<option></option>').attr("value", JSON.stringify(place[i])).text(place[i].title);
            $("#lugar").append(option);
        }
    });
});


loader.style.visibility = 'hidden';
loaderLabel.textContent = 'Cargando...';


uvaObject = {
    "title": undefined,
    "phrase": undefined,
    "type": "simple",
    "info": {
        "description": undefined,
        "img": undefined,
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
    var principal;

    miniatura = document.querySelector('#img-miniatura');
    principal = document.querySelector('#img-principal');


    var elementos = {
        titulo: document.querySelector('#titulo').value.trim(),
        frase: document.querySelector('#frase').value,
        descripcion: document.querySelector('#info').value,
        fechaSubida: Date.parse(document.querySelector('#fecha-subida').value),
        fechaBajada: Date.parse(document.querySelector('#fecha-bajada').value),
        ubicacion: document.querySelector('#ubicacion').value,
        link: document.querySelector('#link').value,
        ubicacion_name: document.querySelector('#ubicacion').selectedOptions[0].text,
        lugar: document.querySelector('#lugar').value
    };

    loaderLabel.textContent = 'Verificando los datos...';


    const camposValidados = validarCampos(elementos);

    if(!camposValidados.status){
        sendAlert(camposValidados.message);
        return
    }


    uvaObject.title = elementos.titulo;
    uvaObject.type = "simple";
    uvaObject.info.description = elementos.descripcion;
    uvaObject.dateUp = elementos.fechaSubida;
    uvaObject.dateDown = elementos.fechaBajada;
    uvaObject.loc = JSON.parse(elementos.ubicacion).id;
    uvaObject.info.info_link = elementos.link;
    uvaObject.phrase = elementos.frase;
    uvaObject.loc_name = elementos.ubicacion_name;

    if(elementos.lugar !== ''){
        uvaObject.info.location = JSON.parse(elementos.lugar);
    }



    loaderLabel.textContent = 'Cargando imagenes...';

    uploadImage('tarjeta del evento', uvaObject, uploadMiniatura);
    uploadImage('imagen del evento', uvaObject.info, uploadPrincipal)

});

function uploadImage(location, imagePath, callback) {

    if(typeof imagePath.img === 'undefined'){

        if(confirm("No se ha seleccionado una imagen para " + location + " ¿Desea continuar?")){
            imagePath.img = '';
            sendToUVA();
            return
        }
        else {
            loader.style.visibility = "hidden";
            return
        }

    }
    callback();
}

function validarCampos(campos){

    fechaMinima = Date.parse("January 1, 2018");
    fechaMaxima = Date.parse("January 1, 2019");

    if(campos.titulo === ""){ return({status: false, message: "El campo 'titulo' está vacio."}) }
    else if(campos.fechaSubida < fechaMinima || campos.fechaSubida > fechaMaxima || isNaN(campos.fechaSubida)){ return({status: false, message: "Fecha incorrecta"})}
    else if(campos.fechaBajada < fechaMinima || campos.fechaBajada > fechaMaxima || isNaN(campos.fechaBajada)){ return({status: false, message: "Fecha incorrecta"})}
    else if(campos.ubicacion === ""){return({status: false, message: "Falta seleccionar la ubicación en la que aparecera el evento"})}
    else { return({status: true}) }

}

function sendToUVA() {

    if(typeof uvaObject.img === "string" && typeof uvaObject.info.img === "string"){

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


function sendAlert(text){
    loader.style.visibility = 'hidden';
    $('#alert-text').text(text);
    $('#alert').removeClass('uk-animation-slide-top');
    $('#alert').show();
}

$('#alert-close').click(function(){
    $('#alert').addClass('uk-animation-slide-top uk-animation-reverse');
    $('#alert').hide();
});

// /* DropArea Miniatura */
var previewMiniaturaNode = document.querySelector("#template-miniatura");
previewMiniaturaNode.id = "";
var previewMiniaturaTemplate = previewMiniaturaNode.parentNode.innerHTML;

var miniaturaDropzone = new Dropzone("div#miniatura", {
    url: "https://api.imgur.com/3/image",
    paramName: "image",
    maxFiles: 1,
    acceptedFiles: "image/*",
    method: "post",
    headers:{
        'Cache-Control': null,
        'X-Requested-With': null,
        'Authorization': "Client-ID 4409588f10776f7"
    },
    thumbnailWidth: 80,
    thumbnailHeight: 80,
    parallelUploads: 20,
    previewTemplate: previewMiniaturaTemplate,
    autoQueue: false,
    previewsContainer: "#previews-miniatura",
    clickable: ".fileinput-button-miniatura"
});

miniaturaDropzone.on("addedfile", function(file) {
    uvaObject.img = true;
    $("#miniatura-drop-area").hide();
    if (this.files.length > 1) {
        this.removeFile(this.files[0]);
    }
});

miniaturaDropzone.on("removedfile", function (file){
    uvaObject.img = true;
    $("#miniatura-drop-area").show();
});

miniaturaDropzone.on("success", function(file, serverResponse) {
    uvaObject.img = serverResponse.data.link;
    sendToUVA();

});

previewMiniaturaNode.parentNode.removeChild(previewMiniaturaNode);


function uploadMiniatura() {
    console.log('Uploading Miniatura');
    miniaturaDropzone.enqueueFiles(miniaturaDropzone.getFilesWithStatus(Dropzone.ADDED));
}


// /* -- End DropArea Miniatura */

// /* DropArea Principal */
var previewPrincipalNode = document.querySelector("#template-principal");
previewPrincipalNode.id = "";
var previewPrincipalTemplate = previewPrincipalNode.parentNode.innerHTML;

var principalDropzone = new Dropzone("div#principal", {
    url: "https://api.imgur.com/3/image",
    paramName: "image",
    maxFiles: 1,
    acceptedFiles: "image/*",
    method: "post",
    headers:{
        'Cache-Control': null,
        'X-Requested-With': null,
        'Authorization': "Client-ID 4409588f10776f7"
    },
    thumbnailWidth: 80,
    thumbnailHeight: 80,
    parallelUploads: 20,
    previewTemplate: previewPrincipalTemplate,
    autoQueue: false,
    previewsContainer: "#previews-principal",
    clickable: ".fileinput-button-principal"
});

principalDropzone.on("addedfile", function(file) {
    uvaObject.info.img = true;
    $("#principal-drop-area").hide();
    if (this.files.length > 1) {
        this.removeFile(this.files[0]);
    }
});

principalDropzone.on("removedfile", function (file){
    uvaObject.img = undefined;
    $("#principal-drop-area").show();
});

principalDropzone.on("success", function(file, serverResponse) {
    uvaObject.info.img = serverResponse.data.link;
    sendToUVA();
});

previewPrincipalNode.parentNode.removeChild(previewPrincipalNode);

function uploadPrincipal() {
    console.log('Uploading Principal');
    principalDropzone.enqueueFiles(principalDropzone.getFilesWithStatus(Dropzone.ADDED));
}

// /* -- End DropArea Principal */

