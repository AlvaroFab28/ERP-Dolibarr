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
      { id: 1, ref: "PR2605-001", terceroId: 1, date: "2026-05-10", total_ht: 42000.00, total_ttc: 47460.00, status: "Aceptado", lines: [{ productId: 1, qty: 10, price: 4200.00, discount_pct: 0 }] },
      { id: 2, ref: "PR2605-002", terceroId: 2, date: "2026-05-15", total_ht: 15000.00, total_ttc: 16950.00, status: "Borrador", lines: [{ productId: 5, qty: 10, price: 1500.00, discount_pct: 0 }] },
      { id: 3, ref: "PR2605-003", terceroId: 4, date: "2026-05-20", total_ht: 75600.00, total_ttc: 85428.00, status: "Validado", lines: [{ productId: 3, qty: 4, price: 18900.00, discount_pct: 0 }] },
      { id: 4, ref: "PR2605-004", terceroId: 3, date: "2026-05-22", total_ht: 37800.00, total_ttc: 42714.00, status: "Rechazado", lines: [{ productId: 1, qty: 9, price: 4200.00, discount_pct: 0 }] }
    ],
    pedidos: [
      { id: 1, ref: "PE2605-001", terceroId: 1, date: "2026-05-11", total_ht: 42000.00, total_ttc: 47460.00, status: "En proceso", lines: [{ productId: 1, qty: 10, price: 4200.00, discount_pct: 0 }] },
      { id: 2, ref: "PE2605-002", terceroId: 4, date: "2026-05-24", total_ht: 54000.00, total_ttc: 61020.00, status: "Entregado", lines: [{ productId: 3, qty: 3, price: 18900.00, discount_pct: 5 }] },
      { id: 3, ref: "PE2605-003", terceroId: 2, date: "2026-05-28", total_ht: 18900.00, total_ttc: 21357.00, status: "Validado", lines: [{ productId: 3, qty: 1, price: 18900.00, discount_pct: 0 }] }
    ],
    contratos: [
      { id: 1, ref: "CON2606-001", terceroId: 1, label: "Mantenimiento Anual Válvulas YPFB", monto_bs: 120000.00, start_date: "2026-06-01", end_date: "2027-05-31", status: "Activo" },
      { id: 2, ref: "CON2606-002", terceroId: 2, label: "Soporte de Fibra Óptica ENTEL", monto_bs: 45000.00, start_date: "2026-07-01", end_date: "2026-12-31", status: "Borrador" },
      { id: 3, ref: "CON2606-003", terceroId: 3, label: "Monitoreo Red Interna CBN", monto_bs: 35000.00, start_date: "2025-06-01", end_date: "2026-05-31", status: "Cerrado" }
    ]
  },
  financiera: {
    facturas_cliente: [
      { id: 1, ref: "FA2605-001", terceroId: 1, date: "2026-05-12", date_due: "2026-06-12", total_ht: 42000.00, total_ttc: 47460.00, status: "Pago parcial", accounting_status: "posted", lines: [{ productId: 1, qty: 10, price: 4200.00, discount_pct: 0 }] },
      { id: 2, ref: "FA2605-002", terceroId: 4, date: "2026-05-25", date_due: "2026-06-25", total_ht: 54000.00, total_ttc: 61020.00, status: "Pagado", accounting_status: "posted", lines: [{ productId: 3, qty: 3, price: 18000.00, discount_pct: 0 }] },
      { id: 3, ref: "FA2605-003", terceroId: 2, date: "2026-05-29", date_due: "2026-06-29", total_ht: 18900.00, total_ttc: 21357.00, status: "Validado", accounting_status: "pending", lines: [{ productId: 3, qty: 1, price: 18900.00, discount_pct: 0 }] }
    ],
    facturas_proveedor: [
      { id: 1, ref: "FP-VINTO-092", terceroId: 5, date: "2026-05-05", date_due: "2026-06-05", total_ht: 54000.00, total_ttc: 61020.00, status: "Validado", accounting_status: "pending", lines: [{ productId: 3, qty: 3, price: 18000.00, discount_pct: 0 }] },
      { id: 2, ref: "FP-SOP-044", terceroId: 6, date: "2026-05-18", date_due: "2026-06-18", total_ht: 3500.00, total_ttc: 3955.00, status: "Pagado", accounting_status: "posted", lines: [{ productId: 4, qty: 5, price: 700.00, discount_pct: 0 }] }
    ],
    pagos: [
      { id: 1, type: "cliente", ref: "PAG-CL-001", invoiceRef: "FA2605-001", amount: 20000.00, date: "2026-05-15", method: "Transferencia BNB" },
      { id: 2, type: "cliente", ref: "PAG-CL-002", invoiceRef: "FA2605-002", amount: 61020.00, date: "2026-05-26", method: "Transferencia BMSC" },
      { id: 3, type: "proveedor", ref: "PAG-PR-001", invoiceRef: "FP-SOP-044", amount: 3955.00, date: "2026-05-20", method: "Efectivo" }
    ],
    prestamos: [
      { id: 1, ref: "PRE2606-001", lender: "Banco Nacional de Bolivia (BNB)", amount_bs: 100000.00, interest_rate_pct: 7.5, term_months: 24, monthly_payment_bs: 4500.00, balance_bs: 91000.00, date: "2026-05-01", status: "Activo", bankId: 1 }
    ],
    pagos_varios: [
      { id: 1, ref: "VAR2606-001", label: "Pago de Alquiler de Oficinas Piso 12", category: "Alquileres", amount_bs: 3500.00, date: "2026-05-02", bankId: 1, method: "Transferencia BNB" },
      { id: 2, ref: "VAR2606-002", label: "Factura Mensual de Luz - DELAPAZ", category: "Servicios Básicos", amount_bs: 480.00, date: "2026-05-10", bankId: 3, method: "Efectivo / Caja" }
    ]
  },
  bancos: [
    { id: 1, label: "Banco Nacional de Bolivia (BNB)", bank_name: "BNB", number: "100-03294821", currency: "Bs", balance: 850420.00, type: "corriente" },
    { id: 2, label: "Banco Mercantil Santa Cruz (BMSC) USD", bank_name: "BMSC", number: "401-08492023", currency: "USD", balance: 45000.00, type: "ahorros" },
    { id: 3, label: "Caja Chica Central", bank_name: "Caja Fuerte", number: "Caja-01", currency: "Bs", balance: 5200.00, type: "efectivo" }
  ],
  contabilidad: {
    diario: [
      { id: 1, date: "2026-05-12", ref: "FA2605-001", desc: "Venta YPFB Corp Válvula", account: "400000 - Ventas de Productos", debit: 0, credit: 42000.00, journal: "Ventas" },
      { id: 2, date: "2026-05-12", ref: "FA2605-001", desc: "Débito Fiscal IVA 13%", account: "213010 - Débito Fiscal IVA", debit: 0, credit: 5460.00, journal: "Ventas" },
      { id: 3, date: "2026-05-12", ref: "FA2605-001", desc: "Exigible YPFB", account: "120000 - Clientes (Cuentas por Cobrar)", debit: 47460.00, credit: 0, journal: "Ventas" },
      { id: 4, date: "2026-05-15", ref: "PAG-CL-001", desc: "Pago Parcial YPFB BNB", account: "111100 - Caja/Banco BNB", debit: 20000.00, credit: 0, journal: "Bancos" },
      { id: 5, date: "2026-05-15", ref: "PAG-CL-001", desc: "Abono Clientes YPFB", account: "120000 - Clientes (Cuentas por Cobrar)", debit: 0, credit: 20000.00, journal: "Bancos" },
      // FA2605-002
      { id: 6, date: "2026-05-25", ref: "FA2605-002", desc: "Venta Minera San Cristóbal", account: "400000 - Ventas de Productos", debit: 0, credit: 54000.00, journal: "Ventas" },
      { id: 7, date: "2026-05-25", ref: "FA2605-002", desc: "Débito Fiscal IVA 13%", account: "213010 - Débito Fiscal IVA", debit: 0, credit: 7020.00, journal: "Ventas" },
      { id: 8, date: "2026-05-25", ref: "FA2605-002", desc: "Exigible San Cristóbal", account: "120000 - Clientes (Cuentas por Cobrar)", debit: 61020.00, credit: 0, journal: "Ventas" },
      // PAG-CL-002
      { id: 9, date: "2026-05-26", ref: "PAG-CL-002", desc: "Cobro total FA2605-002 BMSC", account: "111200 - Caja/Banco BMSC", debit: 61020.00, credit: 0, journal: "Bancos" },
      { id: 10, date: "2026-05-26", ref: "PAG-CL-002", desc: "Abono Clientes San Cristóbal", account: "120000 - Clientes (Cuentas por Cobrar)", debit: 0, credit: 61020.00, journal: "Bancos" },
      // FP-SOP-044
      { id: 11, date: "2026-05-18", ref: "FP-SOP-044", desc: "Compra de Soporte Técnico", account: "501000 - Gastos de Administración (Servicios / Compras)", debit: 3500.00, credit: 0, journal: "Compras" },
      { id: 12, date: "2026-05-18", ref: "FP-SOP-044", desc: "Crédito Fiscal IVA 13%", account: "113010 - Crédito Fiscal IVA", debit: 455.00, credit: 0, journal: "Compras" },
      { id: 13, date: "2026-05-18", ref: "FP-SOP-044", desc: "Obligación SOPOTECS", account: "211000 - Proveedores (Cuentas por Pagar)", debit: 0, credit: 3955.00, journal: "Compras" },
      // PAG-PR-001
      { id: 14, date: "2026-05-20", ref: "PAG-PR-001", desc: "Pago Factura SOPOTECS", account: "211000 - Proveedores (Cuentas por Pagar)", debit: 3955.00, credit: 0, journal: "Bancos" },
      { id: 15, date: "2026-05-20", ref: "PAG-PR-001", desc: "Egreso de Caja Chica", account: "111300 - Caja Chica", debit: 0, credit: 3955.00, journal: "Bancos" }
    ]
  },
  rrhh: {
    employees: [
      { id: 1, first_name: "Alejandro", last_name: "Mamani", role: "Gerente de Finanzas", salary_bs: 18000.00, hire_date: "2020-02-15", status: "activo", department: "La Paz", vacation_days_left: 15 },
      { id: 2, first_name: "Giovanna", last_name: "Flores", role: "Jefe de Ventas", salary_bs: 12000.00, hire_date: "2022-06-01", status: "activo", department: "Santa Cruz", vacation_days_left: 12 },
      { id: 3, first_name: "Mauricio", last_name: "Copa", role: "Ingeniero de Soporte", salary_bs: 8500.00, hire_date: "2024-01-10", status: "activo", department: "La Paz", vacation_days_left: 15 },
      { id: 4, first_name: "Valeria", last_name: "Pinto", role: "Asistente Administrativa", salary_bs: 5500.00, hire_date: "2025-09-01", status: "activo", department: "Cochabamba", vacation_days_left: 18 }
    ],
    leaves: [
      { id: 1, employeeId: 2, type: "Vacación", start_date: "2026-06-05", end_date: "2026-06-12", days: 6, status: "Aprobado", reason: "Vacaciones de invierno" },
      { id: 2, employeeId: 3, type: "Baja Médica", start_date: "2026-05-18", end_date: "2026-05-19", days: 2, status: "Aprobado", reason: "Resfrío común con baja médica" },
      { id: 3, employeeId: 4, type: "Vacación", start_date: "2026-07-01", end_date: "2026-07-15", days: 10, status: "Borrador", reason: "Asuntos familiares" }
    ],
    expenses: [
      { id: 1, employeeId: 2, date: "2026-05-14", label: "Viáticos Viaje de Ventas Santa Cruz", amount_bs: 1850.00, status: "Aprobado", accounting_status: "pending", lines: [
        { id: 1, date: "2026-05-12", concept: "Pasajes de bus La Paz - SCZ", category: "Transporte", amount_bs: 350.00 },
        { id: 2, date: "2026-05-13", concept: "Hospedaje 2 noches Hotel Camino Real", category: "Alojamiento", amount_bs: 1100.00 },
        { id: 3, date: "2026-05-14", concept: "Cena de negocios clientes YPFB", category: "Alimentación", amount_bs: 400.00 }
      ] },
      { id: 2, employeeId: 3, date: "2026-05-20", label: "Compra de Cables y Conectores de Emergencia", amount_bs: 320.00, status: "Aprobado", accounting_status: "pending", lines: [
        { id: 1, date: "2026-05-20", concept: "Cables UTP Cat6 y conectores RJ45 AMP", category: "Materiales", amount_bs: 320.00 }
      ] },
      { id: 3, employeeId: 1, date: "2026-05-28", label: "Almuerzo Corporativo Auditoría", amount_bs: 750.00, status: "Borrador", accounting_status: "pending", lines: [
        { id: 1, date: "2026-05-28", concept: "Almuerzo de trabajo auditores externos", category: "Alimentación", amount_bs: 750.00 }
      ] }
    ],
    payroll_payments: [
      { id: 1, employeeId: 2, month: "04", year: "2026", salary_bs: 12000.00, bonuses_bs: 0.00, deductions_bs: 1525.20, net_paid_bs: 10474.80, date: "2026-04-30", status: "Pagado", bankId: 1 }
    ],
    puestos: [
      { id: 1, title: "Ingeniero de Automatización Senior", department: "Santa Cruz", salary_range: "Bs. 12.000 - 15.000", status: "Abierto", description: "Buscamos Ingeniero con experiencia en PLC Siemens S7-1500 y sistemas SCADA.", date_created: "2026-05-15" },
      { id: 2, title: "Técnico de Redes y Telecomunicaciones", department: "La Paz", salary_range: "Bs. 6.000 - 8.000", status: "Abierto", description: "Soporte técnico de campo, cableado estructurado y configuración de switches Cisco.", date_created: "2026-05-20" },
      { id: 3, title: "Encargado de Almacén", department: "Oruro", salary_range: "Bs. 5.000 - 6.000", status: "Borrador", description: "Control de inventarios de repuestos mecánicos e insumos industriales.", date_created: "2026-06-01" }
    ],
    applications: [
      { id: 1, puestoId: 1, first_name: "Carlos", last_name: "Miranda", email: "cmiranda@gmail.com", phone: "78822114", cv_link: "https://diasa.com.bo/cv/cv_carlos_miranda.pdf", status: "Entrevista", date_applied: "2026-05-20" },
      { id: 2, puestoId: 2, first_name: "Beatriz", last_name: "Quispe", email: "bquispe@hotmail.com", phone: "69955442", cv_link: "https://diasa.com.bo/cv/cv_beatriz_quispe.pdf", status: "Aceptado", date_applied: "2026-05-25" }
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
      { id: 1, title: "Modernización de Red de Válvulas YPFB", terceroId: 1, budget_bs: 180000.00, start_date: "2026-05-01", end_date: "2026-08-30", status: "En proceso", is_opportunity: false, opp_amount: 0, opp_probability: 0, opp_status: "" },
      { id: 2, title: "Estudio de Automatización Planta Vinto", terceroId: 4, budget_bs: 45000.00, start_date: "2026-06-01", end_date: "2026-07-15", status: "Borrador", is_opportunity: true, opp_amount: 45000.00, opp_probability: 50, opp_status: "Propuesta comercial" },
      { id: 3, title: "Instalación Red Telefónica Interna CBN", terceroId: 3, budget_bs: 95000.00, start_date: "2026-03-10", end_date: "2026-05-25", status: "Cerrado", is_opportunity: false, opp_amount: 0, opp_probability: 0, opp_status: "" },
      { id: 4, title: "Automatización Subestación Eléctrica MSC", terceroId: 4, budget_bs: 320000.00, start_date: "2026-06-15", end_date: "2026-09-30", status: "Borrador", is_opportunity: true, opp_amount: 320000.00, opp_probability: 80, opp_status: "Negociación" },
      { id: 5, title: "Ampliación de Ancho de Banda ENTEL", terceroId: 2, budget_bs: 85000.00, start_date: "2026-05-10", end_date: "2026-07-31", status: "En proceso", is_opportunity: true, opp_amount: 85000.00, opp_probability: 100, opp_status: "Ganado" }
    ],
    tasks: [
      { id: 1, projectId: 1, title: "Inspección preliminar de ductos", assigneeId: 3, hours_planned: 40, hours_spent: 38, status: "Finalizado" },
      { id: 2, projectId: 1, title: "Instalación de actuadores neumáticos", assigneeId: 3, hours_planned: 80, hours_spent: 45, status: "En proceso" },
      { id: 3, projectId: 1, title: "Pruebas de presión y fugas", assigneeId: 3, hours_planned: 24, hours_spent: 0, status: "Por hacer" },
      { id: 4, projectId: 3, title: "Tendido de cableado de fibra", assigneeId: 3, hours_planned: 120, hours_spent: 125, status: "Finalizado" }
    ],
    time_logs: [
      { id: 1, taskId: 2, employeeId: 3, date: "2026-06-01", hours: 8 },
      { id: 2, taskId: 2, employeeId: 3, date: "2026-06-02", hours: 8 },
      { id: 3, taskId: 2, employeeId: 3, date: "2026-06-03", hours: 4 }
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
  },
  warehouses: [
    { id: 1, label: "Almacén Central El Alto (LP)", location: "Av. 6 de Marzo Nro. 450, El Alto", description: "Almacén principal de distribución de insumos y equipos." },
    { id: 2, label: "Sucursal Equipetrol (SC)", location: "Calle Los Claveles Nro. 8, Santa Cruz", description: "Sucursal de ventas y showroom de equipos." },
    { id: 3, label: "Depósito Industrial Vinto (OR)", location: "Zona Industrial Vinto, Oruro", description: "Depósito para almacenamiento a granel y repuestos pesados." }
  ],
  warehouse_stocks: [
    { productId: 1, warehouseId: 1, qty: 30 },
    { productId: 1, warehouseId: 2, qty: 15 },
    { productId: 2, warehouseId: 1, qty: 100 },
    { productId: 2, warehouseId: 2, qty: 20 },
    { productId: 3, warehouseId: 1, qty: 5 },
    { productId: 3, warehouseId: 2, qty: 3 }
  ],
  inventarios: [
    { id: 1, ref: "INV2606-001", warehouseId: 1, inspector: "Alejandro Mamani", status: "Validado", date: "2026-05-20", adjustments: [{ productId: 1, sysQty: 30, physicalQty: 30, diff: 0 }] }
  ],
  envios: [
    { id: 1, ref: "ENV2606-001", orderRef: "PE2605-001", clientName: "YPFB Corporación S.A.", date: "2026-05-15", method: "Courier Bolivia", tracking: "TRK-YPFB-9021", status: "Entregado" }
  ],
  stock_movimientos: [
    { id: 1, productId: 1, originWarehouseId: null, targetWarehouseId: 1, qty: 30, type: "Entrada Inicial", date: "2026-05-01" },
    { id: 2, productId: 1, originWarehouseId: null, targetWarehouseId: 2, qty: 15, type: "Entrada Inicial", date: "2026-05-01" },
    { id: 3, productId: 2, originWarehouseId: null, targetWarehouseId: 1, qty: 100, type: "Entrada Inicial", date: "2026-05-01" },
    { id: 4, productId: 2, originWarehouseId: null, targetWarehouseId: 2, qty: 20, type: "Entrada Inicial", date: "2026-05-01" },
    { id: 5, productId: 3, originWarehouseId: null, targetWarehouseId: 1, qty: 5, type: "Entrada Inicial", date: "2026-05-01" },
    { id: 6, productId: 3, originWarehouseId: null, targetWarehouseId: 2, qty: 3, type: "Entrada Inicial", date: "2026-05-01" }
  ]
};

