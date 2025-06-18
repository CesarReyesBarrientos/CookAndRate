
const menuButton = document.getElementById("menuButton");
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");
const header = document.getElementById("mainHeader");
let userResult;
let dataR;

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
    }
};

function updateUserInterface() {
    // Función para actualizar la interfaz con los datos cargados
    if (userResult) {
        // Ejemplo: actualizar nombre de usuario
        document.getElementById('userName').textContent = userResult.Nombre + " " + userResult.Ape_Pat + " " + userResult.Ape_Mat;
                
        // Ejemplo: actualizar imagen de perfil
        console.log('USER: ', dataR);
        if (dataR.icon) {
            console.log('Imagen: ', dataR.icon);
            const userImage = `${dataR.icon}`;
            document.getElementById('userIcon').src = userImage;
            // console.log(foodRResult.Seguidos);
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
            //console.log('Datos del usuario', userData.userId);
            const data = {};
            data.userId = userData.userId;
            fetch('http://localhost:3000/find-user-by-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then((response) => response.json())
            .then((result) => {
                userResult = result.user;
                dataR = result;
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

// Información manual de los restaurantes
const restaurantData = {
    1: {
        name: "Disfrutar",
        image: "https://i0.wp.com/yummybarcelona.com/wp-content/uploads/2023/10/restaurant-disfrutar-barcelona-3.jpg?resize=900%2C675&ssl=1",
        hours: "Monday to Sunday: 1:00 PM - 3:00 PM, 8:00 PM - 10:00 PM",
        review: "An excellent gastronomic experience with innovative flavors."
    },
    2: {
        name: "Pujol",
        image: "https://images.squarespace-cdn.com/content/v1/62c0918972f37e3fad1564cb/14c3438e-2b08-45b2-8d37-1d6526290163/JSa_Pujol_LGM_0072+%28Header%29.jpg",
        hours: "Tuesday to Saturday: 1:00 PM - 10:30 PM",
        review: "A tribute to traditional and contemporary Mexican cuisine."
    },
    3: {
        name: "Table by Bruno Verjus",
        image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhm0kl5FUB449IqCvGDblxMZtpmCYYKYlGQJ6FbqP2UnvqdMqNgkrdErO5o0B_8SeuNQPd-r-r-zeQAXyJd1fXKhGG1d7LHtqMPb8L0PzjWzFPBCngDq0ib2GZa0Sfy-BtneFsEDdH0yek/s1600/table+restaurant+bruno+verjus+paris+75012+exterior.jpg",
        hours: "Tuesday to Saturday: 12:00 PM - 2:30 PM, 7:00 PM - 10:00 PM",
        review: "A cozy spot with an artistic culinary proposal."
    },
    4: {
        name: "Atomix",
        image: "https://images.squarespace-cdn.com/content/v1/5ac3bec4aa49a18caab02bf4/1648580412075-5P22YY93JUD4GPIHSG5Y/220202_Atomix_8184.jpg?format=2500w",
        hours: "Wednesday to Sunday: 6:00 PM - 11:00 PM",
        review: "A fusion of modern Korean cuisine with a sophisticated ambiance."
    },
    5: {
        name: "Gaggan",
        image: "https://gaggan.com/wp-content/uploads/2023/07/img_-gaggan-gg-2.png",
        hours: "Tuesday to Sunday: 6:00 PM - 11:00 PM",
        review: "Creativity in every dish with flavors from Southeast Asia."
    }
};

// Coordenadas de los restaurantes
const coordinates = {
    1: { lng: 2.15899, lat: 41.3825 },  // Disfrutar, Barcelona
    2: { lng: -99.1677, lat: 19.4326 }, // Pujol, Mexico City
    3: { lng: 2.3522, lat: 48.8566 },   // Paris
    4: { lng: -73.9851, lat: 40.758 },  // New York
    5: { lng: 100.5018, lat: 13.7563 }  // Bangkok
};

// Función para inicializar un mapa
function initMap(containerId, restaurantId) {
    const restaurant = restaurantData[restaurantId];
    const { lng, lat } = coordinates[restaurantId];

    // Crear el mapa
    const map = new mapboxgl.Map({
        container: containerId,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat],
        zoom: 18
    });

    // Agregar marcador con ventana emergente personalizada
    new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
            <div style="text-align: center;">
                <h3>${restaurant.name}</h3>
                <img src="${restaurant.image}" alt="${restaurant.name}" style="width: 100%; max-width: 300px; height: auto; border-radius: 10px; margin: 10px 0;">
                <p><strong>Horarios:</strong> ${restaurant.hours}</p>
                <p><strong>Reseña:</strong> ${restaurant.review}</p>
            </div>
        `))
        .addTo(map);
}

// Función de Lazy Loading para mapas
function lazyLoadMaps() {
    // Crear un Intersection Observer para cargar mapas cuando sean visibles
    const mapContainers = document.querySelectorAll('[id^="map-"]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const containerId = entry.target.id;
                const restaurantId = parseInt(containerId.split('-')[1]);
                
                // Inicializar el mapa solo cuando sea visible
                initMap(containerId, restaurantId);
                
                // Dejar de observar este contenedor
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1 // Gatilla cuando el 10% del contenedor es visible
    });

    // Observar todos los contenedores de mapas
    mapContainers.forEach(container => {
        observer.observe(container);
    });
}

// Obtener el token de Mapbox y configurar los mapas
fetch('http://localhost:3000/mapbox-token')
    .then(response => response.json())
    .then(data => {
        mapboxgl.accessToken = data.token;
        
        // Llamar a la función de lazy loading después de obtener el token
        lazyLoadMaps();
    })
    .catch(error => console.error('Error obteniendo el token:', error));