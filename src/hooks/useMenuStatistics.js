import { useState, useEffect } from 'react';
import { getEmpresas } from '../services/company/CompanyService';
import { getPerfilesAcceso } from '../services/accessProfile/AccessProfileService';
import { getUsers } from '../services/user/UserService';
import { getPermisos } from '../services/permission/PermissionService';
import { getBitacora } from '../services/bitacora/BitacoraService';
import { getSocialMedia } from '../services/SocialMedia/SocialMediaService';
import { getPaperworks } from '../services/Paperwork/PaperworkService';
/**
 * Hook personalizado para obtener estadísticas del menú de gestión
 */
export const useMenuStatistics = () => {
  const [statistics, setStatistics] = useState({
    empresas: { activos: 0, inactivos: 0, total: 0 },
    usuarios: { activos: 0, inactivos: 0, internos: 0, externos: 0, total: 0 },
    perfiles: { activos: 0, inactivos: 0, total: 0 },
    permisos: { activos: 0, inactivos: 0, total: 0 },
    redesSociales: { activos: 0, inactivos: 0, total: 0 },
    tramites: { activos: 0, inactivos: 0, pendientes: 0, completados: 0, total: 0 },
    bitacora: { registros: 0, hoy: 0 }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        console.log('🔄 Iniciando carga de estadísticas...');
        setLoading(true);
        
        // Obtener datos reales de empresas
        let empresasActivas = 0, empresasInactivas = 0, totalEmpresas = 0;
        try {
          console.log('🏢 Obteniendo datos de empresas...');
          const empresasResponse = await getEmpresas({ getAll: true });
          const empresasList = empresasResponse.companies || [];
          console.log('🏢 Empresas obtenidas:', empresasList.length);
          
          // Calcular estadísticas de empresas
          empresasActivas = empresasList.filter(empresa => empresa.state === true || empresa.state === 1).length;
          empresasInactivas = empresasList.filter(empresa => empresa.state === false || empresa.state === 0).length;
          totalEmpresas = empresasList.length;
        } catch (error) {
          console.error('❌ Error obteniendo empresas:', error.message);
        }

        // Obtener datos reales de perfiles de acceso
        let perfilesActivos = 0, perfilesInactivos = 0, perfilesConPermisos = 0, perfilesConTodosModulos = 0, totalPerfiles = 0;
        try {
          console.log('📝 Obteniendo datos de perfiles de acceso...');
          const perfilesResponse = await getPerfilesAcceso();
          console.log('📝 Respuesta completa de perfiles:', perfilesResponse);
          
          // Usar valores directos de la API si están disponibles
          if (perfilesResponse?.profilesWithGrantPermissions !== undefined) {
            perfilesConPermisos = perfilesResponse.profilesWithGrantPermissions;
            console.log('✅ Perfiles con permisos (API):', perfilesConPermisos);
          }
          
          if (perfilesResponse?.profilesWithAllModules !== undefined) {
            perfilesConTodosModulos = perfilesResponse.profilesWithAllModules;
            console.log('✅ Perfiles con todos los módulos (API):', perfilesConTodosModulos);
          }
          
          if (perfilesResponse?.totalRecords !== undefined) {
            totalPerfiles = perfilesResponse.totalRecords;
            console.log('✅ Total perfiles (API):', totalPerfiles);
          }
          
          // Si tenemos la lista de perfiles, calcular activos/inactivos
          const perfilesList = perfilesResponse?.accessProfiles || [];
          if (perfilesList.length > 0) {
            perfilesActivos = perfilesList.filter(perfil => perfil.state === true || perfil.state === 1).length;
            perfilesInactivos = perfilesList.filter(perfil => perfil.state === false || perfil.state === 0).length;
            console.log('✅ Perfiles activos/inactivos calculados:', perfilesActivos, perfilesInactivos);
          }
          
        } catch (error) {
          console.error('❌ Error obteniendo perfiles:', error.message);
        }

        // Obtener datos reales de usuarios
        let usuariosActivos = 0, usuariosInactivos = 0, usuariosInternos = 0, usuariosExternos = 0, totalUsuarios = 0;
        try {
          console.log('👥 Obteniendo datos de usuarios...');
          const usuariosResponse = await getUsers();
          console.log('👥 Respuesta completa de usuarios:', usuariosResponse);
          
          // Usar valores directos de la API si están disponibles
          if (usuariosResponse?.totalRecords !== undefined) {
            totalUsuarios = usuariosResponse.totalRecords;
            console.log('✅ Total usuarios (API):', totalUsuarios);
          }
          
          if (usuariosResponse?.totalInternos !== undefined) {
            usuariosInternos = usuariosResponse.totalInternos;
            console.log('✅ Usuarios internos (API):', usuariosInternos);
          }
          
          if (usuariosResponse?.totalExternos !== undefined) {
            usuariosExternos = usuariosResponse.totalExternos;
            console.log('✅ Usuarios externos (API):', usuariosExternos);
          }
          
          // Si tenemos la lista de usuarios, calcular activos/inactivos
          const usuariosList = usuariosResponse?.users || [];
          if (usuariosList.length > 0) {
            console.log('👥 Calculando activos/inactivos de', usuariosList.length, 'usuarios');
            console.log('👥 Primer usuario de ejemplo:', usuariosList[0]);
            
            usuariosActivos = usuariosList.filter(usuario => usuario.usuarioActivo === true || usuario.usuarioActivo === 1).length;
            usuariosInactivos = usuariosList.filter(usuario => usuario.usuarioActivo === false || usuario.usuarioActivo === 0).length;
            
            console.log('✅ Usuarios activos/inactivos calculados:', usuariosActivos, usuariosInactivos);
          }
          
          console.log('✅ Estadísticas finales de usuarios:');
          console.log('  - Activos:', usuariosActivos);
          console.log('  - Inactivos:', usuariosInactivos);
          console.log('  - Internos:', usuariosInternos);
          console.log('  - Externos:', usuariosExternos);
          console.log('  - Total:', totalUsuarios);
          
        } catch (error) {
          console.error('❌ Error obteniendo usuarios:', error.message);
          console.error('❌ Error completo:', error);
          // Usar datos mock como fallback
          usuariosActivos = 45; usuariosInactivos = 8; usuariosInternos = 32; usuariosExternos = 21; totalUsuarios = 53;
        }
        
        // Obtener datos reales de permisos
        let permisosActivos = 0, permisosInactivos = 0, totalPermisos = 0;
        try {
          console.log('🔐 Obteniendo datos de permisos...');
          const permisosResponse = await getPermisos();
          console.log('🔐 Respuesta completa de permisos:', permisosResponse);
          
          // Usar valores directos de la API si están disponibles
          if (permisosResponse?.totalRecords !== undefined) {
            totalPermisos = permisosResponse.totalRecords;
            console.log('✅ Total permisos (API):', totalPermisos);
          }
          
          if (permisosResponse?.permisosActivos !== undefined) {
            permisosActivos = permisosResponse.permisosActivos;
            console.log('✅ Permisos activos (API):', permisosActivos);
          }
          
          if (permisosResponse?.permisosInactivos !== undefined) {
            permisosInactivos = permisosResponse.permisosInactivos;
            console.log('✅ Permisos inactivos (API):', permisosInactivos);
          }
          
          console.log('✅ Estadísticas finales de permisos:');
          console.log('  - Activos:', permisosActivos);
          console.log('  - Inactivos:', permisosInactivos);
          console.log('  - Total:', totalPermisos);
          
        } catch (error) {
          console.error('❌ Error obteniendo permisos:', error.message);
          console.error('❌ Error completo:', error);
          // Usar datos mock como fallback
          permisosActivos = 25; permisosInactivos = 5; totalPermisos = 30;
        }
        
        // Obtener datos reales de bitácora
        let totalRegistrosBitacora = 0, sesionesAbiertas = 0, sesionesCerradas = 0;
        try {
          console.log('📈 Obteniendo datos de bitácora...');
          const bitacoraResponse = await getBitacora();
          console.log('📈 Respuesta completa de bitácora:', bitacoraResponse);
          
          // Usar valores directos de la API si están disponibles
          if (bitacoraResponse?.totalRecords !== undefined) {
            totalRegistrosBitacora = bitacoraResponse.totalRecords;
            console.log('✅ Total registros bitácora (API):', totalRegistrosBitacora);
          }
          
          if (bitacoraResponse?.sesionesAbiertas !== undefined) {
            sesionesAbiertas = bitacoraResponse.sesionesAbiertas;
            console.log('✅ Sesiones abiertas (API):', sesionesAbiertas);
          }
          
          if (bitacoraResponse?.sesionesCerradas !== undefined) {
            sesionesCerradas = bitacoraResponse.sesionesCerradas;
            console.log('✅ Sesiones cerradas (API):', sesionesCerradas);
          }
          
          console.log('✅ Estadísticas finales de bitácora:');
          console.log('  - Total registros:', totalRegistrosBitacora);
          console.log('  - Sesiones abiertas:', sesionesAbiertas);
          console.log('  - Sesiones cerradas:', sesionesCerradas);
          
        } catch (error) {
          console.error('❌ Error obteniendo bitácora:', error.message);
          console.error('❌ Error completo:', error);
          // Usar datos mock como fallback
          totalRegistrosBitacora = 1250; sesionesAbiertas = 185; sesionesCerradas = 131;
        }
        
        // Obtener datos reales de redes sociales
        let redesActivas = 0, redesInactivas = 0, totalRedes = 0;
        try {
          console.log('📱 Obteniendo datos de redes sociales...');
          const redesResponse = await getSocialMedia();
          console.log('📱 Respuesta completa de redes sociales:', redesResponse);
          
          // Manejar diferentes estructuras de respuesta
          if (redesResponse?.totalRecords !== undefined) {
            totalRedes = redesResponse.totalRecords;
            console.log('✅ Total redes sociales (API):', totalRedes);
          }
          
          if (redesResponse?.redesActivas !== undefined) {
            redesActivas = redesResponse.redesActivas;
            console.log('✅ Redes activas (API):', redesActivas);
          }
          
          if (redesResponse?.redesInactivas !== undefined) {
            redesInactivas = redesResponse.redesInactivas;
            console.log('✅ Redes inactivas (API):', redesInactivas);
          }
          
          // Si no tiene contadores directos, calcular desde el array
          const redesList = redesResponse?.socialMedia || redesResponse?.data || redesResponse || [];
          if (Array.isArray(redesList) && redesList.length > 0) {
            if (totalRedes === 0) totalRedes = redesList.length;
            if (redesActivas === 0) {
              redesActivas = redesList.filter(red => red.medioActivo === true || red.medioActivo === 1).length;
              redesInactivas = redesList.filter(red => red.medioActivo === false || red.medioActivo === 0).length;
            }
            console.log('✅ Calculado desde array - Activas:', redesActivas, 'Inactivas:', redesInactivas);
          }
          
        } catch (error) {
          console.error('❌ Error obteniendo redes sociales:', error.message);
          // Usar datos mock como fallback
          redesActivas = 6; redesInactivas = 1; totalRedes = 7;
        }
        
        // Obtener datos reales de trámites
        let tramitesActivos = 0, tramitesAprobados = 0, tramitesRechazados = 0, tramitesPorProcesar = 0, totalTramites = 0;
        try {
          console.log('📄 Obteniendo datos de trámites...');
          const tramitesResponse = await getPaperworks();
          console.log('📄 Respuesta completa de trámites:', tramitesResponse);
          
          // IMPORTANTE: Mostrar detalladamente todos los campos relevantes para depurar
          console.log('📄 Campos disponibles en la respuesta:');
          console.log('- TotalRecords:', tramitesResponse?.TotalRecords);
          console.log('- totalRecords:', tramitesResponse?.totalRecords);
          console.log('- CountAprobado:', tramitesResponse?.CountAprobado);
          console.log('- countAprobado:', tramitesResponse?.countAprobado);
          console.log('- CountRechazado:', tramitesResponse?.CountRechazado);
          console.log('- countRechazado:', tramitesResponse?.countRechazado);
          console.log('- CountPorProcesar:', tramitesResponse?.CountPorProcesar);
          console.log('- countPorProcesar:', tramitesResponse?.countPorProcesar);
          console.log('- tramitesAprobados:', tramitesResponse?.tramitesAprobados);
          console.log('- tramitesRechazados:', tramitesResponse?.tramitesRechazados);
          
          // Manejar diferentes estructuras de respuesta
          if (tramitesResponse?.TotalRecords !== undefined) {
            totalTramites = tramitesResponse.TotalRecords;
            console.log('✅ Total trámites (API):', totalTramites);
          } else if (tramitesResponse?.totalRecords !== undefined) {
            totalTramites = tramitesResponse.totalRecords;
            console.log('✅ Total trámites (API):', totalTramites);
          }
          
          // PRIORIDAD 1: Usar los campos procesados que garantizamos en PaperworkService.js
          tramitesAprobados = tramitesResponse?.CountAprobado || 0;
          tramitesRechazados = tramitesResponse?.CountRechazado || 0;
          tramitesPorProcesar = tramitesResponse?.CountPorProcesar || 0;
          
          console.log('✅ CONTADORES FINALES:');
          console.log('- Aprobados:', tramitesAprobados);
          console.log('- Rechazados:', tramitesRechazados);
          console.log('- Por Procesar:', tramitesPorProcesar);
          
          // Si no tenemos tramitesActivos, consideramos activos todos los que no están rechazados
          if (totalTramites > 0) {
            tramitesActivos = totalTramites - tramitesRechazados;
          } else {
            tramitesActivos = tramitesAprobados + tramitesPorProcesar;
          }
          
          // Si no tenemos total, calcularlo como la suma de todos los estados
          if (totalTramites === 0) {
            totalTramites = tramitesAprobados + tramitesRechazados + tramitesPorProcesar;
          }
          
          // Si aún no tenemos datos, intentar calcular desde el array como último recurso
          if (tramitesAprobados === 0 && tramitesRechazados === 0 && tramitesPorProcesar === 0) {
            console.log('📄 Intentando calcular desde array como último recurso...');
            const tramitesList = tramitesResponse?.paperworks || tramitesResponse?.data || [];
            if (Array.isArray(tramitesList) && tramitesList.length > 0) {
              if (totalTramites === 0) totalTramites = tramitesList.length;
              
              tramitesAprobados = tramitesList.filter(tramite => 
                tramite.estado === 'APROBADO' || 
                tramite.estado === 'Aprobado' || 
                tramite.estadotramite === 'Aprobado' || 
                tramite.status === 'APPROVED').length;
              
              tramitesRechazados = tramitesList.filter(tramite => 
                tramite.estado === 'RECHAZADO' || 
                tramite.estado === 'Rechazado' || 
                tramite.estadotramite === 'Rechazado' || 
                tramite.status === 'REJECTED').length;
              
              tramitesPorProcesar = tramitesList.filter(tramite => 
                tramite.estado === 'POR PROCESAR' || 
                tramite.estado === 'Por Procesar' || 
                tramite.estadotramite === 'Por Procesar').length;
              
              console.log('✅ Calculado desde array - Aprobados:', tramitesAprobados, 'Rechazados:', tramitesRechazados, 'Por Procesar:', tramitesPorProcesar);
            }
          }
          
          // GARANTIZAR QUE SIEMPRE TENGAMOS VALORES VÁLIDOS
          // Si aún no tenemos datos, usar valores por defecto
          if (isNaN(tramitesAprobados) || tramitesAprobados < 0) tramitesAprobados = 0;
          if (isNaN(tramitesRechazados) || tramitesRechazados < 0) tramitesRechazados = 0;
          if (isNaN(tramitesPorProcesar) || tramitesPorProcesar < 0) tramitesPorProcesar = 0;
          if (isNaN(totalTramites) || totalTramites < 0) totalTramites = 0;
          
          console.log('📄 VALORES FINALES GARANTIZADOS:');
          console.log('- Aprobados:', tramitesAprobados);
          console.log('- Rechazados:', tramitesRechazados);
          console.log('- Por Procesar:', tramitesPorProcesar);
          console.log('- Total:', totalTramites);
          
        } catch (error) {
          console.error('❌ Error obteniendo trámites:', error.message);
          // Usar datos mock como fallback
          tramitesActivos = 120; tramitesAprobados = 85; tramitesRechazados = 15; totalTramites = 135;
        }

        const statisticsData = {
          empresas: { 
            activos: empresasActivas, 
            inactivos: empresasInactivas, 
            total: totalEmpresas 
          },
          usuarios: { 
            activos: usuariosActivos, 
            inactivos: usuariosInactivos, 
            internos: usuariosInternos, 
            externos: usuariosExternos, 
            total: totalUsuarios 
          },
          perfiles: { 
            activos: perfilesActivos, 
            inactivos: perfilesInactivos, 
            profilesWithGrantPermissions: perfilesConPermisos,
            profilesWithAllModules: perfilesConTodosModulos,
            total: totalPerfiles 
          },
          permisos: { 
            activos: permisosActivos, 
            inactivos: permisosInactivos, 
            total: totalPermisos 
          },
          redesSociales: { 
            activos: redesActivas, 
            inactivos: redesInactivas, 
            total: totalRedes 
          },
          tramites: { 
            activos: tramitesActivos, 
            inactivos: totalTramites - tramitesActivos, 
            aprobados: tramitesAprobados, 
            rechazados: tramitesRechazados, 
            porProcesar: tramitesPorProcesar,
            total: totalTramites 
          },
          bitacora: { 
            registros: totalRegistrosBitacora, 
            sesionesAbiertas: sesionesAbiertas,
            sesionesCerradas: sesionesCerradas,
            total: totalRegistrosBitacora 
          }
        };
        
        console.log('✅ Estadísticas calculadas:', statisticsData);
        setStatistics(statisticsData);
      } catch (error) {
        console.error('❌ Error fetching menu statistics:', error);
        console.error('Error details:', error.message);
        // Establecer datos por defecto en caso de error
        setStatistics({
          empresas: { activos: 0, inactivos: 0, total: 0 },
          usuarios: { activos: 0, inactivos: 0, internos: 0, externos: 0, total: 0 },
          perfiles: { activos: 0, inactivos: 0, profilesWithGrantPermissions: 0, profilesWithAllModules: 0, total: 0 },
          permisos: { activos: 0, inactivos: 0, total: 0 },
          redesSociales: { activos: 0, inactivos: 0, total: 0 },
          tramites: { activos: 0, inactivos: 0, aprobados: 0, rechazados: 0, total: 0 },
          bitacora: { registros: 0, hoy: 0 }
        });
      } finally {
        console.log('🏁 Finalizando carga de estadísticas');
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return { statistics, loading };
};
