window.onload = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
      alert('No estás autenticado. Por favor, inicia sesión.');
      window.location.href = 'index.html';
      return;
  }

  getUserData(token)
    .then(user => {
      if (user.Estado === 0) {
          alert('Tu cuenta está desactivada. Contacta al soporte si deseas reactivarla.');
          window.location.href = 'index.html';
      }
  }).catch(error => {
      console.error('Error al verificar el estado del usuario:', error);
      alert('Hubo un problema al verificar tu cuenta.');
  });
};

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
function getUserData(token) {
  const userData = parseJWT(token);
  if (userData) {
    const data = { userId: userData.userId };
    return fetch('http://25.61.139.76:3000/find-user-by-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.user) {
          // Actualizar los datos del perfil en la vista
          document.querySelector('.profile-details h2').textContent =
            `${result.user.Nombre} ${result.user.ApellidoP} ${result.user.ApellidoM}`;
          document.querySelector('.profile-details p:nth-of-type(2)').textContent =
            result.user.Biografia || 'Sin descripción.';
          document.querySelector('.profile-photo img').src = `http://25.61.139.76:3000${result.user.imagen}`;

          // Llamar a la función para actualizar el número de seguidores/seguidos
          updateFollowersCount(result.user.ID_User);

          // Precargar los datos en el formulario
          document.getElementById('nombre').value = result.user.Nombre;
          document.getElementById('apellidoP').value = result.user.ApellidoP;
          document.getElementById('apellidoM').value = result.user.ApellidoM;
          document.getElementById('email').value = result.user.Email;
          document.getElementById('email').setAttribute('data-original-email', result.user.Email);
          document.getElementById('telefono').value = result.user.Telefono;
          document.getElementById('biografia').value = result.user.Biografia;

          return result.user; // Devolver el usuario para poder usar .then() en la llamada
        } else {
          console.error('No se encontró el usuario en los datos recibidos.');
          throw new Error('Usuario no encontrado');
        }
      });
  } else {
    return Promise.reject(new Error('Token inválido.'));
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

// Manejo del formulario de edición
document.getElementById('edit-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const originalEmail = document.getElementById('email').getAttribute('data-original-email');

  const formData = new FormData();
  formData.append('nombre', document.getElementById('nombre').value);
  formData.append('apellidoP', document.getElementById('apellidoP').value);
  formData.append('apellidoM', document.getElementById('apellidoM').value);
  formData.append('email', email);
  formData.append('telefono', document.getElementById('telefono').value);
  formData.append('biografia', document.getElementById('biografia').value);
  console.log(email);

  const imagenInput = document.getElementById('imagen');
  if (imagenInput.files[0]) {
      formData.append('imagen', imagenInput.files[0]);
  }

  try {
      // Validar correo solo si ha cambiado
      if (email !== originalEmail) {
          const checkResponse = await fetch('http://25.61.139.76:3000/checkEmail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
          });

          const checkResult = await checkResponse.json();
          if (checkResult.available === "1") {
              alert('El correo electrónico ya está en uso. Por favor, utiliza otro.');
              return; // Detener la ejecución si el correo está en uso
          }
      }

      // Actualizar perfil
      const updateResponse = await fetch('http://25.61.139.76:3000/update-user', {
          method: 'POST',
          body: formData,
      });

      const updateResult = await updateResponse.json();
      if (updateResult.success) {
          alert('Perfil actualizado correctamente');

          // Actualizar el DOM con los nuevos datos
          const updatedUser = updateResult.user;
          // console.log(updatedUser);
          document.querySelector('.profile-details h2').textContent =
              `${updatedUser.Nombre} ${updatedUser.ApellidoP} ${updatedUser.ApellidoM}`;
          document.querySelector('.profile-details p:nth-of-type(2)').textContent =
              updatedUser.Biografia || 'Sin descripción.';
            // if (updatedUser.imagen) {
              const imgUser = `http://25.61.139.76:3000/img/userIcons/${updatedUser.imagen}?t=${Date.now()}`;
            

          // Actualizar el formulario con los nuevos valores
          document.getElementById('nombre').value = updatedUser.Nombre;
          document.getElementById('apellidoP').value = updatedUser.ApellidoP;
          document.getElementById('apellidoM').value = updatedUser.ApellidoM;
          document.getElementById('email').value = updatedUser.Email;
          document.getElementById('telefono').value = updatedUser.Telefono;
          document.getElementById('biografia').value = updatedUser.Biografia;
          document.getElementById('userimage').src = imgUser;
          fetchRecetas();
      } else {
          alert('Error al actualizar el perfil');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al verificar o actualizar los datos.');
  }
});


document.addEventListener('DOMContentLoaded', fetchRecetas);


// Nuevo código para manejar pestañas
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      // Desactivar todas las pestañas y contenidos
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Activar la pestaña y contenido seleccionados
      tab.classList.add('active');
      document.querySelector(`.tab-content.${target}`).classList.add('active');
    });
  });
});

