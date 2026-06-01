/**
 * financiera.js - Módulo de Facturación, Crédito y Pagos (Financiera)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.financiera = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'facturas-cliente') {
      this.renderFacturasCliente(mainContent);
    } else if (subRoute === 'facturas-proveedor') {
      this.renderFacturasProveedor(mainContent);
    } else if (subRoute === 'pagos') {
      this.renderPagos(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Helper para obtener el saldo pagado de una factura
   */
  getPaidAmount: function(invoiceRef, type, db) {
    return db.financiera.pagos
      .filter(p => p.type === type && p.invoiceRef === invoiceRef)
      .reduce((sum, p) => sum + p.amount, 0);
  },

  /**
   * Vista: Dashboard Financiero
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Cálculos
    const factClientes = db.financiera.facturas_cliente;
    const totalFacturadoClientes = factClientes.reduce((sum, f) => sum + f.total_ttc, 0);
    const totalCobradoClientes = factClientes.reduce((sum, f) => sum + this.getPaidAmount(f.ref, 'cliente', db), 0);
    const totalPendienteClientes = totalFacturadoClientes - totalCobradoClientes;

    const factProv = db.financiera.facturas_proveedor;
    const totalFacturadoProv = factProv.reduce((sum, f) => sum + f.total_ttc, 0);
    const totalPagadoProv = factProv.reduce((sum, f) => sum + this.getPaidAmount(f.ref, 'proveedor', db), 0);
    const totalPendienteProv = totalFacturadoProv - totalPagadoProv;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Financiera</span> <i class="fas fa-chevron-right"></i> <strong>Resumen Financiero</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-calculator"></i> Área Financiera</h1>
      </div>

      <!-- Widgets -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/financiera/facturas-cliente'">
          <div class="wb-icon"><i class="fas fa-file-invoice"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px;">
              ${window.DolibarrUtils.formatCurrency(totalFacturadoClientes)}
            </div>
            <div class="wb-label">Facturado a Clientes</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/financiera/facturas-cliente'">
          <div class="wb-icon"><i class="fas fa-hand-holding-dollar"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px; color: var(--danger);">
              ${window.DolibarrUtils.formatCurrency(totalPendienteClientes)}
            </div>
            <div class="wb-label">Pendiente de Cobro</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/financiera/facturas-proveedor'">
          <div class="wb-icon"><i class="fas fa-file-contract"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px;">
              ${window.DolibarrUtils.formatCurrency(totalFacturadoProv)}
            </div>
            <div class="wb-label">Facturado por Proveedores</div>
          </div>
        </div>

        <div class="widget-box wb-danger" onclick="window.location.hash='#/financiera/facturas-proveedor'">
          <div class="wb-icon"><i class="fas fa-money-bill-transfer"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px; color: var(--danger);">
              ${window.DolibarrUtils.formatCurrency(totalPendienteProv)}
            </div>
            <div class="wb-label">Pendiente de Pago</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1.3fr 1.7fr; gap: 24px; margin-top: 24px;">
        
        <!-- Columna Izquierda: Aging de Cartera -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar"></i> Distribución de Cobros y Pagos</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 250px;">
              <canvas id="chart-financiera-resumen"></canvas>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Últimas Facturas Modificadas -->
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-clock"></i> Últimas Facturas Emitidas</div>
              <a href="#/financiera/facturas-cliente" style="font-size: 12px;">Ver facturas</a>
            </div>
            <div class="card-body" style="padding: 0;">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th>Cliente</th>
                    <th>Vence</th>
                    <th style="text-align: right;">Total TTC</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${factClientes.slice(-3).reverse().map(f => {
                    const cli = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido' };
                    return `
                      <tr onclick="window.location.hash='#/financiera/facturas-cliente'">
                        <td><code>${f.ref}</code></td>
                        <td><strong>${cli.name}</strong></td>
                        <td>${window.DolibarrUtils.formatDate(f.date_due)}</td>
                        <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(f.total_ttc)}</td>
                        <td>${window.DolibarrUtils.renderBadge(f.status)}</td>
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

    // Renderizar gráfico de barras
    if (typeof Chart !== 'undefined') {
      window.DolibarrCharts.createBar('chart-financiera-resumen', 
        ['Facturado', 'Cobrado / Pagado', 'Pendiente'],
        [
          {
            label: 'Clientes (Cobros Bs)',
            data: [totalFacturadoClientes, totalCobradoClientes, totalPendienteClientes],
            backgroundColor: '#3A78D4',
            borderRadius: 4
          },
          {
            label: 'Proveedores (Pagos Bs)',
            data: [totalFacturadoProv, totalPagadoProv, totalPendienteProv],
            backgroundColor: '#E74C3C',
            borderRadius: 4
          }
        ]
      );
    }
  },

  /**
   * Vista: Facturas Clientes
   */
  renderFacturasCliente: function(container) {
    const db = window.DolibarrDB.get();
    const clientes = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Facturas Cliente</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice"></i> Facturas Emitidas a Clientes</h1>
        <button id="btn-nueva-fact" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Factura
        </button>
      </div>

      <!-- Tabla de Facturas -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Cliente</th>
              <th>Emisión</th>
              <th>Vencimiento</th>
              <th style="text-align: right;">Total (TTC)</th>
              <th style="text-align: right;">Cobrado</th>
              <th style="text-align: right;">Pendiente</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.financiera.facturas_cliente.map(f => {
              const cli = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido' };
              const cobrado = this.getPaidAmount(f.ref, 'cliente', db);
              const pendiente = f.total_ttc - cobrado;
              
              // Botón Cobrar si tiene saldo pendiente
              const actionBtn = pendiente > 0 
                ? `<button class="btn btn-success btn-sm btn-cobrar-fact" data-ref="${f.ref}" data-monto="${pendiente}"><i class="fas fa-hand-holding-dollar"></i> Cobrar</button>`
                : `<span class="text-muted" style="font-size:12px;"><i class="fas fa-check-double" style="color:var(--success);"></i> Saldado</span>`;

              return `
                <tr>
                  <td><code>${f.ref}</code></td>
                  <td><strong>${cli.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(f.date)}</td>
                  <td>${window.DolibarrUtils.formatDate(f.date_due)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(f.total_ttc)}</td>
                  <td style="text-align: right; color:var(--success);">${window.DolibarrUtils.formatCurrency(cobrado)}</td>
                  <td style="text-align: right; color:${pendiente > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
                    ${window.DolibarrUtils.formatCurrency(pendiente)}
                  </td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(f.status)}</td>
                  <td style="text-align: center;">${actionBtn}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: CREAR FACTURA CLIENTE -->
      <div class="modal-overlay" id="modal-fact-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-file-invoice"></i> Registrar Nueva Factura</h3>
            <button class="modal-close" id="modal-fact-close">&times;</button>
          </div>
          <form id="form-nueva-fact">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="f-tercero">Seleccionar Cliente *</label>
                <select id="f-tercero" class="form-control" required>
                  <option value="">-- Seleccionar Cliente --</option>
                  ${clientes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="f-date">Fecha Emisión *</label>
                  <input type="date" id="f-date" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-due">Fecha Vencimiento *</label>
                  <input type="date" id="f-due" class="form-control" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="f-monto">Base Imponible (HT) - Bs *</label>
                  <input type="number" step="0.01" id="f-monto" class="form-control" placeholder="0.00" required>
                </div>
                <div class="form-group">
                  <label class="form-label">IVA (13%) / Total (TTC)</label>
                  <div style="padding:9px; background-color:var(--bg-body); border-radius:var(--radius-md); font-weight:700;" id="f-total-calc">
                    Bs. 0,00
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-fact">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Factura</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: REGISTRAR PAGO (COBRO) -->
      <div class="modal-overlay" id="modal-pago-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-wallet"></i> Registrar Cobro de Factura</h3>
            <button class="modal-close" id="modal-pago-close">&times;</button>
          </div>
          <form id="form-nuevo-pago">
            <input type="hidden" id="pago-invoice-ref">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Referencia de Factura</label>
                <input type="text" id="pago-fact-ref-display" class="form-control" readonly style="background:#F1F5F9;">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pago-amount">Importe a Cobrar (Bs) *</label>
                  <input type="number" step="0.01" id="pago-amount" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pago-date">Fecha de Cobro *</label>
                  <input type="date" id="pago-date" class="form-control" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pago-account">Depositar en Cuenta Bancaria *</label>
                  <select id="pago-account" class="form-control" required>
                    <option value="">-- Seleccionar Banco --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pago-method">Método de Pago *</label>
                  <select id="pago-method" class="form-control" required>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Efectivo / Caja">Efectivo / Caja</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-pago">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Cobro</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Crear Factura
    const modalFact = document.getElementById('modal-fact-overlay');
    const openFactBtn = document.getElementById('btn-nueva-fact');
    const closeFactBtn = document.getElementById('modal-fact-close');
    const cancelFactBtn = document.getElementById('btn-cancel-fact');
    const formFact = document.getElementById('form-nueva-fact');
    const inputMonto = document.getElementById('f-monto');
    const calcTotal = document.getElementById('f-total-calc');

    openFactBtn.addEventListener('click', () => {
      formFact.reset();
      document.getElementById('f-date').valueAsDate = new Date();
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      document.getElementById('f-due').valueAsDate = nextMonth;
      calcTotal.textContent = 'Bs. 0,00';
      
      modalFact.classList.add('show');
    });

    const closeFact = () => modalFact.classList.remove('show');
    closeFactBtn.addEventListener('click', closeFact);
    cancelFactBtn.addEventListener('click', closeFact);

    inputMonto.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      calcTotal.textContent = window.DolibarrUtils.formatCurrency(val * 1.13);
    });

    // Guardar Factura
    formFact.addEventListener('submit', (e) => {
      e.preventDefault();

      const ht = parseFloat(inputMonto.value) || 0;
      const ttc = ht * 1.13;

      const newFact = {
        id: window.DolibarrUtils.generateId(db.financiera.facturas_cliente),
        ref: `FA26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.financiera.facturas_cliente.length + 1).padStart(3,'0')}`,
        terceroId: parseInt(document.getElementById('f-tercero').value),
        date: document.getElementById('f-date').value,
        date_due: document.getElementById('f-due').value,
        total_ht: ht,
        total_ttc: ttc,
        status: "Validado"
      };

      db.financiera.facturas_cliente.push(newFact);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Factura "${newFact.ref}" creada correctamente.`, 'success');
      closeFact();
      this.renderFacturasCliente(container);
    });

    // Modal Cobro
    const modalPago = document.getElementById('modal-pago-overlay');
    const closePagoBtn = document.getElementById('modal-pago-close');
    const cancelPagoBtn = document.getElementById('btn-cancel-pago');
    const formPago = document.getElementById('form-nuevo-pago');

    const closePago = () => modalPago.classList.remove('show');
    closePagoBtn.addEventListener('click', closePago);
    cancelPagoBtn.addEventListener('click', closePago);

    // Adjuntar evento a los botones de "Cobrar" en la tabla
    document.querySelectorAll('.btn-cobrar-fact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ref = btn.dataset.ref;
        const maxMonto = parseFloat(btn.dataset.monto);

        formPago.reset();
        document.getElementById('pago-invoice-ref').value = ref;
        document.getElementById('pago-fact-ref-display').value = ref;
        document.getElementById('pago-amount').value = maxMonto.toFixed(2);
        document.getElementById('pago-amount').max = maxMonto;
        document.getElementById('pago-date').valueAsDate = new Date();

        modalPago.classList.add('show');
      });
    });

    // Guardar Cobro (Afecta banco, factura y crea pago)
    formPago.addEventListener('submit', (e) => {
      e.preventDefault();

      const ref = document.getElementById('pago-invoice-ref').value;
      const amount = parseFloat(document.getElementById('pago-amount').value) || 0;
      const date = document.getElementById('pago-date').value;
      const bankId = parseInt(document.getElementById('pago-account').value);
      const method = document.getElementById('pago-method').value;

      // 1. Crear el Registro de Pago
      const newPago = {
        id: window.DolibarrUtils.generateId(db.financiera.pagos),
        type: "cliente",
        ref: `PAG-CL-${String(db.financiera.pagos.length + 1).padStart(3,'0')}`,
        invoiceRef: ref,
        amount: amount,
        date: date,
        method: method
      };

      db.financiera.pagos.push(newPago);

      // 2. Modificar Estado de la Factura de Cliente
      const factura = db.financiera.facturas_cliente.find(f => f.ref === ref);
      if (factura) {
        const totalPagado = this.getPaidAmount(ref, 'cliente', db);
        if (totalPagado >= factura.total_ttc) {
          factura.status = "Pagado";
        } else {
          factura.status = "Pago parcial";
        }
      }

      // 3. Afectar Saldo de la Cuenta Bancaria
      const banco = db.bancos.find(b => b.id === bankId);
      if (banco) {
        // Conversión si el banco es en USD (1 USD = 6.96 Bs)
        if (banco.currency === 'USD') {
          banco.balance += amount / 6.96;
        } else {
          banco.balance += amount;
        }
      }

      // Guardar y refrescar
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Cobro de ${window.DolibarrUtils.formatCurrency(amount)} registrado. Cuenta bancaria actualizada.`, 'success');
      closePago();
      this.renderFacturasCliente(container);
    });
  },

  /**
   * Vista: Facturas Proveedores
   */
  renderFacturasProveedor: function(container) {
    const db = window.DolibarrDB.get();
    const proveedores = db.terceros.filter(t => t.type === 'proveedor' || t.type === 'ambos');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Facturas Proveedor</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-contract"></i> Facturas de Compras de Proveedores</h1>
        <button id="btn-nueva-fact-prov" class="btn btn-primary">
          <i class="fas fa-plus"></i> Registrar Factura Proveedor
        </button>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Proveedor</th>
              <th>Emisión</th>
              <th>Vencimiento</th>
              <th style="text-align: right;">Importe (TTC)</th>
              <th style="text-align: right;">Pagado</th>
              <th style="text-align: right;">Pendiente</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.financiera.facturas_proveedor.map(f => {
              const prov = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido' };
              const pagado = this.getPaidAmount(f.ref, 'proveedor', db);
              const pendiente = f.total_ttc - pagado;

              const actionBtn = pendiente > 0
                ? `<button class="btn btn-danger btn-sm btn-pagar-fact" data-ref="${f.ref}" data-monto="${pendiente}"><i class="fas fa-wallet"></i> Pagar</button>`
                : `<span class="text-muted" style="font-size:12px;"><i class="fas fa-check-double" style="color:var(--success);"></i> Pagado</span>`;

              return `
                <tr>
                  <td><code>${f.ref}</code></td>
                  <td><strong>${prov.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(f.date)}</td>
                  <td>${window.DolibarrUtils.formatDate(f.date_due)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(f.total_ttc)}</td>
                  <td style="text-align: right; color:var(--success);">${window.DolibarrUtils.formatCurrency(pagado)}</td>
                  <td style="text-align: right; color:${pendiente > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
                    ${window.DolibarrUtils.formatCurrency(pendiente)}
                  </td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(f.status)}</td>
                  <td style="text-align: center;">${actionBtn}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: REGISTRAR PAGO PROVEEDOR (EGRESO) -->
      <div class="modal-overlay" id="modal-pagoprov-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" style="color:var(--danger);"><i class="fas fa-money-bill-wave"></i> Emitir Pago a Proveedor</h3>
            <button class="modal-close" id="modal-pagoprov-close">&times;</button>
          </div>
          <form id="form-nuevo-pagoprov">
            <input type="hidden" id="pagoprov-invoice-ref">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Referencia Factura Proveedor</label>
                <input type="text" id="pagoprov-fact-ref-display" class="form-control" readonly style="background:#F1F5F9;">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pagoprov-amount">Importe a Pagar (Bs) *</label>
                  <input type="number" step="0.01" id="pagoprov-amount" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pagoprov-date">Fecha de Pago *</label>
                  <input type="date" id="pagoprov-date" class="form-control" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pagoprov-account">Retirar de Cuenta Bancaria *</label>
                  <select id="pagoprov-account" class="form-control" required>
                    <option value="">-- Seleccionar Banco --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pagoprov-method">Método de Transferencia *</label>
                  <select id="pagoprov-method" class="form-control" required>
                    <option value="Transferencia BNB">Transferencia BNB</option>
                    <option value="Transferencia BMSC">Transferencia BMSC</option>
                    <option value="Cheque Corriente">Cheque Corriente</option>
                    <option value="Efectivo / Caja">Efectivo / Caja</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-pagoprov">Cancelar</button>
              <button type="submit" class="btn btn-danger">Confirmar Pago</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Adjuntar evento de click para pagar
    const modalPago = document.getElementById('modal-pagoprov-overlay');
    const closePagoBtn = document.getElementById('modal-pagoprov-close');
    const cancelPagoBtn = document.getElementById('btn-cancel-pagoprov');
    const formPago = document.getElementById('form-nuevo-pagoprov');

    const closePago = () => modalPago.classList.remove('show');
    closePagoBtn.addEventListener('click', closePago);
    cancelPagoBtn.addEventListener('click', closePago);

    document.querySelectorAll('.btn-pagar-fact').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        const maxMonto = parseFloat(btn.dataset.monto);

        formPago.reset();
        document.getElementById('pagoprov-invoice-ref').value = ref;
        document.getElementById('pagoprov-fact-ref-display').value = ref;
        document.getElementById('pagoprov-amount').value = maxMonto.toFixed(2);
        document.getElementById('pagoprov-amount').max = maxMonto;
        document.getElementById('pagoprov-date').valueAsDate = new Date();

        modalPago.classList.add('show');
      });
    });

    formPago.addEventListener('submit', (e) => {
      e.preventDefault();

      const ref = document.getElementById('pagoprov-invoice-ref').value;
      const amount = parseFloat(document.getElementById('pagoprov-amount').value) || 0;
      const date = document.getElementById('pagoprov-date').value;
      const bankId = parseInt(document.getElementById('pagoprov-account').value);
      const method = document.getElementById('pagoprov-method').value;

      // 1. Registrar el Pago
      const newPago = {
        id: window.DolibarrUtils.generateId(db.financiera.pagos),
        type: "proveedor",
        ref: `PAG-PR-${String(db.financiera.pagos.length + 1).padStart(3,'0')}`,
        invoiceRef: ref,
        amount: amount,
        date: date,
        method: method
      };

      db.financiera.pagos.push(newPago);

      // 2. Modificar factura
      const factura = db.financiera.facturas_proveedor.find(f => f.ref === ref);
      if (factura) {
        const totalPagado = this.getPaidAmount(ref, 'proveedor', db);
        if (totalPagado >= factura.total_ttc) {
          factura.status = "Pagado";
        } else {
          factura.status = "Pago parcial";
        }
      }

      // 3. Descontar del banco
      const banco = db.bancos.find(b => b.id === bankId);
      if (banco) {
        if (banco.currency === 'USD') {
          banco.balance -= amount / 6.96;
        } else {
          banco.balance -= amount;
        }
      }

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Pago de ${window.DolibarrUtils.formatCurrency(amount)} a proveedor registrado con éxito.`, 'success');
      closePago();
      this.renderFacturasProveedor(container);
    });

    // Evento crear Factura Proveedor omitido por brevedad, pero almacena en db.financiera.facturas_proveedor si se requiere.
    document.getElementById('btn-nueva-fact-prov').addEventListener('click', () => {
      window.DolibarrUtils.showToast("Función estética. Puedes usar el botón Pagar para demostrar el flujo bancario completo.", "info");
    });
  },

  /**
   * Vista: Historial de Pagos
   */
  renderPagos: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Historial de Pagos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-cash-register"></i> Historial General de Cobros y Pagos</h1>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID Pago</th>
              <th>Tipo</th>
              <th>Factura Relacionada</th>
              <th>Fecha de Registro</th>
              <th>Método de Liquidación</th>
              <th style="text-align: right;">Importe Liquidado</th>
            </tr>
          </thead>
          <tbody>
            ${db.financiera.pagos.map(p => {
              const isCliente = p.type === 'cliente';
              const typeBadge = isCliente 
                ? `<span class="badge badge-success">Cobro (Ingreso)</span>`
                : `<span class="badge badge-danger">Pago (Egreso)</span>`;
                
              return `
                <tr>
                  <td><code>${p.ref}</code></td>
                  <td>${typeBadge}</td>
                  <td><code>${p.invoiceRef}</code></td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td><span class="text-muted" style="font-size:12px;">${p.method}</span></td>
                  <td style="text-align: right; font-weight:700; color: ${isCliente ? 'var(--success)' : 'var(--danger)'};">
                    ${isCliente ? '+' : '-'}${window.DolibarrUtils.formatCurrency(p.amount)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};
