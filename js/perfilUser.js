window.onload = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
      alert('No estás autenticado. Por favor, inicia sesión.');
      window.location.href = 'index.html';
      return;
  }

  // Utilizando la función modificada
  getUserData(token).then(user => {
      if (user.Estado === 0) {
          alert('Tu cuenta está desactivada. Contacta al soporte si deseas reactivarla.');
          window.location.href = 'index.html';
      }
  })
  .catch(error => {
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

const getUserData = (token) => {
  return new Promise((resolve, reject) => {
      const userData = parseJWT(token);
      if (userData) {
          const data = { userId: userData.userId };
          fetch('http://25.61.139.76:3000/find-user-by-id', {
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

                  // Precargar los datos en el formulario
                  document.getElementById('nombre').value = result.user.Nombre;
                  document.getElementById('apellidoP').value = result.user.ApellidoP;
                  document.getElementById('apellidoM').value = result.user.ApellidoM;
                  document.getElementById('email').value = result.user.Email;
                  document.getElementById('email').setAttribute('data-original-email', result.user.Email);
                  document.getElementById('telefono').value = result.user.Telefono;
                  document.getElementById('biografia').value = result.user.Biografia;

                  resolve(result.user);
              } else {
                  console.error('No se encontró el usuario en los datos recibidos.');
                  reject(new Error('Usuario no encontrado'));
              }
          })
          .catch((error) => {
              console.error('Error al obtener los datos del usuario:', error);
              reject(error);
          });
      } else {
          console.error('Token inválido.');
          reject(new Error('Token inválido'));
      }
  });
};

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
          document.querySelector('.profile-details h2').textContent =
              `${updatedUser.Nombre} ${updatedUser.ApellidoP} ${updatedUser.ApellidoM}`;
          document.querySelector('.profile-details p:nth-of-type(2)').textContent =
              updatedUser.Biografia || 'Sin descripción.';
          if (updatedUser.imagen) {
              document.querySelector('.profile-photo img').src = `http://25.61.139.76:3000/img/userIcons/${updatedUser.imagen}`;
          }

          // Actualizar el formulario con los nuevos valores
          document.getElementById('nombre').value = updatedUser.Nombre;
          document.getElementById('apellidoP').value = updatedUser.ApellidoP;
          document.getElementById('apellidoM').value = updatedUser.ApellidoM;
          document.getElementById('email').value = updatedUser.Email;
          document.getElementById('telefono').value = updatedUser.Telefono;
          document.getElementById('biografia').value = updatedUser.Biografia;

      } else {
          alert('Error al actualizar el perfil');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al verificar o actualizar los datos.');
  }
});

// Resto del código (fetchRecetas, generarPublicaciones, etc.) permanece igual...
document.addEventListener('DOMContentLoaded', fetchRecetas);

async function fetchRecetas() {
  try {
    const recetasResponse = await fetch('http://25.61.139.76:3000/read-recetas');
    const recetasData = await recetasResponse.json();
    const recetas = recetasData.recetas;

    const chefsResponse = await fetch('http://25.61.139.76:3000/read-chefs');
    const chefsData = await chefsResponse.json();
    const chefs = chefsData.chefs;

    const usersResponse = await fetch('http://25.61.139.76:3000/read-users');
    const usersData = await usersResponse.json();
    const users = usersData.users;

    generarPublicaciones(recetas, chefs, users);
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
      ? `http://25.61.139.76:3000/img/${user.imagen}`
      : 'http://25.61.139.76:3000/img/default.png';
    const chefName = user ? `${user.Nombre} ${user.ApellidoP}` : 'Chef Desconocido';

    const publicacion = document.createElement('div');
    publicacion.classList.add('publicacion');

    publicacion.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <img style="height: 70px; width: 70px; margin-right: 10px;" src="${chefImage}" alt="Foto de perfil">
        <div class="text-container">
          <h2 style="font-size: 18px; margin: 0;">${receta.Titulo_Receta}</h2>
          <p style="font-size: 14px; color: gray; margin: 2px 0;">Por ${chefName}</p>
        </div>
      </div>
      <div class="main-text" style="margin: 10px 0; font-size: 16px; color: #333; text-align: justify;">
        <strong>Ingredientes:</strong><br>
        ${Object.entries(receta.Ingredientes)
          .map(([key, value]) => `&nbsp;&nbsp;${key}: ${value}<br>`)
          .join('')}
        <br>
        <strong>¡A cocinar!</strong><br>
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
  // Eliminar el token del localstorage
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
      console.log('Enviando userId al servidor:', userId); // Log para verificar

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
