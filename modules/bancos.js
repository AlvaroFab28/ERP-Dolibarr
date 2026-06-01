/**
 * bancos.js - Módulo de Bancos y Cajas
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.bancos = {
  
  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    if (params && params.id) {
      this.renderDetail(mainContent, parseInt(params.id));
    } else {
      this.renderList(mainContent);
    }
  },

  /**
   * Vista: Listado de Cuentas Bancarias
   */
  renderList: function(container) {
    const db = window.DolibarrDB.get();
    
    // Totales liquidez en Bolivianos (TC: 1 USD = 6.96 Bs)
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
        <button id="btn-nueva-cuenta" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Cuenta
        </button>
      </div>

      <!-- Resumen de Liquidez -->
      <div class="widget-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
        <div class="widget-box wb-success" style="cursor:default;">
          <div class="wb-icon"><i class="fas fa-money-bill-wave"></i></div>
          <div class="wb-details">
            <div class="wb-count">${window.DolibarrUtils.formatCurrency(totalBs)}</div>
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
            <div class="wb-count">${window.DolibarrUtils.formatCurrency(consolidadoBs)}</div>
            <div class="wb-label">Liquidez Consolidada (Bs)</div>
          </div>
        </div>
      </div>

      <!-- Tabla de Cuentas -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de la Cuenta / Banco</th>
              <th>Tipo de Cuenta</th>
              <th>Número de Cuenta</th>
              <th style="text-align: center;">Divisa</th>
              <th style="text-align: right;">Saldo Actual</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${db.bancos.map(c => {
              let typeLabel = 'Corriente';
              if (c.type === 'ahorros') typeLabel = 'Caja de Ahorros';
              if (c.type === 'efectivo') typeLabel = 'Efectivo / Caja Chica';

              return `
                <tr>
                  <td><code>ALM-B-${c.id}</code></td>
                  <td><strong>${c.label}</strong><br><small class="text-muted">${c.bank_name}</small></td>
                  <td><span class="text-muted">${typeLabel}</span></td>
                  <td><code>${c.number}</code></td>
                  <td style="text-align: center;"><span class="badge ${c.currency === 'Bs' ? 'badge-primary' : 'badge-warning'}">${c.currency}</span></td>
                  <td style="text-align: right;" class="font-semibold">${window.DolibarrUtils.formatCurrency(c.balance, c.currency === 'Bs' ? 'Bs.' : '$us')}</td>
                  <td style="text-align: center;">
                    <a href="#/bancos?id=${c.id}" class="btn btn-secondary btn-sm"><i class="fas fa-list-ul"></i> Transacciones</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- VENTANA MODAL: NUEVA CUENTA BANCARIA -->
      <div class="modal-overlay" id="modal-banco-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-university"></i> Registrar Nueva Cuenta / Caja</h3>
            <button class="modal-close" id="modal-banco-close">&times;</button>
          </div>
          <form id="form-nuevo-banco">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="b-label">Nombre descriptivo de la Cuenta *</label>
                <input type="text" id="b-label" class="form-control" placeholder="Ej. Banco Unión - Cta Recaudadora" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="b-name">Nombre de la Entidad Bancaria *</label>
                  <input type="text" id="b-name" class="form-control" placeholder="Ej. Banco Unión" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="b-type">Tipo de Cuenta *</label>
                  <select id="b-type" class="form-control" required>
                    <option value="corriente">Cuenta Corriente</option>
                    <option value="ahorros">Caja de Ahorros</option>
                    <option value="efectivo">Caja Chica / Efectivo</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="b-number">Número de Cuenta / Identificador *</label>
                  <input type="text" id="b-number" class="form-control" placeholder="Ej. 100003429" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="b-currency">Divisa *</label>
                  <select id="b-currency" class="form-control" required>
                    <option value="Bs">Bs (Boliviano)</option>
                    <option value="USD">USD (Dólar)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="b-balance">Saldo Inicial / Apertura *</label>
                <input type="number" step="0.01" id="b-balance" class="form-control" value="0.00" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-banco">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear Cuenta</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Control
    const modal = document.getElementById('modal-banco-overlay');
    const openBtn = document.getElementById('btn-nueva-cuenta');
    const closeBtn = document.getElementById('modal-banco-close');
    const cancelBtn = document.getElementById('btn-cancel-banco');
    const form = document.getElementById('form-nuevo-banco');

    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('show');
    });

    const closeModal = () => modal.classList.remove('show');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newAccount = {
        id: window.DolibarrUtils.generateId(db.bancos),
        label: document.getElementById('b-label').value,
        bank_name: document.getElementById('b-name').value,
        number: document.getElementById('b-number').value,
        type: document.getElementById('b-type').value,
        currency: document.getElementById('b-currency').value,
        balance: parseFloat(document.getElementById('b-balance').value) || 0
      };

      db.bancos.push(newAccount);
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast(`Cuenta "${newAccount.label}" registrada correctamente.`, 'success');
      closeModal();
      this.renderList(container);
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

    // 1. Filtrar los pagos que afectaron a esta cuenta bancaria.
    // Usamos el banco del pago si coincide con el código descriptivo
    const payments = db.financiera.pagos.filter(p => {
      const method = p.method.toLowerCase();
      const bankLabel = account.bank_name.toLowerCase();
      const isCaja = account.type === 'efectivo' && method.includes('efectivo');
      
      return method.includes(bankLabel) || isCaja;
    });

    // 2. Generar movimientos ficticios de apertura para rellenar
    // (Esto simula un historial antiguo antes de la demo)
    const baseDate = "2026-05-01";
    const mockTrans = [
      { id: 'INI', date: baseDate, desc: 'Apertura de Cuenta / Saldo Inicial', amount: account.balance - payments.reduce((sum, p) => p.type === 'cliente' ? sum + p.amount : sum - p.amount, 0), ref: '-' }
    ];

    // Combinamos reales y ficticios
    const allTransactions = [...mockTrans];
    payments.forEach(p => {
      const isCliente = p.type === 'cliente';
      
      // Conversión inversa si es USD
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

    // Ordenar transacciones por fecha
    allTransactions.sort((a,b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = `
      <div class="breadcrumbs">
        <a href="#/inicio">Dolibarr</a> <i class="fas fa-chevron-right"></i> <a href="#/bancos">Bancos</a> <i class="fas fa-chevron-right"></i> <strong>Detalle de Cuenta</strong>
      </div>

      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice-dollar"></i> Extracto: ${account.label}</h1>
        <button onclick="window.location.hash='#/bancos'" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Volver a Cuentas
        </button>
      </div>

      <!-- Ficha técnica de la cuenta -->
      <div class="card" style="margin-bottom: 24px;">
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
              <td class="font-bold" style="color:var(--primary); font-size:15px;">
                ${window.DolibarrUtils.formatCurrency(account.balance, account.currency === 'Bs' ? 'Bs.' : '$us')}
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Historial de Movimientos -->
      <div class="card">
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
                <th>Vínculo</th>
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
                    <td>${t.ref !== '-' ? `<a href="#/financiera">${t.ref}</a>` : '<span class="text-muted">-</span>'}</td>
                    <td style="text-align: right; font-weight:700; color: ${isIngreso ? 'var(--success)' : 'var(--danger)'};">
                      ${isIngreso ? '+' : ''}${window.DolibarrUtils.formatCurrency(t.amount, account.currency === 'Bs' ? 'Bs.' : '$us')}
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
};
window.DolibarrModules.bancos = window.DolibarrModules.bancos;
