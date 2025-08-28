import { useAuth } from '../contexts/AuthContext';

const LogoutTest = () => {
  const { user, logout, directLogout, loading, error } = useAuth();

  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded">
        <p>Usuario no autenticado</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Prueba de Logout</h3>
      
      <div className="mb-4">
        <p><strong>Usuario:</strong> {user.Username || 'N/A'}</p>
        <p><strong>Estado:</strong> {loading ? 'Cargando...' : 'Activo'}</p>
        {error && (
          <p className="text-red-600"><strong>Error:</strong> {error}</p>
        )}
      </div>

      <div className="space-x-2">
        <button
          onClick={logout}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Logout con Confirmación
        </button>
        
        <button
          onClick={directLogout}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Logout Directo
        </button>
      </div>
    </div>
  );
};

export default LogoutTest;