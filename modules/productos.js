/**
 * productos.js - Módulo de Productos, Servicios e Inventarios (Almacenes)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.productos = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inicializar almacenes si no existen en localStorage
    this.initWarehouses();
    
    if (subRoute === 'lista') {
      this.renderProductList(mainContent, false);
    } else if (subRoute === 'nuevo') {
      this.renderProductList(mainContent, true);
    } else if (subRoute === 'lista-servicios') {
      this.renderServiceList(mainContent, false);
    } else if (subRoute === 'nuevo-servicio') {
      this.renderServiceList(mainContent, true);
    } else if (subRoute === 'almacenes') {
      this.renderWarehouses(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Inicialización semillero para Almacenes
   */
  initWarehouses: function() {
    const db = window.DolibarrDB.get();
    if (!db.warehouses) {
      db.warehouses = [
        { id: 1, label: "Almacén Central El Alto (LP)", location: "Av. 6 de Marzo Nro. 450, El Alto", stockCount: 165, value_bs: 244500.00 },
        { id: 2, label: "Sucursal Equipetrol (SC)", location: "Calle Los Claveles Nro. 8, Santa Cruz", stockCount: 8, value_bs: 151200.00 },
        { id: 3, label: "Depósito Industrial Vinto (OR)", location: "Zona Industrial Vinto, Oruro", stockCount: 0, value_bs: 0.00 }
      ];
      window.DolibarrDB.save(db);
    }
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
        
        <!-- Columna Izquierda: Gráfico de Stock -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución de Stock por Producto</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-productos-stock"></canvas>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Almacenes Principales -->
        <div>
          <div class="card">
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
                  ${db.warehouses.map(w => `
                    <tr onclick="window.location.hash='#/productos/almacenes'">
                      <td><strong>${w.label}</strong></td>
                      <td><small class="text-muted">${w.location}</small></td>
                      <td style="text-align: right;" class="font-semibold">${w.stockCount} uds</td>
                    </tr>
                  `).join('')}
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
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-prod" class="form-control" placeholder="Buscar por código o etiqueta..." style="width: 280px;">
              <select id="filter-stock-prod" class="form-control" style="width: 180px;">
                <option value="todos">-- Todos los stocks --</option>
                <option value="critico">Stock Crítico</option>
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
              <th>Etiqueta</th>
              <th style="text-align: right;">Precio Venta</th>
              <th style="text-align: right;">Costo Compra</th>
              <th style="text-align: right;">Stock Físico</th>
              <th style="text-align: right;">Mín. Requerido</th>
              <th style="text-align: center;">Estado Alerta</th>
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
                  <label class="form-label" for="p-stock">Stock Inicial Físico *</label>
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
          matchesStock = p.stock > 0 && p.stock <= p.minStock;
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
      
      // Actualizar también el Almacén Central El Alto con la suma del stock inicial para consistencia
      if (db.warehouses && db.warehouses[0] && newProduct.stock > 0) {
        db.warehouses[0].stockCount += newProduct.stock;
        db.warehouses[0].value_bs += (newProduct.stock * newProduct.cost);
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
        <tr><td colspan="7" class="text-center text-muted" style="padding:30px;">No hay productos con los filtros seleccionados.</td></tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(p => {
      let statusHtml = '';
      if (p.stock === 0) {
        statusHtml = window.DolibarrUtils.renderBadge('Sin Stock');
      } else if (p.stock <= p.minStock) {
        statusHtml = window.DolibarrUtils.renderBadge('Pago Parcial'); // Devuelve amarillo (Warning)
        statusHtml = statusHtml.replace('Pago Parcial', 'Stock Crítico');
      } else {
        statusHtml = window.DolibarrUtils.renderBadge('Activo'); // Devuelve verde
        statusHtml = statusHtml.replace('Activo', 'Stock OK');
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
        </tr>
      `;
    }).join('');
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
      <div class="card" style="margin-bottom: 16px;">
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

    // Render Inicial
    this.filterServicios(servs);

    // Eventos Modal
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

    // Filtros
    const searchInput = document.getElementById('filter-search-serv');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const filtered = servs.filter(s => s.code.toLowerCase().includes(query) || s.label.toLowerCase().includes(query));
      this.filterServicios(filtered);
    });

    // Guardado
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
   * Vista: Almacenes y Stocks Físicos
   */
  renderWarehouses: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/productos">Productos</a> <i class="fas fa-chevron-right"></i> <strong>Almacenes</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-warehouse"></i> Centros de Distribución y Almacenes</h1>
      </div>

      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-list-check"></i> Inventario Consolidado por Depósito</div>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="table">
            <thead>
              <tr>
                <th>Código ID</th>
                <th>Nombre del Almacén</th>
                <th>Dirección / Ubicación Física</th>
                <th style="text-align: right;">Suma de Artículos</th>
                <th style="text-align: right;">Valoración Estimada (Bs)</th>
              </tr>
            </thead>
            <tbody>
              ${db.warehouses.map(w => `
                <tr>
                  <td><code>ALM-00${w.id}</code></td>
                  <td><strong>${w.label}</strong></td>
                  <td><span class="text-muted" style="font-size:12.5px;">${w.location}</span></td>
                  <td style="text-align: right;" class="font-semibold">${w.stockCount} unidades</td>
                  <td style="text-align: right;" class="font-semibold" style="color:var(--primary);">
                    ${window.DolibarrUtils.formatCurrency(w.value_bs)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-info-circle"></i> Nota sobre Movimiento de Stocks</div>
        </div>
        <div class="card-body">
          <p class="text-muted" style="font-size: 13px; line-height: 1.6;">
            En este prototipo académico, los movimientos de stock se consolidan automáticamente al crear un nuevo producto físico con inventario inicial. Los almacenes registran en tiempo real la valoración monetaria a precio de costo de compra, simulando un control de existencias PMP (Precio Medio Ponderado).
          </p>
        </div>
      </div>
    `;
  }
};
