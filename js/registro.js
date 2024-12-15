const userType = document.getElementById('userType');
const dynamicFields = document.getElementById('dynamicFields');
const registrationForm = document.getElementById('registrationForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const passwdError = document.getElementById('passwdError');
const passwdError_2 = document.getElementById('passwdError_2');
const passwdError_1 = document.getElementById('passwdError_1');
let specialties = [];
let certifications = [];
let studies = [];

//------------------------------------------------------------------------------

userType.addEventListener('change', () => {
    specialties = [];
    certifications = [];
    studies = [];

    dynamicFields.innerHTML = '';  // Limpiar campos dinámicos
    dynamicFields.classList.add('hidden'); // Ocultar los campos inicialmente

    if (userType.value === 'chefPro' || userType.value === 'chefAf') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label for="specialties">Especialidades:</label>
                <input type="text" id="specialties" name="specialties" placeholder="Agrega una especialidad">
                <button type="button" id="addSpecialty">Agregar especialidad</button>
                <ul id="specialtiesList" class="list-group mt-2"></ul>
            </div>
            <div class="form-group">
                <label for="certifications">Certificaciones:</label>
                <input type="text" id="certifications" name="certifications" placeholder="Agrega una certificación">
                <button type="button" id="addCertification">Agregar certificación</button>
                <ul id="certificationsList" class="list-group mt-2"></ul>
            </div>
        `;

        // Configurar eventos para especialidades
        const specialtiesInput = document.getElementById('specialties');
        const addSpecialtyBtn = document.getElementById('addSpecialty');
        const specialtiesList = document.getElementById('specialtiesList');

        function addSpecialty() {
            const specialtyText = specialtiesInput.value.trim();
            
            if (specialtyText && !specialties.includes(specialtyText)) {
                specialties.push(specialtyText);
                
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `
                    <p>${specialtyText}</p>
                    <button style="display: block; padding: 10px 20px;
                        background-color: transparent;color: red;border: 1px solid red;
                        border-radius: 5px;cursor: pointer; margin: 0;" 
                        type="button" class="btn btn-danger btn-sm btn-per" onclick="removeSpecialty('${specialtyText}')">
                        Eliminar
                    </button>
                `;
                
                specialtiesList.appendChild(listItem);
                specialtiesInput.value = '';
            } else if (specialties.includes(specialtyText)) {
                alert('Esta especialidad ya ha sido agregada');
            }
        }

        window.removeSpecialty = function(specialty) {
            specialties = specialties.filter(s => s !== specialty);
            
            const itemToRemove = Array.from(specialtiesList.children).find(
                item => item.textContent.includes(specialty)
            );
            
            if (itemToRemove) {
                specialtiesList.removeChild(itemToRemove);
            }
        }

        addSpecialtyBtn.addEventListener('click', addSpecialty);
        specialtiesInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSpecialty();
            }
        });

        // Configurar eventos para certificaciones
        const certificationsInput = document.getElementById('certifications');
        const addCertificationBtn = document.getElementById('addCertification');
        const certificationsList = document.getElementById('certificationsList');

        function addCertification() {
            const certificationText = certificationsInput.value.trim();
            
            if (certificationText && !certifications.includes(certificationText)) {
                certifications.push(certificationText);
                
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `
                    <p>${certificationText}</p>
                    <button style="display: block; padding: 10px 20px;
                    background-color: transparent;color: red;border: 1px solid red;
                    border-radius: 5px;cursor: pointer; margin: 0;" 
                    type="button" class="btn btn-danger btn-sm" onclick="removeCertification('${certificationText}')">
                    Eliminar
                    </button>
                `;
                
                certificationsList.appendChild(listItem);
                certificationsInput.value = '';
            } else if (certifications.includes(certificationText)) {
                alert('Esta certificación ya ha sido agregada');
            }
        }

        window.removeCertification = function(certification) {
            certifications = certifications.filter(c => c !== certification);
            
            const itemToRemove = Array.from(certificationsList.children).find(
                item => item.textContent.includes(certification)
            );
            
            if (itemToRemove) {
                certificationsList.removeChild(itemToRemove);
            }
        }

        addCertificationBtn.addEventListener('click', addCertification);
        certificationsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCertification();
            }
        });

    } else if (userType.value === 'critico') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label for="studies">Estudios:</label>
                <input type="text" id="studies" name="studies" placeholder="Agrega un estudio">
                <button type="button" id="addStudy">Agregar estudio</button>
                <ul id="studiesList" class="list-group mt-2"></ul>
            </div>
        `;

        // Configurar eventos para estudios
        const studiesInput = document.getElementById('studies');
        const addStudyBtn = document.getElementById('addStudy');
        const studiesList = document.getElementById('studiesList');

        function addStudy() {
            const studyText = studiesInput.value.trim();
            
            if (studyText && !studies.includes(studyText)) {
                studies.push(studyText);
                
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `
                    <p>${studyText}</p>
                    <button style="display: block; padding: 10px 20px;
                    background-color: transparent;color: red;border: 1px solid red;
                    border-radius: 5px;cursor: pointer; margin: 0;" 
                    type="button" class="btn btn-danger btn-sm" onclick="removeStudy('${studyText}')">
                    Eliminar
                    </button>
                `;
                
                studiesList.appendChild(listItem);
                studiesInput.value = '';
            } else if (studies.includes(studyText)) {
                alert('Este estudio ya ha sido agregado');
            }
        }

        window.removeStudy = function(study) {
            studies = studies.filter(s => s !== study);
            
            const itemToRemove = Array.from(studiesList.children).find(
                item => item.textContent.includes(study)
            );
            
            if (itemToRemove) {
                studiesList.removeChild(itemToRemove);
            }
        }

        addStudyBtn.addEventListener('click', addStudy);
        studiesInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addStudy();
            }
        });
    }

    if (userType.value) {
        dynamicFields.classList.remove('hidden');
    }
});

