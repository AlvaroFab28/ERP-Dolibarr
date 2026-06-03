/**
 * proyectos.js - Módulo de Proyectos, Oportunidades y Tareas
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.proyectos = {
  
  // Variable de estado local para la vista de Timesheet
  timesheetState: {
    selectedDate: new Date(), // Semana actual por defecto
    selectedEmployeeId: null  // Empleado seleccionado
  },

  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inyectar estilos específicos de Proyectos para asegurar un diseño premium
    this.injectStyles();

    if (subRoute === 'lista') {
      this.renderProjectsList(mainContent);
    } else if (subRoute === 'tareas') {
      this.renderTasksList(mainContent);
    } else if (subRoute === 'nuevo') {
      this.renderNewProjectForm(mainContent);
    } else if (subRoute === 'tiempo') {
      this.renderTimeTracking(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Inyecta estilos CSS específicos para la grilla de tiempos, Kanban y formularios
   */
  injectStyles: function() {
    let styleEl = document.getElementById('proyectos-custom-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'proyectos-custom-styles';
      styleEl.innerHTML = `
        /* Estilos de la Pipeline de Oportunidades */
        .pipeline-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        .pipeline-column {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 12px;
          padding: 16px;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s ease;
        }
        .pipeline-column-title {
          font-weight: 700;
          font-size: 13.5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-dark);
          border-bottom: 2px solid var(--primary);
          padding-bottom: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pipeline-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
          border-left: 4px solid var(--primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pipeline-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        .pipeline-card-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-dark);
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .pipeline-card-meta {
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        /* Estilos del Timesheet */
        .timesheet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .timesheet-week-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .timesheet-btn-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          color: var(--text-dark);
          transition: all 0.2s;
        }
        .timesheet-btn-arrow:hover {
          background: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary);
        }
        .timesheet-week-label {
          font-weight: 700;
          font-size: 16px;
          color: var(--text-dark);
          min-width: 250px;
          text-align: center;
        }
        .timesheet-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
        }
        .timesheet-table th {
          background: #F8FAFC;
          color: var(--text-dark);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 14px 12px;
          border-bottom: 2px solid var(--border-color);
          text-align: center;
        }
        .timesheet-table th.col-task {
          text-align: left;
          width: 320px;
        }
        .timesheet-table td {
          padding: 10px 8px;
          border-bottom: 1px solid var(--border-color);
          text-align: center;
          vertical-align: middle;
          font-size: 13px;
        }
        .timesheet-table td.col-task {
          text-align: left;
        }
        .timesheet-day-input {
          width: 50px;
          padding: 6px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .timesheet-day-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(58, 120, 212, 0.15);
          outline: none;
        }
        .timesheet-day-input:disabled {
          background: #F1F5F9;
          color: var(--text-muted);
          cursor: not-allowed;
        }
        .timesheet-logged-badge {
          display: block;
          font-size: 11px;
          color: var(--primary);
          font-weight: 700;
          margin-bottom: 4px;
        }
        .timesheet-total-cell {
          font-weight: 700;
          color: var(--text-dark);
        }
        .timesheet-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          background: #ffffff;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
        }
        .timesheet-add-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        /* Checkbox slider estilizado */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #CBD5E1;
          transition: .3s;
          border-radius: 34px;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        input:checked + .toggle-slider {
          background-color: var(--primary);
        }
        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
      `;
      document.head.appendChild(styleEl);
    }
  },

  /**
   * Vista: Dashboard de Proyectos y Oportunidades
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    // Cálculos y Métricas
    const totalProj = db.proyectos.projects.length;
    const activeProj = db.proyectos.projects.filter(p => p.status === 'En proceso' && !p.is_opportunity);
    const activeProjCount = activeProj.length;
    
    // Oportunidades activas (no ganadas ni perdidas)
    const activeOpps = db.proyectos.projects.filter(p => p.is_opportunity && p.opp_status !== 'Ganado' && p.opp_status !== 'Perdido');
    const activeOppsCount = activeOpps.length;
    const totalOppsVolume = activeOpps.reduce((sum, p) => sum + (p.opp_amount || 0), 0);
    
    // Total horas declaradas en todo el sistema
    const totalHoursSpent = db.proyectos.tasks.reduce((sum, t) => sum + (t.hours_spent || 0), 0);

    // Proyectos en borrador
    const draftProj = db.proyectos.projects.filter(p => p.status === 'Borrador');

    // Pipeline Kanban data
    const pipelineStages = {
      'Borrador': activeOpps.filter(p => p.opp_status === 'Borrador' || !p.opp_status),
      'Propuesta comercial': activeOpps.filter(p => p.opp_status === 'Propuesta comercial'),
      'Negociación': activeOpps.filter(p => p.opp_status === 'Negociación')
    };

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Proyectos</span> <i class="fas fa-chevron-right"></i> <strong>Resumen Proyectos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-diagram-project"></i> Gestión de Proyectos e Oportunidades</h1>
        <div class="page-actions">
          <a href="#/proyectos/nuevo" class="btn btn-primary"><i class="fas fa-plus"></i> Nueva Oportunidad / Proyecto</a>
        </div>
      </div>

      <!-- Widgets de Métricas -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/proyectos/lista'">
          <div class="wb-icon"><i class="fas fa-folder-open"></i></div>
          <div class="wb-details">
            <div class="wb-count">${activeProjCount}</div>
            <div class="wb-label">Proyectos en Curso</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/proyectos/lista?tipo=oportunidades'">
          <div class="wb-icon"><i class="fas fa-funnel-dollar"></i></div>
          <div class="wb-details">
            <div class="wb-count">${activeOppsCount}</div>
            <div class="wb-label">Oportunidades Abiertas</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/proyectos/lista?tipo=oportunidades'">
          <div class="wb-icon"><i class="fas fa-coins"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 16px; margin-top: 4px;">
              ${window.DolibarrUtils.formatCurrency(totalOppsVolume)}
            </div>
            <div class="wb-label">Volumen de Cartera (Bs.)</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/proyectos/tiempo'">
          <div class="wb-icon"><i class="fas fa-clock"></i></div>
          <div class="wb-details">
            <div class="wb-count">${totalHoursSpent} hrs</div>
            <div class="wb-label">Tiempo Total Registrado</div>
          </div>
        </div>
      </div>

      <!-- Sección de Gráficos -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 24px; margin-top: 24px;">
        
        <!-- Estado Proyectos -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Estado de Proyectos</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px; position: relative;">
              <canvas id="chart-proyectos-estados"></canvas>
            </div>
          </div>
        </div>

        <!-- Oportunidades por Estado Comercial -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar"></i> Pipeline Comercial</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px; position: relative;">
              <canvas id="chart-oportunidades-estados"></canvas>
            </div>
          </div>
        </div>

        <!-- Proyectos creados por mes (Tendencia) -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-line"></i> Proyectos Nuevos por Mes</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px; position: relative;">
              <canvas id="chart-proyectos-tendencia"></canvas>
            </div>
          </div>
        </div>

      </div>

      <!-- Pipeline Rápido Kanban y Proyectos en Borrador -->
      <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 24px; margin-top: 24px;">
        
        <!-- Pipeline Kanban -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-road"></i> Pipeline Activo de Ventas / Oportunidades</div>
            <a href="#/proyectos/lista?tipo=oportunidades" style="font-size:12px;">Ver todo</a>
          </div>
          <div class="card-body" style="padding: 12px 20px 20px 20px;">
            <div class="pipeline-container">
              ${Object.keys(pipelineStages).map(stage => {
                const list = pipelineStages[stage];
                let borderCol = '#7F8C8D';
                if (stage === 'Propuesta comercial') borderCol = '#F39C12';
                if (stage === 'Negociación') borderCol = '#3A78D4';

                return `
                  <div class="pipeline-column">
                    <div class="pipeline-column-title" style="border-bottom-color: ${borderCol};">
                      <span>${stage}</span>
                      <span class="badge badge-secondary" style="font-size:10px; padding: 2px 6px;">${list.length}</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height: 280px; padding: 2px;">
                      ${list.length === 0 
                        ? `<div style="text-align:center; color:var(--text-muted); font-size:11px; padding:20px 0;">Vacío</div>`
                        : list.map(opp => {
                          const cli = db.terceros.find(t => t.id === opp.terceroId) || { name: 'Desconocido' };
                          return `
                            <div class="pipeline-card" style="border-left-color: ${borderCol};" onclick="window.location.hash='#/proyectos/lista?search=${opp.title}'">
                              <div class="pipeline-card-title">${opp.title}</div>
                              <div style="font-size:11px; color:var(--text-muted);">${cli.name}</div>
                              <div class="pipeline-card-meta">
                                <strong>${window.DolibarrUtils.formatCurrency(opp.opp_amount)}</strong>
                                <span class="badge badge-primary" style="font-size:9px;">${opp.opp_probability}% éxito</span>
                              </div>
                            </div>
                          `;
                        }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Proyectos en Borrador -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-file-signature"></i> Proyectos/Opc. en Borrador</div>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="table table-hover" style="margin:0;">
              <thead>
                <tr>
                  <th>Proyecto / Opc.</th>
                  <th>Presupuesto</th>
                  <th class="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${draftProj.length === 0 
                  ? `<tr><td colspan="3" class="text-center text-muted" style="padding:30px;">No hay proyectos en borrador.</td></tr>`
                  : draftProj.map(p => {
                    return `
                      <tr>
                        <td>
                          <strong>${p.title}</strong><br>
                          <span style="font-size:11px; color:var(--text-muted);">${p.is_opportunity ? 'Oportunidad' : 'Proyecto'}</span>
                        </td>
                        <td>${window.DolibarrUtils.formatCurrency(p.budget_bs)}</td>
                        <td class="text-center">
                          <button class="btn btn-success btn-sm btn-iniciar-proyecto" data-id="${p.id}" style="padding: 4px 8px; font-size:11px;">
                            <i class="fas fa-play"></i> Iniciar
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Botón Iniciar Proyecto
    document.querySelectorAll('.btn-iniciar-proyecto').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const proj = db.proyectos.projects.find(p => p.id === id);
        if (proj) {
          proj.status = "En proceso";
          if (proj.is_opportunity) {
            proj.opp_status = "Ganado";
          }
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Proyecto "${proj.title}" puesto en marcha.`, 'success');
          this.renderDashboard(container);
        }
      });
    });

    // Cargar Gráficos
    setTimeout(() => {
      if (typeof Chart !== 'undefined' && window.DolibarrCharts) {
        
        // 1. Gráfico Estado Proyectos (Doughnut)
        const projStates = { 'Borrador': 0, 'En proceso': 0, 'Cerrado': 0 };
        db.proyectos.projects.filter(p => !p.is_opportunity).forEach(p => {
          if (projStates[p.status] !== undefined) projStates[p.status]++;
        });
        window.DolibarrCharts.createDoughnut('chart-proyectos-estados', 
          Object.keys(projStates), Object.values(projStates),
          ['#7F8C8D', '#3A78D4', '#2CB57E']
        );

        // 2. Gráfico Pipeline Oportunidades (Bar)
        const oppStages = { 'Borrador': 0, 'Propuesta comercial': 0, 'Negociación': 0, 'Ganado': 0, 'Perdido': 0 };
        db.proyectos.projects.filter(p => p.is_opportunity).forEach(p => {
          const st = p.opp_status || 'Borrador';
          if (oppStages[st] !== undefined) oppStages[st]++;
        });
        window.DolibarrCharts.createBar('chart-oportunidades-estados', 
          Object.keys(oppStages), 
          [{
            label: 'Oportunidades',
            data: Object.values(oppStages),
            backgroundColor: ['#95A5A6', '#F39C12', '#3A78D4', '#2CB57E', '#E74C3C'],
            borderRadius: 6
          }]
        );

        // 3. Gráfico de Tendencia (Proyectos creados por mes)
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const values = [2, 1, 3, 2, 4, 3];
        window.DolibarrCharts.createBar('chart-proyectos-tendencia', 
          months,
          [{
            label: 'Proyectos Nuevos',
            data: values,
            backgroundColor: '#8E44AD',
            borderRadius: 6
          }]
        );
      }
    }, 100);
  },

  /**
   * Vista: Formulario para crear un Nuevo Proyecto / Oportunidad
   */
  renderNewProjectForm: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/proyectos">Proyectos</a> <i class="fas fa-chevron-right"></i> <strong>Crear Proyecto u Oportunidad</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-folder-plus"></i> Crear Nuevo Proyecto u Oportunidad</h1>
      </div>

      <div class="card" style="max-width: 750px; margin: 0 auto;">
        <div class="card-header">
          <div class="card-title">Detalles del Registro</div>
        </div>
        <div class="card-body">
          <form id="form-nuevo-proyecto">
            
            <div class="form-group">
              <label class="form-label" for="proj-title">Título o Nombre del Proyecto *</label>
              <input type="text" id="proj-title" class="form-control" placeholder="Ej. Implementación SCADA Central Hidroeléctrica" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="proj-tercero">Tercero / Cliente Asociado *</label>
                <select id="proj-tercero" class="form-control" required>
                  <option value="">-- Seleccionar --</option>
                  ${db.terceros.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="proj-budget">Presupuesto Estimado (Bs) *</label>
                <input type="number" step="0.01" id="proj-budget" class="form-control" placeholder="0.00" required>
              </div>
            </div>

            <div class="form-row" style="align-items: center; margin-top: 10px;">
              <div class="form-group" style="display:flex; align-items:center; gap:12px;">
                <label class="toggle-switch">
                  <input type="checkbox" id="proj-is-opp">
                  <span class="toggle-slider"></span>
                </label>
                <div>
                  <strong style="display:block; font-size:13px; color:var(--text-dark);">¿Es una Oportunidad Comercial?</strong>
                  <span style="font-size:11px; color:var(--text-muted);">Habilita el seguimiento en la Pipeline de Ventas</span>
                </div>
              </div>
            </div>

            <!-- Campos Opcionales de Oportunidad -->
            <div id="opp-fields-container" style="display:none; background:#F8FAFC; border:1px dashed var(--border-color); padding:16px; border-radius:8px; margin-bottom:15px; animation: fadeIn 0.3s;">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="proj-opp-amount">Importe Esperado de Opc. (Bs)</label>
                  <input type="number" step="0.01" id="proj-opp-amount" class="form-control" placeholder="0.00">
                </div>
                <div class="form-group">
                  <label class="form-label" for="proj-opp-prob">Probabilidad de Éxito (%)</label>
                  <select id="proj-opp-prob" class="form-control">
                    <option value="10">10% - Identificación</option>
                    <option value="30">30% - Propuesta preliminar</option>
                    <option value="50" selected>50% - Propuesta formal</option>
                    <option value="80">80% - Negociación final</option>
                    <option value="100">100% - Decisión ganada</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="proj-opp-status">Estado Comercial</label>
                <select id="proj-opp-status" class="form-control">
                  <option value="Borrador">Borrador</option>
                  <option value="Propuesta comercial">Propuesta comercial</option>
                  <option value="Negociación">Negociación</option>
                  <option value="Ganado">Ganado</option>
                  <option value="Perdido">Perdido</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="proj-start">Fecha de Inicio *</label>
                <input type="date" id="proj-start" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="proj-end">Fecha de Entrega/Fin *</label>
                <input type="date" id="proj-end" class="form-control" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="proj-desc">Notas / Descripción</label>
              <textarea id="proj-desc" class="form-control" rows="3" placeholder="Escriba aquí observaciones adicionales del proyecto..."></textarea>
            </div>

            <div class="form-actions" style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
              <a href="#/proyectos" class="btn btn-secondary">Cancelar</a>
              <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar Registro</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Alternar campos de oportunidad
    const toggleOpp = document.getElementById('proj-is-opp');
    const oppContainer = document.getElementById('opp-fields-container');
    const oppAmountInput = document.getElementById('proj-opp-amount');
    const budgetInput = document.getElementById('proj-budget');

    toggleOpp.addEventListener('change', () => {
      if (toggleOpp.checked) {
        oppContainer.style.display = 'block';
        oppAmountInput.value = budgetInput.value; // Copiar presupuesto por defecto
      } else {
        oppContainer.style.display = 'none';
      }
    });

    budgetInput.addEventListener('input', () => {
      if (toggleOpp.checked && !oppAmountInput.value) {
        oppAmountInput.value = budgetInput.value;
      }
    });

    // Establecer fecha de inicio hoy por defecto
    document.getElementById('proj-start').valueAsDate = new Date();

    // Guardado del Formulario
    const form = document.getElementById('form-nuevo-proyecto');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('proj-title').value;
      const terceroId = parseInt(document.getElementById('proj-tercero').value);
      const budget = parseFloat(document.getElementById('proj-budget').value) || 0;
      const isOpp = toggleOpp.checked;
      const start = document.getElementById('proj-start').value;
      const end = document.getElementById('proj-end').value;
      const desc = document.getElementById('proj-desc').value;

      const oppAmount = isOpp ? (parseFloat(oppAmountInput.value) || budget) : 0;
      const oppProb = isOpp ? parseInt(document.getElementById('proj-opp-prob').value) : 0;
      const oppStatus = isOpp ? document.getElementById('proj-opp-status').value : "";

      const newRecord = {
        id: window.DolibarrUtils.generateId(db.proyectos.projects),
        title,
        terceroId,
        budget_bs: budget,
        start_date: start,
        end_date: end,
        status: isOpp && oppStatus === 'Ganado' ? 'En proceso' : 'Borrador',
        is_opportunity: isOpp,
        opp_amount: oppAmount,
        opp_probability: oppProb,
        opp_status: oppStatus,
        description: desc
      };

      db.proyectos.projects.push(newRecord);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Registro "${title}" guardado exitosamente.`, 'success');
      
      // Redirigir al listado
      window.location.hash = '#/proyectos/lista';
    });
  },

  /**
   * Vista: Listado completo de Proyectos y Oportunidades
   */
  renderProjectsList: function(container) {
    const db = window.DolibarrDB.get();

    // Parsear query parameters para pre-filtros desde la URL hash
    const hash = window.location.hash;
    const isOnlyOpps = hash.includes('tipo=oportunidades');
    let searchPre = '';
    if (hash.includes('search=')) {
      const match = hash.match(/search=([^&]+)/);
      if (match) searchPre = decodeURIComponent(match[1]);
    }

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/proyectos">Proyectos</a> <i class="fas fa-chevron-right"></i> <strong>Listado de Proyectos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-list"></i> Listado de Proyectos / Oportunidades</h1>
        <a href="#/proyectos/nuevo" class="btn btn-primary"><i class="fas fa-plus"></i> Nuevo Registro</a>
      </div>

      <!-- Filtros Avanzados -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div class="form-row" style="grid-template-columns: 2fr 1fr 1fr 1fr; gap:16px;">
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:11px;">Buscar por título o cliente</label>
              <input type="text" id="filter-search" class="form-control" placeholder="Ej. Red de Válvulas..." value="${searchPre}">
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:11px;">Filtrar Tipo</label>
              <select id="filter-type" class="form-control">
                <option value="todos">Todos los registros</option>
                <option value="proyectos" ${!isOnlyOpps && !searchPre ? '' : ''}>Solo Proyectos</option>
                <option value="oportunidades" ${isOnlyOpps ? 'selected' : ''}>Solo Oportunidades</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:11px;">Estado Proyecto</label>
              <select id="filter-status" class="form-control">
                <option value="todos">Todos los estados</option>
                <option value="Borrador">Borrador</option>
                <option value="En proceso">En proceso</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:11px;">Estado Comercial (Opc.)</label>
              <select id="filter-opp-status" class="form-control">
                <option value="todos">Todos los estados com.</option>
                <option value="Borrador">Borrador</option>
                <option value="Propuesta comercial">Propuesta comercial</option>
                <option value="Negociación">Negociación</option>
                <option value="Ganado">Ganado</option>
                <option value="Perdido">Perdido</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Resultados -->
      <div class="table-responsive">
        <table class="table table-striped table-hover" id="projects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título del Proyecto / Oportunidad</th>
              <th>Tercero Asociado</th>
              <th style="text-align: right;">Presupuesto</th>
              <th style="text-align: right;">Monto Opc.</th>
              <th style="text-align: center; width: 120px;">Probabilidad</th>
              <th>Fechas</th>
              <th style="text-align: center;">Estado Proj</th>
              <th style="text-align: center;">Estado Com</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody id="projects-table-body">
            <!-- Renderizado dinámico -->
          </tbody>
        </table>
      </div>

      <!-- Modal de Detalle/Edición Rápida -->
      <div class="modal-overlay" id="modal-edit-proj-overlay">
        <div class="modal-container" style="max-width: 550px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-edit"></i> Edición Rápida</h3>
            <button class="modal-close" id="modal-edit-proj-close">&times;</button>
          </div>
          <form id="form-edit-proj">
            <input type="hidden" id="edit-proj-id">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="edit-proj-title">Título *</label>
                <input type="text" id="edit-proj-title" class="form-control" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="edit-proj-status">Estado del Proyecto</label>
                  <select id="edit-proj-status" class="form-control">
                    <option value="Borrador">Borrador</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
                <div class="form-group" id="edit-opp-status-group">
                  <label class="form-label" for="edit-proj-opp-status">Estado Comercial</label>
                  <select id="edit-proj-opp-status" class="form-control">
                    <option value="Borrador">Borrador</option>
                    <option value="Propuesta comercial">Propuesta comercial</option>
                    <option value="Negociación">Negociación</option>
                    <option value="Ganado">Ganado</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" id="edit-opp-prob-group">
                  <label class="form-label" for="edit-proj-opp-prob">Probabilidad (%)</label>
                  <input type="number" id="edit-proj-opp-prob" class="form-control" min="0" max="100">
                </div>
                <div class="form-group">
                  <label class="form-label" for="edit-proj-budget">Presupuesto (Bs.)</label>
                  <input type="number" step="0.01" id="edit-proj-budget" class="form-control" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-edit-proj">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Filtros lógicos
    const inputSearch = document.getElementById('filter-search');
    const selectType = document.getElementById('filter-type');
    const selectStatus = document.getElementById('filter-status');
    const selectOppStatus = document.getElementById('filter-opp-status');
    const tableBody = document.getElementById('projects-table-body');

    const doFilter = () => {
      const q = inputSearch.value.toLowerCase();
      const type = selectType.value;
      const status = selectStatus.value;
      const oppStatus = selectOppStatus.value;

      const filtered = db.proyectos.projects.filter(p => {
        const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
        const matchesQuery = p.title.toLowerCase().includes(q) || cli.name.toLowerCase().includes(q);
        
        const matchesType = type === 'todos' || 
                            (type === 'oportunidades' && p.is_opportunity) || 
                            (type === 'proyectos' && !p.is_opportunity);

        const matchesStatus = status === 'todos' || p.status === status;
        
        const matchesOppStatus = oppStatus === 'todos' || 
                                 (p.is_opportunity && p.opp_status === oppStatus);

        return matchesQuery && matchesType && matchesStatus && matchesOppStatus;
      });

      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" style="padding: 30px;">No se encontraron registros coincidentes.</td></tr>`;
        return;
      }

      tableBody.innerHTML = filtered.map(p => {
        const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido' };
        
        let oppAmountHtml = '-';
        let probHtml = '-';
        let oppStatusHtml = '-';

        if (p.is_opportunity) {
          oppAmountHtml = `<span class="font-semibold">${window.DolibarrUtils.formatCurrency(p.opp_amount)}</span>`;
          oppStatusHtml = window.DolibarrUtils.renderBadge(p.opp_status || 'Borrador');
          
          let pctColor = 'var(--text-muted)';
          if (p.opp_probability >= 80) pctColor = 'var(--success)';
          else if (p.opp_probability >= 50) pctColor = 'var(--primary)';
          else if (p.opp_probability > 0) pctColor = 'var(--warning)';

          probHtml = `
            <div style="width: 100px; margin: 0 auto;">
              <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:${pctColor}; margin-bottom:2px;">
                <span>${p.opp_probability}%</span>
              </div>
              <div style="width:100%; height:6px; background:#E2E8F0; border-radius:3px; overflow:hidden;">
                <div style="width:${p.opp_probability}%; height:100%; background:${pctColor}; border-radius:3px;"></div>
              </div>
            </div>
          `;
        }

        return `
          <tr style="cursor: pointer;" class="table-row-proj" data-id="${p.id}">
            <td><code>PROJ-${p.id}</code></td>
            <td>
              <strong>${p.title}</strong>
              ${p.is_opportunity ? ' <span class="badge badge-warning" style="font-size:9.5px; padding: 2px 6px;"><i class="fas fa-funnel-dollar"></i> Oportunidad</span>' : ''}
            </td>
            <td><span style="font-weight:600; color:var(--primary);">${cli.name}</span></td>
            <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(p.budget_bs)}</td>
            <td style="text-align: right;">${oppAmountHtml}</td>
            <td style="text-align: center;">${probHtml}</td>
            <td style="font-size:11.5px; color:var(--text-muted);">
              <div><i class="fas fa-calendar-play" style="width:14px;"></i> ${window.DolibarrUtils.formatDate(p.start_date)}</div>
              <div><i class="fas fa-calendar-check" style="width:14px;"></i> ${window.DolibarrUtils.formatDate(p.end_date)}</div>
            </td>
            <td style="text-align: center;">${window.DolibarrUtils.renderBadge(p.status)}</td>
            <td style="text-align: center;">${oppStatusHtml}</td>
            <td style="text-align: center;" onclick="event.stopPropagation();">
              <button class="btn btn-secondary btn-sm btn-edit-proj" data-id="${p.id}" title="Editar"><i class="fas fa-edit"></i></button>
              <button class="btn btn-primary btn-sm btn-nueva-task-direct" data-id="${p.id}" title="Nueva Tarea"><i class="fas fa-plus"></i> Tarea</button>
            </td>
          </tr>
        `;
      }).join('');

      // Agregar eventos de edición rápida
      document.querySelectorAll('.btn-edit-proj').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          this.openEditModal(id);
        });
      });

      // Crear tarea directa
      document.querySelectorAll('.btn-nueva-task-direct').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const projId = parseInt(btn.dataset.id);
          window.location.hash = `#/proyectos/tareas?newForProject=${projId}`;
        });
      });
    };

    // Escuchadores de eventos para filtros
    inputSearch.addEventListener('input', doFilter);
    selectType.addEventListener('change', doFilter);
    selectStatus.addEventListener('change', doFilter);
    selectOppStatus.addEventListener('change', doFilter);

    // Ejecución inicial de filtrado
    doFilter();
  },

  /**
   * Abre modal de edición de proyectos
   */
  openEditModal: function(id) {
    const db = window.DolibarrDB.get();
    const proj = db.proyectos.projects.find(p => p.id === id);
    if (!proj) return;

    document.getElementById('edit-proj-id').value = proj.id;
    document.getElementById('edit-proj-title').value = proj.title;
    document.getElementById('edit-proj-status').value = proj.status;
    document.getElementById('edit-proj-budget').value = proj.budget_bs;

    const oppStatusGroup = document.getElementById('edit-opp-status-group');
    const oppProbGroup = document.getElementById('edit-opp-prob-group');

    if (proj.is_opportunity) {
      oppStatusGroup.style.display = 'block';
      oppProbGroup.style.display = 'block';
      document.getElementById('edit-proj-opp-status').value = proj.opp_status || 'Borrador';
      document.getElementById('edit-proj-opp-prob').value = proj.opp_probability || 50;
    } else {
      oppStatusGroup.style.display = 'none';
      oppProbGroup.style.display = 'none';
    }

    const modal = document.getElementById('modal-edit-proj-overlay');
    modal.classList.add('show');

    // Cerrar modal
    const closeBtn = document.getElementById('modal-edit-proj-close');
    const cancelBtn = document.getElementById('btn-cancel-edit-proj');
    const closeModal = () => modal.classList.remove('show');
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    // Submit formulario
    const form = document.getElementById('form-edit-proj');
    form.onsubmit = (e) => {
      e.preventDefault();

      proj.title = document.getElementById('edit-proj-title').value;
      proj.status = document.getElementById('edit-proj-status').value;
      proj.budget_bs = parseFloat(document.getElementById('edit-proj-budget').value) || 0;

      if (proj.is_opportunity) {
        proj.opp_status = document.getElementById('edit-proj-opp-status').value;
        proj.opp_probability = parseInt(document.getElementById('edit-proj-opp-prob').value) || 0;
        
        // Si el comercial pasa a ganado, poner en proceso el proyecto de forma automática
        if (proj.opp_status === 'Ganado') {
          proj.status = 'En proceso';
        }
      }

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Proyecto "${proj.title}" actualizado correctamente.`, 'success');
      closeModal();
      this.renderProjectsList(document.getElementById('main-content'));
    };
  },

  /**
   * Vista: Listado y Planificación de Tareas
   */
  renderTasksList: function(container) {
    const db = window.DolibarrDB.get();

    // Check si hay un pre-filtro de proyecto por URL
    const hash = window.location.hash;
    let autoOpenModal = false;
    let selectedProjId = '';

    if (hash.includes('newForProject=')) {
      const match = hash.match(/newForProject=(\d+)/);
      if (match) {
        selectedProjId = parseInt(match[1]);
        autoOpenModal = true;
      }
    }

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/proyectos">Proyectos</a> <i class="fas fa-chevron-right"></i> <strong>Planificación de Tareas</strong>
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
                  <td style="text-align: center;">${window.DolibarrUtils.renderBadge(t.status === 'Todo' || t.status === 'Por hacer' ? 'Por hacer' : (t.status === 'InProgress' || t.status === 'En proceso' ? 'En proceso' : 'Finalizado'))}</td>
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
                  ${db.proyectos.projects.map(p => `<option value="${p.id}" ${p.id === selectedProjId ? 'selected' : ''}>${p.title}</option>`).join('')}
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

      <!-- MODAL: DECLARAR HORAS (TIEMPOCARD RÁPIDO) -->
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
      if (selectedProjId) {
        document.getElementById('tk-proj').value = selectedProjId;
      }
      modalTask.classList.add('show');
    });

    const closeTask = () => {
      modalTask.classList.remove('show');
      if (selectedProjId) {
        // Limpiar hash de pre-filtro para no reabrir en loops
        window.location.hash = '#/proyectos/tareas';
      }
    };
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

    // Auto-abrir modal si viene del listado
    if (autoOpenModal) {
      modalTask.classList.add('show');
    }

    // Modal Declarar Horas Rápido
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
        
        // Agregar también un log diario simple para compatibilidad en el día de hoy
        const todayStr = new Date().toISOString().split('T')[0];
        if (!db.proyectos.time_logs) db.proyectos.time_logs = [];
        
        db.proyectos.time_logs.push({
          id: window.DolibarrUtils.generateId(db.proyectos.time_logs),
          taskId: taskId,
          employeeId: task.assigneeId,
          date: todayStr,
          hours: hours
        });

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
  },

  /**
   * Vista: Seguimiento del Tiempo / Timesheet Semanal
   */
  renderTimeTracking: function(container) {
    const db = window.DolibarrDB.get();

    // 1. Inicializar el empleado seleccionado por defecto si no está definido
    if (!this.timesheetState.selectedEmployeeId) {
      // Intentar usar el usuario logueado mapeado a un empleado, o por defecto el primer empleado
      const curUser = db.currentUser;
      const matchingEmp = db.rrhh.employees.find(e => 
        curUser && e.first_name.toLowerCase().includes(curUser.name.split(' ')[0].toLowerCase())
      );
      this.timesheetState.selectedEmployeeId = matchingEmp ? matchingEmp.id : (db.rrhh.employees[0] ? db.rrhh.employees[0].id : null);
    }

    const selectedEmpId = parseInt(this.timesheetState.selectedEmployeeId);
    const emp = db.rrhh.employees.find(e => e.id === selectedEmpId);

    // 2. Calcular los días de la semana actual del estado
    const weekInfo = this.getWeekInfo(this.timesheetState.selectedDate);
    const dates = weekInfo.dates;

    // Formatear rango para el título
    const options = { month: 'short', day: 'numeric' };
    const labelMonday = dates[0].toLocaleDateString('es-ES', options);
    const labelSunday = dates[6].toLocaleDateString('es-ES', options);
    const weekTitle = `${weekInfo.year}, Semana ${weekInfo.weekNumber} (Del ${labelMonday} al ${labelSunday})`;

    // 3. Filtrar las tareas que corresponden al empleado seleccionado
    // También listamos las tareas que tienen logs cargados por este empleado esta semana
    const empTaskIds = new Set(db.proyectos.tasks.filter(t => t.assigneeId === selectedEmpId).map(t => t.id));
    
    // Buscar tareas no asignadas pero que tienen registros de horas de este empleado esta semana
    const dateStrings = dates.map(d => this.formatISODate(d));
    if (db.proyectos.time_logs) {
      db.proyectos.time_logs.forEach(log => {
        if (log.employeeId === selectedEmpId && dateStrings.includes(log.date)) {
          empTaskIds.add(log.taskId);
        }
      });
    }

    const empTasks = db.proyectos.tasks.filter(t => empTaskIds.has(t.id));

    // Nombres cortos de los días para la tabla
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/proyectos">Proyectos</a> <i class="fas fa-chevron-right"></i> <strong>Tiempo Dedicado</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-clock"></i> Seguimiento del Tiempo por Semana</h1>
      </div>

      <!-- Selector superior de Semana y Empleado -->
      <div class="timesheet-header">
        <div class="timesheet-week-selector">
          <button class="timesheet-btn-arrow" id="ts-prev-week" title="Semana anterior"><i class="fas fa-chevron-left"></i></button>
          <span class="timesheet-week-label" id="ts-week-label">${weekTitle}</span>
          <button class="timesheet-btn-arrow" id="ts-next-week" title="Siguiente semana"><i class="fas fa-chevron-right"></i></button>
          <button class="btn btn-secondary btn-sm" id="ts-current-week" style="padding:6px 12px; margin-left: 8px;">Hoy</button>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <label class="form-label" style="margin:0; font-weight:600; font-size:13.5px; color:var(--text-dark);">Usuario / Colaborador:</label>
          <select id="ts-employee-select" class="form-control" style="width: 220px; font-weight:600;">
            ${db.rrhh.employees.map(e => `
              <option value="${e.id}" ${e.id === selectedEmpId ? 'selected' : ''}>${e.first_name} ${e.last_name} (${e.role})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Alerta Informativa -->
      <div class="alert alert-info" style="margin-bottom:20px; display:flex; gap:12px; align-items:center;">
        <i class="fas fa-info-circle" style="font-size:18px; color:var(--primary);"></i>
        <div style="font-size:12.5px; line-height: 1.4;">
          Esta vista le permite ingresar las horas de trabajo dedicadas a las tareas de los proyectos durante la semana seleccionada. 
          Las horas previamente cargadas se muestran deshabilitadas. Ingrese horas en las celdas vacías y haga clic en <strong>Guardar Tiempos de Trabajo</strong> para registrarlas.
        </div>
      </div>

      <!-- Grilla del Timesheet -->
      <form id="form-timesheet">
        <div class="table-responsive">
          <table class="timesheet-table">
            <thead>
              <tr>
                <th class="col-task">Actividad / Tarea</th>
                <th style="width:100px;">Planificadas</th>
                <th style="width:110px;">Progreso</th>
                <th style="width:80px;">Consumidas</th>
                ${dates.map((date, idx) => `
                  <th style="width:85px;">
                    <div style="font-size:11px; font-weight:700;">${dayNames[idx]}</div>
                    <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${date.getDate()} ${date.toLocaleDateString('es-ES', { month: 'short' })}</div>
                  </th>
                `).join('')}
                <th style="width:80px;">Suma</th>
              </tr>
            </thead>
            <tbody>
              ${empTasks.length === 0 
                ? `<tr><td colspan="12" class="text-center text-muted" style="padding: 40px;">No hay tareas asignadas para este colaborador. Use el selector de abajo para cargar una tarea temporal.</td></tr>`
                : empTasks.map(t => {
                  const proj = db.proyectos.projects.find(p => p.id === t.projectId) || { title: 'Desconocido' };
                  
                  // Calcular horas totales ingresadas esta semana para esta tarea
                  let taskWeekSum = 0;
                  const dayCellsHtml = dates.map((date, dayIdx) => {
                    const dateStr = this.formatISODate(date);
                    
                    // Buscar horas previamente grabadas en time_logs
                    const logged = db.proyectos.time_logs 
                      ? db.proyectos.time_logs.filter(log => log.taskId === t.id && log.employeeId === selectedEmpId && log.date === dateStr)
                      : [];
                    const loggedHours = logged.reduce((sum, log) => sum + log.hours, 0);
                    taskWeekSum += loggedHours;

                    let loggedBadgeHtml = '';
                    if (loggedHours > 0) {
                      loggedBadgeHtml = `<span class="timesheet-logged-badge">${loggedHours}h</span>`;
                    }

                    return `
                      <td>
                        ${loggedBadgeHtml}
                        <input type="number" step="0.5" min="0" max="24" 
                          class="timesheet-day-input hours-input-cell" 
                          data-task-id="${t.id}" 
                          data-date="${dateStr}"
                          data-day-idx="${dayIdx}"
                          placeholder="-">
                      </td>
                    `;
                  }).join('');

                  return `
                    <tr class="timesheet-row" data-task-id="${t.id}">
                      <td class="col-task">
                        <strong style="display:block; color:var(--text-dark);">${t.title}</strong>
                        <span style="font-size:11px; color:var(--text-muted);">${proj.title}</span>
                      </td>
                      <td>${t.hours_planned} hrs</td>
                      <td>
                        <select class="form-control select-progress" data-task-id="${t.id}" style="padding: 4px; font-size:12px; height: 28px;">
                          <option value="0" ${t.status === 'Todo' ? 'selected' : ''}>0% (Por hacer)</option>
                          <option value="20" ${t.status === 'InProgress' && t.hours_spent < t.hours_planned * 0.4 ? 'selected' : ''}>20% (Iniciado)</option>
                          <option value="50" ${t.status === 'InProgress' && t.hours_spent >= t.hours_planned * 0.4 && t.hours_spent < t.hours_planned * 0.8 ? 'selected' : ''}>50% (A la mitad)</option>
                          <option value="80" ${t.status === 'InProgress' && t.hours_spent >= t.hours_planned * 0.8 ? 'selected' : ''}>80% (Casi listo)</option>
                          <option value="100" ${t.status === 'Finalizado' ? 'selected' : ''}>100% (Completado)</option>
                        </select>
                      </td>
                      <td class="font-semibold" style="color: var(--primary);">${t.hours_spent || 0} hrs</td>
                      ${dayCellsHtml}
                      <td class="timesheet-total-cell row-total-sum" data-logged-sum="${taskWeekSum}">${taskWeekSum} hrs</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Barra inferior del Timesheet -->
        <div class="timesheet-footer">
          <div class="timesheet-add-row">
            <span style="font-size:13px; font-weight:600; color:var(--text-dark);"><i class="fas fa-plus"></i> Cargar otra tarea a la grilla:</span>
            <select id="ts-task-add-select" class="form-control" style="width: 320px; font-size:12.5px;">
              <option value="">-- Seleccionar tarea a asignar temporalmente --</option>
              ${db.proyectos.tasks
                .filter(t => !empTaskIds.has(t.id) && t.status !== 'Finalizado')
                .map(t => {
                  const proj = db.proyectos.projects.find(p => p.id === t.projectId) || { title: 'Desconocido' };
                  return `<option value="${t.id}">${proj.title} - TSK-${t.id}: ${t.title}</option>`;
                }).join('')}
            </select>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-add-task-row"><i class="fas fa-plus"></i> Añadir fila</button>
          </div>
          
          <button type="submit" class="btn btn-primary" id="btn-save-timesheet" ${empTasks.length === 0 ? 'disabled' : ''}>
            <i class="fas fa-save"></i> Guardar Tiempos de Trabajo
          </button>
        </div>
      </form>
    `;

    // 4. Agregar manejadores de eventos
    
    // Navegación de semanas
    document.getElementById('ts-prev-week').addEventListener('click', () => {
      const d = new Date(this.timesheetState.selectedDate);
      d.setDate(d.getDate() - 7);
      this.timesheetState.selectedDate = d;
      this.renderTimeTracking(container);
    });

    document.getElementById('ts-next-week').addEventListener('click', () => {
      const d = new Date(this.timesheetState.selectedDate);
      d.setDate(d.getDate() + 7);
      this.timesheetState.selectedDate = d;
      this.renderTimeTracking(container);
    });

    document.getElementById('ts-current-week').addEventListener('click', () => {
      this.timesheetState.selectedDate = new Date();
      this.renderTimeTracking(container);
    });

    // Selector de empleado
    document.getElementById('ts-employee-select').addEventListener('change', (e) => {
      this.timesheetState.selectedEmployeeId = parseInt(e.target.value);
      this.renderTimeTracking(container);
    });

    // Añadir fila de tarea adicional temporal
    document.getElementById('btn-add-task-row').addEventListener('click', () => {
      const taskId = parseInt(document.getElementById('ts-task-add-select').value);
      if (!taskId) {
        window.DolibarrUtils.showToast("Seleccione una tarea de la lista para añadirla.", "warning");
        return;
      }

      // Asignar la tarea temporalmente al empleado en la DB
      const task = db.proyectos.tasks.find(t => t.id === taskId);
      if (task) {
        task.assigneeId = selectedEmpId;
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast(`Tarea "${task.title}" añadida a la grilla de ${emp.first_name}.`, "success");
        this.renderTimeTracking(container);
      }
    });

    // Inputs dinámicos: Actualizar suma de fila en tiempo real al tipear
    document.querySelectorAll('.hours-input-cell').forEach(input => {
      input.addEventListener('input', () => {
        const row = input.closest('tr');
        const rowInputs = row.querySelectorAll('.hours-input-cell');
        const totalCell = row.querySelector('.row-total-sum');
        const loggedSum = parseFloat(totalCell.dataset.loggedSum) || 0;
        
        let enteredSum = 0;
        rowInputs.forEach(inp => {
          const val = parseFloat(inp.value) || 0;
          enteredSum += val;
        });

        totalCell.textContent = `${(loggedSum + enteredSum).toFixed(1)} hrs`;
      });
    });

    // Guardar el formulario del Timesheet
    const tsForm = document.getElementById('form-timesheet');
    tsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputs = document.querySelectorAll('.hours-input-cell');
      let registeredCount = 0;
      let totalHoursLogged = 0;

      // 1. Crear logs para cada celda con valor mayor a 0
      inputs.forEach(input => {
        const hrsValue = parseFloat(input.value);
        if (hrsValue > 0) {
          const taskId = parseInt(input.dataset.taskId);
          const dateStr = input.dataset.date;

          if (!db.proyectos.time_logs) {
            db.proyectos.time_logs = [];
          }

          // Registrar log
          const newLog = {
            id: window.DolibarrUtils.generateId(db.proyectos.time_logs),
            taskId: taskId,
            employeeId: selectedEmpId,
            date: dateStr,
            hours: hrsValue
          };
          db.proyectos.time_logs.push(newLog);

          // Actualizar horas acumuladas de la tarea
          const task = db.proyectos.tasks.find(t => t.id === taskId);
          if (task) {
            task.hours_spent = (task.hours_spent || 0) + hrsValue;
            if (task.status === 'Todo' || task.status === 'Por hacer') {
              task.status = 'InProgress'; // Poner en proceso al cargar horas
            }
          }

          registeredCount++;
          totalHoursLogged += hrsValue;
        }
      });

      // 2. Procesar los dropdowns de progreso de tareas
      document.querySelectorAll('.select-progress').forEach(select => {
        const taskId = parseInt(select.dataset.taskId);
        const progressVal = parseInt(select.value);
        const task = db.proyectos.tasks.find(t => t.id === taskId);

        if (task) {
          if (progressVal === 100) {
            task.status = 'Finalizado';
          } else if (progressVal > 0) {
            task.status = 'InProgress';
          } else {
            task.status = 'Todo';
          }
        }
      });

      // 3. Guardar en base de datos local y re-renderizar
      if (registeredCount > 0) {
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast(`Se registraron ${totalHoursLogged} horas en ${registeredCount} días correctamente.`, 'success');
        this.renderTimeTracking(container);
      } else {
        // Guardar cambios de progreso de todos modos
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Se guardaron los progresos de las tareas.", "success");
        this.renderTimeTracking(container);
      }
    });
  },

  /**
   * Helper: Calcula el número de semana ISO y las fechas asociadas
   */
  getWeekInfo: function(date) {
    const current = new Date(date);
    const day = current.getDay();
    // Ajustar para que el Lunes sea 0 y el Domingo 6
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d);
    }
    
    // Calcular número de semana ISO
    const tdt = new Date(date.valueOf());
    const dayn = (date.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    const firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
      tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    const weekNum = 1 + Math.ceil((firstThursday - tdt) / 604800000);
    
    return {
      monday: monday,
      dates: weekDates,
      weekNumber: weekNum,
      year: monday.getFullYear()
    };
  },

  /**
   * Helper: Formatea fecha Date a YYYY-MM-DD en hora local
   */
  formatISODate: function(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
};
