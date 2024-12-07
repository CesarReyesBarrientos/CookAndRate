document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btn_1').addEventListener('click', function() {
        fetchUsuarios();
    }
    );

    document.getElementById("userForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Evitar el envío del formulario
    
        // Obtener los valores del formulario
        const fullName = document.getElementById("fullName").value;
        const password = document.getElementById("password").value;
    
        // Separar el nombre completo en nombre, apellido paterno y apellido materno
        const [nombre, apellidoP, apellidoM] = fullName.split(" ");

        // Llamar a la función que valida si el usuario y la contraseña son correctos
        validateUserData(nombre, apellidoP, apellidoM, password);
    });
    

    async function validateUserData(nombre, apellidoP, apellidoM, password) {
    try {
        const response = await fetch(`https://25.61.139.76:3000/login?nombre=${nombre}&apellidoP=${apellidoP}&apellidoM=${apellidoM}&password=${password}`);
        
        if (!response.ok) {
            throw new Error('Usuario no encontrado o contraseña incorrecta');
        }

        const user = await response.json();
        console.log(user);
        
        // Comparar la contraseña con la que devuelve el servidor
        alert("¡Contraseña correcta! Bienvenido.");
        fetchUserInfo(nombre, apellidoP, apellidoM);
    } catch (error) {
        alert(error.message);
    }
}
    

});

async function fetchUsuarios() {
    try {
        const response = await fetch('http://25.61.139.76:3000/read-users');
        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de usuarios.');
        }
        const responseData = await response.json();
        const usuariosDiv = document.getElementById('usuarios');
        usuariosDiv.innerHTML = '';
                
        // Access the 'datos' array from the response
        const usuarios = responseData.datos;
                
        usuarios.forEach(usuario => {
            const usuarioDiv = document.createElement('div');
            usuarioDiv.className = 'usuario';

            usuarioDiv.innerHTML = `
                <h2>${usuario.Nombre} ${usuario['Apellido P']} ${usuario['Apellido M']}</h2>
                <img src="http://25.61.139.76:3000/img/${usuario.imagen}" alt="Imagen de ${usuario.Nombre}" class="user-image">
                <p><strong>ID de Usuario:</strong> ${usuario.ID_User}</p>
                <p><strong>Email:</strong> ${usuario.Email}</p>
                <p><strong>Teléfono:</strong> ${usuario.Telefono}</p>
                <p><strong>Biografia:</strong> ${usuario.Biografia} </p>
                <p><strong>Redes Sociales</strong> ${usuario.RedesSociales} </p>
                <p><strong>Tipo de Usuario:</strong> ${usuario['Tipo usuario']}</p>
                <p><strong>Estado:</strong> ${usuario.Estado}</p>
            `;
            usuariosDiv.appendChild(usuarioDiv);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchUserInfo(nombre, apellidoP, apellidoM) {
    try {
        // Construir la URL con los parámetros de consulta
        const url = `https://25.61.139.76:3000/find-user-data?nombre=${nombre}&apellidoP=${apellidoP}&apellidoM=${apellidoM}`;
        const response = await fetch(url);

        if (response.ok) {
            const usuario = await response.json();

            // Renderizar la información del usuario
            const container = document.getElementById('user-info');
            container.innerHTML = '';
            container.innerHTML = `
                <h2>${usuario.Nombre} ${usuario.ApellidoP} ${usuario.ApellidoM}</h2>
                <img src="https://25.61.139.76:3000/img/${usuario.imagen}" alt="Imagen de ${usuario.Nombre}" class="user-image" style="width: 150px; border-radius: 50%; margin: 10px 0;">
                <p><strong>ID de Usuario:</strong> ${usuario.ID_User}</p>
                <p><strong>Email:</strong> ${usuario.Email}</p>
                <p><strong>Teléfono:</strong> ${usuario.Telefono}</p>
                <p><strong>Biografía:</strong> ${usuario.Biografia} </p>
                
                <p><strong>Redes Sociales:</strong></p>
                <ul>
                    ${usuario.RedesSociales.map(red => {
                        const redSocial = Object.entries(red)[0];
                        let url = redSocial[1];
                        if (!/^https?:\/\//.test(url)) {
                            url = 'https://' + url;
                        }

                        return `<li><a href="${url}" target="_blank">${redSocial[0]}</a></li>`;
                    }).join('')}
                </ul>

                <p><strong>Tipo de Usuario:</strong> ${usuario['Tipo usuario']}</p>
                <p><strong>Estado:</strong> ${usuario.Estado}</p>
            `;
        } else {
            // Manejar el caso en que el usuario no sea encontrado
            const container = document.getElementById('user-info');
            container.innerHTML = `<p>Usuario no encontrado.</p>`;
        }
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        const container = document.getElementById('user-info');
        container.innerHTML = `<p>Error al obtener la información del usuario.</p>`;
    }
}
