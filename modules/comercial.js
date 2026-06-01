/**
 * comercial.js - Módulo Comercial (Presupuestos y Pedidos de Clientes y Proveedores)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.comercial = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inicializar datos de compras (proveedores) si no existen
    this.initProcurementData();
    
    if (subRoute === 'presupuestos') {
      this.renderPresupuestos(mainContent, false);
    } else if (subRoute === 'pedidos') {
      this.renderPedidos(mainContent, false);
    } else if (subRoute === 'presupuestos-prov') {
      this.renderPresupuestosProv(mainContent);
    } else if (subRoute === 'pedidos-prov') {
      this.renderPedidosProv(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Inicializa la data simulada para compras a proveedores
   */
  initProcurementData: function() {
    const db = window.DolibarrDB.get();
    let updated = false;

    if (!db.commercial.presupuestos_proveedor) {
      db.commercial.presupuestos_proveedor = [
        { id: 1, ref: "PR-PRV-2605-01", terceroId: 5, date: "2026-05-02", total_ht: 54000.00, total_ttc: 61020.00, status: "Aceptado" },
        { id: 2, ref: "PR-PRV-2605-02", terceroId: 6, date: "2026-05-15", total_ht: 3500.00, total_ttc: 3955.00, status: "Aceptado" },
        { id: 3, ref: "PR-PRV-2605-03", terceroId: 5, date: "2026-05-25", total_ht: 12000.00, total_ttc: 13560.00, status: "Borrador" }
      ];
      updated = true;
    }
    if (!db.commercial.pedidos_proveedor) {
      db.commercial.pedidos_proveedor = [
        { id: 1, ref: "PE-PRV-2605-01", terceroId: 5, date: "2026-05-05", total_ht: 54000.00, total_ttc: 61020.00, status: "En proceso" },
        { id: 2, ref: "PE-PRV-2605-02", terceroId: 6, date: "2026-05-18", total_ht: 3500.00, total_ttc: 3955.00, status: "Entregado" }
      ];
      updated = true;
    }

    if (updated) {
      window.DolibarrDB.save(db);
    }
  },

  /**
   * Vista: Dashboard Comercial
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Totales Clientes
    const presClientesCount = db.commercial.presupuestos.length;
    const presClientesMonto = db.commercial.presupuestos
      .filter(p => p.status === 'Aceptado' || p.status === 'Validado')
      .reduce((sum, p) => sum + p.total_ttc, 0);

    const pedClientesCount = db.commercial.pedidos.length;
    const pedClientesMonto = db.commercial.pedidos
      .filter(p => p.status === 'Validado' || p.status === 'En proceso')
      .reduce((sum, p) => sum + p.total_ttc, 0);

    // Totales Proveedores
    const presProvCount = db.commercial.presupuestos_proveedor.length;
    const pedProvCount = db.commercial.pedidos_proveedor.length;
    const pedProvMonto = db.commercial.pedidos_proveedor
      .filter(p => p.status === 'En proceso')
      .reduce((sum, p) => sum + p.total_ttc, 0);

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Comercial</span> <i class="fas fa-chevron-right"></i> <strong>Resumen Comercial</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-briefcase"></i> Área Comercial</h1>
      </div>

      <!-- Widgets -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/comercial/presupuestos'">
          <div class="wb-icon"><i class="fas fa-file-invoice-dollar"></i></div>
          <div class="wb-details">
            <div class="wb-count">${presClientesCount}</div>
            <div class="wb-label">Presupuestos Emitidos</div>
            <div class="wb-amount">Vigentes: ${window.DolibarrUtils.formatCurrency(presClientesMonto)}</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/comercial/pedidos'">
          <div class="wb-icon"><i class="fas fa-shopping-cart"></i></div>
          <div class="wb-details">
            <div class="wb-count">${pedClientesCount}</div>
            <div class="wb-label">Pedidos de Clientes</div>
            <div class="wb-amount">Pendientes: ${window.DolibarrUtils.formatCurrency(pedClientesMonto)}</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/comercial/presupuestos-prov'">
          <div class="wb-icon"><i class="fas fa-file-signature"></i></div>
          <div class="wb-details">
            <div class="wb-count">${presProvCount}</div>
            <div class="wb-label">Presupuestos Prov. Recibidos</div>
          </div>
        </div>

        <div class="widget-box wb-danger" onclick="window.location.hash='#/comercial/pedidos-prov'">
          <div class="wb-icon"><i class="fas fa-truck-loading"></i></div>
          <div class="wb-details">
            <div class="wb-count">${pedProvCount}</div>
            <div class="wb-label">Pedidos a Proveedores</div>
            <div class="wb-amount">Tránsito: ${window.DolibarrUtils.formatCurrency(pedProvMonto)}</div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Estado Presupuestos Clientes</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-presupuestos-estados"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Estado Pedidos Clientes</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-pedidos-estados"></canvas>
            </div>
          </div>
        </div>

      </div>
    `;

    // Inicializar gráficos
    if (typeof Chart !== 'undefined') {
      // Gráfico 1: Presupuestos
      const presStates = { Borrador: 0, Validado: 0, Aceptado: 0, Rechazado: 0 };
      db.commercial.presupuestos.forEach(p => {
        if (presStates[p.status] !== undefined) presStates[p.status]++;
      });
      window.DolibarrCharts.createDoughnut('chart-presupuestos-estados', 
        Object.keys(presStates), Object.values(presStates),
        ['#7F8C8D', '#3498DB', '#2CB57E', '#E74C3C']
      );

      // Gráfico 2: Pedidos
      const pedStates = { Borrador: 0, Validado: 0, 'En proceso': 0, Entregado: 0 };
      db.commercial.pedidos.forEach(p => {
        if (pedStates[p.status] !== undefined) pedStates[p.status]++;
      });
      window.DolibarrCharts.createDoughnut('chart-pedidos-estados', 
        Object.keys(pedStates), Object.values(pedStates),
        ['#7F8C8D', '#94A3B8', '#3A78D4', '#2CB57E']
      );
    }
  },

  /**
   * Vista: Presupuestos Cliente
   */
  renderPresupuestos: function(container, openModal = false) {
    const db = window.DolibarrDB.get();
    const clientes = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Presupuestos Cliente</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice-dollar"></i> Presupuestos Emitidos a Clientes</h1>
        <button id="btn-nuevo-pres" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Presupuesto
        </button>
      </div>

      <!-- Tabla de Presupuestos -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Cliente</th>
              <th>Fecha de Emisión</th>
              <th style="text-align: right;">Base Imponible (HT)</th>
              <th style="text-align: right;">Total IVA (13%)</th>
              <th style="text-align: right;">Importe Total (TTC)</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${db.commercial.presupuestos.map(p => {
              const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
              const iva = p.total_ttc - p.total_ht;
              return `
                <tr>
                  <td><code>${p.ref}</code></td>
                  <td><strong>${cli.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(p.total_ht)}</td>
                  <td style="text-align: right;" class="text-muted">${window.DolibarrUtils.formatCurrency(iva)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.total_ttc)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(p.status)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: NUEVO PRESUPUESTO -->
      <div class="modal-overlay" id="modal-pres-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus"></i> Crear Nuevo Presupuesto</h3>
            <button class="modal-close" id="modal-pres-close">&times;</button>
          </div>
          <form id="form-nuevo-pres">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="p-tercero">Seleccionar Cliente *</label>
                <select id="p-tercero" class="form-control" required>
                  <option value="">-- Seleccionar Cliente --</option>
                  ${clientes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="p-date">Fecha de Emisión *</label>
                  <input type="date" id="p-date" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="p-monto">Base Imponible (HT) - Bs *</label>
                  <input type="number" step="0.01" id="p-monto" class="form-control" placeholder="0.00" required>
                </div>
              </div>

              <div class="card" style="margin-top:16px; background-color: var(--bg-body); border:none;">
                <div class="card-body" style="padding:16px; font-size:12.5px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>Base Imponible:</span>
                    <span id="calc-ht">Bs. 0,00</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:var(--text-muted);">
                    <span>IVA Computado (13%):</span>
                    <span id="calc-iva">Bs. 0,00</span>
                  </div>
                  <hr style="border:none; border-top:1px solid var(--border-color); margin:8px 0;">
                  <div style="display:flex; justify-content:space-between; font-weight:700; font-size:14px; color:var(--primary);">
                    <span>Total Presupuesto (TTC):</span>
                    <span id="calc-ttc">Bs. 0,00</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-pres">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Presupuesto</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-pres-overlay');
    const openBtn = document.getElementById('btn-nuevo-pres');
    const closeBtn = document.getElementById('modal-pres-close');
    const cancelBtn = document.getElementById('btn-cancel-pres');
    const form = document.getElementById('form-nuevo-pres');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('p-date').valueAsDate = new Date();
      updateCalculations(0);
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Calculadora dinámica de IVA
    const inputMonto = document.getElementById('p-monto');
    inputMonto.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      updateCalculations(val);
    });

    function updateCalculations(ht) {
      const iva = ht * 0.13;
      const ttc = ht + iva;
      document.getElementById('calc-ht').textContent = window.DolibarrUtils.formatCurrency(ht);
      document.getElementById('calc-iva').textContent = window.DolibarrUtils.formatCurrency(iva);
      document.getElementById('calc-ttc').textContent = window.DolibarrUtils.formatCurrency(ttc);
    }

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const ht = parseFloat(inputMonto.value) || 0;
      const ttc = ht * 1.13;
      
      const newPres = {
        id: window.DolibarrUtils.generateId(db.commercial.presupuestos),
        ref: `PR26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.commercial.presupuestos.length + 1).padStart(3,'0')}`,
        terceroId: parseInt(document.getElementById('p-tercero').value),
        date: document.getElementById('p-date').value,
        total_ht: ht,
        total_ttc: ttc,
        status: "Borrador"
      };

      db.commercial.presupuestos.push(newPres);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Presupuesto "${newPres.ref}" emitido con éxito.`, 'success');
      closeModal();
      this.renderPresupuestos(container, false);
    });
  },

  /**
   * Vista: Pedidos de Clientes
   */
  renderPedidos: function(container, openModal = false) {
    const db = window.DolibarrDB.get();
    const clientes = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Pedidos Cliente</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-shopping-cart"></i> Pedidos de Venta de Clientes</h1>
        <button id="btn-nuevo-ped" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Pedido
        </button>
      </div>

      <!-- Tabla de Pedidos -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Cliente</th>
              <th>Fecha de Pedido</th>
              <th style="text-align: right;">Importe Total (Bs.)</th>
              <th style="text-align: center;">Estado Entrega</th>
            </tr>
          </thead>
          <tbody>
            ${db.commercial.pedidos.map(p => {
              const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
              return `
                <tr>
                  <td><code>${p.ref}</code></td>
                  <td><strong>${cli.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.total_ttc)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(p.status)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: NUEVO PEDIDO -->
      <div class="modal-overlay" id="modal-ped-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus-circle"></i> Agregar Nuevo Pedido</h3>
            <button class="modal-close" id="modal-ped-close">&times;</button>
          </div>
          <form id="form-nuevo-ped">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="ped-tercero">Seleccionar Cliente *</label>
                <select id="ped-tercero" class="form-control" required>
                  <option value="">-- Seleccionar Cliente --</option>
                  ${clientes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="ped-date">Fecha de Pedido *</label>
                  <input type="date" id="ped-date" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ped-monto">Importe Comercial (Con IVA) - Bs *</label>
                  <input type="number" step="0.01" id="ped-monto" class="form-control" placeholder="0.00" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-ped">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Pedido</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-ped-overlay');
    const openBtn = document.getElementById('btn-nuevo-ped');
    const closeBtn = document.getElementById('modal-ped-close');
    const cancelBtn = document.getElementById('btn-cancel-ped');
    const form = document.getElementById('form-nuevo-ped');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('ped-date').valueAsDate = new Date();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Guardado
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const ttc = parseFloat(document.getElementById('ped-monto').value) || 0;
      const ht = ttc / 1.13;

      const newPed = {
        id: window.DolibarrUtils.generateId(db.commercial.pedidos),
        ref: `PE26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.commercial.pedidos.length + 1).padStart(3,'0')}`,
        terceroId: parseInt(document.getElementById('ped-tercero').value),
        date: document.getElementById('ped-date').value,
        total_ht: ht,
        total_ttc: ttc,
        status: "Validado"
      };

      db.commercial.pedidos.push(newPed);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Pedido "${newPed.ref}" registrado correctamente.`, 'success');
      closeModal();
      this.renderPedidos(container, false);
    });
  },

  /**
   * Vista: Presupuestos de Proveedores
   */
  renderPresupuestosProv: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Presupuestos Proveedores</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-signature"></i> Cotizaciones Recibidas de Proveedores</h1>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia Oferta</th>
              <th>Proveedor</th>
              <th>Fecha Recibida</th>
              <th style="text-align: right;">Importe Neto (HT)</th>
              <th style="text-align: right;">Total Cotizado (TTC)</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${db.commercial.presupuestos_proveedor.map(p => {
              const prov = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
              return `
                <tr>
                  <td><code>${p.ref}</code></td>
                  <td><strong>${prov.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(p.total_ht)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.total_ttc)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(p.status)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Vista: Pedidos de Compra a Proveedores
   */
  renderPedidosProv: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Pedidos a Proveedor</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-truck-loading"></i> Órdenes de Compra a Proveedores</h1>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia Compra</th>
              <th>Proveedor</th>
              <th>Fecha Emisión</th>
              <th style="text-align: right;">Monto Solicitado</th>
              <th style="text-align: center;">Estado Recepción</th>
            </tr>
          </thead>
          <tbody>
            ${db.commercial.pedidos_proveedor.map(p => {
              const prov = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
              return `
                <tr>
                  <td><code>${p.ref}</code></td>
                  <td><strong>${prov.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.total_ttc)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(p.status)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};
