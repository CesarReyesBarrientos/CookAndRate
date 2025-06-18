const menuButton = document.getElementById("menuButton");
const recipeModal = document.getElementById('recipe-modal');
const openCreateRecipeModalButton = document.getElementById('create-recipe-btn');
const closeModalBtn = document.querySelector('.close-modal');
const recipeForm = document.getElementById('recipe-form');
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");
let userResult;
let chefResult; 
let recetasChefResult; 
let foodRResult;
let recetasPagina;
let userById;
let recetasHome = [];

window.onload = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión.');
        window.location.href = 'index.html';
    } else {
        getUserData(token)
            .then(() => {
                getRecetas(userById.user.ID_Usuario);
                console.log('Datos del usuario obtenidos:', userById.user.ID_Usuario);
                updateUserInterface();
            })
            .catch(error => {
                console.error('Error al obtener datos de usuario:', error);
            });
    }
};

// Abrir modal
openCreateRecipeModalButton.addEventListener('click', () => {
  recipeModal.style.display = 'block';
});

// Cerrar modal
closeModalBtn.addEventListener('click', () => {
  recipeModal.style.display = 'none';
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (event) => {
  if (event.target === recipeModal) {
    recipeModal.style.display = 'none';
  }
});

// Decodifica el token JWT
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

// Obtiene datos del usuario logueado y actualiza el perfil
async function getUserData(token) {
  const userData = parseJWT(token);
  if (userData) {
    const data = { userId: userData.userId };
    const response = await fetch('http://localhost:3000/find-user-by-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    
    if (result.user) {
      userResult = result.user;
      userById = result;
      console.log('Datos del usuario:', result);
      
      // Actualizar UI básica
      document.querySelector('.profile-details h2').textContent =
        `${result.user.Nombre} ${result.user.Ape_Pat} ${result.user.Ape_Mat}`;
      document.querySelector('.biografia').textContent = result.user.Biografia || 'Sin descripción.';
      document.querySelector('.profile-photo img').src = `${result.icon}`;

      // Obtener y mostrar estadísticas de seguimiento
      const stats = await obtenerEstadisticasSeguimiento(result.user.ID_Usuario);
      document.getElementById('followers').textContent = `${stats.seguidores || 0} seguidores`;
      document.getElementById('follows').textContent = `${stats.seguidos || 0} seguidos`;

      // Precargar datos en el formulario
      document.getElementById('nombre').value = result.user.Nombre;
      document.getElementById('apellidoP').value = result.user.Ape_Pat;
      document.getElementById('apellidoM').value = result.user.Ape_Mat;
      document.getElementById('email').value = result.user.Email;
      document.getElementById('email').setAttribute('data-original-email', result.user.Email);
      document.getElementById('biografia').value = result.user.Biografia;
      
      return result.user;
    } else {
      throw new Error('Usuario no encontrado');
    }
  } else {
    throw new Error('Token inválido');
  }
}

const getRecetas = async (idDeseado) => {  // Añade parámetro para el ID deseado
    try {
        const response = await fetch('http://localhost:3000/read-recetas');
        if (response.ok) {
            const data = await response.json();
            // Filtra las recetas para obtener solo las que coincidan con el ID deseado
            // console.log('Recetas obtenidas:', data.recetas);
            recetasHome = data.recetas.filter(receta => receta.chef.usuarioId === idDeseado);
            console.log('Recetas filtradas:', recetasHome);
            generarPublicaciones();
        } else {
            console.error('Error en la respuesta:', response.statusText);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error.message);
    }
};


async function obtenerEstadisticasSeguimiento(userId) {
    try {
        const response = await fetch(`http://localhost:3000/estadisticas-seguimiento/${userId}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('Estadísticas:', data.estadisticas);
            return data.estadisticas;
        } else {
            throw new Error(data.message || 'Error al obtener estadísticas');
        }
    } catch (error) {
        console.error('Error:', error);
        return { seguidores: 0, seguidos: 0 }; // Valores por defecto en caso de error
    }
}

// Mostrar/ocultar formulario de edición
document.getElementById('edit-profile').addEventListener('click', () => {
  const form = document.getElementById('edit-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

// Vista previa de la imagen seleccionada
document.getElementById('imagen').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const preview = document.getElementById('preview-imagen');

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});


// Nuevo código para manejar pestañas

document.getElementById('edit-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const userId = userById.user.ID_Usuario;
  console.log('User ID:', userId);
  const email = document.getElementById('email').value;
  const originalEmail = document.getElementById('email').getAttribute('data-original-email');

  const imagenInput = document.getElementById('imagen');

  try {
    // 1. Validar email si ha cambiado
    if (email !== originalEmail) {
      const checkResponse = await fetch('http://localhost:3000/checkEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const checkResult = await checkResponse.json();
      if (checkResult.available === "1") {
        alert('El correo electrónico ya está en uso. Por favor, utiliza otro.');
        return;
      }
    }

    // 2. Subir imagen si existe
    if (imagenInput.files[0]) {
      const imagenOriginal = imagenInput.files[0];
      const extension = imagenOriginal.name.split('.').pop(); // por ejemplo: 'png' o 'jpg'
      const nuevoNombre = `${userId}.${extension}`;

      // Crear un nuevo File con el nuevo nombre
      const imagenRenombrada = new File([imagenOriginal], nuevoNombre, {
        type: imagenOriginal.type,
      });

      const imageForm = new FormData();
      imageForm.append('userId', userId);
      imageForm.append('userIcon', imagenRenombrada);

      console.log('Subiendo imagen como:', imagenRenombrada);


      const uploadResponse = await fetch('http://localhost:3000/api/upload-user-icon', {
        method: 'POST',
        body: imageForm
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        alert('Error al subir la imagen');
        return;
      }
    }

    // 3. Actualizar perfil (nombre, apellidos, biografía)
    const updateData = {
      userId: userResult.ID_Usuario,
      nombre: document.getElementById('nombre').value,
      apellidoP: document.getElementById('apellidoP').value,
      apellidoM: document.getElementById('apellidoM').value,
      biografia: document.getElementById('biografia').value,
      email: email// Usar la URL de la imagen subida o la existente
    };
    const updateResponse = await fetch('http://localhost:3000/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    if (updateResult.success) {
      alert('Perfil actualizado correctamente');
      const updatedUser = updateResult.user;

      // Actualizar DOM
      document.querySelector('.profile-details h2').textContent =
        `${updatedUser.Nombre} ${updatedUser.Ape_Pat} ${updatedUser.Ape_Mat}`;
      document.querySelector('.profile-details p:nth-of-type(2)').textContent =
        updatedUser.Biografia || 'Sin descripción.';

      const imgUser = `http://localhost:3000/img/userIcons/${updatedUser.Imagen}`;
      console.log('Imagen de usuario:', imgUser);
      document.getElementById('userimage').src = imgUser;

      // Actualizar campos del formulario
      document.getElementById('nombre').value = updatedUser.Nombre;
      document.getElementById('apellidoP').value = updatedUser.Ape_Pat;
      document.getElementById('apellidoM').value = updatedUser.Ape_Mat;
      document.getElementById('email').value = updatedUser.Email;
      document.getElementById('biografia').value = updatedUser.Biografia;

      fetchRecetas();
    } else {
      alert('Error al actualizar el perfil');
    }

  } catch (error) {
    console.error('Error:', error);
    alert('Ocurrió un error al actualizar los datos.');
  }
});


// Modificar fetchRecetas para manejar chefs sin recetas
async function generarPublicaciones() {
    const publicacionesContainer = document.querySelector('.publicaciones');
    publicacionesContainer.innerHTML = ''; 

    // Usamos for...of en lugar de forEach para poder usar await
    for (const receta of recetasHome) {
        // console.log('Receta:', receta);
        // Accedemos directamente a los datos del chef desde la receta
        const chefImage = receta.chef.imagen 
            ? `http://localhost:3000/img/userIcons/${receta.chef.imagen}`
            : 'http://localhost:3000/img/userIcons/cheficon.jpg';
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
            ? `http://localhost:3000/get-interacciones/${recetaId}?usuarioId=${userResult.ID_Usuario}`
            : `http://localhost:3000/get-interacciones/${recetaId}`;
            
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
                const response = await fetch('http://localhost:3000/get-interacciones', {
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


document.addEventListener('DOMContentLoaded', () => {
  const editProfileBtn = document.getElementById('edit-profile');
  const editModal = document.getElementById('edit-modal');
  const closeModalBtn = document.querySelector('.close-modal');
  const editForm = document.getElementById('edit-form');

  // Open modal
  editProfileBtn.addEventListener('click', () => {
    editModal.style.display = 'flex';
    editForm.style.display = 'block'; // Explicitly show the form
  });

  // Close modal
  closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
  });

  // Close modal if clicked outside of it
  editModal.addEventListener('click', (event) => {
    if (event.target === editModal) {
      editModal.style.display = 'none';
    }
  });

  // Optional: Preview image upload
  const imagenInput = document.getElementById('imagen');
  const previewImagen = document.getElementById('preview-imagen');

  imagenInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImagen.src = e.target.result;
        previewImagen.style.display = 'block';
      }
      reader.readAsDataURL(file);
    }
  });
});

