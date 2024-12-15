const menuButton = document.getElementById("menuButton");
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");
const header = document.getElementById("mainHeader");
let userResult;
let chefResult; 
let recetasChefResult; 
let foodRResult;
let recetasPagina;

function generarAnuncios(anuncios) {
    const container = document.querySelector('.publicidad-container');
    container.innerHTML = '';
    // Mezcla el array de anuncios aleatoriamente (Algoritmo de Fisher-Yates)
    const anunciosAleatorios = anuncios.sort(() => Math.random() - 0.5);
    // Selecciona solo los primeros 5 anuncios aleatorios
    const anunciosLimitados = anunciosAleatorios.slice(0, 5);
    anunciosLimitados.forEach(anuncio => {
        const anuncioDiv = document.createElement('div');
        anuncioDiv.classList.add('publicidad');
        anuncioDiv.innerHTML = `
            <div class="containerColumn">
                <div class="containerRow">
                    <div class="containerColumn">
                        <div><a href="#" target="_blank"><img class="imgPubli" src="${anuncio.ImagenPerfil}" alt=""></a></div>
                    </div>
                    <div class="containerColumn">
                        <div class="main-text">${anuncio.Titulo}</div>
                        <div class="subtext">${anuncio.NombrePromocionador}</div>
                    </div>
                </div>
                <div>
                    <p class="contenido">${anuncio.Contenido}</p>
                </div>
            </div>

            <div class="carousel">
                <button class="btn left">&lt;</button>
                <div class="carousel-images">
                    ${anuncio.Imagenes.map(imgUrl => `<img src="${imgUrl}" alt="Imagen de receta">`).join('')}
                </div>
                <button class="btn right">&gt;</button>
            </div>
        `;
        container.appendChild(anuncioDiv);
        // Configura el carrusel de este anuncio
        setupCarousel(anuncioDiv.querySelector('.carousel'));
    });
}

// Configuración del carrusel
function setupCarousel(carousel) {
    const imagesContainer = carousel.querySelector('.carousel-images');
    const images = imagesContainer.querySelectorAll('img');
    const leftButton = carousel.querySelector('.btn.left');
    const rightButton = carousel.querySelector('.btn.right');
    let currentIndex = 0;

    // Actualiza la posición del carrusel
    function updateCarousel() {
    const totalWidth = carousel.offsetWidth; // Ancho del contenedor visible
    imagesContainer.style.transform = `translateX(-${currentIndex * totalWidth}px)`;
    }

    // Botón izquierdo
    leftButton.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
    updateCarousel();
    });

    // Botón derecho
    rightButton.addEventListener('click', () => {
    currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
    updateCarousel();
    });

    // Inicializa la posición del carrusel
    updateCarousel();
}

// Abrir menú
menuButton.addEventListener("click", () => {
    menuWindow.classList.add("open");
});

// Cerrar menú
closeMenu.addEventListener("click", () => {
    menuWindow.classList.remove("open");
});

// Detectar scroll y agregar sombra al header
window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
}
});

window.onload = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión.');
        window.location.href = 'index.html';
    } else {
        getUserData(token)
            .then(() => {
                // Aquí puedes usar las variables
                // console.log('User Result:', userResult);
                // console.log('Chef Result:', chefResult);
                // console.log('Recetas Chef:', recetasChefResult);
                // console.log('Food R Result:', foodRResult);
                
                updateUserInterface();
            })
            .catch(error => {
                console.error('Error al obtener datos de usuario:', error);
            });
            getRecetas();
    }
};

