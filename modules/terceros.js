/**
 * terceros.js - Módulo de Terceros (Clientes, Proveedores y Contactos)
 * Prototipo Dolibarr ERP v23.0.1
 * Localizado y Mejorado para DIASA S.A.
 */

window.DolibarrModules.terceros = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inicializar clientes potenciales de ejemplo si no existen
    const db = window.DolibarrDB.get();
    this.initPotentials(db);
    
    switch(subRoute) {
      case 'nuevo':
        this.renderNewTerceroForm(mainContent);
        break;
      case 'lista':
        this.renderList(mainContent, 'todos');
        break;
      case 'potenciales':
        this.renderList(mainContent, 'potencial');
        break;
      case 'contactos-nuevo':
        this.renderNewContactForm(mainContent);
        break;
      case 'contactos':
        this.renderContactsList(mainContent);
        break;
      default:
        this.renderDashboard(mainContent);
        break;
    }
  },

  /**
   * Inicializa clientes potenciales en la DB si no existen
   */
  initPotentials: function(db) {
    const hasPotentials = db.terceros.some(t => t.type === 'potencial');
    if (!hasPotentials) {
      db.terceros.push(
        { id: 7, name: "Yacimientos de Litio Bolivianos (YLB)", nit: "1028459031", type: "potencial", address: "Av. Mariscal Santa Cruz, Edif. Hansa, La Paz", phone: "+591 2 2141525", email: "contacto@ylb.gob.bo", status: "activo", balance: 0.00 },
        { id: 8, name: "Empresa Metalúrgica Karachipampa", nit: "1018349202", type: "potencial", address: "Carretera Potosí-Sucre Km 8, Potosí", phone: "+591 2 6231212", email: "karachipampa@mineria.gob.bo", status: "activo", balance: 0.00 }
      );
      window.DolibarrDB.save(db);
    }
  },

  /**
   * Vista 1: Dashboard Principal
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    
    const clientes = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos').length;
    const proveedores = db.terceros.filter(t => t.type === 'proveedor' || t.type === 'ambos').length;
    const potenciales = db.terceros.filter(t => t.type === 'potencial').length;
    const contactos = db.contacts.length;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Terceros</span> <i class="fas fa-chevron-right"></i> <strong>Área Terceros</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-users"></i> Área de Terceros</h1>
      </div>

      <!-- Widgets superiores de conteo -->
      <div class="widget-grid">
        <div class="widget-box wb-primary" onclick="window.location.hash='#/terceros/lista'">
          <div class="wb-icon"><i class="fas fa-user-tag"></i></div>
          <div class="wb-details">
            <div class="wb-count">${clientes}</div>
            <div class="wb-label">Clientes Activos</div>
          </div>
        </div>

        <div class="widget-box wb-success" onclick="window.location.hash='#/terceros/lista'">
          <div class="wb-icon"><i class="fas fa-truck"></i></div>
          <div class="wb-details">
            <div class="wb-count">${proveedores}</div>
            <div class="wb-label">Proveedores Homologados</div>
          </div>
        </div>

        <div class="widget-box wb-warning" onclick="window.location.hash='#/terceros/potenciales'">
          <div class="wb-icon"><i class="fas fa-user-clock"></i></div>
          <div class="wb-details">
            <div class="wb-count">${potenciales}</div>
            <div class="wb-label">Clientes Potenciales</div>
          </div>
        </div>

        <div class="widget-box wb-info" onclick="window.location.hash='#/terceros/contactos'">
          <div class="wb-icon"><i class="fas fa-address-book"></i></div>
          <div class="wb-details">
            <div class="wb-count">${contactos}</div>
            <div class="wb-label">Contactos Registrados</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 24px; margin-top: 24px;">
        
        <!-- Columna Izquierda: Gráfico de Rosquilla -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución Comercial</div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 220px;">
              <canvas id="chart-terceros-tipo"></canvas>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Últimos creados/modificados -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-history"></i> Últimos Terceros Añadidos</div>
            <a href="#/terceros/lista" style="font-size: 12px; font-weight:600;">Ver todos</a>
          </div>
          <div class="card-body" style="padding: 0;">
            <table class="table table-hover table-striped">
              <thead>
                <tr>
                  <th>Razón Social / Nombre</th>
                  <th>NIT</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${db.terceros.slice(-4).reverse().map(t => `
                  <tr onclick="window.location.hash='#/terceros/lista'" style="cursor:pointer;">
                    <td><strong>${t.name}</strong></td>
                    <td><code>${t.nit}</code></td>
                    <td><span class="badge badge-secondary" style="font-size:9.5px; text-transform:uppercase;">${t.type}</span></td>
                    <td>${window.DolibarrUtils.renderBadge(t.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Renderizar gráfico
    const counts = { cliente: 0, proveedor: 0, ambos: 0, potencial: 0 };
    db.terceros.forEach(t => {
      if (counts[t.type] !== undefined) counts[t.type]++;
    });

    if (typeof Chart !== 'undefined' && window.DolibarrCharts) {
      window.DolibarrCharts.createDoughnut('chart-terceros-tipo', 
        ['Clientes', 'Proveedores', 'Ambos', 'Potenciales'],
        [counts.cliente, counts.proveedor, counts.ambos, counts.potencial],
        ['#3A78D4', '#2CB57E', '#9B59B6', '#F39C12']
      );
    }
  },

  /**
   * Vista 2: Formulario Completo de "Nuevo Tercero" (Réplica de captura 1)
   */
  renderNewTerceroForm: function(container) {
    const db = window.DolibarrDB.get();
    
    // Generar códigos de cliente y proveedor ficticios al estilo Dolibarr
    const rand = Math.floor(Math.random() * 900000000 + 100000000);
    const clientCode = `CU2606-${rand}`;
    const providerCode = `SU2606-${rand}`;

    container.innerHTML = `
      <style>
        .checkbox-btn-group {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .checkbox-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border-color-dark);
          background-color: #FAFBFD;
          transition: all 0.15s ease;
        }

        .checkbox-btn input {
          margin: 0;
          cursor: pointer;
        }

        .checkbox-btn.potential.active { background-color: #FFEDD5; color: #C2410C; border-color: #FDBA74; }
        .checkbox-btn.client.active { background-color: #DCFCE7; color: #15803D; border-color: #86EFAC; }
        .checkbox-btn.provider.active { background-color: #F1F5F9; color: #334155; border-color: #CBD5E1; }
      </style>

      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/terceros">Terceros</a> <i class="fas fa-chevron-right"></i> <strong>Nuevo tercero</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-user-plus"></i> Nuevo Tercero (Cliente potencial, cliente, proveedor)</h1>
      </div>

      <div class="card">
        <div class="card-body">
          <form id="form-nuevo-tercero-full" onsubmit="return false;">
            
            <div class="form-row">
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="t-name">Nombre del tercero (Razón Social) *</label>
                <input type="text" id="t-name" class="form-control" placeholder="Ej. YPFB Transportes S.A." required>
              </div>
              <div class="form-group">
                <label class="form-label" for="t-apodo">Nombre comercial / Marca registrada</label>
                <input type="text" id="t-apodo" class="form-control" placeholder="Ej. YPFB">
              </div>
            </div>

            <!-- Botones tipo checkbox (Réplica exacta de Captura 1) -->
            <label class="form-label">Tipo de Relación Comercial *</label>
            <div class="checkbox-btn-group">
              <label class="checkbox-btn potential active" id="lbl-pot">
                <input type="checkbox" id="t-check-potential" checked> Cliente potencial
              </label>
              <label class="checkbox-btn client active" id="lbl-cli">
                <input type="checkbox" id="t-check-client" checked> Cliente
              </label>
              <label class="checkbox-btn provider" id="lbl-prov">
                <input type="checkbox" id="t-check-provider"> Proveedor
              </label>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="t-code-client">Código cliente</label>
                <input type="text" id="t-code-client" class="form-control" value="${clientCode}" style="background:#F1F5F9;" readonly>
              </div>
              <div class="form-group">
                <label class="form-label" for="t-code-provider">Código proveedor</label>
                <input type="text" id="t-code-provider" class="form-control" value="${providerCode}" style="background:#F1F5F9;" readonly>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="t-address">Dirección de Entrega / Fiscal</label>
              <textarea id="t-address" class="form-control" rows="2" placeholder="Ej. Avenida Grigotá Nro. 340, Santa Cruz"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="t-cp">Código postal</label>
                <input type="text" id="t-cp" class="form-control" placeholder="Ej. 0000">
              </div>
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="t-poblacion">Ciudad / Población</label>
                <input type="text" id="t-poblacion" class="form-control" placeholder="Ej. Santa Cruz de la Sierra">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="t-pais">País</label>
                <select id="t-pais" class="form-control">
                  <option value="Bolivia" selected>Bolivia (BO)</option>
                  <option value="Argentina">Argentina (AR)</option>
                  <option value="Brasil">Brasil (BR)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="t-provincia">Provincia / Departamento (Localización Bolivia)</label>
                <select id="t-provincia" class="form-control">
                  <option value="La Paz">La Paz</option>
                  <option value="Santa Cruz" selected>Santa Cruz</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="Oruro">Oruro</option>
                  <option value="Potosí">Potosí</option>
                  <option value="Tarija">Tarija</option>
                  <option value="Chuquisaca">Chuquisaca (Sucre)</option>
                  <option value="Beni">Beni</option>
                  <option value="Pando">Pando</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="t-phone">Teléfono Fijo</label>
                <input type="text" id="t-phone" class="form-control" placeholder="Ej. +591 3 3342211">
              </div>
              <div class="form-group">
                <label class="form-label" for="t-movil">Móvil / Celular</label>
                <input type="text" id="t-movil" class="form-control" placeholder="Ej. 70012345">
              </div>
              <div class="form-group">
                <label class="form-label" for="t-fax">Fax</label>
                <input type="text" id="t-fax" class="form-control" placeholder="Ej. +591 3 3342212">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="t-web">Página Web</label>
                <input type="text" id="t-web" class="form-control" placeholder="https://www.ypfbtransportes.com.bo">
              </div>
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="t-email">Correo electrónico de contacto</label>
                <input type="email" id="t-email" class="form-control" placeholder="contacto@ypfbtransportes.com.bo">
              </div>
              <div class="form-group">
                <label class="form-label" for="t-optout">Rechazar email masivo</label>
                <select id="t-optout" class="form-control">
                  <option value="No" selected>No</option>
                  <option value="Si">Sí</option>
                </select>
              </div>
            </div>

            <!-- Sección de Identificación Profesional e IVA (Bolivia Localizada) -->
            <div style="border-top: 1px solid var(--border-color); margin: 20px 0; padding-top: 20px;">
              <h3 style="font-size: 14px; font-weight:700; color:var(--dark); margin-bottom:14px;"><i class="fas fa-file-invoice text-muted"></i> Impuestos e Identificación Fiscal</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="t-nit">Id prof. 1 (NIT de la Empresa) *</label>
                <input type="text" id="t-nit" class="form-control" placeholder="Ej. 1020349021" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="t-prof2">Id prof. 2 (Matrícula de Comercio)</label>
                <input type="text" id="t-prof2" class="form-control" placeholder="Ej. 192842">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="t-iva" style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                  <input type="checkbox" id="t-iva" checked style="width:16px; height:16px;">
                  <span>Sujeto a IVA (13% Estándar Boliviano)</span>
                </label>
              </div>
              <div class="form-group">
                <label class="form-label" for="t-balance">Saldo Inicial Pendiente (Bs.)</label>
                <input type="number" step="0.01" id="t-balance" class="form-control" value="0.00">
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:16px; margin-top:24px;">
              <button class="btn btn-secondary" id="btn-cancel-tercero-full" type="button">ANULAR</button>
              <button class="btn btn-primary" id="btn-submit-tercero-full" type="submit">CREAR TERCERO</button>
            </div>

          </form>
        </div>
      </div>
    `;

    // Lógica visual de los checkboxes de tipo comercial
    const chkPot = document.getElementById('t-check-potential');
    const chkCli = document.getElementById('t-check-client');
    const chkProv = document.getElementById('t-check-provider');

    chkPot.addEventListener('change', () => {
      document.getElementById('lbl-pot').classList.toggle('active', chkPot.checked);
    });
    chkCli.addEventListener('change', () => {
      document.getElementById('lbl-cli').classList.toggle('active', chkCli.checked);
    });
    chkProv.addEventListener('change', () => {
      document.getElementById('lbl-prov').classList.toggle('active', chkProv.checked);
    });

    // Eventos de botones
    document.getElementById('btn-cancel-tercero-full').addEventListener('click', () => {
      window.location.hash = '#/terceros/lista';
    });

    document.getElementById('btn-submit-tercero-full').addEventListener('click', () => {
      const name = document.getElementById('t-name').value.trim();
      const nit = document.getElementById('t-nit').value.trim();
      const address = document.getElementById('t-address').value.trim() || 'Sin dirección';
      const phone = document.getElementById('t-movil').value.trim() || document.getElementById('t-phone').value.trim() || '-';
      const email = document.getElementById('t-email').value.trim() || '-';
      const balance = parseFloat(document.getElementById('t-balance').value) || 0;

      if (!name || !nit) {
        alert("Todos los campos marcados con (*) son obligatorios");
        return;
      }

      // Determinar el tipo basado en los checkboxes
      let type = 'potencial';
      if (chkCli.checked && chkProv.checked) {
        type = 'ambos';
      } else if (chkCli.checked) {
        type = 'cliente';
      } else if (chkProv.checked) {
        type = 'proveedor';
      } else if (chkPot.checked) {
        type = 'potencial';
      }

      const newTercero = {
        id: window.DolibarrUtils.generateId(db.terceros),
        name: name,
        nit: nit,
        type: type,
        address: address,
        phone: phone,
        email: email,
        status: 'activo',
        balance: balance
      };

      db.terceros.push(newTercero);
      window.DolibarrDB.save(db);

      window.DolibarrUtils.showToast(`Tercero "${name}" creado correctamente en el ERP.`, "success");
      
      // Redirigir a listado
      window.location.hash = '#/terceros/lista';
    });
  },

  /**
   * Vista 3: Listado General de Terceros (Filtro para clientes potenciales o todos)
   */
  renderList: function(container, filterType = 'todos') {
    const db = window.DolibarrDB.get();

    // Filtrar según el tipo deseado
    let initialList = db.terceros;
    let pageTitleStr = "Listado de Terceros";
    let iconClass = "fa-list-ul";

    if (filterType === 'potencial') {
      initialList = db.terceros.filter(t => t.type === 'potencial');
      pageTitleStr = "Clientes Potenciales (Prospectos)";
      iconClass = "fa-user-clock";
    }

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/terceros">Terceros</a> <i class="fas fa-chevron-right"></i> <strong>Listado</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid ${iconClass}"></i> ${pageTitleStr}</h1>
        <a href="#/terceros/nuevo" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Tercero
        </a>
      </div>

      <!-- Barra de Filtros -->
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-tercero" class="form-control" placeholder="Buscar por nombre o NIT..." style="width: 250px;">
              ${filterType === 'todos' ? `
                <select id="filter-type-tercero" class="form-control" style="width: 180px;">
                  <option value="todos">-- Todos los tipos --</option>
                  <option value="cliente">Clientes</option>
                  <option value="proveedor">Proveedores</option>
                  <option value="ambos">Ambos (Cliente/Prov)</option>
                  <option value="potencial">Clientes Potenciales</option>
                </select>
              ` : ''}
              <select id="filter-status-tercero" class="form-control" style="width: 150px;">
                <option value="todos">-- Todos los estados --</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-terceros-rows">
              Mostrando ${initialList.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Registros -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>Razón Social / Nombre</th>
              <th>NIT</th>
              <th>Relación</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Estado</th>
              <th style="text-align: right;">Saldo</th>
            </tr>
          </thead>
          <tbody id="tbody-terceros">
            <!-- Renderizado dinámicamente -->
          </tbody>
        </table>
      </div>
    `;

    // Pintar listado
    this.renderFilteredRows(initialList);

    // Eventos de filtro
    const searchInput = document.getElementById('filter-search-tercero');
    const typeSelect = document.getElementById('filter-type-tercero');
    const statusSelect = document.getElementById('filter-status-tercero');

    const runFilter = () => {
      const q = searchInput.value.toLowerCase().trim();
      const type = typeSelect ? typeSelect.value : filterType;
      const status = statusSelect.value;

      const filtered = db.terceros.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(q) || t.nit.includes(q);
        const matchesType = (type === 'todos') || (t.type === type || (type === 'cliente' && t.type === 'ambos') || (type === 'proveedor' && t.type === 'ambos'));
        const matchesStatus = (status === 'todos') || (t.status === status);
        return matchesSearch && matchesType && matchesStatus;
      });

      this.renderFilteredRows(filtered);
    };

    searchInput.addEventListener('input', runFilter);
    if (typeSelect) typeSelect.addEventListener('change', runFilter);
    statusSelect.addEventListener('change', runFilter);
  },

  renderFilteredRows: function(list) {
    const tbody = document.getElementById('tbody-terceros');
    const countLabel = document.getElementById('count-terceros-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted" style="padding: 40px;">
            <i class="fas fa-search" style="font-size:26px; margin-bottom:12px; display:block;"></i>
            No se encontraron registros con los filtros indicados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(t => {
      let typeBadge = '';
      if (t.type === 'cliente') typeBadge = '<span class="badge badge-primary" style="font-size:9.5px;">CLIENTE</span>';
      else if (t.type === 'proveedor') typeBadge = '<span class="badge badge-success" style="font-size:9.5px;">PROVEEDOR</span>';
      else if (t.type === 'ambos') typeBadge = '<span class="badge badge-info" style="font-size:9.5px;">CLIENTE / PROV</span>';
      else typeBadge = '<span class="badge badge-warning" style="font-size:9.5px;">POTENCIAL</span>';

      return `
        <tr>
          <td><code>#${t.id}</code></td>
          <td><strong>${t.name}</strong><br><small class="text-muted"><i class="fas fa-map-marker-alt"></i> ${t.address}</small></td>
          <td><code>${t.nit}</code></td>
          <td>${typeBadge}</td>
          <td>${t.phone}</td>
          <td><a href="mailto:${t.email}">${t.email}</a></td>
          <td>${window.DolibarrUtils.renderBadge(t.status)}</td>
          <td style="text-align: right; font-weight: 700; color: ${t.balance < 0 ? 'var(--danger)' : 'var(--dark)'};">
            ${window.DolibarrUtils.formatCurrency(t.balance)}
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Vista 4: Formulario Completo de "Nuevo Contacto" (Réplica de captura 2)
   */
  renderNewContactForm: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/terceros">Terceros</a> <i class="fas fa-chevron-right"></i> <strong>Nuevo Contacto/Dirección</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-address-card"></i> Nuevo Contacto / Dirección</h1>
      </div>

      <div class="card">
        <div class="card-body">
          <form id="form-nuevo-contacto-full" onsubmit="return false;">
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c-last">Apellidos / Etiqueta de Dirección *</label>
                <input type="text" id="c-last" class="form-control" placeholder="Ej. Gomez Valdez" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="c-first">Nombres *</label>
                <input type="text" id="c-first" class="form-control" placeholder="Ej. Maria Elena" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c-tercero">Asociar a Tercero (Empresa) *</label>
                <select id="c-tercero" class="form-control" required>
                  <option value="">-- Seleccione un tercero --</option>
                  ${db.terceros.map(t => `<option value="${t.id}">${t.name} (NIT: ${t.nit})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="c-cortesia">Título de cortesía</label>
                <select id="c-cortesia" class="form-control">
                  <option value="Sr.">Sr. (Señor)</option>
                  <option value="Sra.">Sra. (Señora)</option>
                  <option value="Ing.">Ing. (Ingeniero/a)</option>
                  <option value="Dr.">Dr. (Doctor/a)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="c-role">Puesto de trabajo / Cargo</label>
                <input type="text" id="c-role" class="form-control" placeholder="Ej. Encargada de Operaciones">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="c-address">Dirección de Contacto (si difiere del Tercero)</label>
              <textarea id="c-address" class="form-control" rows="2" placeholder="Ej. Calle Fernando Guachalla Nro. 320, Sopocachi, La Paz"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c-cp">Código postal / Población</label>
                <input type="text" id="c-cp" class="form-control" placeholder="Ej. 0000 / La Paz">
              </div>
              <div class="form-group">
                <label class="form-label" for="c-pais">País</label>
                <select id="c-pais" class="form-control">
                  <option value="Bolivia" selected>Bolivia (BO)</option>
                  <option value="Argentina">Argentina (AR)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="c-provincia">Provincia / Dpto.</label>
                <select id="c-provincia" class="form-control">
                  <option value="La Paz" selected>La Paz</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c-phone-work">Teléf. trabajo</label>
                <input type="text" id="c-phone-work" class="form-control" placeholder="+591 2 2431212">
              </div>
              <div class="form-group">
                <label class="form-label" for="c-phone-pers">Teléf. particular</label>
                <input type="text" id="c-phone-pers" class="form-control" placeholder="+591 2 2781212">
              </div>
              <div class="form-group">
                <label class="form-label" for="c-movil">Móvil</label>
                <input type="text" id="c-movil" class="form-control" placeholder="71234567">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="c-email">Correo Electrónico *</label>
                <input type="email" id="c-email" class="form-control" placeholder="mhelena@empresa.com" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="c-optout">Rechazar email masivo</label>
                <select id="c-optout" class="form-control">
                  <option value="No">No</option>
                  <option value="Si">Sí</option>
                </select>
              </div>
            </div>

            <div style="border-top: 1px solid var(--border-color); margin: 20px 0; padding-top: 20px;">
              <h3 style="font-size: 14px; font-weight:700; color:var(--dark); margin-bottom:14px;"><i class="fas fa-id-card text-muted"></i> Visibilidad y Datos Personales</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c-visibility">Visibilidad del Contacto</label>
                <select id="c-visibility" class="form-control">
                  <option value="Compartido">Compartido (Todos los usuarios)</option>
                  <option value="Privado">Privado (Solo Propietario)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="c-lang">Idioma predeterminado</label>
                <select id="c-lang" class="form-control">
                  <option value="es_ES">Español (es_ES)</option>
                  <option value="en_US">Inglés (en_US)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="c-birth">Fecha de nacimiento</label>
                <input type="date" id="c-birth" class="form-control">
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:16px; margin-top:24px;">
              <button class="btn btn-secondary" id="btn-cancel-contact-full" type="button">ANULAR</button>
              <button class="btn btn-primary" id="btn-submit-contact-full" type="submit">AÑADIR CONTACTO</button>
            </div>

          </form>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('btn-cancel-contact-full').addEventListener('click', () => {
      window.location.hash = '#/terceros/contactos';
    });

    document.getElementById('btn-submit-contact-full').addEventListener('click', () => {
      const first = document.getElementById('c-first').value.trim();
      const last = document.getElementById('c-last').value.trim();
      const terceroId = parseInt(document.getElementById('c-tercero').value);
      const email = document.getElementById('c-email').value.trim();
      const phone = document.getElementById('c-movil').value.trim() || document.getElementById('c-phone-work').value.trim() || '-';
      const role = document.getElementById('c-role').value.trim() || 'Sin puesto';

      if (!first || !last || !terceroId || !email) {
        alert("Todos los campos marcados con (*) son obligatorios");
        return;
      }

      db.contacts.push({
        id: window.DolibarrUtils.generateId(db.contacts),
        terceroId: terceroId,
        first_name: first,
        last_name: last,
        email: email,
        phone: phone,
        role: role
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Contacto "${first} ${last}" creado con éxito.`, "success");
      
      window.location.hash = '#/terceros/contactos';
    });
  },

  /**
   * Vista 5: Listado de Contactos (Con buscador)
   */
  renderContactsList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/terceros">Terceros</a> <i class="fas fa-chevron-right"></i> <strong>Contactos</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-address-book"></i> Contactos y Direcciones de Correspondencia</h1>
        <a href="#/terceros/contactos-nuevo" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Contacto
        </a>
      </div>

      <!-- Barra Filtros -->
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-contacto" class="form-control" placeholder="Buscar por nombre, cargo o correo..." style="width: 300px;">
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-contactos-rows">
              Mostrando ${db.contacts.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Contactos -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Tercero / Empresa Asociada</th>
              <th>Cargo / Puesto de trabajo</th>
              <th>Teléfono / Móvil</th>
              <th>Correo Electrónico</th>
            </tr>
          </thead>
          <tbody id="tbody-contactos">
            <!-- Renderizado dinámicamente -->
          </tbody>
        </table>
      </div>
    `;

    // Pintar listado
    this.renderContactsRows(db.contacts, db.terceros);

    // Eventos
    const searchInput = document.getElementById('filter-search-contacto');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = db.contacts.filter(c => {
        const t = db.terceros.find(item => item.id === c.terceroId) || { name: '' };
        return c.first_name.toLowerCase().includes(q) || 
               c.last_name.toLowerCase().includes(q) || 
               c.role.toLowerCase().includes(q) || 
               c.email.toLowerCase().includes(q) ||
               t.name.toLowerCase().includes(q);
      });
      this.renderContactsRows(filtered, db.terceros);
    });
  },

  renderContactsRows: function(list, terceros) {
    const tbody = document.getElementById('tbody-contactos');
    const countLabel = document.getElementById('count-contactos-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted" style="padding: 40px;">
            <i class="fas fa-search" style="font-size:26px; margin-bottom:12px; display:block;"></i>
            No se encontraron contactos coincidentes.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(c => {
      const t = terceros.find(item => item.id === c.terceroId) || { name: 'Desconocido' };
      return `
        <tr>
          <td><code>#CON-${c.id}</code></td>
          <td><strong>${c.first_name} ${c.last_name}</strong></td>
          <td><span style="font-size:12.5px; font-weight:600; color:var(--primary);">${t.name}</span></td>
          <td><span class="text-muted">${c.role}</span></td>
          <td>${c.phone}</td>
          <td><a href="mailto:${c.email}">${c.email}</a></td>
        </tr>
      `;
    }).join('');
  }
};
