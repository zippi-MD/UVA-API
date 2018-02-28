const loader = document.querySelector('#loader');
const loaderLabel = document.querySelector('#loader-text');
loader.style.visibility = 'hidden';

document.querySelector('#submit').addEventListener('click', function () {

    loader.style.visibility = 'visible';

    const elementos = {
        usuario: document.querySelector('#usuario').value.trim(),
        contrasena: document.querySelector('#contrasena').value
    };

    respuesta_validacion = validarCampos(elementos);

    if(!respuesta_validacion.status){
        alert(respuesta_validacion.message);
        loader.style.visibility = 'hidden';
        return
    }


    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://uva-api.herokuapp.com/users/login",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Postman-Token": "dde610c2-9eff-41e1-84d4-c756c5e32cdc"
        },
        "processData": false,
        "data": "{\"user\": \""+elementos.usuario+"\",\"password\": \""+elementos.contrasena+"\"}"
    };

    $.ajax(settings).done(function (data, status, xhr) {

        sessionStorage.setItem("usuario", elementos.usuario);
        sessionStorage.setItem("x-auth", xhr.getResponseHeader('x-auth'));
        sessionStorage.setItem("locations", data.locations);

        location.href = "./events/select-event.html"
    }).fail(function () {
        loader.style.visibility = 'hidden';
        alert('No se encontro al usuario o la contraseña es incorrecta');
    });

});


function validarCampos(campos){

    if(campos.usuario === ""){ return({status: false, message: "El campo 'usuario' está vacio."}) }
    else if(campos.contrasena === ""){return({status: false, message: "El campo 'contraseña' está vacio."})}
    else { return({status: true}) }

}