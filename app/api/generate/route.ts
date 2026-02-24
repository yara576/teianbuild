import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FREE_PLAN_LIMIT = 3

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let currentCount = 0
    if (user) {
      // ライフタイム生成回数チェック
      const { data: usage } = await supabase
        .from('user_usage')
        .select('proposals_created')
        .eq('user_id', user.id)
        .single()

      currentCount = usage?.proposals_created ?? 0
      if (currentCount >= FREE_PLAN_LIMIT) {
        return NextResponse.json({ error: 'LIMIT_EXCEEDED' }, { status: 403 })
      }
    }

    const { generateProposal } = await import('@/lib/ai')
    const output = await generateProposal(input)

    if (user) {
      // 提案書を保存
      await supabase.from('proposals').insert({
        user_id: user.id,
        input: input,
        output: output,
      })

      // 生涯生成回数をインクリメント
      await supabase.from('user_usage').upsert({
        user_id: user.id,
        proposals_created: currentCount + 1,
      }, { onConflict: 'user_id' })
    }

    return NextResponse.json(output)
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
