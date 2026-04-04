// src/utils/exportarPlanillaPDF.js
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Genera y descarga un PDF con la planilla de turnos.
 *
 * @param {Object} params
 * @param {Array}  params.enfermeros       - Array de { id, nombre, apellido }
 * @param {Array}  params.semana           - Array de 7 { id: 'YYYY-MM-DD', nombre: 'Lun', numero: 14 }
 * @param {Object} params.turnosAsignados  - { 'enfermeroId|fecha': [{ tipo_id, nombre }] }
 * @param {number} params.limiteHoras      - Límite semanal configurado
 * @param {string} [params.titulo]         - Título opcional del PDF
 */
export function exportarPlanillaPDF({ enfermeros, semana, turnosAsignados, limiteHoras, titulo }) {
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

  const MARGEN = 14
  const ANCHO  = doc.internal.pageSize.getWidth()
  const hoy    = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const rangoSemana = semana.length > 0
    ? `${semana[0].numero} ${_nombreMes(semana[0].id)} — ${semana[6].numero} ${_nombreMes(semana[6].id)}`
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

  // Semana
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(160, 170, 190)
  doc.text(`Semana del ${rangoSemana}`, ANCHO / 2, 13, { align: 'center' })

  // Fecha generación
  doc.text(`Generado: ${hoy}`, ANCHO - MARGEN, 13, { align: 'right' })

  // Título secundario
  const tituloDoc = titulo ?? `Planilla semanal — ${rangoSemana}`
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 25, 35)
  doc.text(tituloDoc, MARGEN, 30)

  // Límite de horas (subtítulo)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 130, 150)
  if (limiteHoras) {
    doc.text(`Límite semanal: ${limiteHoras} horas por enfermero`, MARGEN, 37)
  }

  // ── Tabla ─────────────────────────────────────────────

  // Columnas: Enfermero + 7 días + Total horas
  const columnas = [
    { header: 'Enfermero', dataKey: 'enfermero' },
    ...semana.map(dia => ({
      header: `${dia.nombre}\n${dia.numero}`,
      dataKey: dia.id,
    })),
    { header: 'Total\nhoras', dataKey: 'total' },
  ]

  // Filas
  const filas = enfermeros.map(enf => {
    const fila = { enfermero: `${enf.nombre} ${enf.apellido}` }
    let totalHoras = 0

    semana.forEach(dia => {
      const celdaId = `${enf.id}|${dia.id}`
      const turnos  = turnosAsignados[celdaId] ?? []
      fila[dia.id]  = turnos.map(t => t.tipo_id).join(' / ') || ''
      totalHoras   += turnos.reduce((h, t) => h + (HORAS_TURNO[t.tipo_id] ?? 0), 0)
    })

    fila.total = totalHoras > 0 ? `${totalHoras}h` : '—'
    return fila
  })

  autoTable(doc, {
    startY:  42,
    margin:  { left: MARGEN, right: MARGEN },
    columns: columnas,
    body:    filas,

    styles: {
      fontSize:  8.5,
      cellPadding: 3,
      valign: 'middle',
      halign: 'center',
      lineColor: [220, 225, 235],
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [15, 17, 23],
      textColor: [200, 210, 230],
      fontStyle: 'bold',
      fontSize: 8,
    },

    columnStyles: {
      enfermero: {
        halign: 'left',
        fontStyle: 'bold',
        textColor: [20, 25, 35],
        cellWidth: 46,
      },
      total: {
        fontStyle: 'bold',
        cellWidth: 16,
      },
    },

    alternateRowStyles: {
      fillColor: [247, 248, 252],
    },

    // Colorear las celdas de turno según tipo
    didDrawCell(data) {
      if (data.section !== 'body') return
      const col = data.column.dataKey
      if (!semana.some(d => d.id === col)) return          // solo columnas de día

      const texto = data.cell.raw ?? ''
      if (!texto) return

      const tipos = texto.split(' / ')
      if (tipos.length === 0) return

      // Usamos el color del primer turno del día
      const tipo = tipos[0].trim()
      const cfg  = COLORES_TIPO[tipo]
      if (!cfg) return

      const { x, y, width, height } = data.cell
      const PAD = 1.5
      doc.setFillColor(...cfg.bg)
      doc.roundedRect(x + PAD, y + PAD, width - PAD * 2, height - PAD * 2, 1.5, 1.5, 'F')

      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...cfg.text)
      doc.text(tipo, x + width / 2, y + height / 2 + 0.5, { align: 'center' })
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
  doc.text(`Pág. 1`, ANCHO - MARGEN, ALTO - 6, { align: 'right' })

  // ── Descargar ─────────────────────────────────────────
  const nombreArchivo = `planilla_${semana[0]?.id ?? 'semana'}.pdf`
  doc.save(nombreArchivo)
}

// ── Helper interno ────────────────────────────────────────
function _nombreMes(fechaId) {
  const d = new Date(fechaId + 'T12:00:00')
  return d.toLocaleString('es-AR', { month: 'short' })
}
