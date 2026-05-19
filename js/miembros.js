let tempCategoriasSeleccionadas = [];
let idMiembroEditando = null;

function actualizarFiltrosInstrumentos() {
    const select = document.getElementById('filter-inst-miembro');
    select.innerHTML = '<option value="">Instrumento: Todos</option>';
    categoriasGlobales.forEach(c => {
        const op = document.createElement('option'); op.value = c; op.textContent = c; select.appendChild(op);
    });
}

function abrirModalMiembro() {
    idMiembroEditando = null;
    document.getElementById('titulo-modal-miembro').innerText = "Nuevo Integrante";
    document.getElementById('m-nombre').value = "";
    document.getElementById('m-foto').value = "";
    tempCategoriasSeleccionadas = [];
    renderizarCategoriasEnFormulario();
    abrirModal('modal-miembro');
}

function editarMiembroActual() {
    const m = miembros.find(x => x.id === idMiembroVisualizando);
    if(!m) return;
    idMiembroEditando = m.id;
    document.getElementById('titulo-modal-miembro').innerText = "Editar Integrante";
    document.getElementById('m-nombre').value = m.nombre;
    document.getElementById('m-foto').value = m.foto;
    tempCategoriasSeleccionadas = [...m.instrumentos];
    renderizarCategoriasEnFormulario();
    abrirModal('modal-miembro');
}

