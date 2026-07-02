document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const idNum = document.getElementById('loginId').value.trim();
    const pass = document.getElementById('loginPass').value;

    try {
        const res = await fetch(`${window.URL_LOGIN}/users.json`);
        const data = await res.json();
        
        if (!data) {
            alert('No hay usuarios registrados en la base de datos.');
            return;
        }

        const listaLimpia = Array.isArray(data) ? data.filter(u => u !== null) : Object.values(data);
        const usuarioValido = listaLimpia.find(u => u.identificacion === idNum && u.password === pass);

        if (usuarioValido) {
            alert(`¡Bienvenido/a ${usuarioValido.nombre}!`);
            window.location.href = 'inventario.html';
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    } catch (error) {
        console.error(error);
        alert('Error al conectar con la base de datos.');
    }
});