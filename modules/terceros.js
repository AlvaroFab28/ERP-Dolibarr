/**
 * terceros.js - Módulo de Terceros (Clientes, Proveedores y Contactos)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.terceros = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'lista') {
      this.renderList(mainContent, false);
    } else if (subRoute === 'nuevo') {
      this.renderList(mainContent, true); // Renderizar lista y abrir modal
    } else if (subRoute === 'contactos') {
      this.renderContacts(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Vista de Dashboard / Resumen de Terceros
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Conteo por tipo
    const clientes = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos').length;
    const proveedores = db.terceros.filter(t => t.type === 'proveedor' || t.type === 'ambos').length;
    const potenciales = db.terceros.filter(t => t.type === 'potencial').length; // Simulado
    const contactos = db.contacts.length;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Terceros</span> <i class="fas fa-chevron-right"></i> <strong>Área Terceros</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-users"></i> Área de Terceros</h1>
      </div>

      <!-- Widgets superiores de conteo -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/terceros/lista'">
          <div class="wb-icon"><i class="fas fa-user-tag"></i></div>
          <div class="wb-details">
            <div class="wb-count">${clientes}</div>
            <div class="wb-label">Clientes de la Empresa</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/terceros/lista'">
          <div class="wb-icon"><i class="fas fa-truck"></i></div>
          <div class="wb-details">
            <div class="wb-count">${proveedores}</div>
            <div class="wb-label">Proveedores Homologados</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/terceros/lista'">
          <div class="wb-icon"><i class="fas fa-user-clock"></i></div>
          <div class="wb-details">
            <div class="wb-count">2</div> <!-- Clientes Potenciales simulados -->
            <div class="wb-label">Clientes Potenciales</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/terceros/contactos'">
          <div class="wb-icon"><i class="fas fa-address-book"></i></div>
          <div class="wb-details">
            <div class="wb-count">${contactos}</div>
            <div class="wb-label">Contactos Registrados</div>
          </div>
        </div>
      </div>

      <!-- Distribución y Últimos registros -->
      <div style="display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 24px; margin-top: 24px;">
        
        <!-- Columna Izquierda: Gráfico de Rosquilla -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución de Terceros</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-terceros-tipo"></canvas>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Últimos creados -->
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-history"></i> Últimos Terceros Modificados</div>
              <a href="#/terceros/lista" style="font-size: 12px;">Ver todos</a>
            </div>
            <div class="card-body" style="padding: 0;">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Nombre / Razón Social</th>
                    <th>NIT</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${db.terceros.slice(-3).reverse().map(t => `
                    <tr onclick="window.location.hash='#/terceros/lista'">
                      <td><strong>${t.name}</strong></td>
                      <td>${t.nit}</td>
                      <td><span style="font-size:11px; text-transform:uppercase;">${t.type}</span></td>
                      <td>${window.DolibarrUtils.renderBadge(t.status)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Renderizar gráfico de distribución de terceros
    // Calculamos: Clientes, Proveedores, Ambos, Potenciales (simulado)
    const counts = { cliente: 0, proveedor: 0, ambos: 0, potencial: 2 };
    db.terceros.forEach(t => {
      if (counts[t.type] !== undefined) counts[t.type]++;
    });

    if (typeof Chart !== 'undefined') {
      window.DolibarrCharts.createDoughnut('chart-terceros-tipo', 
        ['Clientes', 'Proveedores', 'Ambos (Clie/Prov)', 'Potenciales'],
        [counts.cliente, counts.proveedor, counts.ambos, counts.potencial],
        ['#3A78D4', '#E74C3C', '#9B59B6', '#F39C12']
      );
    }
  },

  /**
   * Vista de Tabla de Terceros + Filtros + Modal de Creación
   */
  renderList: function(container, openModal = false) {
    const db = window.DolibarrDB.get();
    
    // Contenido Base
    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/terceros">Terceros</a> <i class="fas fa-chevron-right"></i> <strong>Listado</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-list-ul"></i> Listado de Terceros</h1>
        <button id="btn-nuevo-tercero" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Tercero
        </button>
      </div>

      <!-- Barra de Filtros -->
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-tercero" class="form-control" placeholder="Buscar por nombre o NIT..." style="width: 250px;">
              <select id="filter-type-tercero" class="form-control" style="width: 160px;">
                <option value="todos">-- Todos los tipos --</option>
                <option value="cliente">Cliente</option>
                <option value="proveedor">Proveedor</option>
                <option value="ambos">Ambos (Cliente/Prov)</option>
              </select>
              <select id="filter-status-tercero" class="form-control" style="width: 140px;">
                <option value="todos">-- Todos los estados --</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-terceros-rows">
              Mostrando ${db.terceros.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Registros -->
      <div class="table-responsive">
        <table class="table table-striped table-hover" id="table-terceros">
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>Razón Social / Nombre</th>
              <th>NIT</th>
              <th>Tipo</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Estado</th>
              <th style="text-align: right;">Saldo</th>
            </tr>
          </thead>
          <tbody id="tbody-terceros">
            <!-- Renderizado dinámicamente -->
          </tbody>
        </table>
      </div>

      <!-- VENTANA MODAL: NUEVO TERCERO -->
      <div class="modal-overlay" id="modal-tercero-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-user-plus"></i> Registrar Nuevo Tercero</h3>
            <button class="modal-close" id="modal-tercero-close">&times;</button>
          </div>
          <form id="form-nuevo-tercero">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="t-name">Razón Social / Nombre Comercial *</label>
                <input type="text" id="t-name" class="form-control" placeholder="Ej. YPFB Refinación S.A." required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="t-nit">NIT / Cédula Identidad *</label>
                  <input type="text" id="t-nit" class="form-control" placeholder="Ej. 1020304050" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="t-type">Tipo de Tercero *</label>
                  <select id="t-type" class="form-control" required>
                    <option value="cliente">Cliente</option>
                    <option value="proveedor">Proveedor</option>
                    <option value="ambos">Ambos (Cliente/Proveedor)</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="t-phone">Teléfono de Contacto</label>
                  <input type="text" id="t-phone" class="form-control" placeholder="Ej. +591 2 2110022">
                </div>
                <div class="form-group">
                  <label class="form-label" for="t-email">Correo Electrónico</label>
                  <input type="email" id="t-email" class="form-control" placeholder="Ej. administracion@empresa.com">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="t-address">Dirección Física</label>
                <input type="text" id="t-address" class="form-control" placeholder="Ej. Av. Arce Nro. 240, La Paz">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="t-status">Estado inicial</label>
                  <select id="t-status" class="form-control">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="t-balance">Saldo Inicial Pendiente (Bs.)</label>
                  <input type="number" step="0.01" id="t-balance" class="form-control" value="0.00">
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-tercero">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Tercero</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Render inicial de registros
    this.filterTerceros(db.terceros);

    // Eventos
    const modal = document.getElementById('modal-tercero-overlay');
    const openBtn = document.getElementById('btn-nuevo-tercero');
    const closeBtn = document.getElementById('modal-tercero-close');
    const cancelBtn = document.getElementById('btn-cancel-tercero');
    const form = document.getElementById('form-nuevo-tercero');

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

    // Si la subruta forzó abrir modal, lo hacemos
    if (openModal) {
      openModalFunc();
    }

    // Filtros dinámicos
    const searchInput = document.getElementById('filter-search-tercero');
    const typeSelect = document.getElementById('filter-type-tercero');
    const statusSelect = document.getElementById('filter-status-tercero');

    const triggerFilter = () => {
      const query = searchInput.value.toLowerCase().trim();
      const type = typeSelect.value;
      const status = statusSelect.value;

      const filtered = db.terceros.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(query) || t.nit.includes(query);
        const matchesType = (type === 'todos') || (t.type === type || t.type === 'ambos');
        const matchesStatus = (status === 'todos') || (t.status === status);

        return matchesSearch && matchesType && matchesStatus;
      });

      this.filterTerceros(filtered);
    };

    searchInput.addEventListener('input', triggerFilter);
    typeSelect.addEventListener('change', triggerFilter);
    statusSelect.addEventListener('change', triggerFilter);

    // Submit del Formulario Modal
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newTercero = {
        id: window.DolibarrUtils.generateId(db.terceros),
        name: document.getElementById('t-name').value,
        nit: document.getElementById('t-nit').value,
        type: document.getElementById('t-type').value,
        address: document.getElementById('t-address').value || 'Sin dirección',
        phone: document.getElementById('t-phone').value || '-',
        email: document.getElementById('t-email').value || '-',
        status: document.getElementById('t-status').value,
        balance: parseFloat(document.getElementById('t-balance').value) || 0
      };

      // Guardar en DB
      db.terceros.push(newTercero);
      window.DolibarrDB.save(db);

      window.DolibarrUtils.showToast(`Tercero "${newTercero.name}" registrado con éxito.`, 'success');
      closeModalFunc();
      
      // Volver a renderizar
      this.renderList(container, false);
    });
  },

  /**
   * Renderiza las filas filtradas de terceros
   */
  filterTerceros: function(list) {
    const tbody = document.getElementById('tbody-terceros');
    const countLabel = document.getElementById('count-terceros-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted" style="padding: 30px;">
            <i class="fas fa-search" style="font-size:24px; margin-bottom:10px; display:block;"></i>
            No se encontraron terceros con los filtros aplicados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(t => `
      <tr>
        <td><strong>#${t.id}</strong></td>
        <td><strong>${t.name}</strong><br><small class="text-muted">${t.address}</small></td>
        <td><code>${t.nit}</code></td>
        <td><span style="font-size:11px; text-transform:uppercase; font-weight:600;">${t.type}</span></td>
        <td>${t.phone}</td>
        <td><a href="mailto:${t.email}">${t.email}</a></td>
        <td>${window.DolibarrUtils.renderBadge(t.status)}</td>
        <td class="text-right font-semibold" style="color: ${t.balance < 0 ? 'var(--danger)' : 'var(--dark)'};">
          ${window.DolibarrUtils.formatCurrency(t.balance)}
        </td>
      </tr>
    `).join('');
  },

  /**
   * Vista de Contactos
   */
  renderContacts: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/terceros">Terceros</a> <i class="fas fa-chevron-right"></i> <strong>Contactos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-address-book"></i> Contactos y Direcciones</h1>
        <button id="btn-nuevo-contacto" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Contacto
        </button>
      </div>

      <!-- Barra Filtros -->
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-contacto" class="form-control" placeholder="Buscar por nombre o cargo..." style="width: 280px;">
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-contactos-rows">
              Mostrando ${db.contacts.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Contactos -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Tercero / Empresa</th>
              <th>Cargo / Puesto</th>
              <th>Teléfono</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody id="tbody-contactos">
            <!-- Renderizado dinámicamente -->
          </tbody>
        </table>
      </div>

      <!-- VENTANA MODAL: NUEVO CONTACTO -->
      <div class="modal-overlay" id="modal-contacto-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-user-plus"></i> Registrar Nuevo Contacto</h3>
            <button class="modal-close" id="modal-contacto-close">&times;</button>
          </div>
          <form id="form-nuevo-contacto">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="c-first">Nombres *</label>
                  <input type="text" id="c-first" class="form-control" placeholder="Ej. Ronald" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="c-last">Apellidos *</label>
                  <input type="text" id="c-last" class="form-control" placeholder="Ej. Huanca" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="c-tercero">Asociar a Tercero / Empresa *</label>
                <select id="c-tercero" class="form-control" required>
                  <option value="">-- Seleccionar Empresa --</option>
                  ${db.terceros.map(t => `<option value="${t.id}">${t.name} (NIT: ${t.nit})</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="c-role">Puesto / Cargo de Trabajo</label>
                <input type="text" id="c-role" class="form-control" placeholder="Ej. Jefe de Adquisiciones">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="c-phone">Teléfono / Celular</label>
                  <input type="text" id="c-phone" class="form-control" placeholder="Ej. 72144321">
                </div>
                <div class="form-group">
                  <label class="form-label" for="c-email">Correo Electrónico *</label>
                  <input type="email" id="c-email" class="form-control" placeholder="Ej. rhuanca@empresa.com" required>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-contacto">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Contacto</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Render inicial
    this.filterContacts(db.contacts, db.terceros);

    // Eventos
    const modal = document.getElementById('modal-contacto-overlay');
    const openBtn = document.getElementById('btn-nuevo-contacto');
    const closeBtn = document.getElementById('modal-contacto-close');
    const cancelBtn = document.getElementById('btn-cancel-contacto');
    const form = document.getElementById('form-nuevo-contacto');

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

    // Filtro dinámico en tiempo real
    const searchInput = document.getElementById('filter-search-contacto');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const filtered = db.contacts.filter(c => {
        return c.first_name.toLowerCase().includes(query) || 
               c.last_name.toLowerCase().includes(query) || 
               c.role.toLowerCase().includes(query);
      });
      this.filterContacts(filtered, db.terceros);
    });

    // Envío del formulario
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newContacto = {
        id: window.DolibarrUtils.generateId(db.contacts),
        terceroId: parseInt(document.getElementById('c-tercero').value),
        first_name: document.getElementById('c-first').value,
        last_name: document.getElementById('c-last').value,
        email: document.getElementById('c-email').value,
        phone: document.getElementById('c-phone').value || '-',
        role: document.getElementById('c-role').value || 'Sin especificar'
      };

      db.contacts.push(newContacto);
      window.DolibarrDB.save(db);

      window.DolibarrUtils.showToast(`Contacto "${newContacto.first_name} ${newContacto.last_name}" registrado con éxito.`, 'success');
      closeModalFunc();
      
      this.renderContacts(container);
    });
  },

  /**
   * Renderiza las filas filtradas de contactos
   */
  filterContacts: function(list, terceros) {
    const tbody = document.getElementById('tbody-contactos');
    const countLabel = document.getElementById('count-contactos-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted" style="padding: 30px;">
            <i class="fas fa-search" style="font-size:24px; margin-bottom:10px; display:block;"></i>
            No se encontraron contactos.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(c => {
      const t = terceros.find(item => item.id === c.terceroId) || { name: 'Desconocido' };
      return `
        <tr>
          <td><strong>#${c.id}</strong></td>
          <td><strong>${c.first_name} ${c.last_name}</strong></td>
          <td><span style="font-size:12.5px; font-weight:600; color:var(--primary);">${t.name}</span></td>
          <td><span class="text-muted">${c.role}</span></td>
          <td>${c.phone}</td>
          <td><a href="mailto:${c.email}">${c.email}</a></td>
        </tr>
      `;
    }).join('');
  }
};
window.DolibarrModules.terceros = window.DolibarrModules.terceros; // Registrar en namespace
