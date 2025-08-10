import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import SearchBar from '../../components/common/SearchBar';
import Paginador from '../../components/common/Paginador';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

import { getBitacora } from '../../services/bitacora/BitacoraService';

export default function BitacoraUsuariosActivos() {
  // ...existing code...
  
const { negocio, setNegocio, user, setUser } = useAuth();
  const [bitacoras, setBitacoras] = useState([]);
  // Agrupar registros por día y usuario
  const bitacorasAgrupadas = React.useMemo(() => {
    if (!Array.isArray(bitacoras)) return [];
    const grupos = {};
    bitacoras.forEach(registro => {
      // Normalizar fecha a formato dd-mm-yyyy
      let fecha = '';
      if (registro.accesoFechaInicial) {
        const d = new Date(registro.accesoFechaInicial);
        if (!isNaN(d.getTime())) {
          fecha = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getFullYear()}`;
        } else {
          fecha = registro.accesoFechaInicial;
        }
      }
      const usuario = registro.username || registro.nombreCompleto || 'Sin usuario';
      const clave = `${fecha}_${usuario}`;
      if (!grupos[clave]) {
        grupos[clave] = {
          ...registro,
          accesoFechaInicial: fecha,
          numeroDeHoras: 0
        };
      }
      grupos[clave].numeroDeHoras += parseFloat(registro.numeroDeHoras) || 0;
      // Si el estadoSesion actual es mayor que el guardado, lo actualizamos
   
    });
    return Object.values(grupos);
  }, [bitacoras]);
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [loading, setLoading] = useState(false);
  
  // Estados para los filtros de fecha
  const [tipoFiltroFecha, setTipoFiltroFecha] = useState('mes'); // 'mes' o 'semana'
  const [tipoFiltroFechaTemp, setTipoFiltroFechaTemp] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [fechaInicioTemp, setFechaInicioTemp] = useState(fechaInicio);
  const [fechaFinTemp, setFechaFinTemp] = useState(fechaFin);
  const [mesSeleccionado, setMesSeleccionado] = useState(format(new Date(), 'MMMM yyyy', { locale: es }));
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('1-7'); // '1-7', '8-15', '16-22', '23-31'
  
  // Estados para filtros de función y username
  const [funcionFiltro, setFuncionFiltro] = useState('');
  const [usernameFiltro, setUsernameFiltro] = useState('');
  const [tipoFiltroUsuario, setTipoFiltroUsuario] = useState(''); // 'funcion' o 'username'
  const [valorFiltroUsuario, setValorFiltroUsuario] = useState(''); // valor del filtro

  const cargarBitacora = useCallback(async (pagina = 1, filtroBusqueda = '', filtrosExtra = {}) => {
    setLoading(true);
    const params = {
      page: 1,
      pageSize: 10000, // Traer todos los registros posibles para sumar el total
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      ...filtrosExtra
    };
    
    // Priorizar los filtros del modal sobre la barra de búsqueda
    if (funcionFiltro) {
      params.funcion = funcionFiltro;
      // Si hay filtro de función, ignoramos el filtro de búsqueda para username
      delete params.username;
    } else if (usernameFiltro) {
      params.username = usernameFiltro;
    } else if (filtroBusqueda) {
      params.username = filtroBusqueda;
    }
    try {
      const data = await getBitacora(params);
      let registros = data.bitacoras || data.logs || [];
      if (!Array.isArray(registros) && typeof registros === 'object' && registros !== null) {
        const claves = Object.keys(registros);
        const esNumerico = claves.length > 0 && claves.every(k => !isNaN(Number(k)));
        if (esNumerico) {
          registros = Object.values(registros);
        } else {
          registros = [registros];
        }
      }
      setBitacoras(registros);
      setPaginaActual(pagina);
      setTotalPaginas(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, funcionFiltro, usernameFiltro]);

  // Al entrar a la pestaña, setear el nombre de la empresa y el usuario en el contexto si es necesario
  useEffect(() => {
    if (user && user.NameEntity && (!negocio || negocio.nombre !== user.NameEntity)) {
      setNegocio({ nombre: user.NameEntity, codigo: user.CodeEntity });
    }
    if (user && (!user.Username && user.username)) {
      setUser({ ...user, Username: user.username });
    }
    cargarBitacora(1, '', {});
  }, [cargarBitacora, user, setNegocio, setUser, negocio]);

  const handleBuscar = (valor) => {
    setFiltro(valor);
    cargarBitacora(1, valor, {});
  };

  const handlePagina = (pagina) => {
    setPaginaActual(pagina);
    cargarBitacora(pagina, filtro, {});
  };

  const handleAbrirFiltros = () => {
    setTipoFiltroFechaTemp(tipoFiltroFecha);
    setFechaInicioTemp(fechaInicio);
    setFechaFinTemp(fechaFin);

    
    // Configurar el tipo de filtro y su valor
    if (funcionFiltro) {
      setTipoFiltroUsuario('funcion');
      setValorFiltroUsuario(funcionFiltro);
    } else if (usernameFiltro) {
      setTipoFiltroUsuario('username');
      setValorFiltroUsuario(usernameFiltro);
    } else {
      setTipoFiltroUsuario('');
      setValorFiltroUsuario('');
    }
    
    setModalFiltros(true);
  };

  // Definir columnas explícitas para la tabla de bitácora
  const columns = [
    { key: 'funcion', label: 'Función' },
    { key: 'nombreCompleto', label: 'Apellidos y Nombres' },
    { key: 'username', label: 'User Name' },
    { 
      key: 'estadoSesion', 
      label: 'Estado Sesión',
      render: (row) => {
        // Convertir el valor a string para comparar
        const estado = String(row.estadoSesion || '');
        switch (estado) {
          case '1': return 'Activo';
          case '0': return 'Cerrada';
          case '2': return 'Bloqueada';
          default: return row.estadoSesion; // Mantener el valor original si no coincide
        }
      }
    },
    { key: 'regAcceso', label: 'Registro No' },
    { 
      key: 'accesoFechaInicial', 
      label: 'Fecha Acceso',
      render: (row) => {
        if (!row.accesoFechaInicial) return '';
        
        // Convertir la fecha al formato dd-mm-yyyy
        const fecha = new Date(row.accesoFechaInicial);
        
        // Verificar si es una fecha válida
        if (isNaN(fecha.getTime())) return row.accesoFechaInicial;
        
        // Formatear la fecha como dd-mm-yyyy
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear();
        
        return `${dia}-${mes}-${anio}`;
      }
    },
    { key: 'numeroDeHoras', label: 'Número de Horas' },
  ];

  // Si tienes un resumen de horas, puedes mostrarlo al final
  // Por ejemplo, asumiendo que lo recibes en data.resumenHorasUsuarios
  // const resumenHoras = data.resumenHorasUsuarios || [];

  // Estado y handlers para el modal de filtros avanzados
  const [modalFiltros, setModalFiltros] = useState(false);

  const handleCerrarFiltros = () => setModalFiltros(false);
  
  // Función para actualizar las fechas según el tipo de filtro seleccionado
  const actualizarFechasPorTipo = (tipo, fecha = new Date(), rangoDias = '1-7') => {
    // Nos aseguramos que fecha sea un objeto Date válido
    let fechaObj;
    if (typeof fecha === 'string') {
      // Si es un string, lo convertimos a Date
      const [year, month, day] = fecha.split('-').map(Number);
      fechaObj = new Date(year, month - 1, day);
    } else {
      fechaObj = fecha;
    }
    
    // Verificamos que la fecha sea válida
    if (isNaN(fechaObj.getTime())) {
      fechaObj = new Date(); // Si no es válida, usamos la fecha actual
    }
    
    let inicio, fin;
    
    if (tipo === 'mes') {
      // Para mes: primer día del mes a último día del mes
      inicio = startOfMonth(fechaObj);
      fin = endOfMonth(fechaObj);
      // Actualizar el mes seleccionado
      setMesSeleccionado(format(fechaObj, 'MMMM yyyy', { locale: es }));
    } else { // semana
      // Para semana con rangos específicos del mes
      let diaInicio, diaFin;
      
      // Determinar el rango de días según la selección
      switch (rangoDias) {
        case '1-7':
          diaInicio = 1;
          diaFin = 7;
          break;
        case '8-15':
          diaInicio = 8;
          diaFin = 15;
          break;
        case '16-22':
          diaInicio = 16;
          diaFin = 22;
          break;
        case '23-31':
          diaInicio = 23;
          diaFin = 31;
          break;
        default:
          diaInicio = 1;
          diaFin = 7;
      }
      
      // Crear las fechas de inicio y fin
      inicio = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), diaInicio);
      fin = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), diaFin);
      
      // Si el día fin es mayor que el último día del mes, ajustar
      const ultimoDiaMes = new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 0).getDate();
      if (diaFin > ultimoDiaMes) {
        fin = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), ultimoDiaMes);
      }
      
      // Actualizar el mes y la semana seleccionada
      setMesSeleccionado(format(fechaObj, 'MMMM yyyy', { locale: es }));
      setSemanaSeleccionada(rangoDias);
    }
    
    return {
      inicio: format(inicio, 'yyyy-MM-dd'),
      fin: format(fin, 'yyyy-MM-dd')
    };
  };
  
  // Función para cambiar el tipo de filtro de fecha (mes/semana)
  const handleCambioTipoFiltroFecha = (tipo) => {
    setTipoFiltroFechaTemp(tipo);
    const fechas = actualizarFechasPorTipo(tipo, new Date(), '1-7');
    setFechaInicioTemp(fechas.inicio);
    setFechaFinTemp(fechas.fin);
  };
  
  // La navegación entre rangos de semana se maneja directamente en handleCambioPeriodo
  
  // Función para cambiar el período (anterior o siguiente)
  const handleCambioPeriodo = (direccion) => {
    // Aseguramos que estamos trabajando con una fecha válida
    let fechaActual;
    try {
      // Convertimos la fecha de string a objeto Date
      const [year, month, day] = fechaInicioTemp.split('-').map(Number);
      fechaActual = new Date(year, month - 1, day); // Mes en JavaScript es 0-indexado
      
      // Verificamos que la fecha sea válida
      if (isNaN(fechaActual.getTime())) {
        // Si no es válida, usamos la fecha actual
        fechaActual = new Date();
      }
    } catch (error) {
      // En caso de error, usamos la fecha actual
      fechaActual = new Date();
    }
    
    if (tipoFiltroFechaTemp === 'mes') {
      // Navegación por meses
      let nuevaFecha;
      if (direccion === 'anterior') {
        // Retroceder un mes usando subMonths
        nuevaFecha = subMonths(fechaActual, 1);
      } else {
        // Avanzar un mes usando addMonths (simulado)
        nuevaFecha = new Date(fechaActual);
        nuevaFecha.setDate(1); // Primero del mes
        nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
      }
      // Actualizar las fechas de inicio y fin según el tipo de filtro
      const fechas = actualizarFechasPorTipo(tipoFiltroFechaTemp, nuevaFecha);
      setFechaInicioTemp(fechas.inicio);
      setFechaFinTemp(fechas.fin);
    } else { // semana
      // Determinar si estamos cambiando de mes o de semana
      const rangosSemana = ['1-7', '8-15', '16-22', '23-31'];
      const indiceActual = rangosSemana.indexOf(semanaSeleccionada);
      
      // Si estamos en el primer rango y vamos hacia atrás, o en el último y vamos hacia adelante,
      // entonces cambiamos de mes
      let nuevaFecha = new Date(fechaActual);
      let nuevoRango = semanaSeleccionada;
      
      if ((indiceActual === 0 && direccion === 'anterior') || (indiceActual === 3 && direccion === 'siguiente')) {
        // Cambiar de mes
        if (direccion === 'anterior') {
          // Retroceder un mes
          nuevaFecha = subMonths(fechaActual, 1);
          nuevoRango = '23-31'; // Al retroceder un mes, ir a la última semana
        } else {
          // Avanzar un mes
          nuevaFecha = new Date(fechaActual);
          nuevaFecha.setDate(1); // Primero del mes
          nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
          nuevoRango = '1-7'; // Al avanzar un mes, ir a la primera semana
        }
      } else {
        // Solo cambiar de semana dentro del mismo mes
        let nuevoIndice;
        if (direccion === 'anterior') {
          // Ir al rango anterior
          nuevoIndice = indiceActual - 1;
        } else {
          // Ir al siguiente rango
          nuevoIndice = indiceActual + 1;
        }
        nuevoRango = rangosSemana[nuevoIndice];
      }
      
      // Actualizar las fechas con el nuevo rango de semana y posiblemente nuevo mes
      const fechas = actualizarFechasPorTipo('semana', nuevaFecha, nuevoRango);
      setFechaInicioTemp(fechas.inicio);
      setFechaFinTemp(fechas.fin);
      setSemanaSeleccionada(nuevoRango);
    }
  };
  
  const handleAplicarFiltros = () => {
    // Guardamos los valores actuales para usarlos directamente en cargarBitacora
    const nuevoTipoFiltroFecha = tipoFiltroFechaTemp;
    const nuevaFechaInicio = fechaInicioTemp;
    const nuevaFechaFin = fechaFinTemp;
 
    
    // Determinar los valores de filtro de usuario
    let nuevoFuncionFiltro = '';
    let nuevoUsernameFiltro = '';
    
    if (tipoFiltroUsuario === 'funcion') {
      nuevoFuncionFiltro = valorFiltroUsuario;
    } else if (tipoFiltroUsuario === 'username') {
      nuevoUsernameFiltro = valorFiltroUsuario;
    }
    
    // Actualizar todos los estados
    setTipoFiltroFecha(nuevoTipoFiltroFecha);
    setFechaInicio(nuevaFechaInicio);
    setFechaFin(nuevaFechaFin);
    setFuncionFiltro(nuevoFuncionFiltro);
    setUsernameFiltro(nuevoUsernameFiltro);
    
    // Cerrar el modal
    setModalFiltros(false);
    
    // Llamar a cargarBitacora con los nuevos valores directamente

    const params = {
    
      fechaInicio: nuevaFechaInicio,
      fechaFin: nuevaFechaFin
    };
    
    if (nuevoFuncionFiltro) {
      params.funcion = nuevoFuncionFiltro;
    } else if (nuevoUsernameFiltro) {
      params.username = nuevoUsernameFiltro;
    }
    
    cargarBitacora(1, '', params);
  };

  return (
    <ManagementDashboardLayout title="REPORTE DE USUARIOS ACTIVOS" user={user} negocio={negocio}>
  <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4 min-h-screen flex flex-col">
        {/* Cabecera de contexto de empresa, periodo y usuario */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAbrirFiltros}>
              <i className="fa fa-filter"></i> Filtros
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={handlePagina}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <SearchBar
              value={filtro}
              onSearch={handleBuscar}
              className="w-[300px]"
              placeholder="Buscar por usuario..."
            />
          </div>
        </div>
  <div className="flex-1 overflow-x-auto rounded-lg border border-gray-300 bg-white flex flex-col" style={{maxHeight: '300px', height: '200px'}}>
          <GenericTable
            columns={columns}
            data={bitacorasAgrupadas}
            loading={loading}
            actions={false}
            style={{height: '100%'}}
          />
          {(bitacorasAgrupadas.length === 0 && !loading) && (
            <div className="text-center text-gray-500 py-4">No hay registros para mostrar.</div>
          )}
        </div>
        {/* Fila de total de horas */}
        <div className="w-full flex justify-end items-center bg-gray-100 border border-t-0 border-gray-300 rounded-b px-4 py-2 text-gray-800 font-semibold text-base">
          Total de horas trabajadas:&nbsp;
          {typeof bitacoras === 'object' && bitacoras !== null && !Array.isArray(bitacoras) && bitacoras.numeroDeHoras !== undefined
            ? bitacoras.numeroDeHoras
            : Array.isArray(bitacoras)
              ? bitacoras.reduce((acc, r) => acc + (parseFloat(r.numeroDeHoras) || 0), 0)
              : 0}
        </div>
        {/* Modal de filtros avanzado */}
        {modalFiltros && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-4 flex justify-between items-center">
                <h3 className="text-[24px] font-semibold text-[#1e4e9c]">Filtros de Usuarios Activos</h3>
               
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAplicarFiltros(); }} className="p-6">
                <div className="space-y-6">
                  {/* Sección 1: Filtros de usuario */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-700 mb-3">Filtrar por usuario</h4>
                    <div className="grid grid-cols-[120px_auto_1fr] gap-4 items-center">
                      <div className="font-medium">Tipo de filtro:</div>
                      <div className="flex space-x-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tipoFiltroUsuario"
                            checked={tipoFiltroUsuario === 'funcion'}
                            onChange={() => setTipoFiltroUsuario('funcion')}
                          />
                          <span>Función</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tipoFiltroUsuario"
                            checked={tipoFiltroUsuario === 'username'}
                            onChange={() => setTipoFiltroUsuario('username')}
                          />
                          <span>UserName</span>
                        </label>
                      </div>
                      <div></div>
                      
                      <div className="font-medium">Buscar:</div>
                      <div className="col-span-2">
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1e4e9c] bg-gray-100" 
                          value={valorFiltroUsuario}
                          onChange={(e) => setValorFiltroUsuario(e.target.value)}
                          placeholder={tipoFiltroUsuario === 'funcion' ? "Filtrar por función" : "Filtrar por username"}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Sección 2: Filtros de periodo */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-700 mb-3">Filtrar por periodo</h4>
                    <div className="grid grid-cols-[120px_auto_1fr] gap-4 items-center">
                      <div className="font-medium">Tipo de periodo:</div>
                      <div className="flex space-x-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tipoFiltroFecha"
                            checked={tipoFiltroFechaTemp === 'mes'}
                            onChange={() => handleCambioTipoFiltroFecha('mes')}
                          />
                          <span>Mes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tipoFiltroFecha"
                            checked={tipoFiltroFechaTemp === 'semana'}
                            onChange={() => handleCambioTipoFiltroFecha('semana')}
                          />
                          <span>Semana</span>
                        </label>
                      </div>
                      <div></div>
                      
                      <div className="font-medium">Periodo:</div>
                      <div className="col-span-2">
                        {/* Mostrar el mes seleccionado */}
                        <div className="text-xl font-semibold text-[#1e4e9c] mb-2">
                          {mesSeleccionado.charAt(0).toUpperCase() + mesSeleccionado.slice(1)}
                        </div>
                        <div className="flex items-center">
                          <button 
                            type="button" 
                            onClick={() => handleCambioPeriodo('anterior')} 
                            className="px-3 py-2 border border-gray-300 rounded-l hover:bg-gray-100"
                          >
                            &lt;
                          </button>
                          <div className="flex-1 bg-gray-100 border-t border-b border-gray-300 px-4 py-2 text-center font-medium">
                            {tipoFiltroFechaTemp === 'mes' 
                              ? (() => {
                                  // Parseamos correctamente la fecha para mostrar el mes
                                  try {
                                    const [year, month, day] = fechaInicioTemp.split('-').map(Number);
                                    const fecha = new Date(year, month - 1, day);
                                    if (!isNaN(fecha.getTime())) {
                                      return format(fecha, 'MMMM yyyy', { locale: es });
                                    }
                                    return format(new Date(), 'MMMM yyyy', { locale: es });
                                  } catch (e) {
                                    return format(new Date(), 'MMMM yyyy', { locale: es });
                                  }
                                })()
                              : (() => {
                                  // Obtener el mes actual para mostrarlo junto con el rango de semana
                                  let mesTexto = '';
                                  try {
                                    const [year, month, day] = fechaInicioTemp.split('-').map(Number);
                                    const fecha = new Date(year, month - 1, day);
                                    if (!isNaN(fecha.getTime())) {
                                      mesTexto = format(fecha, 'MMMM', { locale: es });
                                      // Primera letra en mayúscula
                                      mesTexto = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);
                                    }
                                  } catch (e) {
                                    mesTexto = format(new Date(), 'MMMM', { locale: es });
                                    mesTexto = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);
                                  }
                                  
                                  // Mostrar el rango de semana con el mes
                                  let rangoTexto = '';
                                  switch(semanaSeleccionada) {
                                    case '1-7': rangoTexto = '1 al 7'; break;
                                    case '8-15': rangoTexto = '8 al 15'; break;
                                    case '16-22': rangoTexto = '16-22'; break;
                                    case '23-31': rangoTexto = '23 - 31'; break;
                                    default: rangoTexto = `${format(new Date(fechaInicioTemp), 'dd')} al ${format(new Date(fechaFinTemp), 'dd')}`;
                                  }
                                  
                                  return `${mesTexto} ${rangoTexto}`;
                                })()
                            }
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleCambioPeriodo('siguiente')} 
                            className="px-3 py-2 border border-gray-300 rounded-r hover:bg-gray-100"
                          >
                            &gt;
                          </button>
                        </div>
                        
                      
                      </div>
                    </div>
                  </div>
                  
                  {/* Campos ocultos para mantener las fechas */}
                  <input type="hidden" value={fechaInicioTemp} />
                  <input type="hidden" value={fechaFinTemp} />
                </div>
                <div className="flex justify-end gap-2 pt-4 ">
                  <button type="button" onClick={handleCerrarFiltros} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-[#1e4e9c] text-white rounded hover:bg-[#1e4e9c] transition-colors">Aplicar filtros</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ManagementDashboardLayout>
  );
}
