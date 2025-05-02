// Configuración base
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5201';
const API_BASE = `${API_URL}/api`;

// Servicio para registrar un usuario
const registrerService = {
    // Verifica el email de un usuario
    async verifyEmail(data) {
        try {
            const response = await fetch(`${API_BASE}/registrer/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const jsonResponse = await response.json();
           
            return jsonResponse;
        } catch (error) {
            console.error('Error in verifyEmail:', error);
            throw error;
        }
    },

    // Registra un usuario interno
    async register(data) {
        const response = await fetch(`${API_BASE}/registrer/user-internal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
};

export default registrerService; 