/**
 * pdfUtils.js - Utilidades para exportación de documentos a PDF
 * Utiliza jsPDF v2.5.1
 */

(function() {
  // Asegurar namespace
  window.DolibarrPDF = {};

  // Helper para el encabezado corporativo común
  function drawHeader(doc, title, subtitle) {
    // Franja azul superior corporativa (#1C2B4B)
    doc.setFillColor(28, 43, 75);
    doc.rect(10, 10, 190, 25, "F");

    // Nombre y NIT de la empresa
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("DISTRIBUIDORA INDUSTRIAL ALTIPLANO S.A. (DIASA)", 15, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("NIT: 1020349021  |  Av. Arce Nro. 2529, Piso 12  |  La Paz, Bolivia", 15, 26);
    doc.text("Telf: +591 2 2432211  |  Email: contacto@diasa.com.bo  |  Web: www.diasa.com.bo", 15, 31);

    // Título del documento
    doc.setTextColor(28, 43, 75);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title.toUpperCase(), 15, 48);

    if (subtitle) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(127, 140, 141);
      doc.text(subtitle, 15, 53);
    }

    // Línea divisoria
    doc.setDrawColor(189, 195, 199);
    doc.line(10, 56, 200, 56);
  }

  // Helper para el pie de página común
  function drawFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(189, 195, 199);
      doc.line(10, 280, 200, 280);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.text("Generado por DIASA ERP v23.0.1  |  Documento sin valor tributario oficial  |  Bolivia", 15, 285);
      doc.text(`Página ${i} de ${pageCount}`, 180, 285);
    }
  }

  // Helper para dibujar las cabeceras de tablas
  function drawTableHeader(doc, y, columns, headers, alignments) {
    doc.setFillColor(28, 43, 75); // Azul oscuro
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    for (let i = 0; i < headers.length; i++) {
      const text = headers[i];
      const xStart = columns[i][0];
      const xEnd = columns[i][1];
      const align = alignments[i];

      if (align === 'right') {
        const textWidth = doc.getTextWidth(text);
        doc.text(text, xEnd - textWidth, y + 5.5);
      } else if (align === 'center') {
        const textWidth = doc.getTextWidth(text);
        doc.text(text, xStart + (xEnd - xStart - textWidth) / 2, y + 5.5);
      } else {
        doc.text(text, xStart, y + 5.5);
      }
    }
    doc.setTextColor(0, 0, 0); // Reset a negro
  }

  // Helper para dibujar una fila de tabla y retornar el alto que ocupó
  function drawTableRow(doc, y, columns, values, alignments) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);

    let maxHeight = 0;
    const wrappedValues = [];

    // Calcular el alto de la fila basándonos en el texto más largo que se ajusta a la columna
    for (let i = 0; i < values.length; i++) {
      const val = String(values[i]);
      const width = columns[i][1] - columns[i][0];
      const wrapped = doc.splitTextToSize(val, width);
      wrappedValues.push(wrapped);
      const h = wrapped.length * 4.5;
      if (h > maxHeight) maxHeight = h;
    }

    const rowHeight = maxHeight + 3; // alto de fila con padding

    // Dibujar textos
    for (let i = 0; i < values.length; i++) {
      const wrapped = wrappedValues[i];
      const xStart = columns[i][0];
      const xEnd = columns[i][1];
      const align = alignments[i];

      for (let lineIndex = 0; lineIndex < wrapped.length; lineIndex++) {
        const lineY = y + 3 + (lineIndex * 4.5);
        const text = wrapped[lineIndex];

        if (align === 'right') {
          const textWidth = doc.getTextWidth(text);
          doc.text(text, xEnd - textWidth, lineY);
        } else if (align === 'center') {
          const textWidth = doc.getTextWidth(text);
          doc.text(text, xStart + (xEnd - xStart - textWidth) / 2, lineY);
        } else {
          doc.text(text, xStart, lineY);
        }
      }
    }

    // Línea horizontal divisoria clara
    doc.setDrawColor(240, 240, 240);
    doc.line(10, y + rowHeight, 200, y + rowHeight);

    return rowHeight;
  }

  // 1. EXPORTAR FACTURA DE CLIENTE
  window.DolibarrPDF.printFacturaCliente = function(facturaId, db) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const f = db.financiera.facturas_cliente.find(inv => inv.id === facturaId);
    if (!f) {
      window.DolibarrUtils.showToast("No se encontró la factura de cliente especificada.", "error");
      return;
    }

    const cli = db.terceros.find(t => t.id === f.terceroId) || { name: 'Desconocido', nit: '-', address: '-', phone: '-', email: '-' };

    // Encabezado
    drawHeader(doc, "Factura Comercial de Venta", `Referencia: ${f.ref}`);

    // Información Emisor y Cliente
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(28, 43, 75);
    doc.text("EMISOR:", 15, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text("DIASA S.A.", 15, 70);
    doc.text("NIT: 1020349021", 15, 74);
    doc.text("Av. Arce Nro. 2529, La Paz", 15, 78);
    doc.text("Telf: +591 2 2432211", 15, 82);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text("FACTURADO A / CLIENTE:", 110, 65);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(cli.name, 110, 70);
    doc.text(`NIT: ${cli.nit || '-'}`, 110, 74);
    doc.text(cli.address || '-', 110, 78);
    doc.text(`Telf: ${cli.phone || '-'}  |  Email: ${cli.email || '-'}`, 110, 82);

    // Caja de detalles de factura
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 226, 230);
    doc.rect(10, 88, 190, 14, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(28, 43, 75);
    doc.text("Fecha Emisión:", 15, 93);
    doc.text("Vencimiento:", 70, 93);
    doc.text("Estado de Pago:", 125, 93);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(window.DolibarrUtils.formatDate(f.date), 40, 93);
    doc.text(window.DolibarrUtils.formatDate(f.date_due), 91, 93);
    doc.text(f.status.toUpperCase(), 151, 93);

    // Tabla de líneas de detalle
    let currentY = 108;
    const columns = [[15, 105], [110, 125], [130, 150], [155, 170], [175, 200]];
    const headers = ["Producto / Servicio", "Cant.", "Precio Unit.", "Desc.", "Subtotal"];
    const alignments = ["left", "center", "right", "center", "right"];

    drawTableHeader(doc, currentY, columns, headers, alignments);
    currentY += 8;

    (f.lines || []).forEach(line => {
      const prod = db.products.find(p => p.id === line.productId) || { label: 'Concepto General', code: '-' };
      const label = `${prod.label} (${prod.code})`;
      const qty = line.qty;
      const priceStr = window.DolibarrUtils.formatCurrency(line.price);
      const descStr = line.discount_pct > 0 ? `${line.discount_pct}%` : '0%';
      const subtotal = line.qty * line.price * (1 - (line.discount_pct || 0) / 100);
      const subtotalStr = window.DolibarrUtils.formatCurrency(subtotal);

      if (currentY > 250) {
        doc.addPage();
        drawHeader(doc, "Factura Comercial de Venta", `Referencia: ${f.ref}`);
        currentY = 65;
        drawTableHeader(doc, currentY, columns, headers, alignments);
        currentY += 8;
      }

      const rowHeight = drawTableRow(doc, currentY, columns, [label, qty, priceStr, descStr, subtotalStr], alignments);
      currentY += rowHeight;
    });

    // Cuadro de Totales
    if (currentY > 230) {
      doc.addPage();
      drawHeader(doc, "Factura Comercial de Venta", `Referencia: ${f.ref}`);
      currentY = 65;
    }

    currentY += 6;
    doc.setDrawColor(189, 195, 199);
    doc.line(110, currentY, 200, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Base Imponible (HT):", 120, currentY);
    doc.text("Débito Fiscal IVA (13%):", 120, currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text("TOTAL (TTC):", 120, currentY + 11);

    // Valores
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const subtotalHt = f.total_ht;
    const iva = f.total_ttc - f.total_ht;
    const totalTtc = f.total_ttc;

    const subtotalHtStr = window.DolibarrUtils.formatCurrency(subtotalHt);
    const ivaStr = window.DolibarrUtils.formatCurrency(iva);
    const totalTtcStr = window.DolibarrUtils.formatCurrency(totalTtc);

    doc.text(subtotalHtStr, 200 - doc.getTextWidth(subtotalHtStr), currentY);
    doc.text(ivaStr, 200 - doc.getTextWidth(ivaStr), currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text(totalTtcStr, 200 - doc.getTextWidth(totalTtcStr), currentY + 11);

    // Historial de cobros
    const cobros = db.financiera.pagos.filter(p => p.type === 'cliente' && p.invoiceRef === f.ref);
    if (cobros.length > 0) {
      currentY += 22;
      if (currentY > 250) {
        doc.addPage();
        drawHeader(doc, "Factura Comercial de Venta", `Referencia: ${f.ref}`);
        currentY = 65;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("HISTORIAL DE COBROS REGISTRADOS", 15, currentY);
      currentY += 4;
      doc.setDrawColor(200, 200, 200);
      doc.line(15, currentY, 200, currentY);
      currentY += 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Referencia Cobro", 15, currentY);
      doc.text("Fecha", 55, currentY);
      doc.text("Método / Cuenta", 90, currentY);
      doc.text("Importe", 200 - doc.getTextWidth("Importe"), currentY);
      currentY += 4;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      cobros.forEach(cob => {
        doc.text(cob.ref, 15, currentY);
        doc.text(window.DolibarrUtils.formatDate(cob.date), 55, currentY);
        doc.text(cob.method, 90, currentY);
        const cobAmtStr = window.DolibarrUtils.formatCurrency(cob.amount);
        doc.text(cobAmtStr, 200 - doc.getTextWidth(cobAmtStr), currentY);
        currentY += 5;
      });
    }

    drawFooter(doc);
    doc.save(`Factura_Cliente_${f.ref}.pdf`);
  };

  // 2. EXPORTAR FACTURA DE PROVEEDOR
  window.DolibarrPDF.printFacturaProveedor = function(facturaId, db) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const f = db.financiera.facturas_proveedor.find(inv => inv.id === facturaId);
    if (!f) {
      window.DolibarrUtils.showToast("No se encontró la factura de proveedor especificada.", "error");
      return;
    }

    const prov = db.terceros.find(t => t.id === f.terceroId) || { name: 'Proveedor Desconocido', nit: '-', address: '-', phone: '-', email: '-' };

    // Encabezado
    drawHeader(doc, "Factura de Compra / Proveedor", `Referencia Interna: ${f.ref}`);

    // Emisor (Proveedor) y Receptor (DIASA)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(28, 43, 75);
    doc.text("PROVEEDOR (EMISOR):", 15, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(prov.name, 15, 70);
    doc.text(`NIT: ${prov.nit || '-'}`, 15, 74);
    doc.text(prov.address || '-', 15, 78);
    doc.text(`Telf: ${prov.phone || '-'}  |  Email: ${prov.email || '-'}`, 15, 82);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text("CONSIGNADO A (RECEPTOR):", 110, 65);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("DIASA S.A. (Distribuidora Industrial Altiplano)", 110, 70);
    doc.text("NIT: 1020349021", 110, 74);
    doc.text("Av. Arce Nro. 2529, La Paz", 110, 78);
    doc.text("Telf: +591 2 2432211", 110, 82);

    // Caja de detalles
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 226, 230);
    doc.rect(10, 88, 190, 14, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(28, 43, 75);
    doc.text("Fecha Factura:", 15, 93);
    doc.text("Vencimiento:", 70, 93);
    doc.text("Estado de Pago:", 125, 93);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(window.DolibarrUtils.formatDate(f.date), 40, 93);
    doc.text(window.DolibarrUtils.formatDate(f.date_due), 91, 93);
    doc.text(f.status.toUpperCase(), 151, 93);

    // Tabla de líneas
    let currentY = 108;
    const columns = [[15, 110], [115, 130], [135, 160], [165, 200]];
    const headers = ["Concepto de Compra / Insumo", "Cant.", "Costo Unitario", "Subtotal"];
    const alignments = ["left", "center", "right", "right"];

    drawTableHeader(doc, currentY, columns, headers, alignments);
    currentY += 8;

    (f.lines || []).forEach(line => {
      const prod = db.products.find(p => p.id === line.productId) || { label: 'Insumo Adquirido', code: '-' };
      const label = `${prod.label} (${prod.code})`;
      const qty = line.qty;
      const priceStr = window.DolibarrUtils.formatCurrency(line.price);
      const subtotal = line.qty * line.price;
      const subtotalStr = window.DolibarrUtils.formatCurrency(subtotal);

      if (currentY > 250) {
        doc.addPage();
        drawHeader(doc, "Factura de Compra / Proveedor", `Referencia: ${f.ref}`);
        currentY = 65;
        drawTableHeader(doc, currentY, columns, headers, alignments);
        currentY += 8;
      }

      const rowHeight = drawTableRow(doc, currentY, columns, [label, qty, priceStr, subtotalStr], alignments);
      currentY += rowHeight;
    });

    // Cuadro de Totales
    if (currentY > 230) {
      doc.addPage();
      drawHeader(doc, "Factura de Compra / Proveedor", `Referencia: ${f.ref}`);
      currentY = 65;
    }

    currentY += 6;
    doc.setDrawColor(189, 195, 199);
    doc.line(110, currentY, 200, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Importe Neto (HT):", 120, currentY);
    doc.text("Crédito Fiscal IVA (13%):", 120, currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text("TOTAL FACTURADO:", 120, currentY + 11);

    // Valores
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const subtotalHt = f.total_ht;
    const iva = f.total_ttc - f.total_ht;
    const totalTtc = f.total_ttc;

    const subtotalHtStr = window.DolibarrUtils.formatCurrency(subtotalHt);
    const ivaStr = window.DolibarrUtils.formatCurrency(iva);
    const totalTtcStr = window.DolibarrUtils.formatCurrency(totalTtc);

    doc.text(subtotalHtStr, 200 - doc.getTextWidth(subtotalHtStr), currentY);
    doc.text(ivaStr, 200 - doc.getTextWidth(ivaStr), currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text(totalTtcStr, 200 - doc.getTextWidth(totalTtcStr), currentY + 11);

    // Pagos registrados
    const pagos = db.financiera.pagos.filter(p => p.type === 'proveedor' && p.invoiceRef === f.ref);
    if (pagos.length > 0) {
      currentY += 22;
      if (currentY > 250) {
        doc.addPage();
        drawHeader(doc, "Factura de Compra / Proveedor", `Referencia: ${f.ref}`);
        currentY = 65;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("PAGOS ENVIADOS / LIQUIDACIONES", 15, currentY);
      currentY += 4;
      doc.setDrawColor(200, 200, 200);
      doc.line(15, currentY, 200, currentY);
      currentY += 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Referencia Pago", 15, currentY);
      doc.text("Fecha", 55, currentY);
      doc.text("Método Empleado", 90, currentY);
      doc.text("Monto Retirado", 200 - doc.getTextWidth("Monto Retirado"), currentY);
      currentY += 4;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      pagos.forEach(pag => {
        doc.text(pag.ref, 15, currentY);
        doc.text(window.DolibarrUtils.formatDate(pag.date), 55, currentY);
        doc.text(pag.method, 90, currentY);
        const pagAmtStr = window.DolibarrUtils.formatCurrency(pag.amount);
        doc.text(pagAmtStr, 200 - doc.getTextWidth(pagAmtStr), currentY);
        currentY += 5;
      });
    }

    drawFooter(doc);
    doc.save(`Factura_Proveedor_${f.ref}.pdf`);
  };

  // 3. EXPORTAR PRESUPUESTO / COTIZACIÓN
  window.DolibarrPDF.printPresupuesto = function(presupuestoId, db) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const p = db.commercial.presupuestos.find(pr => pr.id === presupuestoId);
    if (!p) {
      window.DolibarrUtils.showToast("No se encontró el presupuesto especificado.", "error");
      return;
    }

    const cli = db.terceros.find(t => t.id === p.terceroId) || { name: 'Desconocido', nit: '-', address: '-', phone: '-', email: '-' };

    // Encabezado
    drawHeader(doc, "Presupuesto Comercial (Cotización)", `Referencia Oferta: ${p.ref}`);

    // Cliente e Emisor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(28, 43, 75);
    doc.text("PREPARADO PARA:", 15, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(cli.name, 15, 70);
    doc.text(`NIT: ${cli.nit || '-'}`, 15, 74);
    doc.text(cli.address || '-', 15, 78);
    doc.text(`Telf: ${cli.phone || '-'}  |  Email: ${cli.email || '-'}`, 15, 82);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text("EMITIDO POR:", 110, 65);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("DIASA S.A. - Dpto. Comercial", 110, 70);
    doc.text("Ing. Alejandro Mamani - Asesor Técnico", 110, 74);
    doc.text("Dirección: Av. Arce Nro. 2529, La Paz", 110, 78);
    doc.text("Celular: 71522900  |  ventas@diasa.com.bo", 110, 82);

    // Caja de detalles
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 226, 230);
    doc.rect(10, 88, 190, 14, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(28, 43, 75);
    doc.text("Fecha Emisión:", 15, 93);
    doc.text("Validez de Oferta:", 70, 93);
    doc.text("Estado Comercial:", 125, 93);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(window.DolibarrUtils.formatDate(p.date), 40, 93);
    doc.text("30 Días Calendario", 97, 93);
    doc.text(p.status.toUpperCase(), 154, 93);

    // Tabla de líneas de detalle
    let currentY = 108;
    const columns = [[15, 105], [110, 125], [130, 150], [155, 170], [175, 200]];
    const headers = ["Producto / Concepto Sugerido", "Cant.", "Precio Unit.", "Desc.", "Subtotal"];
    const alignments = ["left", "center", "right", "center", "right"];

    drawTableHeader(doc, currentY, columns, headers, alignments);
    currentY += 8;

    (p.lines || []).forEach(line => {
      const prod = db.products.find(prodItem => prodItem.id === line.productId) || { label: 'Servicio / Equipo Industrial', code: '-' };
      const label = `${prod.label} (${prod.code})`;
      const qty = line.qty;
      const priceStr = window.DolibarrUtils.formatCurrency(line.price);
      const descStr = line.discount_pct > 0 ? `${line.discount_pct}%` : '0%';
      const subtotal = line.qty * line.price * (1 - (line.discount_pct || 0) / 100);
      const subtotalStr = window.DolibarrUtils.formatCurrency(subtotal);

      if (currentY > 250) {
        doc.addPage();
        drawHeader(doc, "Presupuesto Comercial (Cotización)", `Referencia: ${p.ref}`);
        currentY = 65;
        drawTableHeader(doc, currentY, columns, headers, alignments);
        currentY += 8;
      }

      const rowHeight = drawTableRow(doc, currentY, columns, [label, qty, priceStr, descStr, subtotalStr], alignments);
      currentY += rowHeight;
    });

    // Cuadro de Totales
    if (currentY > 230) {
      doc.addPage();
      drawHeader(doc, "Presupuesto Comercial (Cotización)", `Referencia: ${p.ref}`);
      currentY = 65;
    }

    currentY += 6;
    doc.setDrawColor(189, 195, 199);
    doc.line(110, currentY, 200, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Importe Neto (HT):", 120, currentY);
    doc.text("IVA Estimado (13%):", 120, currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text("IMPORTE TOTAL:", 120, currentY + 11);

    // Valores
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const subtotalHt = p.total_ht;
    const iva = p.total_ttc - p.total_ht;
    const totalTtc = p.total_ttc;

    const subtotalHtStr = window.DolibarrUtils.formatCurrency(subtotalHt);
    const ivaStr = window.DolibarrUtils.formatCurrency(iva);
    const totalTtcStr = window.DolibarrUtils.formatCurrency(totalTtc);

    doc.text(subtotalHtStr, 200 - doc.getTextWidth(subtotalHtStr), currentY);
    doc.text(ivaStr, 200 - doc.getTextWidth(ivaStr), currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 43, 75);
    doc.text(totalTtcStr, 200 - doc.getTextWidth(totalTtcStr), currentY + 11);

    // Condiciones comerciales
    currentY += 22;
    if (currentY > 250) {
      doc.addPage();
      drawHeader(doc, "Presupuesto Comercial (Cotización)", `Referencia: ${p.ref}`);
      currentY = 65;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("TÉRMINOS Y CONDICIONES COMERCIALES", 15, currentY);
    currentY += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, currentY, 200, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("1. Validez de los precios expuestos: 30 días calendario desde la fecha de emisión del documento.", 15, currentY);
    doc.text("2. Forma de pago: 50% de anticipo para importación de repuestos y 50% contra entrega de equipos.", 15, currentY + 4);
    doc.text("3. Plazo de entrega: Equipos en stock se entregan inmediatamente. Pedidos especiales tardan 45 días hábiles.", 15, currentY + 8);
    doc.text("4. Garantía: Todos nuestros productos cuentan con 12 meses de garantía oficial de fábrica por defectos de fabricación.", 15, currentY + 12);

    drawFooter(doc);
    doc.save(`Presupuesto_${p.ref}.pdf`);
  };

  // 4. EXPORTAR LIBRO DIARIO (REPORTE DE FILAS VISIBLES)
  window.DolibarrPDF.printLibroDiario = function(filas, filtros) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const sub = `Diario Seleccionado: ${filtros.diario || 'Todos'}  |  Periodo Contable: Gestión 2026`;

    // Encabezado
    drawHeader(doc, "Reporte de Asientos - Libro Diario", sub);

    let currentY = 65;
    const columns = [[15, 38], [42, 60], [63, 110], [113, 155], [158, 178], [180, 200]];
    const headers = ["Fecha", "Referencia", "Glosa Detallada Asiento", "Cuenta Contable", "Debe (Bs)", "Haber (Bs)"];
    const alignments = ["left", "left", "left", "left", "right", "right"];

    drawTableHeader(doc, currentY, columns, headers, alignments);
    currentY += 8;

    let totalDebe = 0;
    let totalHaber = 0;

    filas.forEach(item => {
      const dateStr = window.DolibarrUtils.formatDate(item.date);
      const ref = item.ref;
      const desc = item.desc;
      const account = item.account;
      const debitVal = item.debit;
      const creditVal = item.credit;

      totalDebe += debitVal;
      totalHaber += creditVal;

      const debitStr = debitVal > 0 ? window.DolibarrUtils.formatCurrency(debitVal) : '-';
      const creditStr = creditVal > 0 ? window.DolibarrUtils.formatCurrency(creditVal) : '-';

      if (currentY > 260) {
        doc.addPage();
        drawHeader(doc, "Reporte de Asientos - Libro Diario", sub);
        currentY = 65;
        drawTableHeader(doc, currentY, columns, headers, alignments);
        currentY += 8;
      }

      const rowHeight = drawTableRow(doc, currentY, columns, [dateStr, ref, desc, account, debitStr, creditStr], alignments);
      currentY += rowHeight;
    });

    // Fila de Totales
    if (currentY > 255) {
      doc.addPage();
      drawHeader(doc, "Reporte de Asientos - Libro Diario", sub);
      currentY = 65;
    }

    currentY += 4;
    doc.setFillColor(245, 247, 250);
    doc.rect(10, currentY, 190, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(28, 43, 75);
    doc.text("TOTALES DE DIARIO ACUMULADOS", 15, currentY + 5.5);

    const sumDebeStr = window.DolibarrUtils.formatCurrency(totalDebe);
    const sumHaberStr = window.DolibarrUtils.formatCurrency(totalHaber);

    doc.text(sumDebeStr, 178 - doc.getTextWidth(sumDebeStr), currentY + 5.5);
    doc.text(sumHaberStr, 200 - doc.getTextWidth(sumHaberStr), currentY + 5.5);

    // Consistencia
    currentY += 15;
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(9);
    
    if (Math.abs(totalDebe - totalHaber) < 0.01) {
      doc.setTextColor(34, 112, 63); // Verde
      doc.text("✓ Consistencia Contable: Libro Diario Balanceado (Debe = Haber)", 15, currentY);
    } else {
      doc.setTextColor(192, 57, 43); // Rojo
      const diff = Math.abs(totalDebe - totalHaber);
      doc.text(`✗ Alerta de Consistencia: Desbalance detectado por Bs. ${window.DolibarrUtils.formatCurrency(diff)}`, 15, currentY);
    }

    drawFooter(doc);
    doc.save(`Libro_Diario_${filtros.diario || 'Completo'}_2026.pdf`);
  };

  // 5. EXPORTAR RECIBO DE SUELDO / BOLETA DE PAGO
  window.DolibarrPDF.printBoletaPago = function(payrollId, db) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const p = db.rrhh.payroll_payments.find(pay => pay.id === payrollId);
    if (!p) {
      window.DolibarrUtils.showToast("No se encontró el registro de nómina especificado.", "error");
      return;
    }

    const emp = db.rrhh.employees.find(e => e.id === p.employeeId) || { first_name: 'Desconocido', last_name: '', role: 'Empleado', department: 'General', hire_date: '-' };
    const b = db.bancos.find(bank => bank.id === p.bankId) || { bank_name: 'Caja Central' };

    // Encabezado
    drawHeader(doc, "Boleta Oficial de Pago de Salarios", `Periodo Liquidado: ${p.month}/${p.year}`);

    // Datos del Empleado
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 226, 230);
    doc.rect(10, 62, 190, 28, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(28, 43, 75);
    doc.text("DATOS LABORALES DEL COLABORADOR", 15, 67);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Nombre Completo:`, 15, 73);
    doc.text(`Puesto / Cargo:`, 15, 78);
    doc.text(`Departamento:`, 15, 83);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(`${emp.first_name} ${emp.last_name}`, 48, 73);
    doc.text(emp.role, 48, 78);
    doc.text(emp.department, 48, 83);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Fecha Contratación:`, 110, 73);
    doc.text(`Medio de Pago:`, 110, 78);
    doc.text(`Fecha Liquidación:`, 110, 83);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(window.DolibarrUtils.formatDate(emp.hire_date), 143, 73);
    doc.text(b.bank_name, 143, 78);
    doc.text(window.DolibarrUtils.formatDate(p.date), 143, 83);

    // Tabla de Ingresos y Egresos (Nómina)
    let currentY = 98;
    const columns = [[15, 120], [125, 160], [165, 200]];
    const headers = ["Concepto / Descripción Liquidación", "Tipo de Registro", "Monto (Bs)"];
    const alignments = ["left", "center", "right"];

    drawTableHeader(doc, currentY, columns, headers, alignments);
    currentY += 8;

    // Fila 1: Haberes básicos
    let rowH = drawTableRow(doc, currentY, columns, ["Haberes Básicos (Salario Mensual)", "Ingreso", window.DolibarrUtils.formatCurrency(p.salary_bs)], alignments);
    currentY += rowH;

    // Fila 2: Bonos extras
    rowH = drawTableRow(doc, currentY, columns, ["Bonificaciones, Horas Extras y Bonos", "Ingreso", window.DolibarrUtils.formatCurrency(p.bonuses_bs)], alignments);
    currentY += rowH;

    // Fila 3: Deducción AFP
    rowH = drawTableRow(doc, currentY, columns, ["Aportes AFP e Impuestos Retenidos (12.71% Ley General del Trabajo)", "Egreso / Descuento", `-${window.DolibarrUtils.formatCurrency(p.deductions_bs)}`], alignments);
    currentY += rowH;

    // Cuadro de Líquido Pagable
    currentY += 10;
    doc.setFillColor(28, 43, 75);
    doc.rect(110, currentY, 90, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text("LÍQUIDO PAGABLE:", 115, currentY + 6.5);
    
    const netStr = window.DolibarrUtils.formatCurrency(p.net_paid_bs);
    doc.text(netStr, 195 - doc.getTextWidth(netStr), currentY + 6.5);

    // Firmas de conformidad
    currentY += 45;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setDrawColor(180, 180, 180);
    doc.setTextColor(120, 120, 120);

    // Línea firma empleado
    doc.line(20, currentY, 90, currentY);
    doc.text("Recibí conforme (Firma del Empleado)", 32, currentY + 4);
    doc.text(`C.I. ____________________`, 41, currentY + 8);

    // Línea firma RRHH
    doc.line(110, currentY, 180, currentY);
    doc.text("Representante DIASA S.A. (Firma y Sello)", 118, currentY + 4);
    doc.text("Departamento de Recursos Humanos", 123, currentY + 8);

    drawFooter(doc);
    doc.save(`Boleta_Sueldo_${emp.first_name}_${emp.last_name}_${p.month}_${p.year}.pdf`);
  };

})();
