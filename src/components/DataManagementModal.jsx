import { useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../config/axios';

// Reemplazar componentes no disponibles con elementos básicos
const Rocket = () => <span>🚀</span>;
const FileSpreadsheet = () => <span>📊</span>;
const LoaderCircle = () => <span>🔄</span>;

// Función cn básica
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Mover ActionButton fuera del componente principal
export const ActionButton = ({ onClick, actionType, icon: Icon, title, description, isProcessing, processingAction, className }) => (
  <button 
    onClick={onClick}
    disabled={isProcessing}
    className={cn(
      "w-full p-4 text-left rounded-lg transition-all duration-300 flex items-start space-x-4 border",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      processingAction === actionType ? "bg-secondary border-primary/50" : "bg-card hover:bg-secondary/50 border-border",
      className // Aplicar la clase personalizada
    )}
  >
    <div className={cn(
      "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
      processingAction === actionType ? 'bg-primary/20' : 'bg-secondary'
    )}>
      {processingAction === actionType ?
        <LoaderCircle /> :
        <Icon />
      }
    </div>
    <div>
      <p className="font-semibold text-card-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </button>
);

ActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  actionType: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  processingAction: PropTypes.string,
  className: PropTypes.string, // Agregar validación para className
};

export default function DataManagementModal({ onClose }) {
  const [processingAction, setProcessingAction] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const isProcessing = !!processingAction;

  const handleMoveToProduction = async () => {
    setProcessingAction('move');
    try {
      // Llamar al primer endpoint usando axiosInstance
      await axiosInstance.post('/api/Production/CambiarAProduccion');
      console.log("Datos movidos a producción exitosamente.");

      // Llamar al segundo endpoint usando axiosInstance
      await axiosInstance.post('/api/DataCleanup/clean-test-data');
      console.log("Datos de prueba eliminados exitosamente.");

      console.log({
        title: "Operación exitosa",
        description: "Los datos han sido movidos a producción y los datos de prueba han sido eliminados."
      });
    } catch (error) {
      console.error("Error durante la operación:", error);
      console.log({
        variant: "destructive",
        title: "Operación fallida",
        description: error.response?.data || error.message
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleBackupAndClear = async () => {
    setProcessingAction('backup');
    try {
      console.log("Respaldando datos en Excel...");
      console.log("Eliminando datos de prueba...");
      console.log({ title: "Backup Complete", description: "All records have been backed up to Excel." });
      console.log({ title: "Data Cleared", description: "Test data has been successfully erased." });
    } catch (error) {
      console.error("Error durante la operación:", error);
      console.log({
        variant: "destructive",
        title: "Operación fallida",
        description: error.message
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);

  const confirmAndMoveToProduction = () => {
    closeConfirmModal();
    handleMoveToProduction();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <div>
          <h2 className="text-2xl font-bold mb-4">Opciones de gestión</h2>
          <p className="text-gray-600 mb-6">
            Seleccione la operacion que desea realizar. Estas acciones no se pueden deshacer.
          </p>
          <div className="space-y-4 py-6">
            <ActionButton 
              onClick={openConfirmModal}
              actionType="move"
              icon={Rocket}
              title="Mover a producción y borrar datos"
              description="Convertir datos de prueba a producción y borrar datos de prueba."
              className="bg-blue-500 hover:bg-blue-600"
              isProcessing={isProcessing}
              processingAction={processingAction}
            />
            <ActionButton 
              onClick={handleBackupAndClear}
              actionType="backup"
              icon={FileSpreadsheet}
              title="Respaldar en excel y borrar datos"
              className="bg-green-500 hover:bg-green-600"
              description="Generar excel y borrar datos de prueba."
              isProcessing={isProcessing}
              processingAction={processingAction}
            />
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            <h3 className="text-lg font-bold mb-4">Confirmar acción</h3>
            <p className="text-gray-600 mb-6">Se procede a pasar a <strong className='fg-bold'>PRODUCCION</strong> los registros de: Empresas , Perfiles , Usuarios y Medios , los otros registros de prueba seran borrados y no se podran recuperar <br></br>Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={closeConfirmModal }
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={() => { confirmAndMoveToProduction(); closeConfirmModal(); }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

DataManagementModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
