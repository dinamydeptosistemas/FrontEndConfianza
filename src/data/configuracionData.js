export const configGroups = [
    {
        title: 'Company and User',
        subgroups: [
            {
                title: '1. Accesos',
                items: [
                    { label: 'a) MODO ENTIDAD: permite crear empresas en el sistema solo con RUC de', value: 'SI' },
                    { label: 'b) GESTION GRUPO: Contabiliza informacion como ente Individual o Grupo', value: 'SI' },
                    { label: 'c) Mostrar Nombre Comercial de Empresa Principal en Login', value: 'SI' },
                    { label: 'd) Mostrar Imagen o Logo de Empresa Principal en Fondo de Login', value: 'SI' },
                    { label: 'e) Permitir acceso a Manager System a otro Usuario', value: 'SI' },
                    { label: 'f) Cerrado Automatico de Sesion Inactiva (20 a 30 min)', value: '20' },
                    { label: 'g) Opcion Justificar Sesion Pausada (10 a 15 min)', value: '10' },
                    { label: 'h) Opcion Reportar Tareas durante Pausa (60, 120 o 240 min)', value: '60' },
                ]
            },
            {
                title: '2. Configuraciones',
                items: []
            }
        ]
    },
    {
        title: 'Staff',
        subgroups: [
            {
                title: '3. Usuarios Externos',
                items: []
            },
            {
                title: '4. Nomina',
                items: []
            }
        ]
    },
    {
        title: 'Manager',
        subgroups: [
            {
                title: '5. Contabilidad',
                items: [
                    { label: 'a) Periodo Contable predeterminado (Vigente)', value: '2025' },
                    { label: 'b) Periodo Anterior habilitado para consultas desde', value: '2024' },
                    { label: 'c) Fecha Inicio Periodo Contable (Vigente)', value: '2025-01-01' },
                    { label: 'd) Fecha Final Periodo Contable (Vigente)', value: '2025-12-31' },
                    { label: 'e) Bloqueo de modificacion de Asientos de Periodos Anteriores (Cerrados)', value: 'SI' },
                    { label: 'f) Permitir Nuevos Asientos o Cargar plantillas de años anteriores', value: 'SI' },
                    { label: 'g) Permitir Crear nuevos Libros Contables', value: 'SI' },
                    { label: 'h) Permitir Crear nuevas Cuentas Contables', value: 'SI' },
                ]
            },
            {
                title: '6. Administracion',
                items: []
            }
        ]
    },
    {
        title: 'Investments and Contract',
        subgroups: [
            {
                title: '7.1 Financiamiento',
                items: []
            },
            {
                title: '7.2 Inversion',
                items: []
            },
            {
                title: '7.3 Renta prevista',
                items: []
            },
            {
                title: '7.4 Presupuesto',
                items: []
            },
            {
                title: '7.5 Bancos',
                items: []
            },
            {
                title: '7.6 Flujo de Efectivo',
                items: []
            },
            {
                title: '7.7 Escrituras',
                items: []
            },
            {
                title: '7.8 Contratos',
                items: []
            },
            {
                title: '7.9 Abogados Denuncias y Procesos',
                items: []
            }
        ]
    },
    {
        title: 'Product',
        subgroups: [
            {
                title: '8.1 Desarrollo',
                items: []
            },
            {
                title: '8.2 Producto',
                items: []
            },
            {
                title: '8.3 Marketing',
                items: []
            },
            {
                title: '9. Produccion',
                items: []
            }
        ]
    },
    {
        title: 'Transport',
        subgroups: [
            {
                title: '10. Transporte',
                items: []
            }
        ]
    },
    {
        title: 'Purchase',
        subgroups: [
            {
                title: '11.1 Comprobantes Electronicos Recibidos',
                items: []
            },
            {
                title: '11.1 Compras',
                items: []
            },
            {
                title: '11.2 Entradas',
                items: []
            }
        ]
    },
    {
        title: 'Storage',
        subgroups: [
            {
                title: '12.1 Inventarios Externos',
                items: []
            },
            {
                title: '12.2 Inventarios Internos',
                items: []
            }
        ]
    },
    {
        title: 'Sales',
        subgroups: [
            {
                title: '13.1 Salidas',
                items: []
            },
            {
                title: '13.2 Ventas General',
                items: []
            },
            {
                title: '13.3 Facturas Electronicas Emitidas',
                items: []
            },
            {
                title: '14. Punto Venta',
                items: []
            },
            {
                title: '15. Area Atencion Cliente (AAC)',
                items: []
            }
        ]
    },
    {
        title: 'Cash',
        subgroups: [
            {
                title: '16. Caja',
                items: []
            },
            {
                title: '17. Bancos',
                items: []
            },
            {
                title: '18. Tarjeta Credito',
                items: []
            },
            {
                title: '19. Otros medios de pago',
                items: []
            }
        ]
    },
    {
        title: 'E-Commerce',
        subgroups: [
            {
                title: '20.1 Tienda Virtual',
                items: []
            },
            {
                title: '20.2 Productos',
                items: []
            },
            {
                title: '20.3 Politicas de Comercio',
                items: []
            },
            {
                title: '20.4 Redes Sociales y Medios de Contacto',
                items: []
            },
            {
                title: '20.5 Medios de Pago',
                items: []
            },
            {
                title: '20.6 Clientes',
                items: []
            },
            {
                title: '20.7 Ventas',
                items: []
            },
            {
                title: '20.8 Salidas de productos',
                items: []
            },
            {
                title: '20.9 Delivery',
                items: []
            },
            {
                title: '20.10 Devolucuines y Garantias',
                items: []
            },
            {
                title: '20.11 Contabilidad',
                items: []
            }
        ]
    }
];
