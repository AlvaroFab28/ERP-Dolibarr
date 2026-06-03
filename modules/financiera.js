/**
 * financiera.js - Módulo de Facturación, Crédito, Préstamos y Pagos (Financiera)
 * Prototipo Dolibarr ERP v23.0.1 - Rediseño Premium
 */

window.DolibarrModules.financiera = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inyectar estilos personalizados
    this.injectStyles();
    
    if (subRoute === 'facturas-cliente') {
      this.renderFacturasCliente(mainContent);
    } else if (subRoute === 'facturas-proveedor') {
      this.renderFacturasProveedor(mainContent);
    } else if (subRoute === 'nueva-factura-cliente') {
      this.renderNuevaFacturaForm(mainContent, 'cliente');
    } else if (subRoute === 'nueva-factura-proveedor') {
      this.renderNuevaFacturaForm(mainContent, 'proveedor');
    } else if (subRoute === 'pagos-varios') {
      this.renderPagosVarios(mainContent);
    } else if (subRoute === 'prestamos') {
      this.renderPrestamos(mainContent);
    } else if (subRoute === 'margenes') {
      this.renderMargenes(mainContent);
    } else if (subRoute === 'salarios') {
      this.renderSalarios(mainContent);
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
   * Inyección dinámica de hojas de estilo
   */
  injectStyles: function() {
    const styleId = 'financiera-custom-premium-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .fin-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        display: inline-block;
        text-align: center;
      }
      .fin-badge-borrador { background: #E2E8F0; color: #4A5568; }
      .fin-badge-validado { background: #EBF8FF; color: #2B6CB0; }
      .fin-badge-pagado { background: #C6F6D5; color: #22543D; }
      .fin-badge-parcial { background: #FEFCBF; color: #744210; }
      .fin-badge-activo { background: #C6F6D5; color: #22543D; }
      .fin-badge-liquidado { background: #E2E8F0; color: #4A5568; }

      .loan-summary-card {
        background: linear-gradient(135deg, #1C2B4B 0%, #3498db 100%);
        color: white;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .loan-summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        margin-top: 15px;
      }
      .loan-summary-item {
        background: rgba(255,255,255,0.15);
        padding: 12px;
        border-radius: 8px;
        backdrop-filter: blur(5px);
      }
      .loan-summary-label {
        font-size: 11px;
        opacity: 0.8;
        margin-bottom: 4px;
      }
      .loan-summary-val {
        font-size: 16px;
        font-weight: 700;
      }
      
      .action-buttons-flex {
        display: flex;
        gap: 6px;
        justify-content: center;
        align-items: center;
      }
      
      .glass-card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(226, 232, 240, 0.8);
      }

      .chart-container-premium {
        position: relative;
        height: 240px;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
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
        
        <!-- Gráfico comparativo -->
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar"></i> Distribución de Cobros y Pagos</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-financiera-resumen"></canvas>
            </div>
          </div>
        </div>

        <!-- Últimas facturas -->
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-clock"></i> Últimas Facturas Emitidas</div>
            <a href="#/financiera/facturas-cliente" style="font-size: 12px;">Ver todas</a>
          </div>
          <div class="card-body" style="padding: 0;">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Vence</th>
                  <th style="text-align: right;">Total TTC</th>
                  <th style="text-align: center;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${factClientes.slice(-4).reverse().map(f => {
                  const cli = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido' };
                  return `
                    <tr onclick="window.location.hash='#/financiera/facturas-cliente'" class="cursor-pointer-row">
                      <td><code>${f.ref}</code></td>
                      <td><strong>${cli.name}</strong></td>
                      <td>${window.DolibarrUtils.formatDate(f.date_due)}</td>
                      <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(f.total_ttc)}</td>
                      <td style="text-align: center;"><span class="fin-badge fin-badge-${f.status.toLowerCase().replace(' ', '')}">${f.status}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    if (typeof Chart !== 'undefined') {
      window.DolibarrCharts.createBar('chart-financiera-resumen', 
        ['Facturado', 'Pagado/Cobrado', 'Pendiente'],
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
   * Vista: Facturas Clientes (`#/financiera/facturas-cliente`)
   */
  renderFacturasCliente: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Facturas Cliente</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice"></i> Facturas Emitidas a Clientes</h1>
        <button onclick="window.location.hash='#/financiera/nueva-factura-cliente'" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Factura
        </button>
      </div>

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
              
              const actionBtn = pendiente > 0 
                ? `<button class="btn btn-success btn-sm btn-cobrar-fact" data-ref="${f.ref}" data-monto="${pendiente}"><i class="fas fa-hand-holding-dollar"></i> Cobrar</button>`
                : `<span class="text-muted" style="font-size:12px;"><i class="fas fa-check-double" style="color:var(--success);"></i> Cobrada</span>`;

              return `
                <tr>
                  <td><code>${f.ref}</code></td>
                  <td><strong>${cli.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(f.date)}</td>
                  <td>${window.DolibarrUtils.formatDate(f.date_due)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(f.total_ttc)}</td>
                  <td style="text-align: right; color:var(--success);">${window.DolibarrUtils.formatCurrency(cobrado)}</td>
                  <td style="text-align: right; color:${pendiente > 0 ? 'var(--danger)' : 'var(--text-muted)'}; font-semibold">
                    ${window.DolibarrUtils.formatCurrency(pendiente)}
                  </td>
                  <td style="text-align: center;"><span class="fin-badge fin-badge-${f.status.toLowerCase().replace(' ', '')}">${f.status}</span></td>
                  <td style="text-align: center;">${actionBtn}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL COBRO -->
      <div class="modal-overlay" id="modal-cobro-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-wallet"></i> Registrar Cobro de Factura</h3>
            <button class="modal-close" onclick="document.getElementById('modal-cobro-overlay').classList.remove('show')">&times;</button>
          </div>
          <form id="form-nuevo-cobro">
            <input type="hidden" id="c-invoice-ref">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Referencia Factura</label>
                <input type="text" id="c-invoice-ref-disp" class="form-control" readonly style="background:#F1F5F9;">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="c-amount">Importe a Cobrar (Bs) *</label>
                  <input type="number" step="0.01" id="c-amount" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="c-date">Fecha de Cobro *</label>
                  <input type="date" id="c-date" class="form-control" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="c-account">Depositar en Cuenta Bancaria *</label>
                  <select id="c-account" class="form-control" required>
                    <option value="">-- Seleccionar --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="c-method">Método de Cobro *</label>
                  <select id="c-method" class="form-control" required>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Efectivo / POS">Efectivo / POS</option>
                    <option value="Cheque BNB">Cheque BNB</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-cobro-overlay').classList.remove('show')">Cancelar</button>
              <button type="submit" class="btn btn-success">Guardar Cobro</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Events
    const modal = document.getElementById('modal-cobro-overlay');
    const form = document.getElementById('form-nuevo-cobro');

    document.querySelectorAll('.btn-cobrar-fact').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        const max = parseFloat(btn.dataset.monto);

        document.getElementById('c-invoice-ref').value = ref;
        document.getElementById('c-invoice-ref-disp').value = ref;
        document.getElementById('c-amount').value = max.toFixed(2);
        document.getElementById('c-amount').max = max;
        document.getElementById('c-date').valueAsDate = new Date();

        modal.classList.add('show');
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ref = document.getElementById('c-invoice-ref').value;
        const amount = parseFloat(document.getElementById('c-amount').value) || 0;
        const date = document.getElementById('c-date').value;
        const bankId = parseInt(document.getElementById('c-account').value);
        const method = document.getElementById('c-method').value;

        // 1. Pago
        const newPay = {
          id: window.DolibarrUtils.generateId(db.financiera.pagos),
          type: "cliente",
          ref: `PAG-CL-${String(db.financiera.pagos.length + 1).padStart(3,'0')}`,
          invoiceRef: ref,
          amount: amount,
          date: date,
          method: method
        };
        db.financiera.pagos.push(newPay);

        // 2. Factura status
        const fact = db.financiera.facturas_cliente.find(f => f.ref === ref);
        if (fact) {
          const totalPaid = this.getPaidAmount(ref, 'cliente', db);
          if (totalPaid >= fact.total_ttc) {
            fact.status = "Pagado";
          } else {
            fact.status = "Pago parcial";
          }
        }

        // 3. Banco
        const banco = db.bancos.find(b => b.id === bankId);
        if (banco) {
          if (banco.currency === 'USD') banco.balance += amount / 6.96;
          else banco.balance += amount;
        }

        // 4. Asiento Contable
        const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
        db.contabilidad.diario.push(
          { id: nextAsientoId, date: date, ref: ref, desc: `Cobro Factura ${ref} - Clientes`, account: "120000 - Clientes (Cuentas por Cobrar)", debit: 0, credit: amount, journal: "Bancos" },
          { id: nextAsientoId + 1, date: date, ref: ref, desc: `Depósito Cobro ${banco ? banco.bank_name : 'Banco'}`, account: `${banco && banco.id === 2 ? '111200 - Banco BMSC' : '111100 - Banco BNB'}`, debit: amount, credit: 0, journal: "Bancos" }
        );

        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Cobro de factura registrado y contabilidad actualizada.", "success");
        modal.classList.remove('show');
        this.renderFacturasCliente(container);
      });
    }
  },

  /**
   * Vista: Facturas Proveedores (`#/financiera/facturas-proveedor`)
   */
  renderFacturasProveedor: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Facturas Proveedor</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-contract"></i> Facturas de Compras de Proveedores</h1>
        <button onclick="window.location.hash='#/financiera/nueva-factura-proveedor'" class="btn btn-primary">
          <i class="fas fa-plus"></i> Registrar Factura Proveedor
        </button>
      </div>

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
                : `<span class="text-muted" style="font-size:12px;"><i class="fas fa-check-double" style="color:var(--success);"></i> Pagada</span>`;

              return `
                <tr>
                  <td><code>${f.ref}</code></td>
                  <td><strong>${prov.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(f.date)}</td>
                  <td>${window.DolibarrUtils.formatDate(f.date_due)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(f.total_ttc)}</td>
                  <td style="text-align: right; color:var(--success);">${window.DolibarrUtils.formatCurrency(pagado)}</td>
                  <td style="text-align: right; color:${pendiente > 0 ? 'var(--danger)' : 'var(--text-muted)'}; font-semibold">
                    ${window.DolibarrUtils.formatCurrency(pendiente)}
                  </td>
                  <td style="text-align: center;"><span class="fin-badge fin-badge-${f.status.toLowerCase().replace(' ', '')}">${f.status}</span></td>
                  <td style="text-align: center;">${actionBtn}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL PAGO PROVEEDOR -->
      <div class="modal-overlay" id="modal-pagoprov-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" style="color:var(--danger);"><i class="fas fa-money-bill-wave"></i> Liquidar Pago a Proveedor</h3>
            <button class="modal-close" onclick="document.getElementById('modal-pagoprov-overlay').classList.remove('show')">&times;</button>
          </div>
          <form id="form-nuevo-pago-prov">
            <input type="hidden" id="p-invoice-ref">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Referencia Factura Proveedor</label>
                <input type="text" id="p-invoice-ref-disp" class="form-control" readonly style="background:#F1F5F9;">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="p-amount">Monto a Pagar (Bs) *</label>
                  <input type="number" step="0.01" id="p-amount" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="p-date">Fecha de Pago *</label>
                  <input type="date" id="p-date" class="form-control" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="p-account">Retirar de Cuenta Bancaria *</label>
                  <select id="p-account" class="form-control" required>
                    <option value="">-- Seleccionar --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="p-method">Método de Pago *</label>
                  <select id="p-method" class="form-control" required>
                    <option value="Transferencia BNB">Transferencia BNB</option>
                    <option value="Transferencia BMSC">Transferencia BMSC</option>
                    <option value="Cheque Corriente">Cheque Corriente</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-pagoprov-overlay').classList.remove('show')">Cancelar</button>
              <button type="submit" class="btn btn-danger">Confirmar Pago</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Prov Control
    const modal = document.getElementById('modal-pagoprov-overlay');
    const form = document.getElementById('form-nuevo-pago-prov');

    document.querySelectorAll('.btn-pagar-fact').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        const max = parseFloat(btn.dataset.monto);

        document.getElementById('p-invoice-ref').value = ref;
        document.getElementById('p-invoice-ref-disp').value = ref;
        document.getElementById('p-amount').value = max.toFixed(2);
        document.getElementById('p-amount').max = max;
        document.getElementById('p-date').valueAsDate = new Date();

        modal.classList.add('show');
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ref = document.getElementById('p-invoice-ref').value;
        const amount = parseFloat(document.getElementById('p-amount').value) || 0;
        const date = document.getElementById('p-date').value;
        const bankId = parseInt(document.getElementById('p-account').value);
        const method = document.getElementById('p-method').value;

        const banco = db.bancos.find(b => b.id === bankId);
        if (!banco) return;

        const amountToDeduct = banco.currency === 'USD' ? amount / 6.96 : amount;
        if (banco.balance < amountToDeduct) {
          window.DolibarrUtils.showToast("Saldo insuficiente en el banco seleccionado.", "error");
          return;
        }

        // 1. Descontar banco
        banco.balance -= amountToDeduct;

        // 2. Registrar Pago
        const newPay = {
          id: window.DolibarrUtils.generateId(db.financiera.pagos),
          type: "proveedor",
          ref: `PAG-PR-${String(db.financiera.pagos.length + 1).padStart(3,'0')}`,
          invoiceRef: ref,
          amount: amount,
          date: date,
          method: method
        };
        db.financiera.pagos.push(newPay);

        // 3. Factura status
        const fact = db.financiera.facturas_proveedor.find(f => f.ref === ref);
        if (fact) {
          const totalPaid = this.getPaidAmount(ref, 'proveedor', db);
          if (totalPaid >= fact.total_ttc) {
            fact.status = "Pagado";
          } else {
            fact.status = "Pago parcial";
          }
        }

        // 4. Asiento Contable
        const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
        db.contabilidad.diario.push(
          { id: nextAsientoId, date: date, ref: ref, desc: `Pago Factura Prov ${ref}`, account: "211000 - Proveedores (Cuentas por Pagar)", debit: amount, credit: 0, journal: "Bancos" },
          { id: nextAsientoId + 1, date: date, ref: ref, desc: `Egreso Banco ${banco.bank_name}`, account: `${banco.id === 2 ? '111200 - Banco BMSC' : '111100 - Banco BNB'}`, debit: 0, credit: amount, journal: "Bancos" }
        );

        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Pago registrado con éxito y balance actualizado.", "success");
        modal.classList.remove('show');
        this.renderFacturasProveedor(container);
      });
    }
  },

  /**
   * Vista: Formulario Detallado Nueva Factura Cliente/Proveedor (`#/financiera/nueva-factura-...`)
   */
  renderNuevaFacturaForm: function(container, type) {
    const db = window.DolibarrDB.get();
    const isCliente = type === 'cliente';
    const terceros = db.terceros.filter(t => isCliente ? (t.type === 'cliente' || t.type === 'ambos') : (t.type === 'proveedor' || t.type === 'ambos'));
    
    // Almacenamiento temporal de líneas en memoria local para el editor
    let fLines = [];

    const drawLinesTable = () => {
      const tbody = document.getElementById('fact-lines-body');
      if (!tbody) return;

      if (fLines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Añada líneas con el selector de abajo.</td></tr>`;
        document.getElementById('lbl-subtotal').textContent = 'Bs. 0,00';
        document.getElementById('lbl-iva').textContent = 'Bs. 0,00';
        document.getElementById('lbl-total').textContent = 'Bs. 0,00';
        return;
      }

      let subtotal = 0;
      tbody.innerHTML = fLines.map((l, index) => {
        const prod = db.products.find(p => p.id === l.productId) || { label: 'Desconocido' };
        const totalFila = l.qty * l.price * (1 - l.discount_pct / 100);
        subtotal += totalFila;

        return `
          <tr>
            <td><code>${prod.code || 'SERV'}</code></td>
            <td><strong>${prod.label}</strong></td>
            <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(l.price)}</td>
            <td style="text-align: right;">${l.qty}</td>
            <td style="text-align: right; color:var(--danger);">${l.discount_pct}%</td>
            <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(totalFila)}</td>
            <td style="text-align: center;">
              <button type="button" class="btn btn-danger btn-sm" onclick="window.DolibarrModules.financiera.removeTempLine(${index})" style="padding:2px 6px;">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      const iva = subtotal * 0.13;
      const total = subtotal + iva;

      document.getElementById('lbl-subtotal').textContent = window.DolibarrUtils.formatCurrency(subtotal);
      document.getElementById('lbl-iva').textContent = window.DolibarrUtils.formatCurrency(iva);
      document.getElementById('lbl-total').textContent = window.DolibarrUtils.formatCurrency(total);
    };

    // Publicar helper de remover línea temporalmente en el objeto global del módulo
    this.removeTempLine = (index) => {
      fLines.splice(index, 1);
      drawLinesTable();
    };

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> 
        <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> 
        <a href="#/financiera/facturas-${type}">${isCliente ? 'Facturas Clientes' : 'Facturas Proveedores'}</a> <i class="fas fa-chevron-right"></i> 
        <strong>Nueva Factura</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice"></i> Crear Factura de ${isCliente ? 'Cliente' : 'Compra / Proveedor'}</h1>
      </div>

      <form id="form-full-factura">
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
          
          <!-- Lado Izquierdo: Líneas de Facturación -->
          <div class="card glass-card">
            <div class="card-header">
              <div class="card-title">Detalle de Líneas de Factura</div>
            </div>
            <div class="card-body">
              
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción / Producto</th>
                      <th style="text-align: right;">P. Unitario</th>
                      <th style="text-align: right;">Cant.</th>
                      <th style="text-align: right;">Desc %</th>
                      <th style="text-align: right;">Subtotal</th>
                      <th style="text-align: center;">Acción</th>
                    </tr>
                  </thead>
                  <tbody id="fact-lines-body">
                    <!-- Se carga dinámicamente -->
                  </tbody>
                </table>
              </div>

              <!-- Selector de Productos para añadir -->
              <div style="border-top:1px dashed var(--border-color); margin-top:20px; padding-top:16px; display:grid; grid-template-columns: 2fr 1fr 1fr 1fr 80px; gap:8px; align-items:end;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Elegir Producto / Servicio</label>
                  <select id="fl-prod" class="form-control" style="font-size:12px; padding:6px;">
                    <option value="">-- Seleccionar --</option>
                    ${db.products.map(p => `<option value="${p.id}">${p.label} (Ref: ${p.price} Bs)</option>`).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Precio Unit. (Bs)</label>
                  <input type="number" step="0.01" id="fl-price" class="form-control" style="font-size:12px; padding:6px;">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Cantidad</label>
                  <input type="number" id="fl-qty" class="form-control" value="1" style="font-size:12px; padding:6px;">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Descuento %</label>
                  <input type="number" id="fl-disc" class="form-control" value="0" style="font-size:12px; padding:6px;">
                </div>
                <button type="button" id="btn-add-temp-line" class="btn btn-primary" style="padding: 8px;"><i class="fas fa-plus"></i></button>
              </div>

            </div>
          </div>

          <!-- Lado Derecho: Cabecera y Totales -->
          <div style="display:flex; flex-direction:column; gap:24px;">
            
            <div class="card glass-card">
              <div class="card-header">
                <div class="card-title">Datos Generales</div>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label class="form-label" for="f-tercero">${isCliente ? 'Cliente *' : 'Proveedor *'}</label>
                  <select id="f-tercero" class="form-control" required>
                    <option value="">-- Seleccionar --</option>
                    ${terceros.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="f-date">Fecha de Emisión *</label>
                  <input type="date" id="f-date" class="form-control" required>
                </div>

                <div class="form-group">
                  <label class="form-label" for="f-due">Fecha de Vencimiento *</label>
                  <input type="date" id="f-due" class="form-control" required>
                </div>
              </div>
            </div>

            <!-- Totales -->
            <div class="card glass-card" style="background:#F8FAFC;">
              <div class="card-body">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px;">
                  <span class="text-muted">Subtotal (HT):</span>
                  <strong id="lbl-subtotal">Bs. 0,00</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px; border-bottom:1px solid #E2E8F0; padding-bottom:8px;">
                  <span class="text-muted">IVA (13%):</span>
                  <strong id="lbl-iva">Bs. 0,00</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                  <span style="font-size:15px; font-weight:600;">Total (TTC):</span>
                  <strong id="lbl-total" style="font-size:18px; color:var(--primary);">Bs. 0,00</strong>
                </div>
                <button type="submit" class="btn btn-success" style="width:100%;"><i class="fas fa-file-invoice"></i> Validar Factura</button>
              </div>
            </div>

          </div>

        </div>
      </form>
    `;

    drawLinesTable();

    // Auto-completar precio
    const selectProd = document.getElementById('fl-prod');
    const inputPrice = document.getElementById('fl-price');
    selectProd.addEventListener('change', () => {
      const pId = parseInt(selectProd.value);
      const prod = db.products.find(p => p.id === pId);
      inputPrice.value = prod ? prod.price.toFixed(2) : '';
    });

    // Agregar línea temporal
    document.getElementById('btn-add-temp-line').addEventListener('click', () => {
      const pId = parseInt(selectProd.value);
      const price = parseFloat(inputPrice.value) || 0;
      const qty = parseInt(document.getElementById('fl-qty').value) || 1;
      const disc = parseFloat(document.getElementById('fl-disc').value) || 0;

      if (!pId) {
        window.DolibarrUtils.showToast("Debe elegir un producto/servicio", "warning");
        return;
      }

      fLines.push({
        productId: pId,
        qty: qty,
        price: price,
        discount_pct: disc
      });

      // Limpiar inputs de línea
      selectProd.value = '';
      inputPrice.value = '';
      document.getElementById('fl-qty').value = '1';
      document.getElementById('fl-disc').value = '0';

      drawLinesTable();
    });

    // Fechas por defecto
    document.getElementById('f-date').valueAsDate = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('f-due').valueAsDate = nextMonth;

    // Registrar Factura Completa
    const formFact = document.getElementById('form-full-factura');
    formFact.addEventListener('submit', (e) => {
      e.preventDefault();

      if (fLines.length === 0) {
        window.DolibarrUtils.showToast("La factura debe tener al menos una línea", "warning");
        return;
      }

      let subtotal = 0;
      fLines.forEach(l => {
        subtotal += l.qty * l.price * (1 - l.discount_pct/100);
      });
      const iva = subtotal * 0.13;
      const total = subtotal + iva;

      const date = document.getElementById('f-date').value;
      const due = document.getElementById('f-due').value;
      const terceroId = parseInt(document.getElementById('f-tercero').value);

      const ref = isCliente
        ? `FA26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.financiera.facturas_cliente.length + 1).padStart(3,'0')}`
        : `FP-26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.financiera.facturas_proveedor.length + 1).padStart(3,'0')}`;

      const newFact = {
        id: window.DolibarrUtils.generateId(isCliente ? db.financiera.facturas_cliente : db.financiera.facturas_proveedor),
        ref: ref,
        terceroId: terceroId,
        date: date,
        date_due: due,
        total_ht: subtotal,
        total_ttc: total,
        status: "Validado",
        accounting_status: "pending",
        lines: fLines
      };

      const ter = db.terceros.find(t => t.id === terceroId) || { name: 'Tercero' };

      // Contabilidad Asientos Diario
      const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
      if (isCliente) {
        // Venta (Cliente)
        db.financiera.facturas_cliente.push(newFact);
        db.contabilidad.diario.push(
          { id: nextAsientoId, date: date, ref: ref, desc: `Venta Facturada a ${ter.name}`, account: "400000 - Ventas de Productos", debit: 0, credit: subtotal, journal: "Ventas" },
          { id: nextAsientoId + 1, date: date, ref: ref, desc: `Débito Fiscal IVA 13% s/Factura ${ref}`, account: "213010 - Débito Fiscal IVA", debit: 0, credit: iva, journal: "Ventas" },
          { id: nextAsientoId + 2, date: date, ref: ref, desc: `Exigible Cliente ${ter.name}`, account: "120000 - Clientes (Cuentas por Cobrar)", debit: total, credit: 0, journal: "Ventas" }
        );
      } else {
        // Compra (Proveedor)
        db.financiera.facturas_proveedor.push(newFact);
        db.contabilidad.diario.push(
          { id: nextAsientoId, date: date, ref: ref, desc: `Compra Factura ${ref} de ${ter.name}`, account: "501000 - Gastos de Administración (Servicios / Compras)", debit: subtotal, credit: 0, journal: "Compras" },
          { id: nextAsientoId + 1, date: date, ref: ref, desc: `Crédito Fiscal IVA 13% c/Factura ${ref}`, account: "113010 - Crédito Fiscal IVA", debit: iva, credit: 0, journal: "Compras" },
          { id: nextAsientoId + 2, date: date, ref: ref, desc: `Obligación Proveedor ${ter.name}`, account: "211000 - Proveedores (Cuentas por Pagar)", debit: 0, credit: total, journal: "Compras" }
        );
      }

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Factura ${ref} validada y registrada en contabilidad.`, "success");
      
      // Redirigir de vuelta al listado
      window.location.hash = `#/financiera/facturas-${type}`;
    });
  },

  /**
   * Vista: Pagos Varios (Miscellaneous Expenses / direct payments) (`#/financiera/pagos-varios`)
   */
  renderPagosVarios: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Pagos Varios</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-hand-holding-dollar"></i> Egresos Especiales y Pagos Varios</h1>
        <button id="btn-nuevo-pago-var" class="btn btn-primary">
          <i class="fas fa-plus"></i> Registrar Pago Vario
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Descripción / Glosa</th>
              <th>Categoría de Gasto</th>
              <th>Origen de Caja/Banco</th>
              <th>Método Pago</th>
              <th style="text-align: right;">Importe Liquidado</th>
            </tr>
          </thead>
          <tbody>
            ${(db.financiera.pagos_varios || []).map(pv => {
              const b = db.bancos.find(bank => bank.id === pv.bankId) || { bank_name: 'Caja' };
              return `
                <tr>
                  <td><code>${pv.ref}</code></td>
                  <td>${window.DolibarrUtils.formatDate(pv.date)}</td>
                  <td><strong>${pv.label}</strong></td>
                  <td><span class="badge" style="background:#EDF2F7; color:#4A5568;">${pv.category}</span></td>
                  <td><span class="text-muted"><i class="fas fa-university"></i> ${b.bank_name}</span></td>
                  <td>${pv.method}</td>
                  <td style="text-align: right;" class="font-semibold text-danger">-${window.DolibarrUtils.formatCurrency(pv.amount_bs)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL PAGO VARIO -->
      <div class="modal-overlay" id="modal-pagovar-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-hand-holding-dollar"></i> Registrar Pago Vario Directo</h3>
            <button class="modal-close" onclick="document.getElementById('modal-pagovar-overlay').classList.remove('show')">&times;</button>
          </div>
          <form id="form-nuevo-pago-var">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="pv-label">Concepto / Glosa del Pago *</label>
                <input type="text" id="pv-label" class="form-control" placeholder="Ej. Pago de impuestos nacionales IVA Mayo" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pv-category">Categoría del Gasto *</label>
                  <select id="pv-category" class="form-control" required>
                    <option value="Impuestos">Impuestos nacionales / tasas</option>
                    <option value="Servicios Básicos">Servicios Básicos (DELAPAZ, EPSAS, etc.)</option>
                    <option value="Alquileres">Alquileres de Oficinas</option>
                    <option value="Otros">Otros egresos menores</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pv-amount">Monto del Pago (Bs) *</label>
                  <input type="number" step="0.01" id="pv-amount" class="form-control" required placeholder="0.00">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pv-bank">Retirar de Caja/Banco *</label>
                  <select id="pv-bank" class="form-control" required>
                    <option value="">-- Seleccionar --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pv-method">Método de Pago *</label>
                  <select id="pv-method" class="form-control" required>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Efectivo / Caja">Efectivo / Caja</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-pagovar-overlay').classList.remove('show')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Pago</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Events
    const modal = document.getElementById('modal-pagovar-overlay');
    const btnOpen = document.getElementById('btn-nuevo-pago-var');
    const form = document.getElementById('form-nuevo-pago-var');

    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        form.reset();
        modal.classList.add('show');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const label = document.getElementById('pv-label').value;
        const category = document.getElementById('pv-category').value;
        const amount = parseFloat(document.getElementById('pv-amount').value) || 0;
        const bankId = parseInt(document.getElementById('pv-bank').value);
        const method = document.getElementById('pv-method').value;

        const banco = db.bancos.find(b => b.id === bankId);
        if (!banco) return;

        const amountToDeduct = banco.currency === 'USD' ? amount / 6.96 : amount;
        if (banco.balance < amountToDeduct) {
          window.DolibarrUtils.showToast("Saldo insuficiente en el banco seleccionado.", "error");
          return;
        }

        // 1. Descontar
        banco.balance -= amountToDeduct;

        // 2. Registrar pago vario
        const newPV = {
          id: window.DolibarrUtils.generateId(db.financiera.pagos_varios),
          ref: `VAR2606-${String(db.financiera.pagos_varios.length + 1).padStart(3,'0')}`,
          label: label,
          category: category,
          amount_bs: amount,
          date: new Date().toISOString().split('T')[0],
          bankId: bankId,
          method: method
        };
        db.financiera.pagos_varios.push(newPV);

        // 3. Pago general
        const newPay = {
          id: window.DolibarrUtils.generateId(db.financiera.pagos),
          type: "proveedor",
          ref: `PAG-VAR-${newPV.id}`,
          invoiceRef: newPV.ref,
          amount: amount,
          date: newPV.date,
          method: method
        };
        db.financiera.pagos.push(newPay);

        // 4. Asiento Contable
        let accCode = "690000 - Otros Gastos Operativos";
        if (category === "Impuestos") accCode = "640000 - Impuestos y Tasas";
        else if (category === "Servicios Básicos") accCode = "630000 - Servicios Básicos";
        else if (category === "Alquileres") accCode = "610000 - Alquileres Pagados";

        const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
        db.contabilidad.diario.push(
          { id: nextAsientoId, date: newPV.date, ref: newPV.ref, desc: `${label}`, account: accCode, debit: amount, credit: 0, journal: "Compras" },
          { id: nextAsientoId + 1, date: newPV.date, ref: newPV.ref, desc: `Pago directo ${banco.bank_name}`, account: `${banco.id === 2 ? '111200 - Banco BMSC' : '111100 - Banco BNB'}`, debit: 0, credit: amount, journal: "Bancos" }
        );

        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Pago vario directo registrado con éxito.", "success");
        modal.classList.remove('show');
        this.renderPagosVarios(container);
      });
    }
  },

  /**
   * Vista: Préstamos Amortizables (`#/financiera/prestamos`)
   */
  renderPrestamos: function(container) {
    const db = window.DolibarrDB.get();

    const prestamos = db.financiera.prestamos || [];
    const totalDeuda = prestamos.filter(p => p.status === 'Activo').reduce((sum, p) => sum + p.balance_bs, 0);
    const cuotaMensualEstimada = prestamos.filter(p => p.status === 'Activo').reduce((sum, p) => sum + p.monthly_payment_bs, 0);

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Préstamos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-landmark"></i> Préstamos Bancarios y Financiamiento</h1>
        <div class="action-buttons-flex">
          <button id="btn-nuevo-prestamo" class="btn btn-primary">
            <i class="fas fa-plus"></i> Registrar Préstamo
          </button>
          <button id="btn-pagar-cuota" class="btn btn-danger">
            <i class="fas fa-receipt"></i> Pagar Cuota de Préstamo
          </button>
        </div>
      </div>

      <!-- Resumen Préstamos -->
      <div class="loan-summary-card">
        <div style="font-weight:600; font-size:14px; text-transform:uppercase;">Estado de Pasivos Financieros</div>
        <div class="loan-summary-grid">
          <div class="loan-summary-item">
            <div class="loan-summary-label">Capital Pendiente de Pago</div>
            <div class="loan-summary-val" style="font-size: 20px; color:#ff8a80;">
              ${window.DolibarrUtils.formatCurrency(totalDeuda)}
            </div>
          </div>
          <div class="loan-summary-item">
            <div class="loan-summary-label">Salida Estimada Mensual (Cuotas)</div>
            <div class="loan-summary-val" style="font-size: 20px;">
              ${window.DolibarrUtils.formatCurrency(cuotaMensualEstimada)}
            </div>
          </div>
          <div class="loan-summary-item">
            <div class="loan-summary-label">Préstamos Activos</div>
            <div class="loan-summary-val" style="font-size: 20px;">
              ${prestamos.filter(p => p.status === 'Activo').length} créditos
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Entidad Financiera</th>
              <th>Fecha Desembolso</th>
              <th style="text-align: right;">Monto Capital</th>
              <th style="text-align: right;">Tasa Interés</th>
              <th style="text-align: right;">Plazo</th>
              <th style="text-align: right;">Cuota Mensual</th>
              <th style="text-align: right;">Saldo Pendiente</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${prestamos.map(p => `
              <tr>
                <td><code>${p.ref}</code></td>
                <td><strong>${p.lender}</strong></td>
                <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(p.amount_bs)}</td>
                <td style="text-align: right;" class="text-primary font-semibold">${p.interest_rate_pct}% anual</td>
                <td style="text-align: right;">${p.term_months} meses</td>
                <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.monthly_payment_bs)}</td>
                <td style="text-align: right;" class="font-semibold text-danger">${window.DolibarrUtils.formatCurrency(p.balance_bs)}</td>
                <td style="text-align: center;"><span class="fin-badge fin-badge-${p.status.toLowerCase()}">${p.status}</span></td>
              </tr>
            `).join('')}
            ${prestamos.length === 0 ? `<tr><td colspan="9" class="text-center text-muted" style="padding:16px;">No hay préstamos registrados.</td></tr>` : ''}
          </tbody>
        </table>
      </div>

      <!-- MODAL NUEVO PRESTAMO -->
      <div class="modal-overlay" id="modal-prestamo-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-landmark"></i> Registrar Contrato de Préstamo</h3>
            <button class="modal-close" onclick="document.getElementById('modal-prestamo-overlay').classList.remove('show')">&times;</button>
          </div>
          <form id="form-nuevo-prestamo">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="l-lender">Banco / Entidad Prestamista *</label>
                <input type="text" id="l-lender" class="form-control" required placeholder="Ej. Banco Mercantil Santa Cruz S.A.">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="l-amount">Capital del Préstamo (Bs) *</label>
                  <input type="number" step="0.01" id="l-amount" class="form-control" required placeholder="0.00">
                </div>
                <div class="form-group">
                  <label class="form-label" for="l-rate">Tasa de Interés Anual (%) *</label>
                  <input type="number" step="0.01" id="l-rate" class="form-control" required placeholder="Ej. 7.5">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="l-term">Plazo de Amortización (Meses) *</label>
                  <input type="number" id="l-term" class="form-control" required placeholder="Ej. 24">
                </div>
                <div class="form-group">
                  <label class="form-label" for="l-bank">Desembolsar / Depositar capital en *</label>
                  <select id="l-bank" class="form-control" required>
                    <option value="">-- Seleccionar Banco --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-prestamo-overlay').classList.remove('show')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar y Depositar Capital</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL PAGAR CUOTA -->
      <div class="modal-overlay" id="modal-cuota-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" style="color:var(--danger);"><i class="fas fa-receipt"></i> Registrar Pago de Cuota</h3>
            <button class="modal-close" onclick="document.getElementById('modal-cuota-overlay').classList.remove('show')">&times;</button>
          </div>
          <form id="form-pago-cuota">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="pc-loan">Seleccionar Préstamo *</label>
                <select id="pc-loan" class="form-control" required>
                  <option value="">-- Seleccionar Préstamo --</option>
                  ${prestamos.filter(p => p.status === 'Activo').map(p => `<option value="${p.id}">${p.lender} (Saldo: ${p.balance_bs} Bs / Cuota: ${p.monthly_payment_bs} Bs)</option>`).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pc-amount">Monto de la Cuota a Pagar (Bs) *</label>
                  <input type="number" step="0.01" id="pc-amount" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pc-bank">Retirar de Cuenta Bancaria *</label>
                  <select id="pc-bank" class="form-control" required>
                    <option value="">-- Seleccionar --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-cuota-overlay').classList.remove('show')">Cancelar</button>
              <button type="submit" class="btn btn-danger">Confirmar Pago de Cuota</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control: Nuevo Préstamo
    const modalP = document.getElementById('modal-prestamo-overlay');
    const btnOpenP = document.getElementById('btn-nuevo-prestamo');
    const formP = document.getElementById('form-nuevo-prestamo');

    if (btnOpenP) {
      btnOpenP.addEventListener('click', () => {
        formP.reset();
        modalP.classList.add('show');
      });
    }

    if (formP) {
      formP.addEventListener('submit', (e) => {
        e.preventDefault();
        const lender = document.getElementById('l-lender').value;
        const amount = parseFloat(document.getElementById('l-amount').value) || 0;
        const rate = parseFloat(document.getElementById('l-rate').value) || 0;
        const term = parseInt(document.getElementById('l-term').value) || 12;
        const bankId = parseInt(document.getElementById('l-bank').value);

        // PMT Formula
        const r = (rate / 100) / 12;
        const n = term;
        let monthly = amount / term;
        if (r > 0) {
          monthly = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }

        const date = new Date().toISOString().split('T')[0];
        const newLoan = {
          id: window.DolibarrUtils.generateId(db.financiera.prestamos),
          ref: `PRE2606-${String(db.financiera.prestamos.length + 1).padStart(3,'0')}`,
          lender: lender,
          amount_bs: amount,
          interest_rate_pct: rate,
          term_months: term,
          monthly_payment_bs: monthly,
          balance_bs: amount,
          date: date,
          status: "Activo",
          bankId: bankId
        };

        // 1. Aumentar balance del banco
        const banco = db.bancos.find(b => b.id === bankId);
        if (banco) {
          if (banco.currency === 'USD') banco.balance += amount / 6.96;
          else banco.balance += amount;
        }

        db.financiera.prestamos.push(newLoan);

        // 2. Asiento contable (Entrada de Fondos, Obligación Pasivo)
        const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
        db.contabilidad.diario.push(
          { id: nextAsientoId, date: date, ref: newLoan.ref, desc: `Desembolso Crédito ${newLoan.ref} - ${lender}`, account: `${banco && banco.id === 2 ? '111200 - Banco BMSC' : '111100 - Banco BNB'}`, debit: amount, credit: 0, journal: "Bancos" },
          { id: nextAsientoId + 1, date: date, ref: newLoan.ref, desc: `Pasivo Obligación Préstamo Bancario`, account: "212000 - Préstamos Bancarios por Pagar", debit: 0, credit: amount, journal: "Bancos" }
        );

        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Desembolso de préstamo registrado. Capital abonado al banco.", "success");
        modalP.classList.remove('show');
        this.renderPrestamos(container);
      });
    }

    // Modal Control: Pagar Cuota
    const modalC = document.getElementById('modal-cuota-overlay');
    const btnOpenC = document.getElementById('btn-pagar-cuota');
    const formC = document.getElementById('form-pago-cuota');
    const selectLoan = document.getElementById('pc-loan');
    const inputAmount = document.getElementById('pc-amount');

    if (btnOpenC) {
      btnOpenC.addEventListener('click', () => {
        formC.reset();
        modalC.classList.add('show');
      });
    }

    if (selectLoan) {
      selectLoan.addEventListener('change', () => {
        const id = parseInt(selectLoan.value);
        const l = db.financiera.prestamos.find(item => item.id === id);
        inputAmount.value = l ? l.monthly_payment_bs.toFixed(2) : '';
      });
    }

    if (formC) {
      formC.addEventListener('submit', (e) => {
        e.preventDefault();
        const loanId = parseInt(selectLoan.value);
        const amount = parseFloat(inputAmount.value) || 0;
        const bankId = parseInt(document.getElementById('pc-bank').value);

        const l = db.financiera.prestamos.find(item => item.id === loanId);
        if (!l) return;

        const banco = db.bancos.find(b => b.id === bankId);
        if (!banco) return;

        const amountToDeduct = banco.currency === 'USD' ? amount / 6.96 : amount;
        if (banco.balance < amountToDeduct) {
          window.DolibarrUtils.showToast("Saldo insuficiente en el banco seleccionado.", "error");
          return;
        }

        // 1. Descontar banco
        banco.balance -= amountToDeduct;

        // 2. Reducir capital
        l.balance_bs = Math.max(0, l.balance_bs - amount);
        if (l.balance_bs <= 0) {
          l.status = "Liquidado";
        }

        // 3. Registrar Pago General
        const newPay = {
          id: window.DolibarrUtils.generateId(db.financiera.pagos),
          type: "proveedor",
          ref: `PAG-L-PRE-${l.id}`,
          invoiceRef: l.ref,
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          method: `Transferencia - ${banco.bank_name}`
        };
        db.financiera.pagos.push(newPay);

        // 4. Asiento diario contable (85% principal, 15% interés aproximado)
        const principal = amount * 0.85;
        const interes = amount * 0.15;
        const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
        
        db.contabilidad.diario.push(
          { id: nextAsientoId, date: newPay.date, ref: l.ref, desc: `Amortización Capital Préstamo ${l.ref}`, account: "212000 - Préstamos Bancarios por Pagar", debit: principal, credit: 0, journal: "Compras" },
          { id: nextAsientoId + 1, date: newPay.date, ref: l.ref, desc: `Gasto Intereses Bancarios ${l.ref}`, account: "670000 - Intereses y Gastos Financieros", debit: interes, credit: 0, journal: "Compras" },
          { id: nextAsientoId + 2, date: newPay.date, ref: l.ref, desc: `Pago Cuota Banco ${banco.bank_name}`, account: `${banco.id === 2 ? '111200 - Banco BMSC' : '111100 - Banco BNB'}`, debit: 0, credit: amount, journal: "Bancos" }
        );

        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Pago de cuota registrado. Balance bancario y deuda actualizados.", "success");
        modalC.classList.remove('show');
        this.renderPrestamos(container);
      });
    }
  },

  /**
   * Vista: Márgenes por Producto (`#/financiera/margenes`)
   */
  renderMargenes: function(container) {
    const db = window.DolibarrDB.get();

    // Recopilar ventas e ingresos
    const productSales = {};
    db.financiera.facturas_cliente.forEach(f => {
      if (f.lines) {
        f.lines.forEach(line => {
          if (!productSales[line.productId]) {
            productSales[line.productId] = { qty: 0, revenue: 0 };
          }
          productSales[line.productId].qty += line.qty;
          const lineTotal = line.qty * line.price * (1 - (line.discount_pct || 0)/100);
          productSales[line.productId].revenue += lineTotal;
        });
      }
    });

    const marginData = db.products.map(p => {
      const sales = productSales[p.id] || { qty: 0, revenue: 0 };
      const totalCost = sales.qty * (p.cost || 0);
      const profit = sales.revenue - totalCost;
      const marginPct = sales.revenue > 0 ? ((profit / sales.revenue) * 100).toFixed(1) : '0.0';
      return {
        product: p,
        qtySold: sales.qty,
        revenue: sales.revenue,
        cost: totalCost,
        profit: profit,
        marginPct: marginPct
      };
    });

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Márgenes</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-chart-pie"></i> Márgenes de Beneficio por Producto / Servicio</h1>
      </div>

      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-bottom:24px;">
        
        <!-- Tabla de Rentabilidad -->
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title">Rentabilidad Detallada</div>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto / Servicio</th>
                    <th style="text-align: right;">Cant. Vendida</th>
                    <th style="text-align: right;">Ingresos Totales</th>
                    <th style="text-align: right;">Costos Totales</th>
                    <th style="text-align: right;">Margen de Utilidad</th>
                    <th style="text-align: right;">Margen (%)</th>
                  </tr>
                </thead>
                <tbody>
                  ${marginData.map(m => `
                    <tr>
                      <td><code>${m.product.code}</code></td>
                      <td><strong>${m.product.label}</strong></td>
                      <td style="text-align: right;">${m.qtySold}</td>
                      <td style="text-align: right;" class="text-primary font-semibold">${window.DolibarrUtils.formatCurrency(m.revenue)}</td>
                      <td style="text-align: right; color:#7F8C8D;">${window.DolibarrUtils.formatCurrency(m.cost)}</td>
                      <td style="text-align: right; color:${m.profit >= 0 ? 'var(--success)' : 'var(--danger)'}; font-semibold">
                        ${window.DolibarrUtils.formatCurrency(m.profit)}
                      </td>
                      <td style="text-align: right;" class="font-semibold text-info">${m.marginPct}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Gráfico de Contribución -->
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar"></i> Comparativa de Margen comercial (Bs)</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-financiera-margenes"></canvas>
            </div>
          </div>
        </div>

      </div>
    `;

    // Renderizar gráfico
    if (typeof Chart !== 'undefined') {
      const activeMargins = marginData.filter(m => m.qtySold > 0);
      const labels = activeMargins.map(m => m.product.label.substring(0,20) + '...');
      const profits = activeMargins.map(m => m.profit);

      if (labels.length > 0) {
        window.DolibarrCharts.createBar('chart-financiera-margenes', 
          labels, 
          [{
            label: 'Utilidad Generada (Bs)',
            data: profits,
            backgroundColor: '#2CB57E',
            borderRadius: 4
          }],
          { indexAxis: 'x' }
        );
      } else {
        const ctx = document.getElementById('chart-financiera-margenes').getContext('2d');
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#7F8C8D';
        ctx.fillText('Sin utilidades de ventas registradas', 20, 100);
      }
    }
  },

  /**
   * Vista: Resumen de Gastos Salariales (`#/financiera/salarios`)
   */
  renderSalarios: function(container) {
    const db = window.DolibarrDB.get();

    const payrolls = db.rrhh.payroll_payments || [];
    const totalSueldoBase = payrolls.reduce((sum, p) => sum + p.salary_bs, 0);
    const totalBonos = payrolls.reduce((sum, p) => sum + p.bonuses_bs, 0);
    const totalAFP = payrolls.reduce((sum, p) => sum + p.deductions_bs, 0);
    const totalNeto = payrolls.reduce((sum, p) => sum + p.net_paid_bs, 0);

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/financiera">Financiera</a> <i class="fas fa-chevron-right"></i> <strong>Sueldos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-wallet"></i> Resumen Consolidador de Egresos de Planilla</h1>
      </div>

      <!-- Widgets Salarios -->
      <div class="payroll-summary-card" style="background:linear-gradient(135deg, #2c3e50 0%, #2c3e50 100%);">
        <div style="font-weight:600; font-size:14px; text-transform:uppercase;">Costos Consolidados de Personal</div>
        <div class="loan-summary-grid">
          <div class="loan-summary-item">
            <div class="loan-summary-label">Total Costo Personal (Bruto)</div>
            <div class="loan-summary-val" style="font-size:20px;">
              ${window.DolibarrUtils.formatCurrency(totalSueldoBase + totalBonos)}
            </div>
          </div>
          <div class="loan-summary-item">
            <div class="loan-summary-label">Retenciones AFP Realizadas</div>
            <div class="loan-summary-val" style="font-size:20px; color:#ffb74d;">
              ${window.DolibarrUtils.formatCurrency(totalAFP)}
            </div>
          </div>
          <div class="loan-summary-item" style="background:rgba(46,204,113,0.15);">
            <div class="loan-summary-label">Total Neto Transferido</div>
            <div class="loan-summary-val" style="font-size:20px; color:#81c784;">
              ${window.DolibarrUtils.formatCurrency(totalNeto)}
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 2.2fr 1.8fr; gap:24px;">
        
        <!-- Listado de liquidaciones -->
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title">Planillas Liquidadas (Finanzas)</div>
            <a href="#/rrhh/pagos" style="font-size:12px;">Ir a RRHH</a>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Empleado</th>
                  <th style="text-align: right;">Sueldo</th>
                  <th style="text-align: right;">AFP Ret.</th>
                  <th style="text-align: right;">Neto</th>
                </tr>
              </thead>
              <tbody>
                ${payrolls.slice(-5).reverse().map(p => {
                  const emp = db.rrhh.employees.find(e => e.id === p.employeeId) || { first_name: 'Desconocido', last_name: '' };
                  return `
                    <tr>
                      <td><strong>${p.month}/${p.year}</strong></td>
                      <td>${emp.first_name} ${emp.last_name}</td>
                      <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(p.salary_bs)}</td>
                      <td style="text-align: right; color:var(--danger); font-size:11px;">-${window.DolibarrUtils.formatCurrency(p.deductions_bs)}</td>
                      <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.net_paid_bs)}</td>
                    </tr>
                  `;
                }).join('')}
                ${payrolls.length === 0 ? `<tr><td colspan="5" class="text-center text-muted" style="padding:16px;">Sin planillas registradas.</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gráfico Operativo consolidado de la empresa -->
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución Operativa de Egresos</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-operativo-egresos"></canvas>
            </div>
          </div>
        </div>

      </div>
    `;

    // Renderizar gráfico egresos operativos
    if (typeof Chart !== 'undefined') {
      // 1. Sueldos netos
      const salNet = totalNeto;
      // 2. Facturas de proveedores pagados
      const provPaid = db.financiera.pagos.filter(p => p.type === 'proveedor' && p.invoiceRef.startsWith('FP-')).reduce((sum, p) => sum + p.amount, 0);
      // 3. Pagos varios
      const varPaid = (db.financiera.pagos_varios || []).reduce((sum, p) => sum + p.amount_bs, 0);

      window.DolibarrCharts.createDoughnut('chart-operativo-egresos', 
        ['Salarios Liquidados', 'Facturas Proveedor', 'Egresos Varios / Gastos'],
        [salNet, provPaid, varPaid],
        ['#3A78D4', '#E74C3C', '#F39C12']
      );
    }
  },

  /**
   * Vista: Historial General (`#/financiera/pagos`)
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
              <th>Tipo de Transacción</th>
              <th>Documento / Factura</th>
              <th>Fecha Registro</th>
              <th>Detalle de Liquidación</th>
              <th style="text-align: right;">Monto</th>
            </tr>
          </thead>
          <tbody>
            ${db.financiera.pagos.map(p => {
              const isCliente = p.type === 'cliente';
              return `
                <tr>
                  <td><code>${p.ref}</code></td>
                  <td>
                    <span class="rrhh-badge" style="background:${isCliente ? '#C6F6D5' : '#FED7D7'}; color:${isCliente ? '#22543D' : '#742A2A'}; font-size:10px;">
                      ${isCliente ? 'Cobro (Ingreso)' : 'Pago (Egreso)'}
                    </span>
                  </td>
                  <td><code>${p.invoiceRef}</code></td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td><span class="text-muted" style="font-size:12px;">${p.method}</span></td>
                  <td style="text-align: right;" class="font-semibold ${isCliente ? 'text-success' : 'text-danger'}">
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
