/**
 * productos.js - Módulo de Productos, Servicios e Inventarios (Almacenes)
 * Prototipo Dolibarr ERP v23.0.1 - Rediseño Premium
 */

window.DolibarrModules.productos = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inyectar estilos personalizados
    this.injectStyles();
    
    if (subRoute === 'lista') {
      this.renderProductList(mainContent, false);
    } else if (subRoute === 'nuevo') {
      this.renderProductList(mainContent, true);
    } else if (subRoute === 'lista-servicios') {
      this.renderServiceList(mainContent, false);
    } else if (subRoute === 'nuevo-servicio') {
      this.renderServiceList(mainContent, true);
    } else if (subRoute === 'almacenes') {
      this.renderWarehouses(mainContent, params);
    } else if (subRoute === 'transferencias') {
      this.renderTransferencias(mainContent);
    } else if (subRoute === 'inventarios') {
      this.renderInventarios(mainContent, params);
    } else if (subRoute === 'envios') {
      this.renderEnvios(mainContent);
    } else if (subRoute === 'estadisticas') {
      this.renderEstadisticas(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Inyección dinámica de hojas de estilo
   */
  injectStyles: function() {
    const styleId = 'productos-custom-premium-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .prod-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        display: inline-block;
        text-align: center;
      }
      .prod-badge-ok { background: #C6F6D5; color: #22543D; }
      .prod-badge-critico { background: #FEFCBF; color: #744210; }
      .prod-badge-sinstock { background: #FED7D7; color: #742A2A; }
      .prod-badge-validado { background: #C6F6D5; color: #22543D; }
      .prod-badge-borrador { background: #E2E8F0; color: #4A5568; }

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
      
      .cursor-pointer-row {
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Vista: Dashboard de Inventarios
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Conteo y valoración de productos
    const prodsFisicos = db.products.filter(p => p.type === 'producto');
    const servicios = db.products.filter(p => p.type === 'servicio');
    
    const totalProds = prodsFisicos.length;
    const totalServs = servicios.length;
    
    const stockTotal = prodsFisicos.reduce((acc, p) => acc + (p.stock || 0), 0);
    const valoracionInventario = prodsFisicos.reduce((acc, p) => acc + ((p.stock || 0) * (p.cost || 0)), 0);

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Productos</span> <i class="fas fa-chevron-right"></i> <strong>Resumen Stock</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-boxes-stacked"></i> Resumen de Productos y Servicios</h1>
      </div>

      <!-- Widgets estadísticos -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/productos/lista'">
          <div class="wb-icon"><i class="fas fa-box"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalProds}</div>
            <div class="wb-label">Productos Físicos</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/productos/lista-servicios'">
          <div class="wb-icon"><i class="fas fa-hand-holding-hand"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalServs}</div>
            <div class="wb-label">Servicios en Catálogo</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/productos/almacenes'">
          <div class="wb-icon"><i class="fas fa-warehouse"></i></div>
          <div class="wb-details">
            <div class="wb-count">${stockTotal}</div>
            <div class="wb-label">Unidades en Stock</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/productos/almacenes'">
          <div class="wb-icon"><i class="fas fa-coins"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px;">
              ${window.DolibarrUtils.formatCurrency(valoracionInventario)}
            </div>
            <div class="wb-label">Valoración Inventario (Bs.)</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <!-- Gráfico de Stock -->
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución de Stock por Producto</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-productos-stock"></canvas>
            </div>
          </div>
        </div>

        <!-- Almacenes Principales -->
        <div>
          <div class="card glass-card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-map-location-dot"></i> Almacenes Físicos</div>
              <a href="#/productos/almacenes" style="font-size:12px;">Ver detalles</a>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Almacén</th>
                    <th>Ubicación</th>
                    <th style="text-align: right;">Cant. Stock</th>
                  </tr>
                </thead>
                <tbody>
                  ${db.warehouses.map(w => {
                    const count = db.warehouse_stocks.filter(s => s.warehouseId === w.id).reduce((sum, s) => sum + s.qty, 0);
                    return `
                      <tr onclick="window.location.hash='#/productos/almacenes?id=${w.id}'" class="cursor-pointer-row">
                        <td><strong>${w.label}</strong></td>
                        <td><small class="text-muted">${w.location}</small></td>
                        <td style="text-align: right;" class="font-semibold">${count} uds</td>
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

    // Renderizar gráfico de rosquilla
    if (typeof Chart !== 'undefined' && prodsFisicos.length > 0) {
      const labels = prodsFisicos.map(p => p.code);
      const stocks = prodsFisicos.map(p => p.stock);
      window.DolibarrCharts.createDoughnut('chart-productos-stock', labels, stocks);
    }
  },

  /**
   * Vista: Listado de Productos Físicos
   */
  renderProductList: function(container, openModal = false) {
    const db = window.DolibarrDB.get();
    const prods = db.products.filter(p => p.type === 'producto');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> <strong>Listado Productos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-box"></i> Catálogo de Productos</h1>
        <button id="btn-nuevo-prod" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Producto
        </button>
      </div>

      <!-- Filtros -->
      <div class="card glass-card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-prod" class="form-control" placeholder="Buscar por código o etiqueta..." style="width: 280px;">
              <select id="filter-stock-prod" class="form-control" style="width: 180px;">
                <option value="todos">-- Todos los stocks --</option>
                <option value="critico">Stock Crítico (<= Mín)</option>
                <option value="sinstock">Sin Stock (Agotado)</option>
              </select>
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-prod-rows">
              Mostrando ${prods.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Etiqueta / Detalle</th>
              <th style="text-align: right;">Precio Venta</th>
              <th style="text-align: right;">Costo Compra</th>
              <th style="text-align: right;">Stock Físico</th>
              <th style="text-align: right;">Mín. Requerido</th>
              <th style="text-align: center;">Estado Alerta</th>
              <th style="text-align: center;">Stock por Almacén</th>
            </tr>
          </thead>
          <tbody id="tbody-productos">
            <!-- Dinámico -->
          </tbody>
        </table>
      </div>

      <!-- MODAL: REGISTRAR PRODUCTO -->
      <div class="modal-overlay" id="modal-prod-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus-circle"></i> Agregar Nuevo Producto</h3>
            <button class="modal-close" id="modal-prod-close">&times;</button>
          </div>
          <form id="form-nuevo-prod">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="p-code">Referencia / Código *</label>
                <input type="text" id="p-code" class="form-control" placeholder="Ej. PROD-BOM-002" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="p-label">Etiqueta / Nombre del Producto *</label>
                <input type="text" id="p-label" class="form-control" placeholder="Ej. Bomba Centrifuga Industrial" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="p-price">Precio Venta Público (Bs) *</label>
                  <input type="number" step="0.01" id="p-price" class="form-control" placeholder="0.00" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="p-cost">Costo de Adquisición (Bs) *</label>
                  <input type="number" step="0.01" id="p-cost" class="form-control" placeholder="0.00" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="p-stock">Stock Inicial (El Alto) *</label>
                  <input type="number" id="p-stock" class="form-control" value="0" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="p-min">Stock Mínimo de Alerta *</label>
                  <input type="number" id="p-min" class="form-control" value="5" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="p-desc">Descripción Técnica</label>
                <textarea id="p-desc" class="form-control" rows="3" placeholder="Detalles técnicos del producto..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-prod">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Producto</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: DETALLE MULTI-ALMACEN -->
      <div class="modal-overlay" id="modal-stock-details-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-warehouse"></i> Existencias por Almacén</h3>
            <button class="modal-close" onclick="document.getElementById('modal-stock-details-overlay').classList.remove('show')">&times;</button>
          </div>
          <div class="modal-body" id="stock-details-body">
            <!-- Rellenado dinámicamente -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-stock-details-overlay').classList.remove('show')">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    // Render Inicial
    this.filterProductos(prods);

    // Eventos de Modal
    const modal = document.getElementById('modal-prod-overlay');
    const openBtn = document.getElementById('btn-nuevo-prod');
    const closeBtn = document.getElementById('modal-prod-close');
    const cancelBtn = document.getElementById('btn-cancel-prod');
    const form = document.getElementById('form-nuevo-prod');

    const openModalFunc = () => {
      form.reset();
      modal.classList.add('show');
    };

    const closeModalFunc = () => {
      modal.classList.remove('show');
    };

    openBtn.addEventListener('click', openModalFunc);
    closeBtn.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);

    if (openModal) openModalFunc();

    // Filtros dinámicos
    const searchInput = document.getElementById('filter-search-prod');
    const stockSelect = document.getElementById('filter-stock-prod');

    const triggerFilter = () => {
      const query = searchInput.value.toLowerCase().trim();
      const stockFilter = stockSelect.value;

      const filtered = prods.filter(p => {
        const matchesSearch = p.code.toLowerCase().includes(query) || p.label.toLowerCase().includes(query);
        let matchesStock = true;
        if (stockFilter === 'critico') {
          matchesStock = p.stock <= p.minStock;
        } else if (stockFilter === 'sinstock') {
          matchesStock = p.stock === 0;
        }
        return matchesSearch && matchesStock;
      });

      this.filterProductos(filtered);
    };

    searchInput.addEventListener('input', triggerFilter);
    stockSelect.addEventListener('change', triggerFilter);

    // Guardado
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newProduct = {
        id: window.DolibarrUtils.generateId(db.products),
        code: document.getElementById('p-code').value.toUpperCase().trim(),
        label: document.getElementById('p-label').value,
        type: 'producto',
        price: parseFloat(document.getElementById('p-price').value),
        cost: parseFloat(document.getElementById('p-cost').value),
        stock: parseInt(document.getElementById('p-stock').value) || 0,
        minStock: parseInt(document.getElementById('p-min').value) || 0,
        description: document.getElementById('p-desc').value || '-'
      };

      db.products.push(newProduct);
      
      // Stock inicial en Almacén 1
      if (newProduct.stock > 0) {
        db.warehouse_stocks.push({
          productId: newProduct.id,
          warehouseId: 1,
          qty: newProduct.stock
        });

        // Registrar movimiento
        db.stock_movimientos.push({
          id: window.DolibarrUtils.generateId(db.stock_movimientos),
          productId: newProduct.id,
          originWarehouseId: null,
          targetWarehouseId: 1,
          qty: newProduct.stock,
          type: "Entrada Inicial",
          date: new Date().toISOString().split('T')[0]
        });
      }

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Producto "${newProduct.label}" agregado correctamente.`, 'success');
      closeModalFunc();

      this.renderProductList(container, false);
    });
  },

  /**
   * Imprime filas de productos
   */
  filterProductos: function(list) {
    const tbody = document.getElementById('tbody-productos');
    const countLabel = document.getElementById('count-prod-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="8" class="text-center text-muted" style="padding:30px;">No hay productos con los filtros seleccionados.</td></tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(p => {
      let statusHtml = '';
      if (p.stock === 0) {
        statusHtml = `<span class="prod-badge prod-badge-sinstock">Sin Stock</span>`;
      } else if (p.stock <= p.minStock) {
        statusHtml = `<span class="prod-badge prod-badge-critico">Crítico</span>`;
      } else {
        statusHtml = `<span class="prod-badge prod-badge-ok">Disponible</span>`;
      }

      return `
        <tr>
          <td><code>${p.code}</code></td>
          <td><strong>${p.label}</strong><br><small class="text-muted">${p.description}</small></td>
          <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.price)}</td>
          <td style="text-align: right;" class="text-muted">${window.DolibarrUtils.formatCurrency(p.cost)}</td>
          <td style="text-align: right;" class="font-semibold">${p.stock}</td>
          <td style="text-align: right;" class="text-muted">${p.minStock}</td>
          <td style="text-align: center;">${statusHtml}</td>
          <td style="text-align: center;">
            <button class="btn btn-secondary btn-sm" onclick="window.DolibarrModules.productos.showStockDetails(${p.id})">
              <i class="fas fa-list-ol"></i> Ver desglose
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Modal: Ver Desglose por Almacén
   */
  showStockDetails: function(productId) {
    const db = window.DolibarrDB.get();
    const prod = db.products.find(p => p.id === productId);
    if (!prod) return;

    const stocks = db.warehouse_stocks.filter(s => s.productId === productId);
    const body = document.getElementById('stock-details-body');

    let html = `
      <div style="margin-bottom:15px;">
        <strong>Producto:</strong> <code>${prod.code}</code> - ${prod.label}
      </div>
      <table class="table table-bordered" style="font-size:13px;">
        <thead>
          <tr>
            <th>Almacén / Depósito</th>
            <th>Ubicación</th>
            <th style="text-align: right;">Cantidad Disponible</th>
            <th style="text-align: right;">Valorizado Costo (Bs)</th>
          </tr>
        </thead>
        <tbody>
          ${db.warehouses.map(w => {
            const s = stocks.find(st => st.warehouseId === w.id);
            const qty = s ? s.qty : 0;
            return `
              <tr>
                <td><strong>${w.label}</strong></td>
                <td><small class="text-muted">${w.location}</small></td>
                <td style="text-align: right;" class="font-semibold">${qty} unidades</td>
                <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(qty * prod.cost)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    body.innerHTML = html;
    document.getElementById('modal-stock-details-overlay').classList.add('show');
  },

  /**
   * Vista: Catálogo de Servicios
   */
  renderServiceList: function(container, openModal = false) {
    const db = window.DolibarrDB.get();
    const servs = db.products.filter(p => p.type === 'servicio');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> <strong>Catálogo de Servicios</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-hand-holding-hand"></i> Servicios en Catálogo</h1>
        <button id="btn-nuevo-serv" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Servicio
        </button>
      </div>

      <!-- Filtros -->
      <div class="card glass-card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-serv" class="form-control" placeholder="Buscar servicios..." style="width: 280px;">
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-serv-rows">
              Mostrando ${servs.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Etiqueta / Tarea</th>
              <th>Descripción</th>
              <th style="text-align: right;">Tarifa Hora/Día</th>
              <th style="text-align: right;">Costo Interno</th>
            </tr>
          </thead>
          <tbody id="tbody-servicios">
            <!-- Dinámico -->
          </tbody>
        </table>
      </div>

      <!-- MODAL: REGISTRAR SERVICIO -->
      <div class="modal-overlay" id="modal-serv-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus-circle"></i> Agregar Nuevo Servicio</h3>
            <button class="modal-close" id="modal-serv-close">&times;</button>
          </div>
          <form id="form-nuevo-serv">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="s-code">Referencia de Servicio *</label>
                <input type="text" id="s-code" class="form-control" placeholder="Ej. SERV-MANT-003" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="s-label">Etiqueta del Servicio *</label>
                <input type="text" id="s-label" class="form-control" placeholder="Ej. Mantenimiento Preventivo Calderas" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="s-price">Tarifa Venta Público (Bs) *</label>
                  <input type="number" step="0.01" id="s-price" class="form-control" placeholder="0.00" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="s-cost">Costo de Prestación (Bs) *</label>
                  <input type="number" step="0.01" id="s-cost" class="form-control" placeholder="0.00" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="s-desc">Descripción Operativa</label>
                <textarea id="s-desc" class="form-control" rows="4" placeholder="Especificar actividades incluidas..." required></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-serv">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Servicio</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.filterServicios(servs);

    const modal = document.getElementById('modal-serv-overlay');
    const openBtn = document.getElementById('btn-nuevo-serv');
    const closeBtn = document.getElementById('modal-serv-close');
    const cancelBtn = document.getElementById('btn-cancel-serv');
    const form = document.getElementById('form-nuevo-serv');

    const openModalFunc = () => {
      form.reset();
      modal.classList.add('show');
    };

    const closeModalFunc = () => {
      modal.classList.remove('show');
    };

    openBtn.addEventListener('click', openModalFunc);
    closeBtn.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);

    if (openModal) openModalFunc();

    const searchInput = document.getElementById('filter-search-serv');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const filtered = servs.filter(s => s.code.toLowerCase().includes(query) || s.label.toLowerCase().includes(query));
      this.filterServicios(filtered);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newService = {
        id: window.DolibarrUtils.generateId(db.products),
        code: document.getElementById('s-code').value.toUpperCase().trim(),
        label: document.getElementById('s-label').value,
        type: 'servicio',
        price: parseFloat(document.getElementById('s-price').value),
        cost: parseFloat(document.getElementById('s-cost').value),
        stock: 0,
        minStock: 0,
        description: document.getElementById('s-desc').value
      };

      db.products.push(newService);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Servicio "${newService.label}" guardado con éxito.`, 'success');
      closeModalFunc();

      this.renderServiceList(container, false);
    });
  },

  /**
   * Imprime servicios
   */
  filterServicios: function(list) {
    const tbody = document.getElementById('tbody-servicios');
    const countLabel = document.getElementById('count-serv-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:30px;">No se encontraron servicios.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr>
        <td><code>${s.code}</code></td>
        <td><strong>${s.label}</strong></td>
        <td><span class="text-muted" style="font-size:12px;">${s.description}</span></td>
        <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(s.price)}</td>
        <td style="text-align: right;" class="text-muted">${window.DolibarrUtils.formatCurrency(s.cost)}</td>
      </tr>
    `).join('');
  },

  /**
   * Vista: Almacenes e Inventarios Detallados (`#/productos/almacenes`)
   */
  renderWarehouses: function(container, params) {
    const db = window.DolibarrDB.get();

    // Caso A: Mostrar ficha de almacén específica (?id=X)
    if (params && params.id) {
      const warehouseId = parseInt(params.id);
      const w = db.warehouses.find(item => item.id === warehouseId);
      if (!w) {
        container.innerHTML = `<div class="alert alert-danger">Error: Almacén no encontrado.</div>`;
        return;
      }

      // Detalle de stock
      const stocks = db.warehouse_stocks.filter(s => s.warehouseId === w.id);
      const totalUnits = stocks.reduce((sum, s) => sum + s.qty, 0);
      const totalValuation = stocks.reduce((sum, s) => {
        const prod = db.products.find(p => p.id === s.productId) || { cost: 0 };
        return sum + (s.qty * prod.cost);
      }, 0);

      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> 
          <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> 
          <a href="#/productos/almacenes">Almacenes</a> <i class="fas fa-chevron-right"></i> 
          <strong>Ficha de Almacén ALM-${w.id}</strong>
        </div>

        <div class="page-header">
          <h1 class="page-title"><i class="fa-solid fa-warehouse"></i> Ficha de Almacén: ${w.label}</h1>
          <button onclick="window.location.hash='#/productos/almacenes'" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Volver a Lista
          </button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 2fr; gap:24px;">
          
          <!-- Ficha Resumen -->
          <div class="card glass-card">
            <div class="card-header">
              <div class="card-title">Resumen de Almacén</div>
            </div>
            <div class="card-body">
              <table class="table table-bordered" style="font-size:13px; margin:0;">
                <tbody>
                  <tr>
                    <th>Nombre</th>
                    <td><strong>${w.label}</strong></td>
                  </tr>
                  <tr>
                    <th>Ubicación</th>
                    <td>${w.location}</td>
                  </tr>
                  <tr>
                    <th>Descripción</th>
                    <td><span class="text-muted">${w.description || 'Sin descripción'}</span></td>
                  </tr>
                  <tr>
                    <th>Unidades Totales</th>
                    <td><span class="font-semibold text-primary">${totalUnits} uds</span></td>
                  </tr>
                  <tr>
                    <th>Valoración Inventario</th>
                    <td><span class="font-semibold text-success">${window.DolibarrUtils.formatCurrency(totalValuation)}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tabla de Artículos -->
          <div class="card glass-card">
            <div class="card-header">
              <div class="card-title">Artículos en Existencia</div>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-striped table-hover" style="font-size:13px; margin:0;">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th style="text-align: right;">Cantidad</th>
                    <th style="text-align: right;">Costo Compra</th>
                    <th style="text-align: right;">Valor Consolidado</th>
                  </tr>
                </thead>
                <tbody>
                  ${stocks.map(s => {
                    const prod = db.products.find(p => p.id === s.productId) || { code: 'N/A', label: 'Desconocido', cost: 0 };
                    return `
                      <tr>
                        <td><code>${prod.code}</code></td>
                        <td><strong>${prod.label}</strong></td>
                        <td style="text-align: right;" class="font-semibold">${s.qty} uds</td>
                        <td style="text-align: right; color:#7F8C8D;">${window.DolibarrUtils.formatCurrency(prod.cost)}</td>
                        <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(s.qty * prod.cost)}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${stocks.length === 0 ? `<tr><td colspan="5" class="text-center text-muted" style="padding:16px;">Este almacén se encuentra vacío actualmente.</td></tr>` : ''}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    } 
    // Caso B: Listado General de Almacenes
    else {
      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> <strong>Almacenes</strong>
        </div>

        <div class="page-header">
          <h1 class="page-title"><i class="fa-solid fa-warehouse"></i> Centros de Distribución y Almacenes</h1>
          <button id="btn-nuevo-alm" class="btn btn-primary">
            <i class="fas fa-plus"></i> Registrar Almacén
          </button>
        </div>

        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Almacén</th>
                <th>Dirección / Ubicación Física</th>
                <th style="text-align: right;">Suma de Artículos</th>
                <th style="text-align: right;">Valoración Estimada (Bs)</th>
                <th style="text-align: center;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${db.warehouses.map(w => {
                const stocks = db.warehouse_stocks.filter(s => s.warehouseId === w.id);
                const totalUnits = stocks.reduce((sum, s) => sum + s.qty, 0);
                const totalValuation = stocks.reduce((sum, s) => {
                  const prod = db.products.find(p => p.id === s.productId) || { cost: 0 };
                  return sum + (s.qty * prod.cost);
                }, 0);

                return `
                  <tr onclick="window.location.hash='#/productos/almacenes?id=${w.id}'" class="cursor-pointer-row">
                    <td><code>ALM-00${w.id}</code></td>
                    <td><strong>${w.label}</strong><br><small class="text-muted">${w.description || ''}</small></td>
                    <td><span class="text-muted"><i class="fas fa-map-marker-alt" style="color:var(--primary); font-size:12px; margin-right:4px;"></i>${w.location}</span></td>
                    <td style="text-align: right;" class="font-semibold">${totalUnits} unidades</td>
                    <td style="text-align: right;" class="font-semibold text-primary">
                      ${window.DolibarrUtils.formatCurrency(totalValuation)}
                    </td>
                    <td style="text-align: center;" onclick="event.stopPropagation()">
                      <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#/productos/almacenes?id=${w.id}'">
                        <i class="fas fa-eye"></i> Ficha
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- MODAL: REGISTRAR ALMACÉN -->
        <div class="modal-overlay" id="modal-alm-overlay">
          <div class="modal-container">
            <div class="modal-header">
              <h3 class="modal-title"><i class="fas fa-warehouse"></i> Registrar Nuevo Almacén</h3>
              <button class="modal-close" onclick="document.getElementById('modal-alm-overlay').classList.remove('show')">&times;</button>
            </div>
            <form id="form-nuevo-alm">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label" for="al-label">Nombre del Almacén *</label>
                  <input type="text" id="al-label" class="form-control" placeholder="Ej. Sucursal Cochabamba" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="al-location">Dirección / Ubicación Física *</label>
                  <input type="text" id="al-location" class="form-control" placeholder="Ej. Av. Blanco Galindo Km 4, Cochabamba" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="al-desc">Descripción / Finalidad</label>
                  <input type="text" id="al-desc" class="form-control" placeholder="Ej. Depósito local y distribución zonal">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-alm-overlay').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Registrar Almacén</button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Control Modal
      const modal = document.getElementById('modal-alm-overlay');
      const openBtn = document.getElementById('btn-nuevo-alm');
      const form = document.getElementById('form-nuevo-alm');

      if (openBtn) {
        openBtn.addEventListener('click', () => {
          form.reset();
          modal.classList.add('show');
        });
      }

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const newW = {
            id: window.DolibarrUtils.generateId(db.warehouses),
            label: document.getElementById('al-label').value,
            location: document.getElementById('al-location').value,
            description: document.getElementById('al-desc').value
          };

          db.warehouses.push(newW);
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast("Almacén registrado con éxito.", "success");
          modal.classList.remove('show');
          this.renderWarehouses(container, null);
        });
      }
    }
  },

  /**
   * Vista: Transferencias en Masa (`#/productos/transferencias`)
   */
  renderTransferencias: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> <strong>Transferencias</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-truck-ramp-box"></i> Transferencia de Stock entre Almacenes</h1>
      </div>

      <div class="card glass-card" style="max-width: 600px; margin: 0 auto;">
        <div class="card-header">
          <div class="card-title">Registrar Traspaso de Mercadería</div>
        </div>
        <form id="form-traspaso-stock">
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="t-origin">Almacén de Origen *</label>
                <select id="t-origin" class="form-control" required>
                  <option value="">-- Seleccionar --</option>
                  ${db.warehouses.map(w => `<option value="${w.id}">${w.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="t-target">Almacén de Destino *</label>
                <select id="t-target" class="form-control" required>
                  <option value="">-- Seleccionar --</option>
                  ${db.warehouses.map(w => `<option value="${w.id}">${w.label}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="t-prod">Producto a Transferir *</label>
                <select id="t-prod" class="form-control" required>
                  <option value="">-- Seleccionar --</option>
                  ${db.products.filter(p => p.type === 'producto').map(p => `<option value="${p.id}">${p.label} (Stock total: ${p.stock})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="t-qty">Cantidad *</label>
                <input type="number" id="t-qty" class="form-control" min="1" required>
              </div>
            </div>
            
            <div style="padding:10px; border-radius:4px; background:#EDF2F7; font-size:12px; margin-bottom:15px; display:none;" id="t-stock-disp">
              Stock disponible en origen: <strong id="lbl-stock-disp-val">0</strong> unidades.
            </div>
          </div>
          <div class="card-footer" style="text-align:right;">
            <button type="submit" class="btn btn-primary"><i class="fas fa-exchange-alt"></i> Confirmar Transferencia</button>
          </div>
        </form>
      </div>
    `;

    const selectOrigin = document.getElementById('t-origin');
    const selectProd = document.getElementById('t-prod');
    const divDisp = document.getElementById('t-stock-disp');
    const lblDisp = document.getElementById('lbl-stock-disp-val');
    const inputQty = document.getElementById('t-qty');

    const updateDisp = () => {
      const originId = parseInt(selectOrigin.value);
      const prodId = parseInt(selectProd.value);
      if (originId && prodId) {
        const s = db.warehouse_stocks.find(st => st.warehouseId === originId && st.productId === prodId);
        const qty = s ? s.qty : 0;
        lblDisp.textContent = qty;
        inputQty.max = qty;
        divDisp.style.display = 'block';
      } else {
        divDisp.style.display = 'none';
      }
    };

    selectOrigin.addEventListener('change', updateDisp);
    selectProd.addEventListener('change', updateDisp);

    const form = document.getElementById('form-traspaso-stock');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const origin = parseInt(selectOrigin.value);
      const target = parseInt(document.getElementById('t-target').value);
      const productId = parseInt(selectProd.value);
      const qty = parseInt(inputQty.value) || 0;

      if (origin === target) {
        window.DolibarrUtils.showToast("El almacén de destino no puede ser igual al de origen.", "error");
        return;
      }

      const sOrigin = db.warehouse_stocks.find(st => st.warehouseId === origin && st.productId === productId);
      if (!sOrigin || sOrigin.qty < qty) {
        window.DolibarrUtils.showToast("Stock insuficiente en el almacén de origen.", "error");
        return;
      }

      // Traspaso
      sOrigin.qty -= qty;
      
      let sTarget = db.warehouse_stocks.find(st => st.warehouseId === target && st.productId === productId);
      if (!sTarget) {
        sTarget = { productId: productId, warehouseId: target, qty: 0 };
        db.warehouse_stocks.push(sTarget);
      }
      sTarget.qty += qty;

      // Movimiento log
      const movId = window.DolibarrUtils.generateId(db.stock_movimientos);
      db.stock_movimientos.push({
        id: movId,
        productId: productId,
        originWarehouseId: origin,
        targetWarehouseId: target,
        qty: qty,
        type: "Transferencia",
        date: new Date().toISOString().split('T')[0]
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Traspaso de stock procesado con éxito.", "success");
      form.reset();
      updateDisp();
    });
  },

  /**
   * Vista: Auditorías de Inventarios (`#/productos/inventarios`)
   */
  renderInventarios: function(container, params) {
    const db = window.DolibarrDB.get();

    // Caso A: Mostrar Ficha de Inventario / Auditoría (?id=X)
    if (params && params.id) {
      const invId = parseInt(params.id);
      const inv = db.inventarios.find(item => item.id === invId);
      if (!inv) {
        container.innerHTML = `<div class="alert alert-danger">Error: Auditoría de Inventario no encontrada.</div>`;
        return;
      }

      const w = db.warehouses.find(item => item.id === inv.warehouseId) || { label: 'Desconocido' };

      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> 
          <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> 
          <a href="#/productos/inventarios">Auditorías</a> <i class="fas fa-chevron-right"></i> 
          <strong>Auditoría INV-${inv.id}</strong>
        </div>

        <div class="page-header">
          <h1 class="page-title"><i class="fa-solid fa-clipboard-check"></i> Hoja de Conteo: INV-${inv.id}</h1>
          <div class="action-buttons-flex">
            <button onclick="window.location.hash='#/productos/inventarios'" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i> Volver a Lista
            </button>
            ${inv.status === 'Borrador' ? `
              <button class="btn btn-success" id="btn-validar-inv">
                <i class="fas fa-check-double"></i> Validar Auditoría
              </button>
            ` : ''}
          </div>
        </div>

        <div class="card glass-card" style="margin-bottom:24px;">
          <div class="card-body" style="padding:16px;">
            <table class="table table-bordered" style="font-size:13px; margin:0;">
              <tbody>
                <tr>
                  <th width="20%">Almacén Audito</th>
                  <td><strong>${w.label}</strong> <span class="text-muted">(${w.location})</span></td>
                  <th width="20%">Inspector</th>
                  <td><strong>${inv.inspector}</strong></td>
                </tr>
                <tr>
                  <th>Fecha Programada</th>
                  <td>${window.DolibarrUtils.formatDate(inv.date)}</td>
                  <th>Estado</th>
                  <td><span class="prod-badge prod-badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title">Existencias Teóricas vs Conteos Reales</div>
          </div>
          <div class="card-body">
            <form id="form-conteo-inventario">
              <table class="table table-striped" style="font-size:13px;">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th style="text-align: right;">Stock Teórico (Sistema)</th>
                    <th style="text-align: right; width: 180px;">Conteo Real (Físico)</th>
                    <th style="text-align: right;">Diferencia / Desfase</th>
                    <th style="text-align: center;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${inv.adjustments.map((adj, index) => {
                    const prod = db.products.find(p => p.id === adj.productId) || { code: 'N/A', label: 'Desconocido' };
                    const diff = adj.diff !== undefined ? adj.diff : 0;
                    
                    let diffColor = 'var(--text-body)';
                    if (diff < 0) diffColor = 'var(--danger)';
                    else if (diff > 0) diffColor = 'var(--success)';

                    return `
                      <tr>
                        <td><code>${prod.code}</code></td>
                        <td><strong>${prod.label}</strong></td>
                        <td style="text-align: right;" class="font-semibold">${adj.sysQty} uds</td>
                        <td style="text-align: right;">
                          ${inv.status === 'Borrador' ? `
                            <input type="number" class="form-control input-conteo-real" data-index="${index}" data-sys="${adj.sysQty}" value="${adj.physicalQty || adj.sysQty}" style="font-size:12px; padding:4px; text-align:right; width:120px; display:inline-block;" min="0">
                          ` : `
                            <strong class="font-semibold">${adj.physicalQty} uds</strong>
                          `}
                        </td>
                        <td style="text-align: right; font-weight:700; color:${diffColor};" class="lbl-diff-row" data-index="${index}">
                          ${diff > 0 ? '+' : ''}${diff} uds
                        </td>
                        <td style="text-align: center;">
                          <span class="prod-badge" id="badge-diff-row-${index}" style="background:${diff === 0 ? '#C6F6D5' : '#FED7D7'}; color:${diff === 0 ? '#22543D' : '#742A2A'};">
                            ${diff === 0 ? 'Sin novedad' : 'Desfase'}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </form>
          </div>
        </div>
      `;

      // Live updates to difference columns
      const inputs = document.querySelectorAll('.input-conteo-real');
      inputs.forEach(input => {
        const updateRow = () => {
          const index = parseInt(input.dataset.index);
          const sys = parseInt(input.dataset.sys);
          const real = parseInt(input.value) || 0;
          const diff = real - sys;

          const lblDiff = document.querySelector(`.lbl-diff-row[data-index="${index}"]`);
          const badge = document.getElementById(`badge-diff-row-${index}`);
          
          if (lblDiff && badge) {
            lblDiff.textContent = `${diff > 0 ? '+' : ''}${diff} uds`;
            if (diff < 0) {
              lblDiff.style.color = 'var(--danger)';
              badge.style.background = '#FED7D7';
              badge.style.color = '#742A2A';
              badge.textContent = 'Faltante';
            } else if (diff > 0) {
              lblDiff.style.color = 'var(--success)';
              badge.style.background = '#FED7D7';
              badge.style.color = '#742A2A';
              badge.textContent = 'Sobrante';
            } else {
              lblDiff.style.color = 'var(--text-body)';
              badge.style.background = '#C6F6D5';
              badge.style.color = '#22543D';
              badge.textContent = 'Sin novedad';
            }
          }
        };

        input.addEventListener('input', updateRow);
      });

      // Validar Auditoría (Aplica ajuste de stock)
      const btnValidar = document.getElementById('btn-validar-inv');
      if (btnValidar) {
        btnValidar.addEventListener('click', () => {
          // Re-leer inputs
          const conteos = document.querySelectorAll('.input-conteo-real');
          conteos.forEach(input => {
            const index = parseInt(input.dataset.index);
            const realVal = parseInt(input.value) || 0;
            const adj = inv.adjustments[index];
            
            adj.physicalQty = realVal;
            adj.diff = realVal - adj.sysQty;

            // Ajustar stocks en DB
            const prod = db.products.find(p => p.id === adj.productId);
            const sW = db.warehouse_stocks.find(st => st.warehouseId === inv.warehouseId && st.productId === adj.productId);
            
            if (adj.diff !== 0) {
              if (sW) sW.qty = realVal;
              if (prod) {
                prod.stock = (prod.stock || 0) + adj.diff;
              }

              // Registrar en bitácora movimientos
              db.stock_movimientos.push({
                id: window.DolibarrUtils.generateId(db.stock_movimientos),
                productId: adj.productId,
                originWarehouseId: adj.diff < 0 ? inv.warehouseId : null,
                targetWarehouseId: adj.diff > 0 ? inv.warehouseId : null,
                qty: Math.abs(adj.diff),
                type: "Ajuste de Inventario",
                date: new Date().toISOString().split('T')[0]
              });
            }
          });

          inv.status = "Validado";
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast("Conteo de inventario validado. Stocks del sistema reajustados.", "success");
          this.renderInventarios(container, params);
        });
      }

    } 
    // Caso B: Listado de auditorías
    else {
      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> <strong>Auditorías</strong>
        </div>

        <div class="page-header">
          <h1 class="page-title"><i class="fa-solid fa-clipboard-check"></i> Auditorías Físicas de Inventarios</h1>
          <button id="btn-nueva-aud" class="btn btn-primary">
            <i class="fas fa-plus"></i> Programar Auditoría
          </button>
        </div>

        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Almacén Audito</th>
                <th>Inspector Encargado</th>
                <th>Fecha Programada</th>
                <th>Ajustes de Productos</th>
                <th style="text-align: center;">Estado</th>
                <th style="text-align: center;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${(db.inventarios || []).map(i => {
                const w = db.warehouses.find(item => item.id === i.warehouseId) || { label: 'Desconocido' };
                return `
                  <tr onclick="window.location.hash='#/productos/inventarios?id=${i.id}'" class="cursor-pointer-row">
                    <td><code>${i.ref}</code></td>
                    <td><strong>${w.label}</strong></td>
                    <td>${i.inspector}</td>
                    <td>${window.DolibarrUtils.formatDate(i.date)}</td>
                    <td><span class="text-muted" style="font-size:12px;">${i.adjustments.length} productos controlados</span></td>
                    <td style="text-align: center;"><span class="prod-badge prod-badge-${i.status.toLowerCase()}">${i.status}</span></td>
                    <td style="text-align: center;" onclick="event.stopPropagation()">
                      <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#/productos/inventarios?id=${i.id}'">
                        <i class="fas fa-eye"></i> Ver Hoja
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- MODAL: NUEVA AUDITORÍA -->
        <div class="modal-overlay" id="modal-aud-overlay">
          <div class="modal-container">
            <div class="modal-header">
              <h3 class="modal-title"><i class="fas fa-clipboard-check"></i> Programar Conteo de Inventario</h3>
              <button class="modal-close" onclick="document.getElementById('modal-aud-overlay').classList.remove('show')">&times;</button>
            </div>
            <form id="form-nueva-aud">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label" for="au-warehouse">Elegir Almacén a Auditar *</label>
                  <select id="au-warehouse" class="form-control" required>
                    <option value="">-- Seleccionar --</option>
                    ${db.warehouses.map(w => `<option value="${w.id}">${w.label}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="au-inspector">Inspector Encargado *</label>
                  <input type="text" id="au-inspector" class="form-control" required placeholder="Ej. Alejandro Mamani">
                </div>

                <div class="form-group">
                  <label class="form-label" for="au-date">Fecha de Control *</label>
                  <input type="date" id="au-date" class="form-control" required>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-aud-overlay').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Crear Hoja de Conteo</button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Control modal
      const modal = document.getElementById('modal-aud-overlay');
      const openBtn = document.getElementById('btn-nueva-aud');
      const form = document.getElementById('form-nueva-aud');

      if (openBtn) {
        openBtn.addEventListener('click', () => {
          form.reset();
          document.getElementById('au-date').valueAsDate = new Date();
          modal.classList.add('show');
        });
      }

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const wId = parseInt(document.getElementById('au-warehouse').value);
          const inspector = document.getElementById('au-inspector').value;
          const date = document.getElementById('au-date').value;

          // Recopilar productos en este almacén para el borrador
          const stocks = db.warehouse_stocks.filter(s => s.warehouseId === wId);
          const adjustments = stocks.map(s => {
            return {
              productId: s.productId,
              sysQty: s.qty,
              physicalQty: s.qty,
              diff: 0
            };
          });

          const newInv = {
            id: window.DolibarrUtils.generateId(db.inventarios),
            ref: `INV2606-${String(db.inventarios.length + 1).padStart(3,'0')}`,
            warehouseId: wId,
            inspector: inspector,
            date: date,
            status: "Borrador",
            adjustments: adjustments
          };

          db.inventarios.push(newInv);
          window.DolibarrDB.save(db);
          modal.classList.remove('show');
          
          window.location.hash = `#/productos/inventarios?id=${newInv.id}`;
        });
      }
    }
  },

  /**
   * Vista: Gestión de Despachos y Envíos (`#/productos/envios`)
   */
  renderEnvios: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> <strong>Despachos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-truck-fast"></i> Guías de Envío y Despachos de Mercadería</h1>
        <button id="btn-nuevo-envio" class="btn btn-primary">
          <i class="fas fa-truck-fast"></i> Registrar Envío
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID Guía</th>
              <th>Pedido Relacionado</th>
              <th>Destinatario / Cliente</th>
              <th>Fecha Despacho</th>
              <th>Transportadora</th>
              <th>Código de Rastreo</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${(db.envios || []).map(env => `
              <tr>
                <td><code>${env.ref}</code></td>
                <td><code>${env.orderRef}</code></td>
                <td><strong>${env.clientName}</strong></td>
                <td>${window.DolibarrUtils.formatDate(env.date)}</td>
                <td><span class="text-muted"><i class="fas fa-truck"></i> ${env.method}</span></td>
                <td><code>${env.tracking}</code></td>
                <td style="text-align: center;"><span class="prod-badge prod-badge-validado">${env.status}</span></td>
              </tr>
            `).join('')}
            ${(!db.envios || db.envios.length === 0) ? `<tr><td colspan="7" class="text-center text-muted" style="padding:16px;">No hay envíos registrados.</td></tr>` : ''}
          </tbody>
        </table>
      </div>

      <!-- MODAL: REGISTRAR ENVÍO -->
      <div class="modal-overlay" id="modal-envio-overlay">
        <div class="modal-container" style="max-width: 600px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-truck-fast"></i> Registrar Envío / Despacho</h3>
            <button class="modal-close" onclick="document.getElementById('modal-envio-overlay').classList.remove('show')">&times;</button>
          </div>
          <form id="form-nuevo-envio">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="e-order">Seleccionar Pedido de Ventas *</label>
                <select id="e-order" class="form-control" required>
                  <option value="">-- Seleccionar Pedido Pendiente --</option>
                  ${db.commercial.pedidos.filter(p => p.status !== 'Entregado').map(p => {
                    const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Cliente' };
                    return `<option value="${p.id}" data-ref="${p.ref}" data-client="${cli.name}">${p.ref} - ${cli.name} (Total: ${p.total_ttc} Bs)</option>`;
                  }).join('')}
                </select>
              </div>

              <!-- Detalle de líneas a enviar -->
              <div id="e-order-lines-preview" style="padding: 10px; background:#EDF2F7; border-radius:4px; margin-bottom:15px; font-size:12px; display:none;">
                <div style="font-weight:700; margin-bottom:6px;">Artículos a despachar:</div>
                <ul id="e-lines-list" style="margin:0; padding-left:15px;"></ul>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-method">Transportadora / Método *</label>
                  <input type="text" id="e-method" class="form-control" placeholder="Ej. Courier Bolivia, Camión Propio" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="e-tracking">Número de Guía / Tracking *</label>
                  <input type="text" id="e-tracking" class="form-control" placeholder="Ej. TRK-LP-998822" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-envio-overlay').classList.remove('show')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Confirmar y Descontar Stock</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-envio-overlay');
    const btnOpen = document.getElementById('btn-nuevo-envio');
    const form = document.getElementById('form-nuevo-envio');
    const selectOrder = document.getElementById('e-order');
    const previewDiv = document.getElementById('e-order-lines-preview');
    const previewList = document.getElementById('e-lines-list');

    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        form.reset();
        previewDiv.style.display = 'none';
        modal.classList.add('show');
      });
    }

    if (selectOrder) {
      selectOrder.addEventListener('change', () => {
        const oId = parseInt(selectOrder.value);
        const order = db.commercial.pedidos.find(p => p.id === oId);
        
        if (order && order.lines) {
          previewList.innerHTML = order.lines.map(l => {
            const prod = db.products.find(p => p.id === l.productId) || { label: 'Desconocido' };
            return `<li><strong>${l.qty} uds</strong> - ${prod.label}</li>`;
          }).join('');
          previewDiv.style.display = 'block';
        } else {
          previewDiv.style.display = 'none';
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const oId = parseInt(selectOrder.value);
        const method = document.getElementById('e-method').value;
        const tracking = document.getElementById('e-tracking').value;

        const order = db.commercial.pedidos.find(p => p.id === oId);
        if (!order) return;

        // Validar stock en Almacén Central (Almacén 1) antes de despachar
        let stockOk = true;
        order.lines.forEach(l => {
          const s = db.warehouse_stocks.find(st => st.warehouseId === 1 && st.productId === l.productId);
          if (!s || s.qty < l.qty) stockOk = false;
        });

        if (!stockOk) {
          window.DolibarrUtils.showToast("Stock insuficiente en el Almacén Central El Alto para completar el despacho.", "error");
          return;
        }

        // Descontar existencias
        order.lines.forEach(l => {
          const s = db.warehouse_stocks.find(st => st.warehouseId === 1 && st.productId === l.productId);
          s.qty -= l.qty;

          const prod = db.products.find(p => p.id === l.productId);
          if (prod) prod.stock -= l.qty;

          // Bitácora movimiento
          db.stock_movimientos.push({
            id: window.DolibarrUtils.generateId(db.stock_movimientos),
            productId: l.productId,
            originWarehouseId: 1,
            targetWarehouseId: null,
            qty: l.qty,
            type: "Venta / Despacho",
            date: new Date().toISOString().split('T')[0]
          });
        });

        // Registrar envío
        const selectedOpt = selectOrder.options[selectOrder.selectedIndex];
        const clientName = selectedOpt.dataset.client;
        const orderRef = selectedOpt.dataset.ref;

        const newEnv = {
          id: window.DolibarrUtils.generateId(db.envios),
          ref: `ENV2606-${String(db.envios.length + 1).padStart(3,'0')}`,
          orderRef: orderRef,
          clientName: clientName,
          date: new Date().toISOString().split('T')[0],
          method: method,
          tracking: tracking,
          status: "Entregado"
        };
        db.envios.push(newEnv);

        // Cambiar estado pedido
        order.status = "Entregado";

        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Despacho validado con éxito. Inventario físico actualizado.", "success");
        modal.classList.remove('show');
        this.renderEnvios(container);
      });
    }
  },

  /**
   * Vista: Estadísticas de Inventarios (`#/productos/estadisticas`)
   */
  renderEstadisticas: function(container) {
    const db = window.DolibarrDB.get();
    
    const totalMoves = db.stock_movimientos ? db.stock_movimientos.length : 0;
    const lowStockCount = db.products.filter(p => p.type === 'producto' && p.stock <= p.minStock).length;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> <strong>Estadísticas</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-chart-line"></i> Estadísticas y Auditoría de Stock</h1>
      </div>

      <div class="widget-grid" style="grid-template-columns: 1fr 1fr; margin-bottom:24px;">
        <div class="widget-box wb-warning" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-triangle-exclamation"></i></div>
          <div class="wb-details">
            <div class="wb-count text-warning">${lowStockCount} items</div>
            <div class="wb-label">Productos con Existencias Críticas</div>
          </div>
        </div>

        <div class="widget-box wb-info" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-history"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalMoves} movimientos</div>
            <div class="wb-label">Traspasos y Movimientos Históricos</div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
        
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-wallet"></i> Valoración Monetaria por Almacén (Bs)</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-est-almacenes"></canvas>
            </div>
          </div>
        </div>

        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-box-open"></i> Productos con Existencias más Críticas</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-est-criticos"></canvas>
            </div>
          </div>
        </div>

      </div>
    `;

    // Renderizar Gráficos
    if (typeof Chart !== 'undefined') {
      // 1. Gráfico Almacenes
      const labelsW = db.warehouses.map(w => w.label);
      const valsW = db.warehouses.map(w => {
        const stocks = db.warehouse_stocks.filter(s => s.warehouseId === w.id);
        return stocks.reduce((sum, s) => {
          const prod = db.products.find(p => p.id === s.productId) || { cost: 0 };
          return sum + s.qty * prod.cost;
        }, 0);
      });
      window.DolibarrCharts.createDoughnut('chart-est-almacenes', labelsW, valsW);

      // 2. Gráfico Existencias Críticas (Productos <= Stock Mínimo)
      const criticos = db.products.filter(p => p.type === 'producto' && p.stock <= p.minStock);
      const labelsC = criticos.map(p => p.code);
      const stocksC = criticos.map(p => p.stock);
      const minsC = criticos.map(p => p.minStock);

      if (labelsC.length > 0) {
        window.DolibarrCharts.createBar('chart-est-criticos',
          labelsC,
          [
            {
              label: 'Stock Actual',
              data: stocksC,
              backgroundColor: '#E74C3C',
              borderRadius: 4
            },
            {
              label: 'Stock Mínimo Alerta',
              data: minsC,
              backgroundColor: '#95A5A6',
              borderRadius: 4
            }
          ]
        );
      } else {
        const ctx = document.getElementById('chart-est-criticos').getContext('2d');
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#7F8C8D';
        ctx.fillText('No hay productos en estado crítico de stock', 20, 100);
      }
    }
  }
};
