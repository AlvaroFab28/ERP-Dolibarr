/**
 * bancos.js - Módulo de Bancos y Cajas
 * Prototipo Dolibarr ERP v23.0.1
 * Localizado y Mejorado para DIASA S.A.
 */

window.DolibarrModules.bancos = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Inicializar base de datos de bancos
    this.initBancosDB();
    
    if (params && params.id) {
      this.renderDetail(mainContent, parseInt(params.id));
      return;
    }

    switch (subRoute) {
      case 'nueva':
        this.renderNewAccountForm(mainContent);
        break;
      case 'registros':
        this.renderBankRecords(mainContent);
        break;
      case 'transferencia':
        this.renderInternalTransferForm(mainContent);
        break;
      case 'domiciliaciones':
        this.renderDirectDebitsDashboard(mainContent);
        break;
      case 'transferencias-prov':
        this.renderProviderTransfersDashboard(mainContent);
        break;
      case 'depositos':
        this.renderDepositsDashboard(mainContent);
        break;
      case 'efectivo-lista':
        this.renderCashControlList(mainContent);
        break;
      default:
        this.renderList(mainContent);
        break;
    }
  },

  /**
   * Inicializa las colecciones de base de datos bancarias si no existen
   */
  initBancosDB: function() {
    const db = window.DolibarrDB.get();
    let updated = false;

    if (!db.bancosRegistros) {
      db.bancosRegistros = [
        { id: 7226, desc: "Cobro a cliente YPFB", date: "2026-06-03", chequeNo: "CHK2606-0001", client: "YPFB Corporación S.A.", bank: "BNB", debit: 0, credit: 59500.00, reconciled: "No" },
        { id: 7221, desc: "Cobro a cliente CBN", date: "2026-05-13", chequeNo: "CHK2605-0012", client: "Cervecería Boliviana Nacional S.A.", bank: "BNB", debit: 0, credit: 2000.00, reconciled: "No" },
        { id: 7322, desc: "Devolución material importado", date: "2026-05-13", chequeNo: "CHK2605-0013", client: "Minera San Cristóbal S.A.", bank: "BMSC", debit: 300.00, credit: 0, reconciled: "No" },
        { id: 7319, desc: "BGA - Reposición de Caja Chica", date: "2026-06-03", chequeNo: "-", client: "Caja Chica Central", bank: "Caja Fuerte", debit: 500.00, credit: 0, reconciled: "No" },
        { id: 7291, desc: "Cobro a cliente ENTEL", date: "2026-05-20", chequeNo: "-", client: "ENTEL S.A.", bank: "BNB", debit: 0, credit: 624.12, reconciled: "No" },
        { id: 7320, desc: "Pago de donación corporativa", date: "2026-06-03", chequeNo: "CHK2606-0002", client: "Catedral La Paz", bank: "BNB", debit: 420.00, credit: 0, reconciled: "No" }
      ];
      updated = true;
    }

    if (!db.domiciliaciones) {
      db.domiciliaciones = [
        { id: "T240901", date: "2026-06-01 12:35", amount: 63.72, status: "Procesado" },
        { id: "T240601", date: "2026-05-28 07:22", amount: 531.60, status: "Procesado" },
        { id: "T240502", date: "2026-05-25 09:06", amount: 1365.57, status: "Procesado" }
      ];
      updated = true;
    }

    if (!db.transferenciasProv) {
      db.transferenciasProv = [
        { id: "T240902", date: "2026-06-02 15:30", amount: 17.02, status: "Procesado" },
        { id: "T240201", date: "2026-05-20 05:10", amount: 8896.00, status: "Pendiente" },
        { id: "T240102", date: "2026-05-22 15:44", amount: 42354.00, status: "Pendiente" }
      ];
      updated = true;
    }

    if (!db.depositos) {
      db.depositos = [
        { ref: "CHK2601-0088", date: "2026-05-29", bank: "Banco Nacional de Bolivia (BNB)", chequeCount: 11, amount: 1820934.78, status: "Depositado" }
      ];
      updated = true;
    }

    if (!db.efectivoPOS) {
      db.efectivoPOS = [
        { id: 288, ref: "288", module: "takepos", terminal: 1, opening: 1149.84, cash: 0, cheque: 0, card: 0, year: 2026, month: 6, day: 3, status: "Borrador" },
        { id: 287, ref: "287", module: "takepos", terminal: 1, opening: 1149.84, cash: 0, cheque: 0, card: 0, year: 2026, month: 6, day: 2, status: "Borrador" },
        { id: 286, ref: "286", module: "takepos", terminal: 1, opening: 1149.84, cash: 1500.00, cheque: 100.00, card: 20.00, year: 2026, month: 5, day: 28, status: "Cerrado" }
      ];
      updated = true;
    }

    if (updated) {
      window.DolibarrDB.save(db);
    }
  },

  /**
   * Vista 1: Listado de Cuentas Bancarias y Cajas
   */
  renderList: function(container) {
    const db = window.DolibarrDB.get();
    
    let totalBs = 0;
    let totalUSD = 0;
    let consolidadoBs = 0;

    db.bancos.forEach(c => {
      if (c.currency === 'USD') {
        totalUSD += c.balance;
        consolidadoBs += c.balance * 6.96;
      } else {
        totalBs += c.balance;
        consolidadoBs += c.balance;
      }
    });

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Cuentas</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-university"></i> Cuentas Bancarias y Cajas</h1>
        <a href="#/bancos/nueva" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Cuenta / Caja
        </a>
      </div>

      <!-- Resumen de Liquidez -->
      <div class="widget-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
        <div class="widget-box wb-success" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-money-bill-wave"></i></div>
          <div class="wb-details">
            <div class="wb-count">${window.DolibarrUtils.formatCurrency(totalBs, 'Bs')}</div>
            <div class="wb-label">Liquidez en Bolivianos (Bs)</div>
          </div>
        </div>

        <div class="widget-box wb-info" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-dollar-sign"></i></div>
          <div class="wb-details">
            <div class="wb-count">${window.DolibarrUtils.formatCurrency(totalUSD, '$us')}</div>
            <div class="wb-label">Liquidez en Dólares ($us)</div>
          </div>
        </div>

        <div class="widget-box wb-primary" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-coins"></i></div>
          <div class="wb-details">
            <div class="wb-count">${window.DolibarrUtils.formatCurrency(consolidatedBs = totalBs + (totalUSD * 6.96), 'Bs')}</div>
            <div class="wb-label">Liquidez Consolidada (Bs)</div>
          </div>
        </div>
      </div>

      <!-- Tabla de Cuentas -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-list-check"></i> Cuentas Financieras Registradas (${db.bancos.length})</div>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de la Cuenta / Banco</th>
                <th>Tipo de Cuenta</th>
                <th>Número de Cuenta</th>
                <th style="text-align: center;">Divisa</th>
                <th style="text-align: right;">Saldo Actual</th>
                <th style="text-align: center; width:140px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${db.bancos.map(c => {
                let typeLabel = 'Corriente';
                if (c.type === 'ahorros') typeLabel = 'Caja de Ahorros';
                if (c.type === 'efectivo') typeLabel = 'Efectivo / Caja Chica';

                return `
                  <tr>
                    <td><code>CTA-${c.id}</code></td>
                    <td><strong>${c.label}</strong><br><small class="text-muted">${c.bank_name}</small></td>
                    <td><span class="text-muted">${typeLabel}</span></td>
                    <td><code>${c.number}</code></td>
                    <td style="text-align: center;"><span class="badge ${c.currency === 'Bs' ? 'badge-primary' : 'badge-warning'}">${c.currency}</span></td>
                    <td style="text-align: right; font-weight:700;">${window.DolibarrUtils.formatCurrency(c.balance, c.currency === 'Bs' ? 'Bs' : '$us')}</td>
                    <td style="text-align: center;">
                      <a href="#/bancos?id=${c.id}" class="btn btn-secondary btn-sm" style="padding:3px 8px; font-size:11px;">
                        <i class="fas fa-search-dollar"></i> Ver Transacciones
                      </a>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Vista 2: Formulario Completo de Nueva Cuenta (Réplica de Captura 1)
   */
  renderNewAccountForm: function(container) {
    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Nueva Cuenta</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-plus-circle"></i> Registrar Nueva Cuenta Financiera o Caja</h1>
      </div>

      <div class="card">
        <div class="card-body">
          <form id="form-nueva-cuenta-full" onsubmit="return false;">
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="b-ref">Ref. de la Cuenta (Código Único) *</label>
                <input type="text" id="b-ref" class="form-control" placeholder="Ej. BCP-BO-RECAUDADORA" required>
              </div>
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="b-label">Etiqueta cuenta o caja *</label>
                <input type="text" id="b-label" class="form-control" placeholder="Ej. BCP Recaudadora Bolivianos" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="b-type">Tipo de cuenta *</label>
                <select id="b-type" class="form-control" required>
                  <option value="corriente">Cuenta corriente, cheque o tarjeta de crédito</option>
                  <option value="ahorros">Cuenta de ahorros</option>
                  <option value="efectivo">Caja / Efectivo (Caja Chica)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="b-currency">Divisa *</label>
                <select id="b-currency" class="form-control" required>
                  <option value="Bs" selected>Bolivianos (Bs)</option>
                  <option value="USD">Euros (€) o Dólares ($us)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="b-state">Estado</label>
                <select id="b-state" class="form-control">
                  <option value="Abierto" selected>Abierto</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="b-pais">País de la cuenta</label>
                <select id="b-pais" class="form-control">
                  <option value="Bolivia" selected>Bolivia (BO)</option>
                  <option value="Argentina">Argentina (AR)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="b-provincia">Provincia / Departamento</label>
                <select id="b-provincia" class="form-control">
                  <option value="La Paz" selected>La Paz</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="b-address">Domiciliación de la cuenta (Dirección del banco)</label>
              <textarea id="b-address" class="form-control" rows="2" placeholder="Ej. Calle Colón Esq. Mercado, Edificio BCP Central, La Paz"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="b-web">Dirección Web de la Entidad</label>
                <input type="text" id="b-web" class="form-control" placeholder="https://www.bcp.com.bo">
              </div>
              <div class="form-group">
                <label class="form-label" for="b-tags">Etiquetas / Categorías</label>
                <input type="text" id="b-tags" class="form-control" placeholder="Cta Corriente, BNB">
              </div>
            </div>

            <!-- Editor Comentario Simplificado -->
            <div class="form-group">
              <label class="form-label" for="b-comment">Comentario o notas de la cuenta</label>
              <textarea id="b-comment" class="form-control" rows="3" placeholder="Notas sobre límites de transferencia, cobros de comisión mensual, etc."></textarea>
            </div>

            <div style="border-top:1px solid var(--border-color); margin: 20px 0; padding-top: 20px;">
              <h3 style="font-size: 14px; font-weight:700; color:var(--dark); margin-bottom:14px;"><i class="fas fa-coins text-muted"></i> Datos Financieros y Saldo de Apertura</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="b-balance">Saldo Inicial / Apertura *</label>
                <input type="number" step="0.01" id="b-balance" class="form-control" value="0.00" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="b-date">Fecha de Apertura</label>
                <input type="date" id="b-date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="b-min-auth">Saldo mínimo autorizado (Sobregiro)</label>
                <input type="number" id="b-min-auth" class="form-control" value="0.00">
              </div>
              <div class="form-group">
                <label class="form-label" for="b-min-des">Saldo mínimo deseado (Alerta de Fondos)</label>
                <input type="number" id="b-min-des" class="form-control" value="5000.00">
              </div>
            </div>

            <div style="border-top:1px solid var(--border-color); margin: 20px 0; padding-top: 20px;">
              <h3 style="font-size: 14px; font-weight:700; color:var(--dark); margin-bottom:14px;"><i class="fas fa-credit-card text-muted"></i> Coordenadas Bancarias e Identificadores Internacionales</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="b-name">Nombre del banco *</label>
                <input type="text" id="b-name" class="form-control" placeholder="Ej. Banco de Crédito de Bolivia" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="b-ifsc">Código del Banco (IFSC / ABA)</label>
                <input type="text" id="b-ifsc" class="form-control" placeholder="Ej. BCPBO">
              </div>
              <div class="form-group">
                <label class="form-label" for="b-swift">Código SWIFT</label>
                <input type="text" id="b-swift" class="form-control" placeholder="Ej. BCPBOB22">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="b-number">Número de Cuenta Bancaria *</label>
                <input type="text" id="b-number" class="form-control" placeholder="Ej. 301-50821942-3-02" required>
              </div>
              <div class="form-group" style="flex:2;">
                <label class="form-label" for="b-titular">Nombre del titular de la cuenta *</label>
                <input type="text" id="b-titular" class="form-control" value="DIASA S.A." required>
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:16px; margin-top:28px;">
              <button class="btn btn-secondary" id="btn-cancel-cuenta-full" type="button">ANULAR</button>
              <button class="btn btn-primary" id="btn-submit-cuenta-full" type="submit">CREAR CUENTA</button>
            </div>

          </form>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('btn-cancel-cuenta-full').addEventListener('click', () => {
      window.location.hash = '#/bancos';
    });

    document.getElementById('btn-submit-cuenta-full').addEventListener('click', () => {
      const label = document.getElementById('b-label').value.trim();
      const bank_name = document.getElementById('b-name').value.trim();
      const number = document.getElementById('b-number').value.trim();
      const type = document.getElementById('b-type').value;
      const currency = document.getElementById('b-currency').value;
      const balance = parseFloat(document.getElementById('b-balance').value) || 0;

      if (!label || !bank_name || !number) {
        alert("Todos los campos marcados con (*) son obligatorios");
        return;
      }

      const db = window.DolibarrDB.get();
      db.bancos.push({
        id: window.DolibarrUtils.generateId(db.bancos),
        label: label,
        bank_name: bank_name,
        number: number,
        type: type,
        currency: currency,
        balance: balance
      });

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Cuenta bancaria "${label}" creada con éxito.`, "success");
      
      window.location.hash = '#/bancos';
    });
  },

  /**
   * Vista 3: Libro General de Registros Bancarios (Captura 2)
   */
  renderBankRecords: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Registros Bancarios</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-list-ol"></i> Registros Bancarios Consolidados</h1>
        <a href="#/bancos/transferencia" class="btn btn-secondary btn-sm">
          <i class="fas fa-exchange-alt"></i> Transferencia Interna
        </a>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-body" style="padding: 12px 20px;">
          <div class="filter-bar">
            <div class="filter-inputs">
              <input type="text" id="filter-search-record" class="form-control" placeholder="Buscar por concepto o tercero..." style="width:280px;">
              <select id="filter-bank-record" class="form-control" style="width: 200px;">
                <option value="todos">-- Todas las cuentas --</option>
                ${db.bancos.map(b => `<option value="${b.bank_name}">${b.label}</option>`).join('')}
              </select>
            </div>
            <div class="text-muted" style="font-size:12px;" id="count-records">
              Mostrando ${db.bancosRegistros.length} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Transacciones -->
      <div class="card">
        <div class="card-body" style="padding:0;">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID Reg.</th>
                <th>Concepto / Descripción</th>
                <th>Fecha Op.</th>
                <th>Cheque Nº</th>
                <th>Tercero / Destinatario</th>
                <th>Banco / Caja</th>
                <th style="text-align:right;">Debe (Salida)</th>
                <th style="text-align:right;">Haber (Ingreso)</th>
                <th style="text-align:center;">Reconciliado</th>
              </tr>
            </thead>
            <tbody id="tbody-records">
              <!-- Dinámico -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.populateRecordsTable(db.bancosRegistros);

    // Eventos
    const searchInput = document.getElementById('filter-search-record');
    const bankSelect = document.getElementById('filter-bank-record');

    const triggerFilter = () => {
      const q = searchInput.value.toLowerCase().trim();
      const bank = bankSelect.value;

      const filtered = db.bancosRegistros.filter(r => {
        const matchesSearch = r.desc.toLowerCase().includes(q) || r.client.toLowerCase().includes(q);
        const matchesBank = (bank === 'todos') || r.bank.includes(bank);
        return matchesSearch && matchesBank;
      });

      this.populateRecordsTable(filtered);
    };

    searchInput.addEventListener('input', triggerFilter);
    bankSelect.addEventListener('change', triggerFilter);
  },

  populateRecordsTable: function(list) {
    const tbody = document.getElementById('tbody-records');
    const label = document.getElementById('count-records');
    if (!tbody) return;

    label.textContent = `Mostrando ${list.length} registros`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-muted" style="padding:30px;">
            <i class="fas fa-search" style="font-size:24px; margin-bottom:8px; display:block;"></i>
            No se encontraron transacciones.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(r => `
      <tr>
        <td><code>#${r.id}</code></td>
        <td><strong>${r.desc}</strong></td>
        <td>${r.date}</td>
        <td><code>${r.chequeNo}</code></td>
        <td>${r.client}</td>
        <td><span class="badge badge-secondary">${r.bank}</span></td>
        <td style="text-align:right; font-weight:600; color:var(--danger);">${r.debit > 0 ? `${r.debit.toFixed(2)} Bs` : '-'}</td>
        <td style="text-align:right; font-weight:600; color:var(--success);">${r.credit > 0 ? `${r.credit.toFixed(2)} Bs` : '-'}</td>
        <td style="text-align:center;">
          <span class="badge ${r.reconciled === 'Sí' ? 'badge-success' : 'badge-secondary'}">${r.reconciled}</span>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Vista 4: Transferencia Interna (Captura 3)
   */
  renderInternalTransferForm: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Transferencia Interna</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-exchange-alt"></i> Transferencia Interna de Fondos</h1>
      </div>

      <p class="text-muted" style="margin-bottom: 20px; font-size:12.5px;">
        Utilice la transferencia interna para transferir dinero de una cuenta a otra. La aplicación escribirá dos registros en la base de datos: uno de débito (salida) en la cuenta de origen y uno de crédito (entrada) en la cuenta de destino.
      </p>

      <div class="card">
        <div class="card-body">
          <form id="form-transferencia-interna" onsubmit="return false;">
            
            <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap; justify-content:space-between;">
              <div class="form-group" style="flex:1; min-width:200px;">
                <label class="form-label" for="t-from">Cuenta de Origen (De) *</label>
                <select id="t-from" class="form-control" required>
                  <option value="">-- Seleccionar origen --</option>
                  ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.balance.toFixed(2)} ${b.currency})</option>`).join('')}
                </select>
              </div>

              <div style="font-size:20px; color:var(--primary); padding-top:12px;"><i class="fas fa-arrow-right"></i></div>

              <div class="form-group" style="flex:1; min-width:200px;">
                <label class="form-label" for="t-to">Cuenta de Destino (Hacia) *</label>
                <select id="t-to" class="form-control" required>
                  <option value="">-- Seleccionar destino --</option>
                  ${db.bancos.map(b => `<option value="${b.id}">${b.label} (Saldo: ${b.balance.toFixed(2)} ${b.currency})</option>`).join('')}
                </select>
              </div>

              <div class="form-group" style="width:140px;">
                <label class="form-label" for="t-date">Fecha Valor</label>
                <input type="date" id="t-date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
              </div>

              <div class="form-group" style="flex:1.2; min-width:180px;">
                <label class="form-label" for="t-desc">Descripción / Concepto *</label>
                <input type="text" id="t-desc" class="form-control" value="Traspaso interno de liquidez" required>
              </div>

              <div class="form-group" style="width:130px;">
                <label class="form-label" for="t-amount">Importe *</label>
                <input type="number" step="0.01" id="t-amount" class="form-control" placeholder="0.00" required>
              </div>
            </div>

            <div style="display:flex; justify-content:center; margin-top:20px;">
              <button class="btn btn-primary" id="btn-submit-transfer" style="padding:10px 24px;">
                <i class="fas fa-save"></i> GRABAR TRANSFERENCIA
              </button>
            </div>

          </form>
        </div>
      </div>
    `;

    // Evento
    document.getElementById('btn-submit-transfer').addEventListener('click', () => {
      const fromId = parseInt(document.getElementById('t-from').value);
      const toId = parseInt(document.getElementById('t-to').value);
      const desc = document.getElementById('t-desc').value.trim();
      const amount = parseFloat(document.getElementById('t-amount').value);
      const date = document.getElementById('t-date').value;

      if (!fromId || !toId || !desc || isNaN(amount) || amount <= 0) {
        alert("Todos los campos obligatorios (*)");
        return;
      }

      if (fromId === toId) {
        alert("La cuenta de origen y de destino no pueden ser la misma.");
        return;
      }

      const fromAccount = db.bancos.find(b => b.id === fromId);
      const toAccount = db.bancos.find(b => b.id === toId);

      if (fromAccount.balance < amount) {
        alert(`Fondos insuficientes en la cuenta de origen. Saldo actual: ${fromAccount.balance.toFixed(2)} ${fromAccount.currency}`);
        return;
      }

      // Modificar saldos
      fromAccount.balance -= amount;
      toAccount.balance += amount;

      // Escribir registros contables dobles
      const regId = Math.floor(Math.random() * 9000 + 7300);
      db.bancosRegistros.push(
        { id: regId, desc: `Traspaso (Salida): ${desc}`, date: date, chequeNo: "-", client: toAccount.label, bank: fromAccount.bank_name, debit: amount, credit: 0, reconciled: "No" },
        { id: regId + 1, desc: `Traspaso (Entrada): ${desc}`, date: date, chequeNo: "-", client: fromAccount.label, bank: toAccount.bank_name, debit: 0, credit: amount, reconciled: "No" }
      );

      // Asentar en diario
      const contId = window.DolibarrUtils.generateId(db.contabilidad.diario);
      db.contabilidad.diario.push(
        { id: contId, date: date, ref: `TR-INT-${regId}`, desc: `Traspaso: ${desc}`, account: "111000 - Cuentas Bancarias", debit: amount, credit: 0, journal: "Bancos" },
        { id: contId + 1, date: date, ref: `TR-INT-${regId}`, desc: `Traspaso: ${desc}`, account: "111000 - Cuentas Bancarias", debit: 0, credit: amount, journal: "Bancos" }
      );

      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Transferencia interna de fondos registrada con éxito.", "success");
      
      window.location.hash = '#/bancos';
    });
  },

  // ==========================================
  // VISTA 5: COBROS POR DOMICILIACIÓN (Captura 4)
  // ==========================================
  renderDirectDebitsDashboard: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Domiciliaciones</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice"></i> Gestión de Cobros por Domiciliación Bancaria</h1>
      </div>

      <div style="display:grid; grid-template-columns:2fr 1.1fr; gap:20px; align-items:start;">
        
        <!-- Bloque Izquierdo: Facturas en espera de domiciliación -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="background:#F8FAFC;">
              <div class="card-title"><i class="fas fa-clock text-warning"></i> Facturas en espera de domiciliación (Bolivia)</div>
              <button class="btn btn-primary btn-sm" id="btn-run-all-debits"><i class="fas fa-cog"></i> Ejecutar Cobros</button>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Ref. Factura</th>
                    <th>Tercero / Cliente</th>
                    <th style="text-align:right;">Importe</th>
                    <th>Fecha Venc.</th>
                    <th style="text-align:center;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${db.financiera.facturas_cliente.filter(f => f.status !== 'Pagado').map(f => {
                    const c = db.terceros.find(t => t.id === f.terceroId) || { name: 'Generic customer' };
                    return `
                      <tr>
                        <td><strong>${f.ref}</strong></td>
                        <td>${c.name}</td>
                        <td style="text-align:right; font-weight:700; color:var(--primary);">${f.total_ttc.toFixed(2)} Bs</td>
                        <td>${f.date_due}</td>
                        <td style="text-align:center;">
                          <span style="width:10px; height:10px; border-radius:50%; background:#F39C12; display:inline-block;" title="Pendiente de cobro"></span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Bloque Derecho: Resumen y Últimas Domiciliaciones -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- Estadísticas -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-body">
              <h3 style="font-size:13px; font-weight:700; margin-bottom:12px; text-transform:uppercase; color:var(--text-muted);">Estadísticas de Domiciliación</h3>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12.5px;">
                <span>Facturas pendientes:</span>
                <span class="badge badge-secondary" style="font-weight:700;">80</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12.5px; border-top:1px solid var(--border-color); padding-top:6px;">
                <span>Cantidad total a domiciliar:</span>
                <strong style="color:var(--success);">881.446,82 Bs</strong>
              </div>
            </div>
          </div>

          <!-- Últimas domiciliaciones -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-check-circle"></i> Últimas 5 domiciliaciones</div>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table">
                <tbody>
                  ${db.domiciliaciones.map(d => `
                    <tr>
                      <td><strong>${d.id}</strong></td>
                      <td><small class="text-muted">${d.date}</small></td>
                      <td style="text-align:right; font-weight:600; color:var(--success);">${d.amount.toFixed(2)} Bs</td>
                      <td style="text-align:center;">
                        <span style="width:10px; height:10px; border-radius:50%; background:#10B981; display:inline-block;"></span>
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

    // Evento ejecutar cobros
    document.getElementById('btn-run-all-debits').addEventListener('click', () => {
      window.DolibarrUtils.showToast("Iniciando conexión con cámara de compensación ACH Bolivia...", "info");
      setTimeout(() => {
        // Marcar facturas impagas como pagadas en la base de datos
        db.financiera.facturas_cliente.forEach(f => {
          if (f.status !== 'Pagado') {
            f.status = 'Pagado';
            // Agregar transacciones
            db.bancos[0].balance += f.total_ttc;
            db.domiciliaciones.unshift({
              id: `T${Math.floor(Math.random() * 900000 + 100000)}`,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              amount: f.total_ttc,
              status: "Procesado"
            });
          }
        });
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Compensación de domiciliación exitosa. Todas las cuentas cobradas.", "success");
        this.renderDirectDebitsDashboard(container);
      }, 1000);
    });
  },

  // ==========================================
  // VISTA 6: PAGOS POR TRANSFERENCIA PROVEEDORES (Captura 5)
  // ==========================================
  renderProviderTransfersDashboard: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Transferencias Proveedores</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-share-square"></i> Gestión de Órdenes de Transferencia Bancaria</h1>
      </div>

      <div style="display:grid; grid-template-columns:2fr 1.1fr; gap:20px; align-items:start;">
        
        <!-- Bloque Izquierdo: Facturas de proveedores pendientes de pago -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="background:#F8FAFC;">
              <div class="card-title"><i class="fas fa-file-contract text-muted"></i> Facturas de proveedor pendientes de transferencia (41)</div>
              <button class="btn btn-danger btn-sm" id="btn-run-transfers"><i class="fas fa-university"></i> Transferir a Proveedores</button>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Ref. Factura</th>
                    <th>Proveedor</th>
                    <th style="text-align:right;">Importe</th>
                    <th>Fecha Venc.</th>
                    <th style="text-align:center;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${db.financiera.facturas_proveedor.filter(f => f.status !== 'Pagado').map(f => {
                    const prov = db.terceros.find(t => t.id === f.terceroId) || { name: 'Generic Vendor' };
                    return `
                      <tr>
                        <td><strong>${f.ref}</strong></td>
                        <td>${prov.name}</td>
                        <td style="text-align:right; font-weight:700; color:var(--danger);">${f.total_ttc.toFixed(2)} Bs</td>
                        <td>${f.date_due}</td>
                        <td style="text-align:center;">
                          <span style="width:10px; height:10px; border-radius:50%; background:#EF4444; display:inline-block;" title="Pendiente de transferencia"></span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Bloque Derecho: Resumen e Historial de Transferencias -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <div class="card" style="margin-bottom:0;">
            <div class="card-body">
              <h3 style="font-size:13px; font-weight:700; margin-bottom:12px; text-transform:uppercase; color:var(--text-muted);">Estadísticas de Transferencias</h3>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12.5px;">
                <span>Órdenes pendientes:</span>
                <span class="badge badge-secondary" style="font-weight:700;">41</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12.5px; border-top:1px solid var(--border-color); padding-top:6px;">
                <span>Total liquidaciones:</span>
                <strong style="color:var(--danger);">379.840,28 Bs</strong>
              </div>
            </div>
          </div>

          <!-- Historial de órdenes -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-history text-muted"></i> Últimas 5 órdenes de transferencia</div>
            </div>
            <div class="card-body" style="padding:0;">
              <table class="table">
                <tbody>
                  ${db.transferenciasProv.map(t => `
                    <tr>
                      <td><strong>${t.id}</strong></td>
                      <td><small class="text-muted">${t.date}</small></td>
                      <td style="text-align:right; font-weight:600; color:${t.status === 'Procesado' ? 'var(--success)' : 'var(--warning)'};">${t.amount.toFixed(2)} Bs</td>
                      <td style="text-align:center;">
                        <span style="width:10px; height:10px; border-radius:50%; background:${t.status === 'Procesado' ? '#10B981' : '#F39C12'}; display:inline-block;"></span>
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

    // Evento ejecutar transferencias
    document.getElementById('btn-run-transfers').addEventListener('click', () => {
      window.DolibarrUtils.showToast("Conectando con plataforma de pagos BNB Net Corporativo...", "info");
      setTimeout(() => {
        db.financiera.facturas_proveedor.forEach(f => {
          if (f.status !== 'Pagado') {
            f.status = 'Pagado';
            db.bancos[0].balance -= f.total_ttc;
            db.transferenciasProv.unshift({
              id: `T${Math.floor(Math.random() * 900000 + 200000)}`,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              amount: f.total_ttc,
              status: "Procesado"
            });
          }
        });
        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Pago de transferencias a proveedores realizado con éxito.", "success");
        this.renderProviderTransfersDashboard(container);
      }, 1000);
    });
  },

  // ==========================================
  // VISTA 7: COMPROBANTES DE DEPÓSITO (Captura 6)
  // ==========================================
  renderDepositsDashboard: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Comprobantes Depósito</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-money-check"></i> Comprobantes de Depósito de Cheques</h1>
      </div>

      <div style="display:grid; grid-template-columns:1.2fr 2fr; gap:20px; align-items:start;">
        
        <!-- Bloque Izquierdo: Documentos para depositar -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-folder-open text-muted"></i> Documentos para depositar en el banco</div>
          </div>
          <div class="card-body">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#F8FAFC; border-radius:6px; border:1px solid var(--border-color);">
              <span style="font-weight:600;"><i class="fas fa-money-check text-muted mr-2"></i> Cheques en Cartera</span>
              <span class="badge badge-warning" style="font-size:12px;">11 cheques</span>
            </div>
            <button class="btn btn-primary" id="btn-make-deposit-slip" style="width:100%; margin-top:16px;">
              <i class="fas fa-file-invoice-dollar"></i> Crear Recibo de Depósito
            </button>
          </div>
        </div>

        <!-- Bloque Derecho: Últimos recibos de depósito -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-list text-muted"></i> Últimos 10 recibos de depósito en cuentas bancarias</div>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Fecha Depósito</th>
                  <th>Banco de Destino</th>
                  <th style="text-align:right;">Nº de cheques</th>
                  <th style="text-align:right;">Importe Depositado</th>
                </tr>
              </thead>
              <tbody>
                ${db.depositos.map(d => `
                  <tr>
                    <td><code>${d.ref}</code></td>
                    <td>${d.date}</td>
                    <td><span class="badge badge-primary">${d.bank}</span></td>
                    <td style="text-align:right; font-weight:600;">${d.chequeCount}</td>
                    <td style="text-align:right; font-weight:700; color:var(--success);">${d.amount.toLocaleString('es-BO', {minimumFractionDigits:2})} Bs</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Evento
    document.getElementById('btn-make-deposit-slip').addEventListener('click', () => {
      const dbInstance = window.DolibarrDB.get();
      const amount = 15000.00;
      
      dbInstance.depositos.unshift({
        ref: `CHK2606-00${dbInstance.depositos.length + 89}`,
        date: new Date().toISOString().split('T')[0],
        bank: "Banco Mercantil Santa Cruz (BMSC) USD",
        chequeCount: 2,
        amount: amount,
        status: "Depositado"
      });

      // Sumar al saldo de la cuenta Mercantil
      if (dbInstance.bancos[1]) {
        dbInstance.bancos[1].balance += (amount / 6.96); // USD
      }

      window.DolibarrDB.save(dbInstance);
      window.DolibarrUtils.showToast("Recibo de depósito bancario registrado. Saldo de cuenta acreditado.", "success");
      this.renderDepositsDashboard(container);
    });
  },

  // ==========================================
  // VISTA 8: CONTROL DE EFECTIVO POS (Captura 7)
  // ==========================================
  renderCashControlList: function(container) {
    const db = window.DolibarrDB.get();

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Control Efectivo POS</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-cash-register"></i> Control de Efectivo en Puntos de Venta (TakePOS)</h1>
        <button id="btn-nuevo-arqueo" class="btn btn-primary"><i class="fas fa-plus"></i> Nueva Apertura / Cierre</button>
      </div>

      <p class="text-muted" style="margin-bottom:20px; font-size:12.5px;">
        Esta vista registra los arqueos de caja y conciliaciones de efectivo realizadas en el módulo POS (Terminales de Venta).
      </p>

      <!-- Tabla Arqueos -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-list text-muted"></i> Registros de Caja Chica POS (${db.efectivoPOS.length})</div>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID Técnica</th>
                <th>Ref / Caja</th>
                <th>Módulo</th>
                <th style="text-align:center;">Terminal</th>
                <th style="text-align:right;">Saldo Inicial (Apertura)</th>
                <th style="text-align:right;">Efectivo Declarado</th>
                <th style="text-align:right;">Cheques</th>
                <th style="text-align:right;">Tarjetas</th>
                <th>Fecha Arqueo</th>
                <th style="text-align:center; width:100px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${db.efectivoPOS.map(e => `
                <tr>
                  <td><code>#${e.id}</code></td>
                  <td><strong>Caja ${e.ref}</strong></td>
                  <td><code>${e.module}</code></td>
                  <td style="text-align:center; font-weight:600;">${e.terminal}</td>
                  <td style="text-align:right; font-weight:600;">${e.opening.toFixed(2)} Bs</td>
                  <td style="text-align:right; font-weight:600; color:var(--success);">${e.cash.toFixed(2)} Bs</td>
                  <td style="text-align:right; font-weight:600;">${e.cheque.toFixed(2)} Bs</td>
                  <td style="text-align:right; font-weight:600;">${e.card.toFixed(2)} Bs</td>
                  <td>${e.day}/${e.month}/${e.year}</td>
                  <td style="text-align:center;">
                    <span class="badge ${e.status === 'Cerrado' ? 'badge-success' : 'badge-warning'}">
                      ${e.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Evento
    document.getElementById('btn-nuevo-arqueo').addEventListener('click', () => {
      const dbInstance = window.DolibarrDB.get();
      
      dbInstance.efectivoPOS.unshift({
        id: dbInstance.efectivoPOS.length + 288,
        ref: `${dbInstance.efectivoPOS.length + 288}`,
        module: "takepos",
        terminal: 1,
        opening: 500.00,
        cash: 1350.00,
        cheque: 0,
        card: 0,
        year: 2026,
        month: 6,
        day: 3,
        status: "Cerrado"
      });

      window.DolibarrDB.save(dbInstance);
      window.DolibarrUtils.showToast("Caja arqueada y cerrada en base de datos.", "success");
      this.renderCashControlList(container);
    });
  },

  /**
   * Vista: Detalles y Movimientos Conciliados de la Cuenta
   */
  renderDetail: function(container, accountId) {
    const db = window.DolibarrDB.get();
    const account = db.bancos.find(b => b.id === accountId);

    if (!account) {
      container.innerHTML = `<div class="card"><div class="card-body">Cuenta no encontrada.</div></div>`;
      return;
    }

    const payments = db.financiera.pagos.filter(p => {
      const method = p.method.toLowerCase();
      const bankLabel = account.bank_name.toLowerCase();
      const isCaja = account.type === 'efectivo' && method.includes('efectivo');
      return method.includes(bankLabel) || isCaja;
    });

    const baseDate = "2026-05-01";
    const mockTrans = [
      { id: 'INI', date: baseDate, desc: 'Apertura de Cuenta / Saldo Inicial', amount: account.balance - payments.reduce((sum, p) => p.type === 'cliente' ? sum + p.amount : sum - p.amount, 0), ref: '-' }
    ];

    const allTransactions = [...mockTrans];
    payments.forEach(p => {
      const isCliente = p.type === 'cliente';
      let localAmount = p.amount;
      if (account.currency === 'USD') {
        localAmount = p.amount / 6.96;
      }

      allTransactions.push({
        id: p.ref,
        date: p.date,
        desc: isCliente ? `Cobro Factura ${p.invoiceRef}` : `Pago Factura ${p.invoiceRef}`,
        amount: isCliente ? localAmount : -localAmount,
        ref: p.invoiceRef
      });
    });

    allTransactions.sort((a,b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Detalle de Cuenta</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice-dollar"></i> Extracto: ${account.label}</h1>
        <a href="#/bancos" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Volver a Cuentas
        </a>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; align-items: start;">
        
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-info-circle"></i> Ficha Bancaria</div>
          </div>
          <div class="card-body" style="padding: 0;">
            <table class="info-table">
              <tr>
                <td>Banco / Entidad:</td>
                <td><strong>${account.bank_name}</strong></td>
              </tr>
              <tr>
                <td>Número de Identificación:</td>
                <td><code>${account.number}</code></td>
              </tr>
              <tr>
                <td>Divisa de Trabajo:</td>
                <td>${account.currency === 'Bs' ? 'Boliviano (Bs)' : 'Dólar ($us)'}</td>
              </tr>
              <tr>
                <td>Saldo Actual de la Cuenta:</td>
                <td class="font-bold" style="color:var(--primary); font-size:15px; font-weight:700;">
                  ${window.DolibarrUtils.formatCurrency(account.balance, account.currency === 'Bs' ? 'Bs' : '$us')}
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-list-ol"></i> Libro de Movimientos y Conciliación</div>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>ID Transacción</th>
                  <th>Concepto / Descripción</th>
                  <th style="text-align: right;">Importe</th>
                </tr>
              </thead>
              <tbody>
                ${allTransactions.reverse().map(t => {
                  const isIngreso = t.amount >= 0;
                  return `
                    <tr>
                      <td>${window.DolibarrUtils.formatDate(t.date)}</td>
                      <td><code>${t.id}</code></td>
                      <td><strong>${t.desc}</strong></td>
                      <td style="text-align: right; font-weight:700; color: ${isIngreso ? 'var(--success)' : 'var(--danger)'};">
                        ${isIngreso ? '+' : ''}${window.DolibarrUtils.formatCurrency(t.amount, account.currency === 'Bs' ? 'Bs' : '$us')}
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
  }
};
