/**
 * proyectos.js - Módulo de Proyectos, Oportunidades y Tareas
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.proyectos = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'lista') {
      this.renderProjectsList(mainContent);
    } else if (subRoute === 'tareas') {
      this.renderTasksList(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Vista: Dashboard de Proyectos
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Cálculos
    const totalProj = db.proyectos.projects.length;
    const activeProj = db.proyectos.projects.filter(p => p.status === 'En proceso');
    const activeProjCount = activeProj.length;
    
    const presupuestoTotal = activeProj.reduce((sum, p) => sum + p.budget_bs, 0);
    
    const tasks = db.proyectos.tasks;
    const pendingTasks = tasks.filter(t => t.status !== 'Finalizado').length;
    const totalHoursSpent = tasks.reduce((sum, t) => sum + (t.hours_spent || 0), 0);

    const draftProj = db.proyectos.projects.filter(p => p.status === 'Borrador');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Proyectos</span> <i class="fas fa-chevron-right"></i> <strong>Resumen Proyectos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-diagram-project"></i> Gestión de Proyectos</h1>
      </div>

      <!-- Widgets -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/proyectos/lista'">
          <div class="wb-icon"><i class="fas fa-folder-open"></i></div>
          <div class="wb-details">
            <div class="wb-count">${activeProjCount}</div>
            <div class="wb-label">Proyectos en Curso</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/proyectos/lista'">
          <div class="wb-icon"><i class="fas fa-coins"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px;">
              ${window.DolibarrUtils.formatCurrency(presupuestoTotal)}
            </div>
            <div class="wb-label">Presupuesto Vigente (Bs.)</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/proyectos/tareas'">
          <div class="wb-icon"><i class="fas fa-tasks"></i></div>
          <div class="wb-details">
            <div class="wb-count">${pendingTasks}</div>
            <div class="wb-label">Tareas Pendientes</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/proyectos/tareas'">
          <div class="wb-icon"><i class="fas fa-clock"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalHoursSpent} hrs</div>
            <div class="wb-label">Tiempo Declarado</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 24px; margin-top: 24px;">
        
        <!-- Estado Proyectos -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Estado de Proyectos / Oportunidades</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-proyectos-estados"></canvas>
            </div>
          </div>
        </div>

        <!-- Proyectos en Borrador -->
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-file-signature"></i> Proyectos en Borrador (Pendiente Firma)</div>
              <a href="#/proyectos/lista" style="font-size:12px;">Ver listado</a>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Tercero</th>
                    <th>Presupuesto</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  ${draftProj.length === 0 
                    ? `<tr><td colspan="4" class="text-center text-muted" style="padding:20px;">No hay proyectos en borrador.</td></tr>`
                    : draftProj.map(p => {
                      const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
                      return `
                        <tr>
                          <td><strong>${p.title}</strong></td>
                          <td>${cli.name}</td>
                          <td>${window.DolibarrUtils.formatCurrency(p.budget_bs)}</td>
                          <td>
                            <button class="btn btn-primary btn-sm btn-aprobar-proj" data-id="${p.id}"><i class="fas fa-play"></i> Iniciar</button>
                          </td>
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

    // Iniciar proyecto desde borrador
    document.querySelectorAll('.btn-aprobar-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const proj = db.proyectos.projects.find(p => p.id === id);
        if (proj) {
          proj.status = "En proceso";
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Proyecto "${proj.title}" puesto en marcha.`, 'success');
          this.renderDashboard(container);
        }
      });
    });

    // Gráfico
    if (typeof Chart !== 'undefined') {
      const projStates = { Borrador: 0, 'En proceso': 0, Cerrado: 0 };
      db.proyectos.projects.forEach(p => {
        if (projStates[p.status] !== undefined) projStates[p.status]++;
      });
      window.DolibarrCharts.createDoughnut('chart-proyectos-estados', 
        Object.keys(projStates), Object.values(projStates),
        ['#7F8C8D', '#3A78D4', '#2CB57E']
      );
    }
  },

  /**
   * Vista: Listado de Proyectos
   */
  renderProjectsList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/proyectos">Proyectos</a> <i class="fas fa-chevron-right"></i> <strong>Listado Proyectos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-folder-open"></i> Proyectos Registrados</h1>
        <button id="btn-nuevo-proj" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Proyecto
        </button>
      </div>

      <!-- Tabla Proyectos -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título del Proyecto</th>
              <th>Cliente Asociado</th>
              <th style="text-align: right;">Presupuesto Estimado</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${db.proyectos.projects.map(p => {
              const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
              return `
                <tr>
                  <td><code>PROJ-${p.id}</code></td>
                  <td><strong>${p.title}</strong></td>
                  <td><span style="font-weight:600; color:var(--primary);">${cli.name}</span></td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.budget_bs)}</td>
                  <td>${window.DolibarrUtils.formatDate(p.start_date)}</td>
                  <td>${window.DolibarrUtils.formatDate(p.end_date)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(p.status)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: NUEVO PROYECTO -->
      <div class="modal-overlay" id="modal-proj-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-folder-plus"></i> Crear Nuevo Proyecto</h3>
            <button class="modal-close" id="modal-proj-close">&times;</button>
          </div>
          <form id="form-nuevo-proj">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="pr-title">Título del Proyecto *</label>
                <input type="text" id="pr-title" class="form-control" placeholder="Ej. Automatización Subestación Eléctrica" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="pr-cli">Asociar a Cliente *</label>
                <select id="pr-cli" class="form-control" required>
                  <option value="">-- Seleccionar Cliente --</option>
                  ${db.terceros.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="pr-budget">Presupuesto Asignado (Bs) *</label>
                <input type="number" step="0.01" id="pr-budget" class="form-control" placeholder="0.00" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pr-start">Fecha Inicio *</label>
                  <input type="date" id="pr-start" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pr-end">Fecha Límite *</label>
                  <input type="date" id="pr-end" class="form-control" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-proj">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Proyecto</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-proj-overlay');
    const openBtn = document.getElementById('btn-nuevo-proj');
    const closeBtn = document.getElementById('modal-proj-close');
    const cancelBtn = document.getElementById('btn-cancel-proj');
    const form = document.getElementById('form-nuevo-proj');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('pr-start').valueAsDate = new Date();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newProj = {
        id: window.DolibarrUtils.generateId(db.proyectos.projects),
        title: document.getElementById('pr-title').value,
        terceroId: parseInt(document.getElementById('pr-cli').value),
        budget_bs: parseFloat(document.getElementById('pr-budget').value) || 0,
        start_date: document.getElementById('pr-start').value,
        end_date: document.getElementById('pr-end').value,
        status: "Borrador"
      };

      db.proyectos.projects.push(newProj);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Proyecto "${newProj.title}" creado en borrador.`, 'success');
      closeModal();
      this.renderProjectsList(container);
    });
  },

  /**
   * Vista: Listado de Tareas
   */
  renderTasksList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/proyectos">Proyectos</a> <i class="fas fa-chevron-right"></i> <strong>Tareas</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-tasks"></i> Planificación de Tareas</h1>
        <button id="btn-nueva-task" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Tarea
        </button>
      </div>

      <!-- Tabla Tareas -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID Tarea</th>
              <th>Actividad / Tarea</th>
              <th>Proyecto Asociado</th>
              <th>Responsable Asignado</th>
              <th style="text-align: right;">Horas Planificadas</th>
              <th style="text-align: right;">Horas Reales</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.proyectos.tasks.map(t => {
              const proj = db.proyectos.projects.find(p => p.id === t.projectId) || { title: 'Desconocido' };
              const emp = db.rrhh.employees.find(e => e.id === t.assigneeId) || { first_name: 'Sin', last_name: 'Asignar' };
              
              let actionsHtml = '';
              if (t.status !== 'Finalizado') {
                actionsHtml = `
                  <button class="btn btn-primary btn-sm btn-cargar-horas" data-id="${t.id}" data-title="${t.title}"><i class="fas fa-clock"></i> Cargar Horas</button>
                  <button class="btn btn-success btn-sm btn-finish-task" data-id="${t.id}"><i class="fas fa-check"></i> Completar</button>
                `;
              } else {
                actionsHtml = `<span class="text-muted" style="font-size:12px;"><i class="fas fa-circle-check" style="color:var(--success);"></i> Finalizada</span>`;
              }

              return `
                <tr>
                  <td><code>TSK-${t.id}</code></td>
                  <td><strong>${t.title}</strong></td>
                  <td><span class="text-muted" style="font-size:12.5px;">${proj.title}</span></td>
                  <td><strong>${emp.first_name} ${emp.last_name}</strong></td>
                  <td style="text-align: right;">${t.hours_planned} hrs</td>
                  <td style="text-align: right;" class="font-semibold">${t.hours_spent || 0} hrs</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(t.status === 'Todo' ? 'Por hacer' : (t.status === 'InProgress' ? 'En proceso' : 'Finalizado'))}</td>
                  <td style="text-align: center; display:flex; gap:6px; justify-content:center;">${actionsHtml}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: NUEVA TAREA -->
      <div class="modal-overlay" id="modal-task-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus"></i> Crear Nueva Tarea</h3>
            <button class="modal-close" id="modal-task-close">&times;</button>
          </div>
          <form id="form-nueva-task">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="tk-title">Título de la Tarea *</label>
                <input type="text" id="tk-title" class="form-control" placeholder="Ej. Cablear tablero eléctrico de fuerza" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="tk-proj">Asociar a Proyecto *</label>
                <select id="tk-proj" class="form-control" required>
                  <option value="">-- Seleccionar Proyecto --</option>
                  ${db.proyectos.projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="tk-assign">Asignar Responsable *</label>
                  <select id="tk-assign" class="form-control" required>
                    <option value="">-- Asignar Empleado --</option>
                    ${db.rrhh.employees.map(e => `<option value="${e.id}">${e.first_name} ${e.last_name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="tk-hours">Horas Planificadas *</label>
                  <input type="number" id="tk-hours" class="form-control" value="8" min="1" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-task">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear Tarea</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: DECLARAR HORAS (TIEMPOCARD) -->
      <div class="modal-overlay" id="modal-time-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-clock"></i> Registrar Horas de Trabajo</h3>
            <button class="modal-close" id="modal-time-close">&times;</button>
          </div>
          <form id="form-nuevo-time">
            <input type="hidden" id="time-task-id">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Tarea</label>
                <input type="text" id="time-task-title-disp" class="form-control" readonly style="background:#F1F5F9;">
              </div>
              <div class="form-group">
                <label class="form-label" for="time-hours">Horas Trabajadas a Adicionar *</label>
                <input type="number" id="time-hours" class="form-control" min="1" required placeholder="Ej. 4">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-time">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Horas</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Crear Tarea
    const modalTask = document.getElementById('modal-task-overlay');
    const openTaskBtn = document.getElementById('btn-nueva-task');
    const closeTaskBtn = document.getElementById('modal-task-close');
    const cancelTaskBtn = document.getElementById('btn-cancel-task');
    const formTask = document.getElementById('form-nueva-task');

    openTaskBtn.addEventListener('click', () => {
      formTask.reset();
      modalTask.classList.add('show');
    });

    const closeTask = () => modalTask.classList.remove('show');
    closeTaskBtn.addEventListener('click', closeTask);
    cancelTaskBtn.addEventListener('click', closeTask);

    formTask.addEventListener('submit', (e) => {
      e.preventDefault();

      const newTask = {
        id: window.DolibarrUtils.generateId(db.proyectos.tasks),
        projectId: parseInt(document.getElementById('tk-proj').value),
        title: document.getElementById('tk-title').value,
        assigneeId: parseInt(document.getElementById('tk-assign').value),
        hours_planned: parseInt(document.getElementById('tk-hours').value) || 0,
        hours_spent: 0,
        status: "Todo"
      };

      db.proyectos.tasks.push(newTask);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Tarea "${newTask.title}" planificada con éxito.`, 'success');
      closeTask();
      this.renderTasksList(container);
    });

    // Modal Declarar Horas
    const modalTime = document.getElementById('modal-time-overlay');
    const closeTimeBtn = document.getElementById('modal-time-close');
    const cancelTimeBtn = document.getElementById('btn-cancel-time');
    const formTime = document.getElementById('form-nuevo-time');

    const closeTime = () => modalTime.classList.remove('show');
    closeTimeBtn.addEventListener('click', closeTime);
    cancelTimeBtn.addEventListener('click', closeTime);

    document.querySelectorAll('.btn-cargar-horas').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const title = btn.dataset.title;

        formTime.reset();
        document.getElementById('time-task-id').value = id;
        document.getElementById('time-task-title-disp').value = title;
        modalTime.classList.add('show');
      });
    });

    formTime.addEventListener('submit', (e) => {
      e.preventDefault();

      const taskId = parseInt(document.getElementById('time-task-id').value);
      const hours = parseInt(document.getElementById('time-hours').value) || 0;

      const task = db.proyectos.tasks.find(t => t.id === taskId);
      if (task) {
        task.hours_spent = (task.hours_spent || 0) + hours;
        task.status = "InProgress"; // Pasa a en curso si se le cargan horas
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast(`Declaradas ${hours} horas adicionales en la tarea.`, 'success');
        closeTime();
        this.renderTasksList(container);
      }
    });

    // Finalizar Tarea
    document.querySelectorAll('.btn-finish-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const task = db.proyectos.tasks.find(t => t.id === id);
        if (task) {
          task.status = "Finalizado";
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Tarea "${task.title}" completada.`, 'success');
          this.renderTasksList(container);
        }
      });
    });
  }
};
window.DolibarrModules.proyectos = window.DolibarrModules.proyectos;
