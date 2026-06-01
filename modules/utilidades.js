/**
 * utilidades.js - Módulo de Utilidades (Etiquetas y Categorías)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.utilidades = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inicializar categorías si no existen
    this.initCategories();
    
    this.renderList(mainContent);
  },

  /**
   * Inicializar datos de categorías en localStorage
   */
  initCategories: function() {
    const db = window.DolibarrDB.get();
    if (!db.categories) {
      db.categories = [
        { id: 1, label: "Clientes VIP Latam", type: "clientes", color: "#3A78D4", count: 2 },
        { id: 2, label: "Materias Primas Metalúrgicas", type: "productos", color: "#E74C3C", count: 3 },
        { id: 3, label: "Consultoría Especializada", type: "servicios", color: "#9B59B6", count: 2 },
        { id: 4, label: "Fallas Mecánicas Críticas", type: "tickets", color: "#F39C12", count: 1 }
      ];
      window.DolibarrDB.save(db);
    }
  },

  /**
   * Vista: Listado de Etiquetas y Categorías
   */
  renderList: function(container) {
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

      <!-- Tabla de Categorías -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-list-check"></i> Clasificación y Agrupaciones Vigentes</div>
        </div>
        <div class="card-body" style="padding: 0;">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>Nombre de la Etiqueta / Categoría</th>
                <th>Tipo de Entidad Asignable</th>
                <th style="text-align: center; width: 140px;">Color Visual</th>
                <th style="text-align: right; width: 180px;">Registros Vinculados</th>
                <th style="text-align: center; width: 120px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${db.categories.map(c => {
                let typeLabel = 'Clientes';
                if (c.type === 'productos') typeLabel = 'Productos Físicos';
                if (c.type === 'servicios') typeLabel = 'Servicios en Catálogo';
                if (c.type === 'tickets') typeLabel = 'Incidencias Soporte';

                return `
                  <tr>
                    <td><code>CAT-${c.id}</code></td>
                    <td><strong>${c.label}</strong></td>
                    <td><span class="text-muted" style="font-size:12.5px;">${typeLabel}</span></td>
                    <td style="text-align: center;">
                      <span style="display:inline-flex; align-items:center; gap:8px;">
                        <span style="width:14px; height:14px; border-radius:50%; background-color:${c.color}; display:inline-block; border:1px solid rgba(0,0,0,0.15);"></span>
                        <code>${c.color}</code>
                      </span>
                    </td>
                    <td style="text-align: right;" class="font-semibold">${c.count} registros</td>
                    <td style="text-align: center;">
                      <button class="btn btn-danger btn-sm btn-eliminar-cat" data-id="${c.id}"><i class="fas fa-trash-can"></i></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: CREAR CATEGORIA -->
      <div class="modal-overlay" id="modal-cat-overlay">
        <div class="modal-container" style="max-width:450px;">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-tag"></i> Registrar Clasificación</h3>
            <button class="modal-close" id="modal-cat-close">&times;</button>
          </div>
          <form id="form-nuevo-cat">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="c-label">Nombre de la Categoría *</label>
                <input type="text" id="c-label" class="form-control" placeholder="Ej. Clientes Corporativos" required>
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
              <button type="submit" class="btn btn-primary">Crear Categoría</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
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

    // Registrar Categoría
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newCat = {
        id: window.DolibarrUtils.generateId(db.categories),
        label: document.getElementById('c-label').value,
        type: document.getElementById('c-type').value,
        color: document.getElementById('c-color').value,
        count: 0
      };

      db.categories.push(newCat);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Categoría "${newCat.label}" registrada correctamente.`, 'success');
      closeModal();
      this.renderList(container);
    });

    // Eliminar Categoría
    document.querySelectorAll('.btn-eliminar-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const index = db.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          const label = db.categories[index].label;
          if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${label}"?`)) {
            db.categories.splice(index, 1);
            window.DolibarrDB.save(db);
            window.DolibarrUtils.showToast(`Categoría "${label}" eliminada.`, 'warning');
            this.renderList(container);
          }
        }
      });
    });
  }
};
window.DolibarrModules.utilidades = window.DolibarrModules.utilidades;
