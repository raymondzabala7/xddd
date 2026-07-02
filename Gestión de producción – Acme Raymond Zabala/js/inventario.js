window.inventario = [];

window.cargarInventario = async () => {
    try {
        const res = await fetch(`${window.URL_LOGIN}/inventario.json`);
        const data = await res.json();
        
        if (data) {
            window.inventario = Array.isArray(data) ? data.filter(i => i !== null) : Object.values(data);
        } else {
            window.inventario = [];
        }
        window.dibujarTabla(window.inventario);
    } catch (err) {
        console.error(err);
    }
};

window.dibujarTabla = (lista) => {
    const tbody = document.getElementById('invTableBody');
    tbody.innerHTML = '';
    lista.forEach(i => {
        tbody.innerHTML += `
            <tr>
                <td><b>${i.codigo}</b></td>
                <td>${i.nombre}</td>
                <td>${i.stock || 0}</td>
                <td>${i.formula ? 'Sí (Producto Terminado)' : 'No (Materia Prima)'}</td>
            </tr>`;
    });
};

document.getElementById('prodForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('pCode').value.trim();
    const nombre = document.getElementById('pName').value.trim();
    const proveedor = document.getElementById('pProv').value.trim();
    const formulaRaw = document.getElementById('pForm').value.trim();
    let formula = null;

    if (formulaRaw) {
        try { formula = JSON.parse(formulaRaw); } 
        catch { return alert('Formato JSON erróneo en Fórmula. Ejemplo: {"M01":100}'); }
    }

    window.inventario.push({ codigo, nombre, proveedor, stock: 0, formula });

    try {
        await fetch(`${window.URL_LOGIN}/inventario.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.inventario)
        });
        document.getElementById('prodForm').reset();
        await window.cargarInventario();
    } catch (err) {
        alert("Error al registrar el producto.");
    }
});

document.getElementById('stockForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('sCode').value.trim();
    const cant = parseInt(document.getElementById('sQty').value);

    const match = window.inventario.find(i => i.codigo === codigo);
    if (!match) return alert('El código especificado no existe en la base de datos.');

    match.stock = (match.stock || 0) + cant;

    try {
        await fetch(`${window.URL_LOGIN}/inventario.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.inventario)
        });
        document.getElementById('stockForm').reset();
        await window.cargarInventario();
    } catch (err) {
        alert("Error al actualizar stock.");
    }
});

document.getElementById('search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtrados = window.inventario.filter(i => i.nombre.toLowerCase().includes(term) || i.codigo.toLowerCase().includes(term));
    window.dibujarTabla(filtrados);
});

window.cargarInventario();