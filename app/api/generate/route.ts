import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FREE_PLAN_LIMIT = 3

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ライフタイム生成回数チェック
    const { data: usage } = await supabase
      .from('user_usage')
      .select('proposals_created, is_paid, subscription_status')
      .eq('user_id', user.id)
      .single()

    const currentCount = usage?.proposals_created ?? 0
    const isPaid = usage?.is_paid ?? false
    const subscriptionStatus = usage?.subscription_status ?? null

    // past_due（支払い遅延）はProプランでも生成不可
    const isActiveProPlan = isPaid && subscriptionStatus === 'active'

    if (!isActiveProPlan && currentCount >= FREE_PLAN_LIMIT) {
      return NextResponse.json({ error: 'LIMIT_EXCEEDED' }, { status: 403 })
    }

    const { generateProposal } = await import('@/lib/ai')
    const output = await generateProposal(input)

    // 提案書を保存
    const { error: insertError } = await supabase.from('proposals').insert({
      user_id: user.id,
      input: input,
      output: output,
    })
    if (insertError) {
      console.error('Failed to save proposal:', insertError)
      return NextResponse.json({ error: 'Failed to save proposal' }, { status: 500 })
    }

    // 生涯生成回数をインクリメント
    await supabase.from('user_usage').upsert({
      user_id: user.id,
      proposals_created: currentCount + 1,
    }, { onConflict: 'user_id' })

    return NextResponse.json(output)
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
