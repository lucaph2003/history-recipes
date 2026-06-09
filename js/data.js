/**
 * ============================================
 * RECETAS DE LA ANTIGÜEDAD
 * Módulo de Datos - Carga y gestión de datos
 * ============================================
 */

'use strict';

/**
 * Módulo de datos encapsulado en un objeto para evitar
 * contaminar el scope global y facilitar el testing
 */
const DataService = (function() {
    // Cache de datos para evitar múltiples peticiones
    let _culturas = null;
    
    // Ruta al archivo JSON
    const DATA_PATH = 'data/recetas.json';
    
    /**
     * Carga el archivo JSON de recetas
     * @returns {Promise<Array>} Array de culturas con sus recetas
     * @throws {Error} Si hay un error de red o parsing
     */
    async function cargarJSON() {
        // Si ya tenemos los datos en cache, los devolvemos
        if (_culturas !== null) {
            return _culturas;
        }
        
        try {
            const response = await fetch(DATA_PATH);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validamos que sea un array
            if (!Array.isArray(data)) {
                throw new Error('El formato del JSON no es válido. Se esperaba un array.');
            }
            
            // Guardamos en cache
            _culturas = data;
            
            return _culturas;
        } catch (error) {
            console.error('Error al cargar los datos:', error);
            throw error;
        }
    }
    
    /**
     * Obtiene todas las culturas
     * @returns {Promise<Array>} Array de objetos de cultura
     */
    async function obtenerCulturas() {
        const datos = await cargarJSON();
        return datos;
    }
    
    /**
     * Busca una cultura por su ID
     * @param {string} id - Identificador único de la cultura
     * @returns {Promise<Object|null>} Objeto de la cultura o null si no existe
     */
    async function obtenerCulturaPorId(id) {
        const datos = await cargarJSON();
        return datos.find(cultura => cultura.id === id) || null;
    }
    
    /**
     * Obtiene las recetas de una cultura específica
     * @param {string} culturaId - ID de la cultura
     * @returns {Promise<Array>} Array de recetas de la cultura
     */
    async function obtenerRecetasPorCultura(culturaId) {
        const cultura = await obtenerCulturaPorId(culturaId);
        
        if (!cultura) {
            console.warn(`Cultura con ID "${culturaId}" no encontrada`);
            return [];
        }
        
        return cultura.recetas || [];
    }
    
    /**
     * Busca una receta específica dentro de una cultura
     * @param {string} culturaId - ID de la cultura
     * @param {number} recetaIndex - Índice de la receta en el array
     * @returns {Promise<Object|null>} Objeto de la receta o null
     */
    async function obtenerReceta(culturaId, recetaIndex) {
        const recetas = await obtenerRecetasPorCultura(culturaId);
        return recetas[recetaIndex] || null;
    }
    
    /**
     * Limpia la cache de datos (útil para refrescar datos)
     */
    function limpiarCache() {
        _culturas = null;
    }
    
    // API pública del módulo
    return {
        cargarJSON,
        obtenerCulturas,
        obtenerCulturaPorId,
        obtenerRecetasPorCultura,
        obtenerReceta,
        limpiarCache
    };
})();
