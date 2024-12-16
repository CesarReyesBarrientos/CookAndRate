const menuButton = document.getElementById("menuButton");
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");
const header = document.getElementById("mainHeader");
let userResult;
let chefResult; 

let recetasChefResult; 
let usuarioChefResult;

let foodRResult;
const params = new URLSearchParams(window.location.search);
const userid = params.get('id');

window.onload = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión.');
        window.location.href = 'index.html';
    } else {
        getUserData(token)
            .then(() => {
                updateUserInterface();
                // console.log(userResult); //Logeado
                // console.log(chefResult);
                let followBtn = document.querySelector('.follow');
                const user = userResult.ID_User;
                const chef = usuarioChefResult;
                if (followBtn && chef && user) {
                    // // Verificar si el usuario ya sigue al chef
                    const isFollowing = chefResult.Seguidores.includes(user);
                    if (isFollowing) {
                        followBtn.textContent = 'Unfollow';
                        followBtn.classList.remove('follow');
                        followBtn.classList.add('unfollow');
                        console.log("Unfollow");
                    } else {
                        followBtn.textContent = 'Follow';
                        followBtn.classList.remove('unfollow');
                        followBtn.classList.add('follow');
                        console.log("Follow");
                    }
                }
            })
            .catch(error => {
                console.error('Error al obtener datos de usuario:', error);
            });
            //getRecetas();
    }
};

const parseJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
};

