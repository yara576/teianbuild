import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProposalInput, ProposalOutput } from '@/lib/types'
import LogoutButton from '@/components/dashboard/LogoutButton'
import ProposalCard from '@/components/dashboard/ProposalCard'
import UpgradeButton from '@/components/dashboard/UpgradeButton'
import ManageSubscriptionButton from '@/components/dashboard/ManageSubscriptionButton'

interface Proposal {
  id: string
  input: ProposalInput
  output: ProposalOutput
  created_at: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
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

  const { data: usage } = await supabase
    .from('user_usage')
    .select('proposals_created, is_paid, subscription_status')
    .eq('user_id', user.id)
    .single()

  const params = await searchParams
  const typedProposals = (proposals ?? []) as Proposal[]
  const proposalsCreated = usage?.proposals_created ?? 0
  const isPaid = usage?.is_paid ?? false
  const showUpgradedBanner = params.upgraded === 'true'
  const isLimitReached = !isPaid && proposalsCreated >= 3

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
        {/* アップグレード完了バナー */}
        {showUpgradedBanner && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800">Pro プランへのアップグレードが完了しました！</p>
              <p className="text-sm text-green-600">提案書の作成が無制限になりました。</p>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">提案書一覧</h2>
            <p className="mt-1 text-sm text-gray-400">
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
                  <span className="text-indigo-600 font-medium">Pro プラン</span>
                  <span>・無制限（{proposalsCreated} 件生成済み）</span>
                </span>
              ) : (
                `無料プラン：${proposalsCreated} / 3 件生成済み`
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPaid ? (
              <>
                <ManageSubscriptionButton />
                <Link href="/generate">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                    + 新規作成
                  </Button>
                </Link>
              </>
            ) : isLimitReached ? (
              <UpgradeButton />
            ) : (
              <Link href="/generate">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                  + 新規作成
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 上限到達時のアップグレード促進バナー */}
        {isLimitReached && (
          <div className="mb-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-gray-900">無料プランの上限（3件）に達しました</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  Pro プランにアップグレードすると提案書の作成が無制限になります。
                </p>
              </div>
              <div className="shrink-0">
                <UpgradeButton />
              </div>
            </div>
          </div>
        )}

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
