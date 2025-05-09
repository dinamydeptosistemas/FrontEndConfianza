// Variables globales del backend
const globalState = {
    user: null,
    negocio: null,
    userId: null,
    loginResponse: null, // Respuesta completa del login

    setUser: (userData) => {
        globalState.user = userData;
        
        // Si hay userId, guardarlo también
        if (userData && userData.userId) {
            globalState.userId = userData.userId;
           
        }
    },

    // Guardar la respuesta completa del login
    setLoginResponse: (response) => {
        globalState.loginResponse = response;
        
        // Guardar en localStorage para persistencia
        if (response) {
            
        } else {
            localStorage.removeItem('loginResponse');
        }
        
        // También actualizar el userId si está presente
        if (response && response.userId) {
            globalState.userId = response.userId;
            localStorage.setItem('userId', response.userId);
        }
    },
    
    // Obtener la respuesta completa del login
    getLoginResponse: () => {
        if (globalState.loginResponse) return globalState.loginResponse;
        
     
        
        return null;
    },

    setUserId: (id) => {
        globalState.userId = id;
        localStorage.setItem('userId', id);
    },

    getUserId: () => {
        if (globalState.userId) return globalState.userId;
        
        if (globalState.user && globalState.user.userId) {
            return globalState.user.userId;
        }
   
        
        // Como último recurso, intentar extraerlo del objeto user en localStorage
  
        
        return null;
    },

    setNegocio: (negocioData) => {
        globalState.negocio = negocioData;
        // Opcional: guardar en localStorage si se necesita persistencia
        if (negocioData) {
            localStorage.setItem('negocioData', JSON.stringify(negocioData));
        } else {
            localStorage.removeItem('negocioData');
        }
    },

    clearState: () => {
        globalState.user = null;
        globalState.negocio = null;
        globalState.userId = null;
        globalState.loginResponse = null;
        localStorage.removeItem('negocioData');
        localStorage.removeItem('userId');
        localStorage.removeItem('loginResponse');
    }
};

export default globalState; 