let tempAsignacionesCancion = [];
let miembroSeleccionadoParaAsignar = null;
let idCancionEditando = null;

function abrirModalCancion() {
    idCancionEditando = null; tempAsignacionesCancion = [];
    document.getElementById('titulo-modal-cancion').innerText = "Añadir Nueva Canción";
    document.querySelectorAll('#modal-cancion input, #modal-cancion textarea').forEach(i => i.value = "");
    document.getElementById('c-estado').value = "Por Ensayar";
    renderizarAsignacionesTemporales(); irAPaso1(); abrirModal('modal-cancion');
}

function editarCancionActual() {
    const c = canciones.find(x => x.id === idCancionVisualizando);
    if(!c) return;
    idCancionEditando = c.id;
    document.getElementById('titulo-modal-cancion').innerText = "Editar Canción";
    document.getElementById('c-titulo').value = c.titulo;
    document.getElementById('c-artista').value = c.artista;
    document.getElementById('c-album').value = c.album || "";
    document.getElementById('c-link').value = c.link;
    document.getElementById('c-estado').value = c.estado;
    document.getElementById('c-notas').value = c.notas;
    tempAsignacionesCancion = [...c.asignaciones];
    renderizarAsignacionesTemporales(); irAPaso1(); abrirModal('modal-cancion');
}

function irAPaso1() { document.getElementById('cancion-paso-2').classList.remove('active'); document.getElementById('cancion-paso-1').classList.add('active'); }
function irAPaso2() { 
    if(!document.getElementById('c-titulo').value.trim()) return alert("El título es obligatorio");
    document.getElementById('cancion-paso-1').classList.remove('active'); document.getElementById('cancion-paso-2').classList.add('active'); 
}

function abrirSubModalSeleccion() {
    const contenedor = document.getElementById('sub-lista-miembros-disponibles'); contenedor.innerHTML = "";
    miembroSeleccionadoParaAsignar = null; document.getElementById('bloque-seleccion-instrumento').style.display = 'none'; document.getElementById('btn-confirmar-asignacion').disabled = true;

    const disponibles = miembros.filter(m => !tempAsignacionesCancion.some(a => a.miembroId === m.id));
    if(disponibles.length === 0) contenedor.innerHTML = '<p style="color:#aaa; text-align:center;">Todos los músicos están asignados.</p>';

    disponibles.forEach(m => {
        const row = document.createElement('div'); row.className = 'select-member-row'; row.id = `row-musico-${m.id}`;
        row.innerHTML = `<span>${m.nombre}</span> <span style="font-size:12px; color:#8e8e93;">${m.instrumentos.join(', ')}</span>`;
        row.onclick = () => {
            miembroSeleccionadoParaAsignar = m;
            document.querySelectorAll('.select-member-row').forEach(r => r.classList.remove('selected'));
            document.getElementById(`row-musico-${m.id}`).classList.add('selected');
            const select = document.getElementById('sub-select-instrumento-musico'); select.innerHTML = "";
            m.instrumentos.forEach(ins => { const op = document.createElement('option'); op.value = ins; op.textContent = ins; select.appendChild(op); });
            document.getElementById('bloque-seleccion-instrumento').style.display = 'block'; document.getElementById('btn-confirmar-asignacion').disabled = false;
        };
        contenedor.appendChild(row);
    });
    abrirModal('sub-modal-seleccion');
}

function cerrarSubModalSeleccion() { cerrarModal('sub-modal-seleccion'); }
function abrirModalDesdeSub() { flagCreandoDesdeCancion = true; cerrarSubModalSeleccion(); abrirModalMiembro(); }

function confirmarAsignacionResponsable() {
    if(!miembroSeleccionadoParaAsignar) return;
    tempAsignacionesCancion.push({ miembroId: miembroSeleccionadoParaAsignar.id, nombre: miembroSeleccionadoParaAsignar.nombre, instrumento: document.getElementById('sub-select-instrumento-musico').value });
    renderizarAsignacionesTemporales(); cerrarSubModalSeleccion();
}

function renderizarAsignacionesTemporales() {
    const contenedor = document.getElementById('user-list-asignaciones'); contenedor.innerHTML = "";
    tempAsignacionesCancion.forEach((asig, index) => {
        const div = document.createElement('div'); div.className = 'asig-item';
        div.innerHTML = `<div><strong>${asig.nombre}</strong> <span style="color:#5ac8fa;">(${asig.instrumento})</span></div>
            <span class="material-icons" style="color:#ff453a; cursor:pointer;" onclick="tempAsignacionesCancion.splice(${index},1); renderizarAsignacionesTemporales();">remove_circle</span>`;
        contenedor.appendChild(div);
    });
}

