let userResult; // Add this at the top of your script

document.addEventListener("DOMContentLoaded", async () => {
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
    }
    try {
        // Obtener datos de chefs
        const chefsResponse = await fetch('http://25.61.139.76:3000/read-chefs');
        const chefsData = await chefsResponse.json();

        // Obtener datos de recetas
        const recetasResponse = await fetch('http://25.61.139.76:3000/read-recetas');
        const recetasData = await recetasResponse.json();

        // Obtener datos de usuarios
        const usersResponse = await fetch('http://25.61.139.76:3000/read-users');
        const usersData = await usersResponse.json();

        const chefs = chefsData.chefs;
        const recipes = recetasData.recetas;
        const users = usersData.users;

        // Calcular la popularidad de los chefs basándonos en los comentarios de las recetas
        const chefPopularity = {};

        recipes.forEach(recipe => {
            const chefId = recipe.ID_Chef;
            const comments = recipe.Comentarios.length;

            if (!chefPopularity[chefId]) {
                chefPopularity[chefId] = 0;
            }
            chefPopularity[chefId] += comments;
        });

        // Ordenar chefs por popularidad
        const sortedChefs = Object.entries(chefPopularity)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3) // Top 3 chefs
            .map(([chefId]) => {
                const chef = chefs.find(c => c.ID_Chef === chefId);
                const user = users.find(u => u.ID_User === chef.ID_User);
                return {
                    ...chef,
                    nombreCompleto: `${user.Nombre} ${user.ApellidoP} ${user.ApellidoM || ''}`.trim(),
                    imagen: user.imagen
                };
            });

        // Actualizar el DOM con el podio
        const podium = document.querySelector('.podium');
        podium.innerHTML = ''; // Limpiar contenido existente

        const positions = ['podium-first', 'podium-second', 'podium-third'];

        sortedChefs.forEach((chef, index) => {
            const chefCard = document.createElement('div');
            chefCard.classList.add('chef-card', positions[index]); // Agregar clase para posición

            const imageDiv = document.createElement('div');
            imageDiv.classList.add('chef-carousel-images');
            const img = document.createElement('img');
            img.src = `http://25.61.139.76:3000/img/userIcons/${chef.imagen}`; // Ajustar ruta de imágenes
            img.alt = `Chef ${chef.nombreCompleto}`;
            imageDiv.appendChild(img);

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('chef-text-below');
            nameDiv.textContent = chef.nombreCompleto;

            const positionLabel = document.createElement('div');
            positionLabel.classList.add('position-label');
            positionLabel.textContent = `${index + 1}${index === 0 ? 'er' : 'do'} Lugar`;

            chefCard.appendChild(imageDiv);
            chefCard.appendChild(nameDiv);
            chefCard.appendChild(positionLabel);
            podium.appendChild(chefCard);
        });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
});

// Menú interactivo
const menuButton = document.getElementById("menuButton");
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");

menuButton.addEventListener("click", () => {
    menuWindow.classList.add("open");
});

closeMenu.addEventListener("click", () => {
    menuWindow.classList.remove("open");
});

// Detectar scroll y agregar sombra al header
const header = document.getElementById("mainHeader");
window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});


function updateUserInterface() {
    if (userResult) {
        // Update user name
        const fullName = `${userResult.Nombre} ${userResult.ApellidoP} ${userResult.ApellidoM || ''}`.trim();
        
        // Check if elements exist before updating
        const userNameElement = document.getElementById('userName');
        const userIconElement = document.getElementById('userIcon');

        if (userNameElement) {
            userNameElement.textContent = fullName;
        }
        
        // Update user profile image
        if (userIconElement) {
            console.log('User imagen:', userResult.imagen); // Depuración
            
            if (userResult.imagen) {
                const userImage = `http://25.61.139.76:3000${userResult.imagen}`;

                console.log('Full image URL:', userImage); // Depuración
                
                userIconElement.src = userImage;
                userIconElement.alt = fullName;
                
                // Añadir manejo de error de imagen
                userIconElement.onerror = function() {
                    console.error('Error al cargar la imagen');
                 
                };
            } else {
                console.log('No hay imagen de usuario');
           
            }
        }
    }
}

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
