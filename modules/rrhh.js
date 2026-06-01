/**
 * rrhh.js - Módulo de Recursos Humanos (Personal, Vacaciones e Informes de Gastos)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.rrhh = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'empleados') {
      this.renderEmployees(mainContent);
    } else if (subRoute === 'vacaciones') {
      this.renderVacations(mainContent);
    } else if (subRoute === 'gastos') {
      this.renderExpenses(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Vista: Dashboard de Recursos Humanos
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Conteo Empleados
    const totalEmp = db.rrhh.employees.length;
    const planillaMensual = db.rrhh.employees
      .filter(e => e.status === 'activo')
      .reduce((sum, e) => sum + e.salary_bs, 0);

    // Vacaciones pendientes
    const vacPendientes = db.rrhh.leaves.filter(l => l.status === 'Borrador').length;

    // Gastos pendientes de reembolso
    const gastosPendientes = db.rrhh.expenses
      .filter(ex => ex.status !== 'Pagado')
      .reduce((sum, ex) => sum + ex.amount_bs, 0);

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>RRHH</span> <i class="fas fa-chevron-right"></i> <strong>Resumen RRHH</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-id-card"></i> Recursos Humanos</h1>
      </div>

      <!-- Widgets -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/rrhh/empleados'">
          <div class="wb-icon"><i class="fas fa-user-tie"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalEmp}</div>
            <div class="wb-label">Empleados en Planilla</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/rrhh/empleados'">
          <div class="wb-icon"><i class="fas fa-coins"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px;">
              ${window.DolibarrUtils.formatCurrency(planillaMensual)}
            </div>
            <div class="wb-label">Planilla Salarios Mensual</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/rrhh/vacaciones'">
          <div class="wb-icon"><i class="fas fa-umbrella-beach"></i></div>
          <div class="wb-details">
            <div class="wb-count">${vacPendientes}</div>
            <div class="wb-label">Solicitudes de Vacación Pend.</div>
          </div>
        </div>

        <div class="widget-box wb-danger" onclick="window.location.hash='#/rrhh/gastos'">
          <div class="wb-icon"><i class="fas fa-wallet"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px; color: var(--danger);">
              ${window.DolibarrUtils.formatCurrency(gastosPendientes)}
            </div>
            <div class="wb-label">Reembolsos de Gasto Pend.</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución de Puestos</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-rrhh-puestos"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar"></i> Gastos de Empleados por Estado</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-rrhh-gastos"></canvas>
            </div>
          </div>
        </div>

      </div>
    `;

    // Gráficos
    if (typeof Chart !== 'undefined') {
      // 1. Gráfico Puestos
      const roles = {};
      db.rrhh.employees.forEach(e => {
        if (!roles[e.role]) roles[e.role] = 0;
        roles[e.role]++;
      });
      window.DolibarrCharts.createDoughnut('chart-rrhh-puestos', Object.keys(roles), Object.values(roles));

      // 2. Gráfico Gastos
      const expStates = { Borrador: 0, Aprobado: 0, Pagado: 0 };
      db.rrhh.expenses.forEach(ex => {
        if (expStates[ex.status] !== undefined) expStates[ex.status] += ex.amount_bs;
      });
      window.DolibarrCharts.createBar('chart-rrhh-gastos', 
        Object.keys(expStates), 
        [{
          label: 'Monto Acumulado (Bs)',
          data: Object.values(expStates),
          backgroundColor: ['#7F8C8D', '#F39C12', '#2CB57E'],
          borderRadius: 4
        }],
        { indexAxis: 'y' } // Barras horizontales
      );
    }
  },

  /**
   * Vista: Ficha de Empleados
   */
  renderEmployees: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Empleados</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-user-tie"></i> Empleados y Cargos</h1>
        <button id="btn-nuevo-empleado" class="btn btn-primary">
          <i class="fas fa-user-plus"></i> Contratar Empleado
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Puesto / Cargo</th>
              <th style="text-align: right;">Sueldo Base Mensual</th>
              <th>Fecha de Contratación</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${db.rrhh.employees.map(e => `
              <tr>
                <td><code>EMP-${String(e.id).padStart(3,'0')}</code></td>
                <td><strong>${e.first_name} ${e.last_name}</strong></td>
                <td><span class="text-muted">${e.role}</span></td>
                <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(e.salary_bs)}</td>
                <td>${window.DolibarrUtils.formatDate(e.hire_date)}</td>
                <td style="text-align: center;">${window.DolibarrUtils.renderBadge(e.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: CONTRATAR EMPLEADO -->
      <div class="modal-overlay" id="modal-emp-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-user-plus"></i> Contratar Nuevo Personal</h3>
            <button class="modal-close" id="modal-emp-close">&times;</button>
          </div>
          <form id="form-nuevo-emp">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-first">Nombres *</label>
                  <input type="text" id="e-first" class="form-control" required placeholder="Ej. Pedro">
                </div>
                <div class="form-group">
                  <label class="form-label" for="e-last">Apellidos *</label>
                  <input type="text" id="e-last" class="form-control" required placeholder="Ej. Quispe">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="e-role">Puesto de Trabajo *</label>
                <input type="text" id="e-role" class="form-control" required placeholder="Ej. Operador de Calderas">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-salary">Sueldo Básico Mensual (Bs) *</label>
                  <input type="number" id="e-salary" class="form-control" required placeholder="0.00">
                </div>
                <div class="form-group">
                  <label class="form-label" for="e-date">Fecha de Contratación *</label>
                  <input type="date" id="e-date" class="form-control" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-emp">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Ficha</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-emp-overlay');
    const openBtn = document.getElementById('btn-nuevo-empleado');
    const closeBtn = document.getElementById('modal-emp-close');
    const cancelBtn = document.getElementById('btn-cancel-emp');
    const form = document.getElementById('form-nuevo-emp');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('e-date').valueAsDate = new Date();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newEmp = {
        id: window.DolibarrUtils.generateId(db.rrhh.employees),
        first_name: document.getElementById('e-first').value,
        last_name: document.getElementById('e-last').value,
        role: document.getElementById('e-role').value,
        salary_bs: parseFloat(document.getElementById('e-salary').value) || 0,
        hire_date: document.getElementById('e-date').value,
        status: "activo"
      };

      db.rrhh.employees.push(newEmp);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Ficha de "${newEmp.first_name} ${newEmp.last_name}" registrada con éxito.`, 'success');
      closeModal();
      this.renderEmployees(container);
    });
  },

  /**
   * Vista: Gestión de Vacaciones (Días Libres)
   */
  renderVacations: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Vacaciones</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-umbrella-beach"></i> Licencias y Días Libres</h1>
        <button id="btn-nueva-vac" class="btn btn-primary">
          <i class="fas fa-calendar-plus"></i> Solicitar Vacación
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado</th>
              <th>Tipo de Licencia</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th style="text-align: right;">Días Solicitados</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.rrhh.leaves.map(l => {
              const emp = db.rrhh.employees.find(e => e.id === l.employeeId) || { first_name: 'Desconocido', last_name: '' };
              const actionBtn = l.status === 'Borrador'
                ? `<button class="btn btn-success btn-sm btn-aprob-vac" data-id="${l.id}"><i class="fas fa-circle-check"></i> Aprobar</button>`
                : `<span class="text-muted" style="font-size:12px;"><i class="fas fa-check-double" style="color:var(--success);"></i> Procesada</span>`;

              return `
                <tr>
                  <td><code>SOL-${l.id}</code></td>
                  <td><strong>${emp.first_name} ${emp.last_name}</strong></td>
                  <td><span class="text-muted">${l.type}</span></td>
                  <td>${window.DolibarrUtils.formatDate(l.start_date)}</td>
                  <td>${window.DolibarrUtils.formatDate(l.end_date)}</td>
                  <td style="text-align: right;" class="font-semibold">${l.days} días</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(l.status)}</td>
                  <td style="text-align: center;">${actionBtn}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: SOLICITAR VACACION -->
      <div class="modal-overlay" id="modal-vac-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-calendar-plus"></i> Nueva Solicitud de Vacación</h3>
            <button class="modal-close" id="modal-vac-close">&times;</button>
          </div>
          <form id="form-nueva-vac">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="v-emp">Seleccionar Empleado *</label>
                <select id="v-emp" class="form-control" required>
                  <option value="">-- Seleccionar Empleado --</option>
                  ${db.rrhh.employees.map(e => `<option value="${e.id}">${e.first_name} ${e.last_name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="v-type">Tipo de Licencia *</label>
                <select id="v-type" class="form-control" required>
                  <option value="Vacación">Vacación Anual Retribuida</option>
                  <option value="Baja Médica">Baja Médica Justificada</option>
                  <option value="Licencia Personal">Licencia por Matrimonio/Duelo</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="v-start">Fecha de Inicio *</label>
                  <input type="date" id="v-start" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="v-end">Fecha de Fin *</label>
                  <input type="date" id="v-end" class="form-control" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-vac">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Solicitud</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-vac-overlay');
    const openBtn = document.getElementById('btn-nueva-vac');
    const closeBtn = document.getElementById('modal-vac-close');
    const cancelBtn = document.getElementById('btn-cancel-vac');
    const form = document.getElementById('form-nueva-vac');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('v-start').valueAsDate = new Date();
      document.getElementById('v-end').valueAsDate = new Date();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Aprobar Vacación
    document.querySelectorAll('.btn-aprob-vac').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const request = db.rrhh.leaves.find(l => l.id === id);
        if (request) {
          request.status = "Aprobado";
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast("Solicitud de vacación aprobada con éxito.", 'success');
          this.renderVacations(container);
        }
      });
    });

    // Registrar Solicitud
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const start = new Date(document.getElementById('v-start').value);
      const end = new Date(document.getElementById('v-end').value);
      
      // Calcular diferencia de días
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Incluir día final

      const newLeave = {
        id: window.DolibarrUtils.generateId(db.rrhh.leaves),
        employeeId: parseInt(document.getElementById('v-emp').value),
        type: document.getElementById('v-type').value,
        start_date: document.getElementById('v-start').value,
        end_date: document.getElementById('v-end').value,
        days: diffDays,
        status: "Borrador"
      };

      db.rrhh.leaves.push(newLeave);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Solicitud de vacación registrada en borrador.", 'success');
      closeModal();
      this.renderVacations(container);
    });
  },

  /**
   * Vista: Informes de Gastos
   */
  renderExpenses: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Gastos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-wallet"></i> Hojas de Gastos de Empleados</h1>
        <button id="btn-nuevo-gasto" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Informe de Gasto
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado</th>
              <th>Fecha de Registro</th>
              <th>Descripción del Gasto</th>
              <th style="text-align: right;">Importe Reclamado</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.rrhh.expenses.map(ex => {
              const emp = db.rrhh.employees.find(e => e.id === ex.employeeId) || { first_name: 'Desconocido', last_name: '' };
              
              // Definir acciones
              let actionHtml = '';
              if (ex.status === 'Borrador') {
                actionHtml = `<button class="btn btn-warning btn-sm btn-aprob-gasto" data-id="${ex.id}"><i class="fas fa-check"></i> Aprobar</button>`;
              } else if (ex.status === 'Aprobado') {
                actionHtml = `<button class="btn btn-danger btn-sm btn-reemb-gasto" data-id="${ex.id}" data-monto="${ex.amount_bs}"><i class="fas fa-money-bill-transfer"></i> Reembolsar</button>`;
              } else {
                actionHtml = `<span class="text-muted" style="font-size:12px;"><i class="fas fa-check-double" style="color:var(--success);"></i> Reembolsado</span>`;
              }

              return `
                <tr>
                  <td><code>EXP-${ex.id}</code></td>
                  <td><strong>${emp.first_name} ${emp.last_name}</strong></td>
                  <td>${window.DolibarrUtils.formatDate(ex.date)}</td>
                  <td><strong>${ex.label}</strong></td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(ex.amount_bs)}</td>
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(ex.status)}</td>
                  <td style="text-align: center;">${actionHtml}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: REGISTRAR GASTO -->
      <div class="modal-overlay" id="modal-gasto-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-wallet"></i> Nueva Solicitud de Reembolso</h3>
            <button class="modal-close" id="modal-gasto-close">&times;</button>
          </div>
          <form id="form-nuevo-gasto">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="g-emp">Empleado Solicitante *</label>
                <select id="g-emp" class="form-control" required>
                  <option value="">-- Seleccionar Empleado --</option>
                  ${db.rrhh.employees.map(e => `<option value="${e.id}">${e.first_name} ${e.last_name}</option>`).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="g-date">Fecha del Gasto *</label>
                  <input type="date" id="g-date" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="g-amount">Importe Reclamado (Bs) *</label>
                  <input type="number" step="0.01" id="g-amount" class="form-control" placeholder="0.00" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="g-label">Glosa / Concepto del Gasto *</label>
                <input type="text" id="g-label" class="form-control" placeholder="Ej. Taxi y viáticos viaje Cochabamba" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-gasto">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Gasto</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: LIQUIDAR REEMBOLSO (IMPACTO BANCARIO) -->
      <div class="modal-overlay" id="modal-liquidar-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" style="color:var(--danger);"><i class="fas fa-money-bill-transfer"></i> Liquidar Reembolso Bancario</h3>
            <button class="modal-close" id="modal-liquidar-close">&times;</button>
          </div>
          <form id="form-liquidar-gasto">
            <input type="hidden" id="liquidar-gasto-id">
            <input type="hidden" id="liquidar-gasto-monto">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Monto de Liquidación</label>
                <div style="padding:10px; font-weight:700; font-size:15px; color:var(--danger); background-color:var(--bg-body); border-radius:var(--radius-md);" id="liquidar-monto-disp">
                  Bs. 0,00
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="liquidar-account">Retirar Fondos de Cuenta Bancaria *</label>
                <select id="liquidar-account" class="form-control" required>
                  <option value="">-- Seleccionar Banco --</option>
                  ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-liquidar">Cancelar</button>
              <button type="submit" class="btn btn-danger">Confirmar Reembolso</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Registrar
    const modalGasto = document.getElementById('modal-gasto-overlay');
    const openBtn = document.getElementById('btn-nuevo-gasto');
    const closeBtn = document.getElementById('modal-gasto-close');
    const cancelBtn = document.getElementById('btn-cancel-gasto');
    const form = document.getElementById('form-nuevo-gasto');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('g-date').valueAsDate = new Date();
      modalGasto.classList.add('show');
    });

    const closeModalGasto = () => modalGasto.classList.remove('show');
    closeBtn.addEventListener('click', closeModalGasto);
    cancelBtn.addEventListener('click', closeModalGasto);

    // Aprobar Gasto
    document.querySelectorAll('.btn-aprob-gasto').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const exp = db.rrhh.expenses.find(ex => ex.id === id);
        if (exp) {
          exp.status = "Aprobado";
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast("Informe de gasto aprobado con éxito. Listo para reembolso.", 'success');
          this.renderExpenses(container);
        }
      });
    });

    // Liquidar Reembolso Modal Control
    const modalLiquidar = document.getElementById('modal-liquidar-overlay');
    const closeLiqBtn = document.getElementById('modal-liquidar-close');
    const cancelLiqBtn = document.getElementById('btn-cancel-liquidar');
    const formLiquidar = document.getElementById('form-liquidar-gasto');

    const closeModalLiquidar = () => modalLiquidar.classList.remove('show');
    closeLiqBtn.addEventListener('click', closeModalLiquidar);
    cancelLiqBtn.addEventListener('click', closeModalLiquidar);

    document.querySelectorAll('.btn-reemb-gasto').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const amount = parseFloat(btn.dataset.monto);

        document.getElementById('liquidar-gasto-id').value = id;
        document.getElementById('liquidar-gasto-monto').value = amount;
        document.getElementById('liquidar-monto-disp').textContent = window.DolibarrUtils.formatCurrency(amount);

        modalLiquidar.classList.add('show');
      });
    });

    // Submit Liquidación (Deducción banco, actualiza estado, crea transacción)
    formLiquidar.addEventListener('submit', (e) => {
      e.preventDefault();

      const expenseId = parseInt(document.getElementById('liquidar-gasto-id').value);
      const amount = parseFloat(document.getElementById('liquidar-gasto-monto').value);
      const bankId = parseInt(document.getElementById('liquidar-account').value);

      // 1. Descontar del banco
      const banco = db.bancos.find(b => b.id === bankId);
      if (banco) {
        if (banco.currency === 'USD') {
          banco.balance -= amount / 6.96;
        } else {
          banco.balance -= amount;
        }
      }

      // 2. Modificar estado del gasto
      const exp = db.rrhh.expenses.find(ex => ex.id === expenseId);
      if (exp) {
        exp.status = "Pagado";
      }

      // 3. Crear Registro de Pago (egreso)
      const emp = db.rrhh.employees.find(e => e.id === exp.employeeId) || { first_name: 'Empleado', last_name: '' };
      const newPago = {
        id: window.DolibarrUtils.generateId(db.financiera.pagos),
        type: "proveedor",
        ref: `PAG-EX-${String(db.financiera.pagos.length + 1).padStart(3,'0')}`,
        invoiceRef: `EXP-${expenseId}`,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        method: `Transferencia ${banco ? banco.bank_name : 'Caja'}`
      };
      db.financiera.pagos.push(newPago);

      // 4. Asentar en el Libro Mayor General de Contabilidad
      const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
      db.contabilidad.diario.push(
        { id: nextAsientoId, date: newPago.date, ref: newPago.invoiceRef, desc: `Reembolso Gastos ${emp.first_name} ${emp.last_name}`, account: "620000 - Gastos Personal", debit: amount, credit: 0, journal: "Compras" },
        { id: nextAsientoId + 1, date: newPago.date, ref: newPago.invoiceRef, desc: `Pago Reembolso ${banco ? banco.bank_name : 'Caja'}`, account: `${banco && banco.id === 2 ? '111200 - Banco BMSC' : '111100 - Banco BNB'}`, debit: 0, credit: amount, journal: "Bancos" }
      );

      // Guardar y refrescar
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Reembolso liquidado. Balance bancario y contabilidad actualizados.`, 'success');
      closeModalLiquidar();
      this.renderExpenses(container);
    });

    // Guardar Gasto Nuevo
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newExpense = {
        id: window.DolibarrUtils.generateId(db.rrhh.expenses),
        employeeId: parseInt(document.getElementById('g-emp').value),
        date: document.getElementById('g-date').value,
        amount_bs: parseFloat(document.getElementById('g-amount').value) || 0,
        label: document.getElementById('g-label').value,
        status: "Borrador"
      };

      db.rrhh.expenses.push(newExpense);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Informe de gasto registrado.`, 'success');
      closeModalGasto();
      this.renderExpenses(container);
    });
  }
};
window.DolibarrModules.rrhh = window.DolibarrModules.rrhh;
