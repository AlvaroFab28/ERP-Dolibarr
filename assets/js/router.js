/**
 * router.js - Enrutador SPA (Single Page Application)
 * Prototipo Dolibarr ERP v23.0.1
 */

// Registro de scripts de módulos cargados
const loadedModules = {};

// Definición de los módulos principales y sus archivos
const MODULE_SCRIPTS = {
  inicio: 'modules/inicio.js',
  terceros: 'modules/terceros.js',
  productos: 'modules/productos.js',
  mrp: 'modules/mrp.js',
  proyectos: 'modules/proyectos.js',
  comercial: 'modules/comercial.js',
  financiera: 'modules/financiera.js',
  bancos: 'modules/bancos.js',
  contabilidad: 'modules/contabilidad.js',
  rrhh: 'modules/rrhh.js',
  documentos: 'modules/documentos.js',
  agenda: 'modules/agenda.js',
  tickets: 'modules/tickets.js',
  utilidades: 'modules/utilidades.js',
  sitios: 'modules/sitios.js',
  tpv: 'modules/tpv.js',
  miembros: 'modules/miembros.js'
};

// Definición de las barras laterales contextuadas por módulo
const SIDEBAR_MENUS = {
  inicio: {
    title: "Panel de Control",
    items: [
      { label: "Área Principal", path: "#/inicio", icon: "fa-dashboard" },
      { label: "Configuración ERP", path: "#/inicio/config", icon: "fa-cogs" }
    ]
  },
  terceros: {
    title: "Terceros y Contactos",
    items: [
      { label: "Área Terceros", path: "#/terceros", icon: "fa-users" },
      { label: "Nuevo Tercero", path: "#/terceros/nuevo", icon: "fa-user-plus" },
      { label: "Listado de Terceros", path: "#/terceros/lista", icon: "fa-list" },
      { label: "Clientes Potenciales", path: "#/terceros/potenciales", icon: "fa-user-clock" },
      { label: "Nuevo Contacto", path: "#/terceros/contactos-nuevo", icon: "fa-address-card" },
      { label: "Listado Contactos", path: "#/terceros/contactos", icon: "fa-address-book" }
    ]
  },
  productos: {
    title: "Productos | Servicios",
    items: [
      { label: "Resumen Stock", path: "#/productos", icon: "fa-boxes-stacked" },
      { label: "Productos Físicos", path: "#/productos/lista", icon: "fa-box" },
      { label: "Servicios en Catálogo", path: "#/productos/lista-servicios", icon: "fa-hand-holding-hand" },
      { label: "Almacenes y Zonas", path: "#/productos/almacenes", icon: "fa-warehouse" },
      { label: "Transferencias Stock", path: "#/productos/transferencias", icon: "fa-truck-ramp-box" },
      { label: "Ajustes de Inventario", path: "#/productos/inventarios", icon: "fa-clipboard-check" },
      { label: "Gestión de Envíos", path: "#/productos/envios", icon: "fa-truck-fast" },
      { label: "Estadísticas", path: "#/productos/estadisticas", icon: "fa-chart-line" }
    ]
  },
  mrp: {
    title: "MRP - Fabricación",
    items: [
      { label: "Resumen MRP", path: "#/mrp", icon: "fa-industry" },
      { label: "Listas de Materiales (BOM)", path: "#/mrp/bom", icon: "fa-receipt" },
      { label: "Órdenes Fabricación", path: "#/mrp/ordenes", icon: "fa-gears" }
    ]
  },
  proyectos: {
    title: "Proyectos y Tareas",
    items: [
      { label: "Resumen Oportunidades", path: "#/proyectos", icon: "fa-diagram-project" },
      { label: "Nuevo Proyecto/Opc.", path: "#/proyectos/nuevo", icon: "fa-folder-plus" },
      { label: "Listado Proyectos", path: "#/proyectos/lista", icon: "fa-folder-open" },
      { label: "Tareas / Actividades", path: "#/proyectos/tareas", icon: "fa-tasks" },
      { label: "Tiempo Dedicado", path: "#/proyectos/tiempo", icon: "fa-clock" }
    ]
  },
  comercial: {
    title: "Área Comercial",
    items: [
      { label: "Resumen Comercial", path: "#/comercial", icon: "fa-briefcase" },
      { label: "Presupuestos Cliente", path: "#/comercial/presupuestos", icon: "fa-file-invoice-dollar" },
      { label: "Pedidos Cliente", path: "#/comercial/pedidos", icon: "fa-shopping-cart" },
      { label: "Contratos de Servicio", path: "#/comercial/contratos", icon: "fa-file-contract" },
      { label: "Presupuestos Proveedor", path: "#/comercial/presupuestos-prov", icon: "fa-file-signature" },
      { label: "Pedidos Proveedor", path: "#/comercial/pedidos-prov", icon: "fa-truck-loading" },
      { label: "Estadísticas", path: "#/comercial/estadisticas", icon: "fa-chart-line" }
    ]
  },
  financiera: {
    title: "Facturación y Pagos",
    items: [
      { label: "Resumen Financiero", path: "#/financiera", icon: "fa-calculator" },
      { label: "Facturas Clientes", path: "#/financiera/facturas-cliente", icon: "fa-file-invoice" },
      { label: "Facturas Proveedores", path: "#/financiera/facturas-proveedor", icon: "fa-file-contract" },
      { label: "Pagos Varios", path: "#/financiera/pagos-varios", icon: "fa-hand-holding-dollar" },
      { label: "Gestión de Préstamos", path: "#/financiera/prestamos", icon: "fa-landmark" },
      { label: "Márgenes por Producto", path: "#/financiera/margenes", icon: "fa-chart-pie" },
      { label: "Resumen Salarios", path: "#/financiera/salarios", icon: "fa-wallet" },
      { label: "Historial General", path: "#/financiera/pagos", icon: "fa-cash-register" }
    ]
  },
  bancos: {
    title: "Bancos | Cajas",
    items: [
      { label: "Cuentas Financieras", path: "#/bancos", icon: "fa-university" },
      { label: "Nueva Cuenta", path: "#/bancos/nueva", icon: "fa-plus-circle" },
      { label: "Registros Bancarios", path: "#/bancos/registros", icon: "fa-list-ol" },
      { label: "Transferencia Interna", path: "#/bancos/transferencia", icon: "fa-exchange-alt" },
      { label: "Cobros Domiciliados", path: "#/bancos/domiciliaciones", icon: "fa-file-invoice" },
      { label: "Pagos por Transferencia", path: "#/bancos/transferencias-prov", icon: "fa-share-square" },
      { label: "Comprobantes Depósito", path: "#/bancos/depositos", icon: "fa-money-check" },
      { label: "Control de Efectivo POS", path: "#/bancos/efectivo-lista", icon: "fa-cash-register" }
    ]
  },
  contabilidad: {
    title: "Contabilidad ERP",
    items: [
      { label: "Cuadro de Mando", path: "#/contabilidad", icon: "fa-book" },
      { label: "Libro Mayor", path: "#/contabilidad/libro-mayor", icon: "fa-list-ol" },
      { label: "Diarios de Registro", path: "#/contabilidad/diarios", icon: "fa-journal-whills" },
      { label: "Generar Asiento OD", path: "#/contabilidad/nuevo-asiento", icon: "fa-pen-to-square" },
      { label: "Enlace a Contabilidad", path: "#/contabilidad/enlace", icon: "fa-link" },
      { label: "Exportar Datos", path: "#/contabilidad/exportar", icon: "fa-download" }
    ]
  },
  rrhh: {
    title: "Recursos Humanos",
    items: [
      { label: "Resumen RRHH", path: "#/rrhh", icon: "fa-id-card" },
      { label: "Empleados y Planilla", path: "#/rrhh/empleados", icon: "fa-user-tie" },
      { label: "Historial de Salarios", path: "#/rrhh/pagos", icon: "fa-money-bill-wave" },
      { label: "Días Libres / Vacaciones", path: "#/rrhh/vacaciones", icon: "fa-umbrella-beach" },
      { label: "Hojas de Gastos", path: "#/rrhh/gastos", icon: "fa-wallet" },
      { label: "Seguimiento de Tiempos", path: "#/rrhh/tiempo", icon: "fa-clock" },
      { label: "Puestos de Trabajo", path: "#/rrhh/puestos", icon: "fa-briefcase" },
      { label: "Postulantes / CVs", path: "#/rrhh/aplicaciones", icon: "fa-file-invoice" }
    ]
  },
  documentos: {
    title: "Área Documental",
    items: [
      { label: "SGD / GED", path: "#/documentos", icon: "fa-folder-tree" }
    ]
  },
  agenda: {
    title: "Agenda de Eventos",
    items: [
      { label: "Calendario", path: "#/agenda", icon: "fa-calendar-days" },
      { label: "Nuevo Evento", path: "#/agenda/nuevo", icon: "fa-calendar-plus" }
    ]
  },
  tickets: {
    title: "Soporte Técnico",
    items: [
      { label: "Resumen Tickets", path: "#/tickets", icon: "fa-life-ring" },
      { label: "Listado de Tickets", path: "#/tickets/lista", icon: "fa-ticket" },
      { label: "Nuevo Ticket", path: "#/tickets/nuevo", icon: "fa-plus" }
    ]
  },
  utilidades: {
    title: "Utilidades del Sistema",
    items: [
      { label: "Etiquetas/Categorías", path: "#/utilidades", icon: "fa-tags" },
      { label: "Plantillas de Email", path: "#/utilidades/plantillas-email", icon: "fa-envelope-open-text" },
      { label: "Correos Masivos", path: "#/utilidades/emails-masivos", icon: "fa-mail-bulk" },
      { label: "Nuevo Correo Masivo", path: "#/utilidades/emails-masivos-nuevo", icon: "fa-paper-plane" },
      { label: "Exportar Datos", path: "#/utilidades/exportar", icon: "fa-download" },
      { label: "Área de Encuestas", path: "#/utilidades/encuestas", icon: "fa-poll" },
      { label: "Nueva Encuesta", path: "#/utilidades/encuestas-nueva", icon: "fa-plus-square" }
    ]
  },
  sitios: {
    title: "Sitios Web CMS",
    items: [
      { label: "Listado de Sitios", path: "#/sitios", icon: "fa-globe" }
    ]
  },
  tpv: {
    title: "TakePOS - TPV",
    items: [
      { label: "Terminal de Venta", path: "#/tpv", icon: "fa-calculator" }
    ]
  },
  miembros: {
    title: "Miembros / Socios",
    items: [
      { label: "Resumen Miembros", path: "#/miembros", icon: "fa-user-group" },
      { label: "Listado Miembros", path: "#/miembros/lista", icon: "fa-list" },
      { label: "Nuevo Miembro", path: "#/miembros/nuevo", icon: "fa-plus-circle" }
    ]
  }
};

