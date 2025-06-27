const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5201';
const API_BASE = `${API_URL}/api`;

// Servicio para registrar un usuario externo
const externalRegistrerService = {
    // Registra un usuario externo
    async register(data) {
        // Validate password format (must be exactly 4 numbers)
        const passNumber = data.request.passnumber;
        if (!passNumber || !/^\d{4}$/.test(passNumber)) {
            throw new Error('La clave debe ser exactamente 4 números');
        }

        // Format the request data according to API requirements
        const formattedData = {
            nombreUser: data.request.nombreuser,
            apellidoUser: data.request.apellidouser,
            identificacion: data.request.identificacion,
            username: data.request.username,
            passNumber: passNumber,
            emailUsuario: data.request.emailusuario,
            celularUsuario: data.request.celularusuario,
            relacionUser: data.request.relacionuser

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

            // The backend now returns a structured response with StatusCode and Message
            if (responseData.statusCode !== 201) {
                console.error('Error en la creación de usuario:', responseData);
                throw new Error(responseData.message || 'Error al crear usuario externo');
            }

            return responseData;
        } catch (error) {
            console.error('Error en el servicio de registro:', error);
            throw error;
        }
    }
};

export default externalRegistrerService;
