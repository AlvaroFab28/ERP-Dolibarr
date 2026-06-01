/**
 * documentos.js - Módulo de Gestión Documental (SGD / GED)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.documentos = {
  // Carpeta activa por defecto
  activeFolder: '/',

  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    this.renderExplorer(mainContent);
  },

  /**
   * Helper para dar formato legible al tamaño de archivo
   */
  formatBytes: function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Vista: Explorador Documental
   */
  renderExplorer: function(container) {
    const db = window.DolibarrDB.get();

    // Obtener lista de carpetas disponibles en la base de datos
    // Filtramos los registros de tipo 'folder'
    const folders = db.documentos.filter(doc => doc.type === 'folder');

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Documentos</span> <i class="fas fa-chevron-right"></i> <strong>SGD / GED</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-folder-tree"></i> Repositorio y Gestión Documental</h1>
        <button id="btn-subir-doc" class="btn btn-primary">
          <i class="fas fa-upload"></i> Subir Archivo
        </button>
      </div>

      <!-- Pestañas de categoría (Tabs) -->
      <div class="tab-container">
        <ul class="nav-tabs">
          <li class="tab-item active"><i class="fas fa-folder"></i> Directorios Manuales</li>
          <li class="tab-item" onclick="window.DolibarrUtils.showToast('Directorios de Objetos: Módulo Estético.','info')"><i class="fas fa-cabinet-filing"></i> Directorios de Objetos</li>
          <li class="tab-item" onclick="window.DolibarrUtils.showToast('Medios Públicos: Directorio Vacío.','info')"><i class="fas fa-globe"></i> Medios Públicos</li>
        </ul>
      </div>

      <!-- Distribución Split: Árbol a la Izquierda, Archivos a la Derecha -->
      <div style="display: grid; grid-template-columns: 240px 1fr; gap: 20px; align-items: start;">
        
        <!-- Panel Izquierdo: Directorios -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header" style="padding:10px 16px;">
            <span class="font-semibold" style="font-size:12.5px;"><i class="fas fa-folder-open"></i> Carpetas</span>
          </div>
          <div class="card-body" style="padding: 12px 10px;">
            <ul style="list-style:none; display:flex; flex-direction:column; gap:4px;" id="folder-tree-list">
              <!-- Renderizado dinámico de la jerarquía de carpetas -->
            </ul>
          </div>
        </div>

        <!-- Panel Derecho: Visor de archivos -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header" style="padding:12px 20px;">
            <div class="card-title" id="active-folder-title"><i class="fas fa-folder-open"></i> Directorio: /</div>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="table-responsive" style="border:none; border-radius:0;">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Nombre del Archivo</th>
                    <th>Tipo</th>
                    <th style="text-align: right; width:120px;">Tamaño</th>
                    <th>Fecha Registro</th>
                    <th style="text-align: center; width:120px;">Acciones</th>
                  </tr>
                </thead>
                <tbody id="tbody-files-list">
                  <!-- Dinámico -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- MODAL: SUBIR DOCUMENTO -->
      <div class="modal-overlay" id="modal-doc-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-cloud-arrow-up"></i> Subir Documento al Repositorio</h3>
            <button class="modal-close" id="modal-doc-close">&times;</button>
          </div>
          <form id="form-nuevo-doc">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="d-name">Nombre del Archivo (con extensión) *</label>
                <input type="text" id="d-name" class="form-control" placeholder="Ej. Presupuesto_YPFB_Aprobado.pdf" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="d-type">Tipo de Formato *</label>
                  <select id="d-type" class="form-control" required>
                    <option value="pdf">Documento PDF (.pdf)</option>
                    <option value="xlsx">Libro de Excel (.xlsx)</option>
                    <option value="docx">Documento de Word (.docx)</option>
                    <option value="png">Imagen PNG / JPG</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="d-folder">Guardar en Carpeta *</label>
                  <select id="d-folder" class="form-control" required>
                    <option value="/">/ (Raíz)</option>
                    ${folders.map(f => `<option value="/${f.name}">/${f.name}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="d-size">Tamaño Estimado (KB) *</label>
                <input type="number" id="d-size" class="form-control" value="250" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-doc">Cancelar</button>
              <button type="submit" class="btn btn-primary">Subir Archivo</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Renderizar árbol de carpetas inicial
    this.drawFolderTree(folders);
    
    // Renderizar archivos iniciales
    this.drawFiles(db.documentos);

    // Modal Control
    const modal = document.getElementById('modal-doc-overlay');
    const openBtn = document.getElementById('btn-subir-doc');
    const closeBtn = document.getElementById('modal-doc-close');
    const cancelBtn = document.getElementById('btn-cancel-doc');
    const form = document.getElementById('form-nuevo-doc');

    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('d-folder').value = this.activeFolder;
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Registrar Carga
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('d-name').value;
      const type = document.getElementById('d-type').value;
      const path = document.getElementById('d-folder').value;
      const sizeKB = parseInt(document.getElementById('d-size').value) || 100;

      const newDoc = {
        id: window.DolibarrUtils.generateId(db.documentos),
        name: name,
        type: type,
        path: path,
        size: sizeKB * 1024, // Guardar en bytes
        date: new Date().toISOString().split('T')[0]
      };

      db.documentos.push(newDoc);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Archivo "${name}" cargado en ${path}.`, 'success');
      closeModal();
      
      // Refrescar
      this.renderExplorer(container);
    });
  },

  /**
   * Renderiza el listado del árbol de directorios a la izquierda
   */
  drawFolderTree: function(folders) {
    const list = document.getElementById('folder-tree-list');
    if (!list) return;

    list.innerHTML = '';

    // Agregar la raíz "/"
    const rootLi = this.createFolderTreeItemHTML('Raíz (/)', '/', this.activeFolder === '/');
    list.appendChild(rootLi);

    // Agregar las subcarpetas de la base de datos
    folders.forEach(f => {
      const fullPath = `/${f.name}`;
      const li = this.createFolderTreeItemHTML(f.name, fullPath, this.activeFolder === fullPath);
      list.appendChild(li);
    });

    // Añadir listeners para cambiar de carpeta activa
    list.querySelectorAll('.folder-tree-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.activeFolder = link.dataset.path;
        
        // Actualizar estados visuales de las carpetas
        list.querySelectorAll('.folder-tree-link').forEach(l => l.style.backgroundColor = 'transparent');
        link.style.backgroundColor = 'var(--primary-light)';
        
        // Actualizar título e imprimir archivos correspondientes
        document.getElementById('active-folder-title').innerHTML = `<i class="fas fa-folder-open"></i> Directorio: ${this.activeFolder}`;
        
        const db = window.DolibarrDB.get();
        this.drawFiles(db.documentos);
      });
    });
  },

  /**
   * Crea el ítem HTML de la lista del árbol
   */
  createFolderTreeItemHTML: function(label, path, isActive) {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="#" class="folder-tree-link" data-path="${path}" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:var(--radius-sm); font-size:12.5px; font-weight:500; color:var(--text-main); text-decoration:none; background-color:${isActive ? 'var(--primary-light)' : 'transparent'};">
        <i class="fas ${isActive ? 'fa-folder-open' : 'fa-folder'}" style="color:var(--warning); font-size:14px;"></i>
        <span>${label}</span>
      </a>
    `;
    return li;
  },

  /**
   * Dibuja los archivos correspondientes a la carpeta activa en el panel derecho
   */
  drawFiles: function(allDocs) {
    const tbody = document.getElementById('tbody-files-list');
    if (!tbody) return;

    // Filtrar archivos en la ruta activa (excluyendo carpetas)
    const files = allDocs.filter(doc => doc.type !== 'folder' && doc.path === this.activeFolder);

    if (files.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted" style="padding:40px;">
            <i class="fas fa-folder-open" style="font-size:32px; color:var(--text-muted); margin-bottom:12px; display:block;"></i>
            Este directorio se encuentra vacío.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = files.map(file => {
      let icon = 'fa-file';
      if (file.type === 'pdf') icon = 'fa-file-pdf';
      if (file.type === 'xlsx' || file.type === 'xls') icon = 'fa-file-excel';
      if (file.type === 'docx') icon = 'fa-file-word';
      if (file.type === 'png' || file.type === 'jpg') icon = 'fa-file-image';

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <i class="fas ${icon}" style="font-size:18px; color:var(--primary); width:20px; text-align:center;"></i>
              <strong>${file.name}</strong>
            </div>
          </td>
          <td><span class="text-muted" style="text-transform:uppercase; font-size:11px;">${file.type}</span></td>
          <td style="text-align: right;">${this.formatBytes(file.size)}</td>
          <td>${window.DolibarrUtils.formatDate(file.date)}</td>
          <td style="text-align: center; display:flex; gap:6px; justify-content:center;">
            <button class="btn btn-secondary btn-sm btn-descargar-doc" data-name="${file.name}"><i class="fas fa-download"></i></button>
            <button class="btn btn-danger btn-sm btn-eliminar-doc" data-id="${file.id}"><i class="fas fa-trash-can"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    // Eventos de descargar
    document.querySelectorAll('.btn-descargar-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        window.DolibarrUtils.showToast(`Iniciando descarga de "${btn.dataset.name}"...`, 'success');
      });
    });

    // Evento de eliminar
    document.querySelectorAll('.btn-eliminar-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const db = window.DolibarrDB.get();
        const index = db.documentos.findIndex(d => d.id === id);
        if (index !== -1) {
          const name = db.documentos[index].name;
          if (confirm(`¿Estás seguro de que deseas eliminar el archivo "${name}" permanentemente?`)) {
            db.documentos.splice(index, 1);
            window.DolibarrDB.save(db);
            window.DolibarrUtils.showToast(`Archivo "${name}" eliminado.`, 'warning');
            
            // Re-render
            this.drawFiles(db.documentos);
          }
        }
      });
    });
  }
};
window.DolibarrModules.documentos = window.DolibarrModules.documentos;
