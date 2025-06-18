document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("LoginForm").addEventListener("submit", function(event){
        event.preventDefault();

        const email = document.getElementById('email').value;
        const passwd = document.getElementById('pass').value;

        validateUserData(email, passwd);
    });
});


async function validateUserData(email, password) {
    const passwdError_1 = document.getElementById('passwdError_1');
    const emailError = document.getElementById('emailError');

    try {
        const response = await fetch('http://192.168.50.67:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        // Ocultar errores inicialmente
        passwdError_1.style.display = 'none';
        emailError.style.display = 'none';

        if (!response.ok) {
            throw new Error(data.message || 'Error en la solicitud');
        }

        // Verificar códigos de respuesta
        if (data.message === 'COI') {
            passwdError_1.textContent = 'La contraseña es incorrecta';
            passwdError_1.style.display = 'block';
        } else if (data.message === 'UNE') {
            emailError.textContent = 'El correo no existe';
            emailError.style.display = 'block';
        } else if (data.message === 'ACC') {
            // Redirigir si hay token
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                // Guardar también los datos del usuario si los necesitas
                if (data.user) {
                    localStorage.setItem('userData', JSON.stringify(data.user));
                }
                console.log('Inicio de sesión exitoso:', data);
                window.location.href = 'paginaprin.html';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        // Mostrar error genérico si falla la conexión
        passwdError_1.textContent = 'Error al conectar con el servidor';
        passwdError_1.style.display = 'block';
    }
}