document.getElementById('logout').addEventListener('click', async () => {
  const token = localStorage.getItem('authToken');
  localStorage.removeItem('authToken');
  alert('Sesión cerrada. Redirigiendo a la página de inicio...');
  window.location.href = 'index.html';
});


document.getElementById('deactivate-account').addEventListener('click', async () => {
  const confirmDeactivate = confirm('¿Estás seguro de que deseas desactivar tu cuenta? Esta acción no se puede deshacer.');
  if (!confirmDeactivate) return;

  const token = localStorage.getItem('authToken');
  if (!token) {
      alert('No estás autenticado. Por favor, inicia sesión.');
      window.location.href = 'index.html';
      return;
  }

  const userId = JSON.parse(atob(token.split('.')[1])).userId; // Decodificar el ID del usuario desde el token

  try {
      //console.log('Enviando userId al servidor:', userId); // Log para verificar

      const response = await fetch('http://localhost:3000/deactivate-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
          alert('Tu cuenta ha sido desactivada. Redirigiendo a la página principal...');
          localStorage.removeItem('authToken');
          window.location.href = 'index.html';
      } else {
          alert(`Error al desactivar la cuenta: ${result.message}`);
      }
  } catch (error) {
      console.error('Error al desactivar la cuenta:', error);
      alert('Ocurrió un error al intentar desactivar tu cuenta.');
  }
});


