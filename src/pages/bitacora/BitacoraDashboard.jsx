import React, { useEffect, useState, useCallback } from 'react';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import SearchBar from '../../components/common/SearchBar';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import Paginador from '../../components/common/Paginador';
import { useAuth } from '../../contexts/AuthContext';

import { getBitacora, putBitacora } from '../../services/bitacora/BitacoraService';

export default function BitacoraDashboard() {
  const { user, negocio  } = useAuth();
  const [bitacoras, setBitacoras] = useState([]);
  const [modalExito, setModalExito] = useState({ open: false, mensaje: '' });
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);

  const [registroSeleccionado, setRegistroSeleccionado ] = useState(null);

  const cargarBitacora = useCallback(async (pagina = 1, filtroBusqueda = '', estado = '') => {
    setLoading(true);
    const params = { page: pagina, pageSize: 25 };
    if (filtroBusqueda) params.username = filtroBusqueda;
    if (estado) params.estadoSesion = estado;
    try {
      const data = await getBitacora(params);
      console.log('Respuesta getBitacora:', data);
      let registros = data.bitacoras || data.logs || [];
      // Si no es array, pero es un objeto
      if (!Array.isArray(registros) && typeof registros === 'object' && registros !== null) {
        const claves = Object.keys(registros);
        const esNumerico = claves.length > 0 && claves.every(k => !isNaN(Number(k)));
        if (esNumerico) {
          registros = Object.values(registros);
        } else {
          // Si es un objeto plano (un solo registro), lo envolvemos en un array
          registros = [registros];
        }
      }
      setBitacoras(registros);
      console.log('Bitácoras mostradas:', registros);
      setPaginaActual(pagina);
      setTotalPaginas(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBitacora(1, '', '');
  }, [cargarBitacora]);

  const handleBuscar = (valor) => {
    setFiltro(valor);
    cargarBitacora(1, valor, estadoFiltro);
  };
  const handleFiltroEstado = (estado) => {
    setEstadoFiltro(estado);
    cargarBitacora(1, filtro, estado);
  };

  // Acciones de la tabla
  const handleRevisar = (row) => {
    setRegistroSeleccionado(row);
    setPanelDetalleVisible(true);
  };

  // Panel de detalle
  const [panelDetalleVisible, setPanelDetalleVisible] = useState(false);


  const handlePermiso = (row) => {
    alert(`Permiso para acceso: ${row.regAcceso}`);
  };
  const handleBloquear = async (row) => {
    try {
      await putBitacora({ regAcceso: row.regAcceso, bloqueoSesionMaxima: true });
      setModalExito({ open: true, mensaje: 'Sesión bloqueada exitosamente.' });
      cargarBitacora(paginaActual, filtro, estadoFiltro);
    } catch (error) {
      alert('Error al bloquear sesión');
    }
  };


  // Estado para el modal de confirmación de bloqueo
  const [modalBloqueo, setModalBloqueo] = useState({ open: false, registro: null });

  const handleToggleBloqueo = (row) => {
    setModalBloqueo({ open: true, registro: row });
  };

  const handleConfirmarBloqueo = async () => {
    const row = modalBloqueo.registro;
    if (!row) return;
    try {
      await putBitacora({
        regAcceso: row.regAcceso,
        bloqueoSesionMaxima: !row.bloqueoSesionMaxima
      });
      setModalBloqueo({ open: false, registro: null });
      cargarBitacora(paginaActual, filtro, estadoFiltro);
    } catch (error) {
      alert('Error actualizando bloqueo de sesión');
      setModalBloqueo({ open: false, registro: null });
    }
  };

  // Función acciones para la columna de acciones de la tabla
  const acciones = (row) => (
    <div className="flex gap-1">
      <button title="Ver Detalle" className="p-1" onClick={() => handleRevisar(row)}>
        <i className="fa fa-search" />
      </button>
      <button
        title={row.bloqueoSesionMaxima ? "Desbloquear sesión máxima" : "Bloquear sesión máxima"}
        className="p-1"
        onClick={() => handleToggleBloqueo(row)}
      >
        <i className={row.bloqueoSesionMaxima ? "fa fa-lock" : "fa fa-unlock"} />
      </button>
      <button title="Permiso" className="p-1" onClick={() => handlePermiso(row)}>
        <i className="fa fa-id-badge" />
      </button>
      <button title="Bloquear sesión" className="p-1 text-red-600" onClick={() => handleBloquear(row)}>
        <i className="fa fa-ban" />
      </button>
    </div>
  );

  // Definición de columnas para la tabla
  const columnas = [
    { key: 'username', label: 'Usuario' },
    { key: 'accesoFechaInicial', label: 'Fecha Ingreso', render: row => row.accesoFechaInicial ? new Date(row.accesoFechaInicial).toLocaleString() : '' },
    { key: 'horaDeIngreso', label: 'Hora de Ingreso' },
    { key: 'estadoSesion', label: 'Estado', render: row => {
      if (row.estadoSesion === '1') return 'Activo';
      if (row.estadoSesion === '0') return 'Cerrado';
      if (row.estadoSesion === 'BLOQUEADO') return 'Bloqueado';
      return row.estadoSesion;
    } },
    { key: 'ventanaIngreso', label: 'Ventana' },
    { key: 'acciones', label: 'Acciones', render: acciones },
  ];

  // Botonera principal para ButtonGroup
  const botonesPrincipales = [
    {
      label: 'Ver Detalle',
      variant: 'primary',
      onClick: () => {
        if (registroSeleccionado) setPanelDetalleVisible(true);
        else setModalExito({ open: true, mensaje: 'Selecciona un registro para ver detalles.' });
      },
      disabled: !registroSeleccionado
    },
    {
      label: 'Limpiar Selección',
      variant: 'secondary',
      onClick: () => {
        setRegistroSeleccionado(null);
        setPanelDetalleVisible(false);
      },
      disabled: !registroSeleccionado
    }
  ];

  return (
    <ManagementDashboardLayout title="BITÁCORA DEL SISTEMA" user={user} negocio={negocio}>
      <div className="bg-white rounded-b p-4 mx-[18px] w-full">
        {/* Filtros visuales */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex gap-2 items-center">
            <label className="font-semibold">Estado:</label>
            <label><input type="radio" name="estado" value="" checked={estadoFiltro === ''} onChange={() => handleFiltroEstado('')} /> Todos</label>
            <label><input type="radio" name="estado" value="ACTIVO" checked={estadoFiltro === 'ACTIVO'} onChange={() => handleFiltroEstado('ACTIVO')} /> Activo</label>
            <label><input type="radio" name="estado" value="CERRADO" checked={estadoFiltro === 'CERRADO'} onChange={() => handleFiltroEstado('CERRADO')} /> Cerrado</label>
            <label><input type="radio" name="estado" value="BLOQUEADO" checked={estadoFiltro === 'BLOQUEADO'} onChange={() => handleFiltroEstado('BLOQUEADO')} /> Bloqueado</label>
          </div>
          <div className="flex-1 flex justify-end">
            <SearchBar value={filtro} onChange={e => handleBuscar(e.target.value)} placeholder="Buscar usuario, acción o descripción..." />
          </div>
        </div>
        {/* Botonera principal */}
        <ButtonGroup buttons={botonesPrincipales} className="mb-4" />
        {/* Panel de detalle */}
        {panelDetalleVisible && registroSeleccionado && (
          <div className="bg-gray-50 border border-blue-200 rounded p-4 mb-4">
            <div className="font-bold text-blue-800 mb-2">Detalle de Registro</div>
            <div className="grid grid-cols-2 gap-2">
              <div><b>Usuario:</b> {registroSeleccionado.usuario || registroSeleccionado.username}</div>
              <div><b>Acción:</b> {registroSeleccionado.accion}</div>
              <div><b>Fecha:</b> {registroSeleccionado.fecha ? new Date(registroSeleccionado.fecha).toLocaleString() : (registroSeleccionado.accesoFechaInicial ? new Date(registroSeleccionado.accesoFechaInicial).toLocaleString() : '')}</div>
              <div><b>Estado:</b> {registroSeleccionado.estadoSesion}</div>
              <div className="col-span-2"><b>Descripción:</b> {registroSeleccionado.descripcion}</div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para bloquear/desbloquear sesión máxima */}
        <ConfirmEliminarModal
          open={modalBloqueo.open}
          onClose={() => setModalBloqueo({ open: false, registro: null })}
          onConfirm={handleConfirmarBloqueo}
          mensaje={modalBloqueo.registro && modalBloqueo.registro.bloqueoSesionMaxima ?
            "¿Seguro que deseas DESBLOQUEAR la sesión máxima de este registro?" :
            "¿Seguro que deseas BLOQUEAR la sesión máxima de este registro?"}
        />
        
        {/* Botonera principal */}
        <ButtonGroup buttons={botonesPrincipales} className="mb-4" />
        {/* Tabla de bitácora */}
        <GenericTable
          columns={columnas}
          data={bitacoras}
          loading={loading}
          rowKey="regAcceso"
          onRowClick={row => {
            setRegistroSeleccionado(row);
            setPanelDetalleVisible(false);
          }}
          rowClassName={row => registroSeleccionado && row && (row.regAcceso === registroSeleccionado.regAcceso) ? 'bg-blue-100' : ''}
        />
        <div className="flex justify-center mt-2">
          <Paginador
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onPageChange={(p) => cargarBitacora(p, filtro, estadoFiltro)}
          />
        </div>
        {/* Modales */}
  
        {modalExito.open && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
            <div className="bg-white p-6 rounded shadow">
              <div className="text-green-700 font-bold mb-2">{modalExito.mensaje}</div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setModalExito({ open: false, mensaje: '' })}>Aceptar</button>
            </div>
          </div>
        )}
      </div>
    </ManagementDashboardLayout>
  );
}
