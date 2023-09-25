//Validacion de formulario para la creacion de usuarios en el sistema
const form = document.getElementById('form');
const nombre = document.getElementById('nombre');
const apellido = document.getElementById('apellido');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');
const telefono = document.getElementById('telefono');
const direccion = document.getElementById('direccion');
const boton = document.getElementById('boton');

boton.addEventListener('click', e => {
    if(nombre.value === '' || apellido.value === '' || email.value === '' || password.value === '' || password2.value === '' || telefono.value === '' || direccion.value === ''){
        alert('Por favor llene todos los campos');
    }else{
        if(password.value !== password2.value){
            alert('Las contraseñas no coinciden');
        }else{
            form.submit();
        }
    }
})