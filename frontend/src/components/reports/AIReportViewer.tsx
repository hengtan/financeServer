import { Download, FileText, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useEffect, useRef } from 'react'

interface AIReportViewerProps {
  report: any
  userName: string
}

// Função auxiliar para criar gráfico de pizza
const createPieChart = (data: { label: string; value: number; color: string }[], width = 300, height = 200) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 20

  let currentAngle = -Math.PI / 2

  data.forEach(item => {
    const sliceAngle = (item.value / total) * 2 * Math.PI

    ctx.fillStyle = item.color
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fill()

    currentAngle += sliceAngle
  })

  return canvas.toDataURL('image/png')
}

// Função auxiliar para criar gráfico de barras
const createBarChart = (data: { label: string; value: number; color: string }[], width = 400, height = 200) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const maxValue = Math.max(...data.map(d => d.value))
  const barWidth = (width - 40) / data.length
  const chartHeight = height - 60

  // Desenhar barras
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight
    const x = 20 + index * barWidth
    const y = height - 40 - barHeight

    ctx.fillStyle = item.color
    ctx.fillRect(x, y, barWidth - 10, barHeight)

    // Labels
    ctx.fillStyle = '#6B7280'
    ctx.font = '10px helvetica'
    ctx.textAlign = 'center'
    ctx.fillText(item.label.substring(0, 8), x + (barWidth - 10) / 2, height - 25)
  })

  return canvas.toDataURL('image/png')
}

