'use client'
import { useRouter } from 'next/navigation'
import { ProposalInput, ProposalOutput } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

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

  const handleClick = () => {
    sessionStorage.setItem('proposalInput', JSON.stringify(proposal.input))
    sessionStorage.setItem('proposalOutput', JSON.stringify(proposal.output))
    router.push('/preview')
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
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md border-gray-200"
      onClick={handleClick}
    >
      <CardContent className="p-6">
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
          <div className="flex items-center gap-2">
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
          <p className="text-xs text-gray-400">
            {formatDate(proposal.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
