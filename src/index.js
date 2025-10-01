import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Importar todos los proveedores de contexto globales

// Definir InactivityManager aquí o importarlo si es un componente separado
// Por simplicidad, lo moveré aquí temporalmente si no hay un archivo dedicado solo para él

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 