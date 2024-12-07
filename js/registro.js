const userType = document.getElementById('userType');
const dynamicFields = document.getElementById('dynamicFields');
const registrationForm = document.getElementById('registrationForm');
let specialties = [];
let certifications = [];
let studies = [];

// Este código maneja la lógica para mostrar los campos dinámicos según el tipo de usuario
userType.addEventListener('change', () => {
    dynamicFields.innerHTML = '';  // Limpiar campos dinámicos
    dynamicFields.classList.add('hidden'); // Ocultar los campos inicialmente

    if (userType.value === 'chefPro' || userType.value === 'chefAf') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label for="specialties">Especialidades:</label>
                <input type="text" id="specialties" name="specialties" placeholder="Agrega una especialidad">
                <button type="button" id="addSpecialty">Agregar especialidad</button>
            </div>
            <div class="form-group">
                <label for="certifications">Certificaciones:</label>
                <input type="text" id="certifications" name="certifications" placeholder="Agrega una certificación">
                <button type="button" id="addCertification">Agregar certificación</button>
            </div>
        `;
    } else if (userType.value === 'critico') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label for="studies">Estudios:</label>
                <input type="text" id="studies" name="studies" placeholder="Agrega un estudio">
                <button type="button" id="addStudy">Agregar estudio</button>
            </div>
        `;
    }

    if (userType.value) {
        dynamicFields.classList.remove('hidden');
    }
});

function checkPasswords() {
    const password = document.getElementById('passwd').value;
    const confirmPassword = document.getElementById('passwd_v').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return false; // Evita el envío del formulario si las contraseñas no coinciden
    }
    return true; // Permite el envío del formulario si las contraseñas coinciden
}

// Lógica para agregar especialidades, certificaciones, y estudios
document.addEventListener('click', function (event) {
    if (event.target.id === 'addSpecialty') {
        const specialtyInput = document.getElementById('specialties');
        if (specialtyInput.value.trim() !== '') {
            specialties.push(specialtyInput.value.trim()); // Guardar especialidad
            specialtyInput.value = ''; // Limpiar el campo
        }
    } else if (event.target.id === 'addCertification') {
        const certificationInput = document.getElementById('certifications');
        if (certificationInput.value.trim() !== '') {
            certifications.push(certificationInput.value.trim()); // Guardar certificación
            certificationInput.value = ''; // Limpiar el campo
        }
    } else if (event.target.id === 'addStudy') {
        const studyInput = document.getElementById('studies');
        if (studyInput.value.trim() !== '') {
            studies.push(studyInput.value.trim()); // Guardar estudio
            studyInput.value = ''; // Limpiar el campo
        }
    }
});

// Lógica para el envío del formulario
registrationForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevenir el envío

    if (!checkPasswords()) {
        return; // Detener si las contraseñas no coinciden
    }

    // Obtener los valores del formulario
    const formData = new FormData(registrationForm);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Dividir el campo "nombre" en nombre, apellidoP y apellidoM
    const fullName = data.name.split(' '); // Suponiendo que los nombres están separados por espacios
    data.nombre = fullName[0] || ''; // Primer nombre
    data.apellidoP = fullName[1] || ''; // Primer apellido
    data.apellidoM = fullName[2] || ''; // Segundo apellido (si existe)

    // Renombrar campos según lo solicitado
    data.email = data.email || '';
    data.telefono = data.telefono || '';
    data.contrasena = data.passwd || '';
    data.tipoUsuario = data.userType || '';
    data.biografia = data.bio || '';

    // Remover campos no deseados
    delete data.name;
    delete data.passwd;
    delete data.passwd_v;
    delete data.userType;
    delete data.bio;

    // Agregar las especialidades, certificaciones o estudios guardados
    if (userType.value === 'chefPro' || userType.value === 'chefAf') {
        data.specialties = specialties;
        data.certifications = certifications;
    } else if (userType.value === 'critico') {
        data.studies = studies;
    }

    // Mostrar los datos procesados en la consola (para pruebas)
    console.log(data);

    // Determinar la ruta basada en el tipo de usuario
    let url = '';
    if (userType.value === 'chefPro') {
        url = 'http://25.61.139.76:3000/chef-pro';
    } else if (userType.value === 'chefAf') {
        url = 'http://25.61.139.76:3000/chef-af';
    } else if (userType.value === 'critico') {
        url = 'http://25.61.139.76:3000/critico';
    } else {
        url = 'http://25.61.139.76:3000/register-consumidor';
    }

    // Enviar los datos al backend usando fetch
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((result) => {
        console.log('Datos enviados exitosamente:', result);
        alert('Formulario enviado correctamente.');
    })
    .catch((error) => {
        console.error('Error al enviar los datos:', error);
        alert('Hubo un problema al enviar los datos.');
    });
});
