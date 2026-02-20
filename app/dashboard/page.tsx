import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProposalInput, ProposalOutput } from '@/lib/types'
import LogoutButton from '@/components/dashboard/LogoutButton'
import ProposalCard from '@/components/dashboard/ProposalCard'

interface Proposal {
  id: string
  input: ProposalInput
  output: ProposalOutput
  created_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const typedProposals = (proposals ?? []) as Proposal[]

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              teian<span className="text-indigo-600">build</span>
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-sm font-semibold text-gray-700">
              ダッシュボード
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">提案書一覧</h2>
          <Link href="/generate">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
              + 新規作成
            </Button>
          </Link>
        </div>

        {typedProposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="mb-2 text-lg font-medium text-gray-400">
              まだ提案書がありません
            </p>
            <p className="mb-6 text-sm text-gray-400">
              最初の提案書を作成してみましょう
            </p>
            <Link href="/generate">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                提案書を作成する
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {typedProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
