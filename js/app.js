/**
 * ============================================
 * RECETAS DE LA ANTIGÜEDAD
 * Módulo Principal - Lógica de la aplicación
 * ============================================
 */

'use strict';

/**
 * Aplicación principal encapsulada usando el patrón módulo
 * para mantener el código organizado y evitar contaminar el scope global
 */
const App = (function() {
    // ============================================
    // REFERENCIAS AL DOM
    // ============================================
    const DOM = {
        // Vistas
        culturasView: document.getElementById('culturas-view'),
        recetasView: document.getElementById('recetas-view'),
        
        // Grids
        culturasGrid: document.getElementById('culturas-grid'),
        recetasGrid: document.getElementById('recetas-grid'),
        
        // Elementos de navegación
        btnVolver: document.getElementById('btn-volver'),
        recetasTitulo: document.getElementById('recetas-titulo'),
        
        // Modal
        modal: document.getElementById('modal'),
        modalImagen: document.getElementById('modal-imagen'),
        modalTitulo: document.getElementById('modal-titulo'),
        modalDescripcion: document.getElementById('modal-descripcion')
    };
    
    // ============================================
    // ESTADO DE LA APLICACIÓN
    // ============================================
    let state = {
        culturaActual: null,
        modalAbierto: false
    };
    
    // ============================================
    // FUNCIONES DE RENDERIZADO
    // ============================================
    
    /**
     * Crea el HTML de una tarjeta de cultura
     * @param {Object} cultura - Datos de la cultura
     * @returns {string} HTML de la tarjeta
     */
    function crearTarjetaCultura(cultura) {
        const imagenHTML = cultura.imagen 
            ? `<img 
                    src="${escapeHTML(cultura.imagen)}" 
                    alt="Imagen representativa de ${escapeHTML(cultura.nombre)}"
                    class="card__image"
                    loading="lazy"
                />`
            : `<div class="card__image card__image--placeholder" aria-hidden="true">🏛️</div>`;
        
        return `
            <article 
                class="card" 
                role="listitem"
                tabindex="0"
                data-cultura-id="${escapeHTML(cultura.id)}"
                aria-label="Ver recetas de ${escapeHTML(cultura.nombre)}"
            >
                <figure class="card__image-container">
                    ${imagenHTML}
                    <div class="card__overlay"></div>
                </figure>
                <div class="card__content">
                    <h2 class="card__title">${escapeHTML(cultura.nombre)}</h2>
                </div>
            </article>
        `;
    }
    
    /**
     * Crea el HTML de una tarjeta de receta
     * @param {Object} receta - Datos de la receta
     * @param {number} index - Índice de la receta
     * @returns {string} HTML de la tarjeta
     */
    function crearTarjetaReceta(receta, index) {
        const imagenHTML = receta.imagen 
            ? `<img 
                    src="${escapeHTML(receta.imagen)}" 
                    alt="${escapeHTML(receta.nombre)}"
                    class="card__image"
                    loading="lazy"
                />`
            : `<div class="card__image card__image--placeholder" aria-hidden="true">🍽️</div>`;
        
        return `
            <article 
                class="card" 
                role="listitem"
                tabindex="0"
                data-receta-index="${index}"
                aria-label="Ver detalles de ${escapeHTML(receta.nombre)}"
            >
                <figure class="card__image-container">
                    ${imagenHTML}
                    <div class="card__overlay"></div>
                </figure>
                <div class="card__content">
                    <h3 class="card__title">${escapeHTML(receta.nombre)}</h3>
                </div>
            </article>
        `;
    }
    
    /**
     * Renderiza el grid de culturas
     * @param {Array} culturas - Array de culturas
     */
    function renderizarCulturas(culturas) {
        if (!culturas || culturas.length === 0) {
            DOM.culturasGrid.innerHTML = `
                <div class="error">
                    <h2 class="error__title">No hay culturas disponibles</h2>
                    <p>Por favor, verifica el archivo de datos.</p>
                </div>
            `;
            return;
        }
        
        const html = culturas.map(crearTarjetaCultura).join('');
        DOM.culturasGrid.innerHTML = html;
    }
    
    /**
     * Renderiza el grid de recetas de una cultura
     * @param {Array} recetas - Array de recetas
     * @param {string} nombreCultura - Nombre de la cultura
     */
    function renderizarRecetas(recetas, nombreCultura) {
        DOM.recetasTitulo.textContent = `Recetas de ${nombreCultura}`;
        
        if (!recetas || recetas.length === 0) {
            DOM.recetasGrid.innerHTML = `
                <div class="error">
                    <h2 class="error__title">No hay recetas disponibles</h2>
                    <p>Esta cultura aún no tiene recetas registradas.</p>
                </div>
            `;
            return;
        }
        
        const html = recetas.map((receta, index) => crearTarjetaReceta(receta, index)).join('');
        DOM.recetasGrid.innerHTML = html;
    }
    
    /**
     * Muestra el estado de carga
     * @param {HTMLElement} container - Contenedor donde mostrar el loader
     */
    function mostrarCargando(container) {
        container.innerHTML = `
            <div class="loading">
                <div class="loading__spinner" aria-hidden="true"></div>
                <p class="loading__text">Cargando...</p>
            </div>
        `;
    }
    
    /**
     * Muestra un mensaje de error
     * @param {HTMLElement} container - Contenedor donde mostrar el error
     * @param {string} mensaje - Mensaje de error
     */
    function mostrarError(container, mensaje) {
        container.innerHTML = `
            <div class="error">
                <h2 class="error__title">Error</h2>
                <p>${escapeHTML(mensaje)}</p>
            </div>
        `;
    }
    
    // ============================================
    // FUNCIONES DE NAVEGACIÓN
    // ============================================
    
    /**
     * Cambia entre vistas con animación
     * @param {HTMLElement} vistaOcultar - Vista a ocultar
     * @param {HTMLElement} vistaMostrar - Vista a mostrar
     * @returns {Promise} Promesa que se resuelve cuando termina la animación
     */
    function cambiarVista(vistaOcultar, vistaMostrar) {
        return new Promise(resolve => {
            // Añadimos clase de salida
            vistaOcultar.classList.add('view--exiting');
            
            setTimeout(() => {
                // Ocultamos la vista anterior
                vistaOcultar.classList.remove('view--active', 'view--exiting');
                
                // Mostramos la nueva vista
                vistaMostrar.classList.add('view--active');
                
                // Scroll al inicio
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                resolve();
            }, 300); // Duración de la animación de salida
        });
    }
    
    /**
     * Navega a la vista de recetas de una cultura
     * @param {string} culturaId - ID de la cultura
     */
    async function navegarARecetas(culturaId) {
        try {
            const cultura = await DataService.obtenerCulturaPorId(culturaId);
            
            if (!cultura) {
                console.error(`Cultura "${culturaId}" no encontrada`);
                return;
            }
            
            state.culturaActual = cultura;
            
            await cambiarVista(DOM.culturasView, DOM.recetasView);
            renderizarRecetas(cultura.recetas, cultura.nombre);
            
            // Focus en el botón volver para accesibilidad
            DOM.btnVolver.focus();
            
        } catch (error) {
            console.error('Error al navegar a recetas:', error);
        }
    }
    
    /**
     * Vuelve a la vista de culturas
     */
    async function volverACulturas() {
        state.culturaActual = null;
        
        await cambiarVista(DOM.recetasView, DOM.culturasView);
        
        // Focus en el primer elemento del grid
        const primeraTarjeta = DOM.culturasGrid.querySelector('.card');
        if (primeraTarjeta) {
            primeraTarjeta.focus();
        }
    }
    
    // ============================================
    // FUNCIONES DEL MODAL
    // ============================================
    
    /**
     * Abre el modal con los datos de una receta
     * @param {Object} receta - Datos de la receta
     */
    function abrirModal(receta) {
        if (!receta) return;
        
        // Actualizamos contenido
        DOM.modalTitulo.textContent = receta.nombre;
        DOM.modalDescripcion.textContent = receta.descripcion || 'Sin descripción disponible.';
        
        // Imagen o placeholder
        if (receta.imagen) {
            DOM.modalImagen.src = receta.imagen;
            DOM.modalImagen.alt = receta.nombre;
            DOM.modalImagen.classList.remove('modal__image--placeholder');
        } else {
            DOM.modalImagen.src = '';
            DOM.modalImagen.alt = '';
            DOM.modalImagen.classList.add('modal__image--placeholder');
            DOM.modalImagen.textContent = '🍽️';
        }
        
        // Mostramos el modal
        DOM.modal.classList.add('modal--open');
        DOM.modal.setAttribute('aria-hidden', 'false');
        state.modalAbierto = true;
        
        // Prevenimos scroll del body
        document.body.style.overflow = 'hidden';
        
        // Focus en el botón cerrar
        const btnCerrar = DOM.modal.querySelector('.modal__close');
        if (btnCerrar) {
            btnCerrar.focus();
        }
    }
    
    /**
     * Cierra el modal
     */
    function cerrarModal() {
        DOM.modal.classList.remove('modal--open');
        DOM.modal.setAttribute('aria-hidden', 'true');
        state.modalAbierto = false;
        
        // Restauramos scroll del body
        document.body.style.overflow = '';
        
        // Devolvemos el focus al elemento que abrió el modal
        const ultimaTarjetaActiva = DOM.recetasGrid.querySelector('.card:focus, .card[data-last-focus]');
        if (ultimaTarjetaActiva) {
            ultimaTarjetaActiva.focus();
        }
    }
    
    // ============================================
    // MANEJADORES DE EVENTOS
    // ============================================
    
    /**
     * Manejador de clicks en el grid de culturas
     * Usa event delegation para mejor rendimiento
     */
    function handleCulturasClick(event) {
        const tarjeta = event.target.closest('.card');
        if (!tarjeta) return;
        
        const culturaId = tarjeta.dataset.culturaId;
        if (culturaId) {
            navegarARecetas(culturaId);
        }
    }
    
    /**
     * Manejador de clicks en el grid de recetas
     * Usa event delegation para mejor rendimiento
     */
    function handleRecetasClick(event) {
        const tarjeta = event.target.closest('.card');
        if (!tarjeta) return;
        
        const recetaIndex = parseInt(tarjeta.dataset.recetaIndex, 10);
        
        if (!isNaN(recetaIndex) && state.culturaActual) {
            const receta = state.culturaActual.recetas[recetaIndex];
            if (receta) {
                tarjeta.setAttribute('data-last-focus', 'true');
                abrirModal(receta);
            }
        }
    }
    
    /**
     * Manejador de teclado para navegación accesible
     */
    function handleKeydown(event) {
        // Cerrar modal con Escape
        if (event.key === 'Escape' && state.modalAbierto) {
            cerrarModal();
            return;
        }
        
        // Activar tarjetas con Enter o Space
        if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('card')) {
            event.preventDefault();
            event.target.click();
        }
    }
    
    /**
     * Manejador de clicks en el modal
     */
    function handleModalClick(event) {
        // Si el click es en un elemento con data-close-modal, cerramos
        if (event.target.hasAttribute('data-close-modal')) {
            cerrarModal();
        }
    }
    
    // ============================================
    // UTILIDADES
    // ============================================
    
    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} str - String a escapar
     * @returns {string} String escapado
     */
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    /**
     * Configura todos los event listeners
     */
    function configurarEventListeners() {
        // Event delegation para grids
        DOM.culturasGrid.addEventListener('click', handleCulturasClick);
        DOM.recetasGrid.addEventListener('click', handleRecetasClick);
        
        // Botón volver
        DOM.btnVolver.addEventListener('click', volverACulturas);
        
        // Modal
        DOM.modal.addEventListener('click', handleModalClick);
        
        // Teclado global
        document.addEventListener('keydown', handleKeydown);
    }
    
    /**
     * Carga inicial de datos y renderizado
     */
    async function cargarCulturas() {
        mostrarCargando(DOM.culturasGrid);
        
        try {
            const culturas = await DataService.obtenerCulturas();
            renderizarCulturas(culturas);
        } catch (error) {
            mostrarError(DOM.culturasGrid, 'No se pudieron cargar las culturas. Verifica tu conexión.');
        }
    }
    
    /**
     * Inicializa la aplicación
     */
    async function inicializar() {
        configurarEventListeners();
        await cargarCulturas();
        
        console.log('🏛️ Recetas de la Antigüedad - Aplicación inicializada');
    }
    
    // API pública
    return {
        init: inicializar,
        // Exponemos algunas funciones para testing/debugging
        abrirModal,
        cerrarModal,
        navegarARecetas,
        volverACulturas
    };
})();

// ============================================
// PUNTO DE ENTRADA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
