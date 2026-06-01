/**
 * agenda.js - Módulo de Agenda y Calendario Mensual
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.agenda = {
  // Estado interno para rastrear el mes y año visibles en el calendario
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),

  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'nuevo') {
      this.renderCalendar(mainContent, true);
    } else {
      this.renderCalendar(mainContent, false);
    }
  },

  /**
   * Renderiza la vista principal del calendario
   */
  renderCalendar: function(container, openModalImmediately = false) {
    const db = window.DolibarrDB.get();
    
    // Nombres de meses en español
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/agenda">Agenda</a> <i class="fas fa-chevron-right"></i> <strong>Calendario</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-calendar-days"></i> Calendario de Eventos</h1>
        <button id="btn-nuevo-evento" class="btn btn-primary">
          <i class="fas fa-calendar-plus"></i> Registrar Evento
        </button>
      </div>

      <!-- Controles del Calendario -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 12px 20px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <button id="btn-cal-prev" class="btn btn-secondary btn-sm"><i class="fas fa-chevron-left"></i></button>
            <h2 id="cal-month-title" style="font-size:18px; font-weight:700; width:150px; text-align:center; color:var(--dark);">
              ${monthNames[this.currentMonth]} ${this.currentYear}
            </h2>
            <button id="btn-cal-next" class="btn btn-secondary btn-sm"><i class="fas fa-chevron-right"></i></button>
            <button id="btn-cal-today" class="btn btn-secondary btn-sm" style="margin-left:12px;">Hoy</button>
          </div>
          
          <div style="display:flex; gap:16px; font-size:11px; font-weight:600;">
            <span style="display:flex; align-items:center; gap:6px;"><span style="width:12px; height:12px; border-radius:50%; background-color:#3A78D4; display:inline-block;"></span> Reunión</span>
            <span style="display:flex; align-items:center; gap:6px;"><span style="width:12px; height:12px; border-radius:50%; background-color:#F39C12; display:inline-block;"></span> Llamada</span>
            <span style="display:flex; align-items:center; gap:6px;"><span style="width:12px; height:12px; border-radius:50%; background-color:#2CB57E; display:inline-block;"></span> Visita Técnica</span>
            <span style="display:flex; align-items:center; gap:6px;"><span style="width:12px; height:12px; border-radius:50%; background-color:#7F8C8D; display:inline-block;"></span> Otros</span>
          </div>
        </div>
      </div>

      <!-- Cuadrícula del Calendario -->
      <div class="card">
        <div class="card-body" style="padding: 0;">
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight:600; font-size:12px; text-transform:uppercase; color:var(--text-muted); background-color:#FAFBFD; border-bottom: 1px solid var(--border-color); padding: 10px 0;">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>
          
          <div id="cal-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); background-color: var(--border-color);">
            <!-- Renderizado dinámicamente -->
          </div>
        </div>
      </div>

      <!-- MODAL: NUEVO EVENTO -->
      <div class="modal-overlay" id="modal-ev-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-calendar-plus"></i> Programar Actividad</h3>
            <button class="modal-close" id="modal-ev-close">&times;</button>
          </div>
          <form id="form-nuevo-ev">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="ev-title">Título de la Actividad *</label>
                <input type="text" id="ev-title" class="form-control" placeholder="Ej. Presentación de Propuesta Técnica" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="ev-type">Tipo de Evento *</label>
                  <select id="ev-type" class="form-control" required>
                    <option value="Reunión">Reunión Presencial</option>
                    <option value="Llamada">Llamada / Videollamada</option>
                    <option value="Visita">Visita Técnica de Campo</option>
                    <option value="Otro">Otro Compromiso</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ev-tercero">Vincular con Tercero (Opcional)</label>
                  <select id="ev-tercero" class="form-control">
                    <option value="">-- Ninguno --</option>
                    ${db.terceros.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="ev-date">Fecha del Evento *</label>
                  <input type="date" id="ev-date" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ev-time">Hora de Inicio *</label>
                  <input type="time" id="ev-time" class="form-control" required value="09:00">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="ev-desc">Glosa o Descripción Adicional</label>
                <textarea id="ev-desc" class="form-control" rows="3" placeholder="Ingresar notas de agenda..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-ev">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Evento</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Renderizar grilla
    this.drawGrid(db);

    // Eventos de Navegación
    document.getElementById('btn-cal-prev').addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.updateCalendarView(db, monthNames);
    });

    document.getElementById('btn-cal-next').addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.updateCalendarView(db, monthNames);
    });

    document.getElementById('btn-cal-today').addEventListener('click', () => {
      const now = new Date();
      this.currentMonth = now.getMonth();
      this.currentYear = now.getFullYear();
      this.updateCalendarView(db, monthNames);
    });

    // Control de Modal
    const modal = document.getElementById('modal-ev-overlay');
    const openBtn = document.getElementById('btn-nuevo-evento');
    const closeBtn = document.getElementById('modal-ev-close');
    const cancelBtn = document.getElementById('btn-cancel-ev');
    const form = document.getElementById('form-nuevo-ev');

    const openModalFunc = (prefillDate = null) => {
      form.reset();
      if (prefillDate) {
        document.getElementById('ev-date').value = prefillDate;
      } else {
        document.getElementById('ev-date').valueAsDate = new Date();
      }
      modal.classList.add('show');
    };

    const closeModalFunc = () => modal.classList.remove('show');

    openBtn.addEventListener('click', () => openModalFunc());
    closeBtn.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);

    if (openModalImmediately) openModalFunc();

    // Habilitar clicks en celdas de calendario para pre-llenar fecha
    container.addEventListener('click', (e) => {
      const cell = e.target.closest('.cal-day-cell');
      if (cell && !e.target.closest('.cal-event-ribbon')) {
        const dateStr = cell.dataset.date;
        if (dateStr) {
          openModalFunc(dateStr);
        }
      }
    });

    // Envío del Formulario
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const time = document.getElementById('ev-time').value;
      const date = document.getElementById('ev-date').value;
      const tId = document.getElementById('ev-tercero').value;

      const newEvent = {
        id: window.DolibarrUtils.generateId(db.agenda),
        title: document.getElementById('ev-title').value,
        desc: document.getElementById('ev-desc').value || '-',
        start_date: `${date}T${time}:00`,
        end_date: `${date}T${time}:30`, // Duración por defecto
        type: document.getElementById('ev-type').value,
        relationType: tId ? 'tercero' : 'ninguno',
        relationId: tId ? parseInt(tId) : null
      };

      db.agenda.push(newEvent);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Actividad "${newEvent.title}" agendada correctamente.`, 'success');
      closeModalFunc();
      this.renderCalendar(container, false);
    });
  },

  /**
   * Actualiza el título y redibuja la grilla
   */
  updateCalendarView: function(db, monthNames) {
    document.getElementById('cal-month-title').textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    this.drawGrid(db);
  },

  /**
   * Dibuja las celdas del calendario para el mes y año actuales
   */
  drawGrid: function(db) {
    const grid = document.getElementById('cal-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Primer día del mes (0: Domingo, 1: Lunes, etc.)
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    // Ajustar para que Lunes sea 0 y Domingo 6
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    // Total de días del mes anterior
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();

    // Total de días del mes actual
    const currentMonthDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    // 1. Dibujar días del mes anterior (grisados)
    for (let i = startOffset - 1; i >= 0; i--) {
      const prevDay = prevMonthDays - i;
      grid.appendChild(this.createCellHTML(prevDay, true));
    }

    // 2. Dibujar días del mes actual
    const today = new Date();
    const isCurrentMonthYear = today.getMonth() === this.currentMonth && today.getFullYear() === this.currentYear;

    for (let day = 1; day <= currentMonthDays; day++) {
      const isToday = isCurrentMonthYear && today.getDate() === day;
      const formattedDate = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      
      // Filtrar eventos de este día
      const dayEvents = db.agenda.filter(ev => ev.start_date.split('T')[0] === formattedDate);

      const cell = this.createCellHTML(day, false, isToday, formattedDate, dayEvents);
      grid.appendChild(cell);
    }

    // 3. Dibujar días del mes siguiente para completar la grilla (múltiplo de 7, total 42 celdas usuales)
    const totalCellsDrawn = startOffset + currentMonthDays;
    const remainingCells = 42 - totalCellsDrawn;

    for (let day = 1; day <= remainingCells; day++) {
      grid.appendChild(this.createCellHTML(day, true));
    }
  },

  /**
   * Crea el elemento DOM de la celda de un día
   */
  createCellHTML: function(dayNumber, isMuted, isToday = false, dateStr = '', events = []) {
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    
    // Aplicar estilos inline para evitar sobreescribir global.css
    cell.style.minHeight = '110px';
    cell.style.backgroundColor = isMuted ? '#FAFBFD' : '#FFFFFF';
    cell.style.border = '1px solid var(--border-color)';
    cell.style.padding = '6px';
    cell.style.overflowY = 'auto';
    cell.style.display = 'flex';
    cell.style.flexDirection = 'column';
    cell.style.gap = '4px';
    cell.style.cursor = isMuted ? 'default' : 'pointer';
    cell.style.position = 'relative';

    if (dateStr) cell.dataset.date = dateStr;

    // Indicador del número de día
    const numberSpan = document.createElement('span');
    numberSpan.textContent = dayNumber;
    numberSpan.style.fontSize = '12px';
    numberSpan.style.fontWeight = '600';
    numberSpan.style.width = '24px';
    numberSpan.style.height = '24px';
    numberSpan.style.display = 'flex';
    numberSpan.style.alignItems = 'center';
    numberSpan.style.justifyContent = 'center';
    numberSpan.style.color = isMuted ? '#94A3B8' : 'var(--dark)';

    if (isToday) {
      numberSpan.style.backgroundColor = 'var(--primary)';
      numberSpan.style.color = '#FFFFFF';
      numberSpan.style.borderRadius = '50%';
    }

    cell.appendChild(numberSpan);

    // Dibujar eventos
    if (!isMuted && events.length > 0) {
      events.forEach(ev => {
        const ribbon = document.createElement('div');
        ribbon.className = 'cal-event-ribbon';
        ribbon.textContent = `${ev.start_date.split('T')[1].substring(0,5)} ${ev.title}`;
        
        // Estilos del ribbon
        ribbon.style.fontSize = '10px';
        ribbon.style.fontWeight = '600';
        ribbon.style.padding = '3px 6px';
        ribbon.style.borderRadius = '3px';
        ribbon.style.color = '#FFFFFF';
        ribbon.style.whiteSpace = 'nowrap';
        ribbon.style.overflow = 'hidden';
        ribbon.style.textOverflow = 'ellipsis';
        
        // Color por tipo de evento
        let bg = '#7F8C8D'; // Otros
        if (ev.type === 'Reunión') bg = '#3A78D4'; // Azul
        if (ev.type === 'Llamada') bg = '#F39C12'; // Amarillo
        if (ev.type === 'Visita') bg = '#2CB57E'; // Verde

        ribbon.style.backgroundColor = bg;
        ribbon.title = `${ev.type}: ${ev.title}\n${ev.desc}`;

        cell.appendChild(ribbon);
      });
    }

    return cell;
  }
};
window.DolibarrModules.agenda = window.DolibarrModules.agenda;