// Modificar fetchRecetas para manejar chefs sin recetas
async function fetchRecetas() {
  try {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = userData.userId;

    const recetasResponse = await fetch('http://25.61.139.76:3000/read-recetas');
    const recetasData = await recetasResponse.json();
    const recetas = recetasData.recetas;

    const chefsResponse = await fetch('http://25.61.139.76:3000/read-chefs');
    const chefsData = await chefsResponse.json();
    const chefs = chefsData.chefs;

    const usersResponse = await fetch('http://25.61.139.76:3000/read-users');
    const usersData = await usersResponse.json();
    const users = usersData.users;

    const criticResponse = await fetch('http://25.61.139.76:3000/read-food-critics');
    const criticData = await criticResponse.json();
    const critics = criticData.food_rev;

    // Check if the current user is a chef or a critic
    const currentChef = chefs.find(chef => chef.ID_User === currentUserId);
    const currentCritic = critics?.find(critic => critic.ID_User === currentUserId);

    let filteredRecetas = [];
    let filteredImages = [];

    if (currentChef) {
      // Filter recipes specifically for this chef
      filteredRecetas = recetas.filter(receta => receta.ID_Chef === currentChef.ID_Chef);
      
      // Si no hay recetas, mostrar un mensaje
      if (filteredRecetas.length === 0) {
        const publicacionesContainer = document.querySelector('.tab-content.publicaciones');
        publicacionesContainer.innerHTML = '<p>Aún no tienes publicaciones.</p>';
      } else {
        generarPublicaciones(filteredRecetas, chefs, users);
      }
      
      // Collect all images from the chef's recipes for the gallery
      filteredImages = filteredRecetas.flatMap(receta => 
        receta.Imagenes.map(img => img.startsWith('http') ? img : `http://25.61.139.76:3000/img/recetas/${img}`)
      );      
    } else if (currentCritic) {
      // If user is a critic, leave recipes empty
      filteredRecetas = [];
    }

    generarGaleria(filteredImages);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
}

function generarPublicaciones(recetas, chefs, users) {
  const publicacionesContainer = document.querySelector('.tab-content.publicaciones');
  publicacionesContainer.innerHTML = '';

  recetas.forEach((receta) => {
    const chef = chefs.find((c) => c.Id_Chef === receta.Id_Chef);
    const user = chef ? users.find((u) => u.ID_User === chef.ID_User) : null;

    const chefImage = user
      ? `http://25.61.139.76:3000/img/userIcons/${user.imagen}?t=${Date.now()}`
      : 'http://25.61.139.76:3000/img/default.png?t=${Date.now()}';
    const chefName = user ? `${user.Nombre} ${user.ApellidoP}` : 'Chef Desconocido';

    const publicacion = document.createElement('div');
    publicacion.classList.add('publicacion');

    publicacion.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <img style="height: 70px; width: 70px; margin-right: 10px;" src="${chefImage}" alt="Foto de perfil">
        <div class="text-container">
          <h2 style="font-size: 18px; margin: 0;">${receta.Titulo_Receta}</h2>
          <p style="font-size: 14px; color: gray; margin: 2px 0;">By ${chefName}</p>
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
    `;

    // Carrusel de imágenes
    const carousel = document.createElement('div');
    carousel.classList.add('carousel');
    carousel.innerHTML = `
      <button class="btn left">&lt;</button>
      <div class="carousel-images">
        ${receta.Imagenes.map((imgUrl) => `<img src="${imgUrl}" alt="Imagen de receta">`).join('')}
      </div>
      <button class="btn right">&gt;</button>
    `;
    publicacion.appendChild(carousel);

    // Comentarios
    const comentarios = document.createElement('div');
    comentarios.classList.add('comentarios');
    comentarios.innerHTML = `
      <textarea placeholder="Deja tu comentario..."></textarea>
      <button>Comentar</button>
    `;
    publicacion.appendChild(comentarios);

    // Lista de comentarios
    const comentariosList = document.createElement('div');
    comentariosList.classList.add('comentarios-list');
    comentariosList.innerHTML = receta.Comentarios.map(
      (c) => `<div class="comentario-item"><strong>${c.Usuario}:</strong> ${c.Comentario}</div>`
    ).join('');
    publicacion.appendChild(comentariosList);

    publicacionesContainer.appendChild(publicacion);

    setupCarousel(carousel);
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

document.addEventListener('DOMContentLoaded', fetchRecetas);

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
  
  try {
      // Opción 1: Si necesitas hacer una solicitud al servidor para cerrar sesión
      await fetch('http://25.61.139.76:3000/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
      });
  } catch (error) {
      console.error('Error cerrando sesión:', error);
  }

  // Opción 2: Eliminar el token directamente en el frontend
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

      const response = await fetch('http://25.61.139.76:3000/deactivate-account', {
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



//nueva funcion
async function updateFollowersCount(userId) {
  try {
    // Solicitar información de chefs y críticos
    const [chefsResponse, criticsResponse] = await Promise.all([
      fetch('http://25.61.139.76:3000/read-chefs'),
      fetch('http://25.61.139.76:3000/read-food-critics')
    ]);

    const chefsData = await chefsResponse.json();
    const criticsData = await criticsResponse.json();

    // Encontrar el usuario actual en los chefs
    const chefProfile = chefsData.chefs.find(chef => chef.ID_User === userId);
    
    // Encontrar el usuario actual en los críticos
    const criticProfile = criticsData.food_rev.find(critic => critic.ID_User === userId);

    const followersElement = document.querySelector(".profile-details p:nth-child(2)");

    if (chefProfile) {
      // Si es chef (profesional o aficionado)
      followersElement.textContent = `${chefProfile.Seguidores.length} seguidores`;
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
          const response = await fetch('http://25.61.139.76:3000/create-recipe', {
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

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if the user is a chef
  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(atob(token.split('.')[1]));
  
  fetch('http://25.61.139.76:3000/read-chefs')
      .then(response => response.json())
      .then(chefsData => {
          const isChef = chefsData.chefs.some(chef => chef.ID_User === userData.userId);
          
          if (isChef) {
              initRecipePublication();
          }
      })
      .catch(error => {
          console.error('Error checking chef status:', error);
      });
});