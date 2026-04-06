'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Loader2, Bug, FileText } from 'lucide-react'

interface CheckResult {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
  value?: string | number
}

interface DebugReport {
  timestamp: string
  score: number
  status: string
  elapsed_ms: number
  summary: {
    total: number
    ok: number
    warning: number
    error: number
  }
  checks: CheckResult[]
  recommendations: string[]
}

const statusIcon = {
  ok: <CheckCircle className="w-5 h-5 text-green-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
}

const statusBg = {
  ok: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  error: 'bg-red-50 border-red-200',
}

export default function DebugPage() {
  const [report, setReport] = useState<DebugReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/debug-report')
      const data = await res.json()
      setReport(data)
      setLastCheck(new Date())
    } catch (error) {
      console.error('Erro no diagnóstico:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const exportReport = () => {
    if (!report) return
    const markdown = `# 🔍 Debug Hunter — Relatório

**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}
**Score:** ${report.score}%
**Status:** ${report.status}
**Tempo de execução:** ${report.elapsed_ms}ms

## Resumo
- ✅ OK: ${report.summary.ok}
- ⚠️ Atenção: ${report.summary.warning}
- ❌ Erro: ${report.summary.error}

## Verificações

${report.checks.map(c => `### ${c.status === 'ok' ? '✅' : c.status === 'warning' ? '⚠️' : '❌'} ${c.name}
- Status: ${c.status.toUpperCase()}
- Mensagem: ${c.message}
${c.value ? `- Valor: ${c.value}` : ''}`).join('\n\n')}

## Recomendações

${report.recommendations.length > 0 
  ? report.recommendations.map(r => `- ${r}`).join('\n')
  : '✅ Nenhuma recomendação — sistema saudável!'}

---
*Gerado pelo Debug Hunter — Titanio Studio*
`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-report-${new Date().toISOString().split('T')[0]}.md`
    a.click()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bug className="w-8 h-8 text-purple-600" />
            Debug Hunter
          </h1>
          <p className="text-gray-500 mt-1">Diagnóstico completo do sistema</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportReport}
            disabled={!report || loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Exportar .md
          </button>
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {loading ? 'Analisando...' : 'Rodar Diagnóstico'}
          </button>
        </div>
      </div>

      {/* Score Card */}
      {report && (
        <div className={`rounded-xl p-6 border-2 ${
          report.score >= 80 ? 'bg-green-50 border-green-300' :
          report.score >= 50 ? 'bg-yellow-50 border-yellow-300' :
          'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Health Score</p>
              <p className="text-5xl font-bold mt-1">{report.score}%</p>
              <p className="text-lg mt-1">{report.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Verificado em {report.elapsed_ms}ms
              </p>
              {lastCheck && (
                <p className="text-xs text-gray-400 mt-1">
                  {lastCheck.toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{report.summary.ok}</p>
              <p className="text-sm text-gray-500">OK</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{report.summary.warning}</p>
              <p className="text-sm text-gray-500">Atenção</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{report.summary.error}</p>
              <p className="text-sm text-gray-500">Erro</p>
            </div>
          </div>
        </div>
      )}

      {/* Checks List */}
      {report && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Verificações</h2>
          <div className="space-y-3">
            {report.checks.map((check, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-lg border ${statusBg[check.status]}`}>
                <div className="flex items-center gap-3">
                  {statusIcon[check.status]}
                  <div>
                    <p className="font-medium text-gray-900">{check.name}</p>
                    <p className="text-sm text-gray-600">{check.message}</p>
                  </div>
                </div>
                {check.value && (
                  <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                    {check.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report && report.recommendations.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">💡 Recomendações</h2>
          <ul className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-amber-900">
                <span className="text-amber-500 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading State */}
      {loading && !report && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-500 mt-4">Rodando diagnóstico completo...</p>
        </div>
      )}
    </div>
  )
}
