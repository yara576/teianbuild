'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProposalInput, ProposalOutput } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'

interface ProposalCardProps {
  proposal: {
    id: string
    input: ProposalInput
    output: ProposalOutput
    created_at: string
  }
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleView = () => {
    sessionStorage.setItem('proposalInput', JSON.stringify(proposal.input))
    sessionStorage.setItem('proposalOutput', JSON.stringify(proposal.output))
    router.push('/preview')
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    sessionStorage.setItem('proposalEditInput', JSON.stringify(proposal.input))
    sessionStorage.setItem('editMode', 'true')
    router.push('/generate')
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }
    handleDeleteConfirm()
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowConfirm(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="border-gray-200 transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        {/* クリックでプレビューへ */}
        <div className="cursor-pointer" onClick={handleView}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {proposal.input.projectTitle}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {proposal.input.clientName}
              </p>
            </div>
            <div className="ml-4 text-right shrink-0">
              <p className="text-lg font-bold text-indigo-600">
                {formatCurrency(proposal.output.totalAmount)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {proposal.input.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                >
                  {tech}
                </span>
              ))}
              {proposal.input.techStack.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{proposal.input.techStack.length - 3}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 shrink-0 ml-2">
              {formatDate(proposal.created_at)}
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          {showConfirm ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-red-600 flex-1">本当に削除しますか？</span>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={handleCancelDelete}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                再編集
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                削除
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
