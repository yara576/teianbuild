"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProposalInput, ProposalOutput } from '@/lib/types'
import ProposalPreview from '@/components/proposal/ProposalPreview'
import { Button } from '@/components/ui/button'

export default function PreviewPage() {
  const router = useRouter()
  const [input, setInput] = useState<ProposalInput | null>(null)
  const [output, setOutput] = useState<ProposalOutput | null>(null)

  useEffect(() => {
    const savedInput = sessionStorage.getItem('proposalInput')
    const savedOutput = sessionStorage.getItem('proposalOutput')
    if (savedInput && savedOutput) {
      setInput(JSON.parse(savedInput))
      setOutput(JSON.parse(savedOutput))
    }
  }, [])

  const handleDownloadPDF = async () => {
    try {
      const { generatePDF } = await import('@/lib/pdf')
      await generatePDF('proposal-preview', `提案書_${input?.clientName ?? 'output'}.pdf`)
    } catch {
      window.print()
    }
  }

  if (!input || !output) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">データが見つかりません</p>
          <Button variant="outline" onClick={() => router.push('/generate')}>
            ← 編集に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      {/* Action bar - hidden when printing */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between print:hidden px-4">
        <Button
          variant="outline"
          onClick={() => {
            sessionStorage.setItem('proposalEditInput', JSON.stringify(input))
            sessionStorage.setItem('editMode', 'true')
            router.push('/generate')
          }}
        >
          ← 再編集する
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            ダッシュボードへ
          </Button>
          <Button onClick={handleDownloadPDF}>
            PDFダウンロード
          </Button>
        </div>
      </div>

      <ProposalPreview input={input} output={output} />
    </div>
  )
}