function finalizarGuardadoCancion() {
    const obj = {
        titulo: document.getElementById('c-titulo').value.trim(),
        artista: document.getElementById('c-artista').value.trim() || 'Desconocido',
        album: document.getElementById('c-album').value.trim(),
        link: document.getElementById('c-link').value.trim(),
        estado: document.getElementById('c-estado').value,
        notas: document.getElementById('c-notas').value.trim(),
        asignaciones: tempAsignacionesCancion
    };
    if(idCancionEditando) { const c = canciones.find(x => x.id === idCancionEditando); Object.assign(c, obj); } 
    else { obj.id = Date.now(); obj.ensayos = []; canciones.push(obj); }

    localStorage.setItem('ensamble_canciones', JSON.stringify(canciones));
    cerrarModal('modal-cancion'); aplicarFiltrosCanciones();
    if(idCancionEditando) verDetalleCancion(idCancionVisualizando);
}

function tiempoDesde(fecha) {
    if(!fecha) return 'Sin ensayos';
    const d = new Date(fecha);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Hoy';

    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffMs = startToday - startDate;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
    const years = Math.floor(months / 12);
    return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
}

function aplicarFiltrosCanciones() {
    const texto = document.getElementById('search-songs').value.toLowerCase();
    const estado = document.getElementById('filter-estado-cancion').value;
    const orden = document.getElementById('sort-ensayo-cancion').value;

    let filtradas = canciones.filter(c => ((c.titulo||'').toLowerCase().includes(texto) || (c.artista||'').toLowerCase().includes(texto)) && (estado === "" || c.estado === estado));
    
    filtradas.sort((a,b) => {
        const timeA = a.ensayos && a.ensayos.length > 0 ? new Date(a.ensayos[a.ensayos.length-1].fecha).getTime() : 0;
        const timeB = b.ensayos && b.ensayos.length > 0 ? new Date(b.ensayos[b.ensayos.length-1].fecha).getTime() : 0;
        return orden === 'menos-reciente' ? timeA - timeB : timeB - timeA;
    });

    const contenedor = document.getElementById('lista-canciones'); contenedor.innerHTML = "";
    if(filtradas.length === 0) return contenedor.innerHTML = '<div class="no-data">Sin canciones</div>';

    filtradas.forEach(c => {
        const div = document.createElement('div'); div.className = 'item-card'; div.onclick = () => verDetalleCancion(c.id);
        let textClass = c.estado === 'Lista' ? 'text-lista' : (c.estado === 'Por Ensayar' ? 'text-ensayar' : 'text-sin');
        const ytId = obtenerIdYoutube(c.link);
        let avatarHTML = ytId ? `<div class="item-avatar" style="background-image:url('https://img.youtube.com/vi/${ytId}/default.jpg')"></div>` : `<div class="item-avatar">${c.titulo.charAt(0).toUpperCase()}</div>`;
        let lastText = 'Sin ensayos';
        if (c.ensayos && c.ensayos.length > 0) {
            const last = c.ensayos[c.ensayos.length-1];
            lastText = tiempoDesde(last.fecha);
        }

        div.innerHTML = `<div class="item-main">${avatarHTML}<div class="item-details"><span class="item-tag">${c.artista}</span><span class="item-title">${c.titulo}</span><span class="item-sub ${textClass}">${c.estado} • ${lastText}</span></div></div><span class="material-icons" style="color:#48484a;">chevron_right</span>`;
        contenedor.appendChild(div);
    });
}

