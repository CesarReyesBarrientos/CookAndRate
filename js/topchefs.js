let userResult; // Add this at the top of your script
const menuButton = document.getElementById("menuButton");
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");
const header = document.getElementById("mainHeader");
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
        // Obtener las recetas, los críticos y los usuarios (chefs) desde las APIs
        const [recetasResponse, criticosResponse, usersResponse, chefResponse] = await Promise.all([
            fetch('http://25.61.139.76:3000/read-recetas'),
            fetch('http://25.61.139.76:3000/read-food-critics'),
            fetch('http://25.61.139.76:3000/read-users'),
            fetch('http://25.61.139.76:3000/read-chefs')  // Obtenemos los usuarios (chefs)
        ]);

        const recetasData = await recetasResponse.json();
        const criticosData = await criticosResponse.json();
        const usersData = await usersResponse.json();
        const chefData = await chefResponse.json();

        if (recetasData.recetas && criticosData.food_rev && usersData.users) {
            // Filtrar los críticos
            const criticUserIds = criticosData.food_rev
                .filter(critico => critico.TipoCritico === "Critico")
                .map(critico => critico.ID_User);

            // Crear un mapa de chefs con su imagen
            const chefsMap = new Map();
            // usersData.users.forEach(user => {
            //     if (user.TipoUsuario === "Chef Profesional" || user.TipoUsuario === "Chef Aficionado") {
            //         chefsMap.set(user.ID_User, user.imagen); // Mapeamos el ID de usuario a la imagen
            //     }
            // });
            // Crear un mapa para almacenar el puntaje total de cada chef
            const chefScores = new Map();
            
            chefData.chefs.forEach(chef => {
                    chefsMap.set(chef.ID_Chef, usersData.users.find(u=> u.ID_User==chef.ID_User).imagen); // Mapeamos el ID de usuario a la imagen
                    chefScores.set(chef.ID_Chef, { totalScore: 0, recipeCount: 0 });
            });
            console.log('Mapa de chefs:', chefsMap); // Verifica el contenido del mapa



            

            // Inicializar el puntaje de todos los chefs con 0
            // usersData.users.forEach(user => {
            //     if (user.TipoUsuario === "Chef Profesional" || user.TipoUsuario === "Chef Aficionado") {
            //         chefScores.set(user.ID_User, { totalScore: 0, recipeCount: 0 });
            //     }
            // });

            // Procesar las recetas y calcular el puntaje de cada chef
            recetasData.recetas.forEach(receta => {
                const chefId = receta.ID_Chef;

                // Asegurarnos de que el chef está en el mapa de puntuaciones
                if (!chefScores.has(chefId)) {
                    chefScores.set(chefId, { totalScore: 0, recipeCount: 0 });
                }

                // Filtrar las calificaciones de los críticos
                const ratingsCriticos = receta.Rating.filter(rating => criticUserIds.includes(rating.ID_User));

                // Si hay calificaciones de críticos, calcular el promedio
                if (ratingsCriticos.length > 0) {
                    const totalCalificaciones = ratingsCriticos.reduce((total, rating) => total + rating.Calificacion, 0);
                    const promedio = totalCalificaciones / ratingsCriticos.length;

                    // Asociar el puntaje de la receta al chef
                    const chefData = chefScores.get(chefId);
                    chefData.totalScore += promedio; // Sumar el promedio de calificación
                    chefData.recipeCount += 1; // Contar las recetas del chef
                }
            });

            // Crear un ranking de chefs basado en el puntaje total
            const sortedChefs = [...chefScores.entries()]
                .map(([chefId, { totalScore, recipeCount }]) => ({
                    chefId,
                    averageScore: recipeCount > 0 ? totalScore / recipeCount : 0 // Promedio de todas las recetas del chef
                }))
                .sort((a, b) => b.averageScore - a.averageScore); // Ordenar de mayor a menor

            // Mostrar el ranking de chefs con sus imágenes
            displayChefRanking(sortedChefs, chefsMap);
        } else {
            console.error('Error al obtener datos desde las APIs.');
        }
    } catch (error) {
        console.error('Error al comunicarse con el backend:', error);
    }
});

// Función para mostrar el ranking de chefs con la imagen
const displayChefRanking = (ranking, chefsMap) => {
    const podium = document.querySelector('.podium');
    podium.innerHTML = ''; // Limpiar el contenido existente

    const podiumPositions = ['Primer Lugar', 'Segundo Lugar', 'Tercer Lugar'];
    const podiumClasses = ['podium-first', 'podium-second', 'podium-third'];

    // Iterar sobre los tres mejores chefs
    ranking.slice(0, 3).forEach((chef, index) => {
        // Crear la tarjeta del chef
        const chefCard = document.createElement('div');
        chefCard.classList.add('chef-card', podiumClasses[index]); // Usar el índice actual para el estilo

        // Obtener la imagen del chef
        const chefImage = chefsMap.get(chef.chefId) || 'default.jpg';
        const imagePath = `http://25.61.139.76:3000/img/userIcons/${chefImage}`;

        // Crear la sección de imagen
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('chef-carousel-images');

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `Chef ${chef.chefId}`;
        img.onerror = () => {
            img.src = 'http://25.61.139.76:3000/img/userIcons/default.jpg';
        };

        imageDiv.appendChild(img);

        // Crear la sección de nombre debajo de la imagen
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('chef-text-below');
        nameDiv.textContent = `Chef ${chef.chefId}`; // Cambiar por el nombre si está disponible

        // Crear la etiqueta de posición
        const positionLabel = document.createElement('div');
        positionLabel.classList.add('position-label');
        positionLabel.textContent = podiumPositions[index]; // "Primer Lugar", etc.

        // Crear la sección de estadísticas
        const statsDiv = document.createElement('div');
        statsDiv.classList.add('chef-stats');
        statsDiv.innerHTML = `
            <div class="total-score">Puntuación Promedio: ${chef.averageScore.toFixed(2)}</div>
        `;

        // Ensamblar la tarjeta
        chefCard.appendChild(imageDiv);
        chefCard.appendChild(nameDiv);
        chefCard.appendChild(positionLabel);
        chefCard.appendChild(statsDiv);
        podium.appendChild(chefCard);
    });

    // Validar si no hay datos en el ranking
    if (ranking.length === 0) {
        const noDataDiv = document.createElement('div');
        noDataDiv.textContent = 'No hay chefs para mostrar en el ranking.';
        podium.appendChild(noDataDiv);
    }
};
