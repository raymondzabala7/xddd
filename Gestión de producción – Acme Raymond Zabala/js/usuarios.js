window.users = [];
window.indexEditando = -1;

window.cargarUsuarios = async () => {
    try {
        const res = await fetch(`${window.URL_LOGIN}/users.json`);
        const data = await res.json();
        
        if (data) {
            window.users = Array.isArray(data) ? data.filter(u => u !== null) : Object.values(data);
        } else {
            window.users = [];
        }

        window.dibujarTabla();
    } catch (err) {
        console.error(err);
    }
};

window.dibujarTabla = () => {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    window.users.forEach((u, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${u.identificacion}</td>
                <td>${u.nombre}</td>
                <td>${u.cargo}</td>
                <td>
                    <button class="btn" onclick="window.editarUser(${index})">Editar</button>
                    <button class="btn btn-danger" onclick="window.eliminarUser(${index})">X</button>
                </td>
            </tr>`;
    });
};

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const identificacion = document.getElementById('userIdNum').value.trim();
    const nombre = document.getElementById('userName').value.trim();
    const cargo = document.getElementById('userRole').value;
    const password = document.getElementById('userPass').value;
    const confirm = document.getElementById('userPassConfirm').value;

    if (password !== confirm) { return alert("Las contraseñas no coinciden"); }

    const userObj = { identificacion, nombre, cargo, password };

    if (window.indexEditando > -1) {
        window.users[window.indexEditando] = userObj;
    } else {
        window.users.push(userObj);
    }

    try {
        await fetch(`${window.URL_LOGIN}/users.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.users)
        });

        document.getElementById('userForm').reset();
        window.indexEditando = -1;
        await window.cargarUsuarios();
    } catch (err) {
        alert("Error al intentar guardar el usuario.");
    }
});

window.editarUser = (index) => {
    const u = window.users[index];
    if (u) {
        window.indexEditando = index;
        document.getElementById('userIdNum').value = u.identificacion;
        document.getElementById('userName').value = u.nombre;
        document.getElementById('userRole').value = u.cargo;
        document.getElementById('userPass').value = u.password;
        document.getElementById('userPassConfirm').value = u.password;
    }
};

window.eliminarUser = async (index) => {
    if (confirm('¿Eliminar permanentemente este usuario de la tabla y base de datos?')) {
        window.users.splice(index, 1);
        try {
            await fetch(`${window.URL_LOGIN}/users.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(window.users)
            });
            await window.cargarUsuarios();
        } catch (err) {
            alert("Error al eliminar.");
        }
    }
};

window.cargarUsuarios();