const getRecetas = async () => {
    try {
        const response = await fetch('http://25.61.139.76:3000/read-recetas');
        if (response.ok) {
            const data = await response.json();
            //console.log(data);
        } else {
            console.error('Error en la respuesta:', response.statusText);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error.message);
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

const getChefData = async (userId) => {
    try {
        // Hacemos una solicitud POST al back-end
        const response = await fetch('http://25.61.139.76:3000/find-chef-by-user-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId })  // Enviamos el userId en el cuerpo
        });

        if (response.avaible === "1") {
            const data = await response.json();  // Convertimos la respuesta a JSON
            //console.log("INFORMACION CHEFS SEGUIDOS:"+data);
        } else {
            console.error('Error en la respuesta:', response.statusText);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error.message);
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
                    chefResult = result.chef;
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
  
function generarPublicaciones(recetas, chefs, users) {
    const publicacionesContainer = document.querySelector('.publicaciones');
    publicacionesContainer.innerHTML = ''; 
    const recetasAleatorios = recetas.sort(() => Math.random() - 0.5);
    // Limitar a las primeras 10 recetas
    const recetasLimitadas = recetas.slice(0, 5);

    recetasLimitadas.forEach(receta => {
        // Encontrar al chef correspondiente
        const chef = chefs.find(c => c.Id_Chef === receta.Id_Chef);
        const user = chef ? users.find(u => u.ID_User === chef.ID_User) : null;

        const chefImage = user
            ? `http://25.61.139.76:3000/img/userIcons/${user.imagen}`
            : 'http://25.61.139.76:3000/img/userIcons/default.png';
        const chefName = user ? `${user.Nombre} ${user.ApellidoP}` : 'Chef Desconocido';
        const publicacion = document.createElement('div');
        publicacion.classList.add('publicacion');

        publicacion.innerHTML = `
            <div class="containerColumn">
                <div class="containerRow">
                    <div class="containerColumn">
                        <div><a href="#" target="_blank"><img class="imgPubli" src="${chefImage}" alt="Foto de perfil"></a></div>
                    </div>
                    <div class="containerColumn">
                        <div class="main-text">${receta.Titulo_Receta}</div>
                        <div class="subtext">${chefName}</div>
                    </div>
                </div>
                <div>
                    <strong class="contenido">Ingredientes:</strong><br>
                    ${Object.entries(receta.Ingredientes).map(([key, value]) => `&nbsp;&nbsp;${key}: ${value}<br>`).join('')}
                    <br>
                    <strong class="contenido">¡A cocinar!</strong><br>
                    ${receta.Pasos_Elaboracion.map((paso, i) => `&nbsp;&nbsp;${i + 1}. ${paso}<br>`).join('')}
                </div>
            </div>
            <div class="carousel">
                <button class="btn left">&lt;</button>
                <div class="carousel-images">
                    ${receta.Imagenes.map(imgUrl => `<img src="${imgUrl}" alt="Imagen de receta">`).join('')}
                </div>
                <button class="btn right">&gt;</button>
            </div>
        `;
        publicacionesContainer.appendChild(publicacion);

        setupCarousel(publicacion.querySelector('.carousel'));
    });
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

async function fetchCombinedPublications() {
    try {
        // Obtener anuncios
        const anunciosResponse = await fetch('http://25.61.139.76:3000/read-anuncios');
        const anunciosData = await anunciosResponse.json();
        const anuncios = anunciosData.anuncios;

        // Obtener recetas
        const recetasResponse = await fetch('http://25.61.139.76:3000/read-recetas');
        const recetasData = await recetasResponse.json();
        const recetas = recetasData.recetas;
        

        // Obtener chefs
        const chefsResponse = await fetch('http://25.61.139.76:3000/read-chefs');
        const chefsData = await chefsResponse.json();
        const chefs = chefsData.chefs;

        // Obtener usuarios
        const usersResponse = await fetch('http://25.61.139.76:3000/read-users');
        const usersData = await usersResponse.json();
        const users = usersData.users;
        // console.log(recetas);
        // Combinar anuncios y recetas
        const combinedPublications = [
            ...anuncios.map(anuncio => ({
                type: 'anuncio',
                data: anuncio
            })),
            ...recetas.map(receta => {
                // Buscar el chef para esta receta
                const chef = chefs.find(c => c.ID_Chef === receta.ID_Chef);
                // console.log(chef);
                // Buscar el usuario correspondiente al chef
                const user = chef ? users.find(u => u.ID_User === chef.ID_User) : null;
                // console.log(user);

                return {
                    type: 'receta',
                    data: receta,
                    chef: chef,
                    user: user
                };
            })
        ];

        // Mezclar aleatoriamente
        const randomPublications = combinedPublications.sort(() => Math.random() - 0.5);

        // Limitar a 10 publicaciones
        const limitedPublications = randomPublications.slice(0, 10);

        // Generar publicaciones
        generarPublicacionesCombinadas(limitedPublications);
        setUserInteracts();
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}


function generarPublicacionesCombinadas(publications) {
    const publicacionesContainer = document.querySelector('.publicaciones');
    publicacionesContainer.innerHTML = ''; // Limpiar el contenedor

    publications.forEach(publication => {
        // Crear contenedores para cada publicación
        const publicacion = document.createElement('div');
        publicacion.classList.add('publicacion'); // Añadir la clase para la publicación
        const publicidad = document.createElement('div');
        publicidad.classList.add('publicidad'); // Añadir la clase para la publicidad

        if (publication.type === 'anuncio') {
            const anuncio = publication.data;
            publicidad.innerHTML = `
                <div class="containerColumn">
                    <div class="containerRow">
                        <div class="containerColumn">
                            <div><a href="#" target="_blank"><img class="imgPubli" src="${anuncio.ImagenPerfil}" alt=""></a></div>
                        </div>
                        <div class="containerColumn">
                            <div class="main-text">${anuncio.Titulo}</div>
                            <div class="subtext">${anuncio.NombrePromocionador}</div>
                        </div>
                    </div>
                    <div>
                        <p class="contenido">${anuncio.Contenido}</p>
                    </div>
                </div>
                <div class="carousel">
                    <button class="btn left">&lt;</button>
                    <div class="carousel-images">
                        ${anuncio.Imagenes.map(imgUrl => `<img src="${imgUrl}" alt="Imagen de anuncio">`).join('')}
                    </div>
                    <button class="btn right">&gt;</button>
                </div>
            `;
            publicacionesContainer.appendChild(publicidad); // Añadir el anuncio al contenedor de publicidades
            setTimeout(() => {
                const carouselElement = publicidad.querySelector('.carousel');
                if (carouselElement) {
                    setupCarousel(carouselElement); // Configurar el carrusel
                }
            }, 0);
        } else if (publication.type === 'receta') {
            const receta = publication.data;
            const user = publication.user;
            const chefImage = user
                ? `http://25.61.139.76:3000/img/userIcons/${user.imagen}`
                : 'http://25.61.139.76:3000/img/userIcons/default.png';
            const chefName = user ? `${user.Nombre} ${user.ApellidoP}` : 'Chef Desconocido';
            publicacion.innerHTML = `
                <div class="containerColumn">
                    <div class="containerRow">
                        <div class="containerColumn">
                            <div><a><img class="imgPubli Id_User" id="${user.ID_User}" src="${chefImage}" alt="Foto de perfil"></a></div>
                        </div>
                        <div class="containerColumn">
                            <div class="main-text">${receta.Titulo_Receta}</div>
                            <div class="subtext">${chefName}</div>
                        </div>
                    </div>
                    <div>
                        <strong class="contenido">Ingredientes:</strong><br>
                        ${Object.entries(receta.Ingredientes).map(([key, value]) => `&nbsp;&nbsp;${key}: ${value}<br>`).join('')}
                        <br>
                        <strong class="contenido">¡A cocinar!</strong><br>
                        ${receta.Pasos_Elaboracion.map((paso, i) => `&nbsp;&nbsp;${i + 1}. ${paso}<br>`).join('')}
                    </div>
                </div>
                <a class="Id_receta" id="${receta.ID_Receta}">Saber más sobre la receta...</a>

                <div class="carousel">
                    <button class="btn left">&lt;</button>
                    <div class="carousel-images">
                        ${receta.Imagenes.map(imgUrl => `<img src="${imgUrl}" alt="Imagen de receta">`).join('')}
                    </div>
                    <button class="btn right">&gt;</button>
                </div>
                <div class="parent-div">
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
                    <div class="child-div last-child" >
                        <input class="rating" type="number" min="0" max="5" value="0">
                        <i class="fas fa-star fa-lg" ></i><p>Calificar</p>
                    </div>
                </div>
            `;
            publicacionesContainer.appendChild(publicacion); // Añadir la receta al contenedor de publicaciones
            setTimeout(() => {
                const carouselElement = publicacion.querySelector('.carousel');
                if (carouselElement) {
                    setupCarousel(carouselElement); // Configurar el carrusel
                }
            }, 0);
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchCombinedPublications);

async function setUserInteracts() {
    try {
        // Obtener las recetas desde el servidor
        const recetasResponse = await fetch('http://25.61.139.76:3000/read-recetas');
        const recetasData = await recetasResponse.json();
        const recetas = recetasData.recetas;
        recetasPagina = recetas;

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
        window.open(`pagina-usuario.html?id=${userid}`, '_blank');
    }

    document.querySelectorAll('.interact').forEach(item => {
        item.addEventListener('click', registrarInteraccion);
    });

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





