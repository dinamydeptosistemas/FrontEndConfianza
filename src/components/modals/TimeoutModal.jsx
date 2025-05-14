import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TimeoutModal = ({ open, onContinue, onLogout }) => {
  const [showRRHHInput, setShowRRHHInput] = useState(false);
  const [motivo, setMotivo] = useState('');
  const { user } = useAuth();

  const handleRRHH = () => setShowRRHHInput(true);

  const handleGuardarMotivo = () => {
    const now = new Date();
    localStorage.setItem('motivo_salida_rrhh', JSON.stringify({
      motivo,
      fecha: now.toLocaleDateString(),
      hora: now.toLocaleTimeString(),
      usuario: user ? (user.Username || user.username || user.email || user.UserId) : null
    }));
    setShowRRHHInput(false);
    setMotivo('');
    if (onContinue) onContinue();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">¿Deseas continuar con tu sesión?</h2>
        {!showRRHHInput ? (
          <div className="flex flex-col gap-4">
            <button className="px-4 py-2 bg-[#1e4e9c] text-white rounded hover:bg-[#5aa2ff] font-bold" onClick={onContinue}>Continuar</button>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold" onClick={handleRRHH}>RRHH</button>
            <button className="px-4 py-2 bg-[#555557] text-white rounded hover:bg-gray-700 font-bold" onClick={onLogout}>Terminar sesión</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="font-medium">Motivo de salida para RRHH:</label>
            <input
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 outline-none px-2 py-1 bg-white hover:bg-gray-50 transition-colors"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Escribe el motivo"
            />
            <button className="px-4 py-2 bg-[#1e4e9c] text-white rounded hover:bg-[#5aa2ff] font-bold mt-2" onClick={handleGuardarMotivo}>Guardar y continuar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeoutModal; 