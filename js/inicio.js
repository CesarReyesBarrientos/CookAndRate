const menuButton = document.getElementById("menuButton");
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");
const header = document.getElementById("mainHeader");
let userResult;
let chefResult; 
let recetasChefResult; 
let foodRResult;
let recetasPagina;
let iconResult;

let recetasHome;

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
        const response = await fetch('http://192.168.50.67:3000/read-recetas');
        if (response.ok) {
            const data = await response.json();
            recetasHome = data.recetas;
            generarPublicaciones();
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

// Funcionalidad nueva aplicada para obtener los datos del usuario
const getUserData = (token) => {
    return new Promise((resolve, reject) => {
        const userData = parseJWT(token);
        if (userData) {
            const data = {};
            data.userId = userData.userId;
            fetch('http://192.168.50.67:3000/find-user-by-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userData.userId }),
            })
            .then((response) => response.json())
            .then((result) => {
                console.log('User Data', result);
                // console.log('Datos usuario:', result.user);
                // console.log('Imagen de usuario:', result.icon);
                userResult = result.user;
                iconResult = result.icon;
                if (result.chef) {
                    const chefResult = result.chef;
                    // console.log('Datos chef:', chefResult);
                    // console.log('Recetas del chef:', chefResult.recetas);
                    // Hacer algo con los datos del chef
                } else if (result.critico) {
                    const foodRResult = result.critico;
                    // console.log('Datos crítico:', foodRResult);
                    // Hacer algo con los datos del crítico
                }
                
                // Guardar en localStorage si es necesario
                localStorage.setItem('userData', JSON.stringify(result));
                resolve();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        } else {
            console.error('Token inválido.');
            reject('Token inválido');
        }
    });
};

// Funcionalidad nueva aplicada para obtener los datos del usuario
function updateUserInterface() {
    // Función para actualizar la interfaz con los datos cargados
    if (userResult) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = userResult.Nombre + " " + userResult.Ape_Pat + " " + userResult.Ape_Mat;
        }
        // Ejemplo: actualizar imagen de perfil
        if (iconResult) {
            const userImage = `${iconResult}`;
            // console.log(`${iconResult}`);
            const userIconElement = document.getElementById('userIcon');
            if (userIconElement) {
                userIconElement.src = userImage;
            }
        }
    }
}