//menu
// Abrir menú
menuButton.addEventListener("click", () => {
  menuWindow.classList.add("open");
});

// Cerrar menú
closeMenu.addEventListener("click", () => {
  menuWindow.classList.remove("open");
});

const header = document.getElementById("mainHeader");

// Detectar scroll y agregar sombra al header
window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
      header.classList.add("scrolled");
  } else {
      header.classList.remove("scrolled");
}
});

function updateUserInterface() {
  // Función para actualizar la interfaz con los datos cargados
  if (userResult) {
      // Ejemplo: actualizar nombre de usuario
      const userNameElement = document.getElementById('userName');
      if (userNameElement) {
          userNameElement.textContent = userResult.Nombre + " " + userResult.Ape_Pat + " " + userResult.Ape_Mat;
      }
      
      // Ejemplo: actualizar imagen de perfil
      if (userById.icon) {
          const userImage = `${userById.icon}`;
          console.log('Imagen de usuario:', userById.icon); // Verificar la URL de la imagen
          const userIconElement = document.getElementById('userIcon');
          if (userIconElement) {
              userIconElement.src = userImage;
          }
      }
  }
}

//nueva funcion
async function updateFollowersCount(userId) {
  try {
    // Solicitar información de chefs y críticos
    const [chefsResponse, criticsResponse] = await Promise.all([
      fetch('http://192.168.50.209:3000/read-chefs'),
      fetch('http://192.168.50.209:3000/read-food-critics')
    ]);

    const chefsData = await chefsResponse.json();
    const criticsData = await criticsResponse.json();

    // Encontrar el usuario actual en los chefs
    const chefProfile = chefsData.chefs.find(chef => chef.ID_User === userId);
    
    // Encontrar el usuario actual en los críticos
    const criticProfile = criticsData.food_rev.find(critic => critic.ID_User === userId);

    const followersElement = document.getElementById("followers");
    const followsElement = document.getElementById("follows");
    // const biographyElement = document.getElementById("biagrafia");

    if (chefProfile) {
      // Si es chef (profesional o aficionado)
      followersElement.textContent = `${chefProfile.Seguidores.length} seguidores`;
      followsElement.textContent = `${chefProfile.Seguidos.length} seguidos`;
    } else if (criticProfile) {
      // Si es crítico (consumidor)
      followersElement.textContent = `${criticProfile.Seguidos.length} seguidos`;
    } else {
      // Si no se encuentra en ningún perfil
      followersElement.textContent = "0 seguidores";
    }
  } catch (error) {
    console.error('Error al obtener el número de seguidores:', error);
    document.querySelector(".profile-details p:nth-child(2)").textContent = "0 seguidores";
  }
}