export const AIReportViewer = ({ report, userName }: AIReportViewerProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReportTypeName = (type: string) => {
    const types: Record<string, string> = {
      monthly: 'Relatório Mensal',
      category: 'Análise por Categoria',
      goals: 'Progresso de Metas',
      cash_flow: 'Fluxo de Caixa'
    }
    return types[type] || 'Relatório Personalizado'
  }

  const getPeriodName = (period: string) => {
    const periods: Record<string, string> = {
      '7d': 'Últimos 7 dias',
      '30d': 'Últimos 30 dias',
      '90d': 'Últimos 90 dias',
      '1y': 'Último ano'
    }
    return periods[period] || period
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // === HEADER SECTION - Infographic Style ===
    // Left accent bar (vertical blue stripe)
    doc.setFillColor(37, 99, 235) // Blue-600
    doc.rect(0, 0, 8, pageHeight, 'F')

    // Main header background - clean white with subtle top bar (MESMA COR)
    doc.setFillColor(37, 99, 235) // Blue-600 (mesma cor da barra vertical)
    doc.rect(8, 0, pageWidth - 8, 3, 'F')

    // Company branding
    doc.setTextColor(37, 99, 235)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('FinanceServer', 15, 18)

    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'normal')
    doc.text('RELATÓRIO FINANCEIRO INTELIGENTE', 15, 25)

    // Título do relatório - Large and bold
    const reportTitle = report.report_type
      ? getReportTypeName(report.report_type)
      : report.query || 'Relatório Personalizado'

    doc.setTextColor(17, 24, 39)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(reportTitle, 15, 40)

    // === INFO METRICS - Infographic style boxes ===
    let currentY = 50

    // Metric boxes in a row (3 columns layout)
    const metricBoxWidth = 55
    const metricBoxHeight = 20
    const metricStartX = 15
    const metricSpacing = 5

    // Box 1: Usuário
    doc.setFillColor(239, 246, 255) // Light blue
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.roundedRect(metricStartX, currentY, metricBoxWidth, metricBoxHeight, 2, 2, 'FD')

    doc.setFontSize(7)
    doc.setTextColor(59, 130, 246)
    doc.setFont('helvetica', 'bold')
    doc.text('USUÁRIO', metricStartX + 3, currentY + 6)

    doc.setFontSize(9)
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    const userNameShort = userName.length > 15 ? userName.substring(0, 15) + '...' : userName
    doc.text(userNameShort, metricStartX + 3, currentY + 14)

    // Box 2: Data
    const box2X = metricStartX + metricBoxWidth + metricSpacing
    doc.setFillColor(254, 249, 195) // Light yellow
    doc.setDrawColor(245, 158, 11)
    doc.roundedRect(box2X, currentY, metricBoxWidth, metricBoxHeight, 2, 2, 'FD')

    doc.setFontSize(7)
    doc.setTextColor(245, 158, 11)
    doc.setFont('helvetica', 'bold')
    doc.text('DATA', box2X + 3, currentY + 6)

    doc.setFontSize(9)
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    const shortDate = new Date(report.generated_at || new Date()).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
    doc.text(shortDate, box2X + 3, currentY + 14)

    // Box 3: Período
    if (report.period) {
      const box3X = box2X + metricBoxWidth + metricSpacing
      doc.setFillColor(243, 232, 255) // Light purple
      doc.setDrawColor(139, 92, 246)
      doc.roundedRect(box3X, currentY, metricBoxWidth, metricBoxHeight, 2, 2, 'FD')

      doc.setFontSize(7)
      doc.setTextColor(139, 92, 246)
      doc.setFont('helvetica', 'bold')
      doc.text('PERÍODO', box3X + 3, currentY + 6)

      doc.setFontSize(9)
      doc.setTextColor(17, 24, 39)
      doc.setFont('helvetica', 'bold')
      const periodShort = getPeriodName(report.period).substring(0, 12)
      doc.text(periodShort, box3X + 3, currentY + 14)
    }

    currentY += metricBoxHeight + 15

    // === PERGUNTA SECTION - If custom query ===
    if (report.query) {
      // Section header with icon-like element
      doc.setFillColor(37, 99, 235)
      doc.circle(17, currentY + 2, 1.5, 'F')

      doc.setFontSize(10)
      doc.setTextColor(37, 99, 235)
      doc.setFont('helvetica', 'bold')
      doc.text('SUA PERGUNTA', 22, currentY + 4)

      currentY += 8

      const splitQuery = doc.splitTextToSize(report.query, pageWidth - 30)
      const queryBoxHeight = (splitQuery.length * 4.5) + 8

      // Query box with left border accent
      doc.setDrawColor(59, 130, 246)
      doc.setLineWidth(1)
      doc.line(15, currentY, 15, currentY + queryBoxHeight)

      doc.setFillColor(249, 250, 251)
      doc.rect(17, currentY, pageWidth - 32, queryBoxHeight, 'F')

      doc.setFontSize(9)
      doc.setTextColor(31, 41, 55)
      doc.setFont('helvetica', 'italic')
      doc.text(splitQuery, 20, currentY + 5)

      currentY += queryBoxHeight + 10
    }

    // === RESUMO SECTION - Enhanced with financial metrics ===
    if (report.summary || report.answer) {
      // Section header
      doc.setFillColor(16, 185, 129)
      doc.circle(17, currentY + 2, 1.5, 'F')

      doc.setFontSize(12)
      doc.setTextColor(16, 185, 129)
      doc.setFont('helvetica', 'bold')
      doc.text('RESUMO EXECUTIVO', 22, currentY + 4)

      currentY += 10

      // Extract financial data if available
      const summaryText = report.summary || report.answer || ''
      let hasFinancialMetrics = false
      let receitas = 0, despesas = 0, saldo = 0

      // Try to extract financial values from summary
      const receitasMatch = summaryText.match(/Receitas[:\s]+R\$\s*([\d,\.]+)/i)
      const despesasMatch = summaryText.match(/Despesas[:\s]+R\$\s*([\d,\.]+)/i)
      const saldoMatch = summaryText.match(/Saldo[:\s]+R\$\s*([\d,\.]+)/i)

      if (receitasMatch && despesasMatch && saldoMatch) {
        hasFinancialMetrics = true
        receitas = parseFloat(receitasMatch[1].replace(/\./g, '').replace(',', '.'))
        despesas = parseFloat(despesasMatch[1].replace(/\./g, '').replace(',', '.'))
        saldo = parseFloat(saldoMatch[1].replace(/\./g, '').replace(',', '.'))
      }

      if (hasFinancialMetrics) {
        // Financial metrics cards (3 columns)
        const metricBoxW = 57
        const metricBoxH = 22
        const metricStartX = 15

        // Receitas (Green)
        doc.setFillColor(240, 253, 244)
        doc.setDrawColor(34, 197, 94)
        doc.setLineWidth(0.5)
        doc.roundedRect(metricStartX, currentY, metricBoxW, metricBoxH, 2, 2, 'FD')

        doc.setFontSize(7)
        doc.setTextColor(22, 163, 74)
        doc.setFont('helvetica', 'bold')
        doc.text('RECEITAS', metricStartX + 3, currentY + 6)

        doc.setFontSize(11)
        doc.setTextColor(22, 101, 52)
        doc.setFont('helvetica', 'bold')
        doc.text(`R$ ${receitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, metricStartX + 3, currentY + 16)

        // Despesas (Red)
        const box2X = metricStartX + metricBoxW + 5
        doc.setFillColor(254, 242, 242)
        doc.setDrawColor(239, 68, 68)
        doc.roundedRect(box2X, currentY, metricBoxW, metricBoxH, 2, 2, 'FD')

        doc.setFontSize(7)
        doc.setTextColor(220, 38, 38)
        doc.setFont('helvetica', 'bold')
        doc.text('DESPESAS', box2X + 3, currentY + 6)

        doc.setFontSize(11)
        doc.setTextColor(153, 27, 27)
        doc.setFont('helvetica', 'bold')
        doc.text(`R$ ${despesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, box2X + 3, currentY + 16)

        // Saldo (Blue)
        const box3X = box2X + metricBoxW + 5
        doc.setFillColor(239, 246, 255)
        doc.setDrawColor(37, 99, 235)
        doc.roundedRect(box3X, currentY, metricBoxW, metricBoxH, 2, 2, 'FD')

        doc.setFontSize(7)
        doc.setTextColor(37, 99, 235)
        doc.setFont('helvetica', 'bold')
        doc.text('SALDO', box3X + 3, currentY + 6)

        doc.setFontSize(11)
        doc.setTextColor(30, 64, 175)
        doc.setFont('helvetica', 'bold')
        doc.text(`R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, box3X + 3, currentY + 16)

        currentY += metricBoxH + 10

        // Remaining text (if any)
        const cleanText = summaryText.replace(/Receitas[:\s]+R\$\s*[\d,\.]+/i, '')
          .replace(/Despesas[:\s]+R\$\s*[\d,\.]+/i, '')
          .replace(/Saldo[:\s]+R\$\s*[\d,\.]+/i, '')
          .replace(/,\s*,/g, ',')
          .replace(/^\s*,\s*/g, '')
          .trim()

        if (cleanText) {
          const splitText = doc.splitTextToSize(cleanText, pageWidth - 30)
          const textBoxHeight = (splitText.length * 4.5) + 8

          doc.setFillColor(255, 255, 255)
          doc.setDrawColor(229, 231, 235)
          doc.setLineWidth(0.3)
          doc.roundedRect(15, currentY, pageWidth - 30, textBoxHeight, 3, 3, 'FD')

          doc.setFontSize(9)
          doc.setTextColor(31, 41, 55)
          doc.setFont('helvetica', 'normal')
          doc.text(splitText, 20, currentY + 6)

          currentY += textBoxHeight + 12
        } else {
          currentY += 5
        }
      } else {
        // Default layout without metrics
        const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 30)
        const summaryBoxHeight = (splitSummary.length * 4.5) + 12

        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.3)
        doc.roundedRect(15, currentY, pageWidth - 30, summaryBoxHeight, 3, 3, 'FD')

        doc.setFontSize(9)
        doc.setTextColor(31, 41, 55)
        doc.setFont('helvetica', 'normal')
        doc.text(splitSummary, 20, currentY + 7)

        currentY += summaryBoxHeight + 12
      }
    }

    // === GRÁFICOS VISUAIS - Infographic style ===
    if (report.data && report.data.by_category) {
      // Verificar se precisa de nova página
      if (currentY > pageHeight - 100) {
        doc.addPage()
        // Replicar barra lateral azul na nova página
        doc.setFillColor(37, 99, 235)
        doc.rect(0, 0, 8, pageHeight, 'F')
        currentY = 20
      }

      // Section header
      doc.setFillColor(245, 158, 11)
      doc.circle(17, currentY + 2, 1.5, 'F')

      doc.setFontSize(12)
      doc.setTextColor(245, 158, 11)
      doc.setFont('helvetica', 'bold')
      doc.text('ANÁLISE VISUAL', 22, currentY + 4)

      currentY += 12

      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']
      const chartData = report.data.by_category.slice(0, 5).map((cat: any, idx: number) => ({
        label: cat.category || 'Outros',
        value: Math.abs(cat.total || 0),
        color: colors[idx % colors.length]
      }))

      if (chartData.length > 0 && chartData.some((d: any) => d.value > 0)) {
        // Chart container - two column layout
        const chartBoxHeight = 55

        // Left side: Pie chart
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.3)
        doc.roundedRect(15, currentY, 85, chartBoxHeight, 3, 3, 'FD')

        const pieChart = createPieChart(chartData, 250, 150)
        doc.addImage(pieChart, 'PNG', 20, currentY + 5, 75, 45)

        // Right side: Data table/legend
        doc.setFillColor(249, 250, 251)
        doc.roundedRect(105, currentY, pageWidth - 120, chartBoxHeight, 3, 3, 'FD')

        // Table header
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        doc.setFont('helvetica', 'bold')
        doc.text('CATEGORIA', 110, currentY + 7)
        doc.text('VALOR', pageWidth - 30, currentY + 7, { align: 'right' })

        let tableY = currentY + 14
        chartData.forEach((item: any) => {
          const r = parseInt(item.color.substring(1, 3), 16)
          const g = parseInt(item.color.substring(3, 5), 16)
          const b = parseInt(item.color.substring(5, 7), 16)

          // Color indicator square
          doc.setFillColor(r, g, b)
          doc.rect(110, tableY - 3, 3, 3, 'F')

          // Category name
          doc.setFontSize(8)
          doc.setTextColor(31, 41, 55)
          doc.setFont('helvetica', 'normal')
          const labelShort = item.label.length > 18 ? item.label.substring(0, 18) + '...' : item.label
          doc.text(labelShort, 116, tableY)

          // Value
          doc.setFont('helvetica', 'bold')
          doc.text(`R$ ${item.value.toFixed(2)}`, pageWidth - 30, tableY, { align: 'right' })

          tableY += 8
        })

        currentY += chartBoxHeight + 12
      }
    }

    // === INSIGHTS SECTION - List style ===
    if (report.insights && report.insights.length > 0) {
      // Verificar se precisa de nova página
      if (currentY > pageHeight - 80) {
        doc.addPage()
        // Replicar barra lateral azul na nova página
        doc.setFillColor(37, 99, 235)
        doc.rect(0, 0, 8, pageHeight, 'F')
        currentY = 20
      }

      // Section header
      doc.setFillColor(139, 92, 246)
      doc.circle(17, currentY + 2, 1.5, 'F')

      doc.setFontSize(12)
      doc.setTextColor(139, 92, 246)
      doc.setFont('helvetica', 'bold')
      doc.text('INSIGHTS INTELIGENTES', 22, currentY + 4)

      currentY += 12

      report.insights.forEach((insight: string, index: number) => {
        // Verificar se precisa de nova página
        if (currentY > pageHeight - 35) {
          doc.addPage()
          // Replicar barra lateral azul na nova página
          doc.setFillColor(37, 99, 235)
          doc.rect(0, 0, 8, pageHeight, 'F')
          currentY = 20
        }

        const splitInsight = doc.splitTextToSize(insight, pageWidth - 40)
        const insightHeight = (splitInsight.length * 4.5) + 8

        // Insight box with number
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.3)
        doc.roundedRect(15, currentY, pageWidth - 30, insightHeight, 2, 2, 'FD')

        // Number badge - colored square
        doc.setFillColor(139, 92, 246)
        doc.rect(18, currentY + 3, 5, 5, 'F')

        doc.setFontSize(7)
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.text(`${index + 1}`, 20.5, currentY + 7, { align: 'center' })

        // Insight text
        doc.setFontSize(8)
        doc.setTextColor(31, 41, 55)
        doc.setFont('helvetica', 'normal')
        doc.text(splitInsight, 27, currentY + 6)

        currentY += insightHeight + 4
      })
    }

    // === FOOTER - Infographic style ===
    const totalPages = (doc as any).internal.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)

      // Ensure blue sidebar is on all pages
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 8, pageHeight, 'F')

      // Footer area with subtle separator
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.3)
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15)

      // Footer content
      doc.setFontSize(7)
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'normal')

      // Left - Brand
      doc.text('FinanceServer', 15, pageHeight - 9)

      // Center - Copyright
      doc.text('© 2025 FinanceServer. Todos os direitos reservados.', pageWidth / 2, pageHeight - 9, { align: 'center' })

      // Right - Page number with circle
      doc.setFillColor(37, 99, 235)
      doc.circle(pageWidth - 18, pageHeight - 10.5, 3, 'F')

      doc.setFontSize(7)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.text(`${i}`, pageWidth - 18, pageHeight - 9, { align: 'center' })

      doc.setFontSize(6)
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'normal')
      doc.text(`/${totalPages}`, pageWidth - 13, pageHeight - 9)
    }

    // Download
    const fileName = `relatorio-${report.report_type || 'personalizado'}-${new Date().getTime()}.pdf`
    doc.save(fileName)
  }

  return (
    <Card className="mt-6 border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {report.report_type
                  ? getReportTypeName(report.report_type)
                  : 'Relatório Personalizado'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerado por IA • {formatDate(report.generated_at || new Date().toISOString())}
              </p>
            </div>
          </div>
          <Button onClick={downloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Metadados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Usuário</p>
              <p className="text-sm font-semibold">{userName}</p>
            </div>
          </div>

          {report.period && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="text-sm font-semibold">{getPeriodName(report.period)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="text-sm font-semibold">
                {report.query ? 'Consulta Personalizada' : 'Padrão'}
              </p>
            </div>
          </div>
        </div>

        {/* Pergunta (para relatórios personalizados) */}
        {report.query && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-muted-foreground mb-1">Sua Pergunta:</p>
            <p className="text-base font-medium text-blue-900">{report.query}</p>
          </div>
        )}

        {/* Resumo/Resposta */}
        {(report.summary || report.answer) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
              Resumo
            </h3>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-gray-800 leading-relaxed">
                {report.summary || report.answer}
              </p>
            </div>
          </div>
        )}

        {/* Insights */}
        {report.insights && report.insights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <div className="h-1 w-1 bg-indigo-600 rounded-full"></div>
              Insights Inteligentes
            </h3>
            <div className="space-y-3">
              {report.insights.map((insight: string, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed flex-1">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nota de rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-muted-foreground text-center">
            Este relatório foi gerado automaticamente pelo FinanceServer usando inteligência artificial.
            Os insights são baseados nos seus dados financeiros e têm caráter informativo.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
