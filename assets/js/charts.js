/**
 * charts.js - Envoltura (Wrapper) para Chart.js
 * Gestiona el ciclo de vida de los gráficos en la SPA para evitar fugas de memoria
 */

// Registro para almacenar las instancias activas de los gráficos
const chartInstances = {};

/**
 * Destruir un gráfico existente en un canvas para poder reutilizarlo
 * @param {string} canvasId - El ID del elemento canvas
 */
function destroyChart(canvasId) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
    delete chartInstances[canvasId];
  }
}

/**
 * Crear un gráfico de Barras
 * @param {string} canvasId - ID del elemento canvas
 * @param {Array<string>} labels - Etiquetas del eje X
 * @param {Array<object>} datasets - Conjuntos de datos (con label, data, backgroundColor, etc.)
 * @param {object} customOptions - Opciones de configuración adicionales
 */
function createBarChart(canvasId, labels, datasets, customOptions = {}) {
  destroyChart(canvasId);

  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter, sans-serif', size: 12 }
        }
      },
      tooltip: {
        padding: 10,
        backgroundColor: 'rgba(28, 43, 75, 0.9)',
        titleFont: { family: 'Inter, sans-serif', weight: 'bold' },
        bodyFont: { family: 'Inter, sans-serif' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E2E8F0' },
        ticks: { font: { family: 'Inter, sans-serif' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter, sans-serif' } }
      }
    }
  };

  // Combinar opciones por defecto con las customizadas
  const mergedOptions = { ...defaultOptions, ...customOptions };

  // Crear la nueva instancia de Chart.js (la biblioteca debe estar cargada en index.html)
  if (typeof Chart === 'undefined') {
    console.error("Error: Chart.js CDN no está cargada todavía.");
    return null;
  }

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: mergedOptions
  });

  return chartInstances[canvasId];
}

/**
 * Crear un gráfico de Rosquilla (Doughnut)
 * @param {string} canvasId - ID del elemento canvas
 * @param {Array<string>} labels - Etiquetas
 * @param {Array<number>} data - Datos numéricos
 * @param {Array<string>} colors - Colores de cada porción (opcional)
 * @param {object} customOptions - Opciones de configuración adicionales
 */
function createDoughnutChart(canvasId, labels, data, colors = [], customOptions = {}) {
  destroyChart(canvasId);

  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  // Paleta de colores premium si no se proveen
  const defaultColors = colors.length > 0 ? colors : [
    '#3A78D4', // Primary
    '#2CB57E', // Success
    '#F39C12', // Warning
    '#E74C3C', // Danger
    '#9B59B6', // Info/Purple
    '#7F8C8D'  // Muted
  ];

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { family: 'Inter, sans-serif', size: 12 },
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        padding: 10,
        backgroundColor: 'rgba(28, 43, 75, 0.9)',
        titleFont: { family: 'Inter, sans-serif', weight: 'bold' },
        bodyFont: { family: 'Inter, sans-serif' }
      }
    },
    cutout: '65%' // Rosquilla delgada y premium
  };

  const mergedOptions = { ...defaultOptions, ...customOptions };

  if (typeof Chart === 'undefined') {
    console.error("Error: Chart.js CDN no está cargada todavía.");
    return null;
  }

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: defaultColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: mergedOptions
  });

  return chartInstances[canvasId];
}

// Exportar globalmente
window.DolibarrCharts = {
  createBar: createBarChart,
  createDoughnut: createDoughnutChart,
  destroy: destroyChart
};