// New function to generate gallery images
function generarGaleria(imagenes) {
  //console.log('Imágenes recibidas para la galería:', imagenes); // Verificar el array de imágenes
  const galeriaContainer = document.querySelector('.tab-content.gallery');

  if (!galeriaContainer) {
    console.error('Contenedor de galería no encontrado.');
    return;
  }

  galeriaContainer.innerHTML = ''; // Limpiar contenido previo

  if (imagenes.length === 0) {
    galeriaContainer.innerHTML = '<p>No hay imágenes disponibles.</p>';
    return;
  }

  const photoGrid = document.createElement('div');
  photoGrid.classList.add('photo-grid');

  imagenes.forEach(imagenUrl => {
    //console.log('URL de imagen:', imagenUrl); // Depuración
    const img = document.createElement('img');
    img.src = imagenUrl;
    img.alt = 'Imagen de receta';
    img.onerror = () => console.error('Error al cargar imagen:', imagenUrl); // Detectar errores
    photoGrid.appendChild(img);
  });

  galeriaContainer.appendChild(photoGrid);
}


// Function to initialize recipe publication functionality
function initRecipePublication() {
  const createRecipeBtn = document.getElementById('create-recipe-btn');
  const recipeModal = document.getElementById('recipe-modal');
  const closeModalBtn = document.querySelector('.close-recipe-modal');
  const recipeForm = document.getElementById('recipe-form');

  // Open modal
  createRecipeBtn.addEventListener('click', () => {
      recipeModal.style.display = 'flex';
  });

  // Close modal
  closeModalBtn.addEventListener('click', () => {
      recipeModal.style.display = 'none';
  });

  // Close modal if clicked outside of it
  recipeModal.addEventListener('click', (event) => {
      if (event.target === recipeModal) {
          recipeModal.style.display = 'none';
      }
  });

  // Image preview for recipe
  const imageInput = document.getElementById('recipe-images');
  const imagePreviewContainer = document.getElementById('image-preview-container');

  imageInput.addEventListener('change', function(event) {
      imagePreviewContainer.innerHTML = ''; // Clear previous previews
      const files = event.target.files;

      for (let file of files) {
          const reader = new FileReader();
          reader.onload = function(e) {
              const img = document.createElement('img');
              img.src = e.target.result;
              img.style.maxWidth = '100px';
              img.style.margin = '5px';
              imagePreviewContainer.appendChild(img);
          }
          reader.readAsDataURL(file);
      }
  });

  // Handle recipe submission
  recipeForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Get form data
      const titulo = document.getElementById('recipe-title').value;
      const ingredientes = {};
      const ingredientInputs = document.querySelectorAll('.ingredient-input');
      ingredientInputs.forEach(input => {
          const name = input.querySelector('.ingredient-name').value;
          const amount = input.querySelector('.ingredient-amount').value;
          if (name && amount) {
              ingredientes[name] = amount;
          }
      });

      const pasos = document.getElementById('recipe-steps').value.split('\n').filter(step => step.trim() !== '');
      const imageFiles = imageInput.files;

      // Create FormData for file upload
      const formData = new FormData();
      
      // Get current user's token and decode
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = userData.userId;

      // Add recipe details to FormData
      formData.append('userId', currentUserId);
      formData.append('titulo', titulo);
      formData.append('ingredientes', JSON.stringify(ingredientes));
      formData.append('pasos', JSON.stringify(pasos));

      // Add image files
      for (let file of imageFiles) {
          formData.append('imagenes', file);
          console.log(file);
      }

      try {
          // Send recipe to server
          const response = await fetch('http://192.168.50.209:3000/create-recipe', {
              method: 'POST',
              body: formData
          });

          const result = await response.json();

          if (result.success) {
              alert('Receta publicada exitosamente');
              recipeModal.style.display = 'none';
              recipeForm.reset();
              imagePreviewContainer.innerHTML = '';
              
              // Refresh recipes
              fetchRecetas();
          } else {
              alert('Error al publicar la receta');
          }
      } catch (error) {
          console.error('Error:', error);
          alert('Ocurrió un error al publicar la receta');
      }
  });

  // Add dynamic ingredient inputs
  const addIngredientBtn = document.getElementById('add-ingredient-btn');
  const ingredientsContainer = document.getElementById('ingredients-container');

  addIngredientBtn.addEventListener('click', () => {
      const ingredientInput = document.createElement('div');
      ingredientInput.classList.add('ingredient-input');
      ingredientInput.innerHTML = `
          <input type="text" class="ingredient-name" placeholder="Nombre del ingrediente" required>
          <input type="text" class="ingredient-amount" placeholder="Cantidad" required>
          <button type="button" class="remove-ingredient-btn">X</button>
      `;

      // Remove ingredient button functionality
      ingredientInput.querySelector('.remove-ingredient-btn').addEventListener('click', () => {
          ingredientsContainer.removeChild(ingredientInput);
      });

      ingredientsContainer.appendChild(ingredientInput);
  });
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

