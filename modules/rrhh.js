/**
 * rrhh.js - Módulo de Recursos Humanos (Personal, Vacaciones, Gastos, Tiempos y Reclutamiento)
 * Prototipo Dolibarr ERP v23.0.1 - Rediseño Premium
 */

window.DolibarrModules.rrhh = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inyectar estilos personalizados
    this.injectStyles();
    
    if (subRoute === 'empleados') {
      this.renderEmployees(mainContent);
    } else if (subRoute === 'pagos') {
      this.renderPayments(mainContent);
    } else if (subRoute === 'vacaciones') {
      this.renderVacations(mainContent);
    } else if (subRoute === 'gastos') {
      this.renderExpenses(mainContent, params);
    } else if (subRoute === 'tiempo') {
      this.renderTimeStats(mainContent);
    } else if (subRoute === 'puestos') {
      this.renderJobPositions(mainContent);
    } else if (subRoute === 'aplicaciones') {
      this.renderApplications(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Inyección dinámica de hojas de estilo para UI premium
   */
  injectStyles: function() {
    const styleId = 'rrhh-custom-premium-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .rrhh-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        display: inline-block;
        text-align: center;
      }
      .rrhh-badge-borrador { background: #E2E8F0; color: #4A5568; }
      .rrhh-badge-abierto { background: #EBF8FF; color: #2B6CB0; }
      .rrhh-badge-cerrado { background: #FEEBC8; color: #C05621; }
      .rrhh-badge-activo { background: #C6F6D5; color: #22543D; }
      .rrhh-badge-inactivo { background: #FED7D7; color: #742A2A; }
      .rrhh-badge-aprobado { background: #C6F6D5; color: #22543D; }
      .rrhh-badge-rechazado { background: #FED7D7; color: #742A2A; }
      .rrhh-badge-entrevista { background: #EBF8FF; color: #2B6CB0; }
      .rrhh-badge-pagado { background: #C6F6D5; color: #22543D; }

      .payroll-summary-card {
        background: linear-gradient(135deg, #1C2B4B 0%, #3B5998 100%);
        color: white;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .payroll-summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        margin-top: 15px;
      }
      .payroll-summary-item {
        background: rgba(255,255,255,0.1);
        padding: 12px;
        border-radius: 8px;
        backdrop-filter: blur(5px);
      }
      .payroll-summary-label {
        font-size: 11px;
        opacity: 0.8;
        margin-bottom: 4px;
      }
      .payroll-summary-val {
        font-size: 18px;
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

      .expense-item-row:hover {
        background-color: var(--bg-hover) !important;
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
   * Vista: Dashboard de Recursos Humanos
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Cálculos
    const totalEmp = db.rrhh.employees.length;
    const activeEmp = db.rrhh.employees.filter(e => e.status === 'activo');
    const planillaMensual = activeEmp.reduce((sum, e) => sum + e.salary_bs, 0);
    const vacPendientes = db.rrhh.leaves.filter(l => l.status === 'Borrador').length;
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
        <div class="widget-box wb-primary animate__animated animate__fadeIn" onclick="window.location.hash='#/rrhh/empleados'">
          <div class="wb-icon"><i class="fas fa-user-tie"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalEmp}</div>
            <div class="wb-label">Empleados Registrados</div>
          </div>
        </div>

        <div class="widget-box wb-info animate__animated animate__fadeIn" onclick="window.location.hash='#/rrhh/empleados'">
          <div class="wb-icon"><i class="fas fa-coins"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px;">
              ${window.DolibarrUtils.formatCurrency(planillaMensual)}
            </div>
            <div class="wb-label">Planilla Salarial Activa (Mensual)</div>
          </div>
        </div>

        <div class="widget-box wb-warning animate__animated animate__fadeIn" onclick="window.location.hash='#/rrhh/vacaciones'">
          <div class="wb-icon"><i class="fas fa-umbrella-beach"></i></div>
          <div class="wb-details">
            <div class="wb-count">${vacPendientes}</div>
            <div class="wb-label">Solicitudes de Vacación Pend.</div>
          </div>
        </div>

        <div class="widget-box wb-danger animate__animated animate__fadeIn" onclick="window.location.hash='#/rrhh/gastos'">
          <div class="wb-icon"><i class="fas fa-wallet"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px; color: var(--danger);">
              ${window.DolibarrUtils.formatCurrency(gastosPendientes)}
            </div>
            <div class="wb-label">Reembolsos de Gasto Pendientes</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución de Puestos Activos</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-rrhh-puestos"></canvas>
            </div>
          </div>
        </div>

        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar"></i> Horas Dedicadas (Logs de Proyectos)</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-rrhh-horas"></canvas>
            </div>
          </div>
        </div>

      </div>
    `;

    // Gráficos
    if (typeof Chart !== 'undefined') {
      // 1. Gráfico de Puestos
      const roles = {};
      activeEmp.forEach(e => {
        if (!roles[e.role]) roles[e.role] = 0;
        roles[e.role]++;
      });
      window.DolibarrCharts.createDoughnut('chart-rrhh-puestos', Object.keys(roles), Object.values(roles));

      // 2. Gráfico de Horas Trabajadas acumuladas por Empleado
      const labels = activeEmp.map(e => `${e.first_name} ${e.last_name}`);
      const hoursData = activeEmp.map(e => {
        const logs = (db.proyectos.time_logs || []).filter(log => log.employeeId === e.id);
        return logs.reduce((sum, log) => sum + parseFloat(log.hours || 0), 0);
      });

      window.DolibarrCharts.createBar('chart-rrhh-horas', 
        labels, 
        [{
          label: 'Horas Registradas',
          data: hoursData,
          backgroundColor: '#3A78D4',
          borderRadius: 4
        }],
        { indexAxis: 'y' } // Horizontales
      );
    }
  },

  /**
   * Vista: Empleados y Planilla (`#/rrhh/empleados`)
   */
  renderEmployees: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Empleados</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-user-tie"></i> Empleados y Cargos</h1>
        <div class="action-buttons-flex">
          <button id="btn-nuevo-empleado" class="btn btn-primary">
            <i class="fas fa-user-plus"></i> Contratar Personal
          </button>
          <button id="btn-pagar-planilla" class="btn btn-success">
            <i class="fas fa-money-bill-wave"></i> Procesar Pago Planilla
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Puesto / Cargo</th>
              <th>Departamento</th>
              <th style="text-align: right;">Sueldo Base</th>
              <th style="text-align: right;">Días Vac. Libres</th>
              <th>Fecha Contratación</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${db.rrhh.employees.map(e => `
              <tr>
                <td><code>EMP-${String(e.id).padStart(3,'0')}</code></td>
                <td><strong>${e.first_name} ${e.last_name}</strong></td>
                <td><span class="text-muted">${e.role}</span></td>
                <td><span class="text-muted"><i class="fas fa-map-marker-alt" style="color:var(--primary); font-size:12px; margin-right:4px;"></i>${e.department || 'La Paz'}</span></td>
                <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(e.salary_bs)}</td>
                <td style="text-align: right;" class="font-semibold text-success">${e.vacation_days_left !== undefined ? e.vacation_days_left : 15} días</td>
                <td>${window.DolibarrUtils.formatDate(e.hire_date)}</td>
                <td style="text-align: center;"><span class="rrhh-badge rrhh-badge-${e.status}">${e.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: CONTRATAR EMPLEADO -->
      <div class="modal-overlay" id="modal-emp-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-user-plus"></i> Registrar Nuevo Personal</h3>
            <button class="modal-close" id="modal-emp-close">&times;</button>
          </div>
          <form id="form-nuevo-emp">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-first">Nombres *</label>
                  <input type="text" id="e-first" class="form-control" required placeholder="Ej. Juan Carlos">
                </div>
                <div class="form-group">
                  <label class="form-label" for="e-last">Apellidos *</label>
                  <input type="text" id="e-last" class="form-control" required placeholder="Ej. Pérez Choque">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-role">Cargo / Puesto *</label>
                  <input type="text" id="e-role" class="form-control" required placeholder="Ej. Operador de Calderas">
                </div>
                <div class="form-group">
                  <label class="form-label" for="e-dept">Departamento Laboral *</label>
                  <select id="e-dept" class="form-control" required>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Potosí">Potosí</option>
                    <option value="Tarija">Tarija</option>
                    <option value="Chuquisaca">Chuquisaca</option>
                    <option value="Beni">Beni</option>
                    <option value="Pando">Pando</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-salary">Sueldo Básico Mensual (Bs) *</label>
                  <input type="number" step="0.01" id="e-salary" class="form-control" required placeholder="0.00">
                </div>
                <div class="form-group">
                  <label class="form-label" for="e-date">Fecha de Contratación *</label>
                  <input type="date" id="e-date" class="form-control" required>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="e-vac">Días de Vacación Iniciales</label>
                <input type="number" id="e-vac" class="form-control" value="15" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-emp">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Contrato</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: PROCESAR PLANILLA (PAGO SALARIO) -->
      <div class="modal-overlay" id="modal-planilla-overlay">
        <div class="modal-container" style="max-width: 600px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-money-bill-wave"></i> Procesar Pago de Salario</h3>
            <button class="modal-close" id="modal-planilla-close">&times;</button>
          </div>
          <form id="form-pago-planilla">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="p-emp">Seleccionar Empleado *</label>
                  <select id="p-emp" class="form-control" required>
                    <option value="">-- Seleccionar --</option>
                    ${db.rrhh.employees.filter(e => e.status === 'activo').map(e => `
                      <option value="${e.id}">${e.first_name} ${e.last_name} (Sueldo: Bs. ${e.salary_bs})</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="p-periodo">Mes / Periodo *</label>
                  <div style="display:flex; gap:8px;">
                    <select id="p-mes" class="form-control" required>
                      <option value="01">Enero</option>
                      <option value="02">Febrero</option>
                      <option value="03">Marzo</option>
                      <option value="04">Abril</option>
                      <option value="05">Mayo</option>
                      <option value="06">Junio</option>
                      <option value="07">Julio</option>
                      <option value="08">Agosto</option>
                      <option value="09">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                    <input type="number" id="p-anio" class="form-control" value="2026" required style="width:100px;">
                  </div>
                </div>
              </div>

              <!-- Vista previa de cálculo salarial -->
              <div class="payroll-summary-card">
                <div style="font-weight:600; font-size:13px; text-transform:uppercase; opacity:0.9;">Cálculo de Sueldo Neto (Bolivia)</div>
                <div class="payroll-summary-grid">
                  <div class="payroll-summary-item">
                    <div class="payroll-summary-label">Sueldo Básico</div>
                    <div class="payroll-summary-val" id="disp-sueldo">Bs. 0.00</div>
                  </div>
                  <div class="payroll-summary-item">
                    <div class="payroll-summary-label">Bonos / Extras</div>
                    <div class="payroll-summary-val" id="disp-bonos">Bs. 0.00</div>
                  </div>
                  <div class="payroll-summary-item" style="background:rgba(231,76,60,0.15)">
                    <div class="payroll-summary-label">Aportes AFP (12.71%)</div>
                    <div class="payroll-summary-val" id="disp-afp" style="color:#ff8a80">-Bs. 0.00</div>
                  </div>
                  <div class="payroll-summary-item" style="background:rgba(46,204,113,0.2)">
                    <div class="payroll-summary-label">Líquido Pagable</div>
                    <div class="payroll-summary-val" id="disp-liquido" style="color:#b9f6ca">Bs. 0.00</div>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="p-bonos">Bonos Adicionales (Bs)</label>
                  <input type="number" step="0.01" id="p-bonos" class="form-control" value="0.00">
                </div>
                <div class="form-group">
                  <label class="form-label" for="p-bank">Retirar Fondos de *</label>
                  <select id="p-bank" class="form-control" required>
                    <option value="">-- Seleccionar Cuenta --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-planilla">Cancelar</button>
              <button type="submit" class="btn btn-success">Procesar y Pagar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control: Contratar
    const modalEmp = document.getElementById('modal-emp-overlay');
    const openEmpBtn = document.getElementById('btn-nuevo-empleado');
    const closeEmpBtn = document.getElementById('modal-emp-close');
    const cancelEmpBtn = document.getElementById('btn-cancel-emp');
    const formEmp = document.getElementById('form-nuevo-emp');

    openEmpBtn.addEventListener('click', () => {
      formEmp.reset();
      document.getElementById('e-date').valueAsDate = new Date();
      modalEmp.classList.add('show');
    });

    const closeEmpModal = () => modalEmp.classList.remove('show');
    closeEmpBtn.addEventListener('click', closeEmpModal);
    cancelEmpBtn.addEventListener('click', closeEmpModal);

    formEmp.addEventListener('submit', (e) => {
      e.preventDefault();
      const newEmp = {
        id: window.DolibarrUtils.generateId(db.rrhh.employees),
        first_name: document.getElementById('e-first').value,
        last_name: document.getElementById('e-last').value,
        role: document.getElementById('e-role').value,
        department: document.getElementById('e-dept').value,
        salary_bs: parseFloat(document.getElementById('e-salary').value) || 0,
        hire_date: document.getElementById('e-date').value,
        vacation_days_left: parseInt(document.getElementById('e-vac').value) || 15,
        status: "activo"
      };

      db.rrhh.employees.push(newEmp);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Contrato registrado para ${newEmp.first_name} ${newEmp.last_name}`, 'success');
      closeEmpModal();
      this.renderEmployees(container);
    });

    // Modal Control: Planilla
    const modalPlanilla = document.getElementById('modal-planilla-overlay');
    const openPlanillaBtn = document.getElementById('btn-pagar-planilla');
    const closePlanillaBtn = document.getElementById('modal-planilla-close');
    const cancelPlanillaBtn = document.getElementById('btn-cancel-planilla');
    const formPlanilla = document.getElementById('form-pago-planilla');

    const selectEmp = document.getElementById('p-emp');
    const inputBonos = document.getElementById('p-bonos');
    const dispSueldo = document.getElementById('disp-sueldo');
    const dispBonos = document.getElementById('disp-bonos');
    const dispAfp = document.getElementById('disp-afp');
    const dispNet = document.getElementById('disp-liquido');

    // Cálculos en vivo en el modal de planilla
    const updateCalculos = () => {
      const empId = parseInt(selectEmp.value);
      const emp = db.rrhh.employees.find(e => e.id === empId);
      const salary = emp ? emp.salary_bs : 0;
      const bonos = parseFloat(inputBonos.value) || 0;
      const total = salary + bonos;
      const afp = total * 0.1271;
      const net = total - afp;

      dispSueldo.textContent = window.DolibarrUtils.formatCurrency(salary);
      dispBonos.textContent = window.DolibarrUtils.formatCurrency(bonos);
      dispAfp.textContent = '-' + window.DolibarrUtils.formatCurrency(afp);
      dispNet.textContent = window.DolibarrUtils.formatCurrency(net);
    };

    selectEmp.addEventListener('change', updateCalculos);
    inputBonos.addEventListener('input', updateCalculos);

    openPlanillaBtn.addEventListener('click', () => {
      formPlanilla.reset();
      updateCalculos();
      modalPlanilla.classList.add('show');
    });

    const closePlanillaModal = () => modalPlanilla.classList.remove('show');
    closePlanillaBtn.addEventListener('click', closePlanillaModal);
    cancelPlanillaBtn.addEventListener('click', closePlanillaModal);

    formPlanilla.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = parseInt(selectEmp.value);
      const emp = db.rrhh.employees.find(e => e.id === empId);
      const bankId = parseInt(document.getElementById('p-bank').value);
      const mes = document.getElementById('p-mes').value;
      const anio = document.getElementById('p-anio').value;

      if (!emp) return;

      const salary = emp.salary_bs;
      const bonos = parseFloat(inputBonos.value) || 0;
      const total = salary + bonos;
      const afp = total * 0.1271;
      const net = total - afp;

      const banco = db.bancos.find(b => b.id === bankId);
      if (!banco) return;

      const amountToDeduct = banco.currency === 'USD' ? net / 6.96 : net;
      if (banco.balance < amountToDeduct) {
        window.DolibarrUtils.showToast("Saldo insuficiente en el banco seleccionado.", "error");
        return;
      }

      // Deducción del banco
      banco.balance -= amountToDeduct;

      // Registrar Planilla en rrhh
      const newPay = {
        id: window.DolibarrUtils.generateId(db.rrhh.payroll_payments),
        employeeId: empId,
        month: mes,
        year: anio,
        salary_bs: salary,
        bonuses_bs: bonos,
        deductions_bs: afp,
        net_paid_bs: net,
        date: new Date().toISOString().split('T')[0],
        status: "Pagado",
        bankId: bankId
      };
      db.rrhh.payroll_payments.push(newPay);

      // Registrar Pago general
      const newPagoFin = {
        id: window.DolibarrUtils.generateId(db.financiera.pagos),
        type: "proveedor",
        ref: `PAG-PLAN-${newPay.id}`,
        invoiceRef: `PLAN-${mes}-${anio}`,
        amount: net,
        date: newPay.date,
        method: `Planilla - ${banco.bank_name}`
      };
      db.financiera.pagos.push(newPagoFin);

      // Asentar en Libro Mayor (Contabilidad)
      const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
      db.contabilidad.diario.push(
        { id: nextAsientoId, date: newPay.date, ref: newPagoFin.invoiceRef, desc: `Planilla Sueldos ${emp.first_name} ${emp.last_name} ${mes}/${anio}`, account: "620000 - Gastos Personal", debit: total, credit: 0, journal: "Compras" },
        { id: nextAsientoId + 1, date: newPay.date, ref: newPagoFin.invoiceRef, desc: `Pago Planilla Salarios Banco`, account: `${banco.id === 2 ? '111200 - Banco BMSC' : '111100 - Banco BNB'}`, debit: 0, credit: net, journal: "Bancos" },
        { id: nextAsientoId + 2, date: newPay.date, ref: newPagoFin.invoiceRef, desc: `Aportes AFP Retenidos ${mes}/${anio}`, account: "213020 - Retenciones AFP por Pagar", debit: 0, credit: afp, journal: "Compras" }
      );

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Pago de planilla procesado con éxito.", "success");
      closePlanillaModal();
      this.renderEmployees(container);
    });
  },

  /**
   * Vista: Historial de Pagos de Salarios (`#/rrhh/pagos`)
   */
  renderPayments: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Pagos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-money-bill-wave"></i> Historial de Pagos de Salarios</h1>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Empleado</th>
              <th>Periodo</th>
              <th style="text-align: right;">Sueldo Base</th>
              <th style="text-align: right;">Bonos/Extras</th>
              <th style="text-align: right;">Deducciones AFP</th>
              <th style="text-align: right;">Líquido Pagable</th>
              <th>Fecha de Pago</th>
              <th>Banco Payout</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${(db.rrhh.payroll_payments || []).map(p => {
              const emp = db.rrhh.employees.find(e => e.id === p.employeeId) || { first_name: 'Desconocido', last_name: '' };
              const b = db.bancos.find(bank => bank.id === p.bankId) || { bank_name: 'Caja Chica' };
              return `
                <tr>
                  <td><code>PLAN-PAG-${String(p.id).padStart(3,'0')}</code></td>
                  <td><strong>${emp.first_name} ${emp.last_name}</strong></td>
                  <td><span class="font-semibold text-primary">${p.month}/${p.year}</span></td>
                  <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(p.salary_bs)}</td>
                  <td style="text-align: right; color:var(--success);">+${window.DolibarrUtils.formatCurrency(p.bonuses_bs)}</td>
                  <td style="text-align: right; color:var(--danger); font-size:12px;">-${window.DolibarrUtils.formatCurrency(p.deductions_bs)}</td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.net_paid_bs)}</td>
                  <td>${window.DolibarrUtils.formatDate(p.date)}</td>
                  <td><span class="text-muted"><i class="fas fa-university"></i> ${b.bank_name}</span></td>
                  <td style="text-align: center;"><span class="rrhh-badge rrhh-badge-pagado">${p.status}</span></td>
                </tr>
              `;
            }).join('')}
            ${(!db.rrhh.payroll_payments || db.rrhh.payroll_payments.length === 0) ? `
              <tr>
                <td colspan="10" class="text-center text-muted" style="padding: 20px;">No hay registros de salarios liquidados.</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Vista: Vacaciones y Permisos Colectivos (`#/rrhh/vacaciones`)
   */
  renderVacations: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Vacaciones</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-umbrella-beach"></i> Licencias y Vacaciones</h1>
        <div class="action-buttons-flex">
          <button id="btn-nueva-vac" class="btn btn-primary">
            <i class="fas fa-plus"></i> Solicitar Vacación
          </button>
          <button id="btn-vac-colectiva" class="btn btn-warning">
            <i class="fas fa-users"></i> Licencia Colectiva
          </button>
        </div>
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
              <th style="text-align: right;">Días</th>
              <th>Glosa / Detalle</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${db.rrhh.leaves.map(l => {
              const emp = db.rrhh.employees.find(e => e.id === l.employeeId) || { first_name: 'Desconocido', last_name: '' };
              return `
                <tr class="cursor-pointer-row" onclick="window.DolibarrModules.rrhh.openFichaVacacion(${l.id})">
                  <td><code>SOL-${l.id}</code></td>
                  <td><strong>${emp.first_name} ${emp.last_name}</strong></td>
                  <td><span class="text-muted">${l.type}</span></td>
                  <td>${window.DolibarrUtils.formatDate(l.start_date)}</td>
                  <td>${window.DolibarrUtils.formatDate(l.end_date)}</td>
                  <td style="text-align: right;" class="font-semibold">${l.days} días</td>
                  <td><span class="text-muted">${l.reason || 'Sin justificación'}</span></td>
                  <td style="text-align: center;"><span class="rrhh-badge rrhh-badge-${l.status.toLowerCase()}">${l.status}</span></td>
                  <td style="text-align: center;" onclick="event.stopPropagation()">
                    ${l.status === 'Borrador' ? `
                      <div class="action-buttons-flex">
                        <button class="btn btn-success btn-sm" onclick="window.DolibarrModules.rrhh.procesarVacacion(${l.id}, 'Aprobado')"><i class="fas fa-check"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="window.DolibarrModules.rrhh.procesarVacacion(${l.id}, 'Rechazado')"><i class="fas fa-times"></i></button>
                      </div>
                    ` : `<span class="text-muted" style="font-size:12px;">Procesado</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: SOLICITAR VACACION INDIVIDUAL -->
      <div class="modal-overlay" id="modal-vac-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-calendar-plus"></i> Nueva Solicitud de Licencia</h3>
            <button class="modal-close" id="modal-vac-close">&times;</button>
          </div>
          <form id="form-nueva-vac">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="v-emp">Seleccionar Empleado *</label>
                <select id="v-emp" class="form-control" required>
                  <option value="">-- Seleccionar --</option>
                  ${db.rrhh.employees.map(e => `<option value="${e.id}">${e.first_name} ${e.last_name} (Sobrante: ${e.vacation_days_left} días)</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="v-type">Tipo de Licencia *</label>
                <select id="v-type" class="form-control" required>
                  <option value="Vacación">Vacación Anual Retribuida</option>
                  <option value="Baja Médica">Baja Médica Justificada</option>
                  <option value="Licencia Personal">Licencia (Matrimonio, Duelo, etc.)</option>
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

              <div style="margin: 12px 0; font-weight: 600; color: var(--primary);">
                Duración calculada: <span id="v-disp-days" class="text-success">0 días</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="v-reason">Glosa / Motivo *</label>
                <input type="text" id="v-reason" class="form-control" placeholder="Ej. Viaje familiar, Baja médica por cirugía" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-vac">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar en Borrador</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: LICENCIA COLECTIVA -->
      <div class="modal-overlay" id="modal-colectiva-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" style="color: var(--warning);"><i class="fas fa-users"></i> Registrar Licencia Colectiva</h3>
            <button class="modal-close" id="modal-colectiva-close">&times;</button>
          </div>
          <form id="form-colectiva-vac">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="vc-dept">Alcance / Departamento *</label>
                  <select id="vc-dept" class="form-control" required>
                    <option value="TODOS">Todos los departamentos</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Oruro">Oruro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="vc-type">Tipo de Licencia *</label>
                  <select id="vc-type" class="form-control" required>
                    <option value="Vacación Colectiva">Vacación Colectiva</option>
                    <option value="Feriado">Feriado Nacional / Departamental</option>
                    <option value="Licencia Especial">Licencia Especial Colectiva</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="vc-start">Desde *</label>
                  <input type="date" id="vc-start" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="vc-end">Hasta *</label>
                  <input type="date" id="vc-end" class="form-control" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="vc-reason">Glosa / Concepto Colectivo *</label>
                <input type="text" id="vc-reason" class="form-control" placeholder="Ej. Feriado de Año Nuevo Aymara" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-colectiva">Cancelar</button>
              <button type="submit" class="btn btn-warning">Aplicar Colectivo (Aprobado)</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: FICHA DETALLADA VACACION -->
      <div class="modal-overlay" id="modal-ficha-vac-overlay">
        <div class="modal-container" id="ficha-vac-container">
          <!-- Se rellena dinámicamente -->
        </div>
      </div>
    `;

    // Modal Control: Individual
    const modalVac = document.getElementById('modal-vac-overlay');
    const openVacBtn = document.getElementById('btn-nueva-vac');
    const closeVacBtn = document.getElementById('modal-vac-close');
    const cancelVacBtn = document.getElementById('btn-cancel-vac');
    const formVac = document.getElementById('form-nueva-vac');

    const inputStart = document.getElementById('v-start');
    const inputEnd = document.getElementById('v-end');
    const dispDays = document.getElementById('v-disp-days');

    const updateDaysCount = () => {
      const start = new Date(inputStart.value);
      const end = new Date(inputEnd.value);
      if (inputStart.value && inputEnd.value && end >= start) {
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        dispDays.textContent = `${diff} días`;
      } else {
        dispDays.textContent = '0 días';
      }
    };

    inputStart.addEventListener('change', updateDaysCount);
    inputEnd.addEventListener('change', updateDaysCount);

    openVacBtn.addEventListener('click', () => {
      formVac.reset();
      inputStart.valueAsDate = new Date();
      inputEnd.valueAsDate = new Date();
      updateDaysCount();
      modalVac.classList.add('show');
    });

    const closeVacModal = () => modalVac.classList.remove('show');
    closeVacBtn.addEventListener('click', closeVacModal);
    cancelVacBtn.addEventListener('click', closeVacModal);

    formVac.addEventListener('submit', (e) => {
      e.preventDefault();
      const start = new Date(inputStart.value);
      const end = new Date(inputEnd.value);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const newLeave = {
        id: window.DolibarrUtils.generateId(db.rrhh.leaves),
        employeeId: parseInt(document.getElementById('v-emp').value),
        type: document.getElementById('v-type').value,
        start_date: inputStart.value,
        end_date: inputEnd.value,
        days: diff,
        reason: document.getElementById('v-reason').value,
        status: "Borrador"
      };

      db.rrhh.leaves.push(newLeave);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Solicitud registrada en Borrador.", "success");
      closeVacModal();
      this.renderVacations(container);
    });

    // Modal Control: Colectivo
    const modalCol = document.getElementById('modal-colectiva-overlay');
    const openColBtn = document.getElementById('btn-vac-colectiva');
    const closeColBtn = document.getElementById('modal-colectiva-close');
    const cancelColBtn = document.getElementById('btn-cancel-colectiva');
    const formCol = document.getElementById('form-colectiva-vac');

    openColBtn.addEventListener('click', () => {
      formCol.reset();
      document.getElementById('vc-start').valueAsDate = new Date();
      document.getElementById('vc-end').valueAsDate = new Date();
      modalCol.classList.add('show');
    });

    const closeColModal = () => modalCol.classList.remove('show');
    closeColBtn.addEventListener('click', closeColModal);
    cancelColBtn.addEventListener('click', closeColModal);

    formCol.addEventListener('submit', (e) => {
      e.preventDefault();
      const dept = document.getElementById('vc-dept').value;
      const type = document.getElementById('vc-type').value;
      const startStr = document.getElementById('vc-start').value;
      const endStr = document.getElementById('vc-end').value;
      const reason = document.getElementById('vc-reason').value;

      const start = new Date(startStr);
      const end = new Date(endStr);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      // Filtrar empleados
      const targets = db.rrhh.employees.filter(emp => emp.status === 'activo' && (dept === 'TODOS' || emp.department === dept));
      
      if (targets.length === 0) {
        window.DolibarrUtils.showToast("No se encontraron empleados activos en el grupo seleccionado.", "error");
        return;
      }

      targets.forEach(emp => {
        const leaf = {
          id: window.DolibarrUtils.generateId(db.rrhh.leaves),
          employeeId: emp.id,
          type: type,
          start_date: startStr,
          end_date: endStr,
          days: diff,
          reason: reason,
          status: "Aprobado"
        };
        db.rrhh.leaves.push(leaf);

        // Descontar saldo de vacación si aplica
        if (type === 'Vacación Colectiva') {
          emp.vacation_days_left = Math.max(0, (emp.vacation_days_left || 15) - diff);
        }
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Licencia Colectiva aprobada y cargada a ${targets.length} empleados.`, "success");
      closeColModal();
      this.renderVacations(container);
    });
  },

  /**
   * Acción: Aprobar/Rechazar Vacación
   */
  procesarVacacion: function(id, status) {
    const db = window.DolibarrDB.get();
    const leaf = db.rrhh.leaves.find(l => l.id === id);
    if (!leaf) return;

    if (status === 'Aprobado') {
      const emp = db.rrhh.employees.find(e => e.id === leaf.employeeId);
      if (emp && leaf.type === 'Vacación') {
        emp.vacation_days_left = Math.max(0, (emp.vacation_days_left || 15) - leaf.days);
      }
    }
    
    leaf.status = status;
    window.DolibarrDB.save(db);
    window.DolibarrUtils.showToast(`Solicitud SOL-${id} cambiada a ${status}.`, "success");
    
    // Si la ficha detallada está abierta, cerrarla
    const fModal = document.getElementById('modal-ficha-vac-overlay');
    if (fModal) fModal.classList.remove('show');
    
    this.renderVacations(document.getElementById('main-content'));
  },

  /**
   * Modal: Ver Ficha Detallada de Licencia
   */
  openFichaVacacion: function(id) {
    const db = window.DolibarrDB.get();
    const l = db.rrhh.leaves.find(leave => leave.id === id);
    if (!l) return;

    const emp = db.rrhh.employees.find(e => e.id === l.employeeId) || { first_name: 'Desconocido', last_name: '' };
    const container = document.getElementById('ficha-vac-container');
    const modal = document.getElementById('modal-ficha-vac-overlay');

    container.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title"><i class="fas fa-file-alt"></i> Ficha de Licencia SOL-${l.id}</h3>
        <button class="modal-close" onclick="document.getElementById('modal-ficha-vac-overlay').classList.remove('show')">&times;</button>
      </div>
      <div class="modal-body">
        <table class="table table-bordered">
          <tbody>
            <tr>
              <th width="35%">Empleado</th>
              <td><strong>${emp.first_name} ${emp.last_name}</strong> <span class="text-muted">(Puesto: ${emp.role})</span></td>
            </tr>
            <tr>
              <th>Tipo de Licencia</th>
              <td><span class="text-primary font-semibold">${l.type}</span></td>
            </tr>
            <tr>
              <th>Periodo</th>
              <td>Desde <strong>${window.DolibarrUtils.formatDate(l.start_date)}</strong> hasta <strong>${window.DolibarrUtils.formatDate(l.end_date)}</strong></td>
            </tr>
            <tr>
              <th>Días Totales</th>
              <td><span class="font-semibold text-danger">${l.days} días</span></td>
            </tr>
            <tr>
              <th>Glosa / Justificativo</th>
              <td><em>"${l.reason || 'Sin glosa'}"</em></td>
            </tr>
            <tr>
              <th>Estado Actual</th>
              <td><span class="rrhh-badge rrhh-badge-${l.status.toLowerCase()}">${l.status}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-ficha-vac-overlay').classList.remove('show')">Cerrar</button>
        ${l.status === 'Borrador' ? `
          <button type="button" class="btn btn-danger" onclick="window.DolibarrModules.rrhh.procesarVacacion(${l.id}, 'Rechazado')"><i class="fas fa-times"></i> Rechazar</button>
          <button type="button" class="btn btn-success" onclick="window.DolibarrModules.rrhh.procesarVacacion(${l.id}, 'Aprobado')"><i class="fas fa-check"></i> Aprobar Licencia</button>
        ` : ''}
      </div>
    `;

    modal.classList.add('show');
  },

  /**
   * Vista: Hojas de Gastos (Itemizada con detalle Ficha)
   */
  renderExpenses: function(container, params) {
    const db = window.DolibarrDB.get();

    // Caso A: Mostrar Ficha de un Gasto Específico (?id=1)
    if (params && params.id) {
      const expId = parseInt(params.id);
      const ex = db.rrhh.expenses.find(item => item.id === expId);
      if (!ex) {
        container.innerHTML = `<div class="alert alert-danger">Error: Gasto no encontrado.</div>`;
        return;
      }

      const emp = db.rrhh.employees.find(e => e.id === ex.employeeId) || { first_name: 'Desconocido', last_name: '' };
      
      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> 
          <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> 
          <a href="#/rrhh/gastos">Gastos</a> <i class="fas fa-chevron-right"></i> 
          <strong>Ficha de Gasto EXP-${ex.id}</strong>
        </div>

        <div class="page-header">
          <h1 class="page-title"><i class="fa-solid fa-file-invoice-dollar"></i> Ficha de Gasto EXP-${ex.id}</h1>
          <div class="action-buttons-flex">
            <button class="btn btn-secondary" onclick="window.location.hash='#/rrhh/gastos'">
              <i class="fas fa-arrow-left"></i> Volver a Hojas
            </button>
            ${ex.status === 'Borrador' ? `
              <button class="btn btn-success" id="btn-aprobar-exp">
                <i class="fas fa-check"></i> Aprobar Informe
              </button>
            ` : ''}
            ${ex.status === 'Aprobado' ? `
              <button class="btn btn-danger" id="btn-reembolsar-exp">
                <i class="fas fa-money-bill-transfer"></i> Liquidar Reembolso
              </button>
            ` : ''}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 2fr; gap:24px;">
          
          <!-- Ficha Resumen -->
          <div class="card glass-card">
            <div class="card-header">
              <div class="card-title">Resumen de la Ficha</div>
            </div>
            <div class="card-body" style="padding:16px;">
              <table class="table table-bordered" style="font-size:13px; margin:0;">
                <tbody>
                  <tr>
                    <th>Empleado</th>
                    <td><strong>${emp.first_name} ${emp.last_name}</strong></td>
                  </tr>
                  <tr>
                    <th>Fecha Cabecera</th>
                    <td>${window.DolibarrUtils.formatDate(ex.date)}</td>
                  </tr>
                  <tr>
                    <th>Concepto Gral.</th>
                    <td>${ex.label}</td>
                  </tr>
                  <tr>
                    <th>Total Solicitado</th>
                    <td class="font-semibold text-danger" style="font-size:15px;">
                      ${window.DolibarrUtils.formatCurrency(ex.amount_bs)}
                    </td>
                  </tr>
                  <tr>
                    <th>Estado</th>
                    <td><span class="rrhh-badge rrhh-badge-${ex.status.toLowerCase()}">${ex.status}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Grilla de Líneas de Gasto -->
          <div class="card glass-card">
            <div class="card-header">
              <div class="card-title">Detalle de Ítems de Gasto</div>
            </div>
            <div class="card-body">
              
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto / Glosa del Ítem</th>
                      <th>Categoría</th>
                      <th style="text-align: right;">Importe</th>
                      ${ex.status === 'Borrador' ? `<th style="text-align: center;">Eliminar</th>` : ''}
                    </tr>
                  </thead>
                  <tbody>
                    ${(ex.lines || []).map(line => `
                      <tr class="expense-item-row">
                        <td>${window.DolibarrUtils.formatDate(line.date)}</td>
                        <td><strong>${line.concept}</strong></td>
                        <td><span class="text-muted" style="font-size:12px;">${line.category}</span></td>
                        <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(line.amount_bs)}</td>
                        ${ex.status === 'Borrador' ? `
                          <td style="text-align: center;">
                            <button class="btn btn-danger btn-sm btn-del-line" data-line-id="${line.id}" style="padding: 2px 6px;">
                              <i class="fas fa-trash-can"></i>
                            </button>
                          </td>
                        ` : ''}
                      </tr>
                    `).join('')}
                    ${(!ex.lines || ex.lines.length === 0) ? `
                      <tr>
                        <td colspan="5" class="text-center text-muted" style="padding: 16px;">Sin ítems registrados. Añada una línea abajo.</td>
                      </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>

              <!-- Formulario de carga de líneas (Solo si está en Borrador) -->
              ${ex.status === 'Borrador' ? `
                <div style="border-top:1px dashed var(--border-color); margin-top:20px; padding-top:16px;">
                  <h4 style="margin-bottom:12px; font-size:14px;"><i class="fas fa-plus"></i> Añadir Ítem de Gasto</h4>
                  <form id="form-add-gasto-line" style="display:grid; grid-template-columns: 1fr 1fr 1fr 100px 80px; gap:8px; align-items:end;">
                    <div class="form-group" style="margin:0;">
                      <label class="form-label" style="font-size:11px;">Fecha</label>
                      <input type="date" id="l-date" class="form-control" required style="font-size:12px; padding: 6px;">
                    </div>
                    <div class="form-group" style="margin:0;">
                      <label class="form-label" style="font-size:11px;">Concepto del Gasto</label>
                      <input type="text" id="l-concept" class="form-control" placeholder="Ej. Taxi terminal" required style="font-size:12px; padding: 6px;">
                    </div>
                    <div class="form-group" style="margin:0;">
                      <label class="form-label" style="font-size:11px;">Categoría</label>
                      <select id="l-category" class="form-control" required style="font-size:12px; padding: 6px;">
                        <option value="Transporte">Transporte / Viáticos</option>
                        <option value="Alimentación">Alimentación</option>
                        <option value="Alojamiento">Alojamiento / Hotel</option>
                        <option value="Materiales">Materiales e Insumos</option>
                        <option value="Otros">Otros Gastos</option>
                      </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                      <label class="form-label" style="font-size:11px;">Importe (Bs)</label>
                      <input type="number" step="0.01" id="l-amount" class="form-control" placeholder="0.00" required style="font-size:12px; padding: 6px;">
                    </div>
                    <button type="submit" class="btn btn-primary" style="padding: 8px;"><i class="fas fa-plus"></i></button>
                  </form>
                </div>
              ` : ''}

            </div>
          </div>

        </div>

        <!-- MODAL: LIQUIDAR REEMBOLSO EXP -->
        <div class="modal-overlay" id="modal-liq-exp-overlay">
          <div class="modal-container">
            <div class="modal-header">
              <h3 class="modal-title" style="color:var(--danger);"><i class="fas fa-money-bill-transfer"></i> Pagar Reembolso Gasto</h3>
              <button class="modal-close" onclick="document.getElementById('modal-liq-exp-overlay').classList.remove('show')">&times;</button>
            </div>
            <form id="form-liq-expense">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label">Monto del Reembolso</label>
                  <div style="padding:10px; font-weight:700; font-size:16px; color:var(--danger); background-color:var(--bg-body); border-radius:4px;">
                    ${window.DolibarrUtils.formatCurrency(ex.amount_bs)}
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="liq-bank-account">Origen de Fondos Bancarios *</label>
                  <select id="liq-bank-account" class="form-control" required>
                    <option value="">-- Seleccionar Banco --</option>
                    ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.currency} ${b.balance})</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-liq-exp-overlay').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn btn-danger">Confirmar Transferencia</button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Control del formulario de líneas
      const formLine = document.getElementById('form-add-gasto-line');
      if (formLine) {
        document.getElementById('l-date').valueAsDate = new Date();
        formLine.addEventListener('submit', (e) => {
          e.preventDefault();
          const amount = parseFloat(document.getElementById('l-amount').value) || 0;
          const newLine = {
            id: window.DolibarrUtils.generateId(ex.lines || []),
            date: document.getElementById('l-date').value,
            concept: document.getElementById('l-concept').value,
            category: document.getElementById('l-category').value,
            amount_bs: amount
          };
          if (!ex.lines) ex.lines = [];
          ex.lines.push(newLine);

          // Recalcular total de cabecera
          ex.amount_bs = ex.lines.reduce((sum, l) => sum + l.amount_bs, 0);

          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast("Item agregado con éxito", "success");
          this.renderExpenses(container, params);
        });
      }

      // Eliminar línea
      document.querySelectorAll('.btn-del-line').forEach(btn => {
        btn.addEventListener('click', () => {
          const lId = parseInt(btn.dataset.lineId);
          ex.lines = ex.lines.filter(l => l.id !== lId);
          ex.amount_bs = ex.lines.reduce((sum, l) => sum + l.amount_bs, 0);

          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast("Item eliminado", "warning");
          this.renderExpenses(container, params);
        });
      });

      // Aprobar Gasto
      const btnAprobar = document.getElementById('btn-aprobar-exp');
      if (btnAprobar) {
        btnAprobar.addEventListener('click', () => {
          ex.status = "Aprobado";
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast("Informe de gasto aprobado.", "success");
          this.renderExpenses(container, params);
        });
      }

      // Liquidar Reembolso
      const btnReemb = document.getElementById('btn-reembolsar-exp');
      const modalLiq = document.getElementById('modal-liq-exp-overlay');
      const formLiq = document.getElementById('form-liq-expense');
      
      if (btnReemb) {
        btnReemb.addEventListener('click', () => {
          modalLiq.classList.add('show');
        });
      }

      if (formLiq) {
        formLiq.addEventListener('submit', (e) => {
          e.preventDefault();
          const bankId = parseInt(document.getElementById('liq-bank-account').value);
          const banco = db.bancos.find(b => b.id === bankId);
          if (!banco) return;

          const amount = ex.amount_bs;
          const amountToDeduct = banco.currency === 'USD' ? amount / 6.96 : amount;
          if (banco.balance < amountToDeduct) {
            window.DolibarrUtils.showToast("Saldo insuficiente en el banco seleccionado.", "error");
            return;
          }

          // 1. Descontar banco
          banco.balance -= amountToDeduct;

          // 2. Estado Pagado
          ex.status = "Pagado";

          // 3. Crear Registro Pago
          const newPago = {
            id: window.DolibarrUtils.generateId(db.financiera.pagos),
            type: "proveedor",
            ref: `PAG-EX-${String(db.financiera.pagos.length + 1).padStart(3,'0')}`,
            invoiceRef: `EXP-${ex.id}`,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            method: `Transferencia - ${banco.bank_name}`
          };
          db.financiera.pagos.push(newPago);

          // 4. Asentar en diario
          const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
          db.contabilidad.diario.push(
            { id: nextAsientoId, date: newPago.date, ref: newPago.invoiceRef, desc: `Reembolso Gastos ${emp.first_name} ${emp.last_name}`, account: "620000 - Gastos Personal", debit: amount, credit: 0, journal: "Compras" },
            { id: nextAsientoId + 1, date: newPago.date, ref: newPago.invoiceRef, desc: `Pago Reembolso ${banco.bank_name}`, account: `${banco.id === 2 ? '111200 - Banco BMSC' : '111100 - Banco BNB'}`, debit: 0, credit: amount, journal: "Bancos" }
          );

          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast("Gasto reembolsado. Transacción bancaria y Libro Mayor actualizados.", "success");
          modalLiq.classList.remove('show');
          this.renderExpenses(container, params);
        });
      }

    } 
    // Caso B: Listado General de Hojas de Gasto
    else {
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
                
                let actionHtml = `
                  <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#/rrhh/gastos?id=${ex.id}'">
                    <i class="fas fa-eye"></i> Ficha
                  </button>
                `;

                return `
                  <tr class="cursor-pointer-row" onclick="window.location.hash='#/rrhh/gastos?id=${ex.id}'">
                    <td><code>EXP-${ex.id}</code></td>
                    <td><strong>${emp.first_name} ${emp.last_name}</strong></td>
                    <td>${window.DolibarrUtils.formatDate(ex.date)}</td>
                    <td><strong>${ex.label}</strong></td>
                    <td style="text-align: right;" class="font-semibold text-danger">${window.DolibarrUtils.formatCurrency(ex.amount_bs)}</td>
                    <td style="text-align: center;"><span class="rrhh-badge rrhh-badge-${ex.status.toLowerCase()}">${ex.status}</span></td>
                    <td style="text-align: center;" onclick="event.stopPropagation()">${actionHtml}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- MODAL: CREAR CABECERA GASTO -->
        <div class="modal-overlay" id="modal-gasto-cab-overlay">
          <div class="modal-container">
            <div class="modal-header">
              <h3 class="modal-title"><i class="fas fa-wallet"></i> Crear Informe de Gasto</h3>
              <button class="modal-close" id="modal-gasto-cab-close">&times;</button>
            </div>
            <form id="form-nuevo-gasto-cab">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label" for="g-emp">Empleado Solicitante *</label>
                  <select id="g-emp" class="form-control" required>
                    <option value="">-- Seleccionar Empleado --</option>
                    ${db.rrhh.employees.map(e => `<option value="${e.id}">${e.first_name} ${e.last_name}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="g-date">Fecha de Registro *</label>
                  <input type="date" id="g-date" class="form-control" required>
                </div>

                <div class="form-group">
                  <label class="form-label" for="g-label">Glosa / Concepto General *</label>
                  <input type="text" id="g-label" class="form-control" placeholder="Ej. Gastos viaje de inspección Tarija" required>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="btn-cancel-gasto-cab">Cancelar</button>
                <button type="submit" class="btn btn-primary">Crear y Cargar Detalle</button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Modal Cabecera
      const modal = document.getElementById('modal-gasto-cab-overlay');
      const openBtn = document.getElementById('btn-nuevo-gasto');
      const closeBtn = document.getElementById('modal-gasto-cab-close');
      const cancelBtn = document.getElementById('btn-cancel-gasto-cab');
      const form = document.getElementById('form-nuevo-gasto-cab');

      if (openBtn) {
        openBtn.addEventListener('click', () => {
          form.reset();
          document.getElementById('g-date').valueAsDate = new Date();
          modal.classList.add('show');
        });
      }

      const closeModal = () => modal.classList.remove('show');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();

          const newEx = {
            id: window.DolibarrUtils.generateId(db.rrhh.expenses),
            employeeId: parseInt(document.getElementById('g-emp').value),
            date: document.getElementById('g-date').value,
            label: document.getElementById('g-label').value,
            amount_bs: 0.00,
            status: "Borrador",
            accounting_status: "pending",
            lines: []
          };

          db.rrhh.expenses.push(newEx);
          window.DolibarrDB.save(db);
          closeModal();
          
          // Redireccionar inmediatamente a la ficha del nuevo gasto
          window.location.hash = `#/rrhh/gastos?id=${newEx.id}`;
        });
      }
    }
  },

  /**
   * Vista: Seguimiento del Tiempo (`#/rrhh/tiempo`)
   */
  renderTimeStats: function(container) {
    const db = window.DolibarrDB.get();

    // Recopilación de logs
    const logs = db.proyectos.time_logs || [];
    const totalHours = logs.reduce((sum, l) => sum + parseFloat(l.hours || 0), 0);
    const totalTasks = db.proyectos.tasks ? db.proyectos.tasks.length : 0;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Tiempos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-clock"></i> Seguimiento de Tiempo Dedicado</h1>
      </div>

      <!-- Widgets de Tiempo -->
      <div class="widget-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 24px;">
        <div class="widget-box wb-primary" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-business-time"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalHours} horas</div>
            <div class="wb-label">Total de Horas Registradas en Proyectos</div>
          </div>
        </div>

        <div class="widget-box wb-info" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-check-double"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalTasks} tareas</div>
            <div class="wb-label">Tareas de Proyecto bajo Monitoreo</div>
          </div>
        </div>
      </div>

      <!-- Gráficos de Análisis -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
        
        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-user"></i> Carga de Trabajo por Colaborador</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-tiempo-emp"></canvas>
            </div>
          </div>
        </div>

        <div class="card glass-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-project-diagram"></i> Distribución de Horas por Proyecto</div>
          </div>
          <div class="card-body">
            <div class="chart-container-premium">
              <canvas id="chart-tiempo-proj"></canvas>
            </div>
          </div>
        </div>

      </div>

      <!-- Tabla Resumen -->
      <div class="card glass-card" style="margin-top:24px;">
        <div class="card-header">
          <div class="card-title">Resumen de Horas de Personal</div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Departamento</th>
                  <th style="text-align: right;">Horas Dedicadas</th>
                  <th style="text-align: right;">Porcentaje de Aportación</th>
                </tr>
              </thead>
              <tbody>
                ${db.rrhh.employees.filter(e => e.status === 'activo').map(e => {
                  const empLogs = logs.filter(log => log.employeeId === e.id);
                  const empHours = empLogs.reduce((sum, log) => sum + parseFloat(log.hours || 0), 0);
                  const pct = totalHours > 0 ? ((empHours / totalHours) * 100).toFixed(1) : '0.0';
                  
                  return `
                    <tr>
                      <td><strong>${e.first_name} ${e.last_name}</strong> <span class="text-muted" style="font-size:12px;">(${e.role})</span></td>
                      <td>${e.department}</td>
                      <td style="text-align: right;" class="font-semibold text-primary">${empHours} hs</td>
                      <td style="text-align: right;" class="font-semibold">${pct}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Renderizar gráficos de tiempos
    if (typeof Chart !== 'undefined') {
      const activeEmp = db.rrhh.employees.filter(e => e.status === 'activo');
      
      // 1. Gráfico Empleados
      const labelsEmp = activeEmp.map(e => `${e.first_name} ${e.last_name}`);
      const dataHoursEmp = activeEmp.map(e => {
        return logs.filter(log => log.employeeId === e.id).reduce((sum, l) => sum + parseFloat(l.hours || 0), 0);
      });
      window.DolibarrCharts.createBar('chart-tiempo-emp', labelsEmp, [{
        label: 'Horas Trabajadas',
        data: dataHoursEmp,
        backgroundColor: '#3A78D4',
        borderRadius: 4
      }]);

      // 2. Gráfico Proyectos
      const projects = db.proyectos.projects || [];
      const labelsProj = [];
      const dataProj = [];

      projects.forEach(p => {
        // Encontrar tareas del proyecto
        const pTasks = (db.proyectos.tasks || []).filter(t => t.projectId === p.id);
        const pTaskIds = pTasks.map(t => t.id);
        
        // Sumar horas en esas tareas
        const pLogs = logs.filter(log => pTaskIds.includes(log.taskId));
        const pHours = pLogs.reduce((sum, l) => sum + parseFloat(l.hours || 0), 0);

        if (pHours > 0) {
          labelsProj.push(p.title);
          dataProj.push(pHours);
        }
      });

      if (labelsProj.length > 0) {
        window.DolibarrCharts.createDoughnut('chart-tiempo-proj', labelsProj, dataProj);
      } else {
        // Placeholder vacio en canvas
        const ctx = document.getElementById('chart-tiempo-proj').getContext('2d');
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#7F8C8D';
        ctx.fillText('Sin datos de tiempo registrados', 50, 100);
      }
    }
  },

  /**
   * Vista: Bolsa de Trabajo (Puestos de Trabajo) (`#/rrhh/puestos`)
   */
  renderJobPositions: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Puestos de Trabajo</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-briefcase"></i> Reclutamiento - Puestos de Trabajo</h1>
        <button id="btn-nuevo-puesto" class="btn btn-primary">
          <i class="fas fa-plus"></i> Crear Vacante
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Puesto / Vacante</th>
              <th>Departamento / Ubicación</th>
              <th>Rango Salarial Ofrecido</th>
              <th>Fecha de Creación</th>
              <th>Postulantes Activos</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Cambiar Estado</th>
            </tr>
          </thead>
          <tbody>
            ${(db.rrhh.puestos || []).map(p => {
              const postCount = db.rrhh.applications.filter(app => app.puestoId === p.id).length;
              return `
                <tr>
                  <td><code>VAC-${String(p.id).padStart(3,'0')}</code></td>
                  <td><strong>${p.title}</strong><br><small class="text-muted">${p.description.substring(0,60)}...</small></td>
                  <td><i class="fas fa-map-marker-alt" style="color:var(--primary); font-size:12px; margin-right:4px;"></i>${p.department}</td>
                  <td class="font-semibold text-success">${p.salary_range}</td>
                  <td>${window.DolibarrUtils.formatDate(p.date_created)}</td>
                  <td style="text-align: center;">
                    <a href="#/rrhh/aplicaciones" class="badge" style="background:var(--primary); color:white; padding:4px 8px; border-radius:12px; font-weight:700;">
                      ${postCount} candidatos
                    </a>
                  </td>
                  <td style="text-align: center;"><span class="rrhh-badge rrhh-badge-${p.status.toLowerCase()}">${p.status}</span></td>
                  <td style="text-align: center;">
                    <select class="form-control" style="font-size:11px; padding: 4px; display:inline-block; width:120px;" onchange="window.DolibarrModules.rrhh.cambiarEstadoPuesto(${p.id}, this.value)">
                      <option value="Borrador" ${p.status === 'Borrador' ? 'selected' : ''}>Borrador</option>
                      <option value="Abierto" ${p.status === 'Abierto' ? 'selected' : ''}>Abierto</option>
                      <option value="Cerrado" ${p.status === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                    </select>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: NUEVA VACANTE -->
      <div class="modal-overlay" id="modal-puesto-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-briefcase"></i> Crear Nueva Vacante</h3>
            <button class="modal-close" id="modal-puesto-close">&times;</button>
          </div>
          <form id="form-nuevo-puesto">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="p-title">Título del Puesto *</label>
                <input type="text" id="p-title" class="form-control" required placeholder="Ej. Analista de Redes Sociales">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="p-dept">Ubicación / Ciudad *</label>
                  <select id="p-dept" class="form-control" required>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Tarija">Tarija</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="p-salary-range">Rango Salarial (Bs) *</label>
                  <input type="text" id="p-salary-range" class="form-control" placeholder="Ej. Bs. 6.000 - 8.000" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="p-desc">Descripción del Puesto / Requerimientos *</label>
                <textarea id="p-desc" class="form-control" rows="4" placeholder="Detalle los requisitos técnicos y funciones..." required></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-puesto">Cancelar</button>
              <button type="submit" class="btn btn-primary">Publicar Vacante</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Vacante
    const modal = document.getElementById('modal-puesto-overlay');
    const openBtn = document.getElementById('btn-nuevo-puesto');
    const closeBtn = document.getElementById('modal-puesto-close');
    const cancelBtn = document.getElementById('btn-cancel-puesto');
    const form = document.getElementById('form-nuevo-puesto');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        form.reset();
        modal.classList.add('show');
      });
    }

    const closeModal = () => modal.classList.remove('show');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPos = {
          id: window.DolibarrUtils.generateId(db.rrhh.puestos),
          title: document.getElementById('p-title').value,
          department: document.getElementById('p-dept').value,
          salary_range: document.getElementById('p-salary-range').value,
          description: document.getElementById('p-desc').value,
          date_created: new Date().toISOString().split('T')[0],
          status: "Abierto"
        };

        db.rrhh.puestos.push(newPos);
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Vacante creada con éxito.", "success");
        closeModal();
        this.renderJobPositions(container);
      });
    }
  },

  /**
   * Acción: Cambiar estado de un puesto de trabajo
   */
  cambiarEstadoPuesto: function(id, val) {
    const db = window.DolibarrDB.get();
    const p = db.rrhh.puestos.find(item => item.id === id);
    if (p) {
      p.status = val;
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Estado de vacante VAC-${id} actualizado.`, "success");
    }
  },

  /**
   * Vista: Postulantes / Aplicaciones (`#/rrhh/aplicaciones`)
   */
  renderApplications: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/rrhh">RRHH</a> <i class="fas fa-chevron-right"></i> <strong>Postulantes</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice"></i> Reclutamiento - Candidatos y Aplicaciones</h1>
        <button id="btn-nueva-app" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Postulación
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Postulante / Candidato</th>
              <th>Puesto al que Aplica</th>
              <th>Contacto</th>
              <th>CV / Ficha</th>
              <th>Fecha Aplicación</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: center;">Acciones de Progreso</th>
            </tr>
          </thead>
          <tbody>
            ${(db.rrhh.applications || []).map(app => {
              const puesto = db.rrhh.puestos.find(p => p.id === app.puestoId) || { title: 'Puesto Desconocido' };
              
              let progressBtns = '';
              if (app.status === 'Borrador') {
                progressBtns = `
                  <button class="btn btn-primary btn-sm" onclick="window.DolibarrModules.rrhh.cambiarEstadoApp(${app.id}, 'Entrevista')">Entrevistar</button>
                  <button class="btn btn-danger btn-sm" onclick="window.DolibarrModules.rrhh.cambiarEstadoApp(${app.id}, 'Rechazado')">Rechazar</button>
                `;
              } else if (app.status === 'Entrevista') {
                progressBtns = `
                  <button class="btn btn-success btn-sm" onclick="window.DolibarrModules.rrhh.cambiarEstadoApp(${app.id}, 'Aceptado')"><i class="fas fa-check"></i> Aceptar</button>
                  <button class="btn btn-danger btn-sm" onclick="window.DolibarrModules.rrhh.cambiarEstadoApp(${app.id}, 'Rechazado')">Rechazar</button>
                `;
              } else if (app.status === 'Aceptado') {
                progressBtns = `
                  <button class="btn btn-success btn-sm" onclick="window.DolibarrModules.rrhh.preHiring(${app.id})">
                    <i class="fas fa-user-plus"></i> Contratar Personal
                  </button>
                `;
              } else {
                progressBtns = `<span class="text-muted" style="font-size:12px;">Cerrado / Rechazado</span>`;
              }

              return `
                <tr>
                  <td><code>APP-${String(app.id).padStart(3,'0')}</code></td>
                  <td><strong>${app.first_name} ${app.last_name}</strong></td>
                  <td><span class="text-primary font-semibold">${puesto.title}</span></td>
                  <td>
                    <span style="font-size:12px; display:block;"><i class="fas fa-envelope"></i> ${app.email}</span>
                    <span style="font-size:12px; display:block;"><i class="fas fa-phone"></i> ${app.phone}</span>
                  </td>
                  <td>
                    <a href="${app.cv_link}" target="_blank" class="text-info font-semibold" style="font-size:12px;">
                      <i class="fas fa-file-pdf"></i> Ver Curriculum Vitae
                    </a>
                  </td>
                  <td>${window.DolibarrUtils.formatDate(app.date_applied)}</td>
                  <td style="text-align: center;"><span class="rrhh-badge rrhh-badge-${app.status.toLowerCase()}">${app.status}</span></td>
                  <td style="text-align: center;">
                    <div class="action-buttons-flex">
                      ${progressBtns}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- MODAL: REGISTRAR POSTULANTE -->
      <div class="modal-overlay" id="modal-app-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-user-plus"></i> Registrar Candidato</h3>
            <button class="modal-close" id="modal-app-close">&times;</button>
          </div>
          <form id="form-nuevo-app">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="a-puesto">Puesto / Vacante *</label>
                <select id="a-puesto" class="form-control" required>
                  <option value="">-- Seleccionar Vacante --</option>
                  ${db.rrhh.puestos.filter(p => p.status === 'Abierto').map(p => `
                    <option value="${p.id}">${p.title} (${p.department})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="a-first">Nombres *</label>
                  <input type="text" id="a-first" class="form-control" required placeholder="Ej. Beatriz">
                </div>
                <div class="form-group">
                  <label class="form-label" for="a-last">Apellidos *</label>
                  <input type="text" id="a-last" class="form-control" required placeholder="Ej. Quispe Rojas">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="a-email">Email *</label>
                  <input type="email" id="a-email" class="form-control" required placeholder="Ej. bquispe@hotmail.com">
                </div>
                <div class="form-group">
                  <label class="form-label" for="a-phone">Teléfono / Celular *</label>
                  <input type="text" id="a-phone" class="form-control" required placeholder="Ej. 70611223">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="a-cv">Enlace URL del CV PDF *</label>
                <input type="url" id="a-cv" class="form-control" required placeholder="https://diasa.com.bo/cv/nombre.pdf">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-app">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Aplicación</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL CONTRATACIÓN (AUTO VINCULADO) -->
      <div class="modal-overlay" id="modal-app-hire-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" style="color:var(--success);"><i class="fas fa-user-check"></i> Contratar Postulante Seleccionado</h3>
            <button class="modal-close" onclick="document.getElementById('modal-app-hire-overlay').classList.remove('show')">&times;</button>
          </div>
          <form id="form-app-hire">
            <input type="hidden" id="h-app-id">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nombres</label>
                  <input type="text" id="h-first" class="form-control" readonly>
                </div>
                <div class="form-group">
                  <label class="form-label">Apellidos</label>
                  <input type="text" id="h-last" class="form-control" readonly>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Cargo Defectivo</label>
                  <input type="text" id="h-role" class="form-control" readonly>
                </div>
                <div class="form-group">
                  <label class="form-label" for="h-dept">Departamento Laboral *</label>
                  <select id="h-dept" class="form-control" required>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Tarija">Tarija</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="h-salary">Sueldo Básico Acordado (Bs) *</label>
                  <input type="number" step="0.01" id="h-salary" class="form-control" required placeholder="Ej. 7500.00">
                </div>
                <div class="form-group">
                  <label class="form-label" for="h-date">Fecha de Ingreso / Contratación *</label>
                  <input type="date" id="h-date" class="form-control" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-app-hire-overlay').classList.remove('show')">Cancelar</button>
              <button type="submit" class="btn btn-success">Confirmar Contratación</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control: Postulante
    const modal = document.getElementById('modal-app-overlay');
    const openBtn = document.getElementById('btn-nueva-app');
    const closeBtn = document.getElementById('modal-app-close');
    const cancelBtn = document.getElementById('btn-cancel-app');
    const form = document.getElementById('form-nuevo-app');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        form.reset();
        modal.classList.add('show');
      });
    }

    const closeModal = () => modal.classList.remove('show');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newApp = {
          id: window.DolibarrUtils.generateId(db.rrhh.applications),
          puestoId: parseInt(document.getElementById('a-puesto').value),
          first_name: document.getElementById('a-first').value,
          last_name: document.getElementById('a-last').value,
          email: document.getElementById('a-email').value,
          phone: document.getElementById('a-phone').value,
          cv_link: document.getElementById('a-cv').value,
          status: "Borrador",
          date_applied: new Date().toISOString().split('T')[0]
        };

        db.rrhh.applications.push(newApp);
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Candidato postulado con éxito.", "success");
        closeModal();
        this.renderApplications(container);
      });
    }

    // Modal Control: Contratación auto-vinculada
    const formHire = document.getElementById('form-app-hire');
    if (formHire) {
      formHire.addEventListener('submit', (e) => {
        e.preventDefault();
        const appId = parseInt(document.getElementById('h-app-id').value);
        const app = db.rrhh.applications.find(item => item.id === appId);
        if (!app) return;

        // Crear ficha de empleado
        const newEmp = {
          id: window.DolibarrUtils.generateId(db.rrhh.employees),
          first_name: app.first_name,
          last_name: app.last_name,
          role: document.getElementById('h-role').value,
          department: document.getElementById('h-dept').value,
          salary_bs: parseFloat(document.getElementById('h-salary').value) || 0,
          hire_date: document.getElementById('h-date').value,
          vacation_days_left: 15,
          status: "activo"
        };
        db.rrhh.employees.push(newEmp);

        // Remover o archivar postulante cambiando su estado a "Contratado" / "Aceptado" cerrado
        app.status = "Contratado";

        // Cerrar el puesto de trabajo si correspondiera o dejarlo. Por simplicidad actualizamos el estado
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast(`Postulante ${app.first_name} ${app.last_name} contratado como Empleado con éxito.`, "success");
        document.getElementById('modal-app-hire-overlay').classList.remove('show');
        this.renderApplications(container);
      });
    }
  },

  /**
   * Acción: Cambiar estado de una postulación
   */
  cambiarEstadoApp: function(id, val) {
    const db = window.DolibarrDB.get();
    const app = db.rrhh.applications.find(item => item.id === id);
    if (app) {
      app.status = val;
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Estado del candidato actualizado a ${val}.`, "success");
      this.renderApplications(document.getElementById('main-content'));
    }
  },

  /**
   * Pre-contratación: Abre modal con datos pre-rellenados
   */
  preHiring: function(id) {
    const db = window.DolibarrDB.get();
    const app = db.rrhh.applications.find(item => item.id === id);
    if (!app) return;

    const puesto = db.rrhh.puestos.find(p => p.id === app.puestoId) || { title: 'Puesto' };

    document.getElementById('h-app-id').value = app.id;
    document.getElementById('h-first').value = app.first_name;
    document.getElementById('h-last').value = app.last_name;
    document.getElementById('h-role').value = puesto.title;
    document.getElementById('h-dept').value = puesto.department || 'La Paz';
    document.getElementById('h-salary').value = '';
    document.getElementById('h-date').valueAsDate = new Date();

    document.getElementById('modal-app-hire-overlay').classList.add('show');
  }
};

window.DolibarrModules.rrhh = window.DolibarrModules.rrhh;