async function generarPublicaciones() {
    const publicacionesContainer = document.querySelector('.publicaciones');
    publicacionesContainer.innerHTML = ''; 

    // Usamos for...of en lugar de forEach para poder usar await
    for (const receta of recetasHome) {
        // console.log('Receta:', receta);
        // Accedemos directamente a los datos del chef desde la receta
        const chefImage = receta.chef.imagen 
            ? `http://192.168.50.67:3000/img/userIcons/${receta.chef.imagen}`
            : 'http://192.168.50.67:3000/img/userIcons/cheficon.jpg';
        const chefName = receta.chef.nombreCompleto || `${receta.chef.nombre} ${receta.chef.apellidoPaterno}` || 'Chef Desconocido';
        
        // Obtenemos las interacciones (totales y del usuario actual)
        const interaccionReceta = await obtenerInteracciones(receta.id) || {
            meEncanta: 0,
            meGusta: 0,
            noMeGusta: 0,
            usuarios: [] // Esto es un array
        };

        
        
        // Para encontrar al usuario actual (si está logueado)
        if (userResult?.ID_Usuario) {
            const miInteraccion = interaccionReceta.usuarios.find(
                u => u.userId === userResult.ID_Usuario
            );

            
        }
        const getIconState = (tipo) => {
            // Verificar si hay usuario logueado
            if (!userResult?.ID_Usuario) {
                return {
                    class: 'fa-regular',
                    color: '#000000'
                };
            }

            // Buscar si el usuario actual tiene una interacción de este tipo en esta receta
            const usuarioInteraccion = interaccionReceta.usuarios.find(
                u => u.userId === userResult.ID_Usuario && u.Tipo === tipo
            );

            if (usuarioInteraccion) {
                return {
                    class: 'fa-solid',
                    color: tipo === 'Me encanta' ? '#ff0000' : '#11306f'
                };
            }
            
            return {
                class: 'fa-regular',
                color: '#000000'
            };
        };

        

        const publicacion = document.createElement('div');
        publicacion.classList.add('publicacion');

        publicacion.innerHTML = `
            <div class="containerColumn">
                <div class="containerRow">
                    <div class="containerColumn">
                        <div><a href="#" target="_blank"><img class="imgPubli" src="${chefImage}" alt="Foto de perfil"></a></div>
                    </div>
                    <div class="containerColumn">
                        <div class="main-text">${receta.titulo}</div>
                        <div class="subtext">${chefName}</div>
                    </div>
                </div>
                <div>
                    <strong class="contenido">Ingredientes:</strong><br>
                    ${Object.entries(receta.ingredientes).map(([ingrediente, cantidad]) => 
                        `&nbsp;&nbsp;${ingrediente}: ${cantidad}<br>`).join('')}
                    <br>
                    <strong class="contenido">¡A cocinar!</strong><br>
                    ${receta.pasos.map((paso, index) => 
                        `&nbsp;&nbsp;${index + 1}. ${paso}<br>`).join('')}
                </div>
            </div>
            <div class="carousel">
                <button class="btn left">&lt;</button>
                <div class="carousel-images">
                    ${receta.imagenes.map(imgUrl => 
                        `<img src="${imgUrl}" alt="Imagen de receta">`).join('')}
                </div>
                <button class="btn right">&gt;</button>
            </div>
            <!-- Sección de interacciones -->
                <div class="interacciones-container">
                <div class="interaccion" data-tipo="meEncanta" data-receta-id="${receta.id}">
                    <i class="${getIconState('Me encanta').class} fa-heart" style="color: ${getIconState('Me encanta').color}"></i>
                    <span class="contador">${interaccionReceta.meEncanta ?? 0}</span>
                </div>
                <div class="interaccion" data-tipo="meGusta" data-receta-id="${receta.id}">
                    <i class="${getIconState('Me gusta').class} fa-thumbs-up" style="color: ${getIconState('Me gusta').color}"></i>
                    <span class="contador">${interaccionReceta.meGusta ?? 0}</span>
                </div>
                <div class="interaccion" data-tipo="noMeGusta" data-receta-id="${receta.id}">
                    <i class="${getIconState('No me gusta').class} fa-thumbs-down" style="color: ${getIconState('No me gusta').color}"></i>
                    <span class="contador">${interaccionReceta.noMeGusta ?? 0}</span>
                </div>
            </div>
        `;
        
        publicacionesContainer.appendChild(publicacion);
        setupCarousel(publicacion.querySelector('.carousel'));

        // Solo agregar eventos si hay usuario logueado
        if (userResult?.ID_Usuario) {
            agregarEventosInteraccion(publicacion, receta.id);
        } else {
            // Mostrar tooltip o mensaje si no está logueado
            publicacion.querySelectorAll('.interaccion').forEach(interaccion => {
                interaccion.style.cursor = 'not-allowed';
                interaccion.title = 'Inicia sesión para interactuar';
            });
        }
    }
}

// Función para obtener interacciones (debe incluir la interacción del usuario)
async function obtenerInteracciones(recetaId) {
    try {
        const url = userResult?.ID_Usuario 
            ? `http://192.168.50.67:3000/get-interacciones/${recetaId}?usuarioId=${userResult.ID_Usuario}`
            : `http://192.168.50.67:3000/get-interacciones/${recetaId}`;
            
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            return {
                meEncanta: data.interacciones.meEncanta || 0, // Nota: viene de interacciones
                meGusta: data.interacciones.meGusta || 0,     // Nota: viene de interacciones
                noMeGusta: data.interacciones.noMeGusta || 0,  // Nota: viene de interacciones
                usuarios: data.interacciones.usuarios || []     // Ahora correctamente anidado
            };
        }
        return {
            meEncanta: 0,
            meGusta: 0,
            noMeGusta: 0,
            usuarios: []
        };
    } catch (error) {
        console.error('Error al obtener interacciones:', error);
        return {
            meEncanta: 0,
            meGusta: 0,
            noMeGusta: 0,
            usuarios: []
        };
    }
}