// Función para inicializar el formulario de recetas
function initRecipeForm() {
  // Agregar ingredientes dinámicamente
  document.getElementById('add-ingredient-btn').addEventListener('click', () => {
    const container = document.getElementById('ingredients-container');
    const div = document.createElement('div');
    div.className = 'ingredient-input';
    div.innerHTML = `
      <input type="text" class="ingredient-name" placeholder="Nombre" required>
      <input type="text" class="ingredient-amount" placeholder="Cantidad" required>
      <select class="ingredient-unit" required>
        <option value="gr">gr</option>
        <option value="ml">ml</option>
        <option value="tazas">tazas</option>
        <option value="cucharadas">cucharadas</option>
        <option value="unidades">unidades</option>
      </select>
      <button type="button" class="remove-btn">×</button>
    `;
    container.appendChild(div);
    
    div.querySelector('.remove-btn').addEventListener('click', () => {
      container.removeChild(div);
    });
  });

  // Agregar pasos dinámicamente
  document.getElementById('add-step-btn').addEventListener('click', () => {
    const container = document.getElementById('steps-container');
    const div = document.createElement('div');
    div.className = 'step-input';
    const stepNumber = container.children.length + 1;
    div.innerHTML = `
      <h4>Paso ${stepNumber}</h4>
      <textarea class="step-description" placeholder="Descripción del paso" required></textarea>
      <button type="button" class="remove-btn">×</button>
    `;
    container.appendChild(div);
    
    div.querySelector('.remove-btn').addEventListener('click', () => {
      container.removeChild(div);
      // Reindexar los pasos restantes
      Array.from(container.children).forEach((child, index) => {
        child.querySelector('h4').textContent = `Paso ${index + 1}`;
      });
    });
  });

  // Vista previa de imágenes
  document.getElementById('recipe-images').addEventListener('change', function(e) {
    const previewContainer = document.getElementById('image-preview-container');
    previewContainer.innerHTML = '';
    
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  // Manejar envío del formulario
  recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Recopilar datos del formulario
    const recipeData = {
      titulo: document.getElementById('recipe-title').value,
      descripcion: document.getElementById('recipe-description').value,
      tiempoPreparacion: document.getElementById('recipe-time').value,
      dificultad: document.getElementById('recipe-difficulty').value,
      ingredientes: [],
      pasos: [],
      imagenes: []
    };

    // Obtener ingredientes
    document.querySelectorAll('.ingredient-input').forEach(input => {
      recipeData.ingredientes.push({
        nombre: input.querySelector('.ingredient-name').value,
        cantidad: input.querySelector('.ingredient-amount').value,
        unidad: input.querySelector('.ingredient-unit').value
      });
    });

    // Obtener pasos
    document.querySelectorAll('.step-input').forEach((input, index) => {
      recipeData.pasos.push({
        numero: index + 1,
        descripcion: input.querySelector('.step-description').value
      });
    });

    // Obtener imágenes (solo nombres para mostrar en consola)
    recipeData.imagenes = Array.from(document.getElementById('recipe-images').files).map(f => f.name);

    // Mostrar datos en consola
    console.log('Datos de la receta a enviar:', recipeData);

    try {
  const formData = new FormData();

  // Agregar campos simples
  formData.append('titulo', recipeData.titulo);
  formData.append('descripcion', recipeData.descripcion);
  formData.append('tiempoPreparacion', recipeData.tiempoPreparacion);
  formData.append('dificultad', recipeData.dificultad);

  // Agregar ingredientes y pasos como JSON string
  formData.append('ingredientes', JSON.stringify(recipeData.ingredientes));
  formData.append('pasos', JSON.stringify(recipeData.pasos));

  // Agregar imágenes
  const imageFiles = document.getElementById('recipe-images').files;
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append('imagenes', imageFiles[i]); // el nombre del campo debe coincidir con el backend
  }

  const response = await fetch('/api/create-recipe', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  console.log('Respuesta del servidor:', result);

  if (response.ok) {
    alert('Receta creada con éxito!');
    recipeModal.style.display = 'none';
    recipeForm.reset();
    document.getElementById('image-preview-container').innerHTML = '';
  } else {
    alert('Error al crear receta');
  }
} catch (error) {
  console.error('Error al enviar receta:', error);
  alert('Ocurrió un error al enviar la receta.');
}

    recipeModal.style.display = 'none';
  });
}

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initRecipeForm);