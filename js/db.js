// --- BASE DE DATOS LOCAL Y VARIABLES GLOBALES ---
let canciones = JSON.parse(localStorage.getItem('ensamble_canciones')) || [];
let miembros = JSON.parse(localStorage.getItem('ensamble_miembros')) || [];
let sesiones = JSON.parse(localStorage.getItem('ensamble_sesiones')) || [];
let categoriasGlobales = JSON.parse(localStorage.getItem('ensamble_categorias')) || ['Batería', 'Bajo', 'Guitarra', 'Teclado', 'Voz Principal', 'Coros'];

// Estados de visualización e intercambio temporal
let idCancionVisualizando = null;
let idMiembroVisualizando = null;
let flagCreandoDesdeCancion = false;

// Al cargar la web, inicializamos los filtros y los renders iniciales
window.onload = () => {
    actualizarFiltrosInstrumentos();
    aplicarFiltrosCanciones();
    aplicarFiltroMiembros();
    actualizarListaSesiones();
    
    document.getElementById('search-songs').addEventListener('input', aplicarFiltrosCanciones);
    document.getElementById('search-miembros').addEventListener('input', aplicarFiltroMiembros);
};

// --- SERVICIO DE NAVEGACIÓN ---
function cambiarPestaña(vistaDestino, indexBoton) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${vistaDestino}`).classList.add('active');
    
    if(indexBoton !== null) {
        document.getElementById('main-nav').style.display = 'flex';
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.nav-item')[indexBoton].classList.add('active');
    } else {
        document.getElementById('main-nav').style.display = 'none';
    }
}

function abrirModal(idModal) { document.getElementById(idModal).style.display = 'flex'; }
function cerrarModal(idModal) { document.getElementById(idModal).style.display = 'none'; }

// --- UTILIDADES DE YOUTUBE ---
function obtenerIdYoutube(url) {
    if(!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}