/**
 * Analiza el hash actual y devuelve el modulo base, subruta y parámetros
 */
function parseHash() {
  const hash = window.location.hash || '#/inicio';
  const parts = hash.split('?');
  const pathParts = parts[0].substring(2).split('/');
  const baseModule = pathParts[0] || 'inicio';
  const subRoute = pathParts[1] || 'default';
  
  // Parsear query parameters (?id=1&name=val)
  const params = {};
  if (parts[1]) {
    parts[1].split('&').forEach(pair => {
      const [key, val] = pair.split('=');
      params[key] = decodeURIComponent(val);
    });
  }
  
  return { baseModule, subRoute, params, rawPath: parts[0] };
}

/**
 * Renderiza el menú lateral izquierdo según el módulo activo
 */
function renderSidebar(baseModule, activePath) {
  const sidebar = document.getElementById('left-sidebar');
  if (!sidebar) return;

  const menuConfig = SIDEBAR_MENUS[baseModule];
  if (!menuConfig) {
    sidebar.innerHTML = '';
    return;
  }

  let html = `
    <div class="sidebar-title">${menuConfig.title}</div>
    <ul class="sidebar-menu">
  `;

  menuConfig.items.forEach(item => {
    // Verificar si el link de la barra es el activo. 
    // Compara path exacto o si coincide el prefijo.
    const isActive = activePath === item.path ? 'active' : '';
    html += `
      <li>
        <a href="${item.path}" class="sidebar-link ${isActive}">
          <span class="sidebar-link-content">
            <i class="fas ${item.icon}"></i>
            <span>${item.label}</span>
          </span>
        </a>
      </li>
    `;
  });

  html += `</ul>`;
  sidebar.innerHTML = html;
}

