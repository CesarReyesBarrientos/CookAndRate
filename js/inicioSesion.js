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
        const response = await fetch(`http://192.168.50.209:3000/login?Email=${email}&password=${password}`);
        const data = await response.json();

        if (data.message === "COI") {
            passwdError_1.textContent = 'Las constraseña es incorrecta';
            passwdError_1.style.display = 'block';
            emailError.textContent = '';
            emailError.style.display = 'none';
        } else if (data.message === "UNE") {
            emailError.textContent = 'El correo no existe';
            emailError.style.display = 'block';
            passwdError_1.textContent = '';
            passwdError_1.style.display = 'none';
        }else if (data.message === "ACC") {
            console.log(data.message);
            passwdError_1.textContent = '';
            passwdError_1.style.display = 'none';
            emailError.textContent = '';
            emailError.style.display = 'none';
            // Logica para redirigir
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                window.location.href = 'paginaprin.html';
            }
        }
    } catch (error) {
        alert(error.message);
    }
} 