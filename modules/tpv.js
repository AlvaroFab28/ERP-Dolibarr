/**
 * tpv.js - Terminal Punto de Venta (TakePOS)
 * Prototipo Dolibarr ERP v23.0.1
 */

window.DolibarrModules.tpv = {
  // Carritos activos para las pestañas de ticket
  activeTab: 1,
  carts: {
    1: [],
    2: []
  },
  
  // Cliente seleccionado (por defecto ID 3: CBN - Consumidor Frecuente)
  selectedClientId: 3,

  render: function(subRoute, params) {
    const mainContent = document.getElementById('main-content');
    
    // Ocultar cabeceras y sidebar para emular modo pantalla completa TPV
    const navbar = document.getElementById('top-navbar');
    const sidebar = document.getElementById('left-sidebar');
    if (navbar) navbar.classList.add('hidden');
    if (sidebar) sidebar.classList.add('hidden');
    
    // Estirar el contenedor de main-content
    mainContent.style.padding = '0';
    mainContent.style.height = '100vh';
    mainContent.style.backgroundColor = '#1E293B'; // Fondo oscuro para TPV

    this.renderPOS(mainContent);
  },

  /**
   * Restaura la interfaz del ERP al salir del TPV
   */
  exitPOS: function() {
    const navbar = document.getElementById('top-navbar');
    const sidebar = document.getElementById('left-sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (navbar) navbar.classList.remove('hidden');
    if (sidebar) sidebar.classList.remove('hidden');
    
    // Restaurar estilos de main-content
    mainContent.style.padding = '24px';
    mainContent.style.height = 'auto';
    mainContent.style.backgroundColor = 'var(--bg-body)';
    
    window.location.hash = '#/inicio';
  },

  /**
   * Vista: Terminal Punto de Venta (TakePOS)
   */
  renderPOS: function(container) {
    const db = window.DolibarrDB.get();
    const products = db.products.filter(p => p.type === 'producto');
    const client = db.terceros.find(t => t.id === this.selectedClientId) || { name: 'Consumidor Final' };

    // HTML del TPV
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100vh; color: #F1F5F9; font-family:'Inter', sans-serif;">
        
        <!-- Header del TPV -->
        <div style="height: 50px; background-color: #0F172A; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; border-bottom: 2px solid #334155;">
          <div style="display:flex; align-items:center; gap:12px;">
            <i class="fas fa-cash-register" style="color:var(--primary); font-size:20px;"></i>
            <span style="font-weight:700; font-size:15px;">Dolibarr TakePOS</span>
            <span style="font-size:11px; background:#334155; padding:3px 8px; border-radius:10px;">Caja Abierta: admin</span>
          </div>
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="font-size:13px; font-weight:600;"><i class="fas fa-user" style="color:var(--warning);"></i> Cliente: ${client.name}</div>
            <button id="btn-tpv-exit" class="btn btn-danger btn-sm" style="padding:4px 12px; font-size:12px;"><i class="fas fa-sign-out-alt"></i> Salir al ERP</button>
          </div>
        </div>

        <!-- Cuerpo del TPV -->
        <div style="display: flex; flex: 1; overflow: hidden;">
          
          <!-- COLUMNA IZQUIERDA: Carrito y Totales -->
          <div style="width: 320px; background-color: #0F172A; border-right: 2px solid #334155; display: flex; flex-direction: column; justify-content: space-between;">
            
            <!-- Pestañas de Ticket -->
            <div style="display: flex; background: #1E293B; border-bottom: 1px solid #334155;">
              <button class="tpv-tab-btn ${this.activeTab === 1 ? 'active' : ''}" data-tab="1" style="flex:1; padding:10px; border:none; background:none; color:#F1F5F9; font-weight:600; cursor:pointer;">Ticket 1</button>
              <button class="tpv-tab-btn ${this.activeTab === 2 ? 'active' : ''}" data-tab="2" style="flex:1; padding:10px; border:none; background:none; color:#F1F5F9; font-weight:600; cursor:pointer; border-left:1px solid #334155;">Ticket 2</button>
            </div>

            <!-- Listado de Artículos en Carrito -->
            <div style="flex: 1; overflow-y: auto; padding: 12px;" id="tpv-cart-items">
              <!-- Renderizado dinámico -->
            </div>

            <!-- Panel de Totales -->
            <div style="background-color: #1E293B; padding: 16px; border-top: 2px solid #334155;">
              <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px; color:#94A3B8;">
                <span>Subtotal (Sin IVA):</span>
                <span id="tpv-subtotal">Bs. 0,00</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:8px; color:#94A3B8;">
                <span>IVA Comp. (13%):</span>
                <span id="tpv-iva">Bs. 0,00</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; color:#10B981; margin-bottom:12px;">
                <span>TOTAL A PAGAR:</span>
                <span id="tpv-total">Bs. 0,00</span>
              </div>
              <button id="btn-tpv-pay" class="btn btn-success" style="width: 100%; padding: 12px; font-size: 15px; font-weight: 700;">
                <i class="fas fa-money-bill-wave"></i> COBRAR / FACTURAR
              </button>
            </div>

          </div>

          <!-- COLUMNA CENTRAL: Teclado Numérico y Acciones Rápidas -->
          <div style="width: 250px; background-color: #1E293B; border-right: 2px solid #334155; display: flex; flex-direction: column; padding: 16px; justify-content: space-between;">
            
            <!-- Pantalla del teclado / Digitación -->
            <div style="background:#0F172A; border-radius: var(--radius-md); padding:12px; text-align:right; font-size:24px; font-weight:700; font-family:monospace; color:#10B981; margin-bottom:16px; border:1px solid #334155; min-height:56px;" id="keypad-display">
              0
            </div>

            <!-- Teclado Numérico Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; flex: 1; margin-bottom: 16px;">
              <button class="keypad-btn" data-val="7">7</button><button class="keypad-btn" data-val="8">8</button><button class="keypad-btn" data-val="9">9</button>
              <button class="keypad-btn" data-val="4">4</button><button class="keypad-btn" data-val="5">5</button><button class="keypad-btn" data-val="6">6</button>
              <button class="keypad-btn" data-val="1">1</button><button class="keypad-btn" data-val="2">2</button><button class="keypad-btn" data-val="3">3</button>
              <button class="keypad-btn btn-danger-kp" data-val="C">C</button><button class="keypad-btn" data-val="0">0</button><button class="keypad-btn" data-val="back"><i class="fas fa-backspace"></i></button>
            </div>

            <!-- Botones de Acción TPV -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button id="btn-tpv-client" class="btn btn-secondary" style="background:#334155; border:none; color:#F1F5F9; width:100%;"><i class="fas fa-user-friends"></i> Seleccionar Cliente</button>
              <button id="btn-tpv-qty" class="btn btn-secondary" style="background:#334155; border:none; color:#F1F5F9; width:100%;"><i class="fas fa-sort-amount-up"></i> Cambiar Cantidad</button>
              <button id="btn-tpv-clear-cart" class="btn btn-danger" style="width:100%;"><i class="fas fa-trash-alt"></i> Vaciar Carrito</button>
            </div>

          </div>

          <!-- COLUMNA DERECHA: Catálogo de Productos -->
          <div style="flex: 1; background-color: #0F172A; padding: 20px; overflow-y: auto;">
            <h3 style="font-size:15px; font-weight:600; margin-bottom:16px; display:flex; align-items:center; gap:8px;"><i class="fas fa-th"></i> Catálogo Rápido de Productos</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px;" id="tpv-products-grid">
              ${products.map(p => `
                <div class="tpv-prod-card" data-id="${p.id}" style="background-color: #1E293B; border: 1px solid #334155; border-radius: var(--radius-md); padding: 12px; text-align: center; cursor: pointer; transition: var(--transition-base); position:relative;">
                  <div style="font-size: 20px; color: var(--primary); margin-bottom: 8px;"><i class="fas fa-box"></i></div>
                  <div style="font-size: 11px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 4px;">${p.label}</div>
                  <div style="font-size: 10px; color: #94A3B8; margin-bottom: 6px;">Ref: ${p.code}</div>
                  <div style="font-size: 12px; font-weight: 700; color: #10B981;">${p.price.toFixed(2)} Bs</div>
                  <div style="position:absolute; top:4px; right:6px; font-size:9px; background:#0F172A; padding:1px 5px; border-radius:6px; color:#94A3B8;">St: ${p.stock}</div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </div>

      <!-- MODAL: REGISTRAR COBRO Y CAMBIO -->
      <div class="modal-overlay" id="modal-tpv-pay-overlay">
        <div class="modal-container" style="background:#1E293B; border:1px solid #334155; max-width: 450px;">
          <div class="modal-header" style="border-bottom:1px solid #334155;">
            <h3 class="modal-title" style="color:#F1F5F9;"><i class="fas fa-cash-register"></i> Validar Pago y Emisión</h3>
            <button class="modal-close" id="modal-tpv-pay-close" style="color:#94A3B8;">&times;</button>
          </div>
          <form id="form-tpv-pay">
            <div class="modal-body" style="color:#F1F5F9;">
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:13px; color:#94A3B8; margin-bottom:4px;">TOTAL A COBRAR</div>
                <div style="font-size:32px; font-weight:800; color:#10B981;" id="modal-pay-total">0.00 Bs</div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" style="color:#94A3B8;">Efectivo Recibido (Bs) *</label>
                  <input type="number" step="0.01" id="tpv-cash-received" class="form-control" style="background:#0F172A; border-color:#334155; color:#F1F5F9; font-size:18px; font-weight:700;" required>
                </div>
                <div class="form-group">
                  <label class="form-label" style="color:#94A3B8;">Cambio a Devolver</label>
                  <div style="padding:9px; background:#0F172A; border:1px solid #334155; border-radius:var(--radius-md); font-size:18px; font-weight:700; color:var(--warning);" id="tpv-change-return">
                    0.00 Bs
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" style="color:#94A3B8;">Método de Pago</label>
                <select id="tpv-pay-method" class="form-control" style="background:#0F172A; border-color:#334155; color:#F1F5F9;">
                  <option value="Efectivo / Caja">Efectivo / Caja Chica</option>
                  <option value="Transferencia BNB">Transferencia BNB</option>
                  <option value="Tarjeta de Debito">Tarjeta de Débito</option>
                </select>
              </div>
            </div>
            <div class="modal-footer" style="border-top:1px solid #334155;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-tpv-pay" style="background:#334155; border:none; color:#F1F5F9;">Cancelar</button>
              <button type="submit" class="btn btn-success"><i class="fas fa-check-circle"></i> Validar y Facturar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: RECIBO DE TICKET MOCKUP (IMPRESORA TERMINAL) -->
      <div class="modal-overlay" id="modal-receipt-overlay">
        <div class="modal-container" style="max-width: 350px; background:#FFFFFF; color:#000000; font-family:'Courier New', monospace; box-shadow:var(--shadow-lg);">
          <div class="modal-body" style="padding:20px 24px;">
            <div style="text-align:center; border-bottom:1px dashed #000000; padding-bottom:12px; margin-bottom:12px;">
              <h3 style="font-size:16px; font-weight:700; margin:0;">${db.company.name}</h3>
              <div style="font-size:11px;">NIT: ${db.company.nit}</div>
              <div style="font-size:11px;">${db.company.address}</div>
              <div style="font-size:11px;">La Paz - Bolivia</div>
            </div>
            
            <div style="font-size:11px; margin-bottom:10px;">
              <div>TICKET: <span id="r-ticket-ref">TCK-0001</span></div>
              <div>FECHA: <span id="r-ticket-date">2026-05-31</span></div>
              <div>CLIENTE: <span id="r-ticket-client">CBN S.A.</span></div>
              <div>CAJERO: admin</div>
            </div>

            <table style="width:100%; font-size:11px; border-bottom:1px dashed #000000; padding-bottom:6px; margin-bottom:6px;">
              <thead>
                <tr style="border-bottom:1px solid #000000;">
                  <th style="text-align:left;">CONCEPTO</th>
                  <th style="text-align:center;">CANT</th>
                  <th style="text-align:right;">P.UNIT</th>
                  <th style="text-align:right;">SUBT</th>
                </tr>
              </thead>
              <tbody id="r-ticket-items">
                <!-- Dinámico -->
              </tbody>
            </table>

            <div style="font-size:11px; text-align:right; font-weight:700; margin-bottom:12px;">
              <div>SUBTOTAL: <span id="r-subtotal">0.00 Bs</span></div>
              <div>IVA (13%): <span id="r-iva">0.00</span></div>
              <div style="font-size:13px;">TOTAL FACTURA: <span id="r-total">0.00 Bs</span></div>
              <hr style="border:none; border-top:1px dashed #000; margin:4px 0;">
              <div>EFECTIVO: <span id="r-received">0.00 Bs</span></div>
              <div>CAMBIO: <span id="r-change">0.00 Bs</span></div>
            </div>

            <div style="text-align:center; font-size:10px; border-top:1px dashed #000000; padding-top:10px;">
              <div>¡GRACIAS POR SU COMPRA!</div>
              <div>DIASA S.A. - Bolivia</div>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:center;">
              <button id="btn-close-receipt" class="btn btn-primary btn-sm" style="font-family:sans-serif;"><i class="fas fa-check"></i> Finalizar Venta</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Redibujar carrito inicial
    this.updateCartView();

    // Evento Salir
    document.getElementById('btn-tpv-exit').addEventListener('click', () => {
      this.exitPOS();
    });

    // Pestañas
    document.querySelectorAll('.tpv-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tpv-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = parseInt(btn.dataset.tab);
        this.updateCartView();
      });
    });

    // Añadir productos al hacer clic en las cards del grid
    document.querySelectorAll('.tpv-prod-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const prod = products.find(p => p.id === id);
        if (prod) {
          this.addToCart(prod);
        }
      });
    });

    // Teclado Numérico Controles
    const display = document.getElementById('keypad-display');
    let keypadValue = '0';

    document.querySelectorAll('.keypad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;

        if (val === 'C') {
          keypadValue = '0';
        } else if (val === 'back') {
          keypadValue = keypadValue.slice(0, -1);
          if (keypadValue === '') keypadValue = '0';
        } else {
          if (keypadValue === '0') {
            keypadValue = val;
          } else {
            keypadValue += val;
          }
        }
        display.textContent = keypadValue;
      });
    });

    // Cambiar Cantidad con el valor digitado en el teclado
    document.getElementById('btn-tpv-qty').addEventListener('click', () => {
      const qty = parseInt(keypadValue) || 1;
      const cart = this.carts[this.activeTab];
      if (cart.length > 0) {
        // Modificar cantidad del último artículo añadido
        cart[cart.length - 1].qty = qty;
        this.updateCartView();
        window.DolibarrUtils.showToast(`Cantidad ajustada a ${qty} unidades.`, 'info');
      }
      // Limpiar teclado
      keypadValue = '0';
      display.textContent = keypadValue;
    });

    // Vaciar Carrito
    document.getElementById('btn-tpv-clear-cart').addEventListener('click', () => {
      this.carts[this.activeTab] = [];
      this.updateCartView();
      window.DolibarrUtils.showToast("Carrito vaciado.", 'warning');
    });

    // Cambiar Cliente
    document.getElementById('btn-tpv-client').addEventListener('click', () => {
      // Rotar entre clientes para demostración simple
      const clientIds = db.terceros.filter(t => t.type === 'cliente' || t.type === 'ambos').map(t => t.id);
      const currentIndex = clientIds.indexOf(this.selectedClientId);
      const nextIndex = (currentIndex + 1) % clientIds.length;
      this.selectedClientId = clientIds[nextIndex];
      window.DolibarrUtils.showToast(`Cliente cambiado a: ${db.terceros.find(t => t.id === this.selectedClientId).name}`, 'success');
      this.renderPOS(container);
    });

    // Cobrar / Facturar (Modal Cobro)
    const modalPay = document.getElementById('modal-tpv-pay-overlay');
    const closePayBtn = document.getElementById('modal-tpv-pay-close');
    const cancelPayBtn = document.getElementById('btn-cancel-tpv-pay');
    const formPay = document.getElementById('form-tpv-pay');
    const cashInput = document.getElementById('tpv-cash-received');
    const changeReturn = document.getElementById('tpv-change-return');

    document.getElementById('btn-tpv-pay').addEventListener('click', () => {
      const cart = this.carts[this.activeTab];
      if (cart.length === 0) {
        window.DolibarrUtils.showToast("El carrito está vacío.", "error");
        return;
      }

      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      document.getElementById('modal-pay-total').textContent = `${total.toFixed(2)} Bs`;
      cashInput.value = total.toFixed(2);
      changeReturn.textContent = '0.00 Bs';
      
      modalPay.classList.add('show');
    });

    const closePay = () => modalPay.classList.remove('show');
    closePayBtn.addEventListener('click', closePay);
    cancelPayBtn.addEventListener('click', closePay);

    // Calcular cambio en modal
    cashInput.addEventListener('input', (e) => {
      const total = this.carts[this.activeTab].reduce((sum, item) => sum + (item.price * item.qty), 0);
      const received = parseFloat(e.target.value) || 0;
      const change = received - total;
      changeReturn.textContent = `${(change > 0 ? change : 0).toFixed(2)} Bs`;
    });

    // Guardar Cobro y Abrir Recibo de Ticket
    formPay.addEventListener('submit', (e) => {
      e.preventDefault();

      const cart = this.carts[this.activeTab];
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const received = parseFloat(cashInput.value) || 0;
      const change = received - total;
      const method = document.getElementById('tpv-pay-method').value;

      // 1. Deducir stock del inventario para los productos vendidos
      cart.forEach(item => {
        const prod = db.products.find(p => p.id === item.id);
        if (prod) {
          prod.stock -= item.qty;
        }
      });

      // Sincronizar con el Almacén Central El Alto
      if (db.warehouses && db.warehouses[0]) {
        cart.forEach(item => {
          const prod = db.products.find(p => p.id === item.id);
          if (prod) {
            db.warehouses[0].stockCount -= item.qty;
            db.warehouses[0].value_bs -= (item.qty * prod.cost);
          }
        });
      }

      // 2. Crear Factura Cliente
      const nextFactId = window.DolibarrUtils.generateId(db.financiera.facturas_cliente);
      const factRef = `FA-TPV26${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(db.financiera.facturas_cliente.length + 1).padStart(3,'0')}`;
      
      db.financiera.facturas_cliente.push({
        id: nextFactId,
        ref: factRef,
        terceroId: this.selectedClientId,
        date: new Date().toISOString().split('T')[0],
        date_due: new Date().toISOString().split('T')[0],
        total_ht: total / 1.13,
        total_ttc: total,
        status: "Pagado"
      });

      // 3. Crear Registro de Pago (Ingreso)
      const nextPagoId = window.DolibarrUtils.generateId(db.financiera.pagos);
      const pagoRef = `PAG-TPV-${String(db.financiera.pagos.length + 1).padStart(3,'0')}`;
      db.financiera.pagos.push({
        id: nextPagoId,
        type: "cliente",
        ref: pagoRef,
        invoiceRef: factRef,
        amount: total,
        date: new Date().toISOString().split('T')[0],
        method: method
      });

      // 4. Sumar dinero a la cuenta "Caja Chica Central" (id: 3)
      if (db.bancos && db.bancos[2]) {
        db.bancos[2].balance += total;
      }

      // 5. Asentar en la contabilidad general de doble entrada
      const nextAsientoId = window.DolibarrUtils.generateId(db.contabilidad.diario);
      db.contabilidad.diario.push(
        { id: nextAsientoId, date: new Date().toISOString().split('T')[0], ref: factRef, desc: `Venta POS TakePOS`, account: "400000 - Ventas", debit: 0, credit: total / 1.13, journal: "Ventas" },
        { id: nextAsientoId + 1, date: new Date().toISOString().split('T')[0], ref: factRef, desc: `Débito Fiscal IVA 13%`, account: "213010 - IVA Débito", debit: 0, credit: total - (total / 1.13), journal: "Ventas" },
        { id: nextAsientoId + 2, date: new Date().toISOString().split('T')[0], ref: factRef, desc: `Ingreso Efectivo POS`, account: "111500 - Caja Chica", debit: total, credit: 0, journal: "Bancos" }
      );

      // Guardar base de datos
      window.DolibarrDB.save(db);
      window.DolibarrUtils.showToast("Venta procesada. Inventario, caja y contabilidad conciliados.", 'success');
      closePay();

      // 6. Cargar datos del Ticket Térmico Imprimible
      document.getElementById('r-ticket-ref').textContent = factRef;
      document.getElementById('r-ticket-date').textContent = new Date().toISOString().split('T')[0];
      document.getElementById('r-ticket-client').textContent = client.name;
      
      const itemsBody = document.getElementById('r-ticket-items');
      itemsBody.innerHTML = cart.map(item => `
        <tr>
          <td>${item.label}</td>
          <td style="text-align:center;">${item.qty}</td>
          <td style="text-align:right;">${item.price.toFixed(2)}</td>
          <td style="text-align:right;">${(item.price * item.qty).toFixed(2)}</td>
        </tr>
      `).join('');

      document.getElementById('r-subtotal').textContent = `${(total / 1.13).toFixed(2)} Bs`;
      document.getElementById('r-iva').textContent = `${(total - (total/1.13)).toFixed(2)} Bs`;
      document.getElementById('r-total').textContent = `${total.toFixed(2)} Bs`;
      document.getElementById('r-received').textContent = `${received.toFixed(2)} Bs`;
      document.getElementById('r-change').textContent = `${(change > 0 ? change : 0).toFixed(2)} Bs`;

      // Abrir modal de ticket imprimible
      document.getElementById('modal-receipt-overlay').classList.add('show');
    });

    // Finalizar e imprimir (cierra ticket y vacía carrito)
    document.getElementById('btn-close-receipt').addEventListener('click', () => {
      document.getElementById('modal-receipt-overlay').classList.remove('show');
      // Vaciar carrito activo y rediseñar TPV
      this.carts[this.activeTab] = [];
      this.renderPOS(container);
    });
  },

  /**
   * Agrega un producto al carrito
   */
  addToCart: function(product) {
    const cart = this.carts[this.activeTab];
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        id: product.id,
        label: product.label,
        price: product.price,
        qty: 1
      });
    }

    this.updateCartView();
  },

  /**
   * Actualiza visualmente el carrito y subtotales en la barra lateral
   */
  updateCartView: function() {
    const cart = this.carts[this.activeTab];
    const list = document.getElementById('tpv-cart-items');
    if (!list) return;

    if (cart.length === 0) {
      list.innerHTML = `
        <div style="text-align:center; padding: 40px 10px; color:#64748B;">
          <i class="fas fa-shopping-basket" style="font-size:32px; margin-bottom:12px; display:block;"></i>
          <span>Carrito vacío. Selecciona productos de la derecha.</span>
        </div>
      `;
      document.getElementById('tpv-subtotal').textContent = 'Bs. 0,00';
      document.getElementById('tpv-iva').textContent = 'Bs. 0,00';
      document.getElementById('tpv-total').textContent = 'Bs. 0,00';
      return;
    }

    // Dibujar ítems
    list.innerHTML = cart.map((item, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#1E293B; border-radius: var(--radius-sm); padding:8px 10px; margin-bottom:8px; border:1px solid #334155;">
        <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-right:10px;">
          <div style="font-size:12px; font-weight:600;">${item.label}</div>
          <div style="font-size:10px; color:#94A3B8;">${item.qty} x ${item.price.toFixed(2)} Bs</div>
        </div>
        <div style="font-size:12.5px; font-weight:700; color:#10B981; margin-right:12px;">${(item.price * item.qty).toFixed(2)}</div>
        <button class="btn-remove-tpv-item" data-idx="${idx}" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:14px;"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');

    // Totales
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const subtotal = total / 1.13;
    const iva = total - subtotal;

    document.getElementById('tpv-subtotal').textContent = window.DolibarrUtils.formatCurrency(subtotal);
    document.getElementById('tpv-iva').textContent = window.DolibarrUtils.formatCurrency(iva);
    document.getElementById('tpv-total').textContent = window.DolibarrUtils.formatCurrency(total);

    // Eventos de remover item
    list.querySelectorAll('.btn-remove-tpv-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        cart.splice(idx, 1);
        this.updateCartView();
      });
    });
  }
};
window.DolibarrModules.tpv = window.DolibarrModules.tpv;
