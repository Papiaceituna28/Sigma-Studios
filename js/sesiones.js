function actualizarListaSesiones() {
    const contenedor = document.getElementById('lista-sesiones'); contenedor.innerHTML = "";
    if(sesiones.length === 0) return contenedor.innerHTML = '<div class="no-data">No hay sesiones planeadas</div>';
    sesiones.forEach(s => {
        const div = document.createElement('div'); div.className = 'item-card';
        div.innerHTML = `<div class="item-main"><div class="item-avatar" style="color: #ff9500;"><span class="material-icons">event</span></div><div class="item-details"><span class="item-title">${s.fecha}</span><span class="item-sub">${s.descripcion}</span></div></div>`;
        contenedor.appendChild(div);
    });
}

function guardarSesion() {
    const fecha = document.getElementById('s-fecha').value.trim(); if(!fecha) return alert("Fecha obligatoria");
    sesiones.push({ id: Date.now(), fecha: fecha, descripcion: document.getElementById('s-descripcion').value || 'Ensayo regular' });
    localStorage.setItem('ensamble_sesiones', JSON.stringify(sesiones));
    document.getElementById('s-fecha').value = ""; document.getElementById('s-descripcion').value = "";
    cerrarModal('modal-sesion'); actualizarListaSesiones();
}