"use client"

import { ProposalInput, ProposalOutput } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
}

interface ProposalPreviewProps {
  input: ProposalInput
  output: ProposalOutput
}

export default function ProposalPreview({ input, output }: ProposalPreviewProps) {
  return (
    <div id="proposal-preview" className="bg-white max-w-[210mm] mx-auto p-10 print:p-8 text-gray-900">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">提案書</h1>
        <p className="text-sm text-gray-500">
          作成日: {new Date().toLocaleDateString('ja-JP')}
        </p>
      </div>

      <div className="flex justify-between mb-8 text-sm">
        <div>
          <p className="font-semibold">{input.clientName} 御中</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{input.yourName}</p>
          <p className="text-gray-500">{input.yourRole}</p>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Project Title */}
      <h2 className="text-xl font-bold mb-6">{input.projectTitle}</h2>

      {/* Summary */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">提案概要</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{output.summary}</p>
        </CardContent>
      </Card>

      {/* Scope */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">作業スコープ</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{output.scope}</p>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">成果物</h3>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1">
            {output.deliverables.map((item, i) => (
              <li key={i} className="text-sm">{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">スケジュール</h3>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold">フェーズ</th>
                <th className="text-left py-2 font-semibold">期間</th>
                <th className="text-left py-2 font-semibold">タスク</th>
              </tr>
            </thead>
            <tbody>
              {output.timeline.map((phase, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-2 align-top">
                    <Badge variant="outline">{phase.phase}</Badge>
                  </td>
                  <td className="py-2 align-top">{phase.duration}</td>
                  <td className="py-2">
                    <ul className="list-disc list-inside space-y-0.5">
                      {phase.tasks.map((task, j) => (
                        <li key={j}>{task}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Estimate Table */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">見積</h3>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold">項目</th>
                <th className="text-right py-2 font-semibold">数量</th>
                <th className="text-left py-2 font-semibold">単位</th>
                <th className="text-right py-2 font-semibold">単価</th>
                <th className="text-right py-2 font-semibold">金額</th>
              </tr>
            </thead>
            <tbody>
              {output.estimateItems.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{row.item}</td>
                  <td className="py-2 text-right">{row.quantity}</td>
                  <td className="py-2">{row.unit}</td>
                  <td className="py-2 text-right">{formatCurrency(row.unitPrice)}</td>
                  <td className="py-2 text-right">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan={4} className="py-2 text-right">合計</td>
                <td className="py-2 text-right">{formatCurrency(output.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">備考</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{output.notes}</p>
        </CardContent>
      </Card>
    </div>
  )
}
