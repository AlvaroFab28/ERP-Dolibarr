/**
 * tickets.js - Módulo de Soporte y Tickets de Incidencias
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.tickets = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'lista') {
      this.renderList(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Vista: Dashboard de Soporte
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Cálculos
    const totalTickets = db.tickets.length;
    const abiertos = db.tickets.filter(t => t.status !== 'Resuelto' && t.status !== 'Cerrado').length;
    const resueltos = db.tickets.filter(t => t.status === 'Resuelto').length;
    const altaPrioridad = db.tickets.filter(t => t.priority === 'Alta' && t.status !== 'Resuelto').length;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Soporte</span> <i class="fas fa-chevron-right"></i> <strong>Resumen</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-life-ring"></i> Soporte al Cliente (Helpdesk)</h1>
      </div>

      <!-- Widgets -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/tickets/lista'">
          <div class="wb-icon"><i class="fas fa-ticket"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalTickets}</div>
            <div class="wb-label">Incidencias Totales</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/tickets/lista'">
          <div class="wb-icon"><i class="fas fa-envelope-open-text"></i></div>
          <div class="wb-details">
            <div class="wb-count">${abiertos}</div>
            <div class="wb-label">Tickets en Curso / Abiertos</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/tickets/lista'">
          <div class="wb-icon"><i class="fas fa-check-double"></i></div>
          <div class="wb-details">
            <div class="wb-count">${resueltos}</div>
            <div class="wb-label">Casos Solucionados</div>
          </div>
        </div>

        <div class="widget-box wb-danger" onclick="window.location.hash='#/tickets/lista'">
          <div class="wb-icon"><i class="fas fa-circle-exclamation"></i></div>
          <div class="wb-details">
            <div class="wb-count">${altaPrioridad}</div>
            <div class="wb-label">Prioridad Alta Activa</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <!-- Estado de los Tickets -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Estado de Resolución</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-tickets-estados"></canvas>
            </div>
          </div>
        </div>

        <!-- Prioridades -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar"></i> Severidad de Casos</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-tickets-prioridades"></canvas>
            </div>
          </div>
        </div>

      </div>
    `;

    // Gráficos
    if (typeof Chart !== 'undefined') {
      // 1. Gráfico Estados
      const ticketStates = { Nuevo: 0, Asignado: 0, 'En curso': 0, Resuelto: 0 };
      db.tickets.forEach(t => {
        if (ticketStates[t.status] !== undefined) ticketStates[t.status]++;
      });
      window.DolibarrCharts.createDoughnut('chart-tickets-estados', 
        Object.keys(ticketStates), Object.values(ticketStates),
        ['#3498DB', '#9B59B6', '#F39C12', '#2CB57E']
      );

      // 2. Gráfico Prioridades
      const priorities = { Baja: 0, Media: 0, Alta: 0 };
      db.tickets.forEach(t => {
        if (priorities[t.priority] !== undefined) priorities[t.priority]++;
      });
      window.DolibarrCharts.createBar('chart-tickets-prioridades', 
        Object.keys(priorities), 
        [{
          label: 'Cantidad Incidencias',
          data: Object.values(priorities),
          backgroundColor: ['#2CB57E', '#F39C12', '#E74C3C'],
          borderRadius: 4
        }]
      );
    }
  },

  /**
   * Vista: Listado de Tickets
   */
  renderList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/tickets">Soporte</a> <i class="fas fa-chevron-right"></i> <strong>Listado</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-ticket"></i> Incidencias de Clientes</h1>
        <button id="btn-nuevo-ticket" class="btn btn-primary">
          <i class="fas fa-plus"></i> Registrar Incidencia
        </button>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-ticket" class="form-control" placeholder="Buscar por asunto..." style="width: 280px;">
              <select id="filter-priority-ticket" class="form-control" style="width: 160px;">
                <option value="todos">-- Todas las gravedades --</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-tickets-rows">
              Mostrando ${db.tickets.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Código Ticket</th>
              <th>Asunto / Incidencia</th>
              <th>Tercero Relacionado</th>
              <th style="text-align: center;">Prioridad</th>
              <th style="text-align: center;">Estado</th>
              <th>Fecha de Apertura</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody id="tbody-tickets">
            <!-- Dinámico -->
          </tbody>
        </table>
      </div>

      <!-- MODAL: CREAR TICKET -->
      <div class="modal-overlay" id="modal-ticket-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus-circle"></i> Abrir Ticket de Soporte</h3>
            <button class="modal-close" id="modal-ticket-close">&times;</button>
          </div>
          <form id="form-nuevo-ticket">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="t-title">Asunto / Resumen del Problema *</label>
                <input type="text" id="t-title" class="form-control" placeholder="Ej. Pérdida de comunicación en sensor PLC" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="t-cli">Tercero / Cliente *</label>
                  <select id="t-cli" class="form-control" required>
                    <option value="">-- Seleccionar Cliente --</option>
                    ${db.terceros.map(cli => `<option value="${cli.id}">${cli.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="t-priority">Gravedad / Prioridad *</label>
                  <select id="t-priority" class="form-control" required>
                    <option value="Baja">Baja (Consulta general)</option>
                    <option value="Media" selected>Media (Falla no bloqueante)</option>
                    <option value="Alta">Alta (Sistema bloqueado)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="t-desc">Descripción del Incidente / Mensaje de Error *</label>
                <textarea id="t-desc" class="form-control" rows="4" placeholder="Especificar detalles del error para la derivación al soporte..." required></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-ticket">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Ticket</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Render Inicial
    this.filterTickets(db.tickets, db.terceros);

    // Modal Control
    const modal = document.getElementById('modal-ticket-overlay');
    const openBtn = document.getElementById('btn-nuevo-ticket');
    const closeBtn = document.getElementById('modal-ticket-close');
    const cancelBtn = document.getElementById('btn-cancel-ticket');
    const form = document.getElementById('form-nuevo-ticket');

    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Filtros
    const searchInput = document.getElementById('filter-search-ticket');
    const prioritySelect = document.getElementById('filter-priority-ticket');

    const triggerFilter = () => {
      const query = searchInput.value.toLowerCase().trim();
      const pFilter = prioritySelect.value;

      const filtered = db.tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(query) || t.ref.toLowerCase().includes(query);
        const matchesPriority = pFilter === 'todos' || t.priority === pFilter;
        return matchesSearch && matchesPriority;
      });

      this.filterTickets(filtered, db.terceros);
    };

    searchInput.addEventListener('input', triggerFilter);
    prioritySelect.addEventListener('change', triggerFilter);

    // Guardado
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newTicket = {
        id: window.DolibarrUtils.generateId(db.tickets),
        ref: `TCK26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.tickets.length + 1).padStart(3,'0')}`,
        title: document.getElementById('t-title').value,
        desc: document.getElementById('t-desc').value,
        terceroId: parseInt(document.getElementById('t-cli').value),
        priority: document.getElementById('t-priority').value,
        status: "Nuevo",
        date_created: new Date().toISOString().split('T')[0]
      };

      db.tickets.push(newTicket);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Ticket "${newTicket.ref}" registrado correctamente en Helpdesk.`, 'success');
      closeModal();
      this.renderList(container);
    });
  },

  /**
   * Imprime filas
   */
  filterTickets: function(list, terceros) {
    const tbody = document.getElementById('tbody-tickets');
    const countLabel = document.getElementById('count-tickets-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:30px;">No se encontraron tickets.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(t => {
      const cli = terceros.find(item => item.id === t.terceroId) || { name: 'Desconocido' };
      
      // Botón resolver para demo rápida
      const actionsHtml = t.status !== 'Resuelto' && t.status !== 'Cerrado'
        ? `<button class="btn btn-success btn-sm btn-resolver-ticket" data-id="${t.id}"><i class="fas fa-check-circle"></i> Resolver</button>`
        : `<span class="text-muted" style="font-size:12px;"><i class="fas fa-check-double" style="color:var(--success);"></i> Solucionado</span>`;

      return `
        <tr>
          <td><code>${t.ref}</code></td>
          <td><strong>${t.title}</strong><br><small class="text-muted">${t.desc}</small></td>
          <td><span style="font-weight:600; color:var(--primary);">${cli.name}</span></td>
          <td style="text-align: center;">${window.DolibarrUtils.renderBadge(t.priority)}</td>
          <td style="text-align: center;">${window.DolibarrUtils.renderBadge(t.status)}</td>
          <td>${window.DolibarrUtils.formatDate(t.date_created)}</td>
          <td style="text-align: center;">${actionsHtml}</td>
        </tr>
      `;
    }).join('');

    // Evento resolver ticket
    document.querySelectorAll('.btn-resolver-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const db = window.DolibarrDB.get();
        const ticket = db.tickets.find(item => item.id === id);
        if (ticket) {
          ticket.status = "Resuelto";
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Ticket "${ticket.ref}" resuelto con éxito.`, 'success');
          this.renderList(document.getElementById('main-content'));
        }
      });
    });
  }
};
window.DolibarrModules.tickets = window.DolibarrModules.tickets;
