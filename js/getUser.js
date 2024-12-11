window.onload = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión.');
        window.location.href = 'index.html';
    } else {
        //console.log('Token encontrado:', token);
        getUserData(token);
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
        }).then((response) => response.json())
        .then((result) => {
            console.log(result.user);
            if (result.chef) {
                console.log(result.chef);
                console.log(result.recetas);
            } else {
                console.log(result.foodr);
            }
        })
        .catch((error) => {
            console.error(error);
        });
    } else {
        console.error('Token inválido.');
    }
};

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
  const publicacionesContainer = document.querySelector('.tab-content.publicaciones');
  publicacionesContainer.innerHTML = ''; 

  recetas.forEach(receta => {
    // Encontrar al chef correspondiente
    const chef = chefs.find(c => c.Id_Chef === receta.Id_Chef);
    const user = chef ? users.find(u => u.ID_User === chef.ID_User) : null;

  
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
    ${Object.entries(receta.Ingredientes).map(([key, value]) => `&nbsp;&nbsp;${key}: ${value}<br>`).join('')}
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
        ${receta.Imagenes.map(imgUrl => `<img src="${imgUrl}" alt="Imagen de receta">`).join('')}
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
    comentariosList.innerHTML = receta.Comentarios.map(c => `
      <div class="comentario-item"><strong>${c.Usuario}:</strong> ${c.Comentario}</div>
    `).join('');
    publicacion.appendChild(comentariosList);

    publicacionesContainer.appendChild(publicacion);

    
    setupCarousel(carousel);
  });
}

//Lo del carrusel
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
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
    updateCarousel();
  });

  rightButton.addEventListener('click', () => {
    currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
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

