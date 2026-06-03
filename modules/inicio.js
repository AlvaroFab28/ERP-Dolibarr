/**
 * inicio.js - Módulo de Inicio y Panel de Control
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.inicio = {
  /**
   * Método principal invocado por el enrutador
   */
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'config') {
      this.renderConfig(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Renderiza el Dashboard Principal
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // 1. Cálculos de estadísticas para los Widgets
    // Terceros
    const totalTerceros = db.terceros.length;
    const activosTerceros = db.terceros.filter(t => t.status === 'activo').length;
    
    // Productos/Servicios
    const totalProductos = db.products.length;
    const stockFisico = db.products.reduce((acc, p) => acc + (p.stock || 0), 0);

    // Presupuestos abiertos (Borrador o Validado)
    const presAbiertos = db.commercial.presupuestos.filter(p => p.status === 'Borrador' || p.status === 'Validado');
    const totalPresAbiertos = presAbiertos.length;
    const montoPresAbiertos = presAbiertos.reduce((acc, p) => acc + p.total_ttc, 0);

    // Pedidos en proceso/validados
    const pedPendientes = db.commercial.pedidos.filter(p => p.status === 'Borrador' || p.status === 'Validado' || p.status === 'En proceso');
    const totalPedPendientes = pedPendientes.length;
    const montoPedPendientes = pedPendientes.reduce((acc, p) => acc + p.total_ttc, 0);

    // Facturas por cobrar (Clientes)
    const factClientes = db.financiera.facturas_cliente.filter(f => f.status !== 'Pagado');
    const totalFactClientes = factClientes.length;
    const montoFactClientes = factClientes.reduce((acc, f) => {
      // Si está a medio pagar, restamos lo pagado de los registros
      const pagosRealizados = db.financiera.pagos
        .filter(p => p.type === 'cliente' && p.invoiceRef === f.ref)
        .reduce((sum, p) => sum + p.amount, 0);
      return acc + (f.total_ttc - pagosRealizados);
    }, 0);

    // Facturas proveedores por pagar
    const factProv = db.financiera.facturas_proveedor.filter(f => f.status !== 'Pagado');
    const totalFactProv = factProv.length;
    const montoFactProv = factProv.reduce((acc, f) => {
      const pagosRealizados = db.financiera.pagos
        .filter(p => p.type === 'proveedor' && p.invoiceRef === f.ref)
        .reduce((sum, p) => sum + p.amount, 0);
      return acc + (f.total_ttc - pagosRealizados);
    }, 0);

    // Consolidación de Bancos en Bs (Tipo de cambio fijo para demostración: 1 USD = 6.96 Bs)
    let saldoConsolidadoBs = 0;
    db.bancos.forEach(cuenta => {
      if (cuenta.currency === 'USD') {
        saldoConsolidadoBs += cuenta.balance * 6.96;
      } else {
        saldoConsolidadoBs += cuenta.balance;
      }
    });

    // Tickets activos
    const ticketsActivos = db.tickets.filter(t => t.status !== 'Resuelto' && t.status !== 'Cerrado').length;

    // Estructura HTML de la vista
    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Inicio</span> <i class="fas fa-chevron-right"></i> <strong>Área Principal</strong>
      </div>
      
      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-gauge-high"></i> Panel de Control - ${db.company.sigla}</h1>
        <div>
          <button id="btn-reset-db" class="btn btn-secondary btn-sm" title="Reestablece la base de datos a sus valores iniciales">
            <i class="fas fa-arrows-spin"></i> Restablecer Demo
          </button>
        </div>
      </div>

      <!-- Grid de Widgets (Cards de resumen rápido) -->
      <div class="widget-grid">
        
        <!-- Terceros -->
        <div class="widget-box wb-primary" onclick="window.location.hash='#/terceros/lista'">
          <div class="wb-icon"><i class="fas fa-users"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalTerceros}</div>
            <div class="wb-label">Terceros Registrados</div>
            <div class="wb-amount">${activosTerceros} Activos</div>
          </div>
        </div>

        <!-- Productos -->
        <div class="widget-box wb-success" onclick="window.location.hash='#/productos/lista'">
          <div class="wb-icon"><i class="fas fa-box"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalProductos}</div>
            <div class="wb-label">Catálogo de Productos</div>
            <div class="wb-amount">${stockFisico} uds en Stock</div>
          </div>
        </div>

        <!-- Presupuestos Abiertos -->
        <div class="widget-box wb-warning" onclick="window.location.hash='#/comercial/presupuestos'">
          <div class="wb-icon"><i class="fas fa-file-invoice-dollar"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalPresAbiertos}</div>
            <div class="wb-label">Presupuestos Abiertos</div>
            <div class="wb-amount">${window.DolibarrUtils.formatCurrency(montoPresAbiertos)}</div>
          </div>
        </div>

        <!-- Pedidos Pendientes -->
        <div class="widget-box wb-primary" onclick="window.location.hash='#/comercial/pedidos'">
          <div class="wb-icon"><i class="fas fa-shopping-cart"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalPedPendientes}</div>
            <div class="wb-label">Pedidos en Proceso</div>
            <div class="wb-amount">${window.DolibarrUtils.formatCurrency(montoPedPendientes)}</div>
          </div>
        </div>

        <!-- Facturas Clientes Cobrar -->
        <div class="widget-box wb-danger" onclick="window.location.hash='#/financiera/facturas-cliente'">
          <div class="wb-icon"><i class="fas fa-file-invoice"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalFactClientes}</div>
            <div class="wb-label">Facturas por Cobrar</div>
            <div class="wb-amount">${window.DolibarrUtils.formatCurrency(montoFactClientes)}</div>
          </div>
        </div>

        <!-- Facturas Proveedores Pagar -->
        <div class="widget-box wb-danger" onclick="window.location.hash='#/financiera/facturas-proveedor'">
          <div class="wb-icon"><i class="fas fa-file-contract"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalFactProv}</div>
            <div class="wb-label">Facturas de Prov. a Pagar</div>
            <div class="wb-amount">${window.DolibarrUtils.formatCurrency(montoFactProv)}</div>
          </div>
        </div>

        <!-- Bancos Consolidado -->
        <div class="widget-box wb-info" onclick="window.location.hash='#/bancos'">
          <div class="wb-icon"><i class="fas fa-university"></i></div>
          <div class="wb-details">
            <div class="wb-count">${db.bancos.length}</div>
            <div class="wb-label">Cuentas Financieras</div>
            <div class="wb-amount">Consol: ${window.DolibarrUtils.formatCurrency(saldoConsolidadoBs)}</div>
          </div>
        </div>

      </div>

      <!-- Sección de Gráficos y Tablas -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <!-- Columna Izquierda: Gráficos -->
        <div>
          <!-- Gráfico de barras -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-chart-bar"></i> Facturación vs Compras (Últimos Meses)</div>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="chart-ventas-compras"></canvas>
              </div>
            </div>
          </div>

          <!-- Gráfico de Dona: Distribución de Saldo en Bancos -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-chart-pie"></i> Saldo por Cuenta (Bs Consecutivo)</div>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height: 200px;">
                <canvas id="chart-bancos-dist"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Tablas del Dashboard -->
        <div>
          <!-- Proyectos en Curso -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-diagram-project"></i> Proyectos Activos (Seguimiento)</div>
              <a href="#/proyectos/lista" style="font-size:12px;">Ver todos</a>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Proyecto / Tarea</th>
                    <th>Tercero</th>
                    <th>Presupuesto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${db.proyectos.projects.slice(0, 3).map(p => {
                    const tercero = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
                    return `
                      <tr onclick="window.location.hash='#/proyectos'">
                        <td><strong>${p.title}</strong></td>
                        <td>${tercero.name}</td>
                        <td>${window.DolibarrUtils.formatCurrency(p.budget_bs)}</td>
                        <td>${window.DolibarrUtils.renderBadge(p.status)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    `;

    // 2. Registro de eventos
    document.getElementById('btn-reset-db').addEventListener('click', () => {
      if (confirm("¿Estás seguro de que deseas restablecer los datos del prototipo? Se perderán todos los cambios guardados.")) {
        window.DolibarrDB.reset();
        window.DolibarrUtils.showToast("Base de datos restablecida correctamente.", "info");
        // Forzar recarga del Dashboard
        this.renderDashboard(container);
      }
    });

    // 3. Inicializar gráficos vía Chart.js
    this.initCharts(db);
  },

  /**
   * Inicializa los gráficos de Chart.js del Dashboard
   */
  initCharts: function(db) {
    if (typeof Chart === 'undefined') return;

    // Gráfico 1: Barras (Ventas vs Compras)
    const labels1 = ['Marzo', 'Abril', 'Mayo'];
    // Datos calculados o simulados rápidos de facturas clientes vs proveedores por mes
    const datasetVentas = [25000, 38000, 115200];
    const datasetCompras = [12000, 15000, 64975];

    window.DolibarrCharts.createBar('chart-ventas-compras', labels1, [
      {
        label: 'Ventas facturadas (Bs)',
        data: datasetVentas,
        backgroundColor: '#3A78D4',
        borderRadius: 4
      },
      {
        label: 'Compras/Gastos (Bs)',
        data: datasetCompras,
        backgroundColor: '#E74C3C',
        borderRadius: 4
      }
    ]);

    // Gráfico 2: Dona (Saldos de cuentas bancarias en Bs)
    const labels2 = db.bancos.map(b => b.bank_name + ` (${b.currency})`);
    const dataSaldosBs = db.bancos.map(b => {
      if (b.currency === 'USD') return b.balance * 6.96;
      return b.balance;
    });

    window.DolibarrCharts.createDoughnut('chart-bancos-dist', labels2, dataSaldosBs, [
      '#2CB57E', // BNB Green
      '#3498DB', // BMSC Blue
      '#F39C12'  // Caja Chica Orange
    ]);
  },

  /**
   * Renderiza el formulario de Configuración de la Empresa
   */
  renderConfig: function(container) {
    const db = window.DolibarrDB.get();
    const company = db.company;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Inicio</span> <i class="fas fa-chevron-right"></i> <strong>Configuración ERP</strong>
      </div>
      
      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-cogs"></i> Configuración de la Empresa</h1>
      </div>

      <div class="card" style="max-width: 800px; margin: 0 auto;">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-building"></i> Información de la Entidad</div>
        </div>
        <div class="card-body">
          <form id="config-company-form">
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="conf-name">Nombre Comercial / Razón Social</label>
                <input type="text" id="conf-name" class="form-control" value="${company.name}" required>
              </div>
              <div class="form-group" style="flex: 0 0 200px;">
                <label class="form-label" for="conf-sigla">Sigla / Nombre Corto</label>
                <input type="text" id="conf-sigla" class="form-control" value="${company.sigla}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="conf-nit">NIT (Número de Identificación Tributaria)</label>
                <input type="text" id="conf-nit" class="form-control" value="${company.nit}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="conf-email">Correo Electrónico de Contacto</label>
                <input type="email" id="conf-email" class="form-control" value="${company.email}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="conf-address">Dirección de la Oficina Central</label>
              <input type="text" id="conf-address" class="form-control" value="${company.address}" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="conf-city">Ciudad y País</label>
                <input type="text" id="conf-city" class="form-control" value="${company.city}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="conf-phone">Teléfono / Fax</label>
                <input type="text" id="conf-phone" class="form-control" value="${company.phone}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="conf-web">Sitio Web Oficial</label>
                <input type="text" id="conf-web" class="form-control" value="${company.web}">
              </div>
              <div class="form-group" style="flex: 0 0 250px;">
                <label class="form-label" for="conf-currency">Divisa de Operación Principal</label>
                <select id="conf-currency" class="form-control">
                  <option value="Bs." selected>Bs. (Boliviano Boliviano)</option>
                  <option value="$us">$us (Dólar Estadounidense)</option>
                </select>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:16px; border-top: 1px solid var(--border-color);">
              <button type="button" class="btn btn-secondary" onclick="window.location.hash='#/inicio'">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Guardar Cambios
              </button>
            </div>

          </form>
        </div>
      </div>
    `;

    // Manejar el submit del formulario
    document.getElementById('config-company-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newConfig = {
        name: document.getElementById('conf-name').value,
        sigla: document.getElementById('conf-sigla').value,
        nit: document.getElementById('conf-nit').value,
        address: document.getElementById('conf-address').value,
        city: document.getElementById('conf-city').value,
        phone: document.getElementById('conf-phone').value,
        email: document.getElementById('conf-email').value,
        web: document.getElementById('conf-web').value
      };

      const currentDB = window.DolibarrDB.get();
      currentDB.company = newConfig;
      window.DolibarrDB.save(currentDB);

      // Actualizar visualmente la sigla en la navbar inmediatamente
      const companyNavEl = document.querySelector('.navbar-company');
      if (companyNavEl) {
        companyNavEl.innerHTML = `<i class="fas fa-building mr-2"></i>${newConfig.sigla}`;
        companyNavEl.title = newConfig.name;
      }

      window.DolibarrUtils.showToast("Configuración de empresa guardada con éxito.", "success");
      
      // Redirigir al dashboard principal
      window.location.hash = '#/inicio';
    });
  }
};
