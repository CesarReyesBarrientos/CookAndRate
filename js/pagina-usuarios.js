const menuButton = document.getElementById("menuButton");
const menuWindow = document.getElementById("menuWindow");
const closeMenu = document.getElementById("closeMenu");
const header = document.getElementById("mainHeader");
let userResult;
let chefResult; 
let recetasChefResult; 
let foodRResult;
const params = new URLSearchParams(window.location.search);
const userid = params.get('id');

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
            //getRecetas();
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

menuButton.addEventListener("click", () => {
    menuWindow.classList.add("open");
});

closeMenu.addEventListener("click", () => {
    menuWindow.classList.remove("open");
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
}
});

console.log(userid);
console.log(userResult);
console.log(chefResult);
