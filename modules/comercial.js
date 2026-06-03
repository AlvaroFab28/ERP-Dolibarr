/**
 * comercial.js - Módulo Comercial (Presupuestos y Pedidos de Clientes y Proveedores)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.comercial = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inicializar datos de compras (proveedores) y contratos si no existen
    this.initProcurementAndContractData();

    // Inyectar estilos premium específicos del módulo
    this.injectStyles();
    
    if (subRoute === 'presupuestos') {
      this.renderPresupuestos(mainContent);
    } else if (subRoute === 'pedidos') {
      this.renderPedidos(mainContent);
    } else if (subRoute === 'presupuestos-prov') {
      this.renderPresupuestosProv(mainContent);
    } else if (subRoute === 'pedidos-prov') {
      this.renderPedidosProv(mainContent);
    } else if (subRoute === 'contratos') {
      this.renderContratos(mainContent);
    } else if (subRoute === 'estadisticas') {
      this.renderEstadisticas(mainContent);
    } else if (subRoute === 'nuevo-presupuesto') {
      this.renderNuevoPresupuestoForm(mainContent);
    } else if (subRoute === 'nuevo-pedido') {
      this.renderNuevoPedidoForm(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Inicializa la data simulada para compras a proveedores y contratos
   */
  initProcurementAndContractData: function() {
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
    if (!db.commercial.contratos) {
      db.commercial.contratos = [
        { id: 1, ref: "CON2606-001", terceroId: 1, label: "Mantenimiento Anual Válvulas YPFB", monto_bs: 120000.00, start_date: "2026-06-01", end_date: "2027-05-31", status: "Activo" },
        { id: 2, ref: "CON2606-002", terceroId: 2, label: "Soporte de Fibra Óptica ENTEL", monto_bs: 45000.00, start_date: "2026-07-01", end_date: "2026-12-31", status: "Borrador" },
        { id: 3, ref: "CON2606-003", terceroId: 3, label: "Monitoreo Red Interna CBN", monto_bs: 35000.00, start_date: "2025-06-01", end_date: "2026-05-31", status: "Cerrado" }
      ];
      updated = true;
    }

    if (updated) {
      window.DolibarrDB.save(db);
    }
  },

  /**
   * Inyecta estilos CSS específicos para formularios y tablas comerciales
   */
  injectStyles: function() {
    let styleEl = document.getElementById('comercial-custom-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'comercial-custom-styles';
      styleEl.innerHTML = `
        /* Estilos del editor de líneas de productos */
        .line-editor-card {
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          margin-top: 15px;
          margin-bottom: 20px;
        }
        .lines-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        .lines-table th {
          background: #F1F5F9;
          color: var(--text-dark);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .lines-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
        }
        .total-summary-box {
          background: #F8FAFC;
          border-radius: 8px;
          padding: 14px 20px;
          width: 320px;
          margin-left: auto;
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid var(--border-color);
        }
        .total-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-dark);
        }
        .total-summary-row.grand-total {
          font-weight: 700;
          font-size: 15px;
          color: var(--primary);
          border-top: 1px solid var(--border-color);
          padding-top: 8px;
        }
        .btn-delete-row {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          font-size: 14px;
          transition: transform 0.2s;
        }
        .btn-delete-row:hover {
          transform: scale(1.15);
        }
      `;
      document.head.appendChild(styleEl);
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

    // Contratos
    const contratosCount = db.commercial.contratos.length;
    const contratosActivosMonto = db.commercial.contratos
      .filter(c => c.status === 'Activo')
      .reduce((sum, c) => sum + c.monto_bs, 0);

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Comercial</span> <i class="fas fa-chevron-right"></i> <strong>Resumen Comercial</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-briefcase"></i> Área Comercial</h1>
        <div class="page-actions" style="display:flex; gap:10px;">
          <a href="#/comercial/nuevo-presupuesto" class="btn btn-primary"><i class="fas fa-plus"></i> Nuevo Presupuesto</a>
          <a href="#/comercial/nuevo-pedido" class="btn btn-secondary"><i class="fas fa-plus"></i> Nuevo Pedido</a>
        </div>
      </div>

      <!-- Widgets -->
      <div class="widget-grid" style="grid-template-columns: repeat(4, 1fr);">
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

        <div class="widget-box wb-info" onclick="window.location.hash='#/comercial/contratos'">
          <div class="wb-icon"><i class="fas fa-file-contract"></i></div>
          <div class="wb-details">
            <div class="wb-count">${contratosCount}</div>
            <div class="wb-label">Contratos Vigentes</div>
            <div class="wb-amount">Activos: ${window.DolibarrUtils.formatCurrency(contratosActivosMonto)}</div>
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
  renderPresupuestos: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Presupuestos Cliente</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice-dollar"></i> Presupuestos Emitidos a Clientes</h1>
        <a href="#/comercial/nuevo-presupuesto" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Presupuesto
        </a>
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
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.commercial.presupuestos.map(p => {
              const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
              const iva = p.total_ttc - p.total_ht;
              
              let actionHtml = '';
              if (p.status === 'Borrador') {
                actionHtml = `<button class="btn btn-primary btn-sm btn-accept-pres" data-id="${p.id}"><i class="fas fa-check"></i> Validar</button>`;
              } else if (p.status === 'Validado') {
                actionHtml = `
                  <button class="btn btn-success btn-sm btn-firm-pres" data-id="${p.id}"><i class="fas fa-signature"></i> Aceptar</button>
                  <button class="btn btn-danger btn-sm btn-reject-pres" data-id="${p.id}"><i class="fas fa-times"></i> Rechazar</button>
                `;
              } else if (p.status === 'Aceptado') {
                actionHtml = `<button class="btn btn-secondary btn-sm btn-make-order" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Crear Pedido</button>`;
              } else {
                actionHtml = `<span class="text-muted" style="font-size:12px;">Sin acciones</span>`;
              }

              return `
                <tr>
                  <td><code>${p.ref}</code></td>
                  <td><strong>${cli.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(p.total_ht)}</td>
                  <td style="text-align: right;" class="text-muted">${window.DolibarrUtils.formatCurrency(iva)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.total_ttc)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(p.status)}</td>
                  <td style="text-align: center; display:flex; gap:6px; justify-content:center;">${actionHtml}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Asignar controladores
    document.querySelectorAll('.btn-accept-pres').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const pres = db.commercial.presupuestos.find(p => p.id === id);
        if (pres) {
          pres.status = 'Validado';
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Presupuesto ${pres.ref} validado correctamente.`, 'success');
          this.renderPresupuestos(container);
        }
      });
    });

    document.querySelectorAll('.btn-firm-pres').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const pres = db.commercial.presupuestos.find(p => p.id === id);
        if (pres) {
          pres.status = 'Aceptado';
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Presupuesto ${pres.ref} firmado y aceptado por cliente.`, 'success');
          this.renderPresupuestos(container);
        }
      });
    });

    document.querySelectorAll('.btn-reject-pres').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const pres = db.commercial.presupuestos.find(p => p.id === id);
        if (pres) {
          pres.status = 'Rechazado';
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Presupuesto ${pres.ref} marcado como rechazado.`, 'warning');
          this.renderPresupuestos(container);
        }
      });
    });

    document.querySelectorAll('.btn-make-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const pres = db.commercial.presupuestos.find(p => p.id === id);
        if (pres) {
          // Copiar presupuesto a nuevo pedido de cliente
          const newOrder = {
            id: window.DolibarrUtils.generateId(db.commercial.pedidos),
            ref: `PE26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.commercial.pedidos.length + 1).padStart(3,'0')}`,
            terceroId: pres.terceroId,
            date: new Date().toISOString().split('T')[0],
            total_ht: pres.total_ht,
            total_ttc: pres.total_ttc,
            status: "Validado",
            lines: pres.lines || []
          };
          db.commercial.pedidos.push(newOrder);
          
          // Cambiar estado del presupuesto a cerrado/procesado
          pres.status = 'Aceptado';
          
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Pedido de Venta ${newOrder.ref} creado desde el Presupuesto.`, 'success');
          window.location.hash = '#/comercial/pedidos';
        }
      });
    });
  },

  /**
   * Vista: Pedidos de Clientes
   */
  renderPedidos: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Pedidos Cliente</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-shopping-cart"></i> Pedidos de Venta de Clientes</h1>
        <a href="#/comercial/nuevo-pedido" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Pedido
        </a>
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
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.commercial.pedidos.map(p => {
              const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
              
              let actionHtml = '';
              if (p.status === 'Validado') {
                actionHtml = `<button class="btn btn-primary btn-sm btn-process-order" data-id="${p.id}"><i class="fas fa-gears"></i> Procesar</button>`;
              } else if (p.status === 'En proceso') {
                actionHtml = `<button class="btn btn-success btn-sm btn-deliver-order" data-id="${p.id}"><i class="fas fa-truck"></i> Entregar</button>`;
              } else {
                actionHtml = `<span class="text-muted" style="font-size:12px;"><i class="fas fa-circle-check" style="color:var(--success);"></i> Entregado</span>`;
              }

              return `
                <tr>
                  <td><code>${p.ref}</code></td>
                  <td><strong>${cli.name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.total_ttc)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(p.status)}</td>
                  <td style="text-align: center; display:flex; gap:6px; justify-content:center;">${actionHtml}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Controladores
    document.querySelectorAll('.btn-process-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const ped = db.commercial.pedidos.find(p => p.id === id);
        if (ped) {
          ped.status = 'En proceso';
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Pedido ${ped.ref} ahora está en preparación.`, 'info');
          this.renderPedidos(container);
        }
      });
    });

    document.querySelectorAll('.btn-deliver-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const ped = db.commercial.pedidos.find(p => p.id === id);
        if (ped) {
          ped.status = 'Entregado';
          
          // Descontar inventarios (Stocks) si existen líneas asociadas
          if (ped.lines && ped.lines.length > 0) {
            ped.lines.forEach(line => {
              const prod = db.products.find(pr => pr.id === line.productId);
              if (prod && prod.type === 'producto') {
                prod.stock = Math.max(0, prod.stock - line.qty);
              }
            });
          }
          
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Pedido ${ped.ref} entregado y stock actualizado en almacenes.`, 'success');
          this.renderPedidos(container);
        }
      });
    });
  },

  /**
   * Vista: Nuevo Presupuesto con Editor de Líneas Completo
   */
  renderNuevoPresupuestoForm: function(container) {
    const db = window.DolibarrDB.get();
    const clientes = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos');

    // Estado local del editor
    let currentLines = [];

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Nuevo Presupuesto</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice-dollar"></i> Emitir Nuevo Presupuesto de Ventas</h1>
      </div>

      <div style="display:grid; grid-template-columns: 1.1fr 1.9fr; gap:24px; max-width:1200px; margin:0 auto;">
        
        <!-- Tarjeta Izquierda: Cabecera -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Cabecera de Oferta</div>
          </div>
          <div class="card-body">
            <form id="form-pres-cabecera">
              <div class="form-group">
                <label class="form-label" for="pres-cli">Cliente Asociado *</label>
                <select id="pres-cli" class="form-control" required>
                  <option value="">-- Seleccionar Cliente --</option>
                  ${clientes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="pres-date">Fecha de Emisión *</label>
                <input type="date" id="pres-date" class="form-control" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="pres-val">Validez de Propuesta</label>
                <select id="pres-val" class="form-control">
                  <option value="15">15 Días</option>
                  <option value="30" selected>30 Días</option>
                  <option value="60">60 Días</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="pres-cond">Condición de Pago</label>
                <select id="pres-cond" class="form-control">
                  <option value="Inmediato">Inmediato al recibir factura</option>
                  <option value="30 dias">Crédito a 30 Días</option>
                  <option value="Prepago">Anticipo 50% / Saldo contra entrega</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="pres-desc">Notas adicionales</label>
                <textarea id="pres-desc" class="form-control" rows="2" placeholder="Especificaciones, cotización de flete..."></textarea>
              </div>
            </form>
          </div>
        </div>

        <!-- Tarjeta Derecha: Editor de Líneas y Totales -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Líneas de Detalle / Productos</div>
          </div>
          <div class="card-body">
            
            <!-- Entrada de línea -->
            <div class="line-editor-card">
              <div class="form-row" style="grid-template-columns: 2.2fr 1fr 1fr 1fr; gap:12px; align-items:flex-end;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Elegir Producto / Servicio</label>
                  <select id="line-product-select" class="form-control">
                    <option value="">-- Buscar Item --</option>
                    ${db.products.map(p => `
                      <option value="${p.id}" data-price="${p.price}" data-type="${p.type}">
                        [${p.code}] ${p.label} - ${window.DolibarrUtils.formatCurrency(p.price)}
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Precio Unitario</label>
                  <input type="number" step="0.01" id="line-price" class="form-control" placeholder="0.00">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Cantidad</label>
                  <input type="number" id="line-qty" class="form-control" value="1" min="1">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Desc (%)</label>
                  <input type="number" id="line-discount" class="form-control" value="0" min="0" max="100">
                </div>
              </div>
              <div style="display:flex; justify-content:flex-end; margin-top:12px;">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-line-item"><i class="fas fa-plus"></i> Insertar Fila</button>
              </div>
            </div>

            <!-- Tabla de items cargados -->
            <table class="lines-table">
              <thead>
                <tr>
                  <th>Código / Item</th>
                  <th style="text-align:right; width:80px;">Cant.</th>
                  <th style="text-align:right; width:110px;">P. Unit (Bs.)</th>
                  <th style="text-align:right; width:70px;">Desc.</th>
                  <th style="text-align:right; width:110px;">Total Línea</th>
                  <th style="text-align:center; width:50px;">Acción</th>
                </tr>
              </thead>
              <tbody id="lines-tbody">
                <tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No se han agregado productos al presupuesto aún.</td></tr>
              </tbody>
            </table>

            <!-- Suma Totales -->
            <div class="total-summary-box">
              <div class="total-summary-row">
                <span>Base Imponible (HT):</span>
                <span id="sum-ht">Bs. 0,00</span>
              </div>
              <div class="total-summary-row" style="color:var(--text-muted);">
                <span>IVA Computado (13%):</span>
                <span id="sum-iva">Bs. 0,00</span>
              </div>
              <div class="total-summary-row grand-total">
                <span>Total Presupuesto (TTC):</span>
                <span id="sum-ttc">Bs. 0,00</span>
              </div>
            </div>

            <!-- Botones finales -->
            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
              <a href="#/comercial/presupuestos" class="btn btn-secondary">Cancelar</a>
              <button type="button" class="btn btn-primary" id="btn-save-full-pres" disabled><i class="fas fa-save"></i> Emitir Presupuesto</button>
            </div>

          </div>
        </div>

      </div>
    `;

    const productSelect = document.getElementById('line-product-select');
    const priceInput = document.getElementById('line-price');
    const qtyInput = document.getElementById('line-qty');
    const discountInput = document.getElementById('line-discount');
    const btnAddLine = document.getElementById('btn-add-line-item');
    const tbody = document.getElementById('lines-tbody');
    const btnSave = document.getElementById('btn-save-full-pres');

    // Auto-completar precio al seleccionar producto
    productSelect.addEventListener('change', () => {
      const selectedOpt = productSelect.options[productSelect.selectedIndex];
      if (selectedOpt && selectedOpt.value) {
        priceInput.value = selectedOpt.dataset.price;
      } else {
        priceInput.value = '';
      }
    });

    // Función para renderizar filas del editor
    const renderTableRows = () => {
      if (currentLines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No se han agregado productos al presupuesto aún.</td></tr>`;
        btnSave.setAttribute('disabled', 'true');
        updateTotals(0);
        return;
      }

      btnSave.removeAttribute('disabled');
      let subtotalHT = 0;

      tbody.innerHTML = currentLines.map((line, idx) => {
        const prod = db.products.find(p => p.id === line.productId) || { label: 'Desconocido', code: 'N/A' };
        const rowTotal = line.qty * line.price * (1 - (line.discount_pct / 100));
        subtotalHT += rowTotal;

        return `
          <tr>
            <td>
              <strong>${prod.label}</strong><br>
              <code style="font-size:11px;">${prod.code}</code>
            </td>
            <td style="text-align:right;">${line.qty}</td>
            <td style="text-align:right;">${window.DolibarrUtils.formatCurrency(line.price)}</td>
            <td style="text-align:right;">${line.discount_pct}%</td>
            <td style="text-align:right; font-weight:600;">${window.DolibarrUtils.formatCurrency(rowTotal)}</td>
            <td style="text-align:center;">
              <button type="button" class="btn-delete-row" data-index="${idx}"><i class="fas fa-trash-can"></i></button>
            </td>
          </tr>
        `;
      }).join('');

      updateTotals(subtotalHT);

      // Eventos borrar línea
      document.querySelectorAll('.btn-delete-row').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          currentLines.splice(index, 1);
          renderTableRows();
        });
      });
    };

    const updateTotals = (ht) => {
      const iva = ht * 0.13;
      const ttc = ht + iva;
      document.getElementById('sum-ht').textContent = window.DolibarrUtils.formatCurrency(ht);
      document.getElementById('sum-iva').textContent = window.DolibarrUtils.formatCurrency(iva);
      document.getElementById('sum-ttc').textContent = window.DolibarrUtils.formatCurrency(ttc);
    };

    // Añadir línea
    btnAddLine.addEventListener('click', () => {
      const prodId = parseInt(productSelect.value);
      const price = parseFloat(priceInput.value);
      const qty = parseInt(qtyInput.value);
      const disc = parseInt(discountInput.value) || 0;

      if (!prodId || isNaN(price) || isNaN(qty) || qty <= 0) {
        window.DolibarrUtils.showToast("Seleccione un producto e ingrese cantidad y precio válidos.", "warning");
        return;
      }

      currentLines.push({
        productId: prodId,
        qty: qty,
        price: price,
        discount_pct: disc
      });

      // Resetear inputs del editor de líneas
      productSelect.value = '';
      priceInput.value = '';
      qtyInput.value = '1';
      discountInput.value = '0';

      renderTableRows();
    });

    // Guardado de la oferta completa
    btnSave.addEventListener('click', () => {
      const cabForm = document.getElementById('form-pres-cabecera');
      const clienteId = parseInt(document.getElementById('pres-cli').value);
      const dateVal = document.getElementById('pres-date').value;

      if (!clienteId || !dateVal) {
        window.DolibarrUtils.showToast("Debe rellenar todos los campos requeridos de la cabecera.", "warning");
        return;
      }

      // Calcular montos finales
      let totalHT = 0;
      currentLines.forEach(line => {
        totalHT += line.qty * line.price * (1 - (line.discount_pct / 100));
      });
      const totalTTC = totalHT * 1.13;

      const newPres = {
        id: window.DolibarrUtils.generateId(db.commercial.presupuestos),
        ref: `PR2606-${String(db.commercial.presupuestos.length + 1).padStart(3, '0')}`,
        terceroId: clienteId,
        date: dateVal,
        total_ht: totalHT,
        total_ttc: totalTTC,
        status: "Borrador",
        lines: currentLines,
        validez_dias: parseInt(document.getElementById('pres-val').value),
        condicion_pago: document.getElementById('pres-cond').value,
        notas: document.getElementById('pres-desc').value
      };

      db.commercial.presupuestos.push(newPres);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Presupuesto ${newPres.ref} emitido en borrador.`, "success");
      
      window.location.hash = '#/comercial/presupuestos';
    });

    // Cargar fecha de hoy por defecto
    document.getElementById('pres-date').valueAsDate = new Date();
  },

  /**
   * Vista: Nuevo Pedido con Editor de Líneas Completo
   */
  renderNuevoPedidoForm: function(container) {
    const db = window.DolibarrDB.get();
    const clientes = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos');

    let currentLines = [];

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Nuevo Pedido</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-shopping-cart"></i> Registrar Nuevo Pedido de Venta</h1>
      </div>

      <div style="display:grid; grid-template-columns: 1.1fr 1.9fr; gap:24px; max-width:1200px; margin:0 auto;">
        
        <!-- Cabecera de Pedido -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Cabecera de Pedido</div>
          </div>
          <div class="card-body">
            <form id="form-ped-cabecera">
              <div class="form-group">
                <label class="form-label" for="ped-cli">Cliente Asociado *</label>
                <select id="ped-cli" class="form-control" required>
                  <option value="">-- Seleccionar Cliente --</option>
                  ${clientes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="ped-date">Fecha de Registro *</label>
                <input type="date" id="ped-date" class="form-control" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="ped-ship">Método de Envío</label>
                <select id="ped-ship" class="form-control">
                  <option value="Terrestre">Transporte Altiplano (La Paz/Oruro/Potosí)</option>
                  <option value="Couriers">Courier Rápido (Santa Cruz/Cochabamba)</option>
                  <option value="Retiro">Retiro en Oficina / Almacén Central</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="ped-desc">Observaciones de Envío</label>
                <textarea id="ped-desc" class="form-control" rows="2" placeholder="Dirección detallada de entrega..."></textarea>
              </div>
            </form>
          </div>
        </div>

        <!-- Editor de Líneas -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Líneas de Detalle / Pedidos</div>
          </div>
          <div class="card-body">
            
            <div class="line-editor-card">
              <div class="form-row" style="grid-template-columns: 2.2fr 1fr 1fr 1fr; gap:12px; align-items:flex-end;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Elegir Producto / Servicio</label>
                  <select id="line-product-select" class="form-control">
                    <option value="">-- Buscar Item --</option>
                    ${db.products.map(p => `
                      <option value="${p.id}" data-price="${p.price}">
                        [${p.code}] ${p.label} - ${window.DolibarrUtils.formatCurrency(p.price)}
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Precio Unitario</label>
                  <input type="number" step="0.01" id="line-price" class="form-control" placeholder="0.00">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Cantidad</label>
                  <input type="number" id="line-qty" class="form-control" value="1" min="1">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Desc (%)</label>
                  <input type="number" id="line-discount" class="form-control" value="0" min="0" max="100">
                </div>
              </div>
              <div style="display:flex; justify-content:flex-end; margin-top:12px;">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-line-item"><i class="fas fa-plus"></i> Insertar Fila</button>
              </div>
            </div>

            <table class="lines-table">
              <thead>
                <tr>
                  <th>Código / Item</th>
                  <th style="text-align:right; width:80px;">Cant.</th>
                  <th style="text-align:right; width:110px;">P. Unit (Bs.)</th>
                  <th style="text-align:right; width:70px;">Desc.</th>
                  <th style="text-align:right; width:110px;">Total Línea</th>
                  <th style="text-align:center; width:50px;">Acción</th>
                </tr>
              </thead>
              <tbody id="lines-tbody">
                <tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No se han agregado productos al pedido aún.</td></tr>
              </tbody>
            </table>

            <div class="total-summary-box">
              <div class="total-summary-row">
                <span>Base Imponible (HT):</span>
                <span id="sum-ht">Bs. 0,00</span>
              </div>
              <div class="total-summary-row" style="color:var(--text-muted);">
                <span>IVA Computado (13%):</span>
                <span id="sum-iva">Bs. 0,00</span>
              </div>
              <div class="total-summary-row grand-total">
                <span>Total Pedido (TTC):</span>
                <span id="sum-ttc">Bs. 0,00</span>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
              <a href="#/comercial/pedidos" class="btn btn-secondary">Cancelar</a>
              <button type="button" class="btn btn-primary" id="btn-save-full-ped" disabled><i class="fas fa-save"></i> Registrar Pedido</button>
            </div>

          </div>
        </div>

      </div>
    `;

    const productSelect = document.getElementById('line-product-select');
    const priceInput = document.getElementById('line-price');
    const qtyInput = document.getElementById('line-qty');
    const discountInput = document.getElementById('line-discount');
    const btnAddLine = document.getElementById('btn-add-line-item');
    const tbody = document.getElementById('lines-tbody');
    const btnSave = document.getElementById('btn-save-full-ped');

    productSelect.addEventListener('change', () => {
      const selectedOpt = productSelect.options[productSelect.selectedIndex];
      if (selectedOpt && selectedOpt.value) {
        priceInput.value = selectedOpt.dataset.price;
      } else {
        priceInput.value = '';
      }
    });

    const renderTableRows = () => {
      if (currentLines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No se han agregado productos al pedido aún.</td></tr>`;
        btnSave.setAttribute('disabled', 'true');
        updateTotals(0);
        return;
      }

      btnSave.removeAttribute('disabled');
      let subtotalHT = 0;

      tbody.innerHTML = currentLines.map((line, idx) => {
        const prod = db.products.find(p => p.id === line.productId) || { label: 'Desconocido', code: 'N/A' };
        const rowTotal = line.qty * line.price * (1 - (line.discount_pct / 100));
        subtotalHT += rowTotal;

        return `
          <tr>
            <td>
              <strong>${prod.label}</strong><br>
              <code style="font-size:11px;">${prod.code}</code>
            </td>
            <td style="text-align:right;">${line.qty}</td>
            <td style="text-align:right;">${window.DolibarrUtils.formatCurrency(line.price)}</td>
            <td style="text-align:right;">${line.discount_pct}%</td>
            <td style="text-align:right; font-weight:600;">${window.DolibarrUtils.formatCurrency(rowTotal)}</td>
            <td style="text-align:center;">
              <button type="button" class="btn-delete-row" data-index="${idx}"><i class="fas fa-trash-can"></i></button>
            </td>
          </tr>
        `;
      }).join('');

      updateTotals(subtotalHT);

      document.querySelectorAll('.btn-delete-row').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          currentLines.splice(index, 1);
          renderTableRows();
        });
      });
    };

    const updateTotals = (ht) => {
      const iva = ht * 0.13;
      const ttc = ht + iva;
      document.getElementById('sum-ht').textContent = window.DolibarrUtils.formatCurrency(ht);
      document.getElementById('sum-iva').textContent = window.DolibarrUtils.formatCurrency(iva);
      document.getElementById('sum-ttc').textContent = window.DolibarrUtils.formatCurrency(ttc);
    };

    btnAddLine.addEventListener('click', () => {
      const prodId = parseInt(productSelect.value);
      const price = parseFloat(priceInput.value);
      const qty = parseInt(qtyInput.value);
      const disc = parseInt(discountInput.value) || 0;

      if (!prodId || isNaN(price) || isNaN(qty) || qty <= 0) {
        window.DolibarrUtils.showToast("Seleccione un producto e ingrese cantidad y precio válidos.", "warning");
        return;
      }

      currentLines.push({
        productId: prodId,
        qty: qty,
        price: price,
        discount_pct: disc
      });

      productSelect.value = '';
      priceInput.value = '';
      qtyInput.value = '1';
      discountInput.value = '0';

      renderTableRows();
    });

    btnSave.addEventListener('click', () => {
      const clienteId = parseInt(document.getElementById('ped-cli').value);
      const dateVal = document.getElementById('ped-date').value;

      if (!clienteId || !dateVal) {
        window.DolibarrUtils.showToast("Debe rellenar todos los campos requeridos de la cabecera.", "warning");
        return;
      }

      let totalHT = 0;
      currentLines.forEach(line => {
        totalHT += line.qty * line.price * (1 - (line.discount_pct / 100));
      });
      const totalTTC = totalHT * 1.13;

      const newPed = {
        id: window.DolibarrUtils.generateId(db.commercial.pedidos),
        ref: `PE2606-${String(db.commercial.pedidos.length + 1).padStart(3, '0')}`,
        terceroId: clienteId,
        date: dateVal,
        total_ht: totalHT,
        total_ttc: totalTTC,
        status: "Validado",
        lines: currentLines,
        envio_metodo: document.getElementById('ped-ship').value,
        observaciones: document.getElementById('ped-desc').value
      };

      db.commercial.pedidos.push(newPed);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Pedido de Venta ${newPed.ref} registrado correctamente.`, "success");
      
      window.location.hash = '#/comercial/pedidos';
    });

    document.getElementById('ped-date').valueAsDate = new Date();
  },

  /**
   * Vista: Gestión de Contratos de Servicios
   */
  renderContratos: function(container) {
    const db = window.DolibarrDB.get();
    const clientes = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Contratos de Servicio</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-contract"></i> Contratos de Servicios Vigentes</h1>
        <button class="btn btn-primary" id="btn-nuevo-contrato"><i class="fas fa-plus"></i> Registrar Contrato</button>
      </div>

      <!-- Tabla Contratos -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID Contrato</th>
              <th>Descripción del Servicio</th>
              <th>Cliente</th>
              <th style="text-align: right;">Monto Cobertura</th>
              <th>Fecha Inicio</th>
              <th>Fecha Vencimiento</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.commercial.contratos.map(c => {
              const cli = db.terceros.find(t => t.id === c.terceroId) || { name: 'Desconocido' };
              
              let actionHtml = '';
              if (c.status === 'Borrador') {
                actionHtml = `<button class="btn btn-success btn-sm btn-activate-contract" data-id="${c.id}"><i class="fas fa-play"></i> Activar</button>`;
              } else if (c.status === 'Activo') {
                actionHtml = `<button class="btn btn-danger btn-sm btn-close-contract" data-id="${c.id}"><i class="fas fa-times"></i> Cerrar</button>`;
              } else {
                actionHtml = `<span class="text-muted" style="font-size:11.5px;"><i class="fas fa-lock"></i> Concluido</span>`;
              }

              return `
                <tr>
                  <td><code>${c.ref}</code></td>
                  <td><strong>${c.label}</strong></td>
                  <td><span style="font-weight:600; color:var(--primary);">${cli.name}</span></td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(c.monto_bs)}</td>
                  <td>${window.DolibarrUtils.formatDate(c.start_date)}</td>
                  <td>${window.DolibarrUtils.formatDate(c.end_date)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(c.status)}</td>
                  <td style="text-align: center; display:flex; gap:6px; justify-content:center;">${actionHtml}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: REGISTRAR CONTRATO -->
      <div class="modal-overlay" id="modal-contract-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-file-contract"></i> Registrar Contrato de Servicio</h3>
            <button class="modal-close" id="modal-contract-close">&times;</button>
          </div>
          <form id="form-nuevo-contrato">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="con-label">Descripción / Objeto del Contrato *</label>
                <input type="text" id="con-label" class="form-control" placeholder="Ej. Soporte SCADA y Mantenimiento Preventivo" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="con-cli">Asociar a Cliente *</label>
                  <select id="con-cli" class="form-control" required>
                    <option value="">-- Seleccionar --</option>
                    ${clientes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="con-monto">Monto de Cobertura (Bs.) *</label>
                  <input type="number" step="0.01" id="con-monto" class="form-control" placeholder="0.00" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="con-start">Fecha Inicio Cobertura *</label>
                  <input type="date" id="con-start" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="con-end">Fecha Límite / Vencimiento *</label>
                  <input type="date" id="con-end" class="form-control" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-contract">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar en Borrador</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-contract-overlay');
    const openBtn = document.getElementById('btn-nuevo-contrato');
    const closeBtn = document.getElementById('modal-contract-close');
    const cancelBtn = document.getElementById('btn-cancel-contract');
    const form = document.getElementById('form-nuevo-contrato');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('con-start').valueAsDate = new Date();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Guardar contrato
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const label = document.getElementById('con-label').value;
      const clienteId = parseInt(document.getElementById('con-cli').value);
      const monto = parseFloat(document.getElementById('con-monto').value) || 0;
      const start = document.getElementById('con-start').value;
      const end = document.getElementById('con-end').value;

      const newCon = {
        id: window.DolibarrUtils.generateId(db.commercial.contratos),
        ref: `CON2606-${String(db.commercial.contratos.length + 1).padStart(3, '0')}`,
        terceroId: clienteId,
        label: label,
        monto_bs: monto,
        start_date: start,
        end_date: end,
        status: "Borrador"
      };

      db.commercial.contratos.push(newCon);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Contrato ${newCon.ref} creado en borrador.`, 'success');
      closeModal();
      this.renderContratos(container);
    });

    // Activar contrato
    document.querySelectorAll('.btn-activate-contract').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const con = db.commercial.contratos.find(c => c.id === id);
        if (con) {
          con.status = 'Activo';
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Contrato ${con.ref} puesto en vigencia (Activo).`, 'success');
          this.renderContratos(container);
        }
      });
    });

    // Cerrar contrato
    document.querySelectorAll('.btn-close-contract').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const con = db.commercial.contratos.find(c => c.id === id);
        if (con) {
          con.status = 'Cerrado';
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Contrato ${con.ref} finalizado.`, 'info');
          this.renderContratos(container);
        }
      });
    });
  },

  /**
   * Vista: Estadísticas Comerciales
   */
  renderEstadisticas: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/comercial">Comercial</a> <i class="fas fa-chevron-right"></i> <strong>Estadísticas</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-chart-line"></i> Estadísticas Comerciales Avanzadas</h1>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; margin-bottom: 24px;">
        
        <!-- Ratio de Conversión -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Conversión de Presupuestos Clientes</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 250px; position: relative;">
              <canvas id="chart-stats-conversion"></canvas>
            </div>
          </div>
        </div>

        <!-- Presupuestos de Proveedores -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar"></i> Comparativa de Cotizaciones de Proveedores</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 250px; position: relative;">
              <canvas id="chart-stats-proveedores"></canvas>
            </div>
          </div>
        </div>

      </div>

      <!-- Ventas Mensuales -->
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-chart-area"></i> Comparativa Mensual: Montos Cotizados vs Pedidos Cerrados</div>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height: 280px; position: relative;">
            <canvas id="chart-stats-ventas-mes"></canvas>
          </div>
        </div>
      </div>
    `;

    // Cargar Gráficos
    setTimeout(() => {
      if (typeof Chart !== 'undefined' && window.DolibarrCharts) {
        
        // 1. Ratio Conversión
        const presStates = { Borrador: 0, Validado: 0, Aceptado: 0, Rechazado: 0 };
        db.commercial.presupuestos.forEach(p => {
          if (presStates[p.status] !== undefined) presStates[p.status]++;
        });
        window.DolibarrCharts.createDoughnut('chart-stats-conversion', 
          Object.keys(presStates).map(k => `${k} (${presStates[k]})`), 
          Object.values(presStates),
          ['#7F8C8D', '#3498DB', '#2CB57E', '#E74C3C']
        );

        // 2. Cotizaciones Proveedores
        const provTotals = {};
        db.commercial.presupuestos_proveedor.forEach(p => {
          const prov = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
          if (!provTotals[prov.name]) provTotals[prov.name] = 0;
          provTotals[prov.name] += p.total_ttc;
        });
        window.DolibarrCharts.createBar('chart-stats-proveedores', 
          Object.keys(provTotals),
          [{
            label: 'Total Cotizado por Proveedor (Bs.)',
            data: Object.values(provTotals),
            backgroundColor: '#F39C12',
            borderRadius: 6
          }]
        );

        // 3. Ventas por Mes
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const cotizados = [30000, 45000, 60000, 20000, 110000, 40000];
        const confirmados = [25000, 30000, 50000, 15000, 95000, 20000];

        window.DolibarrCharts.createBar('chart-stats-ventas-mes', 
          months,
          [
            {
              label: 'Presupuestos Enviados (Bs.)',
              data: cotizados,
              backgroundColor: 'rgba(58, 120, 212, 0.7)',
              borderRadius: 4
            },
            {
              label: 'Pedidos Confirmados (Bs.)',
              data: confirmados,
              backgroundColor: 'rgba(44, 181, 126, 0.8)',
              borderRadius: 4
            }
          ]
        );
      }
    }, 100);
  },

  /**
   * Presupuestos de Proveedor (Read Only)
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
   * Pedidos de Proveedor (Read Only)
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
window.DolibarrModules.comercial = window.DolibarrModules.comercial;
