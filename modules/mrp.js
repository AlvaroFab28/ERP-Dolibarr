/**
 * mrp.js - Módulo de Control de Producción y Fabricación (MRP)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.mrp = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'bom') {
      this.renderBOM(mainContent);
    } else if (subRoute === 'ordenes') {
      this.renderOrdenes(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Vista: Dashboard de Producción
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Cálculos
    const totalBOM = db.mrp.boms.length;
    const totalOrders = db.mrp.manufacturing_orders.length;
    const activeOrders = db.mrp.manufacturing_orders.filter(o => o.status === 'En proceso').length;
    
    const totalProduced = db.mrp.manufacturing_orders
      .filter(o => o.status === 'Finalizado')
      .reduce((sum, o) => sum + o.qty, 0);

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>MRP</span> <i class="fas fa-chevron-right"></i> <strong>Resumen MRP</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-industry"></i> Fabricación (MRP)</h1>
      </div>

      <!-- Widgets -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/mrp/bom'">
          <div class="wb-icon"><i class="fas fa-receipt"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalBOM}</div>
            <div class="wb-label">Recetas BOM Activas</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/mrp/ordenes'">
          <div class="wb-icon"><i class="fas fa-gears"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalOrders}</div>
            <div class="wb-label">Órdenes de Fabricación</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/mrp/ordenes'">
          <div class="wb-icon"><i class="fas fa-industry"></i></div>
          <div class="wb-details">
            <div class="wb-count">${activeOrders}</div>
            <div class="wb-label">Órdenes en Producción</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/mrp/ordenes'">
          <div class="wb-icon"><i class="fas fa-circle-check"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalProduced}</div>
            <div class="wb-label">Unidades Producidas (Finalizadas)</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <!-- Estado de Órdenes -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Estado de Órdenes de Fabricación</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-mrp-estados"></canvas>
            </div>
          </div>
        </div>

        <!-- Últimas Órdenes Modificadas -->
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-history"></i> Órdenes de Producción Recientes</div>
              <a href="#/mrp/ordenes" style="font-size:12px;">Ver todas</a>
            </div>
            <div class="card-body" style="padding: 0;">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Ref. Orden</th>
                    <th>Fórmula BOM</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${db.mrp.manufacturing_orders.slice(-3).reverse().map(o => {
                    const bom = db.mrp.boms.find(b => b.id === o.bom_id) || { label: 'Desconocida' };
                    return `
                      <tr onclick="window.location.hash='#/mrp/ordenes'">
                        <td><code>${o.ref}</code></td>
                        <td><strong>${bom.label}</strong></td>
                        <td>${o.qty} uds</td>
                        <td>${window.DolibarrUtils.renderBadge(o.status)}</td>
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

    // Gráfico
    if (typeof Chart !== 'undefined') {
      const orderStates = { Borrador: 0, 'En proceso': 0, Finalizado: 0 };
      db.mrp.manufacturing_orders.forEach(o => {
        if (orderStates[o.status] !== undefined) orderStates[o.status]++;
      });
      window.DolibarrCharts.createDoughnut('chart-mrp-estados', 
        Object.keys(orderStates), Object.values(orderStates),
        ['#7F8C8D', '#3A78D4', '#2CB57E']
      );
    }
  },

  /**
   * Vista: Listas de Materiales (BOM)
   */
  renderBOM: function(container) {
    const db = window.DolibarrDB.get();
    const finishedProds = db.products.filter(p => p.type === 'producto');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/mrp">MRP</a> <i class="fas fa-chevron-right"></i> <strong>BOM</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-receipt"></i> Listas de Materiales (Recetas BOM)</h1>
        <button id="btn-nueva-bom" class="btn btn-primary">
          <i class="fas fa-plus"></i> Crear Fórmula BOM
        </button>
      </div>

      <!-- Tabla BOM -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID BOM</th>
              <th>Fórmula / Descripción</th>
              <th>Producto Final Destino</th>
              <th>Ingredientes / Componentes Requeridos</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${db.mrp.boms.map(b => {
              const prod = db.products.find(p => p.id === b.product_id) || { label: 'Desconocido', code: '-' };
              
              // Formatear componentes en cadena legible
              const compListHtml = b.components.map(c => {
                const compProd = db.products.find(p => p.id === c.product_id) || { label: 'Componente' };
                return `<li><strong>${c.qty}</strong> x ${compProd.label} (<code>${compProd.code}</code>)</li>`;
              }).join('');

              return `
                <tr>
                  <td><code>BOM-${b.id}</code></td>
                  <td><strong>${b.label}</strong></td>
                  <td><span style="font-weight:600; color:var(--primary);">${prod.label}</span><br><small class="text-muted">Ref: ${prod.code}</small></td>
                  <td><ul style="padding-left:14px; margin:0; font-size:12px;">${compListHtml}</ul></td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(b.status)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: CREAR BOM -->
      <div class="modal-overlay" id="modal-bom-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-receipt"></i> Agregar Fórmula BOM</h3>
            <button class="modal-close" id="modal-bom-close">&times;</button>
          </div>
          <form id="form-nuevo-bom">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="b-label">Nombre descriptivo de la Receta *</label>
                <input type="text" id="b-label" class="form-control" placeholder="Ej. Ensamblaje Motor con Base y Mangueras" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="b-prod">Producto Terminado Resultante *</label>
                <select id="b-prod" class="form-control" required>
                  <option value="">-- Seleccionar Producto --</option>
                  ${finishedProds.map(p => `<option value="${p.id}">${p.label} (${p.code})</option>`).join('')}
                </select>
              </div>

              <div class="card" style="margin-top:16px; border-style:dashed;">
                <div class="card-header" style="padding:10px 16px;"><span class="font-semibold" style="font-size:12.5px;">Componentes Requeridos (Receta Fija Demo)</span></div>
                <div class="card-body" style="padding:12px 16px; font-size:12.5px; color:var(--text-muted);">
                  Para demostración visual, esta nueva fórmula incluirá de forma predefinida:<br>
                  <ul style="margin-top:6px; padding-left:16px;">
                    <li><strong>1 x Válvula de Control de Presión 3"</strong></li>
                    <li><strong>2 x Tubería de Acero Carbono 6"</strong></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-bom">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Receta</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-bom-overlay');
    const openBtn = document.getElementById('btn-nueva-bom');
    const closeBtn = document.getElementById('modal-bom-close');
    const cancelBtn = document.getElementById('btn-cancel-bom');
    const form = document.getElementById('form-nuevo-bom');

    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newBOM = {
        id: window.DolibarrUtils.generateId(db.mrp.boms),
        product_id: parseInt(document.getElementById('b-prod').value),
        label: document.getElementById('b-label').value,
        status: "activo",
        components: [
          { product_id: 1, qty: 1 }, // Válvula
          { product_id: 2, qty: 2 }  // Tuberías
        ]
      };

      db.mrp.boms.push(newBOM);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Receta "${newBOM.label}" registrada correctamente.`, 'success');
      closeModal();
      this.renderBOM(container);
    });
  },

  /**
   * Vista: Órdenes de Fabricación
   */
  renderOrdenes: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/mrp">MRP</a> <i class="fas fa-chevron-right"></i> <strong>Órdenes de Fabricación</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-gears"></i> Órdenes de Fabricación</h1>
        <button id="btn-nueva-orden" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Orden de Trabajo
        </button>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Código Orden</th>
              <th>Fórmula BOM (Receta)</th>
              <th>Cantidad a Fabricar</th>
              <th>Fecha Inicio</th>
              <th>Fecha Vencimiento</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.mrp.manufacturing_orders.map(o => {
              const bom = db.mrp.boms.find(b => b.id === o.bom_id) || { label: 'Desconocida' };
              
              // Definición de botones por estado
              let actionsHtml = '';
              if (o.status === 'Borrador') {
                actionsHtml = `<button class="btn btn-primary btn-sm btn-start-mo" data-id="${o.id}"><i class="fas fa-play"></i> Producir</button>`;
              } else if (o.status === 'En proceso') {
                actionsHtml = `<button class="btn btn-success btn-sm btn-finish-mo" data-id="${o.id}"><i class="fas fa-check"></i> Finalizar</button>`;
              } else {
                actionsHtml = `<span class="text-muted" style="font-size:12px;"><i class="fas fa-circle-check" style="color:var(--success);"></i> Finalizado</span>`;
              }

              return `
                <tr>
                  <td><code>${o.ref}</code></td>
                  <td><strong>${bom.label}</strong></td>
                  <td style="font-weight:600;">${o.qty} unidades</td>
                  <td>${window.DolibarrUtils.formatDate(o.start_date)}</td>
                  <td>${window.DolibarrUtils.formatDate(o.end_date)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(o.status)}</td>
                  <td style="text-align: center;">${actionsHtml}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: NUEVA ORDEN DE FABRICACION -->
      <div class="modal-overlay" id="modal-mo-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-gears"></i> Generar Orden de Trabajo</h3>
            <button class="modal-close" id="modal-mo-close">&times;</button>
          </div>
          <form id="form-nuevo-mo">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="mo-bom">Seleccionar Fórmula BOM *</label>
                <select id="mo-bom" class="form-control" required>
                  <option value="">-- Seleccionar Receta --</option>
                  ${db.mrp.boms.map(b => `<option value="${b.id}">${b.label}</option>`).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="mo-qty">Cantidad de Productos a Fabricar *</label>
                  <input type="number" id="mo-qty" class="form-control" value="1" min="1" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="mo-start">Fecha Estimada de Inicio *</label>
                  <input type="date" id="mo-start" class="form-control" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="mo-end">Fecha Límite / Vence *</label>
                <input type="date" id="mo-end" class="form-control" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-mo">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear Orden Trabajo</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-mo-overlay');
    const openBtn = document.getElementById('btn-nueva-orden');
    const closeBtn = document.getElementById('modal-mo-close');
    const cancelBtn = document.getElementById('btn-cancel-mo');
    const form = document.getElementById('form-nuevo-mo');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('mo-start').valueAsDate = new Date();
      
      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);
      document.getElementById('mo-end').valueAsDate = inThreeDays;
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Iniciar Producción (Borrador -> En Proceso)
    document.querySelectorAll('.btn-start-mo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const order = db.mrp.manufacturing_orders.find(o => o.id === id);
        if (order) {
          order.status = "En proceso";
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Línea de producción activada para la orden ${order.ref}.`, 'info');
          this.renderOrdenes(container);
        }
      });
    });

    // Finalizar Producción (En Proceso -> Finalizado)
    // DEDUCCION DE INVENTARIO E INCREMENTO DE PRODUCTO FINAL
    document.querySelectorAll('.btn-finish-mo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const order = db.mrp.manufacturing_orders.find(o => o.id === id);
        if (!order) return;

        const bom = db.mrp.boms.find(b => b.id === order.bom_id);
        if (!bom) return;

        // 1. Descontar materias primas
        let stockMsg = "";
        let enoughStock = true;
        
        bom.components.forEach(comp => {
          const product = db.products.find(p => p.id === comp.product_id);
          const qtyNeeded = comp.qty * order.qty;
          if (product) {
            product.stock -= qtyNeeded; // Permite negativos para demo si no hay stock
            stockMsg += `<li>Deducido: <strong>${qtyNeeded}</strong> uds de ${product.label} (Nuevo stock: ${product.stock})</li>`;
          }
        });

        // 2. Sumar producto terminado
        const finishedProduct = db.products.find(p => p.id === bom.product_id);
        if (finishedProduct) {
          finishedProduct.stock += order.qty;
          stockMsg += `<li>Producido: <strong>${order.qty}</strong> uds de ${finishedProduct.label} (Nuevo stock: ${finishedProduct.stock})</li>`;
        }

        // 3. Modificar estado de la orden
        order.status = "Finalizado";

        // 4. Actualizar valoración de stock del Almacén Central El Alto
        // Restar costos de materias primas y sumar costo de producto terminado
        if (db.warehouses && db.warehouses[0]) {
          let costDifference = 0;
          
          bom.components.forEach(comp => {
            const product = db.products.find(p => p.id === comp.product_id);
            if (product) {
              costDifference -= (comp.qty * order.qty * product.cost);
              db.warehouses[0].stockCount -= (comp.qty * order.qty);
            }
          });

          if (finishedProduct) {
            costDifference += (order.qty * finishedProduct.cost);
            db.warehouses[0].stockCount += order.qty;
          }

          db.warehouses[0].value_bs += costDifference;
        }

        // Guardar cambios
        window.DolibarrDB.save(db);

        // Mostrar notificación toast estilizada grande
        window.DolibarrUtils.showToast(`Orden ${order.ref} finalizada. Componentes consumidos de stock.`, 'success');
        
        // Re-render
        this.renderOrdenes(container);
      });
    });

    // Guardar nueva orden
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newOrder = {
        id: window.DolibarrUtils.generateId(db.mrp.manufacturing_orders),
        ref: `OF26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.mrp.manufacturing_orders.length + 1).padStart(3,'0')}`,
        bom_id: parseInt(document.getElementById('mo-bom').value),
        qty: parseInt(document.getElementById('mo-qty').value) || 1,
        start_date: document.getElementById('mo-start').value,
        end_date: document.getElementById('mo-end').value,
        status: "Borrador"
      };

      db.mrp.manufacturing_orders.push(newOrder);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Orden de fabricación "${newOrder.ref}" creada en borrador.`, 'success');
      closeModal();
      this.renderOrdenes(container);
    });
  }
};
window.DolibarrModules.mrp = window.DolibarrModules.mrp;