function agregarEventosInteraccion(publicacion, recetaId) {
    const interacciones = publicacion.querySelectorAll('.interaccion');
    
    interacciones.forEach(interaccion => {
        interaccion.addEventListener('click', async function() {
            const tipo = this.dataset.tipo;
            const icono = this.querySelector('i');
            const contador = this.querySelector('.contador');
            
            // Guardar estado anterior para posible rollback
            const estadoAnterior = {
                clase: icono.className,
                color: icono.style.color,
                contador: contador.textContent
            };
            
            // Cambio visual inmediato (optimistic UI)
            const isActive = icono.classList.contains('fa-solid');
            icono.classList.toggle('fa-regular');
            icono.classList.toggle('fa-solid');
            
            // Aplicar colores según el tipo de interacción
            if (icono.classList.contains('fa-solid')) {
                // Icono activo
                if (tipo === 'meEncanta') {
                    icono.style.color = '#ff0000'; // Rojo para "Me encanta"
                } else {
                    icono.style.color = '#11306f'; // Azul para "Me gusta" y "No me gusta"
                }
            } else {
                // Icono inactivo
                icono.style.color = '#000000'; // Negro para todos cuando están inactivos
            }
            
            try {
                // Registrar la interacción en el servidor
                const response = await fetch('http://192.168.50.67:3000/get-interacciones', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        recetaId: recetaId,
                        tipo: tipo,
                        usuarioId: userResult.ID_Usuario
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Actualizar todos los contadores y estados
                    publicacion.querySelectorAll('.interaccion').forEach(item => {
                        const tipoItem = item.dataset.tipo;
                        const iconoItem = item.querySelector('i');
                        const contadorItem = item.querySelector('.contador');
                        
                        // Actualizar contador
                        contadorItem.textContent = data.nuevoTotal[tipoItem] || 0;
                        
                        // Actualizar estado del icono
                        if (tipoItem === tipo) {
                            // Mantener el estado actual del icono clickeado
                            iconoItem.className = icono.className;
                            iconoItem.style.color = icono.style.color;
                        } else {
                            // Desactivar otras interacciones
                            iconoItem.classList.remove('fa-solid');
                            iconoItem.classList.add('fa-regular');
                            iconoItem.style.color = '#000000';
                        }
                    });
                    
                    console.log('Interacción actualizada:', {
                        recetaId,
                        tipo,
                        nuevoTotal: data.nuevoTotal
                    });
                } else {
                    // Revertir cambios si falló la respuesta del servidor
                    icono.className = estadoAnterior.clase;
                    icono.style.color = estadoAnterior.color;
                    contador.textContent = estadoAnterior.contador;
                }
            } catch (error) {
                console.error('Error al registrar interacción:', error);
                // Revertir cambios visuales si hubo error
                icono.className = estadoAnterior.clase;
                icono.style.color = estadoAnterior.color;
                contador.textContent = estadoAnterior.contador;
            }
        });
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


document.addEventListener('click', (event) => {
    if (event.target.classList.contains('Id_receta')) {
        const recetaId = event.target.id;
        // console.log('El ID de la receta es:', recetaId);
        window.open(`nutrition.html?id=${recetaId}`, '_blank');
    }
    if (event.target.classList.contains('Id_User')) {
        const userid = event.target.id;
        // console.log('El ID del usuario:', userid);
        if (userid != userResult.ID_User) {
            window.open(`pagina-usuarios.html?id=${userid}`);
        }else {
            window.open(`perfil.html`);
        }
        
    }

    document.querySelectorAll('.interact').forEach(item => {
        item.addEventListener('click', registrarInteraccion);
    });

    if (event.target.classList.contains('enviar_')) {
        const ratingSelect = event.target.closest('.parent-div').querySelector('.rating');
        const selectedRating = ratingSelect ? ratingSelect.value : null;
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
                    // console.log("Se puso Me gusta y desactivó No me gusta");
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
                    // console.log("Se puso No me gusta y desactivó Me gusta");
                    likeIconOff.style.display = 'inline-block'; // Se pone OFF el "Me gusta"
                    likeIconOn.style.display = 'none';
                }
            }
    
            // Mostrar el ícono ON y ocultar el OFF
            iconOff.style.display = 'none'; // Se pone OFF el icono
            iconOn.style.display = 'inline-block'; // Se pone ON el icono
        }
}


const enviarIcon = document.querySelector('.enviar_');
const ratingSelect = document.querySelector('.rating');

document.addEventListener('DOMContentLoaded', () => {
    const chefsContainer = document.querySelector('.chefs');
    const rankingDiv = document.querySelector('.ranking p');
    
    // Mostrar estado de carga
    chefsContainer.innerHTML = '<div class="loading">Cargando mejores platillos...</div>';
    
    fetch('http://192.168.50.67:3000/top-3-recetas')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success || !data.top3Recetas) {
                throw new Error('Datos de recetas no disponibles');
            }

            // Limpiar contenedor
            chefsContainer.innerHTML = '';
            
            // Actualizar título
            rankingDiv.textContent = 'RANKING DE MEJORES PLATILLOS';

            // Crear tarjetas para cada receta
            // console.log(data.top3Recetas);
            // data.top3Recetas.forEach((receta, index) => {
            //     // Declarar todas las variables al inicio
            //     let puntuacionNumerica = 0;
            //     let puntuacionFormateada = 'N/A';
                
            //     // Convertir a número si existe
            //     if (receta.Puntuacion_Promedio !== null && receta.Puntuacion_Promedio !== undefined) {
            //         puntuacionNumerica = parseFloat(receta.Puntuacion_Promedio);
            //         if (!isNaN(puntuacionNumerica)) {
            //             puntuacionFormateada = puntuacionNumerica.toFixed(2);
            //         }
            //     }
                
            //     const porcentajeLlenado = (puntuacionNumerica / 5) * 100;
            //     // console.log(receta);
                
            //     const chefCard = document.createElement('div');
            //     chefCard.className = 'chef-card';
                
            //     chefCard.innerHTML = `
            //         <div class="ranking-badge">Top ${index + 1}</div>
            //         <div class="ranking-badge">${receta.Nombre}</div>
            //         <div class="chef-carousel">
            //             <div class="chef-carousel-images">
            //                 <img src="${receta.Imagen}" alt="${receta.Nombre}">
            //             </div>
            //         </div>
            //         <div class="chef-text-below">
            //             <p class="chef-name">Por: ${receta.Chef_Nombre} ${receta.Chef_Apellido}</p>
            //             <div class="rating">
            //                 <div class="stars-container">
            //                     <div class="stars-background">★★★★★</div>
            //                     <div class="stars-filled" style="width: ${porcentajeLlenado}%">★★★★★</div>
            //                 </div>
            //                 <span class="rating-value">(${puntuacionFormateada})</span>
            //             </div>
            //         </div>
            //     `;
                
            //     chefsContainer.appendChild(chefCard);
            // });
        })
        .catch(error => {
            console.error('Error al cargar los mejores platillos:', error);
            chefsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No se pudieron cargar los mejores platillos.</p>
                    <button onclick="window.location.reload()">Reintentar</button>
                </div>
            `;
        });
});