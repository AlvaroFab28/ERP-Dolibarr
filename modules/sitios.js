/**
 * sitios.js - Módulo de Sitios Web y CMS
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.sitios = {
  // Estado interno para la página web activa
  activePageKey: 'index',
  
  // Datos locales de páginas simuladas
  pagesData: {
    'index': { title: "Inicio - DIASA S.A.", content: "<h1>DIASA S.A.</h1><p>Proveedor líder en automatización, válvulas de control y motores Siemens para la industria boliviana.</p>", seo: "DIASA Bolivia automatizacion industrial" },
    'productos': { title: "Productos - Catálogo Industrial", content: "<h1>Nuestros Equipos</h1><p>Conoce nuestras válvulas API 6D de presión y motores eléctricos trifásicos Siemens en stock central La Paz.</p>", seo: "Motores Siemens, valvulas API Bolivia" },
    'contacto': { title: "Contacto - DIASA La Paz", content: "<h1>Contacto Comercial</h1><p>Av. Arce Nro. 2529, Edificio Torres de los Poetas. Teléfono: +591 2 2432211.</p>", seo: "direccion diasa la paz bolivia" }
  },

  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    this.renderCMS(mainContent);
  },

  /**
   * Vista: Consola del Constructor Web (CMS)
   */
  renderCMS: function(container) {
    const db = window.DolibarrDB.get();
    const site = db.sitios[0] || { name: 'DIASA Web', template: 'Corporativo', pages: 3 };

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/sitios">Sitios Web</a> <i class="fas fa-chevron-right"></i> <strong>Consola CMS</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-globe"></i> Sitios Web y Portales CMS</h1>
        <div style="display:flex; gap:10px;">
          <button id="btn-clone-site" class="btn btn-secondary btn-sm"><i class="fas fa-copy"></i> Clonar Sitio</button>
          <button id="btn-export-site" class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Exportar</button>
        </div>
      </div>

      <!-- Barra superior de Selección de Sitio -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 12px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <label class="font-semibold" style="font-size:13px; color:var(--text-muted);">Sitio Activo:</label>
            <select id="select-active-site" class="form-control" style="width: 250px; display:inline-block;">
              ${db.sitios.map(s => `<option value="${s.key}">${s.name} (${s.template})</option>`).join('')}
            </select>
            <span class="badge badge-success">${site.status}</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted);">
            NIT Vinculado: <strong>${db.company.nit}</strong> | Plantilla: <strong>${site.template}</strong>
          </div>
        </div>
      </div>

      <!-- Layout Split: Listado de páginas a la izq, Editor y Preview a la derecha -->
      <div style="display: grid; grid-template-columns: 240px 1fr; gap: 20px; align-items: start;">
        
        <!-- Sidebar Izquierdo: Páginas del sitio -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header" style="padding:10px 16px;">
            <span class="font-semibold" style="font-size:12.5px;"><i class="fas fa-file-lines"></i> Páginas del CMS</span>
          </div>
          <div class="card-body" style="padding: 12px 10px;">
            <ul style="list-style:none; display:flex; flex-direction:column; gap:4px;" id="cms-pages-list">
              <li>
                <a href="#" class="cms-page-link ${this.activePageKey === 'index' ? 'active' : ''}" data-key="index" style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:var(--radius-sm); font-size:12.5px; font-weight:500; color:var(--text-main); text-decoration:none; background-color:${this.activePageKey === 'index' ? 'var(--primary-light)' : 'transparent'};">
                  <span><i class="fas fa-home text-muted mr-2"></i>index.html</span>
                </a>
              </li>
              <li>
                <a href="#" class="cms-page-link ${this.activePageKey === 'productos' ? 'active' : ''}" data-key="productos" style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:var(--radius-sm); font-size:12.5px; font-weight:500; color:var(--text-main); text-decoration:none; background-color:${this.activePageKey === 'productos' ? 'var(--primary-light)' : 'transparent'};">
                  <span><i class="fas fa-file-text text-muted mr-2"></i>productos.html</span>
                </a>
              </li>
              <li>
                <a href="#" class="cms-page-link ${this.activePageKey === 'contacto' ? 'active' : ''}" data-key="contacto" style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:var(--radius-sm); font-size:12.5px; font-weight:500; color:var(--text-main); text-decoration:none; background-color:${this.activePageKey === 'contacto' ? 'var(--primary-light)' : 'transparent'};">
                  <span><i class="fas fa-address-book text-muted mr-2"></i>contacto.html</span>
                </a>
              </li>
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
              <div class="card-title"><i class="fas fa-edit"></i> Editor de Contenido de la Página</div>
              <button class="btn btn-primary btn-sm" id="btn-save-page"><i class="fas fa-save"></i> Guardar Página</button>
            </div>
            <div class="card-body">
              <form id="form-cms-editor">
                <div class="form-group">
                  <label class="form-label" for="cms-title">Título de la Página (Meta Title) *</label>
                  <input type="text" id="cms-title" class="form-control" value="${this.pagesData[this.activePageKey].title}" required>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="cms-seo">Etiquetas SEO (Meta Keywords)</label>
                    <input type="text" id="cms-seo" class="form-control" value="${this.pagesData[this.activePageKey].seo}">
                  </div>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label" for="cms-content">Contenido HTML / Texto *</label>
                  <textarea id="cms-content" class="form-control" rows="5" required style="font-family:monospace; font-size:12.5px;">${this.pagesData[this.activePageKey].content}</textarea>
                </div>
              </form>
            </div>
          </div>

          <!-- Live Preview Visual Simulator -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="background:#E2E8F0;">
              <div class="card-title" style="font-size:12.5px; font-weight:700; color:var(--dark);"><i class="fas fa-eye"></i> Vista Previa en Tiempo Real (Simulador del Servidor)</div>
            </div>
            <div class="card-body" style="background:#FAFBFD; padding:24px;">
              <!-- Tarjeta simulando la vista del navegador -->
              <div style="background:#FFFFFF; border:1px solid #CBD5E1; border-radius:var(--radius-md); box-shadow:var(--shadow-md); min-height:180px; overflow:hidden;" id="web-preview-container">
                <!-- Barra navegador -->
                <div style="background:#E2E8F0; padding:6px 12px; display:flex; align-items:center; gap:8px; border-bottom:1px solid #CBD5E1; font-size:11px; color:#64748B;">
                  <span style="display:flex; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:#EF4444; display:inline-block;"></span><span style="width:8px; height:8px; border-radius:50%; background:#F59E0B; display:inline-block;"></span><span style="width:8px; height:8px; border-radius:50%; background:#10B981; display:inline-block;"></span></span>
                  <div style="background:#FFFFFF; padding:2px 16px; border-radius:12px; width:70%; border:1px solid #CBD5E1;" id="preview-url-display">https://www.diasa.com.bo/${this.activePageKey}.html</div>
                </div>
                <!-- Contenido web -->
                <div style="padding:20px; font-family:'Inter', sans-serif;" id="preview-html-content">
                  ${this.pagesData[this.activePageKey].content}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    // Eventos de Navegación de Páginas
    document.querySelectorAll('.cms-page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Guardar la anterior página antes de cambiar por consistencia visual
        this.saveCurrentFormState();
        
        this.activePageKey = link.dataset.key;
        this.renderCMS(container);
      });
    });

    // Actualización de la Vista Previa en tiempo real al escribir (Keyup / Input)
    const contentTextarea = document.getElementById('cms-content');
    const previewContent = document.getElementById('preview-html-content');

    contentTextarea.addEventListener('input', () => {
      previewContent.innerHTML = contentTextarea.value;
    });

    // Guardado de página
    document.getElementById('btn-save-page').addEventListener('click', () => {
      this.saveCurrentFormState();
      window.DolibarrUtils.showToast(`Página "${this.activePageKey}.html" guardada con éxito en el CMS.`, 'success');
      this.renderCMS(container);
    });

    // Clonar Sitio
    document.getElementById('btn-clone-site').addEventListener('click', () => {
      const name = prompt("Ingrese el nombre para el nuevo sitio clonado:", site.name + " (Copia)");
      if (name) {
        const key = `clone_${Date.now()}`;
        db.sitios.push({
          id: window.DolibarrUtils.generateId(db.sitios),
          name: name,
          key: key,
          template: site.template,
          pages: site.pages,
          status: 'Borrador'
        });
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast(`Sitio Web "${name}" clonado con éxito.`, 'success');
        this.renderCMS(container);
      }
    });

    // Exportar Sitio
    document.getElementById('btn-export-site').addEventListener('click', () => {
      window.DolibarrUtils.showToast("Sitio Web exportado en formato ZIP de producción.", 'success');
    });

    // Agregar nueva página
    document.getElementById('btn-add-cms-page').addEventListener('click', () => {
      const key = prompt("Ingrese el identificador de la nueva página (ej. blog):");
      if (key) {
        const cleanKey = key.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (this.pagesData[cleanKey]) {
          alert("Esa página ya existe.");
          return;
        }
        
        this.pagesData[cleanKey] = {
          title: `${cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1)} - ${db.company.sigla}`,
          content: `<h1>${cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1)}</h1><p>Contenido nuevo...</p>`,
          seo: cleanKey
        };
        
        this.activePageKey = cleanKey;
        
        // Sumar página al sitio
        site.pages++;
        window.DolibarrDB.save(db);
        
        window.DolibarrUtils.showToast(`Página "${cleanKey}.html" creada.`, 'success');
        this.renderCMS(container);
      }
    });
  },

  /**
   * Lee los campos del formulario y guarda el estado de la página activa en memoria
   */
  saveCurrentFormState: function() {
    const titleVal = document.getElementById('cms-title');
    const seoVal = document.getElementById('cms-seo');
    const contentVal = document.getElementById('cms-content');

    if (titleVal && contentVal) {
      this.pagesData[this.activePageKey].title = titleVal.value;
      this.pagesData[this.activePageKey].content = contentVal.value;
      if (seoVal) this.pagesData[this.activePageKey].seo = seoVal.value;
    }
  }
};
window.DolibarrModules.sitios = window.DolibarrModules.sitios;