const getUserData = (token) => {
    return new Promise((resolve, reject) => {
        const userData = parseJWT(token);
        if (userData) {
            //console.log('Datos del usuario', userData.userId);
            const data = {};
            data.userId = userData.userId;
            fetch('http://25.61.139.76:3000/find-user-by-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then((response) => response.json())
            .then((result) => {
                userResult = result.user;
                if (result.chef) {
                    // chefResult = result.chef;
                    recetasChefResult = result.recetas;
                } else {
                    foodRResult = result.foodr;
                }
                resolve();
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
        } else {
            console.error('Token inválido.');
            reject('Token inválido');
        }
    });
};

function updateUserInterface() {
    // Función para actualizar la interfaz con los datos cargados
    if (userResult) {
        // Ejemplo: actualizar nombre de usuario
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = userResult.Nombre + " " + userResult.ApellidoP + " " + userResult.ApellidoM;
        }
        
        // Ejemplo: actualizar imagen de perfil
        if (userResult.imagen) {
            const userImage = `http://25.61.139.76:3000${userResult.imagen}`;
            const userIconElement = document.getElementById('userIcon');
            if (userIconElement) {
                userIconElement.src = userImage;
            }
        }
    }
}

menuButton.addEventListener("click", () => {
    menuWindow.classList.add("open");
});

closeMenu.addEventListener("click", () => {
    menuWindow.classList.remove("open");
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
}
});

const obtenerDetallesChef = (idChef) => {
    return new Promise((resolve, reject) => {
        fetch(`http://25.61.139.76:3000/chef/${idChef}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error al obtener los detalles del chef');
            }
            return response.json();
        })
        .then((result) => {
            // Almacenar resultados en variables globales
            chefResult = result.chef;
            recetasChefResult = result.recetas;
            usuarioChefResult = result.usuario;
            // console.log(chefResult);

            resolve(result);
        })
        .catch((error) => {
            console.error('Error al buscar detalles del chef:', error);
            reject(error);
        });
    });
};

// Ejemplo de uso
obtenerDetallesChef(userid).then(() => {
    const nombreUsuario = document.getElementById("user-fullname");
    const imagenUsuario = document.getElementById("userimage");
    const biographyElement = document.getElementById("user-biography");
    const followersElement = document.getElementById('followers');
    const followsElement = document.getElementById('follows');

    nombreUsuario.textContent = usuarioChefResult.Nombre+" "+usuarioChefResult.ApellidoP+" "+usuarioChefResult.ApellidoM;
    imagenUsuario.src = `http://25.61.139.76:3000/img/userIcons/${usuarioChefResult.imagen}`;
    biographyElement.textContent = usuarioChefResult.Biografia;
    followersElement.textContent = chefResult.Seguidores.length+" followers";
    followsElement.textContent = chefResult.Seguidos.length+" follows";
}).catch((error) => {
    console.error('Error:', error);
});

fetch(`http://25.61.139.76:3000/chef/${userid}`) 
  .then(response => response.json())
  .then(data => {
    const chef = data.chef;
    recetasChefResult = data.recetas;
    const usuario = data.usuario;
    setUserInteracts();
    // Imprimir cada receta
    recetasChefResult.forEach(receta => {
        const publicacionesContainer = document.querySelector('.tab-content.publicaciones');

        const publicacion = document.createElement('div');
        publicacion.classList.add('publicacion');
      publicacion.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <img style="height: 70px; width: 70px; margin-right: 10px;" src="http://25.61.139.76:3000/img/userIcons/${usuario.imagen}" alt="Foto de perfil">
          <div class="text-container">
            <h2 style="font-size: 18px; margin: 0;">${receta.Titulo_Receta}</h2>
            <p style="font-size: 14px; color: gray; margin: 2px 0;">By ${usuario.Nombre} ${usuario.ApellidoP} ${usuario.ApellidoM}</p>
          </div>
        </div>
        <div class="main-text" style="margin: 10px 0; font-size: 16px; color: #333; text-align: justify;">
          <strong>Ingredients:</strong><br>
          ${Object.entries(receta.Ingredientes)
            .map(([key, value]) => `&nbsp;&nbsp;${key}: ${value}<br>`)
            .join('')}
          <br>
          <strong>Let's cook!</strong><br>
          ${receta.Pasos_Elaboracion.map((paso, i) => `${i + 1}. ${paso}<br>`).join('')}
        </div>
         <a class="Id_receta" id="${receta.ID_Receta}">Saber más sobre la receta...</a>
      `;

      const carousel = document.createElement('div');
        carousel.classList.add('carousel');
      carousel.innerHTML = ` 
        <button class="btn left">&lt;</button>
        <div class="carousel-images">
          ${receta.Imagenes.map((imgUrl) => `<img src="http://25.61.139.76:3000/img/recetas/${imgUrl}" alt="Imagen de receta">`).join('')}
        </div>
        <button class="btn right">&gt;</button>
      `;
      const interacciones = document.createElement('div');
    interacciones.classList.add('parent-div');
      interacciones.innerHTML = ` 
        <div class="child-div">
          <!-- Corazón -->
          <i class="fa-regular fa-heart fa-xl icon-off interact" data-receta="${receta.ID_Receta}" id="int-01" style="color: #000000;"></i> 
          <i class="fa-solid fa-heart fa-xl icon-on icon-on interact_" id="int-02" data-receta="${receta.ID_Receta}" style="color: #ff0000; display: none;"></i>
          <p>Me encanta</p>
        </div>
        <div class="child-div">
          <!-- Like -->
          <i class="fa-regular fa-thumbs-up fa-xl icon-off interact" id="int-03" data-receta="${receta.ID_Receta}" style="color: #000000;"></i>
          <i class="fa-solid fa-thumbs-up fa-xl icon-on interact_" id="int-04" data-receta="${receta.ID_Receta}" style="color: #11306f; display: none;"></i>
          <p>Me gusta</p>
        </div>
        <div class="child-div">
          <!-- Dislike -->
          <i class="fa-regular fa-thumbs-down fa-xl icon-off interact" id="int-05" data-receta="${receta.ID_Receta}" style="color: #000000;"></i>
          <i class="fa-solid fa-thumbs-down fa-xl icon-on interact_" id="int-06" data-receta="${receta.ID_Receta}" style="color: #11306f; display: none;"></i>
          <p>No me gusta</p>
        </div>
      `;
        publicacion.appendChild(carousel);
        publicacion.appendChild(interacciones);
        publicacionesContainer.appendChild(publicacion);
        setUserInteracts();
        setupCarousel(carousel);
    });
  })
  .catch(error => console.error('Error al obtener los datos del chef:', error));


// Lo del carrusel
function setupCarousel(carousel) {
    const imagesContainer = carousel.querySelector('.carousel-images');
    const images = imagesContainer.querySelectorAll('img');
    const leftButton = carousel.querySelector('.btn.left');
    const rightButton = carousel.querySelector('.btn.right');
    let currentIndex = 0;
  
    function updateCarousel() {
      const totalWidth = carousel.offsetWidth;
      imagesContainer.style.transform = `translateX(-${currentIndex * totalWidth}px)`;
    }
  
    leftButton.addEventListener('click', () => {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      updateCarousel();
    });
  
    rightButton.addEventListener('click', () => {
      currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      updateCarousel();
    });
    updateCarousel();
}
  
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
  
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
  
      tab.classList.add('active');
      document.querySelector(`.${tab.dataset.target}`).classList.add('active');
    });
});

async function setUserInteracts() {
    try {
        // Obtener las recetas desde el servidor
        const recetasResponse = await fetch('http://25.61.139.76:3000/read-recetas');
        const recetasData = await recetasResponse.json();
        const recetas = recetasData.recetas;
        recetasChefResult = recetas;

        // Filtrar las recetas que tienen interacciones del usuario logueado
        const recetasFiltradas = recetas.filter(receta => 
            receta.Interacciones.some(interaccion => interaccion.ID_User === userResult.ID_User)
        );
        //console.log(recetasFiltradas);
        // Recorrer todas las recetas filtradas
        recetasFiltradas.forEach(receta => {
            // Recorrer las interacciones de cada receta
            receta.Interacciones.forEach(interaccion => {
                if (interaccion.ID_User === userResult.ID_User) {
                    const recetaID = receta.ID_Receta;
                    const tipoInteraccion = interaccion.Tipo_Interaccion;
            
                    // Mapear los tipos de interacción a los íconos
                    const mapping = {
                        'Me encanta': { off: 'int-01', on: 'int-02' },
                        'Me gusta': { off: 'int-03', on: 'int-04' },
                        'No me gusta': { off: 'int-05', on: 'int-06' }
                    };
            
                    const interaccionIcons = mapping[tipoInteraccion];
            
                    if (interaccionIcons) {
                        // Seleccionar los íconos específicos basados en data-receta
                        const iconOff = document.querySelector(`i#${interaccionIcons.off}[data-receta="${recetaID}"]`);
                        const iconOn = document.querySelector(`i#${interaccionIcons.on}[data-receta="${recetaID}"]`);
            
                        // Cambiar el estado de visibilidad de los íconos si existen
                        if (iconOff && iconOn) {
                            iconOff.style.display = 'none';
                            iconOn.style.display = 'inline-block';
                        }
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error al actualizar las interacciones del usuario:', error);
    }
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('Id_receta')) {
        const recetaId = event.target.id;
        console.log('El ID de la receta es:', recetaId);
        window.open(`nutrition.html?id=${recetaId}`, '_blank');
    }
    if (event.target.classList.contains('Id_User')) {
        const userid = event.target.id;
        console.log('El ID del usuario:', userid);
        window.open(`pagina-usuarios.html?id=${userid}`);
    }

    document.querySelectorAll('.interact').forEach(item => {
        item.addEventListener('click', registrarInteraccion);
    });

    document.querySelectorAll('.enviar_').forEach(item => {
        item.addEventListener('click', registrarCalificacion);
    });

    if (event.target.classList.contains('enviar_')) {
        const ratingSelect = event.target.closest('.parent-div').querySelector('.rating');
        const selectedRating = ratingSelect ? ratingSelect.value : null;
        console.log(`Calificación seleccionada: ${selectedRating}`);
    }
});


function cambiarIconos(iconOff) {
        let iconOn = iconOff.nextElementSibling;
        if (!iconOn || iconOn.classList.contains('icon-off')) {
            iconOn = iconOff.previousElementSibling;
        }
    
        if (iconOn) {
            // Si se activa "Me gusta" (int-03 o int-04)
            if (iconOff.id === 'int-03' || iconOff.id === 'int-04') {
                // Si "No me gusta" está activado (int-05 o int-06), desactivarlo
                const dislikeIconOn = document.getElementById('int-06');
                const dislikeIconOff = document.getElementById('int-05');
                if (dislikeIconOn && dislikeIconOn.style.display === 'inline-block') {
                    console.log("Se puso Me gusta y desactivó No me gusta");
                    dislikeIconOff.style.display = 'inline-block'; // Se pone OFF el "No me gusta"
                    dislikeIconOn.style.display = 'none';
                }
            }
    
            // Si se activa "No me gusta" (int-05 o int-06)
            if (iconOff.id === 'int-05' || iconOff.id === 'int-06') {
                // Si "Me gusta" está activado (int-03 o int-04), desactivarlo
                const likeIconOn = document.getElementById('int-04');
                const likeIconOff = document.getElementById('int-03');
                if (likeIconOn && likeIconOn.style.display === 'inline-block') {
                    console.log("Se puso No me gusta y desactivó Me gusta");
                    likeIconOff.style.display = 'inline-block'; // Se pone OFF el "Me gusta"
                    likeIconOn.style.display = 'none';
                }
            }
    
            // Mostrar el ícono ON y ocultar el OFF
            iconOff.style.display = 'none'; // Se pone OFF el icono
            iconOn.style.display = 'inline-block'; // Se pone ON el icono
        }
}

function registrarInteraccion(event) {
    if (event.target.classList.contains('interact')) {
        const interactID = event.target.id;
        const receta = event.target.getAttribute('data-receta');
        const fechaInteraccion = new Date().toISOString();
        const tiposInteraccion = {
            'int-01': 'Me encanta',
            'int-03': 'Me gusta',
            'int-05': 'No me gusta'
        };
        const descripcionInteraccion = tiposInteraccion[interactID] || interactID;

        const datos = {
            tipoInteraccion: descripcionInteraccion,
            idReceta: receta,
            idUsuario: userResult.ID_User,
            fechaInteraccion: fechaInteraccion
        };

        // Hacer la solicitud POST
        fetch('http://25.61.139.76:3000/add-interaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            setUserInteracts(); // Actualiza la UI después de la respuesta
        })
        .catch(error => {
            console.error('Error al agregar la interacción:', error);
        });

        // Después de registrar la interacción, cambia los iconos
        if (event.target.classList.contains('icon-off')) {
            cambiarIconos(event.target);
        }
    }
}

function actualizarUI() {
    const ratingValue = document.querySelector('.rating').value;  // Obtener el valor de la calificación
    const receta = document.querySelector('.rating').getAttribute('data-receta');  // Obtener la receta asociada

    // Mostrar un mensaje de confirmación o actualización de la calificación
    const mensajeConfirmacion = document.createElement('p');
    mensajeConfirmacion.textContent = `¡Calificación de ${ratingValue} estrellas enviada correctamente!`;
    document.body.appendChild(mensajeConfirmacion);

    // Aquí puedes también actualizar el valor visual de la calificación en la UI (por ejemplo, mostrar el puntaje)
    const recetaElemento = document.querySelector(`[data-receta="${receta}"]`);
    if (recetaElemento) {
        // Actualizar el icono o cualquier otro aspecto visual relacionado con la calificación
        recetaElemento.classList.add('calificado');
        // Si es necesario, actualizar el texto del puntaje
        const puntuacionElemento = recetaElemento.querySelector('.puntuacion');
        if (puntuacionElemento) {
            puntuacionElemento.textContent = `Calificación: ${ratingValue} estrellas`;
        }
    }
}

function registrarCalificacion(event) {
    if (event.target.classList.contains('enviar_')) {
        const rating = document.querySelector('.rating').value; // Obtener la calificación seleccionada
        const receta = event.target.getAttribute('data-receta');  // Obtener la receta asociada
        console.log(rating);
        const datos = {
            idReceta: receta,
            idUsuario: userResult.ID_User,
            calificacion: (rating)  // Convertir a entero la calificación
        };

        // Hacer la solicitud POST para agregar la calificación
        fetch('http://25.61.139.76:3000/add-rating', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Calificación agregada:', data); // Mostrar la respuesta
            actualizarUI(); // Función para actualizar la UI (por ejemplo, mostrar la nueva calificación)
        })
        .catch(error => {
            console.error('Error al agregar la calificación:', error);
        });
    }
}

const enviarIcon = document.querySelector('.enviar_');
const ratingSelect = document.querySelector('.rating');

document.addEventListener('click', (event) => {
    const button = event.target;
    const user = userResult.ID_User;
    const chef = userid;
    if (event.target.classList.contains('follow')) {
        // Lógica para seguir
        if (userResult.TipoUsuario === "Critico" || userResult.TipoUsuario === "Consumidor") {
            fetch('http://25.61.139.76:3000/seguir-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user, chef })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Critico " + user + " siguió a chef " + chef);
                console.log(data);
                button.classList.remove('follow');
                button.classList.add('unfollow');
                button.textContent = 'Unfollow';
                const followersElement = document.getElementById('followers');
                const currentFollowers = parseInt(followersElement.textContent);
                followersElement.textContent = `${currentFollowers + 1} followers`;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else if (userResult.TipoUsuario === "Chef Aficionado" || userResult.TipoUsuario === "Chef Profesional") {
            fetch('http://25.61.139.76:3000/seguir-chef', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user, chef })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Chef " + user + " siguió a chef " + chef);
                console.log(data);
                button.classList.remove('follow');
                button.classList.add('unfollow');
                button.textContent = 'Unfollow';
                const followersElement = document.getElementById('followers');
                const currentFollowers = parseInt(followersElement.textContent);
                followersElement.textContent = `${currentFollowers + 1} followers`;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    } else if (event.target.classList.contains('unfollow')) {
        // Determinar si es un crítico o un chef
        if (userResult.TipoUsuario === "Crítico") {
            // Llamada para que un crítico deje de seguir a un chef
            fetch('http://25.61.139.76:3000/dejar-seguir-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: user,  // ID del crítico
                    chef: chef   // ID del chef a dejar de seguir
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Critico " + user + " dejó de seguir a chef " + chef);
                console.log(data);
                // Aquí puedes agregar lógica adicional como actualizar la interfaz
                button.classList.remove('unfollow');
                button.classList.add('follow');
                button.textContent = 'Follow';
                const followersElement = document.getElementById('followers');
                const currentFollowers = parseInt(followersElement.textContent);
                followersElement.textContent = `${currentFollowers - 1} followers`;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else if (userResult.TipoUsuario === "Chef Aficionado" || userResult.TipoUsuario === "Chef Profesional") {
            // Llamada para que un chef deje de seguir a otro chef
            fetch('http://25.61.139.76:3000/dejar-seguir-chef', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: user,   // ID del chef que deja de seguir
                    chef: chef    // ID del chef a quien deja de seguir
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Chef " + user + " dejó de seguir a chef " + chef);
                console.log(data);
                button.classList.remove('unfollow');
                button.classList.add('follow');
                button.textContent = 'Follow';
                const followersElement = document.getElementById('followers');
                const currentFollowers = parseInt(followersElement.textContent);
                followersElement.textContent = `${currentFollowers - 1} followers`;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
});


