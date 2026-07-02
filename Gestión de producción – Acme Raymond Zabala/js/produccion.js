window.produccion = [];

window.cargarHistorial = async () => {
    try {
        const res = await fetch(`${window.URL_LOGIN}/produccion.json`);
        const data = await res.json();
        
        if (data) {
            window.produccion = Array.isArray(data) ? data.filter(p => p !== null) : Object.values(data);
        } else {
            window.produccion = [];
        }

        const tbody = document.getElementById('historyBody');
        tbody.innerHTML = '';
        window.produccion.forEach(o => {
            tbody.innerHTML += `<tr><td><b># ${o.consecutivo}</b></td><td>${o.producto}</td><td>${o.cantidad} U</td></tr>`;
        });

        return window.produccion.length;
    } catch (err) {
        console.error(err);
        return 0;
    }
};

document.getElementById('prodForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('exeCode').value.trim();
    const cantidad = parseInt(document.getElementById('exeQty').value);

    try {
        const invRes = await fetch(`${window.URL_LOGIN}/inventario.json`);
        let invData = await invRes.json();
        if (!invData) return alert("El inventario maestro se encuentra vacío.");

        let listaInv = Array.isArray(invData) ? invData.filter(i => i !== null) : Object.values(invData);
        const productoTerminado = listaInv.find(p => p.codigo === codigo);

        if (!productoTerminado || !productoTerminado.formula) {
            return alert("Código erróneo o no corresponde a producto con receta vinculada.");
        }

        let errorInsumos = false;
        let logInsumos = "";

        for (const [materiaCod, cantNecesaria] of Object.entries(productoTerminado.formula)) {
            const totalRequerido = cantNecesaria * cantidad;
            const insumo = listaInv.find(i => i.codigo === materiaCod);

            if (!insumo || (insumo.stock || 0) < totalRequerido) {
                errorInsumos = true;
                alert(`Error: Stock deficiente para [ ${materiaCod} ]. Requerido: ${totalRequerido}, En almacén: ${insumo ? insumo.stock : 0}`);
                break;
            }
            logInsumos += `• Descontados ${totalRequerido} de [ ${materiaCod} ]<br>`;
        }

        if (errorInsumos) return;
        for (const [materiaCod, cantNecesaria] of Object.entries(productoTerminado.formula)) {
            const totalRequerido = cantNecesaria * cantidad;
            const insumo = listaInv.find(i => i.codigo === materiaCod);
            insumo.stock -= totalRequerido;
        }

        productoTerminado.stock = (productoTerminado.stock || 0) + cantidad;

        await fetch(`${window.URL_LOGIN}/inventario.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(listaInv)
        });

        const totalOrdenes = await window.cargarHistorial();
        const consecutivoNuevo = totalOrdenes + 1;

        window.produccion.push({ consecutivo: consecutivoNuevo, producto: codigo, cantidad });

        await fetch(`${window.URL_LOGIN}/produccion.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.produccion)
        });

        document.getElementById('resumen').innerHTML = `
            <strong>Orden Exitosa (#${consecutivoNuevo})</strong><br><br>
            <b>Producto:</b> ${productoTerminado.nombre}<br>
            <b>Cantidad:</b> ${cantidad} unidades.<br><br>
            <b>Insumos Usados:</b><br>${logInsumos}
        `;

        document.getElementById('prodForm').reset();
        await window.cargarHistorial();
    } catch (err) {
        alert("Fallo interno en el motor de producción.");
    }
});

window.cargarHistorial();