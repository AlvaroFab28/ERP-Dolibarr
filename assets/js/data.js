/**
 * data.js - Base de Datos Simulada para el Prototipo Dolibarr ERP
 * Localizado para Bolivia (Moneda: Bs / $us, Empresas bolivianas)
 * Persistencia en localStorage
 */

const STORAGE_KEY = 'dolibarr_db';

const initialData = {
  company: {
    name: "Distribuidora Industrial Altiplano S.A. (DIASA)",
    sigla: "DIASA S.A.",
    nit: "1020349021",
    address: "Av. Arce Nro. 2529, Edif. Torres de los Poetas, Piso 12",
    city: "La Paz, Bolivia",
    phone: "+591 2 2432211",
    email: "contacto@diasa.com.bo",
    web: "https://www.diasa.com.bo"
  },
  currentUser: null, // null significa no logueado
  terceros: [
    { id: 1, name: "YPFB Corporación S.A.", nit: "1020343029", type: "cliente", address: "Av. Doble Vía a La Guardia, Santa Cruz", phone: "+591 3 3564000", email: "info@ypfb.gob.bo", status: "activo", balance: 145000.00 },
    { id: 2, name: "Empresa Nacional de Telecomunicaciones (ENTEL S.A.)", nit: "1020293021", type: "cliente", address: "Calle Federico Zuazo Nro. 1771, La Paz", phone: "+591 2 2141010", email: "atencion@entel.bo", status: "activo", balance: 85200.00 },
    { id: 3, name: "Cervecería Boliviana Nacional S.A. (CBN)", nit: "1015193027", type: "cliente", address: "Av. Montes Nro. 528, La Paz", phone: "+591 2 2125000", email: "cbn@cbn.com.bo", status: "activo", balance: -15000.00 }, // saldo negativo es prepago
    { id: 4, name: "Minera San Cristóbal S.A.", nit: "1016259023", type: "ambos", address: "Calle 15 de Calacoto, Edif. MSC, La Paz", phone: "+591 2 2117100", email: "proveedores@minerasancristobal.com", status: "activo", balance: 320000.00 },
    { id: 5, name: "Metalúrgica Vinto S.A.", nit: "1015147024", type: "proveedor", address: "Carretera Oruro-Potosí Km 6, Oruro", phone: "+591 2 5112525", email: "vinto@vinto.gob.bo", status: "activo", balance: -54000.00 }, // debemos pagarle
    { id: 6, name: "Soporte y Tecnología del Sur SRL (SOPOTECS)", nit: "1028349015", type: "proveedor", address: "Av. Las Américas Nro. 412, Tarija", phone: "+591 4 6649988", email: "ventas@sopotecs.com.bo", status: "activo", balance: 0.00 }
  ],
  contacts: [
    { id: 1, terceroId: 1, first_name: "Ronald", last_name: "Huanca", email: "rhuanca@ypfb.gob.bo", phone: "72144321", role: "Jefe de Compras" },
    { id: 2, terceroId: 2, first_name: "Mariela", last_name: "Yugar", email: "myugar@entel.bo", phone: "71522900", role: "Encargada de Sistemas" },
    { id: 3, terceroId: 4, first_name: "Carlos", last_name: "Mendoza", email: "cmendoza@minerasancristobal.com", phone: "70655432", role: "Director de Operaciones" },
    { id: 4, terceroId: 5, first_name: "Jaime", last_name: "Villarreal", email: "jvillarreal@vinto.gob.bo", phone: "73211559", role: "Jefe de Almacén" }
  ],
  products: [
    { id: 1, code: "PROD-VALV-001", label: "Válvula de Control de Presión 3\"", type: "producto", price: 4200.00, cost: 2500.00, stock: 45, minStock: 10, description: "Válvula hidráulica para alta presión, estándar industrial API 6D." },
    { id: 2, code: "PROD-TUBO-006", label: "Tubería de Acero Carbono 6\" (6m)", type: "producto", price: 1850.00, cost: 1100.00, stock: 120, minStock: 20, description: "Tubería de acero al carbono sin costura, SCH 40." },
    { id: 3, code: "PROD-MOT-50HP", label: "Motor Eléctrico Trifásico Siemens 50HP", type: "producto", price: 18900.00, cost: 13500.00, stock: 8, minStock: 2, description: "Motor de inducción trifásico, 380V / 60Hz, IP55." },
    { id: 4, code: "SERV-INST-01", label: "Servicio de Instalación y Calibración", type: "servicio", price: 800.00, cost: 300.00, stock: 0, minStock: 0, description: "Servicio técnico por hora para instalación de equipos y calibración de válvulas." },
    { id: 5, code: "SERV-CONS-AUTO", label: "Consultoría en Automatización de Procesos", type: "servicio", price: 1500.00, cost: 500.00, stock: 0, minStock: 0, description: "Consultoría integral para diseño de arquitectura SCADA y PLC." }
  ],
  commercial: {
    presupuestos: [
      { id: 1, ref: "PR2605-001", terceroId: 1, date: "2026-05-10", total_ht: 42000.00, total_ttc: 47460.00, status: "Aceptado" },
      { id: 2, ref: "PR2605-002", terceroId: 2, date: "2026-05-15", total_ht: 15000.00, total_ttc: 16950.00, status: "Borrador" },
      { id: 3, ref: "PR2605-003", terceroId: 4, date: "2026-05-20", total_ht: 75600.00, total_ttc: 85428.00, status: "Validado" },
      { id: 4, ref: "PR2605-004", terceroId: 3, date: "2026-05-22", total_ht: 37800.00, total_ttc: 42714.00, status: "Rechazado" }
    ],
    pedidos: [
      { id: 1, ref: "PE2605-001", terceroId: 1, date: "2026-05-11", total_ht: 42000.00, total_ttc: 47460.00, status: "En proceso" },
      { id: 2, ref: "PE2605-002", terceroId: 4, date: "2026-05-24", total_ht: 54000.00, total_ttc: 61020.00, status: "Entregado" },
      { id: 3, ref: "PE2605-003", terceroId: 2, date: "2026-05-28", total_ht: 18900.00, total_ttc: 21357.00, status: "Validado" }
    ]
  },
  financiera: {
    facturas_cliente: [
      { id: 1, ref: "FA2605-001", terceroId: 1, date: "2026-05-12", date_due: "2026-06-12", total_ht: 42000.00, total_ttc: 47460.00, status: "Pago parcial" },
      { id: 2, ref: "FA2605-002", terceroId: 4, date: "2026-05-25", date_due: "2026-06-25", total_ht: 54000.00, total_ttc: 61020.00, status: "Pagado" },
      { id: 3, ref: "FA2605-003", terceroId: 2, date: "2026-05-29", date_due: "2026-06-29", total_ht: 18900.00, total_ttc: 21357.00, status: "Validado" }
    ],
    facturas_proveedor: [
      { id: 1, ref: "FP-VINTO-092", terceroId: 5, date: "2026-05-05", date_due: "2026-06-05", total_ht: 54000.00, total_ttc: 61020.00, status: "Validado" },
      { id: 2, ref: "FP-SOP-044", terceroId: 6, date: "2026-05-18", date_due: "2026-06-18", total_ht: 3500.00, total_ttc: 3955.00, status: "Pagado" }
    ],
    pagos: [
      { id: 1, type: "cliente", ref: "PAG-CL-001", invoiceRef: "FA2605-001", amount: 20000.00, date: "2026-05-15", method: "Transferencia BNB" },
      { id: 2, type: "cliente", ref: "PAG-CL-002", invoiceRef: "FA2605-002", amount: 61020.00, date: "2026-05-26", method: "Transferencia BMSC" },
      { id: 3, type: "proveedor", ref: "PAG-PR-001", invoiceRef: "FP-SOP-044", amount: 3955.00, date: "2026-05-20", method: "Efectivo" }
    ]
  },
  bancos: [
    { id: 1, label: "Banco Nacional de Bolivia (BNB)", bank_name: "BNB", number: "100-03294821", currency: "Bs", balance: 850420.00, type: "corriente" },
    { id: 2, label: "Banco Mercantil Santa Cruz (BMSC) USD", bank_name: "BMSC", number: "401-08492023", currency: "USD", balance: 45000.00, type: "ahorros" },
    { id: 3, label: "Caja Chica Central", bank_name: "Caja Fuerte", number: "Caja-01", currency: "Bs", balance: 5200.00, type: "efectivo" }
  ],
  contabilidad: {
    diario: [
      { id: 1, date: "2026-05-12", ref: "FA2605-001", desc: "Venta YPFB Corp Válvula", account: "400000 - Ventas", debit: 0, credit: 42000.00, journal: "Ventas" },
      { id: 2, date: "2026-05-12", ref: "FA2605-001", desc: "Débito Fiscal IVA 13%", account: "213010 - IVA Débito", debit: 0, credit: 5460.00, journal: "Ventas" },
      { id: 3, date: "2026-05-12", ref: "FA2605-001", desc: "Exigible YPFB", account: "120000 - Clientes", debit: 47460.00, credit: 0, journal: "Ventas" },
      { id: 4, date: "2026-05-15", ref: "PAG-CL-001", desc: "Pago Parcial YPFB BNB", account: "111100 - Banco BNB", debit: 20000.00, credit: 0, journal: "Bancos" },
      { id: 5, date: "2026-05-15", ref: "PAG-CL-001", desc: "Abono Clientes YPFB", account: "120000 - Clientes", debit: 0, credit: 20000.00, journal: "Bancos" }
    ]
  },
  rrhh: {
    employees: [
      { id: 1, first_name: "Alejandro", last_name: "Mamani", role: "Gerente de Finanzas", salary_bs: 18000.00, hire_date: "2020-02-15", status: "activo" },
      { id: 2, first_name: "Giovanna", last_name: "Flores", role: "Jefe de Ventas", salary_bs: 12000.00, hire_date: "2022-06-01", status: "activo" },
      { id: 3, first_name: "Mauricio", last_name: "Copa", role: "Ingeniero de Soporte", salary_bs: 8500.00, hire_date: "2024-01-10", status: "activo" },
      { id: 4, first_name: "Valeria", last_name: "Pinto", role: "Asistente Administrativa", salary_bs: 5500.00, hire_date: "2025-09-01", status: "activo" }
    ],
    leaves: [
      { id: 1, employeeId: 2, type: "Vacación", start_date: "2026-06-05", end_date: "2026-06-12", days: 6, status: "Aprobado" },
      { id: 2, employeeId: 3, type: "Baja Médica", start_date: "2026-05-18", end_date: "2026-05-19", days: 2, status: "Aprobado" },
      { id: 3, employeeId: 4, type: "Vacación", start_date: "2026-07-01", end_date: "2026-07-15", days: 10, status: "Borrador" }
    ],
    expenses: [
      { id: 1, employeeId: 2, date: "2026-05-14", label: "Viáticos Viaje de Ventas Santa Cruz", amount_bs: 1850.00, status: "Pagado" },
      { id: 2, employeeId: 3, date: "2026-05-20", label: "Compra de Cables y Conectores de Emergencia", amount_bs: 320.00, status: "Aprobado" },
      { id: 3, employeeId: 1, date: "2026-05-28", label: "Almuerzo Corporativo Auditoría", amount_bs: 750.00, status: "Borrador" }
    ]
  },
  mrp: {
    boms: [
      { id: 1, product_id: 3, label: "Ensamblaje Motor Siemens 50HP con Base Metálica", status: "activo", components: [
        { product_id: 1, qty: 1 }, // Válvula
        { product_id: 2, qty: 2 }  // Tuberías
      ]}
    ],
    manufacturing_orders: [
      { id: 1, ref: "OF2605-001", bom_id: 1, qty: 5, start_date: "2026-05-02", end_date: "2026-05-10", status: "Finalizado" },
      { id: 2, ref: "OF2605-002", bom_id: 1, qty: 3, start_date: "2026-05-28", end_date: "2026-06-04", status: "En proceso" },
      { id: 3, ref: "OF2605-003", bom_id: 1, qty: 2, start_date: "2026-06-10", end_date: "2026-06-15", status: "Borrador" }
    ]
  },
  proyectos: {
    projects: [
      { id: 1, title: "Modernización de Red de Válvulas YPFB", terceroId: 1, budget_bs: 180000.00, start_date: "2026-05-01", end_date: "2026-08-30", status: "En proceso" },
      { id: 2, title: "Estudio de Automatización Planta Vinto", terceroId: 4, budget_bs: 45000.00, start_date: "2026-06-01", end_date: "2026-07-15", status: "Borrador" },
      { id: 3, title: "Instalación Red Telefónica Interna CBN", terceroId: 3, budget_bs: 95000.00, start_date: "2026-03-10", end_date: "2026-05-25", status: "Cerrado" }
    ],
    tasks: [
      { id: 1, projectId: 1, title: "Inspección preliminar de ductos", assigneeId: 3, hours_planned: 40, hours_spent: 38, status: "Finalizado" },
      { id: 2, projectId: 1, title: "Instalación de actuadores neumáticos", assigneeId: 3, hours_planned: 80, hours_spent: 45, status: "En proceso" },
      { id: 3, projectId: 1, title: "Pruebas de presión y fugas", assigneeId: 3, hours_planned: 24, hours_spent: 0, status: "Por hacer" },
      { id: 4, projectId: 3, title: "Tendido de cableado de fibra", assigneeId: 3, hours_planned: 120, hours_spent: 125, status: "Finalizado" }
    ]
  },
  agenda: [
    { id: 1, title: "Reunión Técnica Válvulas YPFB", desc: "Analizar requerimientos técnicos del contrato de válvulas.", start_date: "2026-05-12T10:00:00", end_date: "2026-05-12T12:00:00", type: "Reunión", relationType: "tercero", relationId: 1 },
    { id: 2, title: "Llamada seguimiento ENTEL", desc: "Seguimiento al presupuesto PR2605-002 enviado.", start_date: "2026-05-18T15:30:00", end_date: "2026-05-18T16:00:00", type: "Llamada", relationType: "tercero", relationId: 2 },
    { id: 3, title: "Visita Técnica Minera San Cristóbal", desc: "Inspección in-situ en Potosí para proyecto de automatización.", start_date: "2026-06-03T08:00:00", end_date: "2026-06-05T18:00:00", type: "Visita", relationType: "tercero", relationId: 4 }
  ],
  tickets: [
    { id: 1, ref: "TCK2605-001", title: "Falla en Válvula Mod. 001 - YPFB", desc: "Cliente reporta fuga menor en sello de teflón posterior a instalación.", terceroId: 1, priority: "Alta", status: "En curso", date_created: "2026-05-24" },
    { id: 2, ref: "TCK2605-002", title: "Configuración PLC no responde", desc: "Se requiere asistencia remota para cargar backup de SCADA.", terceroId: 4, priority: "Media", status: "Nuevo", date_created: "2026-05-30" },
    { id: 3, ref: "TCK2605-003", title: "Consulta técnica catálogo de repuestos", desc: "Solicitud de catálogo detallado de codos y bridas de 6\".", terceroId: 2, priority: "Baja", status: "Resuelto", date_created: "2026-05-15" }
  ],
  documentos: [
    { id: 1, name: "Contratos", type: "folder", path: "/", size: 0, date: "2026-05-01" },
    { id: 2, name: "Facturas_Emitidas", type: "folder", path: "/", size: 0, date: "2026-05-01" },
    { id: 3, name: "Especificaciones_Tecnicas", type: "folder", path: "/", size: 0, date: "2026-05-01" },
    { id: 4, name: "Contrato_Marco_YPFB_2026.pdf", type: "pdf", path: "/Contratos", size: 4500000, date: "2026-05-02" },
    { id: 5, name: "Folleto_Valvulas_API.pdf", type: "pdf", path: "/Especificaciones_Tecnicas", size: 1200000, date: "2026-05-03" }
  ],
  miembros: [
    { id: 1, first_name: "Ramiro", last_name: "Valdez", type: "Socio Fundador", email: "rvaldez@miembros.org.bo", status: "Activo", join_date: "2024-01-01" },
    { id: 2, first_name: "Elena", last_name: "Suarez", type: "Adherente", email: "esuarez@miembros.org.bo", status: "Al día", join_date: "2025-03-15" },
    { id: 3, first_name: "Mateo", last_name: "Ortiz", type: "Aspirante", email: "mortiz@miembros.org.bo", status: "Borrador", join_date: "2026-05-10" }
  ],
  sitios: [
    { id: 1, name: "Sitio Web Principal DIASA", key: "main_diasa", template: "Corporativo", pages: 5, status: "Publicado" },
    { id: 2, name: "Portal de Autoservicio Clientes", key: "portal_clients", template: "Portal", pages: 3, status: "Borrador" }
  ],
  tpv: {
    sessions: [
      { id: 1, user: "admin", status: "Cerrada", opening_balance: 500.00, closing_balance: 1850.00, sales_count: 5, total_sales: 1350.00 },
      { id: 2, user: "admin", status: "Abierta", opening_balance: 500.00, closing_balance: 500.00, sales_count: 0, total_sales: 0.00 }
    ],
    cart: []
  }
};

/**
 * Obtener la base de datos actual desde localStorage o inicializarla.
 */
function getDB() {
  const dbStr = localStorage.getItem(STORAGE_KEY);
  if (!dbStr) {
    saveDB(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }
  try {
    return JSON.parse(dbStr);
  } catch (e) {
    console.error("Error leyendo DB de localStorage, restableciendo...", e);
    saveDB(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }
}

/**
 * Guardar la base de datos en localStorage.
 */
function saveDB(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Restablecer base de datos a valores iniciales.
 */
function resetDB() {
  saveDB(initialData);
  return JSON.parse(JSON.stringify(initialData));
}

// Exportar funciones globalmente para que sean accesibles desde los scripts del SPA
window.DolibarrDB = {
  get: getDB,
  save: saveDB,
  reset: resetDB
};
