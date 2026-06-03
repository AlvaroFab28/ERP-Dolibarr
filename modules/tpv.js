/**
 * tpv.js - Terminal Punto de Venta (TakePOS)
 * Prototipo Dolibarr ERP v23.0.1
 * Localizado y Mejorado para DIASA S.A.
 */

window.DolibarrModules.tpv = {
  // Carritos activos representados por su hora de creación (ej: '13:58', '12:27', '05:15')
  activeCartKey: '05:15',
  carts: {
    '13:58': [],
    '12:27': [],
    '05:15': [
      { id: 1, label: "Décapsuleur fantaisie", price: 800.00, qty: 1, discount: 0 },
      { id: 3, label: "PRODUCTO X100", price: 100.00, qty: 1, discount: 0 },
      { id: 99, label: "prova", price: 55.00, qty: 1, discount: 0 }
    ],
    '11:37': []
  },
  
  // Cliente seleccionado (por defecto 3: CBN - Consumidor Frecuente)
  selectedClientId: 3,
  
  // Índice del producto seleccionado dentro del carrito activo para modificar con el teclado
  selectedItemIndex: 0,
  
  // Buffer de entrada del teclado numérico
  keypadBuffer: '',

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

  renderPOS: function(container) {
    const db = window.DolibarrDB.get();
    const products = db.products.filter(p => p.type === 'producto');
    const client = db.terceros.find(t => t.id === this.selectedClientId) || { name: 'Consumidor Final' };
    const cart = this.carts[this.activeCartKey] || [];

    // Calcular el gran total actual del carrito activo
    const cartTotal = cart.reduce((sum, item) => sum + ((item.price * (1 - item.discount / 100)) * item.qty), 0);

    // Listado de claves de carritos para pintar en la barra superior
    const cartKeys = Object.keys(this.carts);

    container.innerHTML = `
      <style>
        /* Estilos específicos de TakePOS */
        .pos-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          color: #F1F5F9;
          font-family: 'Inter', sans-serif;
          background-color: #0F172A;
          user-select: none;
        }

        /* Top Bar */
        .pos-top-bar {
          background-color: #0F172A;
          border-bottom: 2px solid #334155;
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          height: 52px;
        }

        .pos-top-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pos-meta-item {
          font-size: 12px;
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pos-meta-item strong {
          color: #F1F5F9;
        }

        /* Tickets/Carts Bar */
        .pos-carts-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #1E293B;
          padding: 4px 16px;
          border-bottom: 1px solid #334155;
          overflow-x: auto;
          min-height: 42px;
        }

        .pos-cart-tab {
          background-color: #334155;
          color: #94A3B8;
          border: none;
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .pos-cart-tab.active {
          background-color: #FFFFFF;
          color: #1E293B;
          font-weight: 700;
        }

        .pos-cart-tab:hover {
          background-color: #475569;
          color: #FFFFFF;
        }
        
        .pos-cart-tab.active:hover {
          background-color: #FFFFFF;
          color: #1E293B;
        }

        .pos-add-cart-btn {
          background-color: #10B981;
          color: white;
          border: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .pos-add-cart-btn:hover {
          background-color: #059669;
        }

        /* Layout Grid */
        .pos-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Columna Izquierda: Cart items */
        .pos-cart-column {
          width: 340px;
          background-color: #0F172A;
          border-right: 2px solid #334155;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .pos-cart-header-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          border-bottom: 1px solid #1E293B;
          text-transform: uppercase;
        }

        .pos-cart-items-list {
          flex: 1;
          overflow-y: auto;
          padding: 6px;
        }

        .pos-item-row {
          display: flex;
          flex-direction: column;
          padding: 10px 12px;
          margin-bottom: 6px;
          border-radius: 6px;
          background-color: #1E293B;
          border: 1px solid #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .pos-item-row.selected {
          border-color: #10B981;
          background-color: #0D2D24;
          box-shadow: 0 0 0 1px #10B981;
        }

        .pos-item-main {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 12.5px;
          margin-bottom: 4px;
        }

        .pos-item-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94A3B8;
        }

        /* Keypad (Columna Central) */
        .pos-keypad-column {
          width: 260px;
          background-color: #1E293B;
          border-right: 2px solid #334155;
          display: flex;
          flex-direction: column;
          padding: 12px;
          justify-content: space-between;
          gap: 10px;
        }

        .pos-keypad-display {
          background-color: #0F172A;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 10px 14px;
          text-align: right;
          font-size: 24px;
          font-weight: 700;
          font-family: monospace;
          color: #10B981;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .pos-keypad-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          flex: 1;
        }

        .pos-key-btn {
          background-color: #475569;
          color: #F1F5F9;
          border: none;
          border-radius: 6px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.1s ease;
        }

        .pos-key-btn:active {
          background-color: #334155;
        }

        .pos-key-btn.action-key {
          background-color: #3B82F6;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.2;
          padding: 2px;
          text-align: center;
        }

        .pos-key-btn.action-key:active {
          background-color: #2563EB;
        }

        .pos-key-btn.clear-key {
          background-color: #EF4444;
        }

        .pos-key-btn.clear-key:active {
          background-color: #DC2626;
        }

        .pos-key-btn.delete-row-key {
          background-color: #F87171;
          grid-column: span 4;
          height: 40px;
          font-size: 14px;
          display: flex;
          gap: 8px;
        }

        .pos-key-btn.delete-row-key:active {
          background-color: #EF4444;
        }

        /* Columna Derecha: Botonera y Catálogo */
        .pos-catalog-column {
          flex: 1;
          background-color: #0F172A;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Botonera de Acciones (Pink/Salmon) */
        .pos-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 12px 16px;
          background-color: #1E293B;
          border-bottom: 2px solid #334155;
        }

        .pos-action-btn {
          background-color: #FCA5A5; /* Rosa/Salmón Pastel */
          color: #7F1D1D;
          border: none;
          border-radius: 6px;
          padding: 10px 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background-color 0.15s ease;
          text-align: center;
        }

        .pos-action-btn:hover {
          background-color: #FECACA;
        }

        .pos-action-btn i {
          font-size: 15px;
        }

        /* Catálogo de Productos */
        .pos-catalog-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px;
          overflow: hidden;
        }

        .pos-categories-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 12px;
          border-bottom: 1px solid #1E293B;
          margin-bottom: 16px;
          min-height: 48px;
        }

        .pos-cat-btn {
          background-color: #1E293B;
          color: #94A3B8;
          border: 1px solid #334155;
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .pos-cat-btn.active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .pos-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
          overflow-y: auto;
          flex: 1;
          padding-right: 4px;
        }

        .pos-prod-card {
          background-color: #1E293B;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .pos-prod-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .pos-prod-price {
          font-size: 13px;
          font-weight: 700;
          color: #10B981;
          margin-top: 4px;
        }

        /* Modal Cobro Stripe Sandbox */
        .stripe-warning-banner {
          background-color: #FEF3C7;
          border: 1px solid #F59E0B;
          color: #B45309;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .payment-summary-box {
          background-color: #0F172A;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .payment-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          font-weight: 600;
        }

        .payment-summary-value {
          background-color: #334155;
          color: #FFFFFF;
          padding: 4px 16px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 700;
          min-width: 120px;
          text-align: right;
        }

        .payment-summary-value.received-value {
          color: #EF4444;
        }

        .payment-summary-value.change-value {
          color: #F59E0B;
        }

        .payment-pad-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 12px;
        }

        .payment-num-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .payment-methods-column {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .payment-method-btn {
          background-color: #3B82F6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1;
        }

        .payment-method-btn:hover {
          background-color: #2563EB;
        }
      </style>

      <div class="pos-container">
        <!-- TOP BAR -->
        <div class="pos-top-bar">
          <div class="pos-top-left">
            <span style="font-weight:800; font-size:16px; color:var(--primary); display:flex; align-items:center; gap:8px;">
              <i class="fas fa-cash-register"></i> TakePOS Terminal 1
            </span>
            <div class="pos-meta-item">
              <i class="fas fa-calendar-alt"></i> Fecha: <strong>03/06/2026</strong>
            </div>
            <div class="pos-meta-item" style="cursor:pointer;" id="btn-tpv-client-select" title="Haga clic para cambiar cliente">
              <i class="fas fa-user-circle"></i> Cliente: <strong style="text-decoration:underline;">${client.name}</strong>
            </div>
            <div class="pos-meta-item">
              <i class="fas fa-money-bill-wave"></i> Divisa: <strong>Bs (Boliviano)</strong>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:10px; color:#F59E0B; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); padding:3px 8px; border-radius:12px;">
              Cambio de stock deshabilitado
            </span>
            <button id="btn-tpv-exit" class="btn btn-danger btn-sm" style="padding:5px 12px; font-size:12px; border-radius:4px;"><i class="fas fa-sign-out-alt"></i> Salir al ERP</button>
          </div>
        </div>

        <!-- CARTS/TICKETS BAR -->
        <div class="pos-carts-bar">
          ${cartKeys.map(cKey => `
            <button class="pos-cart-tab ${cKey === this.activeCartKey ? 'active' : ''}" data-key="${cKey}">
              <i class="fas fa-shopping-cart"></i> ${cKey}
              ${cKey === this.activeCartKey ? '' : `<span class="close-cart-tab" data-key="${cKey}" style="margin-left:4px; font-size:10px; color:#EF4444;">&times;</span>`}
            </button>
          `).join('')}
          <button class="pos-add-cart-btn" id="btn-add-new-cart" title="Abrir Nuevo Ticket/Venta">+</button>
        </div>

        <!-- BODY LAYOUT -->
        <div class="pos-layout">
          
          <!-- COLUMNA IZQUIERDA: CARRITO -->
          <div class="pos-cart-column">
            <div>
              <div style="background-color:#1E293B; padding:12px; text-align:center; border-bottom:1px solid #334155;">
                <div style="font-size:10px; color:#94A3B8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Total a Pagar</div>
                <div style="font-size:28px; font-weight:800; color:#10B981; font-family:monospace;" id="cart-visual-total">
                  ${cartTotal.toFixed(2)} Bs
                </div>
              </div>
              <div class="pos-cart-header-row">
                <span style="flex:1;">Artículo / Concepto</span>
                <span style="width:40px; text-align:center;">Dto.</span>
                <span style="width:40px; text-align:center;">Cant.</span>
                <span style="width:70px; text-align:right;">Total</span>
              </div>
            </div>

            <!-- Listado Items -->
            <div class="pos-cart-items-list" id="tpv-cart-items">
              ${cart.length === 0 ? `
                <div style="text-align:center; padding: 60px 10px; color:#64748B;">
                  <i class="fas fa-shopping-basket" style="font-size:36px; margin-bottom:12px; display:block;"></i>
                  <span>Carrito vacío.<br>Seleccione productos del catálogo.</span>
                </div>
              ` : cart.map((item, idx) => {
                const discountedPrice = item.price * (1 - item.discount / 100);
                const isSelected = idx === this.selectedItemIndex ? 'selected' : '';
                return `
                  <div class="pos-item-row ${isSelected}" data-index="${idx}">
                    <div class="pos-item-main">
                      <span><i class="fas fa-box text-muted mr-1" style="font-size:11px; margin-right:4px;"></i>${item.label}</span>
                      <span>${(discountedPrice * item.qty).toFixed(2)} Bs</span>
                    </div>
                    <div class="pos-item-details">
                      <span>Ref: ${item.id === 99 ? 'TEXTO LIBRE' : (db.products.find(p => p.id === item.id)?.code || 'N/A')}</span>
                      <span>
                        ${item.qty} x ${item.price.toFixed(2)} 
                        ${item.discount > 0 ? `(-${item.discount}%)` : ''}
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Resumen e Impuesto -->
            <div style="background-color: #1E293B; padding: 12px; border-top: 2px solid #334155;">
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px; color:#94A3B8;">
                <span>Subtotal Neto:</span>
                <span id="tpv-subtotal">${(cartTotal / 1.13).toFixed(2)} Bs</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:10px; color:#94A3B8;">
                <span>IVA Conciliado (13%):</span>
                <span id="tpv-iva">${(cartTotal - (cartTotal / 1.13)).toFixed(2)} Bs</span>
              </div>
              <button id="btn-tpv-pay" class="btn btn-success" style="width: 100%; padding: 12px; font-size: 15px; font-weight: 700; border-radius:6px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
                <i class="fas fa-credit-card"></i> PAGO / COBRAR (F8)
              </button>
            </div>
          </div>

          <!-- COLUMNA CENTRAL: TECLADO NUMÉRICO -->
          <div class="pos-keypad-column">
            <div class="pos-keypad-display" id="keypad-display">
              0
            </div>

            <!-- Grilla del Teclado (4 Columnas) -->
            <div class="pos-keypad-grid">
              <!-- Fila 7 8 9 Cant. -->
              <button class="pos-key-btn keypad-digit" data-val="7">7</button>
              <button class="pos-key-btn keypad-digit" data-val="8">8</button>
              <button class="pos-key-btn keypad-digit" data-val="9">9</button>
              <button class="pos-key-btn action-key" id="btn-kp-qty" style="background:#4F46E5;">Cant.</button>

              <!-- Fila 4 5 6 Precio -->
              <button class="pos-key-btn keypad-digit" data-val="4">4</button>
              <button class="pos-key-btn keypad-digit" data-val="5">5</button>
              <button class="pos-key-btn keypad-digit" data-val="6">6</button>
              <button class="pos-key-btn action-key" id="btn-kp-price" style="background:#4F46E5;">Precio</button>

              <!-- Fila 1 2 3 Descuento -->
              <button class="pos-key-btn keypad-digit" data-val="1">1</button>
              <button class="pos-key-btn keypad-digit" data-val="2">2</button>
              <button class="pos-key-btn keypad-digit" data-val="3">3</button>
              <button class="pos-key-btn action-key" id="btn-kp-disc" style="background:#4F46E5; font-size:11px;">Disco de línea.</button>

              <!-- Fila 0 . C Trash -->
              <button class="pos-key-btn keypad-digit" data-val="0">0</button>
              <button class="pos-key-btn keypad-digit" data-val=".">.</button>
              <button class="pos-key-btn clear-key" id="btn-kp-clear">C</button>
              <button class="pos-key-btn" id="btn-kp-backspace" title="Retroceso" style="background:#64748B;"><i class="fas fa-backspace"></i></button>

              <!-- Eliminar línea -->
              <button class="pos-key-btn delete-row-key" id="btn-kp-delete-row">
                <i class="fas fa-trash-alt"></i> Eliminar Línea
              </button>
            </div>
          </div>

          <!-- COLUMNA DERECHA: BOTONERA Y CATÁLOGO -->
          <div class="pos-catalog-column">
            
            <!-- Botonera Acciones (Pink/Salmon) -->
            <div class="pos-actions-grid">
              <button class="pos-action-btn" id="btn-act-history">
                <i class="fas fa-history"></i> History
              </button>
              <button class="pos-action-btn" id="btn-act-new">
                <i class="fas fa-folder-plus"></i> Nuevo
              </button>
              <button class="pos-action-btn" id="btn-act-freetext">
                <i class="fas fa-keyboard"></i> Prod. Texto Libre
              </button>
              <button class="pos-action-btn" id="btn-act-invoice-disc">
                <i class="fas fa-percent"></i> Disco de factura.
              </button>
              <button class="pos-action-btn" id="btn-act-split">
                <i class="fas fa-columns"></i> Venta dividida
              </button>
              <button class="pos-action-btn" id="btn-act-pay">
                <i class="fas fa-wallet"></i> Pago
              </button>
              <button class="pos-action-btn" id="btn-act-print">
                <i class="fas fa-print"></i> Imprimir
              </button>
              <button class="pos-action-btn" id="btn-act-clients" style="background:#CBD5E1; color:#1E293B;">
                <i class="fas fa-users"></i> Clientes
              </button>
            </div>

            <!-- Catálogo de Productos -->
            <div class="pos-catalog-area">
              <div class="pos-categories-row" id="tpv-categories">
                <button class="pos-cat-btn active" data-cat="todos">Todos los productos</button>
                <button class="pos-cat-btn" data-cat="maquinaria">Motores Siemens</button>
                <button class="pos-cat-btn" data-cat="valvulas">Válvulas de Presión</button>
                <button class="pos-cat-btn" data-cat="tuberias">Tuberías y Codos</button>
              </div>

              <!-- Listado de Catálogo -->
              <div class="pos-products-grid" id="tpv-products-grid">
                <!-- Se poblará dinámicamente -->
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- MODAL: HISTORIAL DE VENTAS (TIPO CAPTURA 1) -->
      <div class="modal-overlay" id="history-modal">
        <div class="modal-container" style="max-width: 90%; width: 900px; background:#FFFFFF; color:var(--text-main);">
          <div class="modal-header" style="background:#FAFBFD; border-bottom:1px solid var(--border-color);">
            <h3 class="modal-title"><i class="fas fa-history text-muted mr-1"></i> Facturas a clientes (${db.financiera.facturas_cliente.length + 3980})</h3>
            <button class="modal-close" id="btn-close-history-modal">&times;</button>
          </div>
          <div class="modal-body" style="padding: 16px 20px;">
            
            <!-- Barra de búsqueda e información -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:12px; color:var(--text-muted);">
              <div>Filtros Rápidos: <strong>Terminal POS 1</strong> | Módulo: <strong>takepos</strong></div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span>Buscar:</span>
                <input type="text" id="search-history-input" class="form-control" style="width:200px; padding:4px 8px; font-size:12px;" placeholder="Ref o Tercero...">
              </div>
            </div>

            <!-- Tabla de Historial -->
            <div class="table-responsive" style="max-height: 400px; overflow-y:auto;">
              <table class="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>Ref.</th>
                    <th>Fecha factura</th>
                    <th>Tercero</th>
                    <th>Módulo POS</th>
                    <th>Terminal POS</th>
                    <th style="text-align:right;">Importe total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody id="history-table-body">
                  <!-- Dinámico -->
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer" style="background:#FAFBFD;">
            <button class="btn btn-secondary" id="btn-close-history-modal-footer">Cerrar Historial</button>
          </div>
        </div>
      </div>

      <!-- MODAL: SELECCIONAR CLIENTE -->
      <div class="modal-overlay" id="clients-modal">
        <div class="modal-container" style="max-width: 480px; background:#FFFFFF; color:var(--text-main);">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fas fa-users-cog"></i> Seleccionar Cliente del Terminal</h3>
            <button class="modal-close" id="btn-close-clients-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="select-tpv-client-dd">Cliente Comercial</label>
              <select id="select-tpv-client-dd" class="form-control">
                ${db.terceros.map(t => `<option value="${t.id}" ${t.id === this.selectedClientId ? 'selected' : ''}>${t.name} (NIT: ${t.nit})</option>`).join('')}
              </select>
            </div>
            <p class="text-muted" style="font-size:11.5px; margin-top:8px;">
              El cliente seleccionado se asociará a todas las facturas y tickets emitidos en la pestaña activa del TPV.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-close-clients-modal-footer">Cancelar</button>
            <button class="btn btn-primary" id="btn-save-tpv-client">Aplicar Cliente</button>
          </div>
        </div>
      </div>

      <!-- MODAL: COBRO CON PASARELA STRIPE / EFECTIVO (TIPO CAPTURA 3) -->
      <div class="modal-overlay" id="payment-modal">
        <div class="modal-container" style="max-width: 580px; background:#FFFFFF; color:var(--text-main);">
          <div class="modal-header" style="background:#FAFBFD; border-bottom:1px solid var(--border-color);">
            <h3 class="modal-title" style="font-size:15px; font-weight:700;"><i class="fas fa-cash-register text-muted"></i> Pantalla de Cobro / Emisión de Ticket</h3>
            <button class="modal-close" id="btn-close-payment-modal">&times;</button>
          </div>
          <div class="modal-body" style="padding:16px 20px;">
            <!-- Advertencia Stripe Sandbox -->
            <div class="stripe-warning-banner">
              <i class="fas fa-exclamation-triangle"></i> Actualmente se encuentra en el modo Stripe "sandbox"
            </div>

            <!-- Resumen de montos -->
            <div class="payment-summary-box">
              <div class="payment-summary-row">
                <span style="color:#94A3B8; font-size:12.5px;">TOTAL A PAGAR:</span>
                <span class="payment-summary-value" id="pay-modal-total-display">0.00 Bs</span>
              </div>
              <div class="payment-summary-row">
                <span style="color:#94A3B8; font-size:12.5px;">RECIBIDO:</span>
                <span class="payment-summary-value received-value" id="pay-modal-received-display">0.00 Bs</span>
              </div>
              <div class="payment-summary-row" style="margin-top:4px; padding-top:8px; border-top:1px dashed #334155;">
                <span style="color:#94A3B8; font-size:12.5px;">CAMBIO A DEVOLVER:</span>
                <span class="payment-summary-value change-value" id="pay-modal-change-display">0.00 Bs</span>
              </div>
            </div>

            <!-- Layout Teclado + Métodos -->
            <div class="payment-pad-layout">
              <!-- Teclado Numérico de Pago -->
              <div class="payment-num-grid">
                <button class="pos-key-btn pay-num-btn" data-val="7" style="height:44px;">7</button>
                <button class="pos-key-btn pay-num-btn" data-val="8">8</button>
                <button class="pos-key-btn pay-num-btn" data-val="9">9</button>
                <button class="pos-key-btn pay-num-btn" data-val="4" style="height:44px;">4</button>
                <button class="pos-key-btn pay-num-btn" data-val="5">5</button>
                <button class="pos-key-btn pay-num-btn" data-val="6">6</button>
                <button class="pos-key-btn pay-num-btn" data-val="1" style="height:44px;">1</button>
                <button class="pos-key-btn pay-num-btn" data-val="2">2</button>
                <button class="pos-key-btn pay-num-btn" data-val="3">3</button>
                <button class="pos-key-btn pay-num-btn" data-val="0" style="height:44px;">0</button>
                <button class="pos-key-btn pay-num-btn" data-val="000">000</button>
                <button class="pos-key-btn pay-num-btn" data-val=".">.</button>
                <button class="pos-key-btn clear-key" id="btn-pay-clear" style="grid-column: span 3; height:36px; font-size:14px; margin-top:4px;">Limpiar Entrada (C)</button>
              </div>

              <!-- Métodos de Pago a la derecha -->
              <div class="payment-methods-column">
                <button class="payment-method-btn" data-method="Tarjeta de Debito" style="background:#4F46E5;">
                  <i class="fas fa-credit-card"></i> Tarjeta
                </button>
                <button class="payment-method-btn" data-method="Cheque BNB" style="background:#5B21B6;">
                  <i class="fas fa-money-check"></i> Cheque
                </button>
                <button class="payment-method-btn" data-method="Efectivo / Caja" style="background:#10B981;">
                  <i class="fas fa-coins"></i> Efectivo
                </button>
                <button class="payment-method-btn" data-method="Domiciliación Bancaria" style="background:#0369A1;">
                  <i class="fas fa-file-invoice-dollar"></i> Domiciliación
                </button>
              </div>
            </div>

          </div>
          <div class="modal-footer" style="background:#FAFBFD;">
            <button class="btn btn-secondary" id="btn-close-payment-modal-footer">Cancelar Cobro</button>
          </div>
        </div>
      </div>

      <!-- MODAL: RECIBO DE TICKET MOCKUP (IMPRESORA TERMINAL) -->
      <div class="modal-overlay" id="modal-receipt-overlay">
        <div class="modal-container" style="max-width: 360px; background:#FFFFFF; color:#000000; font-family:'Courier New', monospace; box-shadow:var(--shadow-lg);">
          <div class="modal-body" style="padding:24px;">
            <div style="text-align:center; border-bottom:1px dashed #000000; padding-bottom:12px; margin-bottom:12px;">
              <h3 style="font-size:15px; font-weight:700; margin:0; line-height:1.2;">${db.company.name}</h3>
              <div style="font-size:11px; margin-top:4px;">NIT: ${db.company.nit}</div>
              <div style="font-size:11px;">${db.company.address}</div>
              <div style="font-size:11px;">La Paz - Bolivia</div>
            </div>
            
            <div style="font-size:11px; margin-bottom:10px; line-height:1.3;">
              <div>TICKET: <span id="r-ticket-ref">TCK-0001</span></div>
              <div>FECHA: <span id="r-ticket-date">2026-06-03</span></div>
              <div>CLIENTE: <span id="r-ticket-client">CBN S.A.</span></div>
              <div>CAJERO: admin</div>
            </div>
 
            <table style="width:100%; font-size:11px; border-bottom:1px dashed #000000; padding-bottom:6px; margin-bottom:6px;">
              <thead>
                <tr style="border-bottom:1px solid #000000;">
                  <th style="text-align:left; font-weight:700;">CONCEPTO</th>
                  <th style="text-align:center; font-weight:700; width:35px;">CANT</th>
                  <th style="text-align:right; font-weight:700; width:65px;">SUBT</th>
                </tr>
              </thead>
              <tbody id="r-ticket-items">
                <!-- Dinámico -->
              </tbody>
            </table>

            <div style="font-size:11px; text-align:right; font-weight:700; margin-bottom:12px; line-height:1.4;">
              <div>SUBTOTAL NETO: <span id="r-subtotal">0.00 Bs</span></div>
              <div>IVA LIQUIDADO (13%): <span id="r-iva">0.00 Bs</span></div>
              <div style="font-size:13px; font-weight:800; margin-top:2px;">TOTAL FACTURA: <span id="r-total">0.00 Bs</span></div>
              <hr style="border:none; border-top:1px dashed #000; margin:4px 0;">
              <div>FORMA PAGO: <span id="r-method">Efectivo</span></div>
              <div>RECIBIDO: <span id="r-received">0.00 Bs</span></div>
              <div>CAMBIO: <span id="r-change">0.00 Bs</span></div>
            </div>

            <div style="text-align:center; font-size:10px; border-top:1px dashed #000000; padding-top:10px; color:#555;">
              <div>¡GRACIAS POR SU PREFERENCIA!</div>
              <div>DIASA S.A. - Bolivia</div>
              <div style="font-size:9px; margin-top:4px;">Factura emitida bajo normativa de facturación computarizada.</div>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:center;">
              <button id="btn-close-receipt" class="btn btn-primary btn-sm" style="font-family:sans-serif; width:100%;"><i class="fas fa-check"></i> Finalizar y Vaciar Carrito</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Cargar y pintar productos del catálogo
    this.filterAndRenderProducts('todos');

    // --- Vinculación de Eventos TPV ---

    // 1. Salir del TPV
    document.getElementById('btn-tpv-exit').addEventListener('click', () => {
      this.exitPOS();
    });

    // 2. Alternar entre las pestañas de Carritos / Tickets (Fijados con fecha/hora)
    document.querySelectorAll('.pos-cart-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        // Evitar que al hacer clic en la X de cerrar pestaña se active la pestaña justo antes
        if (e.target.classList.contains('close-cart-tab')) {
          const keyToClose = e.target.dataset.key;
          delete this.carts[keyToClose];
          
          const keys = Object.keys(this.carts);
          if (keys.length === 0) {
            this.carts['00:00'] = [];
            this.activeCartKey = '00:00';
          } else if (this.activeCartKey === keyToClose) {
            this.activeCartKey = keys[keys.length - 1];
          }
          this.selectedItemIndex = 0;
          this.renderPOS(container);
          window.DolibarrUtils.showToast("Ticket en espera descartado.", "warning");
          return;
        }

        this.activeCartKey = tab.dataset.key;
        this.selectedItemIndex = 0;
        this.renderPOS(container);
      });
    });

    // 3. Crear nuevo ticket / carrito con la hora actual
    document.getElementById('btn-add-new-cart').addEventListener('click', () => {
      const now = new Date();
      const timeKey = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      this.carts[timeKey] = [];
      this.activeCartKey = timeKey;
      this.selectedItemIndex = 0;
      this.renderPOS(container);
      window.DolibarrUtils.showToast(`Nuevo ticket creado: ${timeKey}`, "success");
    });

    // 4. Seleccionar un item de la fila del carrito al hacer clic
    const bindCartRowClicks = () => {
      document.querySelectorAll('.pos-item-row').forEach(row => {
        row.addEventListener('click', () => {
          document.querySelectorAll('.pos-item-row').forEach(r => r.classList.remove('selected'));
          row.classList.add('selected');
          this.selectedItemIndex = parseInt(row.dataset.index);
        });
      });
    };
    bindCartRowClicks();

    // 5. Teclado Numérico Lógica de Digitación
    const display = document.getElementById('keypad-display');
    
    document.querySelectorAll('.keypad-digit').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (this.keypadBuffer === '0' && val !== '.') {
          this.keypadBuffer = val;
        } else {
          this.keypadBuffer += val;
        }
        display.textContent = this.keypadBuffer;
      });
    });

    document.getElementById('btn-kp-clear').addEventListener('click', () => {
      this.keypadBuffer = '';
      display.textContent = '0';
    });

    document.getElementById('btn-kp-backspace').addEventListener('click', () => {
      this.keypadBuffer = this.keypadBuffer.slice(0, -1);
      display.textContent = this.keypadBuffer || '0';
    });

    // 6. Botones de Acción del Teclado (Modifican el item seleccionado)
    
    // Cambiar Cantidad
    document.getElementById('btn-kp-qty').addEventListener('click', () => {
      const activeCart = this.carts[this.activeCartKey];
      if (activeCart && activeCart[this.selectedItemIndex]) {
        const val = parseInt(this.keypadBuffer) || 1;
        activeCart[this.selectedItemIndex].qty = val;
        
        this.keypadBuffer = '';
        display.textContent = '0';
        this.renderPOS(container);
        window.DolibarrUtils.showToast(`Cantidad cambiada a ${val}.`, "info");
      } else {
        window.DolibarrUtils.showToast("Seleccione un producto del carrito.", "error");
      }
    });

    // Cambiar Precio
    document.getElementById('btn-kp-price').addEventListener('click', () => {
      const activeCart = this.carts[this.activeCartKey];
      if (activeCart && activeCart[this.selectedItemIndex]) {
        const val = parseFloat(this.keypadBuffer);
        if (!isNaN(val) && val >= 0) {
          activeCart[this.selectedItemIndex].price = val;
          this.keypadBuffer = '';
          display.textContent = '0';
          this.renderPOS(container);
          window.DolibarrUtils.showToast(`Precio unitario ajustado a ${val.toFixed(2)} Bs.`, "info");
        }
      } else {
        window.DolibarrUtils.showToast("Seleccione un producto del carrito.", "error");
      }
    });

    // Cambiar Descuento de línea
    document.getElementById('btn-kp-disc').addEventListener('click', () => {
      const activeCart = this.carts[this.activeCartKey];
      if (activeCart && activeCart[this.selectedItemIndex]) {
        const val = parseFloat(this.keypadBuffer) || 0;
        if (val >= 0 && val <= 100) {
          activeCart[this.selectedItemIndex].discount = val;
          this.keypadBuffer = '';
          display.textContent = '0';
          this.renderPOS(container);
          window.DolibarrUtils.showToast(`Descuento de línea fijado al ${val}%.`, "info");
        } else {
          alert("El descuento debe estar entre 0 y 100 %");
        }
      } else {
        window.DolibarrUtils.showToast("Seleccione un producto del carrito.", "error");
      }
    });

    // Eliminar línea seleccionada
    document.getElementById('btn-kp-delete-row').addEventListener('click', () => {
      const activeCart = this.carts[this.activeCartKey];
      if (activeCart && activeCart.length > 0 && activeCart[this.selectedItemIndex]) {
        const removedName = activeCart[this.selectedItemIndex].label;
        activeCart.splice(this.selectedItemIndex, 1);
        
        // Ajustar índice activo
        this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
        this.renderPOS(container);
        window.DolibarrUtils.showToast(`Se eliminó "${removedName}" del ticket.`, "warning");
      } else {
        window.DolibarrUtils.showToast("El carrito está vacío.", "error");
      }
    });

    // 7. Eventos de Categoría en Catálogo
    document.querySelectorAll('.pos-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pos-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterAndRenderProducts(btn.dataset.cat);
      });
    });

    // 8. Botonera de Acciones (Pink Buttons)

    // History (Abre listado de facturas del POS - Réplica de captura 1)
    const historyModal = document.getElementById('history-modal');
    document.getElementById('btn-act-history').addEventListener('click', () => {
      this.populateHistoryTable();
      historyModal.classList.add('show');
    });

    const closeHistory = () => historyModal.classList.remove('show');
    document.getElementById('btn-close-history-modal').addEventListener('click', closeHistory);
    document.getElementById('btn-close-history-modal-footer').addEventListener('click', closeHistory);
    
    // Filtrador de historial
    document.getElementById('search-history-input').addEventListener('input', (e) => {
      this.populateHistoryTable(e.target.value);
    });

    // Nuevo Cliente / Ticket (Limpia el carrito activo)
    document.getElementById('btn-act-new').addEventListener('click', () => {
      if (confirm("¿Desea crear un ticket limpio y vaciar el carrito actual?")) {
        this.carts[this.activeCartKey] = [];
        this.selectedItemIndex = 0;
        this.renderPOS(container);
        window.DolibarrUtils.showToast("Ticket restablecido.", "info");
      }
    });

    // Producto de Texto Libre (Agrega concepto y precio custom al ticket)
    document.getElementById('btn-act-freetext').addEventListener('click', () => {
      const label = prompt("Ingrese concepto del producto de texto libre:", "Servicios Especiales DIASA");
      if (label && label.trim()) {
        const priceStr = prompt("Ingrese el precio unitario en Bs:", "100.00");
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price >= 0) {
          const activeCart = this.carts[this.activeCartKey];
          activeCart.push({
            id: 99, // ID especial para texto libre
            label: label.trim(),
            price: price,
            qty: 1,
            discount: 0
          });
          this.selectedItemIndex = activeCart.length - 1;
          this.renderPOS(container);
          window.DolibarrUtils.showToast(`Añadido: "${label}" por ${price.toFixed(2)} Bs`, "success");
        }
      }
    });

    // Descuento de Factura (Descuento global a todo el ticket)
    document.getElementById('btn-act-invoice-disc').addEventListener('click', () => {
      const discStr = prompt("Ingrese descuento global para esta factura (%):", "5");
      const disc = parseFloat(discStr);
      if (!isNaN(disc) && disc >= 0 && disc <= 100) {
        const activeCart = this.carts[this.activeCartKey];
        activeCart.forEach(item => {
          item.discount = disc; // Aplicar a todos los ítems
        });
        this.renderPOS(container);
        window.DolibarrUtils.showToast(`Aplicado descuento global del ${disc}% a todos los artículos.`, "success");
      }
    });

    // Venta Dividida
    document.getElementById('btn-act-split').addEventListener('click', () => {
      alert("Simulando proceso de Venta Dividida (Split Sale):\n\nEsta venta se dividirá en 2 partes de " + (cartTotal / 2).toFixed(2) + " Bs cada una.\nPuede realizar cobros parciales con tarjeta y efectivo.");
      window.DolibarrUtils.showToast("Simulando venta dividida...", "info");
    });

    // Imprimir (Abre recibo térmico)
    document.getElementById('btn-act-print').addEventListener('click', () => {
      if (cart.length === 0) {
        window.DolibarrUtils.showToast("El carrito está vacío.", "error");
        return;
      }
      
      // Mostrar ticket simulado
      document.getElementById('r-ticket-ref').textContent = "TCK-MOCK-" + Math.floor(Math.random() * 9000 + 1000);
      document.getElementById('r-ticket-date').textContent = new Date().toISOString().split('T')[0];
      document.getElementById('r-ticket-client').textContent = client.name;
      
      const itemsBody = document.getElementById('r-ticket-items');
      itemsBody.innerHTML = cart.map(item => `
        <tr>
          <td>${item.label}</td>
          <td style="text-align:center;">${item.qty}</td>
          <td style="text-align:right;">${(item.price * (1 - item.discount/100) * item.qty).toFixed(2)}</td>
        </tr>
      `).join('');

      document.getElementById('r-subtotal').textContent = `${(cartTotal / 1.13).toFixed(2)} Bs`;
      document.getElementById('r-iva').textContent = `${(cartTotal - (cartTotal / 1.13)).toFixed(2)} Bs`;
      document.getElementById('r-total').textContent = `${cartTotal.toFixed(2)} Bs`;
      document.getElementById('r-method').textContent = "Pre-Impreso TPV";
      document.getElementById('r-received').textContent = `${cartTotal.toFixed(2)} Bs`;
      document.getElementById('r-change').textContent = `0.00 Bs`;
      
      document.getElementById('modal-receipt-overlay').classList.add('show');
    });

    // Abrir Modal de Clientes
    const clientsModal = document.getElementById('clients-modal');
    const openClients = () => clientsModal.classList.add('show');
    document.getElementById('btn-act-clients').addEventListener('click', openClients);
    document.getElementById('btn-tpv-client-select').addEventListener('click', openClients);

    const closeClients = () => clientsModal.classList.remove('show');
    document.getElementById('btn-close-clients-modal').addEventListener('click', closeClients);
    document.getElementById('btn-close-clients-modal-footer').addEventListener('click', closeClients);
    
    document.getElementById('btn-save-tpv-client').addEventListener('click', () => {
      const selectVal = document.getElementById('select-tpv-client-dd').value;
      this.selectedClientId = parseInt(selectVal);
      closeClients();
      this.renderPOS(container);
      window.DolibarrUtils.showToast("Cliente comercial asignado.", "success");
    });

    // 9. FLUJO DE PAGO (MODAL STRIPE SANDBOX - CAPTURA 3)
    const paymentModal = document.getElementById('payment-modal');
    let paymentReceivedBuffer = '';

    const openPaymentFlow = () => {
      if (cart.length === 0) {
        window.DolibarrUtils.showToast("El carrito está vacío.", "error");
        return;
      }
      
      paymentReceivedBuffer = '';
      document.getElementById('pay-modal-total-display').textContent = `${cartTotal.toFixed(2)} Bs`;
      document.getElementById('pay-modal-received-display').textContent = '0.00 Bs';
      document.getElementById('pay-modal-change-display').textContent = '0.00 Bs';
      
      paymentModal.classList.add('show');
    };

    document.getElementById('btn-tpv-pay').addEventListener('click', openPaymentFlow);
    document.getElementById('btn-act-pay').addEventListener('click', openPaymentFlow);

    const closePayment = () => paymentModal.classList.remove('show');
    document.getElementById('btn-close-payment-modal').addEventListener('click', closePayment);
    document.getElementById('btn-close-payment-modal-footer').addEventListener('click', closePayment);

    // Digitación de recibo en modal cobro
    document.querySelectorAll('.pay-num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (paymentReceivedBuffer === '0') {
          paymentReceivedBuffer = val;
        } else {
          paymentReceivedBuffer += val;
        }
        
        const received = parseFloat(paymentReceivedBuffer) || 0;
        const change = received - cartTotal;
        
        document.getElementById('pay-modal-received-display').textContent = `${received.toFixed(2)} Bs`;
        document.getElementById('pay-modal-change-display').textContent = `${(change > 0 ? change : 0).toFixed(2)} Bs`;
      });
    });

    document.getElementById('btn-pay-clear').addEventListener('click', () => {
      paymentReceivedBuffer = '';
      document.getElementById('pay-modal-received-display').textContent = '0.00 Bs';
      document.getElementById('pay-modal-change-display').textContent = '0.00 Bs';
    });

    // Confirmar Pago al hacer clic en un método de pago
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.dataset.method;
        const received = parseFloat(paymentReceivedBuffer) || cartTotal; // Si no digitan nada, se asume pago cabal
        const change = received - cartTotal;

        // 1. Deducir stock del inventario
        cart.forEach(item => {
          if (item.id !== 99) { // Ignorar texto libre
            const p = db.products.find(prod => prod.id === item.id);
            if (p) p.stock = Math.max(0, p.stock - item.qty);
          }
        });

        // 2. Registrar Factura
        const factRef = `FA-TPV-${Math.floor(Math.random() * 9000 + 1000)}`;
        db.financiera.facturas_cliente.push({
          id: window.DolibarrUtils.generateId(db.financiera.facturas_cliente),
          ref: factRef,
          terceroId: this.selectedClientId,
          date: new Date().toISOString().split('T')[0],
          date_due: new Date().toISOString().split('T')[0],
          total_ht: cartTotal / 1.13,
          total_ttc: cartTotal,
          status: "Pagado"
        });

        // 3. Registrar Pago
        db.financiera.pagos.push({
          id: window.DolibarrUtils.generateId(db.financiera.pagos),
          type: "cliente",
          ref: `PAG-POS-${Math.floor(Math.random()*900+100)}`,
          invoiceRef: factRef,
          amount: cartTotal,
          date: new Date().toISOString().split('T')[0],
          method: method
        });

        // 4. Sumar dinero a Caja Chica Central ( BNB o Caja Chica )
        if (db.bancos && db.bancos[2]) {
          db.bancos[2].balance += cartTotal;
        }

        // 5. Contabilidad Asiento
        const nextId = window.DolibarrUtils.generateId(db.contabilidad.diario);
        db.contabilidad.diario.push(
          { id: nextId, date: new Date().toISOString().split('T')[0], ref: factRef, desc: `Venta POS TakePOS`, account: "400000 - Ventas", debit: 0, credit: cartTotal / 1.13, journal: "Ventas" },
          { id: nextId + 1, date: new Date().toISOString().split('T')[0], ref: factRef, desc: `Débito Fiscal IVA 13%`, account: "213010 - IVA Débito", debit: 0, credit: cartTotal - (cartTotal / 1.13), journal: "Ventas" },
          { id: nextId + 2, date: new Date().toISOString().split('T')[0], ref: factRef, desc: `Cobro POS - ${method}`, account: "111500 - Caja Chica", debit: cartTotal, credit: 0, journal: "Bancos" }
        );

        window.DolibarrDB.save(db);
        window.DolibarrUtils.showToast("Cobro procesado con éxito. Caja y contabilidad actualizadas.", "success");

        closePayment();

        // 6. Imprimir Recibo
        document.getElementById('r-ticket-ref').textContent = factRef;
        document.getElementById('r-ticket-date').textContent = new Date().toISOString().split('T')[0];
        document.getElementById('r-ticket-client').textContent = client.name;
        
        const itemsBody = document.getElementById('r-ticket-items');
        itemsBody.innerHTML = cart.map(item => `
          <tr>
            <td>${item.label}</td>
            <td style="text-align:center;">${item.qty}</td>
            <td style="text-align:right;">${(item.price * (1 - item.discount/100) * item.qty).toFixed(2)}</td>
          </tr>
        `).join('');

        document.getElementById('r-subtotal').textContent = `${(cartTotal / 1.13).toFixed(2)} Bs`;
        document.getElementById('r-iva').textContent = `${(cartTotal - (cartTotal / 1.13)).toFixed(2)} Bs`;
        document.getElementById('r-total').textContent = `${cartTotal.toFixed(2)} Bs`;
        document.getElementById('r-method').textContent = method;
        document.getElementById('r-received').textContent = `${received.toFixed(2)} Bs`;
        document.getElementById('r-change').textContent = `${(change > 0 ? change : 0).toFixed(2)} Bs`;
        
        document.getElementById('modal-receipt-overlay').classList.add('show');
      });
    });

    // Botón Finalizar del recibo
    document.getElementById('btn-close-receipt').addEventListener('click', () => {
      document.getElementById('modal-receipt-overlay').classList.remove('show');
      // Vaciar carrito
      this.carts[this.activeCartKey] = [];
      this.selectedItemIndex = 0;
      this.renderPOS(container);
    });
  },

  /**
   * Filtra los productos del catálogo según la categoría y los renderiza
   */
  filterAndRenderProducts: function(category) {
    const db = window.DolibarrDB.get();
    let filtered = db.products.filter(p => p.type === 'producto');

    if (category === 'maquinaria') {
      filtered = filtered.filter(p => p.code.includes('MOT'));
    } else if (category === 'valvulas') {
      filtered = filtered.filter(p => p.code.includes('VALV'));
    } else if (category === 'tuberias') {
      filtered = filtered.filter(p => p.code.includes('TUBO'));
    }

    const grid = document.getElementById('tpv-products-grid');
    if (!grid) return;

    grid.innerHTML = filtered.map(p => `
      <div class="pos-prod-card" data-id="${p.id}">
        <div style="font-size: 24px; color: var(--primary); margin-bottom: 4px;"><i class="fas fa-box"></i></div>
        <div style="font-size: 11px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height:30px; line-height:1.2; margin-bottom: 2px;">
          ${p.label}
        </div>
        <div style="font-size: 9px; color: #94A3B8;">St: ${p.stock} u.</div>
        <div class="pos-prod-price">${p.price.toFixed(2)} Bs</div>
      </div>
    `).join('');

    // Re-vincular clics de los productos
    grid.querySelectorAll('.pos-prod-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const prod = db.products.find(p => p.id === id);
        if (prod) {
          this.addProductToActiveCart(prod);
        }
      });
    });
  },

  addProductToActiveCart: function(product) {
    const cart = this.carts[this.activeCartKey];
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty++;
      this.selectedItemIndex = cart.indexOf(existing);
    } else {
      cart.push({
        id: product.id,
        label: product.label,
        price: product.price,
        qty: 1,
        discount: 0
      });
      this.selectedItemIndex = cart.length - 1;
    }

    const container = document.getElementById('main-content');
    this.renderPOS(container);
  },

  /**
   * Llena la tabla del modal Historial (Captura 1)
   */
  populateHistoryTable: function(searchTerm = '') {
    const db = window.DolibarrDB.get();
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    // Combinar facturas y filtrar las relacionadas con el POS
    let bills = db.financiera.facturas_cliente.filter(f => f.ref.includes('TPV') || f.ref.includes('FA-TPV') || f.id <= 3);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      bills = bills.filter(b => {
        const client = db.terceros.find(t => t.id === b.terceroId);
        const clientName = client ? client.name.toLowerCase() : '';
        return b.ref.toLowerCase().includes(term) || clientName.includes(term);
      });
    }

    tbody.innerHTML = bills.map(b => {
      const client = db.terceros.find(t => t.id === b.terceroId) || { name: 'Generic Customer' };
      return `
        <tr>
          <td><strong>${b.ref}</strong></td>
          <td>${b.date}</td>
          <td>${client.name}</td>
          <td><span class="badge badge-primary" style="font-size:10px;">takepos</span></td>
          <td>1</td>
          <td style="text-align:right; font-weight:700; color:#10B981;">${b.total_ttc.toFixed(2)} Bs</td>
          <td><span class="badge badge-success">Pagado</span></td>
        </tr>
      `;
    }).join('');
  }
};