//------------------------------------------------------------------------------

function checkPasswords() {
    passwdError_2.textContent = passwdError_1.textContent = '';
    passwdError_2.style.display = passwdError_1.style.display  = 'none';
    const password = document.getElementById('passwd').value;
    const confirmPassword = document.getElementById('passwd_v').value;
    if (password.length < 8) {
        passwdError_1.textContent = 'Las constraseñas debe tener al menos 8 caracteres';
        passwdError_1.style.display = 'block';
        if (password !== confirmPassword) {
            passwdError_2.textContent = 'Las constraseñas no coinciden';
            passwdError_2.style.display = 'block';
            return false;
        }
        return false;
    }else {
        if (password !== confirmPassword) {
            passwdError_2.textContent = 'Las constraseñas no coinciden';
            passwdError_2.style.display = 'block';
            return false;
        }
    }

    
    passwdError_2.textContent = passwdError_1.textContent = '';
    passwdError_2.style.display = passwdError_1.style.display  = 'none';
    return true;
}

async function checkEmail(email) {
    try {
        const response = await fetch('http://localhost:3000/checkEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        const data = await response.json();
        // console.log(data.available);
        return data.available; 
    } catch (error) {
        console.error('Error al comprobar el correo:', error);
        throw error;
    }
}

// Lógica para el envío del formulario
registrationForm.addEventListener('submit', function (event) {
    event.preventDefault();

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

    checkEmail(data.email)
    .then(isEmailTaken => {
        // console.log(isEmailTaken);
        if (isEmailTaken === "1") {
            emailError.textContent = 'Este correo electrónico ya está registrado';
            emailError.style.display = 'block';
        } else {
            emailError.textContent = '';
            emailError.style.display = 'none';
            if (!checkPasswords()) {
                return;
            }
            delete data.name;
            delete data.passwd;
            delete data.passwd_v;
            delete data.userType;
            delete data.bio;

            let url = '';

            // Agregar las especialidades, certificaciones o estudios guardados
            if (userType.value === 'chefPro' || userType.value === 'chefAf') {
                data.specialties = specialties;
                data.certifications = certifications;
            } else if (userType.value === 'critico') {
                data.studies = studies;
            }
            url = 'http://25.61.139.76:3000/register-user';  

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
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Error al enviar los datos:', error);
                alert('Hubo un problema al enviar los datos.');
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});