function renderizarCategoriasEnFormulario() {
    const contenedor = document.getElementById('categorias-pills-container');
    contenedor.innerHTML = "";
    categoriasGlobales.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = `pill-button ${tempCategoriasSeleccionadas.includes(cat) ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => {
            if(tempCategoriasSeleccionadas.includes(cat)) {
                tempCategoriasSeleccionadas = tempCategoriasSeleccionadas.filter(c => c !== cat);
                btn.classList.remove('active');
            } else { tempCategoriasSeleccionadas.push(cat); btn.classList.add('active'); }
        };
        contenedor.appendChild(btn);
    });
}

function crearNuevaCategoriaGlobal() {
    const valor = document.getElementById('nueva-categoria-input').value.trim();
    if(!valor) return;
    if(!categoriasGlobales.includes(valor)) {
        categoriasGlobales.push(valor);
        localStorage.setItem('ensamble_categorias', JSON.stringify(categoriasGlobales));
        actualizarFiltrosInstrumentos();
    }
    if(!tempCategoriasSeleccionadas.includes(valor)) tempCategoriasSeleccionadas.push(valor);
    document.getElementById('nueva-categoria-input').value = "";
    renderizarCategoriasEnFormulario();
}

function guardarMiembro() {
    const nombre = document.getElementById('m-nombre').value.trim();
    if(!nombre) return alert("El nombre es obligatorio");

    if(idMiembroEditando) {
        const m = miembros.find(x => x.id === idMiembroEditando);
        m.nombre = nombre; m.foto = document.getElementById('m-foto').value.trim();
        m.instrumentos = tempCategoriasSeleccionadas.length > 0 ? tempCategoriasSeleccionadas : ['Varios'];
        canciones.forEach(c => {
            c.asignaciones.forEach(a => { if(a.miembroId === m.id) a.nombre = m.nombre; });
        });
        localStorage.setItem('ensamble_canciones', JSON.stringify(canciones));
    } else {
        miembros.push({
            id: Date.now(), nombre: nombre, 
            instrumentos: tempCategoriasSeleccionadas.length > 0 ? tempCategoriasSeleccionadas : ['Varios'],
            foto: document.getElementById('m-foto').value.trim() || ''
        });
    }

    localStorage.setItem('ensamble_miembros', JSON.stringify(miembros));
    cerrarModal('modal-miembro');
    aplicarFiltroMiembros();
    
    if(idMiembroEditando && idMiembroVisualizando) verDetalleMiembro(idMiembroVisualizando);
    if(flagCreandoDesdeCancion) { abrirSubModalSeleccion(); flagCreandoDesdeCancion = false; }
}

function aplicarFiltroMiembros() {
    const texto = document.getElementById('search-miembros').value.toLowerCase();
    const inst = document.getElementById('filter-inst-miembro').value;
    const filtrados = miembros.filter(m => m.nombre.toLowerCase().includes(texto) && (inst === "" || m.instrumentos.includes(inst)));
    
    const contenedor = document.getElementById('lista-miembros');
    contenedor.innerHTML = "";
    if(filtrados.length === 0) return contenedor.innerHTML = '<div class="no-data">No hay integrantes</div>';

    filtrados.forEach(m => {
        const div = document.createElement('div'); div.className = 'item-card';
        div.onclick = () => verDetalleMiembro(m.id);
        let avatarHTML = m.foto ? `<div class="item-avatar" style="background-image: url('${m.foto}')"></div>` : `<div class="item-avatar"><span class="material-icons">person</span></div>`;
        let tagsHTML = m.instrumentos.map(t => `<span class="member-tag-small"><span class="material-icons" style="font-size:11px;">music_note</span> ${t}</span>`).join('');

        div.innerHTML = `<div class="item-main">${avatarHTML}<div class="item-details"><span class="item-title">${m.nombre}</span><div>${tagsHTML}</div></div></div><span class="material-icons" style="color:#48484a;">chevron_right</span>`;
        contenedor.appendChild(div);
    });
}

function verDetalleMiembro(id) {
    idMiembroVisualizando = id;
    const m = miembros.find(x => x.id === id);
    if(!m) return;

    let susCanciones = canciones.filter(c => c.asignaciones.some(a => a.miembroId === id));
    susCanciones.sort((a,b) => {
        const timeA = (a.ensayos && a.ensayos.length > 0) ? new Date(a.ensayos[a.ensayos.length-1].fecha).getTime() : 0;
        const timeB = (b.ensayos && b.ensayos.length > 0) ? new Date(b.ensayos[b.ensayos.length-1].fecha).getTime() : 0;
        return timeA - timeB;
    });

    let listaCancionesHTML = susCanciones.map(c => {
        let textClass = c.estado === 'Lista' ? 'text-lista' : (c.estado === 'Por Ensayar' ? 'text-ensayar' : 'text-sin');
        let fechaText = c.ensayos && c.ensayos.length > 0 ? new Date(c.ensayos[c.ensayos.length-1].fecha).toLocaleDateString() : 'Nunca ensayado';
        return `<div class="item-card" onclick="verDetalleCancion(${c.id})" style="border:1px solid #1c1c1e; border-radius:8px; padding:10px; margin-bottom:8px;">
            <div class="item-details"><span class="item-title">${c.titulo}</span><span class="item-sub ${textClass}">Último: ${fechaText}</span></div><span class="material-icons" style="color:#48484a;">arrow_forward</span>
        </div>`;
    }).join('') || '<p style="color:#8e8e93; font-size:14px;">Sin canciones asignadas.</p>';

    let avatarLargeHTML = m.foto ? `<img src="${m.foto}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin-bottom:15px;">` : `<div style="width:100px; height:100px; border-radius:50%; background:#1c1c1e; color:#34c759; display:flex; align-items:center; justify-content:center; margin-bottom:15px;"><span class="material-icons" style="font-size:50px;">person</span></div>`;
    
    document.getElementById('detalle-miembro-contenido').innerHTML = `
        <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #1c1c1e;">${avatarLargeHTML}<h2 style="margin:0;">${m.nombre}</h2><div style="margin-top:10px;">${m.instrumentos.map(t => `<span class="member-tag-small" style="font-size:13px; padding:4px 8px;"><span class="material-icons" style="font-size:14px;">music_note</span> ${t}</span>`).join('')}</div></div>
        <div class="detail-section"><h4>Repertorio (Menos a más reciente)</h4>${listaCancionesHTML}</div>`;

    document.getElementById('btn-eliminar-miembro-actual').onclick = () => {
        if(confirm("¿Eliminar integrante de todas las canciones?")) {
            miembros = miembros.filter(x => x.id !== id);
            canciones.forEach(c => c.asignaciones = c.asignaciones.filter(a => a.miembroId !== id));
            localStorage.setItem('ensamble_miembros', JSON.stringify(miembros));
            localStorage.setItem('ensamble_canciones', JSON.stringify(canciones));
            aplicarFiltroMiembros(); aplicarFiltrosCanciones(); cambiarPestaña('miembros', 1);
        }
    };
    cambiarPestaña('detalle-miembro', null);
}