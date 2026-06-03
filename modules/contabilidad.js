/**
 * contabilidad.js - Módulo de Contabilidad y Libros de Registro
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.contabilidad = {

  CHART_OF_ACCOUNTS: [
    { code: "111100", name: "Caja/Banco BNB" },
    { code: "111200", name: "Caja/Banco BMSC" },
    { code: "111300", name: "Caja Chica Central" },
    { code: "113010", name: "Crédito Fiscal IVA" },
    { code: "120000", name: "Clientes (Cuentas por Cobrar)" },
    { code: "211000", name: "Proveedores (Cuentas por Pagar)" },
    { code: "213010", name: "Débito Fiscal IVA" },
    { code: "213020", name: "IT por Pagar" },
    { code: "400000", name: "Ventas de Productos" },
    { code: "501000", name: "Gastos de Administración (Servicios / Compras)" },
    { code: "501020", name: "Impuesto a las Transacciones (IT)" }
  ],

  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inyectar estilos específicos de contabilidad para interfaces premium
    this.injectStyles();

    if (subRoute === 'libro-mayor') {
      this.renderLibroMayor(mainContent);
    } else if (subRoute === 'diarios') {
      this.renderDiarios(mainContent);
    } else if (subRoute === 'nuevo-asiento') {
      this.renderNuevoAsientoForm(mainContent);
    } else if (subRoute === 'enlace') {
      this.renderEnlaceContabilidad(mainContent);
    } else if (subRoute === 'exportar') {
      this.renderExportar(mainContent);
    } else {
      this.renderDashboard(mainContent);
    }
  },

  /**
   * Inyecta estilos CSS específicos del módulo
   */
  injectStyles: function() {
    let styleEl = document.getElementById('contabilidad-custom-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'contabilidad-custom-styles';
      styleEl.innerHTML = `
        /* Estilos del Balance de Comprobación y Mayor Grouped */
        .account-group-header {
          background: #F1F5F9 !important;
          font-weight: 700;
          color: var(--text-dark);
          font-size: 13.5px;
          border-left: 4px solid var(--primary);
        }
        .ledger-subtotal-row {
          background: #F8FAFC;
          font-weight: 700;
          font-size: 12.5px;
          border-top: 1px dashed var(--border-color);
        }
        
        /* Estilos para el Generador de Asientos */
        .asiento-grid-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        .asiento-grid-table th {
          background: #F8FAFC;
          color: var(--text-dark);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .asiento-grid-table td {
          padding: 8px;
          border-bottom: 1px solid var(--border-color);
        }
        .asiento-input {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 13px;
        }
        .asiento-input:focus {
          border-color: var(--primary);
          outline: none;
        }
        .asiento-btn-remove {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .asiento-btn-remove:hover {
          transform: scale(1.15);
        }
        .balance-alert-box {
          padding: 14px 20px;
          border-radius: 8px;
          margin-top: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }
        .balance-alert-danger {
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #991B1B;
        }
        .balance-alert-success {
          background: #F0FDF4;
          border: 1px solid #86EFAC;
          color: #166534;
        }
        
        /* Enlace Contabilidad (Pestañas) */
        .enlace-tabs {
          display: flex;
          border-bottom: 2px solid var(--border-color);
          margin-bottom: 20px;
          gap: 8px;
        }
        .enlace-tab-item {
          padding: 12px 20px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13.5px;
          color: var(--text-muted);
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .enlace-tab-item:hover {
          color: var(--primary);
        }
        .enlace-tab-item.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
      `;
      document.head.appendChild(styleEl);
    }
  },

  /**
   * Vista: Cuadro de Mando Contable / Trial Balance
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
    // Cargar cuentas del Plan de Cuentas para asegurar que se muestren en orden
    this.CHART_OF_ACCOUNTS.forEach(acc => {
      balanceCuentas[`${acc.code} - ${acc.name}`] = { debe: 0, haber: 0 };
    });

    diario.forEach(entry => {
      let accKey = entry.account;
      // Normalizar la key si no contiene el formato exacto
      if (!accKey.includes(' - ')) {
        const matchingAcc = this.CHART_OF_ACCOUNTS.find(a => a.code === accKey.split(' ')[0]);
        if (matchingAcc) {
          accKey = `${matchingAcc.code} - ${matchingAcc.name}`;
        }
      }
      if (!balanceCuentas[accKey]) {
        balanceCuentas[accKey] = { debe: 0, haber: 0 };
      }
      balanceCuentas[accKey].debe += entry.debit;
      balanceCuentas[accKey].haber += entry.credit;
    });

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <span>Contabilidad</span> <i class="fas fa-chevron-right"></i> <strong>Cuadro Mando</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-book"></i> Contabilidad de Doble Entrada</h1>
        <div class="page-actions" style="display:flex; gap:10px;">
          <a href="#/contabilidad/enlace" class="btn btn-secondary"><i class="fas fa-link"></i> Enlace Contable</a>
          <a href="#/contabilidad/nuevo-asiento" class="btn btn-primary"><i class="fas fa-plus"></i> Generar Asiento Manual</a>
        </div>
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

      <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 24px; margin-bottom: 24px;">
        
        <!-- Balance de Comprobación -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-list-check"></i> Balance de Comprobación de Sumas y Saldos (Trial Balance)</div>
          </div>
          <div class="card-body" style="padding: 0; max-height: 480px; overflow-y: auto;">
            <table class="table table-striped" style="margin:0;">
              <thead>
                <tr>
                  <th>Código y Nombre de Cuenta</th>
                  <th style="text-align: right; width:110px;">Debe</th>
                  <th style="text-align: right; width:110px;">Haber</th>
                  <th style="text-align: right; width:110px;">Saldo Deudor</th>
                  <th style="text-align: right; width:110px;">Saldo Acreedor</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(balanceCuentas)
                  .filter(cuenta => balanceCuentas[cuenta].debe > 0 || balanceCuentas[cuenta].haber > 0)
                  .map(cuenta => {
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
                <tr style="background-color:#F8FAFC; font-weight:700; border-top:2px solid var(--border-color-dark); position: sticky; bottom:0;">
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

        <div style="display:flex; flex-direction:column; gap:24px;">
          <!-- Gráfico de Cuentas de Gasto -->
          <div class="card" style="flex:1;">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución de Gastos</div>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height: 180px; position: relative;">
                <canvas id="chart-contabilidad-gastos"></canvas>
              </div>
            </div>
          </div>
          
          <!-- Resumen de Actividad Reciente -->
          <div class="card" style="flex:1;">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-history"></i> Asientos Recientes</div>
              <a href="#/contabilidad/libro-mayor" style="font-size:11px;">Ver Mayor</a>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table" style="margin:0; font-size:12px;">
                <tbody>
                  ${diario.slice(-4).reverse().map(item => `
                    <tr>
                      <td>${window.DolibarrUtils.formatDate(item.date)}</td>
                      <td><strong>${item.desc}</strong><br><span class="text-muted">${item.account.split(' - ')[0]}</span></td>
                      <td style="text-align:right; font-weight:700;">
                        ${item.debit > 0 ? `+${window.DolibarrUtils.formatCurrency(item.debit)}` : `-${window.DolibarrUtils.formatCurrency(item.credit)}`}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    `;

    // Cargar Gráficos
    setTimeout(() => {
      if (typeof Chart !== 'undefined' && window.DolibarrCharts) {
        
        // Extraer cuentas de gastos (comienzan con "5")
        const gastoLabels = [];
        const gastoData = [];
        Object.keys(balanceCuentas).forEach(cuenta => {
          if (cuenta.startsWith('5')) {
            const sum = balanceCuentas[cuenta].debe - balanceCuentas[cuenta].haber;
            if (sum > 0) {
              gastoLabels.push(cuenta.split(' - ')[1]);
              gastoData.push(sum);
            }
          }
        });

        if (gastoData.length > 0) {
          window.DolibarrCharts.createDoughnut('chart-contabilidad-gastos', 
            gastoLabels, gastoData,
            ['#E74C3C', '#E67E22', '#F1C40F', '#95A5A6']
          );
        } else {
          // Placeholder si no hay gastos cargados
          window.DolibarrCharts.createDoughnut('chart-contabilidad-gastos', 
            ['Sin Gastos aún'], [1], ['#BDC3C7']
          );
        }
      }
    }, 100);
  },

  /**
   * Vista: Libro Mayor General (Agrupado por Cuenta Contable)
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
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-mayor" class="form-control" placeholder="Filtrar por cuenta, glosa o referencia..." style="width: 380px;">
            </div>
            <div class="text-muted" style="font-size:12.5px;" id="count-mayor-rows">
              Cargando movimientos...
            </div>
          </div>
        </div>
      </div>

      <!-- Contenedor del Libro Mayor Agrupado -->
      <div class="table-responsive" style="background:#ffffff; border-radius:12px; box-shadow:var(--shadow-sm); border:1px solid var(--border-color);">
        <table class="table" style="margin:0;" id="table-libro-mayor">
          <thead>
            <tr>
              <th style="width:120px;">Fecha</th>
              <th style="width:120px;">Referencia</th>
              <th>Glosa / Detalle Asiento</th>
              <th style="text-align: right; width:140px;">Debe (Bs.)</th>
              <th style="text-align: right; width:140px;">Haber (Bs.)</th>
              <th style="text-align: center; width:110px;">Diario</th>
            </tr>
          </thead>
          <tbody id="tbody-libro-mayor">
            <!-- Renderizado dinámico agrupado -->
          </tbody>
        </table>
      </div>
    `;

    const searchInput = document.getElementById('filter-search-mayor');
    
    // Función de agrupamiento y filtrado
    const renderGroupedMayor = () => {
      const q = searchInput.value.toLowerCase().trim();
      const tbody = document.getElementById('tbody-libro-mayor');
      const countLabel = document.getElementById('count-mayor-rows');

      // 1. Filtrar los asientos según el query
      const filteredDiario = diario.filter(item => {
        return item.account.toLowerCase().includes(q) || 
               item.desc.toLowerCase().includes(q) || 
               item.ref.toLowerCase().includes(q);
      });

      countLabel.textContent = `Encontrados ${filteredDiario.length} movimientos de asientos`;

      if (filteredDiario.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:40px;">No se encontraron registros contables coincidentes.</td></tr>`;
        return;
      }

      // 2. Agrupar por Cuenta Contable
      const grouped = {};
      filteredDiario.forEach(entry => {
        let accKey = entry.account;
        if (!accKey.includes(' - ')) {
          const matchingAcc = this.CHART_OF_ACCOUNTS.find(a => a.code === accKey.split(' ')[0]);
          if (matchingAcc) {
            accKey = `${matchingAcc.code} - ${matchingAcc.name}`;
          }
        }
        if (!grouped[accKey]) {
          grouped[accKey] = [];
        }
        grouped[accKey].push(entry);
      });

      // 3. Generar el HTML con filas subheader de cuentas
      let html = '';
      Object.keys(grouped).forEach(accountName => {
        const entries = grouped[accountName];
        
        // Fila cabecera del grupo de cuenta
        html += `
          <tr class="account-group-header">
            <td colspan="6"><i class="fas fa-folder-open"></i> Cuenta: ${accountName}</td>
          </tr>
        `;

        let subtotalDebe = 0;
        let subtotalHaber = 0;

        entries.forEach(entry => {
          subtotalDebe += entry.debit;
          subtotalHaber += entry.credit;

          html += `
            <tr>
              <td style="padding-left: 20px;">${window.DolibarrUtils.formatDate(entry.date)}</td>
              <td><code>${entry.ref}</code></td>
              <td><strong>${entry.desc}</strong></td>
              <td style="text-align: right; font-weight:600; color:${entry.debit > 0 ? 'var(--primary)' : 'var(--text-muted)'};">
                ${entry.debit > 0 ? window.DolibarrUtils.formatCurrency(entry.debit) : '-'}
              </td>
              <td style="text-align: right; font-weight:600; color:${entry.credit > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
                ${entry.credit > 0 ? window.DolibarrUtils.formatCurrency(entry.credit) : '-'}
              </td>
              <td style="text-align: center;"><span class="badge badge-secondary">${entry.journal}</span></td>
            </tr>
          `;
        });

        // Fila subtotal del grupo de cuenta
        const saldo = subtotalDebe - subtotalHaber;
        const saldoText = saldo >= 0 
          ? `Saldo Deudor: ${window.DolibarrUtils.formatCurrency(saldo)}` 
          : `Saldo Acreedor: ${window.DolibarrUtils.formatCurrency(Math.abs(saldo))}`;
        const saldoColor = saldo >= 0 ? 'var(--primary)' : 'var(--danger)';

        html += `
          <tr class="ledger-subtotal-row">
            <td colspan="3" style="text-align:right;">Subtotal ${accountName.split(' - ')[0]}:</td>
            <td style="text-align:right; color:var(--primary);">${window.DolibarrUtils.formatCurrency(subtotalDebe)}</td>
            <td style="text-align:right; color:var(--danger);">${window.DolibarrUtils.formatCurrency(subtotalHaber)}</td>
            <td style="text-align:center; font-size:11px; color:${saldoColor}; font-weight:700;">${saldoText}</td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    };

    // Filtro interactivo
    searchInput.addEventListener('input', renderGroupedMayor);

    // Carga inicial
    renderGroupedMayor();
  },

  /**
   * Vista: Diarios Contables por Pestañas (Ventas, Compras, Bancos, Gastos, OD)
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
          <i class="fas fa-download"></i> Exportar Diario Activo
        </button>
      </div>

      <!-- Navegación por Pestañas (Tabs) -->
      <div class="tab-container">
        <ul class="nav-tabs">
          <li class="tab-item active" data-journal="Ventas"><i class="fas fa-file-invoice"></i> Ventas</li>
          <li class="tab-item" data-journal="Compras"><i class="fas fa-shopping-bag"></i> Compras</li>
          <li class="tab-item" data-journal="Bancos"><i class="fas fa-university"></i> Bancos / Cajas</li>
          <li class="tab-item" data-journal="Gastos"><i class="fas fa-wallet"></i> Gastos</li>
          <li class="tab-item" data-journal="OD"><i class="fas fa-pen-to-square"></i> Operaciones Diversas (OD)</li>
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
              <th>Detalle Glosa Asiento</th>
              <th>Cuenta Contable</th>
              <th style="text-align: right; width:130px;">Debe (Bs)</th>
              <th style="text-align: right; width:130px;">Haber (Bs)</th>
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
      
      const newFile = {
        id: window.DolibarrUtils.generateId(db.documentos),
        name: `Libro_Diario_${activeTab.replace(' ', '_')}_2026.xlsx`,
        type: 'xls',
        path: '/Contratos',
        size: 32000,
        date: new Date().toISOString().split('T')[0]
      };
      db.documentos.push(newFile);
      window.DolibarrDB.save(db);

      window.DolibarrUtils.showToast(`Archivo "${newFile.name}" exportado con éxito a SGD (Gestión Documental).`, 'success');
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
        <tr><td colspan="7" class="text-center text-muted" style="padding:30px;">No hay registros cargados para el Diario de ${journal} en este periodo.</td></tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => `
      <tr>
        <td><code>#${item.id}</code></td>
        <td>${window.DolibarrUtils.formatDate(item.date)}</td>
        <td><code>${item.ref}</code></td>
        <td><strong>${item.desc}</strong></td>
        <td><span style="font-weight:600;">${item.account}</span></td>
        <td style="text-align: right; font-weight:600; color:${item.debit > 0 ? 'var(--primary)' : 'var(--text-muted)'};">
          ${item.debit > 0 ? window.DolibarrUtils.formatCurrency(item.debit) : '-'}
        </td>
        <td style="text-align: right; font-weight:600; color:${item.credit > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
          ${item.credit > 0 ? window.DolibarrUtils.formatCurrency(item.credit) : '-'}
        </td>
      </tr>
    `).join('');
  },

  /**
   * Vista: Formulario para ingresar Asiento Manual OD con validador de doble entrada
   */
  renderNuevoAsientoForm: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/contabilidad">Contabilidad</a> <i class="fas fa-chevron-right"></i> <strong>Crear Asiento OD</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-pen-to-square"></i> Generación de Asiento Contable (Operaciones Diversas)</h1>
      </div>

      <div class="card" style="max-width: 900px; margin: 0 auto;">
        <div class="card-header">
          <div class="card-title">Cabecera del Asiento</div>
        </div>
        <div class="card-body">
          <form id="form-nuevo-asiento-manual">
            <div class="form-row" style="grid-template-columns: 1.2fr 1fr 1.8fr;">
              <div class="form-group">
                <label class="form-label" for="as-date">Fecha de Asiento *</label>
                <input type="date" id="as-date" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="as-ref">Referencia / Folio *</label>
                <input type="text" id="as-ref" class="form-control" placeholder="Ej. OD2606-001" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="as-desc">Descripción / Glosa General *</label>
                <input type="text" id="as-desc" class="form-control" placeholder="Ej. Registro ajuste de fin de mes..." required>
              </div>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
              <strong style="font-size:14px; color:var(--text-dark);"><i class="fas fa-align-justify"></i> Líneas del Asiento de Partida Doble</strong>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-add-asiento-row"><i class="fas fa-plus"></i> Añadir Línea</button>
            </div>

            <!-- Tabla de Líneas Contables -->
            <table class="asiento-grid-table" id="asiento-lines-table">
              <thead>
                <tr>
                  <th>Cuenta Contable *</th>
                  <th>Glosa Detallada de Línea</th>
                  <th style="width: 140px; text-align:right;">Debe (Bs.)</th>
                  <th style="width: 140px; text-align:right;">Haber (Bs.)</th>
                  <th style="width: 50px; text-align:center;">Acción</th>
                </tr>
              </thead>
              <tbody id="asiento-lines-tbody">
                <!-- Se poblarán líneas dinámicamente -->
              </tbody>
              <tfoot>
                <tr style="background:#F8FAFC; font-weight:700; border-top: 2px solid var(--border-color);">
                  <td colspan="2" style="text-align:right;">Suma Totales:</td>
                  <td style="text-align:right; color:var(--primary);" id="asiento-total-debe">Bs. 0,00</td>
                  <td style="text-align:right; color:var(--danger);" id="asiento-total-haber">Bs. 0,00</td>
                  <td></td>
                </tr>
                <tr style="background:#F1F5F9; font-weight:700;">
                  <td colspan="2" style="text-align:right;">Diferencia de Balance:</td>
                  <td colspan="2" style="text-align:center; font-size:14px;" id="asiento-total-diff">Bs. 0,00</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <!-- Banners de Validación Contable -->
            <div id="asiento-validation-box" class="balance-alert-box balance-alert-danger">
              <i class="fas fa-triangle-exclamation" style="font-size:18px;"></i>
              <span>El asiento no se puede guardar. Debe tener al menos dos líneas y la diferencia debe ser Bs. 0,00.</span>
            </div>

            <div class="form-actions" style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; border-top:1px solid var(--border-color); padding-top:20px;">
              <a href="#/contabilidad" class="btn btn-secondary">Cancelar</a>
              <button type="submit" class="btn btn-primary" id="btn-submit-asiento" disabled><i class="fas fa-check"></i> Registrar Asiento</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const tbody = document.getElementById('asiento-lines-tbody');
    const btnAdd = document.getElementById('btn-add-asiento-row');
    const dateInput = document.getElementById('as-date');
    const refInput = document.getElementById('as-ref');

    // Inicializar inputs
    dateInput.valueAsDate = new Date();
    
    // Autogenerar Referencia
    const odCount = db.contabilidad.diario.filter(item => item.ref.startsWith('OD')).length;
    refInput.value = `OD2606-${String(Math.floor(odCount/2) + 1).padStart(3, '0')}`;

    // Plan de Cuentas options helper
    const getAccountsOptions = () => {
      return this.CHART_OF_ACCOUNTS.map(a => `
        <option value="${a.code} - ${a.name}">${a.code} - ${a.name}</option>
      `).join('');
    };

    // Función para añadir fila
    let rowIndex = 0;
    const addRow = () => {
      const tr = document.createElement('tr');
      tr.className = 'asiento-line-row';
      tr.dataset.index = rowIndex;
      tr.innerHTML = `
        <td>
          <select class="asiento-input line-account" required>
            <option value="">-- Elija Cuenta --</option>
            ${getAccountsOptions()}
          </select>
        </td>
        <td>
          <input type="text" class="asiento-input line-desc" placeholder="Opcional glosa de línea">
        </td>
        <td>
          <input type="number" step="0.01" min="0" class="asiento-input line-debit text-right" placeholder="0.00" style="text-align:right;">
        </td>
        <td>
          <input type="number" step="0.01" min="0" class="asiento-input line-credit text-right" placeholder="0.00" style="text-align:right;">
        </td>
        <td style="text-align:center;">
          <button type="button" class="asiento-btn-remove"><i class="fas fa-trash-can"></i></button>
        </td>
      `;
      tbody.appendChild(tr);

      // Eventos de cambios en Debe / Haber (Exclusividad mutua simple)
      const debitInp = tr.querySelector('.line-debit');
      const creditInp = tr.querySelector('.line-credit');

      debitInp.addEventListener('input', () => {
        if (parseFloat(debitInp.value) > 0) {
          creditInp.value = '';
        }
        recalcBalance();
      });
      creditInp.addEventListener('input', () => {
        if (parseFloat(creditInp.value) > 0) {
          debitInp.value = '';
        }
        recalcBalance();
      });

      // Botón remover
      tr.querySelector('.asiento-btn-remove').addEventListener('click', () => {
        tr.remove();
        recalcBalance();
      });

      rowIndex++;
      recalcBalance();
    };

    // Iniciar con 2 líneas
    addRow();
    addRow();

    // Sumar y cuadrar balance
    const recalcBalance = () => {
      const rows = document.querySelectorAll('.asiento-line-row');
      let totalD = 0;
      let totalH = 0;

      rows.forEach(row => {
        const d = parseFloat(row.querySelector('.line-debit').value) || 0;
        const h = parseFloat(row.querySelector('.line-credit').value) || 0;
        totalD += d;
        totalH += h;
      });

      document.getElementById('asiento-total-debe').textContent = window.DolibarrUtils.formatCurrency(totalD);
      document.getElementById('asiento-total-haber').textContent = window.DolibarrUtils.formatCurrency(totalH);

      const diff = Math.abs(totalD - totalH);
      const diffCell = document.getElementById('asiento-total-diff');
      diffCell.textContent = window.DolibarrUtils.formatCurrency(diff);

      const alertBox = document.getElementById('asiento-validation-box');
      const submitBtn = document.getElementById('btn-submit-asiento');

      const isBalanced = diff < 0.01 && totalD > 0;
      const hasEnoughLines = rows.length >= 2;

      if (isBalanced && hasEnoughLines) {
        alertBox.className = 'balance-alert-box balance-alert-success';
        alertBox.innerHTML = `<i class="fas fa-check-circle" style="font-size:18px;"></i> <span>¡El asiento está perfectamente cuadrado! Listo para registrar.</span>`;
        diffCell.style.color = 'var(--success)';
        submitBtn.removeAttribute('disabled');
      } else {
        alertBox.className = 'balance-alert-box balance-alert-danger';
        diffCell.style.color = 'var(--danger)';
        submitBtn.setAttribute('disabled', 'true');

        if (!hasEnoughLines) {
          alertBox.innerHTML = `<i class="fas fa-triangle-exclamation" style="font-size:18px;"></i> <span>El asiento requiere al menos 2 líneas contables.</span>`;
        } else if (totalD === 0) {
          alertBox.innerHTML = `<i class="fas fa-triangle-exclamation" style="font-size:18px;"></i> <span>Debe ingresar valores mayores a cero en el asiento.</span>`;
        } else {
          alertBox.innerHTML = `<i class="fas fa-triangle-exclamation" style="font-size:18px;"></i> <span>Asiento descuadrado. Diferencia de: <strong>${window.DolibarrUtils.formatCurrency(diff)}</strong></span>`;
        }
      }
    };

    btnAdd.addEventListener('click', addRow);

    // Envío del Asiento Contable
    const form = document.getElementById('form-nuevo-asiento-manual');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const rows = document.querySelectorAll('.asiento-line-row');
      const dateVal = dateInput.value;
      const refVal = refInput.value;
      const descVal = document.getElementById('as-desc').value;

      rows.forEach(row => {
        const account = row.querySelector('.line-account').value;
        const lineDesc = row.querySelector('.line-desc').value || descVal;
        const debit = parseFloat(row.querySelector('.line-debit').value) || 0;
        const credit = parseFloat(row.querySelector('.line-credit').value) || 0;

        if (debit > 0 || credit > 0) {
          const newEntry = {
            id: window.DolibarrUtils.generateId(db.contabilidad.diario),
            date: dateVal,
            ref: refVal,
            desc: lineDesc,
            account: account,
            debit: debit,
            credit: credit,
            journal: "OD"
          };
          db.contabilidad.diario.push(newEntry);
        }
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Asiento manual OD registrado y guardado con éxito.", "success");
      
      // Redirigir al libro mayor
      window.location.hash = '#/contabilidad/libro-mayor';
    });
  },

  /**
   * Vista: Enlace a Contabilidad (Contabilización automática de facturas y gastos)
   */
  renderEnlaceContabilidad: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/contabilidad">Contabilidad</a> <i class="fas fa-chevron-right"></i> <strong>Enlace Contable</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-link"></i> Enlace e Integración Contable de Documentos</h1>
      </div>

      <!-- Pestañas internas -->
      <div class="enlace-tabs">
        <div class="enlace-tab-item active" data-target="clientes"><i class="fas fa-file-invoice"></i> Facturas a Clientes</div>
        <div class="enlace-tab-item" data-target="proveedores"><i class="fas fa-shopping-bag"></i> Facturas de Proveedores</div>
        <div class="enlace-tab-item" data-target="gastos"><i class="fas fa-wallet"></i> Gastos de Colaboradores</div>
      </div>

      <!-- Contenedores de Tablas -->
      <div id="enlace-content-container">
        <!-- Dinámico según pestaña -->
      </div>
    `;

    const contentContainer = document.getElementById('enlace-content-container');

    const renderTabContent = (tabName) => {
      let html = '';
      if (tabName === 'clientes') {
        const pendingInvoices = db.financiera.facturas_cliente.filter(f => f.accounting_status !== 'posted');
        
        html = `
          <div class="card">
            <div class="card-header">
              <div class="card-title">Facturas emitidas pendientes de Integración Contable</div>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-striped table-hover" style="margin:0;">
                <thead>
                  <tr>
                    <th>Ref. Factura</th>
                    <th>Tercero Cliente</th>
                    <th>Fecha</th>
                    <th style="text-align:right;">Importe HT</th>
                    <th style="text-align:right;">Total TTC</th>
                    <th style="text-align:center;">Estado Comercial</th>
                    <th style="text-align:center;">Acción Contable</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingInvoices.length === 0 
                    ? `<tr><td colspan="7" class="text-center text-muted" style="padding:40px;">No hay facturas a clientes pendientes de contabilizar.</td></tr>`
                    : pendingInvoices.map(f => {
                      const cli = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido' };
                      return `
                        <tr>
                          <td><strong>${f.ref}</strong></td>
                          <td><span style="font-weight:600;">${cli.name}</span></td>
                          <td>${window.DolibarrUtils.formatDate(f.date)}</td>
                          <td style="text-align:right;">${window.DolibarrUtils.formatCurrency(f.total_ht)}</td>
                          <td style="text-align:right; font-weight:700;">${window.DolibarrUtils.formatCurrency(f.total_ttc)}</td>
                          <td style="text-align:center;">${window.DolibarrUtils.renderBadge(f.status)}</td>
                          <td style="text-align:center;">
                            <button class="btn btn-primary btn-sm btn-post-invoice" data-id="${f.id}">
                              <i class="fas fa-network-wired"></i> Contabilizar en Ventas
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } 
      else if (tabName === 'proveedores') {
        const pendingInvoicesProv = db.financiera.facturas_proveedor.filter(f => f.accounting_status !== 'posted');
        
        html = `
          <div class="card">
            <div class="card-header">
              <div class="card-title">Facturas de compras pendientes de Integración Contable</div>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-striped table-hover" style="margin:0;">
                <thead>
                  <tr>
                    <th>Ref. Proveedor</th>
                    <th>Tercero Proveedor</th>
                    <th>Fecha</th>
                    <th style="text-align:right;">Importe HT</th>
                    <th style="text-align:right;">Total TTC</th>
                    <th style="text-align:center;">Estado</th>
                    <th style="text-align:center;">Acción Contable</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingInvoicesProv.length === 0 
                    ? `<tr><td colspan="7" class="text-center text-muted" style="padding:40px;">No hay facturas de proveedores pendientes de contabilizar.</td></tr>`
                    : pendingInvoicesProv.map(f => {
                      const prov = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido' };
                      return `
                        <tr>
                          <td><strong>${f.ref}</strong></td>
                          <td><span style="font-weight:600;">${prov.name}</span></td>
                          <td>${window.DolibarrUtils.formatDate(f.date)}</td>
                          <td style="text-align:right;">${window.DolibarrUtils.formatCurrency(f.total_ht)}</td>
                          <td style="text-align:right; font-weight:700;">${window.DolibarrUtils.formatCurrency(f.total_ttc)}</td>
                          <td style="text-align:center;">${window.DolibarrUtils.renderBadge(f.status)}</td>
                          <td style="text-align:center;">
                            <button class="btn btn-primary btn-sm btn-post-prov-invoice" data-id="${f.id}">
                              <i class="fas fa-network-wired"></i> Contabilizar en Compras
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } 
      else if (tabName === 'gastos') {
        // Enlazar solo informes aprobados
        const pendingExpenses = db.rrhh.expenses.filter(e => e.status === 'Aprobado' && e.accounting_status !== 'posted');
        
        html = `
          <div class="card">
            <div class="card-header">
              <div class="card-title">Informes de Gastos aprobados pendientes de Integración Contable</div>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-striped table-hover" style="margin:0;">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Glosa / Concepto</th>
                    <th>Empleado</th>
                    <th style="text-align:right;">Monto (Bs)</th>
                    <th style="text-align:center;">Estado Gasto</th>
                    <th style="text-align:center;">Acción Contable</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingExpenses.length === 0 
                    ? `<tr><td colspan="6" class="text-center text-muted" style="padding:40px;">No hay informes de gastos aprobados pendientes de contabilizar.</td></tr>`
                    : pendingExpenses.map(exp => {
                      const emp = db.rrhh.employees.find(e => e.id === exp.employeeId) || { first_name: 'Desconocido', last_name: '' };
                      return `
                        <tr>
                          <td>${window.DolibarrUtils.formatDate(exp.date)}</td>
                          <td><strong>${exp.label}</strong></td>
                          <td>${emp.first_name} ${emp.last_name}</td>
                          <td style="text-align:right; font-weight:700;">${window.DolibarrUtils.formatCurrency(exp.amount_bs)}</td>
                          <td style="text-align:center;">${window.DolibarrUtils.renderBadge(exp.status)}</td>
                          <td style="text-align:center;">
                            <button class="btn btn-primary btn-sm btn-post-expense" data-id="${exp.id}">
                              <i class="fas fa-network-wired"></i> Contabilizar Gasto
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      contentContainer.innerHTML = html;

      // 4. Registrar listeners de contabilización
      
      // Contabilizar Factura de Cliente
      document.querySelectorAll('.btn-post-invoice').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          const f = db.financiera.facturas_cliente.find(inv => inv.id === id);
          if (f) {
            const cli = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido' };
            const tax = f.total_ttc - f.total_ht;
            const itGasto = f.total_ttc * 0.03;

            // Generar partida de asientos contables (Doble Entrada)
            // 1. Debit Clientes (TTC)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: f.date, ref: f.ref, desc: `Enlace contable venta ${cli.name}`,
              account: "120000 - Clientes (Cuentas por Cobrar)", debit: f.total_ttc, credit: 0, journal: "Ventas"
            });
            // 2. Debit Gasto IT (3%)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: f.date, ref: f.ref, desc: `Impuesto a las Transacciones 3% - ${f.ref}`,
              account: "501020 - Impuesto a las Transacciones (IT)", debit: itGasto, credit: 0, journal: "Ventas"
            });
            // 3. Credit Ventas de Productos (HT)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: f.date, ref: f.ref, desc: `Venta neta ${f.ref}`,
              account: "400000 - Ventas de Productos", debit: 0, credit: f.total_ht, journal: "Ventas"
            });
            // 4. Credit Débito Fiscal IVA (13%)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: f.date, ref: f.ref, desc: `Débito Fiscal IVA 13% - ${f.ref}`,
              account: "213010 - Débito Fiscal IVA", debit: 0, credit: tax, journal: "Ventas"
            });
            // 5. Credit IT por Pagar (3%)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: f.date, ref: f.ref, desc: `Provisión pasivo IT 3% - ${f.ref}`,
              account: "213020 - IT por Pagar", debit: 0, credit: itGasto, journal: "Ventas"
            });

            // Cambiar estado a Contabilizado
            f.accounting_status = 'posted';
            window.DolibarrDB.save(db);
            window.DolibarrUtils.showToast(`Factura ${f.ref} contabilizada y enlazada al Libro de Ventas.`, "success");
            renderTabContent(tabName);
          }
        });
      });

      // Contabilizar Factura de Proveedor
      document.querySelectorAll('.btn-post-prov-invoice').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          const f = db.financiera.facturas_proveedor.find(inv => inv.id === id);
          if (f) {
            const prov = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido' };
            const tax = f.total_ttc - f.total_ht;

            // 1. Debit Gasto compra (HT)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: f.date, ref: f.ref, desc: `Compra / Gasto neto ${prov.name}`,
              account: "501000 - Gastos de Administración (Servicios / Compras)", debit: f.total_ht, credit: 0, journal: "Compras"
            });
            // 2. Debit Crédito Fiscal IVA (13%)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: f.date, ref: f.ref, desc: `Crédito Fiscal IVA 13% - ${f.ref}`,
              account: "113010 - Crédito Fiscal IVA", debit: tax, credit: 0, journal: "Compras"
            });
            // 3. Credit Proveedores (TTC)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: f.date, ref: f.ref, desc: `Obligación comercial proveedor - ${f.ref}`,
              account: "211000 - Proveedores (Cuentas por Pagar)", debit: 0, credit: f.total_ttc, journal: "Compras"
            });

            f.accounting_status = 'posted';
            window.DolibarrDB.save(db);
            window.DolibarrUtils.showToast(`Factura de proveedor ${f.ref} enlazada al Libro de Compras.`, "success");
            renderTabContent(tabName);
          }
        });
      });

      // Contabilizar Gasto
      document.querySelectorAll('.btn-post-expense').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          const exp = db.rrhh.expenses.find(e => e.id === id);
          if (exp) {
            const emp = db.rrhh.employees.find(e => e.id === exp.employeeId) || { first_name: 'Desconocido', last_name: '' };
            
            // 1. Debit Gasto (100%)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: exp.date, ref: `EXP-${exp.id}`, desc: `Gasto de caja reembolsado: ${exp.label}`,
              account: "501000 - Gastos de Administración (Servicios / Compras)", debit: exp.amount_bs, credit: 0, journal: "Gastos"
            });
            // 2. Credit Caja Chica (100%)
            db.contabilidad.diario.push({
              id: window.DolibarrUtils.generateId(db.contabilidad.diario),
              date: exp.date, ref: `EXP-${exp.id}`, desc: `Reembolso gastos caja chica a ${emp.first_name}`,
              account: "111300 - Caja Chica Central", debit: 0, credit: exp.amount_bs, journal: "Gastos"
            });

            exp.accounting_status = 'posted';
            window.DolibarrDB.save(db);
            window.DolibarrUtils.showToast(`Informe de gasto EXP-${exp.id} de ${emp.first_name} contabilizado en el diario.`, "success");
            renderTabContent(tabName);
          }
        });
      });
    };

    // Agregar eventos a las pestañas de Enlace
    document.querySelectorAll('.enlace-tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.enlace-tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const target = tab.dataset.target;
        renderTabContent(target);
      });
    });

    // Carga inicial de la pestaña Clientes
    renderTabContent('clientes');
  },

  /**
   * Vista: Herramienta de Exportación Contable
   */
  renderExportar: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/contabilidad">Contabilidad</a> <i class="fas fa-chevron-right"></i> <strong>Exportación</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-download"></i> Exportar Documentos Contables</h1>
      </div>

      <div class="card" style="max-width: 600px; margin: 0 auto;">
        <div class="card-header">
          <div class="card-title">Configuración del Archivo de Exportación</div>
        </div>
        <div class="card-body">
          <form id="form-exportar-contable">
            <div class="form-group">
              <label class="form-label" for="exp-journal">Diario Contable a Exportar</label>
              <select id="exp-journal" class="form-control">
                <option value="todos">Todos los Diarios (Diario General)</option>
                <option value="Ventas">Diario de Ventas</option>
                <option value="Compras">Diario de Compras</option>
                <option value="Bancos">Diario de Bancos / Cajas</option>
                <option value="Gastos">Diario de Gastos</option>
                <option value="OD">Diario de Operaciones Diversas (OD)</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="exp-start">Fecha Desde</label>
                <input type="date" id="exp-start" class="form-control" value="2026-05-01">
              </div>
              <div class="form-group">
                <label class="form-label" for="exp-end">Fecha Hasta</label>
                <input type="date" id="exp-end" class="form-control" value="2026-06-30">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="exp-format">Formato de Exportación Contable</label>
              <select id="exp-format" class="form-control">
                <option value="TXT">TXT - Formato de Importación General</option>
                <option value="CSV">CSV - Delimitado por comas</option>
                <option value="XLS">Excel (XLSX) - Reporte de Auditoría</option>
              </select>
            </div>

            <div class="form-actions" style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
              <a href="#/contabilidad" class="btn btn-secondary">Cancelar</a>
              <button type="submit" class="btn btn-primary"><i class="fas fa-file-export"></i> Generar Archivo</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = document.getElementById('form-exportar-contable');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const journal = document.getElementById('exp-journal').value;
      const format = document.getElementById('exp-format').value;
      
      const fileName = `Export_Contabilidad_${journal}_2026.${format.toLowerCase()}`;
      
      const newFile = {
        id: window.DolibarrUtils.generateId(db.documentos),
        name: fileName,
        type: format.toLowerCase(),
        path: '/Contratos',
        size: 28000,
        date: new Date().toISOString().split('T')[0]
      };
      db.documentos.push(newFile);
      window.DolibarrDB.save(db);

      window.DolibarrUtils.showToast(`Archivo "${fileName}" generado y exportado con éxito a SGD.`, "success");
      
      // Redirigir a SGD
      window.location.hash = '#/documentos';
    });
  }
};
window.DolibarrModules.contabilidad = window.DolibarrModules.contabilidad;