/**
 * Activa visualmente el icono del módulo en la barra superior
 */
function selectTopNavbarItem(baseModule) {
  document.querySelectorAll('.module-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.getElementById(`nav-mod-${baseModule}`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

/**
 * Carga dinámicamente el archivo javascript de un módulo
 */
function loadModuleScript(baseModule) {
  return new Promise((resolve, reject) => {
    if (loadedModules[baseModule]) {
      resolve();
      return;
    }

    const scriptPath = MODULE_SCRIPTS[baseModule];
    if (!scriptPath) {
      reject(`Módulo no encontrado: ${baseModule}`);
      return;
    }

    const script = document.createElement('script');
    script.src = scriptPath;
    script.onload = () => {
      loadedModules[baseModule] = true;
      resolve();
    };
    script.onerror = () => {
      reject(`Error cargando script del módulo: ${scriptPath}`);
    };
    document.body.appendChild(script);
  });
}

/**
 * Ejecuta el router principal
 */
async function router() {
  const db = window.DolibarrDB.get();
  
  // 1. Control de Autenticación
  const loginScreen = document.getElementById('login-screen');
  const appLayout = document.getElementById('app-layout');
  
  if (!db.currentUser) {
    // No logueado
    loginScreen.classList.remove('hidden');
    appLayout.classList.add('hidden');
    
    // Si la ruta no es vacía, forzar hash de inicio
    if (window.location.hash) {
      window.location.hash = '';
    }
    return;
  } else {
    // Logueado
    loginScreen.classList.add('hidden');
    appLayout.classList.remove('hidden');
    
    // Renderizar datos del usuario actual en la interfaz si fuera necesario
    const userNameElement = document.getElementById('logged-user-name');
    if (userNameElement) {
      userNameElement.textContent = db.currentUser.name;
    }
    const userRoleElement = document.getElementById('logged-user-role');
    if (userRoleElement) {
      userRoleElement.textContent = db.currentUser.role;
    }
  }

  // 2. Parsear ruta actual
  const { baseModule, subRoute, params, rawPath } = parseHash();

  // 3. Actualizar interfaz del shell (Navbar superior y sidebar)
  selectTopNavbarItem(baseModule);
  renderSidebar(baseModule, rawPath);

  // 4. Cargar script del módulo e inicializar vista
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; height:200px; color:var(--text-muted);">
      <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-right: 12px;"></i>
      <span>Cargando módulo...</span>
    </div>
  `;

  try {
    await loadModuleScript(baseModule);
    
    // El script del módulo debe registrar un objeto en window.DolibarrModules[baseModule]
    const moduleObj = window.DolibarrModules && window.DolibarrModules[baseModule];
    if (moduleObj && typeof moduleObj.render === 'function') {
      // Limpiar contenedor de gráficos si existieran antes de renderizar
      if (window.DolibarrCharts) {
        document.querySelectorAll('canvas').forEach(canvas => {
          if (canvas.id) window.DolibarrCharts.destroy(canvas.id);
        });
      }
      
      moduleObj.render(subRoute, params);
    } else {
      mainContent.innerHTML = `
        <div class="card" style="margin-top: 20px;">
          <div class="card-body text-center" style="padding: 40px;">
            <i class="fas fa-triangle-exclamation" style="font-size: 48px; color: var(--warning); margin-bottom: 16px;"></i>
            <h3>Módulo en desarrollo</h3>
            <p class="text-muted" style="margin-top: 10px;">El módulo <strong>${baseModule}</strong> se ha cargado correctamente pero no tiene una vista definida.</p>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error en router:", error);
    mainContent.innerHTML = `
      <div class="card" style="margin-top: 20px; border-color: var(--danger);">
        <div class="card-body text-center" style="padding: 40px;">
          <i class="fas fa-circle-xmark" style="font-size: 48px; color: var(--danger); margin-bottom: 16px;"></i>
          <h3>Error al cargar módulo</h3>
          <p class="text-muted" style="margin-top: 10px;">No se pudo cargar el script del módulo <strong>${baseModule}</strong>.</p>
          <p style="margin-top: 10px;"><code style="background:#F1F5F9; padding:4px 8px; border-radius:4px;">${error.message || error}</code></p>
        </div>
      </div>
    `;
  }
}

// Inicializar namespace de módulos
window.DolibarrModules = {};

// Escuchar cambios de hash y carga inicial
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
  // Manejador del Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('login-username').value;
      const pass = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error-message');

      if (user === 'admin' && pass === 'admin') {
        errorDiv.classList.add('hidden');
        const db = window.DolibarrDB.get();
        db.currentUser = {
          username: 'admin',
          name: 'Admin - DIASA S.A.',
          role: 'Super Administrador'
        };
        window.DolibarrDB.save(db);
        
        // Redirigir a inicio
        window.location.hash = '#/inicio';
        router();
      } else {
        errorDiv.textContent = 'Usuario o contraseña incorrectos.';
        errorDiv.classList.remove('hidden');
      }
    });
  }

  // Manejador del menú de usuario (Dropdown)
  const userTrigger = document.getElementById('user-menu-trigger');
  const userDropdown = document.getElementById('user-menu-dropdown');
  
  if (userTrigger && userDropdown) {
    userTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
  }

  // Manejador del botón Cerrar Sesión
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const db = window.DolibarrDB.get();
      db.currentUser = null;
      window.DolibarrDB.save(db);
      
      // Forzar reload / redirección
      window.location.hash = '';
      router();
    });
  }

  // Manejador del desplazamiento horizontal de módulos en la barra superior
  const scrollLeftBtn = document.getElementById('nav-scroll-left');
  const scrollRightBtn = document.getElementById('nav-scroll-right');
  const modulesWrapper = document.getElementById('navbar-modules-wrapper');

  if (scrollLeftBtn && scrollRightBtn && modulesWrapper) {
    scrollLeftBtn.addEventListener('click', () => {
      modulesWrapper.scrollBy({ left: -200, behavior: 'smooth' });
    });
    scrollRightBtn.addEventListener('click', () => {
      modulesWrapper.scrollBy({ left: 200, behavior: 'smooth' });
    });
  }

  // Arrancar el enrutador
  router();
});
