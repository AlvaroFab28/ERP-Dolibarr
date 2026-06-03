/**
 * sitios.js - Módulo de Sitios Web y CMS
 * Prototipo Dolibarr ERP v23.0.1
 * Localizado y Mejorado para DIASA S.A.
 */

window.DolibarrModules.sitios = {
  // Estado interno
  activeSiteKey: null,
  activePageKey: 'index',
  
  // Inicialización de datos y carga de páginas del sitio activo
  getSitePages: function(siteKey) {
    const db = window.DolibarrDB.get();
    if (!db.sitiosPages) {
      db.sitiosPages = {};
    }
    
    // Si no existen páginas para este sitio, inicializarlas con valores por defecto
    if (!db.sitiosPages[siteKey]) {
      if (siteKey === 'main_diasa') {
        db.sitiosPages[siteKey] = {
          'index': { 
            title: "Inicio - DIASA S.A.", 
            content: "<h1>Distribuidora Industrial Altiplano S.A.</h1>\n<p>Proveedor líder en automatización, válvulas de control y motores Siemens para la industria boliviana.</p>\n<div style='margin-top:20px; padding:15px; background:#F8FAFC; border-radius:8px; border-left:4px solid #3A78D4;'>\n  <h3>Nuestra Misión en Bolivia</h3>\n  <p>Suministrar soluciones de ingeniería de alta calidad con soporte local en La Paz, Cochabamba y Santa Cruz.</p>\n</div>", 
            seo: "DIASA Bolivia, automatizacion industrial, motores Siemens",
            published: true
          },
          'productos': { 
            title: "Productos - Catálogo Industrial", 
            content: "<h1>Nuestros Equipos en Stock</h1>\n<p>Conoce nuestras válvulas API 6D de presión y motores eléctricos trifásicos Siemens en stock central La Paz.</p>\n<ul>\n  <li>Motores trifásicos Siemens de 50HP</li>\n  <li>Tuberías de acero al carbono SCH 40</li>\n  <li>Válvulas de control de presión de 3\"</li>\n</ul>", 
            seo: "Motores Siemens, valvulas API Bolivia, stock diasa",
            published: true
          },
          'contacto': { 
            title: "Contacto - DIASA La Paz", 
            content: "<h1>Contacto Comercial</h1>\n<p>Av. Arce Nro. 2529, Edificio Torres de los Poetas, Piso 12. La Paz, Bolivia.</p>\n<p><strong>Teléfono:</strong> +591 2 2432211</p>\n<p><strong>Email:</strong> contacto@diasa.com.bo</p>", 
            seo: "direccion diasa la paz bolivia, telefono diasa",
            published: true
          }
        };
      } else if (siteKey === 'portal_clients') {
        db.sitiosPages[siteKey] = {
          'index': { 
            title: "Portal de Autoservicio - DIASA", 
            content: "<h1>Portal de Clientes</h1>\n<p>Bienvenido al portal de autoservicio para consultas de facturas, pedidos y soporte técnico de DIASA S.A.</p>", 
            seo: "portal clientes diasa, autoservicio",
            published: true
          },
          'soporte': { 
            title: "Soporte Técnico - DIASA", 
            content: "<h1>Soporte y Garantías</h1>\n<p>Registre sus solicitudes de soporte y descargue guías técnicas de equipos industriales aquí.</p>", 
            seo: "soporte tecnico diasa bolivia, reclamos",
            published: false
          }
        };
      } else {
        db.sitiosPages[siteKey] = {
          'index': { 
            title: "Nuevo Sitio - Inicio", 
            content: "<h1>Nuevo Sitio Web</h1>\n<p>Esta es la página de inicio de tu sitio web recientemente creado.</p>", 
            seo: "nuevo sitio, inicio",
            published: true
          }
        };
      }
      window.DolibarrDB.save(db);
    }
    return db.sitiosPages[siteKey];
  },

  saveSitePages: function(siteKey, pages) {
    const db = window.DolibarrDB.get();
    if (!db.sitiosPages) {
      db.sitiosPages = {};
    }
    db.sitiosPages[siteKey] = pages;
    window.DolibarrDB.save(db);
  },

  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Cargar primer sitio disponible si no hay activo
    const db = window.DolibarrDB.get();
    if (!this.activeSiteKey && db.sitios && db.sitios.length > 0) {
      this.activeSiteKey = db.sitios[0].key;
    }
    
    // Validar que la página activa exista en el sitio actual
    const pages = this.getSitePages(this.activeSiteKey);
    if (!pages[this.activePageKey]) {
      this.activePageKey = Object.keys(pages)[0] || 'index';
    }
    
    this.renderCMS(mainContent);
  },

  renderCMS: function(container) {
    const db = window.DolibarrDB.get();
    const site = db.sitios.find(s => s.key === this.activeSiteKey) || db.sitios[0];
    const pages = this.getSitePages(this.activeSiteKey);
    const activePage = pages[this.activePageKey];

    container.innerHTML = `
      <style>
        /* Estilos específicos de Sitios WEB */
        .cms-toolbar {
          background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
          border: 1px solid var(--border-color-dark);
          border-radius: var(--radius-md);
          padding: 10px 18px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: var(--shadow-sm);
        }
        
        .cms-toolbar-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cms-toolbar-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cms-toolbar-select {
          padding: 6px 10px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border-color-dark);
          border-radius: var(--radius-sm);
          background-color: #FFFFFF;
          color: var(--text-main);
          outline: none;
          min-width: 180px;
          cursor: pointer;
        }

        .cms-toolbar-select:focus {
          border-color: var(--primary);
        }

        .cms-toolbar-btn {
          background: #FFFFFF;
          border: 1px solid var(--border-color-dark);
          color: var(--text-main);
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-base);
          font-size: 14px;
        }

        .cms-toolbar-btn:hover {
          background: #E2E8F0;
          color: var(--primary);
          border-color: var(--primary);
        }

        .cms-toolbar-btn-text {
          background: #FFFFFF;
          border: 1px solid var(--border-color-dark);
          color: var(--text-main);
          height: 32px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-base);
          font-size: 13px;
          font-weight: 500;
        }

        .cms-toolbar-btn-text:hover {
          background: #E2E8F0;
          color: var(--primary);
          border-color: var(--primary);
        }

        .cms-toolbar-divider {
          width: 1px;
          height: 24px;
          background-color: var(--border-color-dark);
        }

        /* Estilo Switch Toggle */
        .switch-container {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 34px;
          height: 18px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #CBD5E1;
          transition: .2s;
          border-radius: 18px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 12px;
          width: 12px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .2s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--success);
        }

        input:checked + .slider:before {
          transform: translateX(16px);
        }

        .cms-preview-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--primary);
          z-index: 10;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .cms-preview-loading.show {
          opacity: 1;
          pointer-events: auto;
        }
      </style>

      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/sitios">Sitios Web</a> <i class="fas fa-chevron-right"></i> <strong>Consola CMS</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-globe"></i> Sitios Web y Portales CMS</h1>
        <div style="display:flex; gap:10px;">
          <button id="btn-clone-site" class="btn btn-secondary btn-sm"><i class="fas fa-copy"></i> Clonar Sitio</button>
          <button id="btn-export-site" class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Exportar ZIP</button>
        </div>
      </div>

      <!-- Barra superior de control CMS (Toolbar Réplica) -->
      <div class="cms-toolbar">
        <div class="cms-toolbar-section">
          <span class="cms-toolbar-label">Website:</span>
          <select id="select-active-site" class="cms-toolbar-select" style="min-width: 220px;">
            ${db.sitios.map(s => `<option value="${s.key}" ${s.key === this.activeSiteKey ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
          
          <div class="switch-container" title="Activar/Desactivar Sitio en Producción">
            <label class="switch">
              <input type="checkbox" id="toggle-site-status" ${site.status === 'Publicado' ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
            <span id="site-status-badge" class="badge ${site.status === 'Publicado' ? 'badge-success' : 'badge-warning'}" style="font-size:10px; padding:2px 6px;">
              ${site.status}
            </span>
          </div>

          <button id="btn-edit-site-props" class="cms-toolbar-btn" title="Propiedades del Sitio Web">
            <i class="fas fa-cog"></i>
          </button>
        </div>

        <div class="cms-toolbar-divider"></div>

        <div class="cms-toolbar-section">
          <span class="cms-toolbar-label">Página:</span>
          <select id="select-active-page" class="cms-toolbar-select" style="min-width: 140px;">
            ${Object.keys(pages).map(pKey => `<option value="${pKey}" ${pKey === this.activePageKey ? 'selected' : ''}>${pKey}.html</option>`).join('')}
          </select>

          <div class="switch-container" title="Publicar/Despublicar página">
            <label class="switch">
              <input type="checkbox" id="toggle-page-status" ${activePage.published ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
            <span id="page-status-badge" class="badge ${activePage.published ? 'badge-success' : 'badge-secondary'}" style="font-size:10px; padding:2px 6px;">
              ${activePage.published ? 'Publicada' : 'Borrador'}
            </span>
          </div>

          <button id="btn-refresh-preview" class="cms-toolbar-btn" title="Actualizar Vista Previa">
            <i class="fas fa-rotate-right"></i>
          </button>
          
          <div style="display:flex; gap:2px;">
            <button id="btn-prev-page" class="cms-toolbar-btn" title="Página Anterior">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button id="btn-next-page" class="cms-toolbar-btn" title="Siguiente Página">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div class="cms-toolbar-divider"></div>

        <div class="cms-toolbar-section" style="margin-left:auto;">
          <a href="#" id="link-deploy-modal" class="cms-toolbar-btn-text" style="color: var(--primary); border-color: var(--primary-light); background: var(--primary-light);">
            <i class="fas fa-external-link-alt"></i> Prueba/despliegue en la web
          </a>
        </div>
      </div>

      <!-- Layout Split: Listado de páginas a la izq, Editor y Preview a la derecha -->
      <div style="display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start;">
        
        <!-- Sidebar Izquierdo: Páginas del sitio -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header" style="padding:10px 16px;">
            <span class="font-semibold" style="font-size:12.5px;"><i class="fas fa-file-lines text-muted mr-1"></i> Páginas de ${site.template}</span>
          </div>
          <div class="card-body" style="padding: 12px 10px;">
            <ul style="list-style:none; display:flex; flex-direction:column; gap:4px;" id="cms-pages-list">
              ${Object.keys(pages).map(pKey => {
                const p = pages[pKey];
                const isActive = pKey === this.activePageKey;
                return `
                  <li>
                    <a href="#" class="cms-page-link ${isActive ? 'active' : ''}" data-key="${pKey}" style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:var(--radius-sm); font-size:12.5px; font-weight:500; color:${isActive ? 'var(--primary)' : 'var(--text-main)'}; text-decoration:none; background-color:${isActive ? 'var(--primary-light)' : 'transparent'};">
                      <span><i class="fas ${pKey === 'index' ? 'fa-home' : 'fa-file-text'} text-muted mr-2" style="margin-right:6px;"></i>${pKey}.html</span>
                      <span class="badge ${p.published ? 'badge-success' : 'badge-secondary'}" style="font-size:9px; padding:1px 4px;">
                        ${p.published ? 'Pub' : 'Off'}
                      </span>
                    </a>
                  </li>
                `;
              }).join('')}
            </ul>
            <button class="btn btn-secondary btn-sm" id="btn-add-cms-page" style="width:100%; margin-top:12px;">
              <i class="fas fa-plus-circle"></i> Agregar Página
            </button>
          </div>
        </div>

        <!-- Panel Derecho: Editor WYSIWYG + Vista Previa -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <!-- Editor Form -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-edit text-muted mr-1"></i> Editor de Contenido</div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm" id="btn-discard-page"><i class="fas fa-undo"></i> Descartar</button>
                <button class="btn btn-primary btn-sm" id="btn-save-page"><i class="fas fa-save"></i> Guardar Cambios</button>
              </div>
            </div>
            <div class="card-body">
              <form id="form-cms-editor" onsubmit="return false;">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="cms-title">Título de la Página (Meta Title) *</label>
                    <input type="text" id="cms-title" class="form-control" value="${activePage.title}" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="cms-seo">Etiquetas SEO (Meta Keywords)</label>
                    <input type="text" id="cms-seo" class="form-control" value="${activePage.seo || ''}">
                  </div>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label" for="cms-content">Contenido HTML / Texto *</label>
                  <textarea id="cms-content" class="form-control" rows="8" required style="font-family:'Courier New', Courier, monospace; font-size:12.5px; line-height:1.5;">${activePage.content}</textarea>
                </div>
              </form>
            </div>
          </div>

          <!-- Live Preview Visual Simulator -->
          <div class="card" style="margin-bottom:0; position:relative;">
            <!-- Simulación Loader -->
            <div id="preview-loader" class="cms-preview-loading">
              <div style="text-align:center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 26px; margin-bottom: 8px;"></i>
                <div>Actualizando servidor de vista previa...</div>
              </div>
            </div>

            <div class="card-header" style="background:#FAFBFD; border-bottom: 1px solid var(--border-color);">
              <div class="card-title" style="font-size:12.5px; font-weight:700;"><i class="fas fa-eye text-muted mr-1"></i> Vista Previa (Simulación DIASA Host)</div>
              <span id="preview-status-indicator" style="font-size:11px; display:flex; align-items:center; gap:6px;">
                <span style="width:8px; height:8px; border-radius:50%; background:var(--success); display:inline-block;"></span> Servidor activo
              </span>
            </div>
            <div class="card-body" style="background:#FAFBFD; padding:24px;">
              <!-- Tarjeta simulando la vista del navegador -->
              <div style="background:#FFFFFF; border:1px solid var(--border-color-dark); border-radius:var(--radius-md); box-shadow:var(--shadow-md); min-height:220px; overflow:hidden;" id="web-preview-container">
                <!-- Barra navegador -->
                <div style="background:#F1F5F9; padding:8px 14px; display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border-color-dark); font-size:11px; color:var(--text-muted);">
                  <span style="display:flex; gap:5px;">
                    <span style="width:8px; height:8px; border-radius:50%; background:#EF4444; display:inline-block;"></span>
                    <span style="width:8px; height:8px; border-radius:50%; background:#F59E0B; display:inline-block;"></span>
                    <span style="width:8px; height:8px; border-radius:50%; background:#10B981; display:inline-block;"></span>
                  </span>
                  <div style="background:#FFFFFF; padding:3px 16px; border-radius:12px; width:75%; border:1px solid var(--border-color); display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-lock" style="font-size:9px; color:#10B981;"></i>
                    <span id="preview-url-display">https://www.diasa.com.bo/${this.activePageKey}.html</span>
                  </div>
                </div>
                <!-- Contenido web -->
                <div style="padding:24px; font-family:'Inter', sans-serif;" id="preview-html-content">
                  ${activePage.content}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- MODAL 1: NOTA DE DESPLIEGUE (RÉPLICA DE CAPTURA) -->
      <div class="modal-overlay" id="deploy-modal">
        <div class="modal-container" style="max-width: 650px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-sticky-note text-muted mr-1"></i> Nota de Despliegue en Servidor</h3>
            <button class="modal-close" id="btn-close-deploy-1">&times;</button>
          </div>
          <div class="modal-body" style="font-size: 13px; line-height: 1.6; color: var(--text-main);">
            <p style="margin-bottom:12px;">Compruebe también que el usuario del host virtual (por ejemplo, <code>www-data</code>) tiene <strong>Leido</strong> permisos en archivos en:</p>
            <div style="background:#F1F5F9; padding:8px 12px; border-radius:4px; font-family:monospace; margin-bottom:12px; border-left:4px solid var(--primary);">
              /home/dolibarr/demo.dolibarr.org/dolibarr/htdocs
            </div>
            
            <p style="margin-bottom:12px;">Compruebe también que el usuario del host virtual (por ejemplo, <code>www-data</code>) tiene <strong>Escribir</strong> permisos en archivos en:</p>
            <div style="background:#F1F5F9; padding:8px 12px; border-radius:4px; font-family:monospace; margin-bottom:12px; border-left:4px solid var(--primary);">
              /home/dolibarr/demo.dolibarr.org/dolibarr_documents/website<br>
              /home/dolibarr/demo.dolibarr.org/dolibarr_documents/medias
            </div>

            <p style="margin-bottom:8px;">Ejemplo para usar en la configuración del host virtual Apache:</p>
            <pre style="background:#1E293B; color:#F8FAFC; padding:12px; border-radius:6px; font-family:'Courier New', monospace; font-size:11.5px; overflow-x:auto; margin-bottom:16px; border:1px solid #000;">&lt;VirtualHost *:80&gt;
  ServerName demo.dolibarr.org
  DocumentRoot "/home/dolibarr/demo.dolibarr.org/dolibarr/htdocs"
  #php_admin_value open_basedir "/tmp:/home/dolibarr/demo.dolibarr.org/dolibarr/htdocs:/home/dolibarr/demo.dolibarr.org/dolibarr_documents"
  &lt;Directory "/home/dolibarr/demo.dolibarr.org/dolibarr/htdocs"&gt;
    AllowOverride All
    Require all granted
  &lt;/Directory&gt;
&lt;/VirtualHost&gt;</pre>

            <h4 style="font-weight:700; color:var(--dark); margin-bottom:4px; font-size:13.5px;">2 - Utilizar con servidor integrado PHP</h4>
            <p style="margin-bottom:8px;">En el entorno de desarrollo, puede preferir probar el sitio con el servidor web integrado PHP ejecutando:</p>
            <div style="background:#F1F5F9; padding:8px 12px; border-radius:4px; font-family:monospace; margin-bottom:16px; border-left:4px solid var(--info);">
              php -S 0.0.0.0:8080 -t /home/dolibarr/demo.dolibarr.org/dolibarr_documents
            </div>

            <h4 style="font-weight:700; color:var(--dark); margin-bottom:4px; font-size:13.5px;">3 - Ejecute su sitio web dentro de un proveedor de alojamiento web Dolibarr</h4>
            <p>Si no tiene un servidor web como Apache o NGinx disponible en Internet, puede exportar e importar su sitio web a otra instancia de Dolibarr proporcionada por otro proveedor de alojamiento de Dolibarr que proporcione integración completa con el módulo del sitio web. Puede encontrar una lista de algunos proveedores de hosting de Dolibarr en <a href="https://saas.dolibarr.org" target="_blank" style="text-decoration:underline;">https://saas.dolibarr.org</a></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-close-deploy-2">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- MODAL 2: PROPIEDADES DEL SITIO WEB (EDITAR) -->
      <div class="modal-overlay" id="props-modal">
        <div class="modal-container" style="max-width: 450px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-edit text-muted mr-1"></i> Propiedades del Sitio</h3>
            <button class="modal-close" id="btn-close-props-1">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="prop-name">Nombre del Sitio Web *</label>
              <input type="text" id="prop-name" class="form-control" value="${site.name}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="prop-template">Plantilla / Estilo Visual *</label>
              <select id="prop-template" class="form-control">
                <option value="Corporativo" ${site.template === 'Corporativo' ? 'selected' : ''}>Corporativo (DIASA Standard)</option>
                <option value="Portal" ${site.template === 'Portal' ? 'selected' : ''}>Portal de Autoservicio</option>
                <option value="E-commerce" ${site.template === 'E-commerce' ? 'selected' : ''}>E-commerce / Catálogo</option>
                <option value="Informativo" ${site.template === 'Informativo' ? 'selected' : ''}>Informativo / Dossier</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-close-props-2">Cancelar</button>
            <button class="btn btn-primary" id="btn-save-props-submit">Guardar Cambios</button>
          </div>
        </div>
      </div>
    `;

    // --- Vinculación de Eventos ---

    // 1. Selector de Sitio Activo
    const selectSite = document.getElementById('select-active-site');
    selectSite.addEventListener('change', (e) => {
      this.activeSiteKey = e.target.value;
      // Reiniciar página activa a index.html
      this.activePageKey = 'index';
      this.renderCMS(container);
    });

    // 2. Interruptor de Estado del Sitio (Publicado / Borrador)
    const toggleSite = document.getElementById('toggle-site-status');
    toggleSite.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const newStatus = isChecked ? 'Publicado' : 'Borrador';
      
      // Actualizar DB
      const dbInstance = window.DolibarrDB.get();
      const siteToUpdate = dbInstance.sitios.find(s => s.key === this.activeSiteKey);
      if (siteToUpdate) {
        siteToUpdate.status = newStatus;
        window.DolibarrDB.save(dbInstance);
        
        // Actualizar UI local
        const badge = document.getElementById('site-status-badge');
        badge.textContent = newStatus;
        badge.className = `badge ${isChecked ? 'badge-success' : 'badge-warning'}`;
        
        window.DolibarrUtils.showToast(`Estado del sitio actualizado a "${newStatus}".`, 'success');
      }
    });

    // 3. Selector de Página Activa
    const selectPage = document.getElementById('select-active-page');
    selectPage.addEventListener('change', (e) => {
      this.saveCurrentFormState();
      this.activePageKey = e.target.value;
      this.renderCMS(container);
    });

    // 4. Interruptor de Estado de la Página (Publicada / Borrador)
    const togglePage = document.getElementById('toggle-page-status');
    togglePage.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      
      // Actualizar en el estado local de páginas
      pages[this.activePageKey].published = isChecked;
      this.saveSitePages(this.activeSiteKey, pages);
      
      // Actualizar UI local
      const badge = document.getElementById('page-status-badge');
      badge.textContent = isChecked ? 'Publicada' : 'Borrador';
      badge.className = `badge ${isChecked ? 'badge-success' : 'badge-secondary'}`;
      
      // Refrescar lista de páginas y sidebar del sitio
      this.renderCMS(container);
      window.DolibarrUtils.showToast(`Página "${this.activePageKey}.html" marcada como ${isChecked ? 'Publicada' : 'Borrador'}.`, 'success');
    });

    // 5. Botón de Recargar Vista Previa (Simula conexión con servidor)
    const btnRefresh = document.getElementById('btn-refresh-preview');
    const previewLoader = document.getElementById('preview-loader');
    btnRefresh.addEventListener('click', () => {
      previewLoader.classList.add('show');
      btnRefresh.querySelector('i').classList.add('fa-spin');
      
      setTimeout(() => {
        previewLoader.classList.remove('show');
        btnRefresh.querySelector('i').classList.remove('fa-spin');
        
        // Renderizar contenido actual
        const contentVal = document.getElementById('cms-content').value;
        document.getElementById('preview-html-content').innerHTML = contentVal;
        
        window.DolibarrUtils.showToast("Vista previa sincronizada con éxito.", 'success');
      }, 700);
    });

    // 6. Botones de Navegación Cíclica de Páginas (Flechas)
    const pKeys = Object.keys(pages);
    const currentIndex = pKeys.indexOf(this.activePageKey);
    
    document.getElementById('btn-prev-page').addEventListener('click', () => {
      this.saveCurrentFormState();
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = pKeys.length - 1; // Ciclar al final
      this.activePageKey = pKeys[prevIndex];
      this.renderCMS(container);
    });

    document.getElementById('btn-next-page').addEventListener('click', () => {
      this.saveCurrentFormState();
      let nextIndex = currentIndex + 1;
      if (nextIndex >= pKeys.length) nextIndex = 0; // Ciclar al inicio
      this.activePageKey = pKeys[nextIndex];
      this.renderCMS(container);
    });

    // 7. Enlaces y Clics en la lista lateral de páginas
    document.querySelectorAll('.cms-page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveCurrentFormState();
        this.activePageKey = link.dataset.key;
        this.renderCMS(container);
      });
    });

    // 8. Editor WYSIWYG en vivo (Actualiza preview al escribir)
    const contentTextarea = document.getElementById('cms-content');
    const previewContent = document.getElementById('preview-html-content');
    contentTextarea.addEventListener('input', () => {
      previewContent.innerHTML = contentTextarea.value;
    });

    // 9. Guardar Página
    document.getElementById('btn-save-page').addEventListener('click', () => {
      this.saveCurrentFormState();
      window.DolibarrUtils.showToast(`Página "${this.activePageKey}.html" guardada correctamente en localStorage.`, 'success');
      this.renderCMS(container);
    });

    // 10. Descartar Cambios (Recarga del estado persistente)
    document.getElementById('btn-discard-page').addEventListener('click', () => {
      if (confirm("¿Estás seguro de descartar los cambios no guardados?")) {
        this.renderCMS(container);
      }
    });

    // 11. Modal de Despliegue ("Prueba/despliegue en la web")
    const deployModal = document.getElementById('deploy-modal');
    const linkDeploy = document.getElementById('link-deploy-modal');
    
    linkDeploy.addEventListener('click', (e) => {
      e.preventDefault();
      deployModal.classList.add('show');
    });

    const closeDeploy1 = document.getElementById('btn-close-deploy-1');
    const closeDeploy2 = document.getElementById('btn-close-deploy-2');
    [closeDeploy1, closeDeploy2].forEach(btn => {
      btn.addEventListener('click', () => {
        deployModal.classList.remove('show');
      });
    });

    // 12. Modal de Propiedades del Sitio (Gear icon)
    const propsModal = document.getElementById('props-modal');
    const btnEditProps = document.getElementById('btn-edit-site-props');
    
    btnEditProps.addEventListener('click', () => {
      propsModal.classList.add('show');
    });

    const closeProps1 = document.getElementById('btn-close-props-1');
    const closeProps2 = document.getElementById('btn-close-props-2');
    [closeProps1, closeProps2].forEach(btn => {
      btn.addEventListener('click', () => {
        propsModal.classList.remove('show');
      });
    });

    const btnSavePropsSubmit = document.getElementById('btn-save-props-submit');
    btnSavePropsSubmit.addEventListener('click', () => {
      const newName = document.getElementById('prop-name').value.trim();
      const newTemplate = document.getElementById('prop-template').value;
      
      if (!newName) {
        alert("El nombre del sitio es obligatorio.");
        return;
      }

      // Actualizar base de datos
      const dbInstance = window.DolibarrDB.get();
      const siteToUpdate = dbInstance.sitios.find(s => s.key === this.activeSiteKey);
      if (siteToUpdate) {
        siteToUpdate.name = newName;
        siteToUpdate.template = newTemplate;
        window.DolibarrDB.save(dbInstance);
        
        propsModal.classList.remove('show');
        window.DolibarrUtils.showToast("Propiedades del sitio web guardadas.", "success");
        this.renderCMS(container);
      }
    });

    // 13. Clonar Sitio Web
    document.getElementById('btn-clone-site').addEventListener('click', () => {
      const name = prompt("Ingrese el nombre para el nuevo sitio clonado:", site.name + " (Copia)");
      if (name && name.trim()) {
        const cleanName = name.trim();
        const key = `clone_${Date.now()}`;
        
        // Registrar en DB
        const dbInstance = window.DolibarrDB.get();
        dbInstance.sitios.push({
          id: window.DolibarrUtils.generateId(dbInstance.sitios),
          name: cleanName,
          key: key,
          template: site.template,
          pages: site.pages,
          status: 'Borrador'
        });
        
        // Copiar páginas
        if (!dbInstance.sitiosPages) dbInstance.sitiosPages = {};
        dbInstance.sitiosPages[key] = JSON.parse(JSON.stringify(pages));
        
        window.DolibarrDB.save(dbInstance);
        window.DolibarrUtils.showToast(`Sitio Web "${cleanName}" clonado con éxito.`, 'success');
        
        this.activeSiteKey = key;
        this.activePageKey = 'index';
        this.renderCMS(container);
      }
    });

    // 14. Exportar Sitio (Genera descarga ZIP simulada)
    document.getElementById('btn-export-site').addEventListener('click', () => {
      window.DolibarrUtils.showToast(`Estructura completa de "${site.name}" exportada en producción.`, 'success');
    });

    // 15. Agregar Nueva Página
    document.getElementById('btn-add-cms-page').addEventListener('click', () => {
      const key = prompt("Ingrese el nombre de archivo para la nueva página (ej. blog):");
      if (key && key.trim()) {
        const cleanKey = key.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (!cleanKey) {
          alert("Nombre de página inválido.");
          return;
        }
        if (pages[cleanKey]) {
          alert("Esa página ya existe en este sitio.");
          return;
        }

        // Registrar nueva página
        pages[cleanKey] = {
          title: `${cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1)} - ${site.name}`,
          content: `<h1>${cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1)}</h1>\n<p>Contenido nuevo...</p>`,
          seo: cleanKey,
          published: false
        };
        
        this.saveSitePages(this.activeSiteKey, pages);
        
        // Actualizar contador en la DB
        const dbInstance = window.DolibarrDB.get();
        const siteToUpdate = dbInstance.sitios.find(s => s.key === this.activeSiteKey);
        if (siteToUpdate) {
          siteToUpdate.pages = Object.keys(pages).length;
          window.DolibarrDB.save(dbInstance);
        }
        
        this.activePageKey = cleanKey;
        window.DolibarrUtils.showToast(`Página "${cleanKey}.html" creada.`, 'success');
        this.renderCMS(container);
      }
    });
  },

  /**
   * Lee los campos del formulario y guarda el estado de la página activa en memoria y DB
   */
  saveCurrentFormState: function() {
    const titleVal = document.getElementById('cms-title');
    const seoVal = document.getElementById('cms-seo');
    const contentVal = document.getElementById('cms-content');

    if (titleVal && contentVal) {
      const pages = this.getSitePages(this.activeSiteKey);
      if (pages[this.activePageKey]) {
        pages[this.activePageKey].title = titleVal.value;
        pages[this.activePageKey].content = contentVal.value;
        if (seoVal) {
          pages[this.activePageKey].seo = seoVal.value;
        }
        this.saveSitePages(this.activeSiteKey, pages);
      }
    }
  }
};