/**
 * Obtener la base de datos actual desde localStorage o inicializarla.
 */
function getDB() {
  const dbStr = localStorage.getItem(STORAGE_KEY);
  if (!dbStr) {
    return generateMassiveData();
  }
  try {
    const db = JSON.parse(dbStr);
    
    // Migración / inicialización dinámica para sub-módulos nuevos de RRHH
    if (!db.rrhh) db.rrhh = {};
    if (!db.rrhh.payroll_payments) {
      db.rrhh.payroll_payments = [
        { id: 1, employeeId: 2, month: "04", year: "2026", salary_bs: 12000.00, bonuses_bs: 0.00, deductions_bs: 1525.20, net_paid_bs: 10474.80, date: "2026-04-30", status: "Pagado", bankId: 1 }
      ];
    }
    if (!db.rrhh.puestos) {
      db.rrhh.puestos = [
        { id: 1, title: "Ingeniero de Automatización Senior", department: "Santa Cruz", salary_range: "Bs. 12.000 - 15.000", status: "Abierto", description: "Buscamos Ingeniero con experiencia en PLC Siemens S7-1500 y sistemas SCADA.", date_created: "2026-05-15" },
        { id: 2, title: "Técnico de Redes y Telecomunicaciones", department: "La Paz", salary_range: "Bs. 6.000 - 8.000", status: "Abierto", description: "Soporte técnico de campo, cableado estructurado y configuración de switches Cisco.", date_created: "2026-05-20" },
        { id: 3, title: "Encargado de Almacén", department: "Oruro", salary_range: "Bs. 5.000 - 6.000", status: "Borrador", description: "Control de inventarios de repuestos mecánicos e insumos industriales.", date_created: "2026-06-01" }
      ];
    }
    if (!db.rrhh.applications) {
      db.rrhh.applications = [
        { id: 1, puestoId: 1, first_name: "Carlos", last_name: "Miranda", email: "cmiranda@gmail.com", phone: "78822114", cv_link: "https://diasa.com.bo/cv/cv_carlos_miranda.pdf", status: "Entrevista", date_applied: "2026-05-20" },
        { id: 2, puestoId: 2, first_name: "Beatriz", last_name: "Quispe", email: "bquispe@hotmail.com", phone: "69955442", cv_link: "https://diasa.com.bo/cv/cv_beatriz_quispe.pdf", status: "Aceptado", date_applied: "2026-05-25" }
      ];
    }

    // Asegurar campos extendidos para empleados
    if (db.rrhh.employees) {
      db.rrhh.employees.forEach(e => {
        if (!e.department) {
          if (e.id === 1) e.department = "La Paz";
          else if (e.id === 2) e.department = "Santa Cruz";
          else if (e.id === 3) e.department = "La Paz";
          else e.department = "Cochabamba";
        }
        if (e.vacation_days_left === undefined) {
          e.vacation_days_left = 15;
        }
      });
    }

    // Asegurar campos de líneas en los gastos existentes
    if (db.rrhh.expenses) {
      db.rrhh.expenses.forEach(ex => {
        if (!ex.lines) {
          ex.lines = [
            { id: 1, date: ex.date, concept: ex.label, category: "Otros", amount_bs: ex.amount_bs }
          ];
        }
      });
    }

    // Migraciones Financiera
    if (!db.financiera.prestamos) {
      db.financiera.prestamos = [
        { id: 1, ref: "PRE2606-001", lender: "Banco Nacional de Bolivia (BNB)", amount_bs: 100000.00, interest_rate_pct: 7.5, term_months: 24, monthly_payment_bs: 4500.00, balance_bs: 91000.00, date: "2026-05-01", status: "Activo", bankId: 1 }
      ];
    }
    if (!db.financiera.pagos_varios) {
      db.financiera.pagos_varios = [
        { id: 1, ref: "VAR2606-001", label: "Pago de Alquiler de Oficinas Piso 12", category: "Alquileres", amount_bs: 3500.00, date: "2026-05-02", bankId: 1, method: "Transferencia BNB" },
        { id: 2, ref: "VAR2606-002", label: "Factura Mensual de Luz - DELAPAZ", category: "Servicios Básicos", amount_bs: 480.00, date: "2026-05-10", bankId: 3, method: "Efectivo / Caja" }
      ];
    }
    if (db.financiera.facturas_cliente) {
      db.financiera.facturas_cliente.forEach(f => {
        if (!f.lines) {
          let pId = f.total_ht === 42000 ? 1 : (f.total_ht === 18900 ? 3 : 3);
          f.lines = [{ productId: pId, qty: f.total_ht === 42000 ? 10 : (f.total_ht === 54000 ? 3 : 1), price: f.total_ht === 42000 ? 4200.00 : (f.total_ht === 54000 ? 18000.00 : 18900.00), discount_pct: 0 }];
        }
      });
    }
    if (db.financiera.facturas_proveedor) {
      db.financiera.facturas_proveedor.forEach(f => {
        if (!f.lines) {
          let pId = f.total_ht === 54000 ? 3 : 4;
          f.lines = [{ productId: pId, qty: f.total_ht === 54000 ? 3 : 5, price: f.total_ht === 54000 ? 18000.00 : 700.00, discount_pct: 0 }];
        }
      });
    }

    // Migraciones Productos
    if (!db.warehouses) {
      db.warehouses = [
        { id: 1, label: "Almacén Central El Alto (LP)", location: "Av. 6 de Marzo Nro. 450, El Alto", description: "Almacén principal de distribución de insumos y equipos." },
        { id: 2, label: "Sucursal Equipetrol (SC)", location: "Calle Los Claveles Nro. 8, Santa Cruz", description: "Sucursal de ventas y showroom de equipos." },
        { id: 3, label: "Depósito Industrial Vinto (OR)", location: "Zona Industrial Vinto, Oruro", description: "Depósito para almacenamiento a granel y repuestos pesados." }
      ];
    }
    if (!db.warehouse_stocks) {
      db.warehouse_stocks = [
        { productId: 1, warehouseId: 1, qty: 30 },
        { productId: 1, warehouseId: 2, qty: 15 },
        { productId: 2, warehouseId: 1, qty: 100 },
        { productId: 2, warehouseId: 2, qty: 20 },
        { productId: 3, warehouseId: 1, qty: 5 },
        { productId: 3, warehouseId: 2, qty: 3 }
      ];
    }
    if (!db.inventarios) {
      db.inventarios = [
        { id: 1, ref: "INV2606-001", warehouseId: 1, inspector: "Alejandro Mamani", status: "Validado", date: "2026-05-20", adjustments: [{ productId: 1, sysQty: 30, physicalQty: 30, diff: 0 }] }
      ];
    }
    if (!db.envios) {
      db.envios = [
        { id: 1, ref: "ENV2606-001", orderRef: "PE2605-001", clientName: "YPFB Corporación S.A.", date: "2026-05-15", method: "Courier Bolivia", tracking: "TRK-YPFB-9021", status: "Entregado" }
      ];
    }
    if (!db.stock_movimientos) {
      db.stock_movimientos = [
        { id: 1, productId: 1, originWarehouseId: null, targetWarehouseId: 1, qty: 30, type: "Entrada Inicial", date: "2026-05-01" },
        { id: 2, productId: 1, originWarehouseId: null, targetWarehouseId: 2, qty: 15, type: "Entrada Inicial", date: "2026-05-01" },
        { id: 3, productId: 2, originWarehouseId: null, targetWarehouseId: 1, qty: 100, type: "Entrada Inicial", date: "2026-05-01" },
        { id: 4, productId: 2, originWarehouseId: null, targetWarehouseId: 2, qty: 20, type: "Entrada Inicial", date: "2026-05-01" },
        { id: 5, productId: 3, originWarehouseId: null, targetWarehouseId: 1, qty: 5, type: "Entrada Inicial", date: "2026-05-01" },
        { id: 6, productId: 3, originWarehouseId: null, targetWarehouseId: 2, qty: 3, type: "Entrada Inicial", date: "2026-05-01" }
      ];
    }

    return db;
  } catch (e) {
    console.error("Error leyendo DB de localStorage, restableciendo...", e);
    saveDB(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }
}

/**
 * Guardar la base de datos en localStorage.
 */
/**
 * Genera una base de datos masiva y realista localizada para Bolivia.
 */
function generateMassiveData() {
  const db = {
    company: JSON.parse(JSON.stringify(initialData.company)),
    currentUser: null,
    terceros: [],
    contacts: [],
    products: [],
    commercial: {
      presupuestos: [],
      pedidos: [],
      contratos: []
    },
    financiera: {
      facturas_cliente: [],
      facturas_proveedor: [],
      pagos: [],
      prestamos: [],
      pagos_varios: []
    },
    bancos: [
      { id: 1, label: "Banco Nacional de Bolivia (BNB)", bank_name: "BNB", number: "100-03294821", currency: "Bs", balance: 2500000.00, type: "corriente" },
      { id: 2, label: "Banco Mercantil Santa Cruz (BMSC) USD", bank_name: "BMSC", number: "401-08492023", currency: "USD", balance: 150000.00, type: "ahorros" },
      { id: 3, label: "Caja Chica Central", bank_name: "Caja Fuerte", number: "Caja-01", currency: "Bs", balance: 30000.00, type: "efectivo" }
    ],
    contabilidad: {
      diario: []
    },
    rrhh: {
      employees: [],
      leaves: [],
      expenses: [],
      payroll_payments: [],
      puestos: [],
      applications: []
    },
    mrp: JSON.parse(JSON.stringify(initialData.mrp)),
    agenda: JSON.parse(JSON.stringify(initialData.agenda)),
    tickets: JSON.parse(JSON.stringify(initialData.tickets)),
    documentos: JSON.parse(JSON.stringify(initialData.documentos)),
    miembros: JSON.parse(JSON.stringify(initialData.miembros)),
    sitios: JSON.parse(JSON.stringify(initialData.sitios)),
    tpv: JSON.parse(JSON.stringify(initialData.tpv)),
    warehouses: [
      { id: 1, label: "Almacén Central El Alto (LP)", location: "Av. 6 de Marzo Nro. 450, El Alto", description: "Almacén principal de distribución de insumos y equipos." },
      { id: 2, label: "Sucursal Equipetrol (SC)", location: "Calle Los Claveles Nro. 8, Santa Cruz", description: "Sucursal de ventas y showroom de equipos." },
      { id: 3, label: "Depósito Industrial Vinto (OR)", location: "Zona Industrial Vinto, Oruro", description: "Depósito para almacenamiento a granel y repuestos pesados." },
      { id: 4, label: "Sucursal Sud Cochabamba (CB)", location: "Av. Heroínas Nro. 120, Cochabamba", description: "Sucursal de ventas regional Cochabamba." },
      { id: 5, label: "Almacén Frontera Yacuiba (TJ)", location: "Calle Comercio Nro. 24, Yacuiba", description: "Almacén de tránsito fronterizo." }
    ],
    warehouse_stocks: [],
    inventarios: [
      { id: 1, ref: "INV2606-001", warehouseId: 1, inspector: "Alejandro Mamani", status: "Validado", date: "2026-05-20", adjustments: [{ productId: 1, sysQty: 30, physicalQty: 30, diff: 0 }] }
    ],
    envios: [
      { id: 1, ref: "ENV2606-001", orderRef: "PE2605-001", clientName: "YPFB Corporación S.A.", date: "2026-05-15", method: "Courier Bolivia", tracking: "TRK-YPFB-9021", status: "Entregado" }
    ],
    stock_movimientos: []
  };

  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
  const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomNIT = () => String(randomBetween(1000000000, 9999999999));
  const randomPhone = () => "+591 " + randomBetween(60000000, 79999999);

  const generateRandomDate = (startDateStr, endDateStr) => {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const randomTime = start + Math.random() * (end - start);
    const date = new Date(randomTime);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const companyNames = [
    "YPFB Chaco S.A.", "YPFB Andina S.A.", "YPFB Transporte S.A.", "Empresa Metalúrgica Vinto", "Pil Andina S.A.",
    "Cervecería Boliviana Nacional (CBN)", "EMBOL S.A.", "Soboce S.A.", "Itacamba Cemento S.A.", "Minera San Cristóbal S.A.",
    "Entel Bolivia S.A.", "Telefónica Celular de Bolivia (Tigo)", "Nuevatel PCS (Viva)", "Banco Unión S.A.",
    "Banco Nacional de Bolivia S.A.", "Banco Mercantil Santa Cruz S.A.", "Banco de Crédito de Bolivia S.A.",
    "Banco Solidario S.A. (BancoSol)", "Banco BISA S.A.", "Banco Ganadero S.A.", "Farmacias Chávez S.A.",
    "Farmacias Farmacorp S.A.", "Supermercados Fidalga S.A.", "Supermercados Hipermaxi S.A.", "Supermercados Ketal S.A.",
    "Ingenio Azucarero Guabirá S.A.", "Ingenio Azucarero Unagro S.A.", "Lácteos de Bolivia (LACTEOSBOL)",
    "Empresa de Apoyo a la Producción de Alimentos (EMAPA)", "Quipus Empresa Pública Productiva", "Boliviana de Aviación (BoA)",
    "Transportes Aéreos Bolivianos (TAB)", "Ferroviaria Oriental S.A.", "Ferroviaria Andina S.A.", "Cobee S.A.",
    "Ende Transmisión S.A.", "Ende Andina S.A.", "Cre Cooperativa Rural de Electrificación", "Elfec S.A.",
    "Delapaz S.A.", "Saguapac", "Epsas La Paz", "Semapa Cochabamba", "Toyota Toyosa S.A.", "Imcruz SRL",
    "Christian Automotors S.A.", "Hansa Limitada", "Droguería INTI S.A.", "Laboratorios IFA S.A.", "Laboratorios Bagó de Bolivia S.A."
  ];

  // 1. Generate Terceros
  for (let i = 1; i <= 50; i++) {
    const name = companyNames[i - 1] || `Empresa Industrial Boliviana ${i}`;
    let type = "cliente";
    if (i > 25 && i <= 40) type = "proveedor";
    else if (i > 40) type = "ambos";

    const depts = ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Tarija", "Sucre", "Potosí"];
    const dept = randomElement(depts);
    const address = `Av. Principal Nro. ${randomBetween(10, 999)}, Zona Central, ${dept}`;

    db.terceros.push({
      id: i,
      name: name,
      nit: randomNIT(),
      type: type,
      address: address,
      phone: randomPhone(),
      email: `contacto@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.bo`,
      status: "activo",
      balance: 0.00
    });
  }

  // 2. Generate Contacts
  const firstNames = ["Juan", "Maria", "Carlos", "Ana", "Luis", "Jose", "Daniela", "Fernando", "Camila", "Jorge", "Patricia", "Roberto", "Elizabeth", "Gonzalo", "Gabriela", "Ramiro", "Sandra", "Hugo", "Claudia", "René", "Walter", "Lidia", "Óscar", "Silvia", "Julio", "Mónica", "Ricardo", "Cecilia", "Víctor", "Verónica"];
  const lastNames = ["Quispe", "Mamani", "Flores", "Condori", "Vargas", "Rojas", "Guzmán", "Pinto", "Torres", "Suárez", "Mendoza", "Ortiz", "Gutiérrez", "Chavez", "Heredia", "Alanza", "Copa", "Valdez", "Villegas", "Morales", "López", "Cardozo", "Salazar", "Rios", "Espinoza", "Sánchez", "Castro", "Romero", "Paz", "Peredo"];
  const roles = ["Gerente General", "Encargado de Adquisiciones", "Jefe de Contabilidad", "Director Comercial", "Asistente Técnico", "Administrador de Sistemas", "Gerente de Finanzas", "Responsable de Compras", "Director de Operaciones", "Asistente de Gerencia"];

  for (let i = 1; i <= 100; i++) {
    const fn = randomElement(firstNames);
    const ln = randomElement(lastNames);
    const tercero = randomElement(db.terceros);
    db.contacts.push({
      id: i,
      terceroId: tercero.id,
      first_name: fn,
      last_name: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${tercero.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.bo`,
      phone: randomPhone(),
      role: randomElement(roles)
    });
  }

  // 3. Products & Services
  const productLabels = [
    "Válvula de Bola de Acero Inoxidable 2\"", "Válvula de Compuerta Bridadada 4\"", "Tubería de Acero Galvanizado 2\" (6m)",
    "Tubería de Alta Presión de Cobre 1\"", "Motor Eléctrico Monofásico 2HP", "Bomba de Agua Centrífuga 5HP",
    "Tablero Eléctrico de Distribución IP65", "Cable de Cobre Multipolar Nro 10 (100m)", "Disyuntor Termomagnético 3P 50A",
    "Pintura Industrial Anticorrosiva (Balde)", "Grasa de Litio Multiuso 20kg", "Perno Hexagonal de Alta Resistencia 1/2\" (Paquete)",
    "Plancha de Acero A36 (1.2x2.4m)", "Electrodo de Soldadura Arco E6011 (Caja)", "Manómetro de Presión Digital",
    "Casco de Seguridad Industrial (Amarillo)", "Botas de Seguridad con Punta de Acero", "Guantes de Nitrilo Industrial (Paquete)",
    "Filtro de Aire Industrial Tipo Cartucho", "Compresor de Aire Portátil 50L", "Generador Eléctrico a Gasolina 3kW",
    "Transmisor de Presión Inteligente Hart", "PLC Siemens Simatic S7-1200", "Módulo de Expansión de E/S PLC",
    "Sensor de Temperatura PT100", "Cable de Fibra Óptica Monomodo (Carrete)", "Conector Rápido Hidráulico 1/2\"",
    "Brida de Acero Cuello Soldable 6\"", "Codo de Acero 90 Grados 4\"", "Reducción Concéntrica de Acero 4\" a 2\"",
    "Válvula de Retención tipo Clapeta 3\"", "Cinta de Teflón Industrial (Paquete)", "Llave de Paso de Bronce 1/2\"",
    "Soporte de Tubería Metálico Reforzado", "Silicona Industrial de Alta Temperatura", "Limpiador de Contactos Electrónicos (Aerosol)",
    "Filtro de Aceite para Compresora", "Correa de Transmisión Dentada V", "Rodamiento de Esferas Blindado SKF",
    "Tuerca Hexagonal Galvanizada 1/2\" (Paquete)", "Arandela de Presión 1/2\" (Paquete)", "Tee de Acero Carbono 3\"",
    "Válvula Reguladora de Flujo de Aguja", "Termómetro Infrarrojo Industrial", "Multímetro Digital Profesional Fluke",
    "Pinza Amperimétrica de Alta Precisión", "Extractor de Aire Industrial Axial", "Lámpara LED de Alta Bahía 100W",
    "Caja de Empalme Eléctrico Estanca", "Terminal de Compresión para Cable", "Tubería Corrugada para Cables (50m)",
    "Detector de Fugas de Gas Portátil", "Cilindro Neumático de Doble Efecto", "Electroválvula Neumática 5/2 24VDC",
    "Filtro Regulador Lubricador (FRL) Neumático", "Manguera de Poliuretano para Aire 8mm (50m)", "Conector Neumático Instantáneo (Paquete)",
    "Acoplamiento Flexible para Eje", "Empacadura de Neopreno para Brida 4\"", "Sellador de Roscas Anaeróbico",
    "Broca de Acero Rápido HSS (Juego)", "Disco de Corte para Metal 4-1/2\" (Paquete)", "Disco de Desbaste para Metal 4-1/2\" (Paquete)",
    "Cepillo de Alambre Circular para Amoladora", "Arnés de Seguridad de Cuerpo Completo", "Eslinga de Carga de Poliéster 3t (4m)",
    "Grillete de Acero Galvanizado 5/8\"", "Tensor de Cadena Mecánico", "Polipasto Manual de Cadena 1t",
    "Cinta de Embalaje Transparente (Paquete)", "Film Estirable para Paletizado (Rollo)", "Bandeja Portacables Tipo Escalera (3m)",
    "Interruptor Termomagnético Riel Din", "Contactores Eléctricos 3P 220VAC", "Relé Térmico de Sobrecarga",
    "Pulsador de Parada de Emergencia", "Luz Piloto Indicadora LED 22V", "Canaleta Ranurada para Tablero (2m)",
    "Bornes de Conexión Riel Din (Paquete)", "Marcadores de Cable Termocontraíble"
  ];

  const serviceLabels = [
    "Servicio de Inspección Ultrasónica de Ductos", "Mantenimiento Preventivo de Compresor de Aire",
    "Instalación de Tableros Eléctricos y Acometidas", "Calibración de Manómetros e Instrumentos",
    "Certificación de Seguridad y Estanqueidad API", "Desarrollo de Pantalla SCADA en WinCC",
    "Programación de PLC Siemens y HMI", "Capacitación en Seguridad y Salud Ocupacional",
    "Servicio de Alineación Láser de Motores", "Análisis de Vibraciones en Maquinaria Rotativa",
    "Limpieza Química de Intercambiadores de Calor", "Montaje de Estructuras Metálicas por Día",
    "Consultoría en Eficiencia Energética", "Diseño de Sistemas Contra Incendios NFPA",
    "Auditoría Técnica de Instalaciones Eléctricas", "Servicio Técnico de Emergencia 24/7 (Hora)",
    "Alquiler de Generador Eléctrico 50kVA (Día)", "Alquiler de Camión Grúa con Operador (Día)",
    "Servicio de Termografía Infrarroja en Tableros", "Puesta en Marcha de Sistemas de Automatización"
  ];

  // 80 Products
  for (let i = 1; i <= 80; i++) {
    const label = productLabels[i - 1] || `Producto Industrial Genérico ${i}`;
    const price = randomFloat(100.00, 15000.00);
    const cost = parseFloat((price * randomFloat(0.5, 0.75)).toFixed(2));
    const minStock = randomBetween(5, 20);

    db.products.push({
      id: i,
      code: `PROD-${label.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '')}-${String(100 + i)}`,
      label: label,
      type: "producto",
      price: price,
      cost: cost,
      stock: 0,
      minStock: minStock,
      description: `${label} diseñado para uso industrial exigente, cumple con certificaciones internacionales.`
    });
  }

  // 20 Services
  for (let i = 81; i <= 100; i++) {
    const label = serviceLabels[i - 81] || `Servicio Técnico Especializado ${i - 80}`;
    const price = randomFloat(400.00, 5000.00);
    const cost = parseFloat((price * randomFloat(0.4, 0.6)).toFixed(2));

    db.products.push({
      id: i,
      code: `SERV-${label.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '')}-${String(100 + i)}`,
      label: label,
      type: "servicio",
      price: price,
      cost: cost,
      stock: 0,
      minStock: 0,
      description: `${label}. Tarifa de servicio profesional con personal certificado e instrumentos calibrados.`
    });
  }

  // Stock allocation & movements
  let movId = 1;
  db.products.forEach(p => {
    if (p.type === 'producto') {
      let totalStock = 0;
      db.warehouses.forEach(w => {
        if (Math.random() < 0.75) {
          const qty = randomBetween(5, 80);
          db.warehouse_stocks.push({
            productId: p.id,
            warehouseId: w.id,
            qty: qty
          });
          totalStock += qty;

          db.stock_movimientos.push({
            id: movId++,
            productId: p.id,
            originWarehouseId: null,
            targetWarehouseId: w.id,
            qty: qty,
            type: "Entrada Inicial",
            date: "2025-12-01"
          });
        }
      });
      p.stock = totalStock;
    }
  });

  // 4. Commercial (Presupuestos, Pedidos, Contratos)
  const clientTerceros = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos');
  const providerTerceros = db.terceros.filter(t => t.type === 'proveedor' || t.type === 'ambos');

  for (let i = 1; i <= 150; i++) {
    const t = randomElement(clientTerceros);
    const date = generateRandomDate("2025-12-01", "2026-05-31");
    const r = Math.random();
    let status = "Borrador";
    if (r < 0.50) status = "Aceptado";
    else if (r < 0.70) status = "Validado";
    else if (r < 0.85) status = "Rechazado";

    const lineCount = randomBetween(1, 4);
    const lines = [];
    let total_ht = 0;
    const selectedProdIds = new Set();

    for (let l = 0; l < lineCount; l++) {
      let prod = randomElement(db.products);
      while (selectedProdIds.has(prod.id)) {
        prod = randomElement(db.products);
      }
      selectedProdIds.add(prod.id);

      const qty = randomBetween(1, 10);
      const discount = Math.random() < 0.2 ? randomElement([5, 10, 15]) : 0;
      const lineTotal = qty * prod.price * (1 - discount/100);
      total_ht += lineTotal;

      lines.push({
        productId: prod.id,
        qty: qty,
        price: prod.price,
        discount_pct: discount
      });
    }

    total_ht = parseFloat(total_ht.toFixed(2));
    const total_ttc = parseFloat((total_ht * 1.13).toFixed(2));
    const ref = `PR${date.substring(2,4)}${date.substring(5,7)}-${String(1000 + i).substring(1)}`;

    db.commercial.presupuestos.push({
      id: i,
      ref: ref,
      terceroId: t.id,
      date: date,
      total_ht: total_ht,
      total_ttc: total_ttc,
      status: status,
      lines: lines
    });
  }

  // Pedidos
  let orderId = 1;
  const acceptedBudgets = db.commercial.presupuestos.filter(p => p.status === 'Aceptado');
  acceptedBudgets.forEach(b => {
    const pedDate = new Date(b.date);
    pedDate.setDate(pedDate.getDate() + randomBetween(1, 3));
    const pedDateStr = pedDate.toISOString().split('T')[0];
    const isOld = new Date(pedDateStr) < new Date("2026-05-15");
    const status = isOld ? "Entregado" : randomElement(["Validado", "En proceso", "Entregado"]);

    db.commercial.pedidos.push({
      id: orderId++,
      ref: `PE${pedDateStr.substring(2,4)}${pedDateStr.substring(5,7)}-${String(1000 + orderId).substring(1)}`,
      terceroId: b.terceroId,
      date: pedDateStr,
      total_ht: b.total_ht,
      total_ttc: b.total_ttc,
      status: status,
      lines: JSON.parse(JSON.stringify(b.lines))
    });
  });

  while (orderId <= 120) {
    const t = randomElement(clientTerceros);
    const date = generateRandomDate("2025-12-01", "2026-05-31");
    const isOld = new Date(date) < new Date("2026-05-15");
    const status = isOld ? "Entregado" : randomElement(["Validado", "En proceso", "Entregado"]);

    const lineCount = randomBetween(1, 3);
    const lines = [];
    let total_ht = 0;
    const selectedProdIds = new Set();

    for (let l = 0; l < lineCount; l++) {
      let prod = randomElement(db.products);
      while (selectedProdIds.has(prod.id)) {
        prod = randomElement(db.products);
      }
      selectedProdIds.add(prod.id);

      const qty = randomBetween(1, 5);
      const lineTotal = qty * prod.price;
      total_ht += lineTotal;

      lines.push({
        productId: prod.id,
        qty: qty,
        price: prod.price,
        discount_pct: 0
      });
    }

    total_ht = parseFloat(total_ht.toFixed(2));
    const total_ttc = parseFloat((total_ht * 1.13).toFixed(2));

    db.commercial.pedidos.push({
      id: orderId++,
      ref: `PE${date.substring(2,4)}${date.substring(5,7)}-${String(1000 + orderId).substring(1)}`,
      terceroId: t.id,
      date: date,
      total_ht: total_ht,
      total_ttc: total_ttc,
      status: status,
      lines: lines
    });
  }

  // Contratos
  const contractLabels = [
    "Mantenimiento de Redes Eléctricas CBN", "Soporte de Equipos Hidráulicos YPFB",
    "Monitoreo de Sensores Industriales Vinto", "Consultoría Mensual de Sistemas MSC",
    "Suministro Quincenal de Válvulas y Tuberías", "Soporte de PLC Planta El Alto",
    "Alquiler de Maquinaria y Equipos de Medición", "Servicios de Outsourcing Técnico"
  ];
  for (let i = 1; i <= 20; i++) {
    const t = randomElement(clientTerceros);
    const label = randomElement(contractLabels) + ` (Fase ${randomBetween(1, 3)})`;
    const amount = randomFloat(15000.00, 180000.00);
    const start = generateRandomDate("2025-06-01", "2026-04-01");
    const end = new Date(start);
    end.setMonth(end.getMonth() + randomElement([6, 12, 24]));
    const endStr = end.toISOString().split('T')[0];

    const today = new Date("2026-06-03");
    let status = "Activo";
    if (new Date(endStr) < today) status = "Cerrado";
    else if (Math.random() < 0.1) status = "Borrador";

    db.commercial.contratos.push({
      id: i,
      ref: `CON${start.substring(2,4)}${start.substring(5,7)}-${String(100 + i).substring(1)}`,
      terceroId: t.id,
      label: label,
      monto_bs: amount,
      start_date: start,
      end_date: endStr,
      status: status
    });
  }

  // 5. Invoices (Facturas Cliente ~80, Facturas Proveedor ~40)
  let clientInvoiceId = 1;
  const orderForInvoices = db.commercial.pedidos.filter(p => p.status === 'Entregado' || (p.status === 'En proceso' && Math.random() < 0.8));

  orderForInvoices.forEach(p => {
    if (clientInvoiceId > 80) return;

    const invDate = new Date(p.date);
    invDate.setDate(invDate.getDate() + randomBetween(1, 3));
    const invDateStr = invDate.toISOString().split('T')[0];

    const dueDate = new Date(invDateStr);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const isOld = new Date(invDateStr) < new Date("2026-05-01");
    let status = "Pagado";
    if (!isOld) {
      status = randomElement(["Validado", "Pago parcial", "Pagado"]);
    }

    db.financiera.facturas_cliente.push({
      id: clientInvoiceId++,
      ref: `FA${invDateStr.substring(2,4)}${invDateStr.substring(5,7)}-${String(1000 + clientInvoiceId).substring(1)}`,
      terceroId: p.terceroId,
      date: invDateStr,
      date_due: dueDateStr,
      total_ht: p.total_ht,
      total_ttc: p.total_ttc,
      status: status,
      accounting_status: status === "Validado" ? (Math.random() < 0.5 ? "pending" : "posted") : "posted",
      lines: JSON.parse(JSON.stringify(p.lines))
    });
  });

  while (clientInvoiceId <= 80) {
    const t = randomElement(clientTerceros);
    const date = generateRandomDate("2025-12-01", "2026-05-31");
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const total_ht = randomFloat(2000.00, 35000.00);
    const total_ttc = parseFloat((total_ht * 1.13).toFixed(2));
    const isOld = new Date(date) < new Date("2026-05-01");
    const status = isOld ? "Pagado" : randomElement(["Validado", "Pago parcial", "Pagado"]);

    const prod = randomElement(db.products);
    const qty = Math.ceil(total_ht / prod.price) || 1;
    const lines = [{ productId: prod.id, qty: qty, price: prod.price, discount_pct: 0 }];

    db.financiera.facturas_cliente.push({
      id: clientInvoiceId++,
      ref: `FA${date.substring(2,4)}${date.substring(5,7)}-${String(1000 + clientInvoiceId).substring(1)}`,
      terceroId: t.id,
      date: date,
      date_due: dueDateStr,
      total_ht: total_ht,
      total_ttc: total_ttc,
      status: status,
      accounting_status: status === "Validado" ? "pending" : "posted",
      lines: lines
    });
  }

  let provInvoiceId = 1;
  while (provInvoiceId <= 40) {
    const t = randomElement(providerTerceros);
    const date = generateRandomDate("2025-12-01", "2026-05-31");
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const total_ht = randomFloat(1500.00, 20000.00);
    const total_ttc = parseFloat((total_ht * 1.13).toFixed(2));
    const isOld = new Date(date) < new Date("2026-05-01");
    const status = isOld ? "Pagado" : randomElement(["Validado", "Pago parcial", "Pagado"]);

    const prod = randomElement(db.products);
    const qty = Math.ceil(total_ht / prod.cost) || 1;
    const lines = [{ productId: prod.id, qty: qty, price: prod.cost, discount_pct: 0 }];

    db.financiera.facturas_proveedor.push({
      id: provInvoiceId++,
      ref: `FP-${t.name.substring(0,4).toUpperCase().replace(/[^A-Z]/g, '')}-${String(100 + provInvoiceId)}`,
      terceroId: t.id,
      date: date,
      date_due: dueDateStr,
      total_ht: total_ht,
      total_ttc: total_ttc,
      status: status,
      accounting_status: status === "Validado" ? "pending" : "posted",
      lines: lines
    });
  }

  // 6. Payments
  let paymentId = 1;
  db.financiera.facturas_cliente.forEach(f => {
    if (f.status === 'Pagado') {
      const pDateStr = new Date(f.date);
      pDateStr.setDate(pDateStr.getDate() + randomBetween(1, 10));
      const payDate = pDateStr.toISOString().split('T')[0];
      const method = randomElement(["Transferencia BNB", "Transferencia BMSC", "Cheque BNB"]);

      db.financiera.pagos.push({
        id: paymentId++,
        type: "cliente",
        ref: `PAG-CL-${String(1000 + paymentId).substring(1)}`,
        invoiceRef: f.ref,
        amount: f.total_ttc,
        date: payDate,
        method: method
      });

      let bank = db.bancos.find(b => method.includes(b.bank_name));
      if (!bank) bank = db.bancos[0];
      if (bank.currency === 'USD') {
        bank.balance += parseFloat((f.total_ttc / 6.96).toFixed(2));
      } else {
        bank.balance += f.total_ttc;
      }
    } else if (f.status === 'Pago parcial') {
      const pDateStr = new Date(f.date);
      pDateStr.setDate(pDateStr.getDate() + randomBetween(1, 5));
      const payDate = pDateStr.toISOString().split('T')[0];
      const amount = parseFloat((f.total_ttc * randomFloat(0.3, 0.6)).toFixed(2));
      const method = randomElement(["Transferencia BNB", "Transferencia BMSC", "Efectivo"]);

      db.financiera.pagos.push({
        id: paymentId++,
        type: "cliente",
        ref: `PAG-CL-${String(1000 + paymentId).substring(1)}`,
        invoiceRef: f.ref,
        amount: amount,
        date: payDate,
        method: method
      });

      let bank = db.bancos.find(b => method.includes(b.bank_name) || (method === "Efectivo" && b.type === "efectivo"));
      if (!bank) bank = db.bancos[0];
      if (bank.currency === 'USD') {
        bank.balance += parseFloat((amount / 6.96).toFixed(2));
      } else {
        bank.balance += amount;
      }
    }
  });

  db.financiera.facturas_proveedor.forEach(f => {
    if (f.status === 'Pagado') {
      const pDateStr = new Date(f.date);
      pDateStr.setDate(pDateStr.getDate() + randomBetween(1, 10));
      const payDate = pDateStr.toISOString().split('T')[0];
      const method = randomElement(["Transferencia BNB", "Efectivo"]);

      db.financiera.pagos.push({
        id: paymentId++,
        type: "proveedor",
        ref: `PAG-PR-${String(1000 + paymentId).substring(1)}`,
        invoiceRef: f.ref,
        amount: f.total_ttc,
        date: payDate,
        method: method
      });

      let bank = db.bancos.find(b => method.includes(b.bank_name) || (method === "Efectivo" && b.type === "efectivo"));
      if (!bank) bank = db.bancos[0];
      if (bank.currency === 'USD') {
        bank.balance -= parseFloat((f.total_ttc / 6.96).toFixed(2));
      } else {
        bank.balance -= f.total_ttc;
      }
    } else if (f.status === 'Pago parcial') {
      const pDateStr = new Date(f.date);
      pDateStr.setDate(pDateStr.getDate() + randomBetween(1, 5));
      const payDate = pDateStr.toISOString().split('T')[0];
      const amount = parseFloat((f.total_ttc * randomFloat(0.3, 0.6)).toFixed(2));
      const method = randomElement(["Transferencia BNB", "Efectivo"]);

      db.financiera.pagos.push({
        id: paymentId++,
        type: "proveedor",
        ref: `PAG-PR-${String(1000 + paymentId).substring(1)}`,
        invoiceRef: f.ref,
        amount: amount,
        date: payDate,
        method: method
      });

      let bank = db.bancos.find(b => method.includes(b.bank_name) || (method === "Efectivo" && b.type === "efectivo"));
      if (!bank) bank = db.bancos[0];
      if (bank.currency === 'USD') {
        bank.balance -= parseFloat((amount / 6.96).toFixed(2));
      } else {
        bank.balance -= amount;
      }
    }
  });

  // Calculate Terceros Balances
  db.terceros.forEach(t => {
    let balance = 0;
    db.financiera.facturas_cliente.forEach(f => {
      if (f.terceroId === t.id) balance += f.total_ttc;
    });
    db.financiera.facturas_proveedor.forEach(f => {
      if (f.terceroId === t.id) balance -= f.total_ttc;
    });
    db.financiera.pagos.forEach(p => {
      if (p.type === 'cliente') {
        const inv = db.financiera.facturas_cliente.find(fc => fc.ref === p.invoiceRef);
        if (inv && inv.terceroId === t.id) balance -= p.amount;
      } else if (p.type === 'proveedor') {
        const inv = db.financiera.facturas_proveedor.find(fp => fp.ref === p.invoiceRef);
        if (inv && inv.terceroId === t.id) balance += p.amount;
      }
    });
    t.balance = parseFloat(balance.toFixed(2));
  });

  // 7. Pagos Varios & Préstamos
  for (let i = 1; i <= 30; i++) {
    const label = randomElement(basicServLabels);
    let category = "Otros";
    if (label.includes("Electricidad") || label.includes("Agua") || label.includes("Internet") || label.includes("Gas")) {
      category = "Servicios Básicos";
    } else if (label.includes("Alquiler")) {
      category = "Alquileres";
    } else if (label.includes("Patentes") || label.includes("Impuestos")) {
      category = "Impuestos";
    } else if (label.includes("Papelería") || label.includes("Librería")) {
      category = "Material de Escritorio";
    } else if (label.includes("Publicitaria") || label.includes("Sociales")) {
      category = "Publicidad y Marketing";
    } else if (label.includes("Seguro")) {
      category = "Seguros";
    } else {
      category = "Mantenimiento Oficina";
    }

    const amount = randomFloat(100.00, 6000.00);
    const date = generateRandomDate("2025-12-01", "2026-05-31");
    const bank = randomElement(db.bancos);
    const method = bank.type === 'efectivo' ? "Efectivo / Caja" : `Transferencia ${bank.bank_name}`;

    db.financiera.pagos_varios.push({
      id: i,
      ref: `VAR${date.substring(2,4)}${date.substring(5,7)}-${String(100 + i).substring(1)}`,
      label: label,
      category: category,
      amount_bs: amount,
      date: date,
      bankId: bank.id,
      method: method
    });

    if (bank.currency === 'USD') {
      bank.balance -= parseFloat((amount / 6.96).toFixed(2));
    } else {
      bank.balance -= amount;
    }
  }

  const lenders = ["Banco Nacional de Bolivia", "Banco Mercantil Santa Cruz", "Banco BISA S.A.", "Banco Unión S.A."];
  for (let i = 1; i <= 5; i++) {
    const lender = lenders[i - 1] || "Banco Central";
    const amount = randomFloat(50000.00, 250000.00);
    const term = randomElement([12, 24, 36, 48]);
    const rate = randomFloat(5.5, 9.5);
    const date = generateRandomDate("2025-06-01", "2026-01-01");
    const balance = parseFloat((amount * randomFloat(0.5, 0.9)).toFixed(2));

    db.financiera.prestamos.push({
      id: i,
      ref: `PRE25${String(10 + i)}-${String(100 + i).substring(1)}`,
      lender: lender,
      amount_bs: amount,
      interest_rate_pct: rate,
      term_months: term,
      monthly_payment_bs: parseFloat((amount / term * (1 + rate/100)).toFixed(2)),
      balance_bs: balance,
      date: date,
      status: "Activo",
      bankId: randomElement([1, 2])
    });
  }

  // 8. Contabilidad (Libro Diario)
  let journalId = 1;
  const addLedgerEntry = (date, ref, desc, account, debit, credit, journal) => {
    db.contabilidad.diario.push({
      id: journalId++,
      date: date,
      ref: ref,
      desc: desc,
      account: account,
      debit: parseFloat(debit.toFixed(2)),
      credit: parseFloat(credit.toFixed(2)),
      journal: journal
    });
  };

  db.financiera.facturas_cliente.forEach(f => {
    if (f.accounting_status === 'posted') {
      const isServ = f.lines && f.lines[0] && f.lines[0].productId >= 81 || false;
      const saleAccount = isServ ? "401000 - Ingresos por Servicios" : "400000 - Ventas de Productos";
      const iva = parseFloat((f.total_ttc - f.total_ht).toFixed(2));
      const client = db.terceros.find(t => t.id === f.terceroId) || { name: "Cliente" };

      addLedgerEntry(f.date, f.ref, `Venta a ${client.name}`, "120000 - Clientes (Cuentas por Cobrar)", f.total_ttc, 0, "Ventas");
      addLedgerEntry(f.date, f.ref, `Venta a ${client.name}`, saleAccount, 0, f.total_ht, "Ventas");
      if (iva > 0) {
        addLedgerEntry(f.date, f.ref, `Débito Fiscal IVA 13% - ${f.ref}`, "213010 - Débito Fiscal IVA", 0, iva, "Ventas");
      }
    }
  });

  db.financiera.pagos.forEach(p => {
    if (p.type === 'cliente') {
      const inv = db.financiera.facturas_cliente.find(f => f.ref === p.invoiceRef);
      const clientName = inv ? (db.terceros.find(t => t.id === inv.terceroId) || { name: "Cliente" }).name : "Cliente";
      let account = "111100 - Caja/Banco BNB";
      if (p.method.includes("BMSC")) account = "111200 - Caja/Banco BMSC";
      else if (p.method.includes("Efectivo")) account = "111300 - Caja Chica";

      addLedgerEntry(p.date, p.ref, `Cobro factura ${p.invoiceRef} - ${clientName}`, account, p.amount, 0, "Bancos");
      addLedgerEntry(p.date, p.ref, `Abono de cliente - ${clientName}`, "120000 - Clientes (Cuentas por Cobrar)", 0, p.amount, "Bancos");
    }
  });

  db.financiera.facturas_proveedor.forEach(f => {
    if (f.accounting_status === 'posted') {
      const iva = parseFloat((f.total_ttc - f.total_ht).toFixed(2));
      const provider = db.terceros.find(t => t.id === f.terceroId) || { name: "Proveedor" };

      addLedgerEntry(f.date, f.ref, `Compra de ${provider.name}`, "501000 - Gastos de Administración (Servicios / Compras)", f.total_ht, 0, "Compras");
      if (iva > 0) {
        addLedgerEntry(f.date, f.ref, `Crédito Fiscal IVA 13% - ${f.ref}`, "113010 - Crédito Fiscal IVA", iva, 0, "Compras");
      }
      addLedgerEntry(f.date, f.ref, `Obligación con ${provider.name}`, "211000 - Proveedores (Cuentas por Pagar)", 0, f.total_ttc, "Compras");
    }
  });

  db.financiera.pagos.forEach(p => {
    if (p.type === 'proveedor') {
      const inv = db.financiera.facturas_proveedor.find(f => f.ref === p.invoiceRef);
      const provName = inv ? (db.terceros.find(t => t.id === inv.terceroId) || { name: "Proveedor" }).name : "Proveedor";
      let account = "111100 - Caja/Banco BNB";
      if (p.method.includes("BMSC")) account = "111200 - Caja/Banco BMSC";
      else if (p.method.includes("Efectivo")) account = "111300 - Caja Chica";

      addLedgerEntry(p.date, p.ref, `Pago factura ${p.invoiceRef} - ${provName}`, "211000 - Proveedores (Cuentas por Pagar)", p.amount, 0, "Bancos");
      addLedgerEntry(p.date, p.ref, `Egreso por pago - ${provName}`, account, 0, p.amount, "Bancos");
    }
  });

  db.financiera.pagos_varios.forEach(p => {
    let expAccount = "501000 - Gastos de Administración (Servicios / Compras)";
    if (p.category === "Alquileres") expAccount = "503000 - Gastos de Alquiler";
    else if (p.category === "Servicios Básicos") expAccount = "502000 - Gastos de Servicios Básicos";
    else if (p.category === "Impuestos") expAccount = "504000 - Gastos Tributarios / Patentes";
    else if (p.category === "Material de Escritorio") expAccount = "505000 - Gastos de Escritorio y Papelería";
    else if (p.category === "Publicidad y Marketing") expAccount = "506000 - Gastos de Publicidad";
    else if (p.category === "Seguros") expAccount = "507000 - Gastos de Seguros";

    let bankAccount = "111100 - Caja/Banco BNB";
    if (p.bankId === 2) bankAccount = "111200 - Caja/Banco BMSC";
    else if (p.bankId === 3) bankAccount = "111300 - Caja Chica";

    addLedgerEntry(p.date, p.ref, p.label, expAccount, p.amount_bs, 0, "Varios");
    addLedgerEntry(p.date, p.ref, `Pago de ${p.label}`, bankAccount, 0, p.amount_bs, "Varios");
  });

  // 9. RRHH
  const rrhhRoles = [
    { title: "Ingeniero de Automatización Senior", dept: "La Paz", sal: 14000.00 },
    { title: "Técnico en Electricidad Industrial", dept: "La Paz", sal: 7500.00 },
    { title: "Soldador de Alta Presión", dept: "Oruro", sal: 8500.00 },
    { title: "Operador de Torno Mecánico", dept: "Oruro", sal: 6500.00 },
    { title: "Asistente de Contabilidad", dept: "La Paz", sal: 5000.00 },
    { title: "Ejecutivo de Ventas Corporativas", dept: "Santa Cruz", sal: 9000.00 },
    { title: "Chofer de Distribución", dept: "Cochabamba", sal: 4800.00 },
    { title: "Jefe de Almacén Sucursal", dept: "Santa Cruz", sal: 7000.00 },
    { title: "Supervisor de Seguridad Industrial", dept: "La Paz", sal: 8000.00 },
    { title: "Encargado de Compras", dept: "La Paz", sal: 6500.00 }
  ];

  for (let i = 1; i <= 30; i++) {
    const fn = randomElement(firstNames);
    const ln = randomElement(lastNames);
    const roleObj = randomElement(rrhhRoles);
    const hireDate = generateRandomDate("2021-01-01", "2025-12-31");

    db.rrhh.employees.push({
      id: i,
      first_name: fn,
      last_name: ln,
      role: roleObj.title,
      salary_bs: roleObj.sal,
      hire_date: hireDate,
      status: "activo",
      department: roleObj.dept,
      vacation_days_left: randomBetween(5, 25)
    });
  }

  const leaveTypes = ["Vacación", "Baja Médica", "Permiso Personal", "Licencia por Maternidad/Paternidad"];
  const leaveReasons = ["Vacaciones anuales familiares", "Resfrío común o gripe", "Trámite de documentos personal", "Nacimiento de hijo", "Viaje de descanso a Tarija", "Problemas de salud menores"];
  for (let i = 1; i <= 60; i++) {
    const emp = randomElement(db.rrhh.employees);
    const start = generateRandomDate("2025-12-01", "2026-05-31");
    const days = randomBetween(1, 15);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + days);
    const endDateStr = endDate.toISOString().split('T')[0];
    const status = Math.random() < 0.8 ? "Aprobado" : randomElement(["Borrador", "Rechazado"]);

    db.rrhh.leaves.push({
      id: i,
      employeeId: emp.id,
      type: randomElement(leaveTypes),
      start_date: start,
      end_date: endDateStr,
      days: days,
      status: status,
      reason: randomElement(leaveReasons)
    });
  }

  const expenseLabels = [
    "Viáticos Reunión Clientes Oruro", "Compra Repuestos de Urgencia", "Almuerzo Técnico Clientes",
    "Hospedaje Visita Planta Santa Cruz", "Pasajes Aéreos La Paz - SCZ", "Taxi Reunión de Ventas",
    "Materiales de Oficina Urgentes", "Cena de Negocios Cierre Contrato", "Combustible Camión Distribución"
  ];
  const expenseCategories = ["Transporte", "Alojamiento", "Alimentación", "Materiales", "Otros"];
  for (let i = 1; i <= 50; i++) {
    const emp = randomElement(db.rrhh.employees);
    const date = generateRandomDate("2025-12-01", "2026-05-31");
    const label = randomElement(expenseLabels);

    const lineCount = randomBetween(1, 3);
    const lines = [];
    let total_amount = 0;

    for (let l = 1; l <= lineCount; l++) {
      const category = randomElement(expenseCategories);
      const amount = randomFloat(50.00, 800.00);
      total_amount += amount;

      lines.push({
        id: l,
        date: date,
        concept: `${category} para ${label}`,
        category: category,
        amount_bs: amount
      });
    }

    total_amount = parseFloat(total_amount.toFixed(2));
    const status = Math.random() < 0.8 ? "Aprobado" : randomElement(["Borrador", "Rechazado"]);

    db.rrhh.expenses.push({
      id: i,
      employeeId: emp.id,
      date: date,
      label: label,
      amount_bs: total_amount,
      status: status,
      accounting_status: status === "Aprobado" ? (Math.random() < 0.5 ? "pending" : "posted") : "pending",
      lines: lines
    });
  }

  const puestoTitles = [
    "Ingeniero Mecánico Junior", "Desarrollador Full Stack Scada", "Técnico Soldador Especializado",
    "Analista de Cuentas por Cobrar", "Ejecutivo Comercial Santa Cruz", "Encargado de Logística El Alto",
    "Asistente Administrativo Oruro", "Especialista en Automatización PLC", "Chofer de Distribución Regional",
    "Jefe de Compras y Suministros"
  ];
  for (let i = 1; i <= 10; i++) {
    const title = puestoTitles[i - 1] || `Puesto Técnico ${i}`;
    const dept = randomElement(departments);
    const minSal = randomBetween(4, 8) * 1000;
    const maxSal = minSal + randomBetween(2, 6) * 1000;
    const date = generateRandomDate("2026-04-01", "2026-05-31");
    const status = Math.random() < 0.7 ? "Abierto" : randomElement(["Borrador", "Cerrado"]);

    db.rrhh.puestos.push({
      id: i,
      title: title,
      department: dept,
      salary_range: `Bs. ${minSal.toLocaleString('de-DE')} - ${maxSal.toLocaleString('de-DE')}`,
      status: status,
      description: `Buscamos un profesional para cubrir la vacante de ${title} en nuestra oficina de ${dept}.`,
      date_created: date
    });
  }

  const appStatus = ["Nuevo", "Entrevista", "Evaluación", "Rechazado", "Aceptado"];
  for (let i = 1; i <= 25; i++) {
    const fn = randomElement(firstNames);
    const ln = randomElement(lastNames);
    const job = randomElement(db.rrhh.puestos);
    const date = new Date(job.date_created);
    date.setDate(date.getDate() + randomBetween(1, 15));
    const dateStr = date.toISOString().split('T')[0];

    db.rrhh.applications.push({
      id: i,
      puestoId: job.id,
      first_name: fn,
      last_name: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@candidate.com`,
      phone: randomPhone().split(" ")[1],
      cv_link: `https://diasa.com.bo/cv/cv_${fn.toLowerCase()}_${ln.toLowerCase()}.pdf`,
      status: randomElement(appStatus),
      date_applied: dateStr
    });
  }

  let payId = 1;
  const payMonths = [
    { month: "03", year: "2026", date: "2026-03-31" },
    { month: "04", year: "2026", date: "2026-04-30" },
    { month: "05", year: "2026", date: "2026-05-31" }
  ];
  payMonths.forEach(m => {
    db.rrhh.employees.forEach(emp => {
      const sal = emp.salary_bs;
      const deductions = parseFloat((sal * 0.1271).toFixed(2));
      const bonuses = Math.random() < 0.15 ? randomFloat(200.00, 1000.00) : 0;
      const netPaid = parseFloat((sal - deductions + bonuses).toFixed(2));

      db.rrhh.payroll_payments.push({
        id: payId++,
        employeeId: emp.id,
        month: m.month,
        year: m.year,
        salary_bs: sal,
        bonuses_bs: bonuses,
        deductions_bs: deductions,
        net_paid_bs: netPaid,
        date: m.date,
        status: "Pagado",
        bankId: 1
      });

      const bnb = db.bancos.find(b => b.id === 1);
      if (bnb) bnb.balance -= netPaid;
    });
  });

  // 10. Projects
  const projectTitles = [
    "Montaje Eléctrico Planta Colquiri", "Mantenimiento Preventivo Gasoducto Red",
    "Instalación Red Telefónica Interna CBN", "Rediseño Red de Datos BMSC",
    "Automatización Subestación Eléctrica MSC", "Ampliación Ancho de Banda ENTEL",
    "Soporte de Automatización Planta Vinto", "Instalación de Válvulas Planta Senkata",
    "Auditoría Eléctrica Planta El Alto", "Mapeo de Sensores Hidráulicos Yacuiba",
    "Capacitación Personal Técnico Planta CBBA", "Montaje Estructura de Antenas ENTEL SCZ",
    "Mantenimiento Subestación Eléctrica Tarija", "Suministro de Repuestos Hidráulicos CBN",
    "Modernización PLC Tablero Control Principal", "Soporte Técnico Especializado YPFB Transredes",
    "Automatización Dosificación Ingenio Azucarero", "Instalación Cableado Estructurado Oficinas Centrales",
    "Puesta a Tierra de Equipos Críticos El Alto", "Estudio de Pre-factibilidad Robótica Vinto"
  ];
  const projectStatus = ["Borrador", "En proceso", "Cerrado"];
  for (let i = 1; i <= 20; i++) {
    const title = projectTitles[i - 1] || `Proyecto Especial ${i}`;
    const t = randomElement(clientTerceros);
    const budget = randomFloat(30000.00, 500000.00);
    const start = generateRandomDate("2025-10-01", "2026-04-01");
    const end = new Date(start);
    end.setMonth(end.getMonth() + randomBetween(3, 10));
    const endStr = end.toISOString().split('T')[0];
    const isOpp = Math.random() < 0.3;
    let oppAmount = 0;
    let oppProb = 0;
    let oppStatus = "";
    if (isOpp) {
      oppAmount = budget;
      oppProb = randomElement([10, 30, 50, 80, 100]);
      oppStatus = oppProb === 100 ? "Ganado" : (oppProb >= 80 ? "Negociación" : "Propuesta comercial");
    }

    db.proyectos.projects.push({
      id: i,
      title: title,
      terceroId: t.id,
      budget_bs: budget,
      start_date: start,
      end_date: endStr,
      status: randomElement(projectStatus),
      is_opportunity: isOpp,
      opp_amount: oppAmount,
      opp_probability: oppProb,
      opp_status: oppStatus
    });
  }

  // Tasks & Logs
  let taskId = 1;
  let logId = 1;

  db.proyectos.projects.forEach(proj => {
    const taskCount = randomBetween(6, 9);
    for (let t = 1; t <= taskCount; t++) {
      if (taskId > 150) break;
      const title = randomElement(taskTitles) + ` (${t})`;
      const assignee = randomElement(db.rrhh.employees);
      const hoursPlanned = randomBetween(10, 80);
      const hoursSpent = Math.random() < 0.7 ? randomBetween(5, hoursPlanned + 10) : 0;
      const status = hoursSpent === 0 ? "Por hacer" : (hoursSpent >= hoursPlanned ? "Finalizado" : "En proceso");

      db.proyectos.tasks.push({
        id: taskId,
        projectId: proj.id,
        title: title,
        assigneeId: assignee.id,
        hours_planned: hoursPlanned,
        hours_spent: hoursSpent,
        status: status
      });

      if (hoursSpent > 0) {
        let remainingHours = hoursSpent;
        const logDate = new Date(proj.start_date);
        while (remainingHours > 0) {
          const logHrs = Math.min(remainingHours, randomElement([4, 6, 8]));
          remainingHours -= logHrs;
          logDate.setDate(logDate.getDate() + randomBetween(1, 4));
          const logDateStr = logDate.toISOString().split('T')[0];

          db.proyectos.time_logs.push({
            id: logId++,
            taskId: taskId,
            employeeId: assignee.id,
            date: logDateStr,
            hours: logHrs
          });
        }
      }
      taskId++;
    }
  });

  // Ensure bank balances are rounded and stored nicely
  db.bancos.forEach(b => {
    b.balance = parseFloat(b.balance.toFixed(2));
  });

  // Save to database
  saveDB(db);
  return db;
}

/**
 * Guardar la base de datos en localStorage.
 */
function saveDB(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Restablecer base de datos a valores iniciales de demostración masiva.
 */
function resetDB() {
  return generateMassiveData();
}

// Exportar funciones globalmente para que sean accesibles desde los scripts del SPA
window.DolibarrDB = {
  get: getDB,
  save: saveDB,
  reset: resetDB,
  generateMassiveData: generateMassiveData
};
