/**
 * miembros.js - Módulo de Gestión de Miembros y Asociaciones
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.miembros = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'lista') {
      this.renderList(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Vista: Dashboard de Miembros
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Conteo
    const totalMiembros = db.miembros.length;
    const activos = db.miembros.filter(m => m.status === 'Activo' || m.status === 'Al día').length;
    
    // Aportes simulados (100 Bs por miembro activo/al día)
    const cotizaciones = activos * 100;

    // Calcular matriz de resumen Tipo vs Estado
    const summaryMatrix = {
      'Socio Fundador': { 'Borrador': 0, 'Al día': 0, 'Activo': 0, 'Suspendido': 0 },
      'Adherente': { 'Borrador': 0, 'Al día': 0, 'Activo': 0, 'Suspendido': 0 },
      'Aspirante': { 'Borrador': 0, 'Al día': 0, 'Activo': 0, 'Suspendido': 0 }
    };

    db.miembros.forEach(m => {
      if (summaryMatrix[m.type] && summaryMatrix[m.type][m.status] !== undefined) {
        summaryMatrix[m.type][m.status]++;
      }
    });

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Miembros</span> <i class="fas fa-chevron-right"></i> <strong>Resumen</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-user-group"></i> Gestión de Miembros de la Fundación</h1>
      </div>

      <!-- Widgets -->
      <div class="widget-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/miembros/lista'">
          <div class="wb-icon"><i class="fas fa-address-card"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalMiembros}</div>
            <div class="wb-label">Miembros Afiliados</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/miembros/lista'">
          <div class="wb-icon"><i class="fas fa-user-check"></i></div>
          <div class="wb-details">
            <div class="wb-count">${activos}</div>
            <div class="wb-label">Miembros al Día / Activos</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/miembros/lista'">
          <div class="wb-icon"><i class="fas fa-receipt"></i></div>
          <div class="wb-details">
            <div class="wb-count">${window.DolibarrUtils.formatCurrency(cotizaciones)}</div>
            <div class="wb-label">Suscripciones Recaudadas</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <!-- Gráfico de Estados -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Estado de Suscripciones</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-miembros-estados"></canvas>
            </div>
          </div>
        </div>

        <!-- Tabla Resumen Tipo vs Estado -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-table-list"></i> Miembros por Tipo y Estado</div>
            <a href="#/miembros/lista" style="font-size:12px;">Ver detalles</a>
          </div>
          <div class="card-body" style="padding: 0;">
            <table class="table">
              <thead>
                <tr>
                  <th>Tipo de Miembro</th>
                  <th style="text-align: center;">Borrador</th>
                  <th style="text-align: center;">Al día / Activo</th>
                  <th style="text-align: center;">Suspendido</th>
                  <th style="text-align: center;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(summaryMatrix).map(type => {
                  const states = summaryMatrix[type];
                  const total = states.Borrador + states['Al día'] + states.Activo + states.Suspendido;
                  return `
                    <tr>
                      <td><strong>${type}</strong></td>
                      <td style="text-align: center;" class="text-muted">${states.Borrador}</td>
                      <td style="text-align: center;" class="font-semibold text-success">${states['Al día'] + states.Activo}</td>
                      <td style="text-align: center;" class="text-danger">${states.Suspendido}</td>
                      <td style="text-align: center;" class="font-bold">${total}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Gráfico
    if (typeof Chart !== 'undefined') {
      const memberStates = { Borrador: 0, 'Al día': 0, Activo: 0, Suspendido: 0 };
      db.miembros.forEach(m => {
        if (memberStates[m.status] !== undefined) memberStates[m.status]++;
      });
      window.DolibarrCharts.createDoughnut('chart-miembros-estados', 
        Object.keys(memberStates), Object.values(memberStates),
        ['#7F8C8D', '#2CB57E', '#3498DB', '#E74C3C']
      );
    }
  },

  /**
   * Vista: Listado de Miembros
   */
  renderList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/miembros">Miembros</a> <i class="fas fa-chevron-right"></i> <strong>Listado</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-list-ul"></i> Registro de Socios</h1>
        <button id="btn-nuevo-miembro" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Miembro
        </button>
      </div>

      <!-- Filtro -->
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-miembro" class="form-control" placeholder="Buscar socio por nombre..." style="width: 280px;">
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-miembros-rows">
              Mostrando ${db.miembros.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Tipo de Miembro</th>
              <th>Correo Electrónico</th>
              <th>Fecha de Afiliación</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody id="tbody-miembros">
            <!-- Dinámico -->
          </tbody>
        </table>
      </div>

      <!-- MODAL: REGISTRAR MIEMBRO -->
      <div class="modal-overlay" id="modal-miembro-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-user-plus"></i> Afiliar Nuevo Socio</h3>
            <button class="modal-close" id="modal-miembro-close">&times;</button>
          </div>
          <form id="form-nuevo-miembro">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="m-first">Nombres *</label>
                  <input type="text" id="m-first" class="form-control" placeholder="Ej. Ramiro" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="m-last">Apellidos *</label>
                  <input type="text" id="m-last" class="form-control" placeholder="Ej. Valdez" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="m-type">Tipo de Membresía *</label>
                  <select id="m-type" class="form-control" required>
                    <option value="Socio Fundador">Socio Fundador</option>
                    <option value="Adherente">Adherente</option>
                    <option value="Aspirante">Aspirante</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="m-status">Estado Suscripción *</label>
                  <select id="m-status" class="form-control" required>
                    <option value="Al día">Al día (Activo)</option>
                    <option value="Activo">Activo</option>
                    <option value="Borrador">Borrador (Pendiente pago)</option>
                    <option value="Suspendido">Suspendido (Retraso)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="m-email">Correo Electrónico *</label>
                <input type="email" id="m-email" class="form-control" placeholder="Ej. rvaldez@correo.com" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-miembro">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Afiliación</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Render Inicial
    this.filterMiembros(db.miembros);

    // Modal Control
    const modal = document.getElementById('modal-miembro-overlay');
    const openBtn = document.getElementById('btn-nuevo-miembro');
    const closeBtn = document.getElementById('modal-miembro-close');
    const cancelBtn = document.getElementById('btn-cancel-miembro');
    const form = document.getElementById('form-nuevo-miembro');

    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Filtros
    const searchInput = document.getElementById('filter-search-miembro');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const filtered = db.miembros.filter(m => {
        return m.first_name.toLowerCase().includes(query) || m.last_name.toLowerCase().includes(query);
      });
      this.filterMiembros(filtered);
    });

    // Guardado
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newMiembro = {
        id: window.DolibarrUtils.generateId(db.miembros),
        first_name: document.getElementById('m-first').value,
        last_name: document.getElementById('m-last').value,
        type: document.getElementById('m-type').value,
        email: document.getElementById('m-email').value,
        status: document.getElementById('m-status').value,
        join_date: new Date().toISOString().split('T')[0]
      };

      db.miembros.push(newMiembro);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Socio "${newMiembro.first_name} ${newMiembro.last_name}" afiliado con éxito.`, 'success');
      closeModal();
      this.renderList(container);
    });
  },

  /**
   * Imprime filas
   */
  filterMiembros: function(list) {
    const tbody = document.getElementById('tbody-miembros');
    const countLabel = document.getElementById('count-miembros-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:30px;">No se encontraron socios.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => `
      <tr>
        <td><code>MEM-${m.id}</code></td>
        <td><strong>${m.first_name} ${m.last_name}</strong></td>
        <td><span class="text-muted">${m.type}</span></td>
        <td><a href="mailto:${m.email}">${m.email}</a></td>
        <td>${window.DolibarrUtils.formatDate(m.join_date)}</td>
        <td style="text-align: center;">${window.DolibarrUtils.renderBadge(m.status)}</td>
      </tr>
    `).join('');
  }
};
window.DolibarrModules.miembros = window.DolibarrModules.miembros;
