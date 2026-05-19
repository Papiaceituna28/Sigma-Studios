let canciones = JSON.parse(localStorage.getItem('ensamble_canciones')) || [];
let miembros = JSON.parse(localStorage.getItem('ensamble_miembros')) || [];
let sesiones = JSON.parse(localStorage.getItem('ensamble_sesiones')) || [];
let categoriasGlobales = JSON.parse(localStorage.getItem('ensamble_categorias')) || ['Batería', 'Bajo', 'Guitarra', 'Teclado', 'Voz Principal', 'Coros'];

// Variables para saber cómo regresar sin perderse
let idCancionVisualizando = null;
let idMiembroVisualizando = null;
let origenNavegacionCancion = 'canciones'; // 'canciones' o 'miembro'
let flagCreandoDesdeCancion = false;

window.onload = () => {
    actualizarFiltrosInstrumentos();
    aplicarFiltrosCanciones();
    aplicarFiltroMiembros();
    actualizarListaSesiones();
    
    document.getElementById('search-songs').addEventListener('input', aplicarFiltrosCanciones);
    document.getElementById('search-miembros').addEventListener('input', aplicarFiltroMiembros);
};

// --- NAVEGACIÓN Y MENÚ LATERAL ---
function cambiarPestaña(vistaDestino, indexBoton) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${vistaDestino}`).classList.add('active');
    
    if(indexBoton !== null) {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.nav-item')[indexBoton].classList.add('active');
    }
}

function abrirSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').style.display = 'block';
}
function cerrarSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').style.display = 'none';
}

function abrirModal(idModal) { document.getElementById(idModal).style.display = 'flex'; }
function cerrarModal(idModal) { document.getElementById(idModal).style.display = 'none'; }

// --- HERRAMIENTAS GLOBALES ---
function obtenerIdYoutube(url) {
    if(!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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