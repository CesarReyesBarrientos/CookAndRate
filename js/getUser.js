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