function verDetalleCancion(id) {
    idCancionVisualizando = id; const c = canciones.find(x => x.id === id); if(!c) return;
    let claseBadge = c.estado === 'Lista' ? 'badge-lista' : (c.estado === 'Por Ensayar' ? 'badge-ensayar' : 'badge-sin');
    const ytId = obtenerIdYoutube(c.link);
    let ytHTML = ytId ? `<iframe class="yt-embed" src="https://www.youtube.com/embed/${ytId}" allowfullscreen></iframe>` : '';

    let ultimoEnsayoHTML = `<p style="color:#8e8e93; font-size:14px;">Sin ensayos.</p>`;
    if(c.ensayos && c.ensayos.length > 0) {
        const ult = c.ensayos[c.ensayos.length-1];
        ultimoEnsayoHTML = `<div style="background:#1c1c1e; padding:12px; border-radius:8px; margin-bottom:10px;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><strong style="color:#ff9500;">${new Date(ult.fecha).toLocaleDateString()}</strong><span style="color:#5ac8fa; font-weight:bold; font-size:13px; cursor:pointer;" onclick="verHistorialEnsayos()">MÁS</span></div><div style="font-size:13px; color:#e5e5ea;">Participaron: ${ult.participantes.join(', ')}</div></div>`;
    }

    document.getElementById('detalle-cancion-contenido').innerHTML = `
        ${ytHTML}
        <div class="detail-header"><h2 class="detail-title">${c.titulo}</h2><p class="detail-artist">de ${c.artista} ${c.album ? `— Disco: ${c.album}` : ''}</p><span class="detail-badge ${claseBadge}">${c.estado}</span></div>
        <div class="detail-section"><div style="display:flex; justify-content:space-between; align-items:center;"><h4>Última Práctica</h4><button class="btn-add-pill" onclick="abrirRegistroEnsayo()"><span class="material-icons" style="font-size:16px;">add</span> Registrar</button></div>${ultimoEnsayoHTML}</div>
        <div class="detail-section"><h4>Estructura y Notas</h4><p style="background:#1c1c1e; padding:12px; border-radius:8px; margin:0; line-height:1.5; color:#e5e5ea; white-space: pre-wrap;">${c.notas || 'Sin notas.'}</p></div>
        <div class="detail-section"><h4>Roles Asignados</h4><ul style="padding-left:20px; line-height:2; margin:0;">${c.asignaciones.map(a => `<li><strong>${a.nombre}</strong>: <span style="color:#5ac8fa;">${a.instrumento}</span></li>`).join('') || '<li>Nadie asignado.</li>'}</ul></div>`;

    document.getElementById('btn-eliminar-cancion-actual').onclick = () => {
        if(confirm("¿Eliminar canción?")) { canciones = canciones.filter(x => x.id !== id); localStorage.setItem('ensamble_canciones', JSON.stringify(canciones)); aplicarFiltrosCanciones(); regresarACanciones(); }
    };
    cambiarPestaña('detalle-cancion', null);
}

function abrirRegistroEnsayo() {
    const c = canciones.find(x => x.id === idCancionVisualizando);
    document.getElementById('e-fecha').valueAsDate = new Date();
    const list = document.getElementById('e-participantes-list'); list.innerHTML = "";
    if(c.asignaciones.length === 0) list.innerHTML = "<p>No hay responsables asignados.</p>";
    c.asignaciones.forEach(a => {
        const div = document.createElement('label'); div.className = 'check-item';
        div.innerHTML = `<input type="checkbox" value="${a.nombre}" checked> <span>${a.nombre} (${a.instrumento})</span>`;
        list.appendChild(div);
    });
    abrirModal('modal-ensayo');
}

function guardarEnsayoCancion() {
    const c = canciones.find(x => x.id === idCancionVisualizando);
    const fecha = document.getElementById('e-fecha').value; if(!fecha) return alert("Fecha obligatoria");
    const parts = Array.from(document.querySelectorAll('#e-participantes-list input:checked')).map(i => i.value);
    if(!c.ensayos) c.ensayos = []; c.ensayos.push({ fecha: fecha, participantes: parts });
    c.ensayos.sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    localStorage.setItem('ensamble_canciones', JSON.stringify(canciones));
    cerrarModal('modal-ensayo'); verDetalleCancion(idCancionVisualizando); aplicarFiltrosCanciones();
}

function verHistorialEnsayos() {
    const c = canciones.find(x => x.id === idCancionVisualizando);
    const lista = document.getElementById('lista-historial-ensayos'); lista.innerHTML = "";
    if(!c.ensayos || c.ensayos.length === 0) lista.innerHTML = '<p class="no-data">Sin ensayos.</p>';
    else {
        [...c.ensayos].reverse().forEach(e => {
            const div = document.createElement('div'); div.className = 'item-card';
            div.innerHTML = `<div class="item-main"><div class="item-avatar" style="color:#ff9500;"><span class="material-icons">event</span></div><div class="item-details"><span class="item-title">${new Date(e.fecha).toLocaleDateString()}</span><span class="item-sub">${e.participantes.length} músicos</span></div></div>`;
            lista.appendChild(div);
        });
    }
    cambiarPestaña('historial-ensayos', null);
}

function regresarACanciones() { cambiarPestaña('canciones', 0); }
function regresarADetalleCancion() { verDetalleCancion(idCancionVisualizando); }