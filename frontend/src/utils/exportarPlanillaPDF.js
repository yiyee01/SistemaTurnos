// src/utils/exportarPlanillaPDF.js
// jsPDF se carga de forma lazy (dynamic import) para no inflar el bundle principal

/**
 * Genera y descarga un PDF con la planilla de turnos mensual/semanal.
 *
 * @param {Object} params
 * @param {Array}  params.enfermeros       - Array de { id, nombre, apellido }
 * @param {Array}  params.dias             - Array de { id: 'YYYY-MM-DD', nombre: 'Lun', numero: 14 }
 * @param {Object} params.turnosAsignados  - { 'enfermeroId|fecha': [{ tipo_id, nombre }] }
 * @param {string} [params.titulo]         - Título opcional del PDF
 */
export async function exportarPlanillaPDF({ enfermeros, dias, turnosAsignados, titulo }) {
  // Carga diferida: solo descarga estas librerías cuando el usuario pide el PDF
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  // ── Configuración ─────────────────────────────────────
  const HORAS_TURNO = { TM: 8, TT: 8, TN: 8, FR: 0, LM: 0, LI: 0 }

  const COLORES_TIPO = {
    TM: { bg: [219, 234, 254], text: [30, 64, 175] },   // blue
    TT: { bg: [254, 215, 170], text: [154, 52, 18] },   // orange
    TN: { bg: [233, 213, 255], text: [88, 28, 135] },   // purple
    FR: { bg: [229, 231, 235], text: [75, 85, 99] },    // gray
    LM: { bg: [252, 231, 243], text: [157, 23, 77] },   // pink
    LI: { bg: [254, 249, 195], text: [133, 77, 14] },   // yellow
  }

  const NOMBRES_TIPO = {
    TM: 'Mañana',
    TT: 'Tarde',
    TN: 'Noche',
    FR: 'Franco',
    LM: 'Lic. Maternidad',
    LI: 'Licencia',
  }

  // ── Documento ─────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const MARGEN = 10
  const ANCHO  = doc.internal.pageSize.getWidth()
  const hoy    = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const rangoDias = dias.length > 0
    ? `${dias[0].numero} ${_nombreMes(dias[0].id)} — ${dias[dias.length-1].numero} ${_nombreMes(dias[dias.length-1].id)}`
    : ''

  // ── Encabezado ────────────────────────────────────────
  // Franja superior oscura
  doc.setFillColor(15, 17, 23)
  doc.rect(0, 0, ANCHO, 20, 'F')

  // Logo / nombre app
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Sistema de Turnos', MARGEN, 13)

  // Rango de fechas
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(160, 170, 190)
  doc.text(`Período: ${rangoDias}`, ANCHO / 2, 13, { align: 'center' })

  // Fecha generación
  doc.text(`Generado: ${hoy}`, ANCHO - MARGEN, 13, { align: 'right' })

  // Título secundario
  const tituloDoc = titulo ?? `Planilla de Turnos — ${rangoDias}`
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 25, 35)
  doc.text(tituloDoc, MARGEN, 30)

  // ── Tabla ─────────────────────────────────────────────

  // Columnas: Enfermero + todos los días + Total horas
  // Si son 31 días, el ancho debe ser muy ajustado.
  const columnas = [
    { header: 'Enfermero', dataKey: 'enfermero' },
    ...dias.map(dia => ({
      header: `${dia.nombre[0]}\n${dia.numero}`, // 'L\n14' para ahorrar espacio
      dataKey: dia.id,
    })),
    { header: 'Hs', dataKey: 'total' }, // Encabezado corto para horas
  ]

  // Filas
  const filas = enfermeros.map(enf => {
    const fila = { enfermero: `${enf.nombre} ${enf.apellido}` }
    let totalHoras = 0

    dias.forEach(dia => {
      const celdaId = `${enf.id}|${dia.id}`
      const turnos  = turnosAsignados[celdaId] ?? []
      fila[dia.id]  = turnos.map(t => t.tipo_id).join(' / ') || ''
      totalHoras   += turnos.reduce((h, t) => h + (HORAS_TURNO[t.tipo_id] ?? 0), 0)
    })

    fila.total = totalHoras > 0 ? `${totalHoras}` : '—'
    return fila
  })

  // Ancho dinámico para el nombre dependiendo de la cantidad de días (7 vs 31)
  const isMonth = dias.length > 15
  const anchoNombre = isMonth ? 32 : 46
  const fontSizeHeader = isMonth ? 6.5 : 8
  const fontSizeBody = isMonth ? 6.5 : 8.5

  autoTable(doc, {
    startY:  36,
    margin:  { left: MARGEN, right: MARGEN },
    columns: columnas,
    body:    filas,

    styles: {
      fontSize:  fontSizeBody,
      cellPadding: isMonth ? 1 : 3,
      valign: 'middle',
      halign: 'center',
      lineColor: [220, 225, 235],
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: [15, 17, 23],
      textColor: [200, 210, 230],
      fontStyle: 'bold',
      fontSize: fontSizeHeader,
      cellPadding: isMonth ? 1 : 2,
    },

    columnStyles: {
      enfermero: {
        halign: 'left',
        fontStyle: 'bold',
        textColor: [20, 25, 35],
        cellWidth: anchoNombre,
      },
      total: {
        fontStyle: 'bold',
        cellWidth: isMonth ? 10 : 16,
      },
    },

    alternateRowStyles: {
      fillColor: [247, 248, 252],
    },

    // Colorear las celdas de turno según tipo
    didDrawCell(data) {
      if (data.section !== 'body') return
      const col = data.column.dataKey
      if (!dias.some(d => d.id === col)) return

      const texto = data.cell.raw ?? ''
      if (!texto) return

      const tipos = texto.split(' / ')
      if (tipos.length === 0) return

      // Usamos el color del primer turno del día
      const tipo = tipos[0].trim()
      const cfg  = COLORES_TIPO[tipo]
      if (!cfg) return

      const { x, y, width, height } = data.cell
      const PAD = isMonth ? 0.5 : 1.5
      doc.setFillColor(...cfg.bg)
      doc.roundedRect(x + PAD, y + PAD, width - PAD * 2, height - PAD * 2, 1, 1, 'F')

      doc.setFontSize(isMonth ? 6 : 7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...cfg.text)
      doc.text(tipo, x + width / 2, y + height / 2 + (isMonth ? 0.3 : 0.5), { align: 'center', baseline: 'middle' })
    },
  })

  // ── Leyenda ───────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 6

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 90, 110)
  doc.text('Referencias:', MARGEN, finalY)

  let offsetX = MARGEN + 20
  Object.entries(NOMBRES_TIPO).forEach(([clave, nombre]) => {
    const cfg = COLORES_TIPO[clave]
    if (!cfg) return
    doc.setFillColor(...cfg.bg)
    doc.roundedRect(offsetX, finalY - 3.5, 5, 4.5, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...cfg.text)
    doc.text(clave, offsetX + 2.5, finalY, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 90, 110)
    doc.text(nombre, offsetX + 7, finalY)
    offsetX += 30
  })

  // ── Pie de página ─────────────────────────────────────
  const ALTO = doc.internal.pageSize.getHeight()
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(160, 170, 190)
  doc.text('Sistema de Turnos de Enfermería', MARGEN, ALTO - 6)
  
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.text(`Pág. ${i} / ${totalPages}`, ANCHO - MARGEN, ALTO - 6, { align: 'right' })
  }

  // ── Descargar ─────────────────────────────────────────
  const nombreArchivo = `planilla_${dias[0]?.id ?? 'mes'}.pdf`
  doc.save(nombreArchivo)
}

// ── Helper interno ────────────────────────────────────────
function _nombreMes(fechaId) {
  const d = new Date(fechaId + 'T12:00:00')
  return d.toLocaleString('es-AR', { month: 'short' })
}
