const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5201';
const API_BASE = `${API_URL}/api`;

/**
 * Servicio para registrar un usuario externo
 * 
 * Valores de RelacionUser:
 * 1 = Cliente
 * 2 = Proveedor
 * 3 = Ex-empleado
 * 4 = Contratista
 * 5 = Transportista
 * 6 = Seguridad
 * 7 = Comisionista
 * 8 = Postulante
 */
const externalRegistrerService = {
    /**
     * Registra un usuario externo
     * @param {Object} data - Datos del usuario externo
     * @returns {Promise<CreateExternalUserResponseDTO>} Respuesta del servidor
     */
    async register(data) {
        // Validate password format (must be exactly 4 numbers)
        const passNumber = parseInt(data.request.passnumber, 10);
        if (isNaN(passNumber) || !/^\d{4}$/.test(data.request.passnumber)) {
            throw new Error('La clave debe ser exactamente 4 números');
        }

        // Format the request data according to API requirements
        const formattedData = {
            // Campos obligatorios
            nombreUser: data.request.nombreuser,
            apellidoUser: data.request.apellidouser,
            identificacion: data.request.identificacion,
            username: data.request.username,
            passNumber: passNumber,
            relacionUser: data.request.relacionuser,
            
            // Campos opcionales
            emailUsuario: data.request.emailusuario || null,
            celularUsuario: data.request.celularusuario || null,
            
            // Campos para verificación de cambios de contacto
            emailUsuarioViejo: data.request.emailusuarioviejo || null,
            emailUsuarioNuevo: data.request.emailusuarionuevo || null,
            telefonoViejo: data.request.telefonoviejo || null,
            telefonoNuevo: data.request.telefononuevo || null
        };

        try {
            const response = await fetch(`${API_BASE}/registrer/user-external`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formattedData)
            });

            const responseData = await response.json();

            // Validar la respuesta según CreateExternalUserResponseDTO
            if (responseData.statusCode !== 201) {
                console.error('Error en la creación de usuario:', responseData);
                throw new Error(responseData.message || 'Error al crear usuario externo');
            }

            return {
                statusCode: responseData.statusCode,
                message: responseData.message,
                usuarioId: responseData.usuarioId,
                tipoRelacion: responseData.tipoRelacion
            };
        } catch (error) {
            console.error('Error en el servicio de registro:', error);
            throw error;
        }
    }
};

/**
 * Estructura de respuesta del servidor
 * @typedef {Object} CreateExternalUserResponseDTO
 * @property {number} statusCode - Código de estado HTTP
 * @property {string} message - Mensaje descriptivo
 * @property {number|null} usuarioId - ID del usuario creado (si fue exitoso)
 * @property {string|null} tipoRelacion - Descripción del tipo de relación
 */

export default externalRegistrerService;
