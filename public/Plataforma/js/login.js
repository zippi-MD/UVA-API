const loader = document.querySelector('#loader');
const alert = document.querySelector('#alert');
loader.style.visibility = 'hidden';
alert.style.visibility = 'hidden';
document.querySelector('#submit').addEventListener('click', function () {

    loader.style.visibility = 'visible';

    const elementos = {
        usuario: document.querySelector('#usuario').value.trim(),
        contrasena: document.querySelector('#contrasena').value
    };

    respuesta_validacion = validarCampos(elementos);

    if(!respuesta_validacion.status){
        loader.style.visibility = 'hidden';
        sendAlert(respuesta_validacion.message);
        return
    }


    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://uva-api.herokuapp.com/users/login",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        },
        "processData": false,
        "data": "{\"user\": \""+elementos.usuario+"\",\"password\": \""+elementos.contrasena+"\"}"
    };

    $.ajax(settings).done(function (data, status, xhr) {

        sessionStorage.setItem("usuario", elementos.usuario);
        sessionStorage.setItem("x-auth", xhr.getResponseHeader('x-auth'));
        let locations = JSON.stringify(data.locations);
        sessionStorage.setItem("locations", locations);
        location.href = "./events/select-event.html"

    }).fail(function () {
        loader.style.visibility = 'hidden';
        sendAlert('Lo sentimos, el nombre de usuario o la contraseña son incorrectos');
    });

});


function validarCampos(campos){

    if(campos.usuario === ""){ return({status: false, message: "El campo 'usuario' está vacio."}) }
    else if(campos.contrasena === ""){return({status: false, message: "El campo 'contraseña' está vacio."})}
    else { return({status: true}) }

}

function sendAlert(text){
    $('#alert-text').text(text);
    $('#alert').removeClass('uk-animation-slide-top');
    alert.style.visibility = 'visible';
}

$('#alert-close').click(function(){
   $('#alert').addClass('uk-animation-slide-top uk-animation-reverse');
});