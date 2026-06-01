/**
 * contabilidad.js - Módulo de Contabilidad y Libros de Registro
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.contabilidad = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (subRoute === 'libro-mayor') {
      this.renderLibroMayor(mainContent);
    } else if (subRoute === 'diarios') {
      this.renderDiarios(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Vista: Cuadro de Mando Contable / Balances
   */
  renderDashboard: function(container) {
    const db = window.DolibarrDB.get();
    const diario = db.contabilidad.diario;

    // Calcular sumas y verificar balance cuadrado
    const totalDebe = diario.reduce((sum, item) => sum + item.debit, 0);
    const totalHaber = diario.reduce((sum, item) => sum + item.credit, 0);
    const isCuadrado = Math.abs(totalDebe - totalHaber) < 0.01;

    // Calcular Balance de Comprobación Dinámico (Sumas y Saldos)
    const balanceCuentas = {};
    diario.forEach(entry => {
      if (!balanceCuentas[entry.account]) {
        balanceCuentas[entry.account] = { debe: 0, haber: 0 };
      }
      balanceCuentas[entry.account].debe += entry.debit;
      balanceCuentas[entry.account].haber += entry.credit;
    });

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Contabilidad</span> <i class="fas fa-chevron-right"></i> <strong>Cuadro Mando</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-book"></i> Contabilidad de Doble Entrada</h1>
      </div>

      <!-- Indicadores -->
      <div class="widget-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
        <div class="widget-box wb-primary" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-calculator"></i></div>
          <div class="wb-details">
            <div class="wb-count">${window.DolibarrUtils.formatCurrency(totalDebe)}</div>
            <div class="wb-label">Suma de Débitos (Debe)</div>
          </div>
        </div>

        <div class="widget-box wb-primary" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-receipt"></i></div>
          <div class="wb-details">
            <div class="wb-count">${window.DolibarrUtils.formatCurrency(totalHaber)}</div>
            <div class="wb-label">Suma de Créditos (Haber)</div>
          </div>
        </div>

        <div class="widget-box ${isCuadrado ? 'wb-success' : 'wb-danger'}" style="cursor:default;">
          <div class="wb-icon"><i class="fas ${isCuadrado ? 'fa-scale-balanced' : 'fa-triangle-exclamation'}"></i></div>
          <div class="wb-details">
            <div class="wb-count" style="font-size: 18px; margin-top: 4px;">
              ${isCuadrado ? 'BALANCE CUADRADO' : 'BALANCE DESCUADRADO'}
            </div>
            <div class="wb-label">Consistencia del Libro Diario</div>
          </div>
        </div>
      </div>

      <!-- Balance de Comprobación -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-list-check"></i> Balance de Comprobación de Sumas y Saldos (Trial Balance)</div>
        </div>
        <div class="card-body" style="padding: 0;">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Código y Nombre de Cuenta</th>
                <th style="text-align: right;">Suma Debe</th>
                <th style="text-align: right;">Suma Haber</th>
                <th style="text-align: right;">Saldo Deudor</th>
                <th style="text-align: right;">Saldo Acreedor</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(balanceCuentas).map(cuenta => {
                const vals = balanceCuentas[cuenta];
                const saldo = vals.debe - vals.haber;
                const deudor = saldo > 0 ? saldo : 0;
                const acreedor = saldo < 0 ? Math.abs(saldo) : 0;

                return `
                  <tr>
                    <td><strong>${cuenta}</strong></td>
                    <td style="text-align: right;" class="text-muted">${window.DolibarrUtils.formatCurrency(vals.debe)}</td>
                    <td style="text-align: right;" class="text-muted">${window.DolibarrUtils.formatCurrency(vals.haber)}</td>
                    <td style="text-align: right; font-weight:600; color:${deudor > 0 ? 'var(--primary)' : 'var(--text-muted)'};">
                      ${deudor > 0 ? window.DolibarrUtils.formatCurrency(deudor) : '-'}
                    </td>
                    <td style="text-align: right; font-weight:600; color:${acreedor > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
                      ${acreedor > 0 ? window.DolibarrUtils.formatCurrency(acreedor) : '-'}
                    </td>
                  </tr>
                `;
              }).join('')}
              <!-- Totales -->
              <tr style="background-color:#F8FAFC; font-weight:700; border-top:2px solid var(--border-color-dark);">
                <td>TOTALES CONSOLIDADOS</td>
                <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(totalDebe)}</td>
                <td style="text-align: right;">${window.DolibarrUtils.formatCurrency(totalHaber)}</td>
                <td style="text-align: right; color:var(--primary);">${window.DolibarrUtils.formatCurrency(totalDebe - (totalDebe-totalHaber > 0 ? totalDebe-totalHaber : 0))}</td>
                <td style="text-align: right; color:var(--danger);">${window.DolibarrUtils.formatCurrency(totalHaber - (totalHaber-totalDebe > 0 ? totalHaber-totalDebe : 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Vista: Libro Mayor
   */
  renderLibroMayor: function(container) {
    const db = window.DolibarrDB.get();
    const diario = db.contabilidad.diario;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/contabilidad">Contabilidad</a> <i class="fas fa-chevron-right"></i> <strong>Libro Mayor</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-list-ol"></i> Libro Mayor General</h1>
      </div>

      <!-- Filtro Rápido -->
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-mayor" class="form-control" placeholder="Filtrar por cuenta o glosa..." style="width: 320px;">
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-mayor-rows">
              Mostrando ${diario.length} asientos
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla del Libro Mayor -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th style="width:60px;">ID</th>
              <th style="width:100px;">Fecha</th>
              <th style="width:100px;">Referencia</th>
              <th>Glosa / Asiento</th>
              <th>Cuenta Contable</th>
              <th style="text-align: right; width:130px;">Debe</th>
              <th style="text-align: right; width:130px;">Haber</th>
              <th style="text-align: center; width:100px;">Diario</th>
            </tr>
          </thead>
          <tbody id="tbody-libro-mayor">
            <!-- Dinámico -->
          </tbody>
        </table>
      </div>
    `;

    // Render Inicial
    this.filterMayor(diario);

    // Evento de Filtro
    const searchInput = document.getElementById('filter-search-mayor');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const filtered = diario.filter(item => {
        return item.account.toLowerCase().includes(query) || 
               item.desc.toLowerCase().includes(query) || 
               item.ref.toLowerCase().includes(query);
      });
      this.filterMayor(filtered);
    });
  },

  /**
   * Renderiza las filas filtradas del Libro Mayor
   */
  filterMayor: function(list) {
    const tbody = document.getElementById('tbody-libro-mayor');
    const countLabel = document.getElementById('count-mayor-rows');
    if (!tbody) return;

    countLabel.textContent = `Mostrando ${list.length} asientos`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="8" class="text-center text-muted" style="padding:30px;">No se encontraron registros contables.</td></tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(item => `
      <tr>
        <td><code>#${item.id}</code></td>
        <td>${window.DolibarrUtils.formatDate(item.date)}</td>
        <td><code>${item.ref}</code></td>
        <td><strong>${item.desc}</strong></td>
        <td><span style="font-size:12.5px; font-weight:600; color:var(--dark);">${item.account}</span></td>
        <td style="text-align: right; font-weight:600; color:${item.debit > 0 ? 'var(--primary)' : 'var(--text-muted)'};">
          ${item.debit > 0 ? window.DolibarrUtils.formatCurrency(item.debit) : '-'}
        </td>
        <td style="text-align: right; font-weight:600; color:${item.credit > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
          ${item.credit > 0 ? window.DolibarrUtils.formatCurrency(item.credit) : '-'}
        </td>
        <td style="text-align: center;"><span class="badge badge-secondary">${item.journal}</span></td>
      </tr>
    `).join('');
  },

  /**
   * Vista: Diarios Contables
   */
  renderDiarios: function(container) {
    const db = window.DolibarrDB.get();
    const diario = db.contabilidad.diario;

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/contabilidad">Contabilidad</a> <i class="fas fa-chevron-right"></i> <strong>Diarios</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-journal-whills"></i> Diarios Contables Separados</h1>
        <button id="btn-exportar-diario" class="btn btn-primary">
          <i class="fas fa-download"></i> Exportar Diario
        </button>
      </div>

      <!-- Navegación por Pestañas (Tabs) -->
      <div class="tab-container">
        <ul class="nav-tabs">
          <li class="tab-item active" data-journal="Ventas"><i class="fas fa-file-invoice"></i> Diario de Ventas</li>
          <li class="tab-item" data-journal="Bancos"><i class="fas fa-university"></i> Diario de Bancos</li>
          <li class="tab-item" data-journal="Compras"><i class="fas fa-shopping-bag"></i> Diario de Compras</li>
        </ul>
      </div>

      <!-- Tabla de Diarios -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Referencia</th>
              <th>Asiento</th>
              <th>Cuenta Contable</th>
              <th style="text-align: right;">Debe (Bs)</th>
              <th style="text-align: right;">Haber (Bs)</th>
            </tr>
          </thead>
          <tbody id="tbody-diarios-filtrado">
            <!-- Dinámico -->
          </tbody>
        </table>
      </div>
    `;

    // Renderizar diario inicial (Ventas)
    this.renderDiarioFiltrado(diario, 'Ventas');

    // Cambiador de Tabs
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const journal = tab.dataset.journal;
        this.renderDiarioFiltrado(diario, journal);
      });
    });

    // Exportar Diario
    document.getElementById('btn-exportar-diario').addEventListener('click', () => {
      const activeTab = document.querySelector('.tab-item.active').textContent.trim();
      
      // Simular guardado en SGD
      const db = window.DolibarrDB.get();
      const newFile = {
        id: window.DolibarrUtils.generateId(db.documentos),
        name: `Libro_Diario_${activeTab.replace(' ', '_')}_2026.xlsx`,
        type: 'xls',
        path: '/Contratos',
        size: 45000,
        date: new Date().toISOString().split('T')[0]
      };
      db.documentos.push(newFile);
      window.DolibarrDB.save(db);

      window.DolibarrUtils.showToast(`Archivo "${newFile.name}" generado y exportado con éxito a SGD (Gestión Documental).`, 'success');
    });
  },

  /**
   * Imprime filas filtradas por Diario
   */
  renderDiarioFiltrado: function(allEntries, journal) {
    const tbody = document.getElementById('tbody-diarios-filtrado');
    if (!tbody) return;

    const filtered = allEntries.filter(item => item.journal === journal);

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="7" class="text-center text-muted" style="padding:30px;">No hay registros asociados a este Diario Contable en la simulación.</td></tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => `
      <tr>
        <td><code>#${item.id}</code></td>
        <td>${window.DolibarrUtils.formatDate(item.date)}</td>
        <td><code>${item.ref}</code></td>
        <td><strong>${item.desc}</strong></td>
        <td><code>${item.account}</code></td>
        <td style="text-align: right; font-weight:600; color:${item.debit > 0 ? 'var(--primary)' : 'var(--text-muted)'};">
          ${item.debit > 0 ? window.DolibarrUtils.formatCurrency(item.debit) : '-'}
        </td>
        <td style="text-align: right; font-weight:600; color:${item.credit > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
          ${item.credit > 0 ? window.DolibarrUtils.formatCurrency(item.credit) : '-'}
        </td>
      </tr>
    `).join('');
  }
};
window.DolibarrModules.contabilidad = window.DolibarrModules.contabilidad;
