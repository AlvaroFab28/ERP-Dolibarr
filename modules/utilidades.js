/**
 * utilidades.js - Módulo de Utilidades del Sistema
 * Prototipo Dolibarr ERP v23.0.1
 * Localizado y Mejorado para DIASA S.A.
 */

window.DolibarrModules.utilidades = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inicializar colecciones de base de datos si no existen
    this.initDatabase();
    
    // Despachar según la sub-ruta configurada en router.js
    switch(subRoute) {
      case 'plantillas-email':
        this.renderEmailTemplates(mainContent);
        break;
      case 'emails-masivos':
        this.renderMassEmailsList(mainContent);
        break;
      case 'emails-masivos-nuevo':
        this.renderNewMassEmailForm(mainContent);
        break;
      case 'exportar':
        this.renderExportGrid(mainContent);
        break;
      case 'encuestas':
        this.renderSurveysList(mainContent);
        break;
      case 'encuestas-nueva':
        this.renderNewSurveyForm(mainContent);
        break;
      default:
        this.renderCategoriesList(mainContent);
        break;
    }
  },

  /**
   * Inicialización de datos persistentes en localStorage
   */
  initDatabase: function() {
    const db = window.DolibarrDB.get();
    let updated = false;

    // 1. Categorías / Etiquetas
    if (!db.categories) {
      db.categories = [
        { id: 1, label: "Clientes VIP Latam", type: "clientes", color: "#3A78D4", count: 2 },
        { id: 2, label: "Materias Primas Metalúrgicas", type: "productos", color: "#E74C3C", count: 3 },
        { id: 3, label: "Consultoría Especializada", type: "servicios", color: "#9B59B6", count: 2 },
        { id: 4, label: "Fallas Mecánicas Críticas", type: "tickets", color: "#F39C12", count: 1 }
      ];
      updated = true;
    }

    // 2. Plantillas de Email (Captura 5)
    if (!db.emailTemplates) {
      db.emailTemplates = [
        { id: 1, label: "test", lang: "en_US - Inglés", type: "-- Todo --", owner: "David Doe", pos: 1, subject: "test template", active: true },
        { id: 2, label: "contrat01", lang: "fr_FR - Francés", type: "Contratos", owner: "David Doe", pos: 1, subject: "contrat maintenance", active: true },
        { id: 3, label: "facture_diasa", lang: "es_ES - Español", type: "Facturas a clientes", owner: "admin", pos: 1, subject: "Envío de Factura DIASA S.A.", active: true },
        { id: 4, label: "Prueba_Envio", lang: "es_ES - Español", type: "Pedidos", owner: "admin", pos: 1, subject: "Confirmación de Pedido - Material Industrial", active: true },
        { id: 5, label: "presupuesto_diasa", lang: "es_ES - Español", type: "Presupuestos a clientes", owner: "admin", pos: 1, subject: "Cotización de Equipos Industriales", active: true },
        { id: 6, label: "Ticket_Recibido", lang: "es_ES - Español", type: "Tickets", owner: "David Doe", pos: 1, subject: "Recepción de Incidencia Técnica - DIASA", active: true }
      ];
      updated = true;
    }

    // 3. Campañas de E-mailing Masivos (Captura 2)
    if (!db.massEmails) {
      db.massEmails = [
        { id: 269, label: "Campaña Motores Siemens La Paz", date: "2026-06-02", count: 12, status: "Borrador" },
        { id: 268, label: "Boletín Válvulas API 6D Sector Minero", date: "2026-05-18", count: 47, status: "Borrador" },
        { id: 267, label: "EMailing de Promoción Otoño 2026", date: "2026-04-27", count: 3, status: "Enviado" },
        { id: 266, label: "Agradecimiento Clientes VIP YPFB", date: "2026-04-14", count: 1, status: "Enviado" },
        { id: 265, label: "Invitación Webinar Automatización Industrial", date: "2026-04-01", count: 65, status: "Enviado" }
      ];
      updated = true;
    }

    // 4. Área de Encuestas (Captura 6)
    if (!db.surveys) {
      db.surveys = [
        { ref: "tim1dye8x5eeetxu", title: "Satisfacción con Válvulas de Presión", type: "Tipo estándar", author: "Alejandro Mamani", votes: 27, limitDate: "2026-12-31", lastDate: "2026-06-03 10:15", status: "Activo" },
        { ref: "m4467s2mtk6kh6z", title: "Fecha sugerida Auditoría Anual", type: "Tipo fecha", author: "admin", votes: 10, limitDate: "2026-05-20", lastDate: "2026-05-19 15:30", status: "Cerrado" }
      ];
      updated = true;
    }

    if (updated) {
      window.DolibarrDB.save(db);
    }
  },

  // ==========================================
  // VISTA 1: ETIQUETAS Y CATEGORÍAS (Captura 1)
  // ==========================================
  renderCategoriesList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades">Utilidades</a> <i class="fas fa-chevron-right"></i> <strong>Etiquetas</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-tags"></i> Etiquetas y Categorías comerciales</h1>
        <button id="btn-nueva-cat" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Categoría
        </button>
      </div>

      <p class="text-muted" style="margin-bottom: 20px; font-size:12.5px;">
        Las categorías (o etiquetas) se pueden usar para categorizar los objetos administrados por la aplicación. Seleccione el tipo de categorías/etiquetas que desea ver o editar.
      </p>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start;">
        <!-- Clasificación Vigente -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-list-check text-muted"></i> Clasificaciones en Uso (${db.categories.length})</div>
          </div>
          <div class="card-body" style="padding: 0;">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th style="width: 70px;">ID</th>
                  <th>Etiqueta / Categoría</th>
                  <th>Entidad Asignable</th>
                  <th style="text-align: center; width: 130px;">Color</th>
                  <th style="text-align: right; width: 140px;">Vinculados</th>
                  <th style="text-align: center; width: 80px;">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${db.categories.map(c => {
                  let typeLabel = 'Clientes';
                  if (c.type === 'productos') typeLabel = 'Productos Físicos';
                  if (c.type === 'servicios') typeLabel = 'Servicios';
                  if (c.type === 'tickets') typeLabel = 'Incidencias';

                  return `
                    <tr>
                      <td><code>CAT-${c.id}</code></td>
                      <td><strong>${c.label}</strong></td>
                      <td><span class="badge badge-secondary" style="font-size:10px;">${typeLabel}</span></td>
                      <td style="text-align: center;">
                        <span style="display:inline-flex; align-items:center; gap:6px;">
                          <span style="width:12px; height:12px; border-radius:50%; background-color:${c.color}; display:inline-block; border:1px solid rgba(0,0,0,0.15);"></span>
                          <code>${c.color}</code>
                        </span>
                      </td>
                      <td style="text-align: right;" class="font-semibold">${c.count} registros</td>
                      <td style="text-align: center;">
                        <button class="btn btn-secondary btn-sm btn-eliminar-cat" data-id="${c.id}" style="color:var(--danger); border-color:#FCA5A5; padding:3px 6px;">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Módulos de Referencia (Captura 1) -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-info-circle text-muted"></i> Resumen de Módulos</div>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="table">
              <thead>
                <tr>
                  <th>Tipo de Entidad</th>
                  <th style="text-align:right;">Total Tags</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><i class="fas fa-users text-muted mr-1"></i> Potenciales o clientes</td><td style="text-align:right; font-weight:700;">59</td></tr>
                <tr><td><i class="fas fa-box text-muted mr-1"></i> Productos</td><td style="text-align:right; font-weight:700;">526</td></tr>
                <tr><td><i class="fas fa-hand-holding-hand text-muted mr-1"></i> Servicios</td><td style="text-align:right; font-weight:700;">526</td></tr>
                <tr><td><i class="fas fa-warehouse text-muted mr-1"></i> Almacenes</td><td style="text-align:right; font-weight:700;">99</td></tr>
                <tr><td><i class="fas fa-university text-muted mr-1"></i> Cuentas Bancarias</td><td style="text-align:right; font-weight:700;">8</td></tr>
                <tr><td><i class="fas fa-file-invoice text-muted mr-1"></i> Facturas</td><td style="text-align:right; font-weight:700;">9</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- MODAL: REGISTRAR CATEGORÍA -->
      <div class="modal-overlay" id="modal-cat-overlay">
        <div class="modal-container" style="max-width:450px; background:#FFFFFF; color:var(--text-main);">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-tag"></i> Registrar Clasificación</h3>
            <button class="modal-close" id="modal-cat-close">&times;</button>
          </div>
          <form id="form-nuevo-cat" onsubmit="return false;">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="c-label">Nombre de la Categoría *</label>
                <input type="text" id="c-label" class="form-control" placeholder="Ej. Motores Industriales" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="c-type">Tipo de Entidad *</label>
                  <select id="c-type" class="form-control" required>
                    <option value="clientes">Clientes</option>
                    <option value="productos">Productos Físicos</option>
                    <option value="servicios">Servicios en Catálogo</option>
                    <option value="tickets">Incidencias Soporte</option>
                  </select>
                </div>
                <div class="form-group" style="flex:0 0 120px;">
                  <label class="form-label" for="c-color">Color Visual *</label>
                  <input type="color" id="c-color" class="form-control" style="height:38px; padding:2px;" value="#3A78D4" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-cat">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-cat">Crear Categoría</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Eventos
    const modal = document.getElementById('modal-cat-overlay');
    const openBtn = document.getElementById('btn-nueva-cat');
    const closeBtn = document.getElementById('modal-cat-close');
    const cancelBtn = document.getElementById('btn-cancel-cat');
    const form = document.getElementById('form-nuevo-cat');

    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    document.getElementById('btn-submit-cat').addEventListener('click', () => {
      const label = document.getElementById('c-label').value.trim();
      const type = document.getElementById('c-type').value;
      const color = document.getElementById('c-color').value;

      if (!label) {
        alert("El nombre es obligatorio");
        return;
      }

      db.categories.push({
        id: window.DolibarrUtils.generateId(db.categories),
        label: label,
        type: type,
        color: color,
        count: 0
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Categoría "${label}" creada con éxito.`, "success");
      closeModal();
      this.renderCategoriesList(container);
    });

    document.querySelectorAll('.btn-eliminar-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const idx = db.categories.findIndex(c => c.id === id);
        if (idx !== -1) {
          const name = db.categories[idx].label;
          if (confirm(`¿Eliminar la categoría "${name}"?`)) {
            db.categories.splice(idx, 1);
            window.DolibarrDB.save(db);
            window.DolibarrUtils.showToast("Categoría eliminada.", "warning");
            this.renderCategoriesList(container);
          }
        }
      });
    });
  },

  // ==========================================
  // VISTA 2: PLANTILLAS DE EMAIL (Captura 5)
  // ==========================================
  renderEmailTemplates: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades">Utilidades</a> <i class="fas fa-chevron-right"></i> <strong>Plantillas de Email</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-envelope-open-text"></i> Plantillas de Correo Electrónico</h1>
        <button id="btn-nueva-plantilla" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Plantilla
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-envelope text-muted"></i> Listado de Plantillas Activas (${db.emailTemplates.length})</div>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Etiqueta</th>
                <th>Idioma</th>
                <th>Módulo / Origen</th>
                <th>Propietario</th>
                <th>Asunto del Email</th>
                <th style="text-align:center; width:120px;">Predeterminado</th>
                <th style="text-align:center; width:100px;">Estado</th>
                <th style="text-align:center; width:90px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${db.emailTemplates.map(t => `
                <tr>
                  <td><strong>${t.label}</strong></td>
                  <td><span style="font-size:12px; color:var(--text-muted);">${t.lang}</span></td>
                  <td><span class="badge badge-secondary" style="font-size:10px;">${t.type}</span></td>
                  <td><code>${t.owner}</code></td>
                  <td><span style="font-size:12.5px;">${t.subject}</span></td>
                  <td style="text-align:center;">
                    <i class="${t.id === 3 ? 'fas fa-check-circle text-success' : 'far fa-circle text-muted'}" style="font-size:14px;"></i>
                  </td>
                  <td style="text-align:center;">
                    <label class="switch">
                      <input type="checkbox" class="toggle-template-status" data-id="${t.id}" ${t.active ? 'checked' : ''}>
                      <span class="slider" style="border-radius:18px;"></span>
                    </label>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm btn-eliminar-plantilla" data-id="${t.id}" style="color:var(--danger); border-color:#FCA5A5; padding:3px 6px;">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: REGISTRAR PLANTILLA -->
      <div class="modal-overlay" id="modal-plantilla-overlay">
        <div class="modal-container" style="max-width:480px; background:#FFFFFF; color:var(--text-main);">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-plus-circle"></i> Registrar Nueva Plantilla</h3>
            <button class="modal-close" id="modal-plantilla-close">&times;</button>
          </div>
          <form id="form-nueva-plantilla" onsubmit="return false;">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="pt-label">Código / Nombre de la Plantilla *</label>
                <input type="text" id="pt-label" class="form-control" placeholder="Ej. factura_vencida" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="pt-subject">Asunto del Correo *</label>
                <input type="text" id="pt-subject" class="form-control" placeholder="Ej. Factura pendiente de pago DIASA" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="pt-type">Módulo Destinado *</label>
                  <select id="pt-type" class="form-control">
                    <option value="Facturas a clientes">Facturas a clientes</option>
                    <option value="Pedidos">Pedidos de venta</option>
                    <option value="Presupuestos a clientes">Presupuestos / Cotizaciones</option>
                    <option value="Contratos">Contratos comerciales</option>
                    <option value="Tickets">Soporte Técnico</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="pt-lang">Idioma *</label>
                  <select id="pt-lang" class="form-control">
                    <option value="es_ES - Español">Español (es_ES)</option>
                    <option value="en_US - Inglés">Inglés (en_US)</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-plantilla">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-plantilla">Guardar Plantilla</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Eventos
    const modal = document.getElementById('modal-plantilla-overlay');
    const openBtn = document.getElementById('btn-nueva-plantilla');
    const closeBtn = document.getElementById('modal-plantilla-close');
    const cancelBtn = document.getElementById('btn-cancel-plantilla');
    const form = document.getElementById('form-nueva-plantilla');

    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    document.getElementById('btn-submit-plantilla').addEventListener('click', () => {
      const label = document.getElementById('pt-label').value.trim();
      const subject = document.getElementById('pt-subject').value.trim();
      const type = document.getElementById('pt-type').value;
      const lang = document.getElementById('pt-lang').value;

      if (!label || !subject) {
        alert("Todos los campos obligatorios (*)");
        return;
      }

      db.emailTemplates.push({
        id: window.DolibarrUtils.generateId(db.emailTemplates),
        label: label,
        lang: lang,
        type: type,
        owner: "admin",
        pos: 1,
        subject: subject,
        active: true
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Plantilla "${label}" guardada con éxito.`, "success");
      closeModal();
      this.renderEmailTemplates(container);
    });

    document.querySelectorAll('.toggle-template-status').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id);
        const t = db.emailTemplates.find(pl => pl.id === id);
        if (t) {
          t.active = e.target.checked;
          window.DolibarrDB.save(db);
          window.DolibarrUtils.showToast(`Estado de plantilla "${t.label}" modificado.`, "info");
        }
      });
    });

    document.querySelectorAll('.btn-eliminar-plantilla').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const idx = db.emailTemplates.findIndex(pl => pl.id === id);
        if (idx !== -1) {
          const name = db.emailTemplates[idx].label;
          if (confirm(`¿Eliminar la plantilla "${name}"?`)) {
            db.emailTemplates.splice(idx, 1);
            window.DolibarrDB.save(db);
            window.DolibarrUtils.showToast("Plantilla eliminada.", "warning");
            this.renderEmailTemplates(container);
          }
        }
      });
    });
  },

  // ==========================================
  // VISTA 3: HISTORIAL EMAILING MASIVO (Captura 2)
  // ==========================================
  renderMassEmailsList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades">Utilidades</a> <i class="fas fa-chevron-right"></i> <strong>Correos electrónicos masivos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-mail-bulk"></i> Correos Electrónicos Masivos (E-Mailing)</h1>
        <a href="#/utilidades/emails-masivos-nuevo" class="btn btn-primary">
          <i class="fas fa-paper-plane"></i> Nuevo Correo Masivo
        </a>
      </div>

      <div style="display:grid; grid-template-columns:1.2fr 2fr; gap:20px; align-items:start;">
        
        <!-- Bloque Izquierdo: Buscador & Destinatarios -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <!-- Buscador -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-search"></i> Buscar un correo masivo</div>
            </div>
            <div class="card-body">
              <form id="form-search-emailing" onsubmit="return false;">
                <div class="form-group">
                  <label class="form-label" for="search-ref">Ref. o Asunto</label>
                  <input type="text" id="search-ref" class="form-control" placeholder="Ej. Campaña 269">
                </div>
                <button class="btn btn-primary btn-sm" id="btn-search-mailings" style="width:100%;">
                  <i class="fas fa-search"></i> BUSCAR CAMPAÑA
                </button>
              </form>
            </div>
          </div>

          <!-- Estadísticas Destinatarios (Captura 2) -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-chart-pie"></i> Estadísticas de Destinatarios</div>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table">
                <tbody>
                  <tr>
                    <td><i class="fas fa-user-friends text-muted mr-1"></i> Miembros de la asociación</td>
                    <td style="text-align:right; font-weight:700;">3</td>
                  </tr>
                  <tr>
                    <td><i class="fas fa-address-book text-muted mr-1"></i> Contactos/direcciones únicos</td>
                    <td style="text-align:right; font-weight:700;">47</td>
                  </tr>
                  <tr>
                    <td><i class="fas fa-user-tie text-muted mr-1"></i> Usuarios de la aplicación (DIASA)</td>
                    <td style="text-align:right; font-weight:700;">13</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Bloque Derecho: Listado de Emails Masivos -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-list"></i> Últimos correos electrónicos masivos</div>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Etiqueta / Campaña</th>
                  <th>Fecha de creación</th>
                  <th style="text-align:right;">Nº de Emails</th>
                  <th style="text-align:center;">Estado</th>
                </tr>
              </thead>
              <tbody id="mailings-table-body">
                <!-- Se poblará dinámicamente -->
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Pintar listado de campañas
    this.populateMailingsTable();

    // Evento buscar
    document.getElementById('btn-search-mailings').addEventListener('click', () => {
      const q = document.getElementById('search-ref').value;
      this.populateMailingsTable(q);
    });
  },

  populateMailingsTable: function(query = '') {
    const db = window.DolibarrDB.get();
    const tbody = document.getElementById('mailings-table-body');
    if (!tbody) return;

    let filtered = db.massEmails;
    if (query.trim()) {
      const term = query.toLowerCase().trim();
      filtered = filtered.filter(m => m.label.toLowerCase().includes(term) || String(m.id).includes(term));
    }

    tbody.innerHTML = filtered.map(m => `
      <tr>
        <td><code>@ ${m.id}</code></td>
        <td><strong>${m.label}</strong></td>
        <td>${m.date}</td>
        <td style="text-align:right; font-weight:600;">${m.count}</td>
        <td style="text-align:center;">
          <span class="badge ${m.status === 'Enviado' ? 'badge-success' : 'badge-secondary'}">
            ${m.status}
          </span>
        </td>
      </tr>
    `).join('');
  },

  // ==========================================
  // VISTA 4: CREAR CORREO MASIVO (Captura 3)
  // ==========================================
  renderNewMassEmailForm: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades">Utilidades</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades/emails-masivos">Correos masivos</a> <i class="fas fa-chevron-right"></i> <strong>Nuevo Correo Masivo</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-envelope-open-text"></i> Nuevo Correo Masivo</h1>
        <span class="text-muted" style="font-size:11px;">Variables de sustitución disponibles <i class="fas fa-info-circle"></i></span>
      </div>

      <div class="card">
        <div class="card-body">
          <form id="form-create-mailing" onsubmit="return false;">
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label" for="m-label">Etiqueta de la Campaña *</label>
                <input type="text" id="m-label" class="form-control" value="Envío por correo electrónico de ${new Date().toISOString().split('T')[0]}" required>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label" for="m-project">Proyecto Vinculado</label>
                <select id="m-project" class="form-control">
                  <option value="">-- Ninguno --</option>
                  ${(db.proyectos?.projects || []).map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="m-from">Remitente (De) *</label>
                <input type="email" id="m-from" class="form-control" value="contacto@diasa.com.bo" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="m-errors">Errores a (Errors-To)</label>
                <input type="email" id="m-errors" class="form-control" placeholder="bounce@diasa.com.bo">
              </div>
              <div class="form-group">
                <label class="form-label" for="m-reply">Responder a (Reply-To)</label>
                <input type="email" id="m-reply" class="form-control" placeholder="soporte@diasa.com.bo">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="m-subject">Asunto del Email *</label>
              <input type="text" id="m-subject" class="form-control" placeholder="[DIASA S.A.] Ingrese el asunto de su correo aquí..." required>
            </div>

            <!-- WYSIWYG Editor Simulator -->
            <div class="form-group">
              <label class="form-label">Contenido del Correo (Cuerpo del Mensaje)</label>
              <div style="border: 1px solid var(--border-color-dark); border-radius: var(--radius-md); overflow:hidden;">
                <!-- Editor Toolbar -->
                <div style="background:#FAFBFD; border-bottom:1px solid var(--border-color-dark); padding:6px 12px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Negrita"><strong>B</strong></button>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Cursiva"><em>I</em></button>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Subrayado"><u>U</u></button>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Tachado"><del>S</del></button>
                  <div style="width:1px; height:18px; background:#CBD5E1;"></div>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Izquierda"><i class="fas fa-align-left"></i></button>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Centro"><i class="fas fa-align-center"></i></button>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Derecha"><i class="fas fa-align-right"></i></button>
                  <div style="width:1px; height:18px; background:#CBD5E1;"></div>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Insertar Enlace"><i class="fas fa-link"></i></button>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" title="Insertar Imagen"><i class="fas fa-image"></i></button>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:11px; margin-left:auto;"><i class="fas fa-code"></i> Código HTML</button>
                </div>
                <!-- Textarea -->
                <textarea id="m-body" class="form-control" rows="8" style="border:none; border-radius:0; outline:none; box-shadow:none; font-family:sans-serif;" placeholder="Estimado cliente,\n\nQueremos presentarle nuestra nueva gama de motores trifásicos Siemens en stock inmediato...\n\nAtentamente,\nDIASA S.A. Bolivia"></textarea>
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:16px; margin-top:24px;">
              <button class="btn btn-secondary" id="btn-cancel-mailing" type="button">ANULAR</button>
              <button class="btn btn-primary" id="btn-submit-mailing" type="submit">CREAR CAMPAÑA</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('btn-cancel-mailing').addEventListener('click', () => {
      window.location.hash = '#/utilidades/emails-masivos';
    });

    document.getElementById('btn-submit-mailing').addEventListener('click', () => {
      const label = document.getElementById('m-label').value.trim();
      const subject = document.getElementById('m-subject').value.trim();
      const body = document.getElementById('m-body').value.trim();

      if (!label || !subject || !body) {
        alert("Todos los campos marcados con (*) son obligatorios");
        return;
      }

      db.massEmails.push({
        id: Math.floor(Math.random() * 900 + 300),
        label: label,
        date: new Date().toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50 + 10),
        status: "Borrador"
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Campaña de Correo Masivo creada como borrador.", "success");
      
      // Redirigir a listado
      window.location.hash = '#/utilidades/emails-masivos';
    });
  },

  // ==========================================
  // VISTA 5: PASO 1 EXPORTACIÓN (Captura 4)
  // ==========================================
  renderExportGrid: function(container) {
    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades">Utilidades</a> <i class="fas fa-chevron-right"></i> <strong>Exportaciones</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-download"></i> Nueva Exportación — Paso 1</h1>
      </div>

      <p class="text-muted" style="margin-bottom: 20px; font-size:12.5px;">
        Elija un conjunto predefinido de datos que desee exportar de la base de datos de DIASA S.A.
      </p>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-database"></i> Datasets y Permisos de Exportación</div>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Módulo ERP</th>
                <th>Conjunto de datos exportables</th>
                <th style="width:120px; text-align:center;">Acción</th>
              </tr>
            </thead>
            <tbody>
              <!-- Pedidos -->
              <tr>
                <td><strong>Pedidos de Venta</strong></td>
                <td><i class="fas fa-file-invoice-dollar text-muted mr-1" style="margin-right:6px;"></i> Pedidos de clientes y líneas de pedido</td>
                <td style="text-align:center;">
                  <button class="btn btn-primary btn-sm btn-export-action" data-file="pedidos_clientes" style="width:30px; height:30px; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center;">
                    <i class="fas fa-arrow-right"></i>
                  </button>
                </td>
              </tr>
              <!-- Almacenes -->
              <tr>
                <td><strong>Stock de Productos</strong></td>
                <td><i class="fas fa-warehouse text-muted mr-1" style="margin-right:6px;"></i> Almacenes físicos y stocks centralizados</td>
                <td style="text-align:center;">
                  <button class="btn btn-primary btn-sm btn-export-action" data-file="almacenes_diasa" style="width:30px; height:30px; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center;">
                    <i class="fas fa-arrow-right"></i>
                  </button>
                </td>
              </tr>
              <!-- Facturas -->
              <tr>
                <td><strong>Facturación y Pagos</strong></td>
                <td><i class="fas fa-receipt text-muted mr-1" style="margin-right:6px;"></i> Facturas emitidas a clientes y cobros recibidos</td>
                <td style="text-align:center;">
                  <button class="btn btn-primary btn-sm btn-export-action" data-file="facturas_emitidas" style="width:30px; height:30px; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center;">
                    <i class="fas fa-arrow-right"></i>
                  </button>
                </td>
              </tr>
              <!-- Terceros -->
              <tr>
                <td><strong>Terceros / Clientes</strong></td>
                <td><i class="fas fa-users text-muted mr-1" style="margin-right:6px;"></i> Lista completa de contactos y fichas de clientes comerciales</td>
                <td style="text-align:center;">
                  <button class="btn btn-primary btn-sm btn-export-action" data-file="terceros_comercial" style="width:30px; height:30px; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center;">
                    <i class="fas fa-arrow-right"></i>
                  </button>
                </td>
              </tr>

              <!-- Resto de filas sin permisos (Grisado como en captura 4) -->
              <tr style="opacity: 0.65;">
                <td>Proyectos y Oportunidades</td>
                <td>Proyectos, tareas y asignación de tiempos</td>
                <td style="text-align:center;"><span class="text-muted" style="font-size:11px;">No habilitado</span></td>
              </tr>
              <tr style="opacity: 0.65;">
                <td>Recursos Humanos</td>
                <td>Salarios, contratos laborales e informes de gastos</td>
                <td style="text-align:center;"><span class="text-muted" style="font-size:11px;">No habilitado</span></td>
              </tr>
              <tr style="opacity: 0.65;">
                <td>Contabilidad General</td>
                <td>Libro Mayor y Diarios de compras/ventas</td>
                <td style="text-align:center;"><span class="text-muted" style="font-size:11px;">No habilitado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Eventos de exportación (Descarga simulada de archivo Excel/CSV)
    document.querySelectorAll('.btn-export-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const fileName = btn.dataset.file;
        window.DolibarrUtils.showToast("Generando archivo de exportación...", "info");
        
        setTimeout(() => {
          // Crear un link invisible para descargar un CSV simulado
          const link = document.createElement("a");
          const csvContent = "data:text/csv;charset=utf-8,ID,Ref,Tercero,Fecha,Monto\n1,FA2605-001,YPFB Corp,2026-05-12,47460.00\n2,FA2605-002,CBN S.A.,2026-05-25,61020.00";
          link.setAttribute("href", encodeURI(csvContent));
          link.setAttribute("download", `${fileName}_export_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.DolibarrUtils.showToast(`Archivo "${fileName}.csv" descargado con éxito.`, "success");
        }, 800);
      });
    });
  },

  // ==========================================
  // VISTA 6: ÁREA DE ENCUESTAS (Captura 6)
  // ==========================================
  renderSurveysList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades">Utilidades</a> <i class="fas fa-chevron-right"></i> <strong>Área de Encuestas</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-poll"></i> Área de Encuestas Comerciales</h1>
        <a href="#/utilidades/encuestas-nueva" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Encuesta
        </a>
      </div>

      <p class="text-muted" style="margin-bottom: 20px; font-size:12.5px;">
        Cree votaciones de fecha (para coordinar reuniones o auditorías) o encuestas estándar de respuestas múltiples para sondear el mercado de DIASA S.A.
      </p>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-check-double"></i> Encuestas y Votaciones Vigentes (${db.surveys.length})</div>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Título de la Encuesta</th>
                <th>Tipo</th>
                <th>Autor</th>
                <th style="text-align:right;">Votos Acumulados</th>
                <th>Fecha Límite</th>
                <th>Última modificación</th>
                <th style="text-align:center; width:100px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${db.surveys.map(s => `
                <tr>
                  <td><code>${s.ref}</code></td>
                  <td><strong>${s.title}</strong></td>
                  <td><span class="badge badge-secondary" style="font-size:10px;">${s.type}</span></td>
                  <td><span style="font-size:12.5px;">${s.author}</span></td>
                  <td style="text-align:right; font-weight:700; color:var(--primary);">${s.votes} votos</td>
                  <td>
                    ${s.limitDate} 
                    ${s.status === 'Activo' ? '<i class="fas fa-clock text-warning" title="En curso"></i>' : ''}
                  </td>
                  <td>${s.lastDate}</td>
                  <td style="text-align:center;">
                    <span class="badge ${s.status === 'Activo' ? 'badge-success' : 'badge-danger'}">
                      ${s.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ==========================================
  // VISTA 7: NUEVA ENCUESTA
  // ==========================================
  renderNewSurveyForm: function(container) {
    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades">Utilidades</a> <i class="fas fa-chevron-right"></i> <a href="#/utilidades/encuestas">Encuestas</a> <i class="fas fa-chevron-right"></i> <strong>Nueva Encuesta</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-plus-square"></i> Registrar Nueva Encuesta / Sondeo</h1>
      </div>

      <div class="card">
        <div class="card-body">
          <form id="form-create-survey" onsubmit="return false;">
            <div class="form-group">
              <label class="form-label" for="s-title">Título de la Encuesta *</label>
              <input type="text" id="s-title" class="form-control" placeholder="Ej. Sondeo satisfacción de servicio postventa motores" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="s-type">Tipo de Cuestionario *</label>
                <select id="s-type" class="form-control" required>
                  <option value="Tipo estándar">Cuestionario Estándar (Respuestas múltiples)</option>
                  <option value="Tipo fecha">Votación de Fecha (Para reuniones)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="s-limit">Fecha de Cierre Límite *</label>
                <input type="date" id="s-limit" class="form-control" required>
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:16px; margin-top:24px;">
              <button class="btn btn-secondary" id="btn-cancel-survey" type="button">CANCELAR</button>
              <button class="btn btn-primary" id="btn-submit-survey" type="submit">CREAR ENCUESTA</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('btn-cancel-survey').addEventListener('click', () => {
      window.location.hash = '#/utilidades/encuestas';
    });

    document.getElementById('btn-submit-survey').addEventListener('click', () => {
      const title = document.getElementById('s-title').value.trim();
      const type = document.getElementById('s-type').value;
      const limit = document.getElementById('s-limit').value;

      if (!title || !limit) {
        alert("Todos los campos (*) son obligatorios");
        return;
      }

      const db = window.DolibarrDB.get();
      const ref = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
      
      db.surveys.push({
        ref: ref,
        title: title,
        type: type,
        author: "admin",
        votes: 0,
        limitDate: limit,
        lastDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "Activo"
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Nueva Encuesta creada con éxito en el Área de encuestas.", "success");
      
      window.location.hash = '#/utilidades/encuestas';
    });
  }
};
