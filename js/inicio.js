const menuButton = document.getElementById("menuButton");
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");
const header = document.getElementById("mainHeader");
let userResult;
let chefResult; 
let recetasChefResult; 
let foodRResult;

async function fetchAnuncios() {
    try {
        // Carga el archivo anuncios.txt
        const response = await fetch('http://25.61.139.76:3000/read-anuncios');
        const data = await response.json();
        const anuncios = data.anuncios;

        // Genera los anuncios dinámicamente
        generarAnuncios(anuncios);
    } catch (error) {
        console.error('Error al cargar los anuncios:', error);
    }
}

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

// Llama a la función para cargar los anuncios al cargar la página
document.addEventListener('DOMContentLoaded', fetchAnuncios);

window.onload = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión.');
        window.location.href = 'index.html';
    } else {
        getUserData(token)
            .then(() => {
                // Aquí puedes usar las variables
                console.log('User Result:', userResult);
                console.log('Chef Result:', chefResult);
                console.log('Recetas Chef:', recetasChefResult);
                console.log('Food R Result:', foodRResult);
                
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
            console.log(data);
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
            console.log("INFORMACION CHEFS SEGUIDOS:"+data);
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
            console.log('Datos del usuario', userData.userId);
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
        document.getElementById('userName').textContent = userResult.Nombre + " " + userResult.ApellidoP + " " + userResult.ApellidoM;
        
        // Ejemplo: actualizar imagen de perfil
        if (userResult.imagen) {
            const userImage = `http://25.61.139.76:3000/img/userIcons/${userResult.imagen}`;
            document.getElementById('userIcon').src = userImage;
            console.log(foodRResult.Seguidos);
        }
    }

    if (recetasChefResult) {
        // Lógica para mostrar recetas del chef
        const recetasContainer = document.getElementById('recetasContainer');
        recetasChefResult.forEach(receta => {
            const recetaElement = document.createElement('div');
            recetaElement.textContent = receta.nombre;
            recetasContainer.appendChild(recetaElement);
        });
    }
}

// Recetas

async function fetchRecetas() {
    try {
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
  
      generarPublicaciones(recetas, chefs, users);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }
  
  function generarPublicaciones(recetas, chefs, users) {
    const publicacionesContainer = document.querySelector('.publicaciones');
    publicacionesContainer.innerHTML = ''; 

    recetas.forEach(receta => {
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
      // Comentarios
    //   const comentarios = document.createElement('div');
    //   comentarios.classList.add('comentarios');
    //   comentarios.innerHTML = `
    //     <textarea placeholder="Deja tu comentario..."></textarea>
    //     <button>Comentar</button>
    //   `;
    //   publicacion.appendChild(comentarios);
  
      // Lista de comentarios
    //   const comentariosList = document.createElement('div');
    //   comentariosList.classList.add('comentarios-list');
    //   comentariosList.innerHTML = receta.Comentarios.map(c => `
    //     <div class="comentario-item"><strong>${c.Usuario}:</strong> ${c.Comentario}</div>
    //   `).join('');
    //   publicacion.appendChild(comentariosList);
  
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
  
  document.addEventListener('DOMContentLoaded', fetchRecetas);

// Fin Recetas